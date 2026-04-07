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
//Crate Components
const CrateFirstEntry = lazy(() => import("./features/crate_Module/crate-first-entry/crate-first-entry"));
const CrateLedger = lazy(() => import("./features/crate_Module/crate-ledger/crate-ledger"));
const CrateMaster = lazy(() => import("./features/crate_Module/crate-master/crate-master"));
const CrateStockReport = lazy(() => import("./features/crate_Module/crate-stock-report/crate-stock-report"));
const CrateVasuliSheet = lazy(() => import("./features/crate_Module/crate-vasuli-sheet/crate-vasuli-sheet"));
const PendingCrate = lazy(() => import("./features/crate_Module/pending-crate/pending-crate"));
const CrateReturnEntry = lazy(() => import("./features/crate_Module/crate-return-entry/crate-return-entry"));
//

const hostname =
  typeof window !== "undefined" ? window.location.hostname : "";

const isKisanOnly = hostname.includes("hiskisanbill");
const isMainApp = hostname.includes("mandiapplication");
const isCrateModule = hostname.includes("crate") || true;
const isLocalhost = hostname.includes("localhost") || false;
const isVercelPreview = hostname.includes("vercel.app") || false;

let childrenRoutes = [];
let variant = "main-app";

if (isKisanOnly) {
  childrenRoutes = [
    { path: "/", element: <Kisan /> },
    { path: "kisan-bill-summry", element: <KisanBillSummaryComponent /> },
  ];
  variant = "kisan-only";
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
  variant = "main-app";
}

else if (isCrateModule) {
  
  childrenRoutes = [
    { path: "/", element: <CrateFirstEntry /> },
    { path: "pending-crate", element: <PendingCrate /> },
    { path: "crate-ledger", element: <CrateLedger /> },
    { path: "crate-return-entry", element: <CrateReturnEntry /> },
    { path: "crate-master", element: <CrateMaster /> },
    { path: "crate-stock-report", element: <CrateStockReport /> },
    { path: "crate-vasuli-sheet", element: <CrateVasuliSheet /> },
  ];
  variant = "crate-app";
}

else if (isLocalhost || isVercelPreview) {
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
  variant = "local";
}

else {
  childrenRoutes = [{ path: "/", element: <Ledger /> }];
  variant = "main-app";
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <App variant={"crate-app"} />,
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
