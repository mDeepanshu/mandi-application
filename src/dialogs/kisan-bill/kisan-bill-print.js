import React, { forwardRef,useEffect,useState  } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from '@mui/material';
import styles from "./kisan-bill-print.module.css";
const KisanBillPrint = forwardRef((props, ref) =>{

  const [printTable,setPrintTable] = useState([]);
  const [localTable,setLocalTable] = useState([]);
  
  useEffect(() => {
    setLocalTable(props.tableDataPrint);
  }, [props]);

  useEffect(() => {
    if(props.restructureTable){
      let arr=[];
      if (props.fromPreviousBill) {
        arr=localTable;
      } else {
        localTable?.forEach(element => {
          arr.push(element[0]);
        });
      }
      for (let index = 1; index < arr.length; index++) {
        if (arr[index-1].rate==arr[index].rate && arr[index-1].itemName==arr[index].itemName) {
          
          arr[index].quantity+=arr[index-1].quantity;
          arr[index].itemTotal+=arr[index-1].itemTotal;
          arr[index].bag+=arr[index-1].bag;
          arr.splice(index-1,1);
          index--;
        }
      }
      setPrintTable(arr);
    }else{
      setPrintTable(props.tableDataPrint);
    } 
  }, [localTable]);


    return (
        <div ref={ref}>
          <h1 className={styles.heading}>Haji Sabzi Mandi Bill</h1>
          <div className={styles.constants}>
            <div>Bhada: {props.formData?.bhada}</div>
            <div>Bill Date: {props.formData?.billDate}</div>
            <div>Bill Id: {props.formData?.billId}</div>
            <div>Commission: {props.formData?.commission}</div>
            <div>Driver Inaam: {props.formData?.driverInaam}</div>
            <div>Hammali: {props.formData?.hammali}</div>
            <div>Kharcha Total: {props.formData?.kharchaTotal}</div>
            <div>Kisan Name: {props.formData?.kisanName}</div>
            <div>Mandi Kharcha: {props.formData?.mandiKharcha}</div>
            <div>Nagar Palika Tax: {props.formData?.nagarPalikaTax}</div>
            <div>Nagdi: {props.formData?.nagdi}</div>
            <div>Pakki Bikri: {props.formData?.pakkiBikri}</div>
          </div>
          <TableContainer>
              <Table aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell>Item Name</TableCell>
                    <TableCell align="right">Bag</TableCell>
                    <TableCell align="right">Rate</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Item Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {printTable?.map((row,index) => (
                    <TableRow key={index}>
                      <TableCell component="th" scope="row">
                        {row.itemName}
                      </TableCell>
                      <TableCell align="right">{row.bag}</TableCell>
                      <TableCell align="right">{row.rate}</TableCell>
                      <TableCell align="right">{row.quantity}</TableCell>
                      <TableCell align="right">{row.itemTotal}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
        </div>
      );
});

export default KisanBillPrint;
