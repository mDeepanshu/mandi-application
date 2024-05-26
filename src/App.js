import logo from './logo.svg';
import './App.css';
import { initializeApp } from "firebase/app";
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from "./features/home/Home";
import Kisan from "./features/kisan-bill/Kisan-Bill";
import Vyapari from "./features/vyapari-bill/Vyapari-Bill";


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
    <Router>
      <div>
        <nav>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/kisan-bill">Kisan Bill</Link></li>
            <li><Link to="/vyapari-bill">Vyapari Bill</Link></li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/kisan-bill" element={<Kisan />} />
          <Route path="/vyapari-bill" element={<Vyapari />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
