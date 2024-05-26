import logo from './logo.svg';
import './App.css';
import { initializeApp } from "firebase/app";

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
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
