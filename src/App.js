import React, { useState, useMemo, useEffect, Suspense } from "react";
import { Outlet } from "react-router-dom";
import "./App.css";
import { Box } from "@mui/material";
import Login from "./features/login/login";
import NavBar from "./features/navbar/Nav-Bar";
import SnackbarGlobal from "./shared/ui/snackbar/snackbar";
import { registerSnackbar } from "./shared/services/snackbar-service";

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

  useEffect(() => {
    registerSnackbar(snackbarChange);
  }, []);
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
            {/* Suspense must sit BELOW the NavBar: lazy pages suspend here on
                first load, and if the boundary were above the NavBar the whole
                tree (including the open MORE menu mid-close-transition) would
                be hidden, leaving the menu stuck open. */}
            <Suspense fallback={<div>Loading...</div>}>
              <Outlet
                context={{
                  snackbarChange,
                  syncComplete,
                  loading,
                  changeLoading,
                  variant,
                }}
              />
            </Suspense>
          </Box>

          <SnackbarGlobal snackbarData={snackbarData} />
        </>
      )}
    </>
  );
}

export default App;
