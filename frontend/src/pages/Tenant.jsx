import React, { useState } from "react";
import { ethers } from "ethers";
import { contractAddress, contractABI } from "../utils/contractConfig";
import ContractList from "../components/ContractList";
import ContractDetails from "../components/ContractDetails";
import ErrorAlert from "../components/ErrorAlert";
import MetaMaskFox3D from "../components/MetaMaskFox3D";

export default function Tenant() {
  const [account, setAccount] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [detailsContract, setDetailsContract] = useState(null);
  const [error, setError] = useState("");

  async function connectWallet() {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      setAccount(accounts[0]);
      fetchContracts();
    } catch (error) {
      console.error(error);
      setError("Debes iniciar sesión en MetaMask");
      setTimeout(() => setError(""), 4000);
    }
  }

  async function fetchContracts() {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, contractABI, provider);

      const list = await contract.getAllContracts();
      setContracts(list);
    } catch (error) {
      console.error(error);
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

      alert("Contrato firmado correctamente");
      fetchContracts();
      setDetailsContract(null);

      } catch (err) {
      console.error("Error al firmar contrato:", err);

      if (err.code === 4001 || err.message.includes("User denied") || err.message.includes("rejected")) {
        setError("Transacción cancelada por el usuario");
        return;
      }

      setError(err.reason || err.message || "Error al firmar contrato");
  }
  }

  return (
    <div className="animate-fadeInUp p-6 flex flex-col items-center mt-12 text-white">
      <h2 className="text-5xl font-semibold">Panel del Arrendatario</h2>

      {!account ? (
        <>
          <MetaMaskFox3D onClick={connectWallet} />
          <button
            onClick={connectWallet}
            className="bg-green-500 hover:bg-green-600 text-white py-2 px-12 text-xl rounded mt-6"
          >
            Conectar MetaMask
          </button>
        </>
      ) : (
        <>
          <ContractList
            contracts={contracts}
            openDetails={(c) => setDetailsContract(c)}
          />

          {/* MODAL DE DETALLES */}
          {detailsContract && (
            <ContractDetails
              contract={detailsContract}
              account={account}
              close={() => setDetailsContract(null)}
              sign={signContract}
            />
          )}
        </>
      )}

      <ErrorAlert message={error} />
    </div>
  );
}
