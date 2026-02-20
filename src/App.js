import React, { useState, useMemo } from "react";
import { Outlet } from "react-router-dom";
import "./App.css";
import { Box } from "@mui/material";
import Login from "./features/login/login";
import NavBar from "./features/navbar/Nav-Bar";
import SnackbarGlobal from "./shared/ui/snackbar/snackbar";

function App({ variant }) {
  const [loginStatus, setLoginStatus] = useState(true);
  const [snackbarData, setSnackbarData] = useState({});
  const [syncComplete, setSyncComplete] = useState("");
  const [loading, setLoading] = useState({
    isLoading: false,
    message: "Loading...",
  });

  const changeLoginState = (value) => setLoginStatus(value);
  const snackbarChange = (data) => setSnackbarData(data);
  const changeLoading = (newState, apiRes) =>
    setLoading({ isLoading: newState, message: apiRes });

  return (
    <>
      {loginStatus ? (
        <Login changeLoginState={changeLoginState} />
      ) : (
        <>
          {loading.isLoading && (
            <div className="loader-bg">
              <div className="loader"></div>
            </div>
          )}

          <NavBar
            variant={variant}
            setSyncComplete={setSyncComplete}
          />

          <Box component="main" sx={{ mt: 8 }}>
            <Outlet
              context={{
                snackbarChange,
                syncComplete,
                loading,
                changeLoading,
                variant,
              }}
            />
          </Box>

          <SnackbarGlobal snackbarData={snackbarData} />
        </>
      )}
    </>
  );
}

export default App;
