import React, { forwardRef, useEffect } from "react";
import styles from "./duplicate-vasuli.module.css";
import { Dialog, DialogActions, DialogContent, DialogTitle, InputAdornment, Button, TextField } from "@mui/material";

const DuplicateVasuli = (props) => {
  return (
    <Dialog
      open={props.open.display}
      onClose={props.onClose}
      sx={{
        "& .MuiDialog-paper": {
          width: "80%",
          height: "35%",
          maxWidth: "none", // Prevents the default maxWidth
          borderWidth: "10px",
          borderColor: "black",
        },
      }}
    >
      <div className={styles.container}>
        <DialogContent>
          <h2 className={styles.message}>आज के लिए पहले ही जोड़ा जा चुका है!</h2>
          <p>{props.open.message}</p>
        </DialogContent>
        <hr />
        <DialogActions>
          <div className={styles.footer}>
            <Button className={styles.closeButton} color="success" variant="contained" onClick={props.onClose}>
              Close
            </Button>
            <Button className={styles.continueButton} color="primary" variant="contained" onClick={props.continue}>
              Continue
            </Button>
          </div>
        </DialogActions>
      </div>
    </Dialog>
  );
};

export default DuplicateVasuli;
