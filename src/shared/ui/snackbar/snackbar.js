import React, { useEffect, useState, useRef } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';


function SnackbarGlobal({snackbarData}) {

    const [alertData, setAlertData] = useState({
        open: false,
        alertType: "",
        alertMsg: ""
    });

    useEffect(()=>{
        if (snackbarData) {
            setAlertData(snackbarData);
        }
    },[snackbarData])

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
          return;
        }
        setAlertData({
          open: false,
          alertType: "",
          alertMsg: ""
        });
      };

    return (
        <div>
            <Snackbar
                open={alertData.open}
                autoHideDuration={4000}
                onClose={handleClose}
            >
                <Alert
                    onClose={handleClose}
                    severity={alertData.alertType}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {alertData.alertMsg}
                </Alert>
            </Snackbar>
        </div>
    );

}

export default SnackbarGlobal;