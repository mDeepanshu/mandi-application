import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { TextField } from "@mui/material";
import { getLedger } from "../../../gateway/crateModule/crate-ledger.api";
import MasterTable from "../../../shared/ui/master-table/master-table";
import VyapariField from "../../../shared/elements/VyapariField";
import ui from "../crate-shared.module.css";
import styles from "./crate-ledger.module.css";

const LEDGER_COLUMNS = ["DATE", "CRATE TYPE", "DEBIT", "CREDIT", "REMARK"];
const KEY_ARRAY = ["date", "crate_name", "dr", "cr", "remark"];

function CrateLedger() {
  const [tableData, setTableData] = useState([]);
  const [fetched, setFetched] = useState(false);

  const currentDate = new Date().toISOString().split("T")[0];
  const twoDaysPrior = new Date();
  twoDaysPrior.setDate(twoDaysPrior.getDate() - 2);
  const priorDate = twoDaysPrior.toISOString().split("T")[0];
  const customTableHeight = "120px";

  const {
    control,
    formState: { errors },
    getValues,
    trigger,
  } = useForm({
    defaultValues: {
      toDate: currentDate,
      fromDate: priorDate,
    },
  });

  const fetch_ledger = async (data) => {
    const isValid = await trigger();
    if (!isValid) return;
    const { fromDate, toDate } = data;
    getLedgerData(data.vyapari_id.partyId, fromDate, toDate);
  };

  const getLedgerData = async (vyapari_id, fromDate, toDate) => {
    const ledger = await getLedger(vyapari_id, fromDate, toDate);
    if (!ledger) return;

    setFetched(true);
    if (ledger.responseBody?.length) {
      const formattedData = ledger.responseBody.map((item) => ({
        date: item.date,
        crate_name: item.crate_name,
        dr: item.crate_count > 0 ? item.crate_count : "",
        cr: item.crate_count < 0 ? Math.abs(item.crate_count) : "",
        remark: "",
      }));
      setTableData(insertDateWiseTotal([...formattedData]));
    } else {
      setTableData([]);
    }
  };

  const enterAction = () => {
    setTimeout(() => {
      fetch_ledger(getValues());
    }, 0);
  };

  const insertDateWiseTotal = (transactions) => {
    let date = transactions?.[0]?.date;
    let totalDr = transactions?.[0]?.dr || 0;
    let totalCr = transactions?.[0]?.cr || 0;
    for (let i = 1; i < transactions.length; i++) {
      if (transactions[i].date == date) {
        totalDr += transactions[i].dr || 0;
        totalCr += transactions[i].cr || 0;
      } else {
        date = transactions?.[i]?.date;
        const nextDr = transactions?.[i]?.dr || 0;
        const nextCr = transactions?.[i]?.cr || 0;
        transactions.splice(i, 0, {
          date: "TOTAL",
          crate_name: "",
          dr: totalDr || "",
          cr: totalCr || "",
          remark: "",
        });
        totalDr = nextDr;
        totalCr = nextCr;
        i++;
      }
    }
    transactions.push({
      date: "TOTAL",
      crate_name: "",
      dr: totalDr || "",
      cr: totalCr || "",
      remark: "",
    });
    return transactions;
  };

  const onVyapariKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      enterAction();
    }
  };

  return (
    <div className={`${ui.page} ${styles.widePage}`}>
      <div className={ui.header}>
        <div>
          <h2 className={ui.title}>Crate Ledger</h2>
          <p className={ui.subtitle}>
            Crate debits and credits for a vyapari over a date range
          </p>
        </div>
      </div>

      <div className={styles.layout}>
        <form
          className={`${ui.card} ${ui.cardPad} ${styles.sidebar}`}
          onSubmit={(e) => e.preventDefault()}
        >
          <VyapariField
            name="vyapari_id"
            control={control}
            errors={errors}
            size="small"
            onKeyDownFunc={onVyapariKeyDown}
          />

          <div className={styles.dates}>
            <Controller
              name="fromDate"
              control={control}
              rules={{ required: "Enter From Date" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="FROM DATE"
                  size="small"
                  fullWidth
                  variant="outlined"
                  type="date"
                  error={!!errors.fromDate}
                  helperText={errors.fromDate?.message}
                />
              )}
            />
            <Controller
              name="toDate"
              control={control}
              rules={{ required: "Enter To Date" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="TO DATE"
                  size="small"
                  fullWidth
                  variant="outlined"
                  type="date"
                  error={!!errors.toDate}
                  helperText={errors.toDate?.message}
                />
              )}
            />
          </div>

          <button
            type="button"
            className={`${ui.btn} ${styles.fetchBtn}`}
            onClick={() => fetch_ledger(getValues())}
          >
            Fetch
          </button>
        </form>

        <div className={styles.tableArea}>
          {fetched && tableData.length === 0 && (
            <div className={ui.card}>
              <p className={ui.emptyState}>
                No transactions found for this vyapari in the selected range.
              </p>
            </div>
          )}
          {(!fetched || tableData.length > 0) && (
            <MasterTable
              columns={LEDGER_COLUMNS}
              tableData={tableData}
              keyArray={KEY_ARRAY}
              customHeight={customTableHeight}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default CrateLedger;
