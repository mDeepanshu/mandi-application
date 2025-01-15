import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import './App.css';
import { Box } from '@mui/material';
import Login from "./features/login/login";
import NavBar from "./features/navbar/Nav-Bar";
import SnackbarGlobal from "./shared/ui/snackbar/snackbar";

function App() {
	
const [loginStatus, setLoginStatus] = useState(true);
const [snackbarData, setSnackbarData] = useState({});

const changeLoginState = (value) => {
	setLoginStatus(value)
}

const snackbarChange = (data) => {
	setSnackbarData(data);
}

	return (
		<>
			{
				loginStatus ? (<Login changeLoginState={changeLoginState} />) : (
					<>
						<NavBar></NavBar>
						<Box component="main" sx={{ mt: 8 }}>
							<Outlet context={{snackbarChange}}/>
						</Box>
						<SnackbarGlobal snackbarData={snackbarData}/>
					</>
				)
			}
		</>
	);
}

export default App;
