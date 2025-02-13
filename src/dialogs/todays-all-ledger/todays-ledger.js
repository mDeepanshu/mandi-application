import React, { useEffect, useState, useRef } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, InputAdornment, Button, TextField } from "@mui/material";
import LedgerPrint from "../../dialogs/ledger-print/ledger-print-dialog";
import SearchIcon from "@mui/icons-material/Search";
import Autocomplete from "@mui/material/Autocomplete";
import { getTodaysVyapari, getEveryLedger } from "../../gateway/comman-apis";
import MasterTable from "../../shared/ui/master-table/master-table";
import { useOutletContext } from "react-router-dom";
import { useReactToPrint } from "react-to-print";

import styles from "./todays-ledger.module.css";

const PrintAllLedger = (props) => {
  const [ledgerColumns, setledgerColumns] = useState(["", "ID", "NAME"]);
  const [keyArray, setKeyArray] = useState(["checkbox", "idNo", "name"]);
  const [vyapariList, setVyapariList] = useState([]);
  const [checkedEntries, setCheckedEntries] = useState([]);
  const [dataArray, setDataArray] = useState([]);
  const printRefs = useRef([]);
  const [tableDataFiltered, setTableDataFiltered] = useState([]);

  const print = async () => {
    const vyapariIdList = [];
    for (let i = 0; i < checkedEntries.length; i++) {
      if (checkedEntries[i]) vyapariIdList.push(vyapariList[i].partyId);
    }
    const allLedgerData = await getEveryLedger(props.formData.fromDate, props.formData.toDate, vyapariIdList);
    setDataArray(allLedgerData?.responseBody);
  };

  const printHandler = useReactToPrint({
    content: () => printRefs.current[0], // This will be updated dynamically in the loop
  });

  // Use useEffect to trigger printing after dataArray updates
  useEffect(() => {
    const printSequentially = async () => {
      for (let i = 0; i < dataArray.length; i++) {
        if (printRefs.current[i]) {
          await new Promise((resolve) => {
            printHandler({ content: () => printRefs.current[i] });
            setTimeout(resolve, 1000); // Adding a delay to ensure print completion
          });
        }
      }
    };

    if (dataArray.length > 0) {
      printSequentially();
    }
  }, [dataArray, printHandler]);

  const fetch_vyapari_list = async () => {
    const vyapariList = await getTodaysVyapari(props.formData.fromDate, props.formData.toDate);
    console.log("vyapariList", vyapariList);

    if (vyapariList?.responseBody?.length) {
      setVyapariList(vyapariList?.responseBody);
      setTableDataFiltered(vyapariList?.responseBody);
    }
  };

  useEffect(() => {
    console.log(";;;;;;;;;;;;;;;;");
    
    fetch_vyapari_list();
  }, []);

  const find = (event) => {
    const search = event.target.value;
    setTableDataFiltered(vyapariList.filter((elem) => elem?.partyName?.toLowerCase().includes(search.toLowerCase())));
  };

  const findById = (event) => {
    const search = event.target.value;
    // Check if either id is a substring of the other
    setTableDataFiltered(vyapariList.filter((elem) => elem?.vyapariIdNo?.toString().includes(search.toString())));
  };

  const onSelectEntry = (e, i) => {
    setCheckedEntries((prevArray) => {
      const updatedArray = [...prevArray];
      updatedArray[i] = e.target.checked;
      return updatedArray;
    });
  };

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
          <div style={{ display: "flex",alignItems: "center" }}>
            <div className={styles.select_all}><input type="checkbox" /> SELECT ALL</div>
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
          <MasterTable columns={ledgerColumns} tableData={tableDataFiltered} keyArray={keyArray} onSelectEntry={(e, i) => onSelectEntry(e, i)} checkedEntries={checkedEntries}></MasterTable>
        </DialogContent>
        <DialogActions>
          <Button onClick={print} color="success" variant="contained">
            PRINT
          </Button>
          <Button onClick={props.onClose} variant="contained">
            CLOSE
          </Button>
        </DialogActions>
      </Dialog>
      <div style={{ display: "none" }}>
        {dataArray?.map((item, index) => (
          <LedgerPrint ref={(el) => (printRefs.current[index] = el)} tableData={item.transactions} formData={item} />
        ))}
      </div>
    </>
  );
};

export default PrintAllLedger;
