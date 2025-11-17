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

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      setAccount(accounts[0]);
      fetchContracts(); 
      setError("");

    } catch (err) {
      console.error("Error al conectar MetaMask:", err);

      if (err.code === 4001 || err.message.includes("User rejected")) {
        setError("Se debe iniciar sesión en MetaMask para continuar.");
        setTimeout(() => setError(""), 4000);
      } else if (err.message.includes("MetaMask")) {
        setError("MetaMask no está instalado en este navegador.");
        setTimeout(() => setError(""), 4000);
      } else {
        setError(err.message || "No se pudo conectar a MetaMask.");
        setTimeout(() => setError(""), 4000);
      }
    }
  }


  async function fetchContracts() {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, contractABI, provider);

      const list = await contract.getAllContracts();
      setContracts(list);
      setError("");
    } catch (err) {
      console.error("Error al obtener contratos:", err);
      setError("No se pudieron cargar los contratos");
      setTimeout(() => setError(""), 4000);
    }
  }


async function signContract(id) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, contractABI, signer);

    const tx = await contract.signContract(id);
    await tx.wait();

    alert("Contrato firmado correctamente");

    fetchContracts(); 
    setError("");

  } catch (err) {
    console.error("Error al firmar contrato:", err);

    if (err.code === 4001 || err.message?.toLowerCase().includes("rejected")) {
      setError("Firma cancelada. No se realizó ninguna acción.");
      setTimeout(() => setError(""), 4000);
      return;
    }

    setError(err.reason || err.message || "Ocurrió un error al firmar el contrato");
  }
}


  return (
    <div className="animate-fadeInUp select-none cursor-default p-6 flex flex-col items-center justify-center text-center mt-12">
      <h2 className="select-none cursor-default text-5xl font-semibold -mt-1">
        Panel del Arrendatario
      </h2>

      {!account ? (
        <>
          <MetaMaskFox3D onClick={connectWallet} className="-mt-15 metamask-logo-float" />

          <button
            onClick={connectWallet}
            className="select-none cursor-default mt-8 bg-green-500 hover:bg-green-600 text-white py-2 px-12 text-xl
            rounded transform hover:scale-110 transition-all duration-300"
          >
            Conectar MetaMask
          </button>
        </>
      ) : (

        <ContractList
          contracts={contracts}
          signContract={signContract}
          account={account} 
        />
      )}

      <ErrorAlert message={error} />
    </div>
  );
}
