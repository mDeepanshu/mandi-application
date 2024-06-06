import React from "react";
import { Outlet } from "react-router-dom";
import './App.css';
import { initializeApp } from "firebase/app";
import { Box } from '@mui/material';

import NavBar from "./features/navbar/Nav-Bar";

const firebaseConfig = {
	apiKey: "AIzaSyBI-TlWQnGAD6EzOw-2Td0ScXI8g3LZTgA",
	authDomain: "mandi-application.firebaseapp.com",
	projectId: "mandi-application",
	storageBucket: "mandi-application.appspot.com",
	messagingSenderId: "491088522122",
	appId: "1:491088522122:web:163ef9fe2e8f05f0def673"
};

const app = initializeApp(firebaseConfig);

function App() {
	return (
		<>
			<NavBar></NavBar>
			<Box component="main" sx={{ mt: 8 }}>
				<Outlet />
			</Box>
		</>
	);
}

// const router = createBrowserRouter([
// 	{
// 		path: '/',
// 		element: <App />,
// 		children: [
// 			{
// 				path: '/',
// 				element: <Home />
// 			},
// 			{
// 				path: 'kisan-bill',
// 				element: <Kisan />
// 			},
// 			{
// 				path: 'vyapari-bill',
// 				element: <Vyapari />
// 			},
// 		],
// 		// errorElement: <Error />
// 	}
// ])

export default App;
