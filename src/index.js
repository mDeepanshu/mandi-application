import { lazy, Suspense, StrictMode } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import App from "./App";

import Ledger from "./features/ledger/ledger";

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


const VasuliList = lazy(() => import("./features/vasuli-list/vasuli-list"));
const DeviceControl = lazy(() => import("./features/device-control/device-control"));
const VyapariVasuliSheet = lazy(() => import("./features/vyapari-vasuli-sheet/Vyapari-Vasuli-Sheet"));
const AuctionEntries = lazy(() => import("./features/auction-entry/auction-entry"));
const Vyapari = lazy(() => import("./features/vyapari-bill/Vyapari-Bill"));
const ItemMaster = lazy(() => import("./features/item-master/Item-Master"));
const PartyMaster = lazy(() => import("./features/party-master/Party-Master"));
const Kisan = lazy(() => import("./features/kisan-bill/Kisan-Bill"));
const KisanBillSummaryComponent = lazy(() => import("./features/kisan-bill-summary/kisanBillSummary"));


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
