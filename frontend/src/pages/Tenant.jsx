import React, { useState } from "react";
import * as THREE from "three";
import { ethers } from "ethers";
import { contractAddress, contractABI } from "../utils/contractConfig";
import ContractList from "../components/ContractList";
import ErrorAlert from "../components/ErrorAlert"; 
import MetaMaskFox3D from "../components/MetaMaskFox3D";

THREE.Cache.enabled = true;

export default function Tenant() {
  const [account, setAccount] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [error, setError] = useState("");

  async function connectWallet() {
    try {
      if (!window.ethereum) throw new Error("MetaMask no está instalado");
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
      setError(""); // limpia errores previos
      fetchContracts(); // carga contratos una vez conectada la wallet
    } catch (err) {
      console.error("Error al conectar MetaMask:", err);
      setError(err.message || "No se pudo conectar a MetaMask");
    }
  }

  async function fetchContracts() {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, contractABI, provider);
      const list = await contract.getAllContracts();
      setContracts(list);
      setError(""); // limpia errores si todo salió bien
    } catch (err) {
      console.error("Error al obtener contratos:", err);
      setError("No se pudieron cargar los contratos");
    }
  }

  async function signContract(id) {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      const tx = await contract.signContract(id);
      await tx.wait();
      alert("🖋️ Contrato firmado correctamente");
      fetchContracts();
      setError(""); // limpia errores anteriores
    } catch (err) {
      console.error("Error al firmar contrato:", err);
      setError(err.message || "Error al firmar contrato");
    }
  }

  return (
    <div className="select-none cursor-default p-6 flex flex-col items-center justify-center text-center">
      <h2 className="select-none cursor-default text-2xl font-semibold mb-4">
        Panel del Arrendatario
      </h2>

      {!account ? (
         <>
          <MetaMaskFox3D onClick={connectWallet} className="-mt-25 metamask-logo-float" />

          <button
            onClick={connectWallet}
            className=" select-none cursor-default mt-8 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded transform hover:scale-110 
            transition-all duration-300"
          >
            Conectar MetaMask
          </button>
        </>

      ) : (
        <ContractList contracts={contracts} signContract={signContract} />
      )}

    <ErrorAlert message={error} />
    </div>
  );
}
