import React, { useEffect, useState, useRef } from "react";
import { Dialog, DialogActions, DialogContent } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { InputAdornment, Button } from "@mui/material";
import TextField from "@mui/material/TextField";
import SearchIcon from "@mui/icons-material/Search";
import Autocomplete from "@mui/material/Autocomplete";
import { getAllPartyList } from "../../gateway/comman-apis";
import { getItem } from "../../gateway/item-master-apis";
import MasterTable from "../../shared/ui/master-table/master-table";
import { editAuction } from "../../gateway/auction-entries-api";
import { useOutletContext } from "react-router-dom";

import styles from "./auction-edit.module.css";

const AuctionEdit = (props) => {
  const {
    control,
    getValues,
    formState: { errors },
    reset,
    setValue,
  } = useForm();

  const { snackbarChange, syncComplete } = useOutletContext();

  const [itemsList, setItemsList] = useState([]);
  const [kisanList, setKisanList] = useState([]);
  const [buyItemsArr, setTableData] = useState([]);
  const kisanRef = useRef(null);
  const itemRef = useRef(null);
  const [columns, setColumns] = useState([
    "INDEX",
    "VYAPARINAME",
    "RATE",
    "QUANTITY",
    "BAGS W.",
    "AMOUNT",
    "BAG",
    "CHUNGI",
    "EDIT",
    "DELETE",
  ]);
  const [keyArray, setKeyArray] = useState([
    "index",
    "vyapariName",
    "rate",
    "quantity",
    "bagWiseQuantity",
    "amount",
    "bag",
    "chungi",
    "edit",
    "delete",
  ]);
  const [entriesToDelete, setEntriesToDelete] = useState([]);

  useEffect(() => {
    initKisanList();
    initItemList();
  }, []);

  useEffect(() => {
    const selectedItem = itemsList.find((option) => option.name == props.auctionToEdit?.[0]?.itemName);
    setValue("itemName", selectedItem || null);
    console.log(props.auctionToEdit?.[0]?.kisanId);
    
    const selectedKisan = kisanList.find((option) => option.partyId == props.auctionToEdit?.[0]?.kisanId);
    setValue("kisaan", selectedKisan || null);
    if (props.auctionToEdit?.[0]?.auctionSubmitDate)
      setValue("auctionSubmitDate", props.auctionToEdit?.[0]?.auctionSubmitDate.split("T")[0] || null);
    setTableData([...props.auctionToEdit]);
    let entriesToDeleteTemp = [];
    props.auctionToEdit.forEach((element) => entriesToDeleteTemp.push(element.auctionTransactionId));
    setEntriesToDelete(entriesToDeleteTemp);
  }, [props.auctionToEdit]);

  const initKisanList = async () => {

    let kisan_list = await getAllPartyList("KISAN");
    console.log(kisan_list);
    
    if (kisan_list?.responseBody) setKisanList(kisan_list?.responseBody);
  };

  const initItemList = async () => {
    let item_list = await getItem();
    if (item_list?.responseBody) setItemsList(item_list?.responseBody);
  };

  const editEntry = (index, newObject) => {
    setTableData((prevItems) => {
      const updatedItems = [...prevItems];
      updatedItems[index] = { ...updatedItems[index], ...newObject };
      updatedItems[index].quantity = newObject.quantity;
      updatedItems[index].bagWiseQuantity = newObject?.bagWiseQuantityArray?.join(",");
      updatedItems[index].bagWiseQuantityArray = newObject.bagWiseQuantityArray;
      return updatedItems;
    });
  };

  let throttleUpdateRecord = true;
  const save = async () => {
    throttleUpdateRecord = false;
    setTimeout(() => {
      throttleUpdateRecord = true;
    }, 3000);
    if (props.toggleLoading) props.toggleLoading(true, "UPDATING RECORD...");
    let editObj = {
      deleteAuctionTransactionDto: {
        auctionTransactionIds: entriesToDelete,
      },
      addAuctionDtos: [
        {
          kisan_id: getValues()?.kisaan?.partyId,
          item_id: getValues()?.itemName?.item_id,
          total_bags: 0,
          buyItems: [],
          device_id: buyItemsArr?.[0]?.deviceId,
          auctionDate:
            new Date(getValues()?.auctionSubmitDate).toISOString().split("T")[0] +
            `T` +
            new Date(props.auctionToEdit?.[0]?.auctionSubmitDate).toISOString().split("T")[1],
        },
      ],
    };

    if (buyItemsArr.length == 0) {
      editObj.addAuctionDtos = [];
    } else
      buyItemsArr.forEach((element) => {
        // editObj.deleteAuctionTransactionDto.auctionTransactionIds.push(element.auctionTransactionId);
        editObj.addAuctionDtos[0].buyItems.push({
          vyapariId: element.vyapariId,
          rate: element.rate,
          bag: element.bag,
          chungi: element.chungi,
          quantity: element.quantity,
          bagWiseQuantity: element.bagWiseQuantityArray,
          auctionDate:
            new Date(getValues().auctionSubmitDate).toISOString().split("T")[0] +
            "T" +
            new Date(element.auctionDate).toISOString().split("T")[1],
        });
      });
    const device_id = buyItemsArr[0]?.deviceId == null ? 1 : buyItemsArr[0].deviceId;
    const editRes = await editAuction(editObj, device_id);
    if (editRes) {
      snackbarChange({
        open: true,
        alertType: "success",
        alertMsg: "EDIT SUCCESS",
      });
      props.onClose(true);
    }
    if (props.toggleLoading) props.toggleLoading(false, "");
  };

  const deleteEntry = (index) => {
    setTableData((prevItems) => {
      const updatedItems = [...prevItems];
      updatedItems.splice(index, 1);
      return updatedItems;
    });
  };

  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      sx={{
        "& .MuiDialog-paper": {
          width: "90%",
          height: "80%",
          maxWidth: "none", // Prevents the default maxWidth
          borderWidth: "10px",
          borderColor: "black",
        },
      }}
    >
      <DialogContent dividers>
        <div className={styles.row_one}>
          <div>
            <Controller
              name="kisaan"
              control={control}
              rules={{ required: "Enter Kisaan Name" }}
              render={({ field }) => (
                <Autocomplete
                  {...field}
                  value={field.value || null}
                  options={kisanList}
                  // disabled={getValues()?.kisaan?.name && buyItemsArr.length > 0}
                  getOptionLabel={(option) => `${option.idNo} | ${option.name}`}
                  isOptionEqualToValue={(option, value) => option.partyId === value.partyId}
                  renderOption={(props, option) => (
                    <li {...props}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span>
                          <strong>ID:</strong> {option.idNo} | <strong>Name:</strong> {option.name}
                        </span>
                      </div>
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="KISAAN"
                      // disabled={getValues()?.kisaan?.name && buyItemsArr.length > 0}
                      InputProps={{
                        ...params.InputProps,
                        inputRef: kisanRef, // Attach the ref here
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      }}
                      inputProps={{
                        ...params.inputProps,
                        style: {
                          textTransform: "uppercase", // Ensure uppercase transformation here
                        },
                      }}
                    />
                  )}
                  onChange={(event, value) => {
                    field.onChange(value);
                    // fieldValueChange(event, "kisaan");
                  }}
                  disablePortal
                  id="combo-box-demo"
                />
              )}
            />
            <p className="err-msg">{errors.kisaan?.message}</p>
          </div>
          <div>
            <Controller
              name="itemName"
              control={control}
              rules={{ required: "Enter Item" }}
              render={({ field }) => (
                <Autocomplete
                  {...field}
                  value={field.value || null}
                  options={itemsList}
                  getOptionLabel={(option) => option.name}
                  isOptionEqualToValue={(option, value) => option.itemId === value.itemId}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="ITEM"
                      InputProps={{
                        ...params.InputProps,
                        inputRef: itemRef,
                        style: {
                          textTransform: "uppercase",
                        },
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                  onChange={(event, value) => {
                    field.onChange(value); // update form state
                  }}
                  disablePortal
                  id="combo-box-demo"
                />
              )}
            />
            <p className="err-msg">{errors.itemName?.message}</p>
          </div>
          <div>
            <Controller
              name="auctionSubmitDate"
              control={control}
              defaultValue=""
              rules={{ required: "Enter Date" }}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="DATE"
                  placeholder="DATE"
                  type="date"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  variant="outlined"
                  error={!!error}
                />
              )}
            />
            <p className="err-msg">{errors.auctionSubmitDate?.message}</p>
          </div>
        </div>
        <div className={styles.table}>
          <MasterTable columns={columns} tableData={buyItemsArr} keyArray={keyArray} editEntry={editEntry} deleteEntry={deleteEntry} />
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={save} color="success" variant="contained">
          SAVE
        </Button>
        <Button onClick={props.onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AuctionEdit;
