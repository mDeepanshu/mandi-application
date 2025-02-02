import React, { useEffect, useState, useRef } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

import { Button } from "@mui/material";
import TextField from "@mui/material/TextField";
import SearchIcon from "@mui/icons-material/Search";
import Autocomplete from "@mui/material/Autocomplete";
import { getTodaysVyapari, getEveryLedger } from "../../gateway/comman-apis";
import MasterTable from "../../shared/ui/master-table/master-table";
import { useOutletContext } from "react-router-dom";

import styles from "./todays-ledger.module.css";

const PrintAllLedger = (props) => {

  const [ledgerColumns, setledgerColumns] = useState(["","ID" ,"NAME"]);
  const [keyArray, setKeyArray] = useState(["checkbox","idNo" ,"name"]);
  const [vyapariList, setVyapariList] = useState([]);
  const [checkedEntries, setCheckedEntries] = useState([]);

  const print = async () => {
    const vyapariIdList = [];
    for (let i = 0; i < checkedEntries.length; i++) {
      if (checkedEntries[i]) vyapariIdList.push(vyapariList[i].partyId);
      const allLedgerData = await getEveryLedger(props.formData.fromDate, props.formData.toDate,vyapariIdList);
      console.log(`allLedgerData`,allLedgerData);
      if (window.electron && window.electron.ipcRenderer) {
        // Invoke a print action
        window.electron.ipcRenderer
          .invoke('print-all-ledger', allLedgerData)
          .then(() => {
            console.log(`ssssss`);
            
          })
          .catch((err) => console.error('Print failed:', err));
      } else {
        console.warn('Electron IPC is not available.');
      }
    }
  };

  const fetch_vyapari_list = async () => {
    const vyapariList = await getTodaysVyapari(props.formData.fromDate, props.formData.toDate);
    console.log(vyapariList);
    
    if (vyapariList?.responseBody?.length) {
      setVyapariList(vyapariList?.responseBody);
    }
  };

  useEffect(() => {
    fetch_vyapari_list();
  }, []);

  
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
            height: "80%",
            maxWidth: "none", // Prevents the default maxWidth
            borderWidth: "10px",
            borderColor: "black",
          },
        }}
      >
        <DialogTitle>
          <input type="checkbox" /> SELECT ALL
        </DialogTitle>
        <DialogContent>
          <MasterTable
            columns={ledgerColumns}
            tableData={vyapariList}
            keyArray={keyArray}
            onSelectEntry={(e, i) => onSelectEntry(e, i)}
            checkedEntries={checkedEntries}
          ></MasterTable>
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
    </>
  );
};

export default PrintAllLedger;
