import React, { forwardRef, useEffect } from 'react';
import "./vyapari-vasuli-print.module.css";
const VyapariVasuliPrint = forwardRef((props, ref) => {

    return (
        <div ref={ref}>
            <h1 className='heading'>Vyapari Vasuli Sheet</h1>
            <div className='constants'>
                <div> Date: {props.formData?.fromDate}</div>
            </div>
            <table border="1">
                <thead>
                    <tr>
                        <th>INDEX</th>
                        <th>VYAPARI NAME</th>
                        <th>OPENING AMOUNT</th>
                        <th>DAY BILL</th>
                        <th>CLOSING AMOUNT</th>
                    </tr>
                </thead>
                <tbody>
                    {props.tableData?.map((row, index) => (
                        <tr key={index}>
                            <td component="th" scope="row">
                                {index + 1}
                            </td>
                            <td align="right">{row.partyName}</td>
                            <td align="right">{row.openingAmount}</td>
                            <td align="right">{row.dayBill}</td>
                            <td align="right">{row.closingAmount}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
});

export default VyapariVasuliPrint;




