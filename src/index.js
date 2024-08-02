import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import {RouterProvider,createBrowserRouter} from 'react-router-dom'
import App from './App';
import Home from "./features/home/Home";
import Kisan from "./features/kisan-bill/Kisan-Bill";
import Vyapari from "./features/vyapari-bill/Vyapari-Bill";
import ItemMaster from "./features/item-master/Item-Master";
import PartyMaster from "./features/party-master/Party-Master";

const router = createBrowserRouter([
	{
		path: '/',
		element: <App />,
		children: [
			{
				path: '/',
				element: <Home />
			},
			{
				path: 'kisan-bill',
				element: <Kisan />
			},
			{
				path: 'vyapari-bill',
				element: <Vyapari />
			},
			{
				path: 'item-master',
				element: <ItemMaster />
			},
			{
				path: 'party-master',
				element: <PartyMaster />
			},
		],
		// errorElement: <Error />
	}
])

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router}/>
  </React.StrictMode>
);
