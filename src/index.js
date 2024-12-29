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
import Ledger from "./features/ledger/ledger";
import KisanBillSummary from "./features/kisan-bill-summary/kisanBillSummary";
import VyapariVasuliSheet  from "./features/vyapari-vasuli-sheet/Vyapari-Vasuli-Sheet";
import AuctionEntry from "./features/auction-entry/auction-entry";
import VasuliList from "./features/vasuli-list/vasuli-list";


const router = createBrowserRouter([
	{
		path: '/',
		element: <App />,
		children: [
			{
				path: '/',
				element: <Kisan />
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
			{
				path: 'ledger',
				element: <Ledger />
			},
			{
				path: 'kisan-bill-summry',
				element: <KisanBillSummary />
			},
			{
				path: 'vyapari-vasuli-sheet',
				element: <VyapariVasuliSheet />
			},
			{
				path: 'auction-entry',
				element: <AuctionEntry />
			},
			{
				path: 'vasuli-list',
				element: <VasuliList />
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
