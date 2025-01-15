import React, { useEffect, useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button } from "@mui/material";
import { getAuctionEntriesList, getActiveDevices } from '../../gateway/auction-entries-api';
import MasterTable from "../../shared/ui/master-table/master-table";
import ReactToPrint from 'react-to-print';
import styles from "./auction-entries.module.css";
import Autocomplete from '@mui/material/Autocomplete';
import AuctionEdit from "../../dialogs/auction-edit/auction-edit";

function AuctionEntries() {

  const triggerRef = useRef();

  const [tableData, setTableData] = useState([]);
  const [auctionEntriesColumns, setAuctionEntriesColumns] = useState(["", "INDEX", "KISANNAME", "ITEMNAME", "VYAPARINAME", "RATE", "QUANTITY", "AMOUNT", "BAG", "DATE"]);
  const [keyArray, setKeyArray] = useState(["checkbox", "index", "kisanName", "itemName", "vyapariName", "rate", "quantity", "amount", "bag", "auctionDate"]);
  const [tabletList, setTabletList] = useState([]);
  const currentDate = new Date().toISOString().split('T')[0]; // Get current date in 'YYYY-MM-DD' format
  const [selectedTablet, setSelectedTablet] = useState(null);
  const [showAuctionEdit, setShowAuctionEdit] = useState(false);
  const [auctionToEdit, setAuctionToEdit] = useState([]);

  let auctionToEditIndex = [];

  const { register, control, handleSubmit, formState: { errors }, getValues, trigger, setValue } = useForm({
    defaultValues: {
      toDate: currentDate, // Set the default value to current date
      fromDate: currentDate, // Default to 2 days prior date
    },
  });

  const fetch_auctionEntriesList = async () => {
    const isValid = await trigger(); // Validates all fields
    if (isValid) {
      getAuctionEntries();
    } else {
      console.log('Validation failed');
    }
  }

  const getAuctionEntries = async () => {
    const { fromDate, toDate } = getValues();
    let deviceId = selectedTablet ? selectedTablet.id : ``;

    const vasuliList = await getAuctionEntriesList(fromDate, toDate, deviceId);
    if (vasuliList) {
      setTableData(vasuliList.responseBody);
    }
  }

  const printLedger = () => {
    triggerRef.current.click();
  }

  const getDevicelist = async () => {
    const decivelist = await getActiveDevices();
    setTabletList(decivelist?.responseBody);

  }

  useEffect(() => {
    getDevicelist();
  }, []);

  const edit = () => {
    let arr = [];
    auctionToEditIndex.forEach(element => {
      arr.push(tableData[element]);
    });
    setAuctionToEdit(arr);
    setShowAuctionEdit(true);
  }

  const onSelectEntry = (e, i) => {
    if (e.target.checked) auctionToEditIndex.push(i);
    else auctionToEditIndex = auctionToEditIndex.filter(item => item !== i);
  }

  const handleToClose = (refreshTable) => {
    if (refreshTable) getAuctionEntries();
    setShowAuctionEdit(false);
  };

  return (
    <>
      <div className={styles.container}>
        <h1>AUCTION ENTRIES</h1>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className={styles.dateFields}>
            <div className={styles.date}>
              <Controller
                name="fromDate"
                control={control}
                rules={{ required: "Enter From Date" }}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="FROM DATE"
                    variant="outlined"
                    type='date'
                  />
                )}
              />
              <p className="error">{errors.fromDate?.message}</p>
            </div>
            <div className={styles.date}>
              <Controller
                name="toDate"
                control={control}
                rules={{ required: "Enter To Date" }}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="TO DATE"
                    variant="outlined"
                    type='date'
                  />
                )}
              />
              <p className="error">{errors.toDate?.message}</p>
            </div>
            <Autocomplete
              disablePortal
              options={tabletList}
              getOptionLabel={(option) => option.name} // Display the "name" property
              sx={{ width: 300 }}
              value={selectedTablet}
              onChange={(event, newValue) => setSelectedTablet(newValue)}
              renderInput={(params) => <TextField {...params} label="TABLET" />}
            />
          </div>
          <div className={styles.btns}>
            <Button variant="contained" color="success" type='button' onClick={() => fetch_auctionEntriesList()} >FETCH</Button>&nbsp;
            <Button variant="contained" color="secondary" type='button' onClick={() => edit()} >EDIT</Button>&nbsp;
            {/* <Button variant="contained" color="success" type='button' onClick={() => printLedger()} className={styles.print_btn}>PRINT LEDGER</Button>
            <ReactToPrint
              trigger={() => <button style={{ display: 'none' }} ref={triggerRef}></button>}
              content={() => componentRef.current}
            /> */}
          </div>
        </form>
        <MasterTable columns={auctionEntriesColumns} tableData={tableData} keyArray={keyArray} onSelectEntry={(e, i) => onSelectEntry(e, i)} />
      </div>
      <div style={{ display: 'none' }}>
        {/* <LedgerPrint ref={componentRef} tableData={tableData} formData={getValues()} /> */}
      </div>
      <div>
        {/* {showAuctionEdit && <AuctionEdit/>} */}
        <AuctionEdit open={showAuctionEdit} onClose={(refreshTable) => handleToClose(refreshTable)} auctionToEdit={auctionToEdit} />
      </div>
    </>
  );
}

export default AuctionEntries;
