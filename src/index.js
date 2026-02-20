import { lazy, Suspense, StrictMode } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import App from "./App";

const Ledger = lazy(() => import("./features/ledger/ledger"));
const VasuliList = lazy(() => import("./features/vasuli-list/vasuli-list"));
const DeviceControl = lazy(() => import("./features/device-control/device-control"));
const VyapariVasuliSheet = lazy(() => import("./features/vyapari-vasuli-sheet/Vyapari-Vasuli-Sheet"));
const AuctionEntries = lazy(() => import("./features/auction-entry/auction-entry"));
const Vyapari = lazy(() => import("./features/vyapari-bill/Vyapari-Bill"));
const ItemMaster = lazy(() => import("./features/item-master/Item-Master"));
const PartyMaster = lazy(() => import("./features/party-master/Party-Master"));
const Kisan = lazy(() => import("./features/kisan-bill/Kisan-Bill"));
const KisanBillSummaryComponent = lazy(() =>
  import("./features/kisan-bill-summary/kisanBillSummary")
);

const hostname =
  typeof window !== "undefined" ? window.location.hostname : "";

const isKisanOnly = hostname === "hiskisanbill.make73.com";
const isMainApp = hostname === "mandiapplication.make73.com";
const isLocalhost = hostname.includes("localhost");

let childrenRoutes = [];

if (isKisanOnly) {
  childrenRoutes = [
    { path: "/", element: <Kisan /> }, 
    { path: "kisan-bill", element: <Kisan /> },
    { path: "kisan-bill-summry", element: <KisanBillSummaryComponent /> },
  ];
}

else if (isMainApp) {
  childrenRoutes = [
    { path: "/", element: <Ledger /> },
    { path: "ledger", element: <Ledger /> },
    { path: "vyapari-bill", element: <Vyapari /> },
    { path: "item-master", element: <ItemMaster /> },
    { path: "party-master", element: <PartyMaster /> },
    { path: "vyapari-vasuli-sheet", element: <VyapariVasuliSheet /> },
    { path: "auction-entry", element: <AuctionEntries /> },
    { path: "vasuli-list", element: <VasuliList /> },
    { path: "device-control", element: <DeviceControl /> },
  ];
}

else if (isLocalhost) {
  childrenRoutes = [
    { path: "/", element: <Ledger /> },
    { path: "ledger", element: <Ledger /> },
    { path: "kisan-bill", element: <Kisan /> },
    { path: "kisan-bill-summry", element: <KisanBillSummaryComponent /> },
    { path: "vyapari-bill", element: <Vyapari /> },
    { path: "item-master", element: <ItemMaster /> },
    { path: "party-master", element: <PartyMaster /> },
    { path: "vyapari-vasuli-sheet", element: <VyapariVasuliSheet /> },
    { path: "auction-entry", element: <AuctionEntries /> },
    { path: "vasuli-list", element: <VasuliList /> },
    { path: "device-control", element: <DeviceControl /> },
  ];
}

else {
  childrenRoutes = [{ path: "/", element: <Ledger /> }];
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: childrenRoutes,
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
