import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/index.css";
import { Web3Provider } from "./context/Web3Context";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Web3Provider>
    <App />
  </Web3Provider>
);
