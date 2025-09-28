import { lazy, Suspense, StrictMode } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import App from "./App";

import Ledger from "./features/ledger/ledger";

import VasuliList from "./features/vasuli-list/vasuli-list";
import DeviceControl from "./features/device-control/device-control";
import VyapariVasuliSheet from "./features/vyapari-vasuli-sheet/Vyapari-Vasuli-Sheet";
import AuctionEntries from "./features/auction-entry/auction-entry";
import Vyapari from "./features/vyapari-bill/Vyapari-Bill";
import ItemMaster from "./features/item-master/Item-Master";
import PartyMaster from "./features/party-master/Party-Master";
import Kisan from "./features/kisan-bill/Kisan-Bill";
import KisanBillSummaryComponent from "./features/kisan-bill-summary/kisanBillSummary";

// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker
//       .register(`${process.env.PUBLIC_URL}/service-worker.js`)
//       .then((registration) => {
//         console.log("ServiceWorker registered: ", registration);
//       })
//       .catch((error) => {
//         console.log("ServiceWorker registration failed: ", error);
//       });
//   });
// }

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Ledger />,
      },
      {
        path: "kisan-bill",
        element: <Kisan />,
      },
      {
        path: "vyapari-bill",
        element: <Vyapari />,
      },
      {
        path: "item-master",
        element: <ItemMaster />,
      },
      {
        path: "party-master",
        element: <PartyMaster />,
      },
      {
        path: "ledger",
        element: <Ledger />,
      },
      {
        path: "kisan-bill-summry",
        element: <KisanBillSummaryComponent />,
      },
      {
        path: "vyapari-vasuli-sheet",
        element: <VyapariVasuliSheet />,
      },
      {
        path: "auction-entry",
        element: <AuctionEntries />,
      },
      {
        path: "vasuli-list",
        element: <VasuliList />,
      },
      {
        path: "device-control",
        element: <DeviceControl />,
      },
    ],
    // errorElement: <Error />
  },
]);

const Loading = () => <div>Loading...</div>;

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <Suspense fallback={<Loading />}>
      <RouterProvider router={router} />
    </Suspense>
  </StrictMode>
);
