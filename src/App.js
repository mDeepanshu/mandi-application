import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import './App.css';
import { Box } from '@mui/material';
import Login from "./features/login/login";
import NavBar from "./features/navbar/Nav-Bar";

function App() {
	
const [loginStatus, setLoginStatus] = useState(true);

const changeLoginState = (value) => {
	setLoginStatus(value)
}

	return (
		<>
			{
				loginStatus ? (<Login changeLoginState={changeLoginState} />) : (
					<>
						<NavBar></NavBar>
						<Box component="main" sx={{ mt: 8 }}>
							<Outlet />
						</Box>
					</>
				)
			}
		</>
	);
}

export default App;
