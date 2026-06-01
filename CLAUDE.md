# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Mandi Application** is a React-based agricultural market management system built with Create React App. It handles bill management, party/trader ledgers, inventory, and device control for a mandi (agricultural marketplace).

**Tech Stack:**
- React 18.3.1 with React Router v6 for routing
- Material-UI (v5.15) for UI components
- react-hook-form (v7.51) for form management
- Axios (v1.7) for HTTP requests with custom interceptors
- react-to-print (v2.15) for print functionality
- Firebase (v10.12) for backend integration
- dayjs for date handling
- Electron (devDependency) for desktop app potential

## Development Commands

`ash
npm start           # Start development server (http://localhost:3000)
npm run build       # Build for production
npm test            # Run tests in watch mode
npm run eject       # Eject from Create React App (one-way operation)
`

## Architecture & Code Organization

### Directory Structure

`
src/
├── App.js                    # Main app with login gate + layout
├── index.js                  # Router config (11 routes total)
├── constants/config.js       # API URL + date formatting
├── gateway/                  # API layer (11 modules)
├── interceptors/             # Axios request/response interceptors
├── features/                 # 14 feature pages/screens
├── shared/                   # Reusable UI components
└── dialogs/                  # Print dialogs & confirmation modals
`

### Core Architectural Patterns

#### 1. Gateway Layer (API Abstraction)

All backend communication happens via modules in src/gateway/ that wrap axios:

**Pattern:**
- File per feature: {feature-name}-apis.js (e.g., kisan-bill-apis.js)
- Each module exports async functions using shared xiosHttp instance
- Response format: { responseCode, responseMessage, responseBody }
- Error handling: try-catch with logging but no throws (graceful degradation)

**Caching strategy:**
- comman-apis.js and kisan-bill-apis.js implement localStorage caching for lists
- Cache keys: partyList-{partyType}, itemList
- Cache cleared when syncComplete state changes in NavBar

**Key modules:**
- comman-apis.js - Parties, items, auction updates, ledger lists
- kisan-bill-apis.js - Farmer bill operations
- yapari-bill-apis.js - Trader settlement bills
- ledger-apis.js - Transactions, payments (vasuli), bulk notifications
- uction-entries-api.js - Device-based auction entries
- party-master-apis.js - Add/edit parties
- device-control-api.js - Device status CRUD
- asuli-list-api.js - Payment list + WhatsApp notifications

#### 2. Request/Response Interceptor

src/interceptors/error-handling-interceptor.js:
- Creates axios instance with baseURL from REACT_APP_API_URL env var
- **Request interceptor:** Adds hardcoded deviceId: "41" header (should be dynamic)
- **Response interceptor:** Minimal error logging
- All gateway functions use this shared xiosHttp instance

#### 3. Feature Modules

Each feature in src/features/{name}/ is self-contained:

**Structure:**
- Main component: {FeatureName}.js
- Scoped styles: {feature-name}.module.css
- Optional config: JSON files with form fields/table columns (e.g., kisan-bill-fields.json)

**Context access:**
- All features access app state via useOutletContext(): snackbarChange, syncComplete, loading, changeLoading
- Call snackbarChange(data) to display notifications

**14 Features:**
Kisan Bill, Vyapari Bill, Ledger, Item Master, Party Master, Auction Entry, Vasuli List, Vyapari Vasuli Sheet, Kisan Bill Summary, Device Control, Login, NavBar, Home

#### 4. Shared UI Components & Elements

**shared/ui/ components:**
- master-table/ - Primary table: pagination (10-100 rows), inline editing, row selection, date formatting
- 	able/ - Secondary table for transaction history with navigation between record versions
- snackbar/ - Global alert display (integrated into App.js root)
- previous-bill/ - Dialog trigger for bill version history

**shared/elements/:**
- VyapariField.js - Autocomplete for party selection with search by name/idNo, filtered to 10 items

**Table Patterns:**
- Data-driven: columns, keyArray, 	ableData props
- MasterTable supports checkbox selection and inline editing via dialogs
- Edit dialogs use react-hook-form with Controller components
- Special fields excluded from editing via excludeArr array
- Special rendering for dates, navigation arrows, checkboxes, action buttons

#### 5. Dialog Components

Modal dialogs in src/dialogs/:

**Print dialogs** (using eact-to-print with orwardRef):
- KisanBillPrint, VyapariBillPrint, LedgerPrint, PartyPrint, AuctionPrint
- Receive form data + table data as props
- Example: KisanBillPrint restructures nested arrays, aggregates items by name/rate, sorts alphabetically

**Functional dialogs:**
- Confirmation modals with customizable messages and button text
- Previous bills browser with pagination
- Duplicate vasuli detector for transaction warnings

#### 6. Form Management Pattern

All forms use **react-hook-form**:

