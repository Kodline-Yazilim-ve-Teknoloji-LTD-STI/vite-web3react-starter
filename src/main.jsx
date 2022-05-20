import React from "react";
import ReactDOM from "react-dom/client";
import { AuthProvider } from "./context";
import App from "./App";
import "./index.css";
import { Web3ReactProvider } from "@web3-react/core";
import { getLibrary } from "./utils/connectors";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <Web3ReactProvider getLibrary={getLibrary}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Web3ReactProvider>
  </React.StrictMode>
);
