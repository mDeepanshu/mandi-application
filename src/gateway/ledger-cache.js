import { getAllPartyList, getTodaysVyapari, getEveryLedger } from "./comman-apis";

const DB_NAME = "mandi-ledger-cache";
const DB_VERSION = 1;
const LEDGER_STORE = "ledgers";
const META_STORE = "meta";
const SYNC_DAYS = 180;
// A single ledger-list call for all active parties exceeds the 120s prod gateway
// timeout, so request them in sequential chunks that each stay well under it
const BATCH_SIZE = 100;

const openDb = () =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(LEDGER_STORE)) db.createObjectStore(LEDGER_STORE);
      if (!db.objectStoreNames.contains(META_STORE)) db.createObjectStore(META_STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const idbRequest = (request) =>
  new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

// Fetches every vyapari's ledger for the last SYNC_DAYS days and stores them
// in IndexedDB keyed by vyapari idNo. Returns sync metadata, or null on failure.
export const syncAllLedgers = async () => {
  try {
    const toDate = new Date().toISOString().split("T")[0];
    const from = new Date();
    from.setDate(from.getDate() - SYNC_DAYS);
    const fromDate = from.toISOString().split("T")[0];

    // Fresh party list (also refreshes the localStorage cache) — its owedAmount
    // is the current balance, used below for parties with no recent activity
    const partyRes = await getAllPartyList("VYAPARI", false);
    const parties = partyRes?.responseBody;
    if (!parties?.length) return null;

    // ledger-list returns no records for parties without transactions in the
    // window, so only request the active ones
    const activeRes = await getTodaysVyapari(fromDate, toDate);
    const activeParties = activeRes?.responseBody;
    if (!activeParties) return null;

    const activeIds = activeParties.map((party) => party.partyId);
    const ledgers = [];
    for (let i = 0; i < activeIds.length; i += BATCH_SIZE) {
      const batch = activeIds.slice(i, i + BATCH_SIZE);
      let res = await getEveryLedger(fromDate, toDate, batch);
      if (!res?.responseBody) res = await getEveryLedger(fromDate, toDate, batch); // one retry
      if (!res?.responseBody) return null; // abort the whole sync; keep previous cache intact
      ledgers.push(...res.responseBody);
    }

    const records = new Map();
    ledgers.forEach((ledger) => {
      if (ledger?.vyapariIdNo != null) records.set(String(ledger.vyapariIdNo), ledger);
    });
    // Balance-only records for everyone else, so offline mode can still show
    // their standing balance
    parties.forEach((party) => {
      const key = String(party.idNo);
      if (!records.has(key)) {
        const balance = Number(party.owedAmount) || 0;
        records.set(key, {
          vyapariIdNo: party.idNo,
          vyapariName: party.name,
          openingAmount: balance,
          closingAmount: balance,
          transactions: [],
          balanceOnly: true,
        });
      }
    });

    const db = await openDb();
    const tx = db.transaction([LEDGER_STORE, META_STORE], "readwrite");
    const ledgerStore = tx.objectStore(LEDGER_STORE);
    ledgerStore.clear();
    records.forEach((record, key) => ledgerStore.put(record, key));
    const meta = { lastSyncedAt: new Date().toISOString(), fromDate, toDate, count: records.size };
    tx.objectStore(META_STORE).put(meta, "lastSync");
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
    db.close();
    return meta;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

export const getLastSync = async () => {
  try {
    const db = await openDb();
    const meta = await idbRequest(db.transaction(META_STORE).objectStore(META_STORE).get("lastSync"));
    db.close();
    return meta || null;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

// Backend times are GMT without "Z"; compare date part as string to avoid timezone shifts
const dayOf = (transaction) => String(transaction.date).split("T")[0];

const netAmount = (transactions) =>
  transactions.reduce((acc, transaction) => acc + ((Number(transaction.dr) || 0) - (Number(transaction.cr) || 0)), 0);

// Whether closing = opening + (dr - cr) or opening + (cr - dr) depends on the
// backend's convention; detect it from the synced full-window totals
const detectSign = (ledger) => {
  const opening = Number(ledger.openingAmount) || 0;
  const closing = Number(ledger.closingAmount) || 0;
  const net = netAmount(ledger.transactions || []);
  return Math.abs(opening + net - closing) <= Math.abs(opening - net - closing) ? 1 : -1;
};

const round2 = (num) => Math.round(num * 100) / 100;

// Mimics getLedger's response shape ({ responseBody: { transactions, openingAmount, closingAmount } })
// from cached data. Returns null when nothing is cached for this vyapari.
export const getCachedLedger = async (idNo, fromDate, toDate) => {
  try {
    const db = await openDb();
    const ledger = await idbRequest(db.transaction(LEDGER_STORE).objectStore(LEDGER_STORE).get(String(idNo)));
    db.close();
    if (!ledger) return null;

    const allTransactions = ledger.transactions || [];
    const beforeRange = allTransactions.filter((transaction) => dayOf(transaction) < fromDate);
    const inRange = allTransactions.filter((transaction) => dayOf(transaction) >= fromDate && dayOf(transaction) <= toDate);

    const sign = detectSign(ledger);
    const openingAmount = round2((Number(ledger.openingAmount) || 0) + sign * netAmount(beforeRange));
    const closingAmount = round2(openingAmount + sign * netAmount(inRange));

    return { responseBody: { transactions: inRange, openingAmount, closingAmount } };
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};
