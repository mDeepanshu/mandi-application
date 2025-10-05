import React, { useEffect, useState, useRef } from "react";
import { Grid } from "@mui/material";
import { TextField, Button } from "@mui/material";
import { saveVyapariBill, getVyapariBill } from "../../gateway/vyapari-bill-apis";
import { useForm, Controller } from "react-hook-form";
import { getAllPartyList } from "../../gateway/comman-apis";
import VyapariBillPrint from "../../dialogs/vyapari-bill/vyapari-bill-print";
import styles from "./vyapari-bill.module.css";
import ReactToPrint from "react-to-print";
import SharedTable from "../../shared/ui/table/table";
import PreviousBills from "../../shared/ui/previous-bill/previousBill";
import VyapariField from "../../shared/elements/VyapariField";
import { useOutletContext } from "react-router-dom";

function VyapariBill() {
  const componentRef = useRef();
  const triggerRef = useRef();
  const currentDate = new Date().toISOString().split("T")[0]; // Get current date in 'YYYY-MM-DD' format
  const { changeLoading } = useOutletContext();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    getValues,
    trigger,
    setValue,
  } = useForm({
    defaultValues: {
      date: currentDate,
    },
  });
  const [vyapariList, setVyapariList] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [vyapariTableColumns, setVyapariTableColumns] = useState([
    "Item Name",
    "Bag",
    "Chungi",
    "Rate",
    "Quantity",
    "Bags W.",
    "Item Total",
    "Date",
    "Kisan Name",
    "DEVICE NAME",
    "Edit",
    // "Updated Tran.",
  ]);
  const [formData, setFormData] = useState();
  const [keyArray, setKeyArray] = useState([
    "itemName",
    "bag",
    "chungi",
    "rate",
    "quantity",
    "bagWiseQuantity",
    "itemTotal",
    "auctionDate",
    "partyName",
    "deviceName",
    "edit",
    // "navigation",
  ]);

  useEffect(() => {
    // getVyapariNames();
  }, []);

  const onSubmit = async (data) => {
    const billDetails = {
      ...data,
      tableData,
    };
    setFormData(billDetails);
  };

  const fetchBill = async () => {
    const isValid = await trigger(["vyapari_name", "date"]);
    if (isValid) {
      const formValues = getValues();
      const billData = await getVyapariBill(formValues.vyapari_name.partyId, formValues.date);

      setTableData(billData?.responseBody?.billList);
      setValue("previous_remaining", billData?.responseBody?.currentOutstanding);
      setValue("total", billData?.responseBody?.billTotal);
    }
  };

  const getVyapariNames = async () => {
    const allVyapari = await getAllPartyList("VYAPARI");
    if (allVyapari?.responseBody) setVyapariList(allVyapari?.responseBody);
  };

  const printBill = () => {
    triggerRef.current.click();
  };

  const saveBill = async () => {
    let tableSnapshot = [];
    tableData?.forEach((element) => {
      tableSnapshot.push(element[0]);
    });
    const bill = {
      ...getValues(),
      vyapariBillItems: tableSnapshot,
      vyapariId: getValues()?.vyapari_name?.partyId,
      vyapariName: getValues().vyapari_name?.name,
      billDate: getValues()?.date,
    };
    delete bill.vyapari_name;
    delete bill.date;
    saveVyapariBill(bill);
  };

  const refreshBill = async () => {
    let formValues = getValues();
    const billData = await getVyapariBill(formValues.vyapari_name.partyId, formValues.date);
    if (billData) {
      setTableData(billData?.responseBody?.billList);
      const billConstant = billData?.responseBody;
      setValue("previous_remaining", billData?.responseBody?.currentOutstanding);
      setValue("total", billData?.responseBody?.billTotal);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className={styles.heading}>
          <h1>VYAPARI BILL</h1>
        </div>
        <Grid container pt={2} pl={1} gap={1}>
          <Grid item xs={7} md={4}>
            <VyapariField name="vyapari_name" control={control} errors={errors} size="small" />
          </Grid>
          <Grid item xs={4} md={3}>
            <Controller
              name="date"
              control={control}
              rules={{ required: "Enter Date" }}
              render={({ field }) => (
                <TextField {...field} defaultValue={currentDate} size="small" fullWidth variant="outlined" type="date" />
              )}
            />
            <p className="err-msg">{errors.date?.message}</p>
          </Grid>
          <Grid item xs={6} md={2}>
            <Button variant="contained" color="success" onClick={fetchBill} fullWidth>
              Fetch Bill
            </Button>
          </Grid>
          {/* </Grid> */}
          <Grid item xs={5} md={2}>
            <PreviousBills billData={{ id: getValues()?.vyapari_name?.partyId, date: getValues()?.date }} partyType={"vyapari"} />
          </Grid>
          <Grid item xs={10} md={4} pt={1}>
            <b>CURRENT OUTSTANDING: {getValues().previous_remaining}</b>
          </Grid>
          {/* </Grid> */}
        </Grid>
        <div className={styles.billTable}>
          <SharedTable toggleLoading={changeLoading} columns={vyapariTableColumns} tableData={tableData} keyArray={keyArray} refreshBill={refreshBill} bill_vyapari_id={getValues()?.vyapari_name?.partyId} />
        </div>
        <Grid container p={1} gap={1} justifyContent="flex-end">
          <Grid item xs={6} md={7}></Grid>
          <Grid item xs={6} md={3}>
            <TextField
              {...register("total", { required: "This field is required" })}
              error={!!errors.total}
              helperText={errors.total ? errors.total.message : ""}
              size="small"
              // sx={{ mb: 3 }}
              defaultValue="1"
              fullWidth
              label="Total"
              variant="outlined"
            />
          </Grid>
          <Grid item xs={4} md={2}>
            <Button variant="contained" color="primary" fullWidth onClick={saveBill}>
              Save Bill
            </Button>
          </Grid>
          <Grid item xs={4} md={2}>
            <Button variant="contained" color="success" type="button" onClick={() => printBill()} fullWidth>
              Print
            </Button>
            <ReactToPrint
              trigger={() => <button style={{ display: "none" }} ref={triggerRef}></button>}
              content={() => componentRef.current}
            />
          </Grid>
        </Grid>
      </form>
      <div style={{ display: "none" }}>
        <VyapariBillPrint ref={componentRef} tableData={tableData} formData={formData} restructureTable={true} />
      </div>
    </div>
  );
}

export default VyapariBill;
