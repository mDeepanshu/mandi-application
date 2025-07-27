import React, { useEffect, useState, useRef } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, InputAdornment, Button, TextField } from "@mui/material";
import LedgerPrint from "../../dialogs/ledger-print/ledger-print-dialog";
import SearchIcon from "@mui/icons-material/Search";
import Autocomplete from "@mui/material/Autocomplete";
import { getTodaysVyapari, getEveryLedger } from "../../gateway/comman-apis";
import MasterTable from "../../shared/ui/master-table/master-table";
import { useReactToPrint } from "react-to-print";

import styles from "./todays-ledger.module.css";

const PrintAllLedger = (props) => {
  const [ledgerColumns, setledgerColumns] = useState(["", "ID", "NAME","LEDGER ORDER"]);
  const [keyArray, setKeyArray] = useState(["checkbox", "idNo", "name","ledgerOrder"]);
  const [vyapariList, setVyapariList] = useState([]);
  const [checkedEntries, setCheckedEntries] = useState([]);
  const [dataArray, setDataArray] = useState([]);
  const printRefs = useRef([]);
  const [tableDataFiltered, setTableDataFiltered] = useState([]);
  const [filterBtn, setFilterBtn] = useState({
    label: `FILTER`,
    color: `primary`,
  });

  let printIndex = 0;

  const print = async () => {
    const vyapariIdList = [];
    for (let i = 0; i < checkedEntries.length; i++) {
      if (checkedEntries[i]) vyapariIdList.push(tableDataFiltered[i].partyId);
    }
    const allLedgerData = await getEveryLedger(props.formData.fromDate, props.formData.toDate, vyapariIdList);
    setDataArray(allLedgerData?.responseBody);
  };

  const printHandler = useReactToPrint({
    content: () => printRefs.current[printIndex], // This will be updated dynamically in the loop
    onAfterPrint: () => {
      if (printIndex < dataArray.length - 1) {
        setTimeout(() => printHandler({ content: () => printRefs.current[printIndex] }), 0); // Move to the next index after delay
        printIndex += 1;
      } else printIndex = 0;
    },
  });

  useEffect(() => {
    setTimeout(() => {
      if (dataArray.length > 0) printHandler();
    }, 2000);
  }, [dataArray]);

  const fetch_vyapari_list = async () => {
    const vyapariList = await getTodaysVyapari(props.formData.fromDate, props.formData.toDate);
    if (vyapariList?.responseBody) {
      setVyapariList(vyapariList?.responseBody);
      setTableDataFiltered(vyapariList?.responseBody);
    }
  };

  useEffect(() => {
    if (props.open) fetch_vyapari_list();
  }, [props.open]);

  const find = (event) => {
    const search = event.target.value;
    setTableDataFiltered(vyapariList.filter((elem) => elem?.name?.toLowerCase().startsWith(search.toLowerCase())));
  };

  const findById = (event) => {
    const search = event.target.value;
    // Check if either id is a substring of the other
    setTableDataFiltered(vyapariList.filter((elem) => elem?.idNo?.toString().includes(search.toString())));
  };

  const onSelectEntry = (e, i) => {
    setCheckedEntries((prevArray) => {
      const updatedArray = [...prevArray];
      updatedArray[i] = e.target.checked;
      return updatedArray;
    });
  };

  const filterOnLedgerOrder = () => {
    if (filterBtn.label == `FILTER`) {
      const filteredData = tableDataFiltered.filter((elem, index) => elem.ledgerOrder != null);
      setTableDataFiltered(filteredData);
      setFilterBtn({
        label: `ALL`,
        color: `success`,
      });
    } else {
      setTableDataFiltered(vyapariList);
        setFilterBtn({
        label: `FILTER`,
        color: `primary`,
      });
    }
  };

  const selectAll = (e) => setCheckedEntries(new Array(tableDataFiltered.length).fill(e.target.checked));

  return (
    <>
      <Dialog
        open={props.open}
        onClose={props.onClose}
        sx={{
          "& .MuiDialog-paper": {
            width: "40%",
            height: "85%",
            maxWidth: "none", // Prevents the default maxWidth
            borderWidth: "10px",
            borderColor: "black",
          },
        }}
      >
        <DialogTitle>
          <div className={styles.btns}>
            <div className={styles.select_all}>
              <input type="checkbox" onChange={selectAll} id="checkbox"/> <label htmlFor="checkbox">ALL</label>
            </div>
            <div>
              <Button onClick={filterOnLedgerOrder} color={filterBtn.color} variant="contained">
                {filterBtn.label}
              </Button>
            </div>
            <div className={styles.search}>
              <TextField
                fullWidth
                type="number"
                size="small"
                label="SEARCH BY ID"
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                onChange={findById}
              />
            </div>
            <div className={styles.search}>
              <TextField
                fullWidth
                type="text"
                size="small"
                label="SEARCH"
                variant="outlined"
                inputProps={{
                  style: {
                    textTransform: "uppercase", // Ensure the input content is transformed
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                onChange={find}
              />
            </div>
          </div>
        </DialogTitle>
        <DialogContent>
          <MasterTable
            columns={ledgerColumns}
            tableData={tableDataFiltered}
            keyArray={keyArray}
            onSelectEntry={(e, i) => onSelectEntry(e, i)}
            checkedEntries={checkedEntries}
            customHeight={`300px`}
          ></MasterTable>
        </DialogContent>
        <DialogActions>
          <Button onClick={print} color="success" variant="contained">
            PRINT
          </Button>
          <Button onClick={props.onClose} color="primary" variant="contained">
            CLOSE
          </Button>
        </DialogActions>
      </Dialog>
      <div style={{ display: "none" }}>
        {dataArray?.map((item, index) => (
          <LedgerPrint ref={(el) => (printRefs.current[index] = el)} tableData={item.transactions} formData={item} fromAllLedger={true} />
        ))}
      </div>
    </>
  );
};

export default PrintAllLedger;
