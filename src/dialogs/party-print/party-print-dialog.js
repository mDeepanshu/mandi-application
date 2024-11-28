import React, { forwardRef, useEffect,useState } from 'react';
import "./partyPrint.module.css";

const PartyPrint = forwardRef((props, ref) => {


    useEffect(() => {
        console.log("table");
    }, [props]);

    return (
        <div ref={ref}>
            <h1 className='heading'>Party Print</h1>
            {/* <div className='constants'>
                <div>From Date: {props.formData?.fromDate}</div>
                <div>To Date: {props.formData?.toDate}</div>
            </div> */}
            <table border="1">
                <thead>
                    <tr>
                        <th>INDEX</th>
                        <th>PARTY NAME</th>
                        <th>PENDING AMOUNT</th>
                    </tr>
                </thead>
                <tbody>
                    {props?.tableData?.map((row, index) => (
                        <tr key={index}>
                            <td component="th" scope="row">
                                {index + 1}
                            </td>
                            <td align="right">{row.name}</td>
                            <td align="right">{row.owedAmount}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
});

export default PartyPrint;