`javascript
const { handleSubmit, control, getValues, setValue, trigger, watch } = useForm({
  defaultValues: { fieldName: "value" }
});

// Wrap inputs with Controller for react-hook-form integration
<Controller
  name="fieldName"
  control={control}
  rules={{ required: "Error message" }}
  render={({ field }) => <TextField {...field} />}
/>

// Validate before submission
const isValid = await trigger(["fieldName1", "fieldName2"]);
`

**Validation patterns:**
- Required: ules={{ required: "Message" }}
- Conditional: Check partyType before applying rules
- Custom: alidate: (value) => value > 0 || "Error"

#### 7. Routing & App Layout

Routes defined in src/index.js:
- / → Ledger (default)
- /kisan-bill, /vyapari-bill, /ledger
- /item-master, /party-master
- /auction-entry, /vasuli-list, /kisan-bill-summry
- /vyapari-vasuli-sheet, /device-control

**App.js flow:**
1. Check loginStatus state
2. If false: Show Login component
3. If true: Render NavBar + Outlet (with context) + SnackbarGlobal

#### 8. State Management

**App-level (App.js):**
- loginStatus - Boolean gate (password check)
- snackbarData - Global notification state
- loading - Loading indicator with message
- syncComplete - Trigger for cache invalidation

**Feature-level:**
- Each feature manages own state (form data, tables, lists)
- No Redux/Zustand - uses local useState + useOutletContext

#### 9. Environment Configuration

.env file:
`
REACT_APP_API_URL=http://localhost:8080/mandi/
REACT_APP_PASS='6789'
REACT_APP_LAMBDA_API_URL=...  (unused)
`

src/constants/config.js:
- piBaseUrl from env
- Date/time format objects for Asia/Kolkata timezone

#### 10. Typical Data Flow

1. User fills form (react-hook-form controlled inputs)
2. Submit → Gateway function with form data
3. Gateway uses axiosHttp (with deviceId header) to POST/GET/PATCH/PUT
4. Response: { responseCode, responseMessage, responseBody }
5. Success → Store in state, call snackbarChange() for notification
6. Table re-renders
7. Edit row → Dialog opens with edit form
8. Update saves, refreshes data, shows notification

---

## Implementation Details

### Authentication
- Simple password login in eatures/login/login.js
- Checks input against REACT_APP_PASS env var
- Sets loginStatus: false to show app
- No JWT/token management

### Printing
- All print components use orwardRef + react-to-print
- Print styling via .module.css files
- KisanBillPrint: Restructures nested arrays, aggregates, sorts

### Party Types
- Two types: KISAN (farmers), VYAPARI (traders)
- Affects form fields and validation rules
- Party Master: Different field sets per type

### Bulk Operations
- Ledger: Mark all vyaparis' transactions as validated
- Kisan Bill: Save all bills at once
- Vasuli: Send WhatsApp notifications

---

## Common Development Tasks

### Add a New Feature Page
1. Create src/features/{feature-name}/
2. Files: {FeatureName}.js, {feature-name}.module.css
3. Create src/gateway/{feature-name}-apis.js if needed
4. Add route in src/index.js
5. Add nav menu in src/features/navbar/Nav-Bar.js
6. Access context: const { snackbarChange, syncComplete, loading, changeLoading } = useOutletContext();

### Add API Endpoints
1. Create/update src/gateway/{feature}-apis.js
2. Export async functions using xiosHttp from interceptor
3. Return esponse.data
4. Handle errors with try-catch
5. Consider localStorage caching for lookup data

### Add Table Columns
1. Update feature's columns and keyArray arrays
2. For special rendering: Add case in table component's switch statement
3. Non-editable fields: Add to excludeArr

### Add Form Fields
1. Define in useForm({ defaultValues: {...} })
2. Wrap with Controller + ules
3. Use 	rigger() to validate before submission
4. Party selection: Use custom VyapariField component

### Invalidate Cache
- NavBar sync button changes syncComplete state
- Features listen via useEffect(() => { ... }, [syncComplete])
- Fetches fresh data instead of localStorage

---

## Known Gaps & Future Improvements

- **deviceId hardcoded** as "41" in interceptor - should be dynamic
- **Error handling minimal** - doesn't distinguish error types
- **No TypeScript** - pure JavaScript codebase
- **No unit tests** - consider adding for gateway functions
- **State management** - no Redux/Zustand; may need for larger scope
- **Accessibility** - tables/dialogs lack ARIA labels
- **Firebase** - imported but unused; may be planned

---

## Codebase Patterns

- **Response destructuring:** Code assumes esponse.data.responseBody contains actual data
- **Error silencing:** Gateway functions console.error but don't throw
- **Dialog refs:** Print dialogs use useRef for react-to-print
- **Table pagination:** Default 100 per page; controlled in MasterTable footer
- **Date handling:** ISO strings (YYYY-MM-DD) for forms; formatted on display
- **Quantity tracking:** Bag-wise quantity arrays for detailed bill tracking
