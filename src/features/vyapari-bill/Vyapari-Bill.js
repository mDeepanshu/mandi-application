import React, { useEffect, useState, useRef } from 'react';
import { Grid } from "@mui/material";
import { TextField, Button } from "@mui/material";
import { InputAdornment } from '@mui/material';
import { saveVyapariBill, getVyapariBill } from '../../gateway/vyapari-bill-apis';
import { useForm, Controller } from 'react-hook-form';
import { getAllPartyList } from "../../gateway/comman-apis";
import Autocomplete from '@mui/material/Autocomplete';
import SearchIcon from '@mui/icons-material/Search';
import VyapariBillPrint from "../../dialogs/vyapari-bill/vyapari-bill-print";
import "./vyapari-bill.css";
import ReactToPrint from 'react-to-print';
import SharedTable from "../../shared/ui/table/table";
import PreviousBills from "../../shared/ui/previous-bill/previousBill";

function VyapariBill() {

  const componentRef = useRef();
  const triggerRef = useRef();

  const { register, handleSubmit, control, formState: { errors }, getValues, trigger, setValue } = useForm();
  const [vyapariList, setVyapariList] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [vyapariTableColumns, setVyapariTableColumns] = useState(["Item Name", "Bag", "Rate", "Quantity", "Item Total","Date","Kisan Name", "Edit", "Delete", "Updated Tran."]);
  const [formData, setFormData] = useState();
  const [keyArray, setKeyArray] = useState(["itemName", "bag", "rate", "quantity", 'itemTotal',"auctionDate","partyName", "edit", "delete", "navigation"]);



  const onSubmit = async (data) => {
    const billDetails = {
      ...data,
      tableData
    };
    setFormData(billDetails);

  };

  const fetchBill = async () => {
    const isValid = await trigger(['vyapari_name', 'date']);
    if (isValid) {
      const formValues = getValues();
      const billData = await getVyapariBill(formValues.vyapari_name.partyId, formValues.date);
      console.log(billData);
      
      setTableData(billData?.responseBody?.billList);
      setValue("previous_remaining", billData?.responseBody?.currentOutstanding);
      setValue("total", billData?.responseBody?.billTotal);
    }
  }

  const getVyapariNames = async () => {
    const allVyapari = await getAllPartyList("VYAPARI");
    if (allVyapari?.responseBody) setVyapariList(allVyapari?.responseBody);
  }

  // const editFromTable = (index) => {
  // }

  // const deleteFromTable = (index) => {
  // }

  useEffect(() => {
    getVyapariNames();
  }, []);

  // useEffect(() => {
  //   if (formData) {
  //     if (triggerRef.current) {
  //       triggerRef.current.click();
  //     }
  //   }
  // }, [formData]);

  const printBill = () => {
    triggerRef.current.click();

  }

  const saveBill = async () => {
    let tableSnapshot=[];
    tableData.forEach(element => {
      tableSnapshot.push(element[0]);
    });
    console.log(getValues());
    
    const bill = {...getValues(), vyapariBillItems:tableSnapshot,vyapariId:getValues()?.vyapari_name?.partyId,vyapariName:getValues().vyapari_name?.name,billDate:getValues()?.date};
    delete bill.vyapari_name;
    delete bill.date;
    saveVyapariBill(bill);
    console.log(bill);
  }

  const refreshBill = async () => {
    let formValues = getValues();
    const billData = await getVyapariBill(formValues.vyapari_name.partyId, formValues.date);
    console.log(billData);
    if (billData) {
      setTableData(billData?.responseBody?.billList);
      const billConstant = billData?.responseBody;
      setValue("previous_remaining", billData?.responseBody?.currentOutstanding);
      setValue("total", billData?.responseBody?.billTotal);
    }
    
  }

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid item xs={8} p={3}>
          <Grid container spacing={2} justifyContent="space-between">
            <Grid container item xs={12} spacing={2} justifyContent="flex-end">
              <Grid item xs={5}>
                <Controller
                  name="vyapari_name"
                  control={control}
                  rules={{ required: "Enter Patry Name" }}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      options={vyapariList}
                      getOptionLabel={(option) => option.name}
                      getOptionKey={(option) => option.partyId}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Vyapari Name"
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon />
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                      onChange={(event, value) => field.onChange(value)}
                      disablePortal
                      id="combo-box-demo"
                    />
                  )}
                />
                <p className='err-msg'>{errors.vyapari_name?.message}</p>
              </Grid>
              <Grid item xs={5}>
                <Controller
                  name="date"
                  control={control}
                  defaultValue=""
                  rules={{ required: "Enter Date" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      variant="outlined"
                      type='date'
                    />
                  )}
                />
                <p className='err-msg'>{errors.date?.message}</p>
              </Grid>
              <Grid item xs={2}>
                <Button variant="contained" color="success" onClick={fetchBill} fullWidth>Fetch Bill</Button>
              </Grid>
            </Grid>
            <Grid item xs={7}>
              <PreviousBills billData={{id:getValues()?.vyapari_name?.partyId,date:getValues()?.date}} partyType={"vyapari"}/>
            </Grid>
            <Grid item xs={3}>
              <TextField
                {...register("previous_remaining", { required: "This field is required" })}
                error={!!errors.previous_remaining}
                helperText={errors.previous_remaining ? errors.previous_remaining.message : ""}
                size="small"
                sx={{ mb: 3 }}
                defaultValue="1"
                fullWidth
                label="Current Outstanding"
                variant="outlined"
              />
            </Grid>
          </Grid>
          <SharedTable columns={vyapariTableColumns} tableData={tableData} keyArray={keyArray} refreshBill={refreshBill}/>
          <Grid container spacing={2} paddingTop={2}>
            <Grid container item xs={12} spacing={2} justifyContent="flex-end">
              <Grid item xs={2}>
                <TextField
                  {...register("total", { required: "This field is required" })}
                  error={!!errors.total}
                  helperText={errors.total ? errors.total.message : ""}
                  size="small"
                  sx={{ mb: 3 }}
                  defaultValue="1"
                  fullWidth
                  label="Total"
                  variant="outlined"
                />
              </Grid>
            </Grid>
            <Grid container item xs={12} spacing={2} justifyContent="flex-end">
              <Grid item xs={2}>
                <Button variant="contained" color="primary" fullWidth onClick={saveBill}>Save Bill</Button>
              </Grid>
              <Grid item xs={2}>
                <Button variant="contained" color="success" type='button' onClick={()=>printBill()} fullWidth>Print</Button>
                <ReactToPrint
                  trigger={() => <button style={{ display: 'none' }} ref={triggerRef}></button>}
                  content={() => componentRef.current}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </form>
      <div style={{ display: 'none' }}>
        <VyapariBillPrint ref={componentRef} tableData={tableData} formData={formData} restructureTable={true}/>
      </div>
    </div>
  );
}

export default VyapariBill;
