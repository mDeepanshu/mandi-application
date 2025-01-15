import React, { useState, useEffect } from 'react';

import styles from "./device-control.module.css";
import MasterTable from "../../shared/ui/master-table/master-table";
import { getAllDevices,updateStatus } from "../../gateway/device-control-api";
function DeviceControl() {

  const [deviceData, setDeviceData] = useState([]);
  const [partyColumns, setPartyColumns] = useState(["INDEX", "DEVICE NAME","STATUS", "REVOKE", "GRANT","DELETE"]);
  const [keyArray, setKeyArray] = useState(["index", "name", "status", "revoke", "grant","delete"]);

  const init = async() => {
    const deviceList = await getAllDevices();
    setDeviceData(deviceList?.responseBody)
  }
  useEffect(() => {
    init();
  }, []);

  const changeStatus = async (status,id) => {
    const res = await updateStatus(id,status);
    init();
  }

  const revokeDevice = async () => {

  }

  const addDevice = async () => {

  }

  return (
    <div className={styles.deviceControlContainer}>
      <div>
        <h2>DEVICE CONTROL</h2>
      </div>
      <MasterTable tableData={deviceData} revokeDevice={revokeDevice} addDevice={addDevice} changeStatus={changeStatus} columns={partyColumns} keyArray={keyArray} />

      {/* <div>
          <button onClick={revokeDevice}>Revoke Device</button>
          <button onClick={addDevice}>Add Device</button>
        </div> */}
    </div>
  );
}

export default DeviceControl;
