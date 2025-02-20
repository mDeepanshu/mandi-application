import React, { forwardRef, useEffect,useState } from 'react';
import styles from "./partyPrint.module.css";

const PartyPrint = forwardRef((props, ref) => {

    return (
        <div ref={ref} className={styles.container}>
            <h1 className='heading'>Party Print</h1>
            {/* <div className='constants'>
                <div>From Date: {props.formData?.fromDate}</div>
                <div>To Date: {props.formData?.toDate}</div>
            </div> */}
            <table border="1">
                <thead>
                    <tr>
                        <th>PARTY NAME</th>
                        <th>CONTACT</th>
                        <th>PENDING AMOUNT</th>
                    </tr>
                </thead>
                <tbody>
                    {props?.tableData?.map((row, index) => (
                        <tr key={index}>
                            <td align="left">{row.name}</td>
                            <td align="left">{row.contact}</td>
                            <td align="left">{row.owedAmount}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
          <tr>
            <td colspan="5">-----------------------------------------------------------------------------------------------------------------------------------------</td>
          </tr>
          <tr>
            <td colspan="5">-----------------------------------------------------------------------------------------------------------------------------------------</td>
          </tr>
        </tfoot>
            </table>
        </div>
    );
});

export default PartyPrint;




