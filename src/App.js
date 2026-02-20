import React, { useState, useMemo } from "react";
import { Outlet } from "react-router-dom";
import "./App.css";
import { Box } from "@mui/material";
import Login from "./features/login/login";
import NavBar from "./features/navbar/Nav-Bar";
import SnackbarGlobal from "./shared/ui/snackbar/snackbar";

function App() {
  const [loginStatus, setLoginStatus] = useState(true);
  const [snackbarData, setSnackbarData] = useState({});
  const [syncComplete, setSyncComplete] = useState("");
  const [loading, setLoading] = useState({
    isLoading: false,
    message: "Loading...",
  });

  const variant = useMemo(() => {
    if (typeof window === "undefined") return "full";

    const hostname = window.location.hostname;

    if (hostname === "hiskisanbill.make73.com") {
      return "kisan-only";
    }

    if (hostname === "mandiapplication.make73.com") {
      return "main-app";
    }

    if (hostname.includes("localhost")) {
      return "local";
    }

    return "main-app";
  }, []);

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
