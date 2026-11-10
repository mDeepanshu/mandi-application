// Crate numbers are assigned on the frontend for now (the backend has no such
// field). Ordering by id keeps each crate's number stable across loads, as long
// as crates are only ever added in the master.
export const withCrateNumbers = (crates = []) =>
  [...crates]
    .sort((a, b) => Number(a.id) - Number(b.id))
    .map((crate, index) => ({ ...crate, crate_no: String(index + 1) }));
