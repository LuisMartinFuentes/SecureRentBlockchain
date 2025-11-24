import React, { useState, useEffect } from "react";
import * as THREE from "three";
import { ethers } from "ethers";
import { contractAddress, contractABI } from "../utils/contractConfig";
import CreateContractForm from "../components/CreateContractForm";
import ErrorAlert from "../components/ErrorAlert";
import MetaMaskFox3D from "../components/MetaMaskFox3D";
import LandlordContractList from "../components/LandlordContractList";

THREE.Cache.enabled = true;

export default function Landlord() {
  const [account, setAccount] = useState(null);
  const [property, setProperty] = useState("");
  const [rent, setRent] = useState("");
  const [error, setError] = useState("");
  const [myContracts, setMyContracts] = useState([]);

  // Cargar mis contratos cuando ya existe "account"
  useEffect(() => {
    if (account) fetchMyContracts();
  }, [account]);

  // Conectar MetaMask
  async function connectWallet() {
    try {
      if (!window.ethereum)
        throw new Error("MetaMask no está instalado");

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      setAccount(accounts[0]);
      setError("");

    } catch (err) {
      console.error("Error al conectar MetaMask:", err);

      if (err.code === 4001 || err.message?.includes("rejected")) {
        setError("Se debe iniciar sesión en MetaMask para continuar.");
      } else {
        setError(err.message || "No se pudo conectar a MetaMask.");
      }

      setTimeout(() => setError(""), 4000);
    }
  }

  // Obtener contratos creados por este arrendador
  async function fetchMyContracts() {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, contractABI, provider);

      const all = await contract.getAllContracts();

      const mine = all.filter(
        (c) => c.landlord.toLowerCase() === account.toLowerCase()
      );

      setMyContracts(mine);

    } catch (err) {
      console.error("Error al obtener contratos:", err);
      setError("No se pudieron cargar tus contratos.");
      setTimeout(() => setError(""), 4000);
    }
  }

  // Crear nuevo contrato
  async function createContract() {
    try {
      if (!property.trim() || !rent.trim()) {
        setError("Se deben llenar todos los campos antes de crear el contrato.");
        setTimeout(() => setError(""), 4000);
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      const tx = await contract.createContract(property, ethers.parseEther(rent));
      await tx.wait();

      alert("Contrato creado correctamente");

      setProperty("");
      setRent("");

      //Recargar la lista después de crear
      fetchMyContracts();

    } catch (err) {
      console.error("Error en createContract:", err);

      if (err.code === 4001 || err.message?.includes("rejected")) {
        setError("El usuario canceló la transacción.");
      } else {
        setError(err.message || "Error al crear el contrato.");
      }

      setTimeout(() => setError(""), 4000);
    }
  }

  return (
    <div className="animate-fadeInUp select-none cursor-default p-6 flex flex-col items-center justify-center text-center mt-12">
      
      <h2 className="text-5xl font-semibold -mt-1">
        Panel del Arrendador
      </h2>

      {/* -------- NO CONECTADO -------- */}
      {!account ? (
        <>
          <MetaMaskFox3D onClick={connectWallet} className="-mt-15 metamask-logo-float" />

          <button
            onClick={connectWallet}
            className="mt-8 bg-green-500 hover:bg-green-600 text-white text-xl py-2 px-12
                       rounded transform hover:scale-110 transition-all duration-300"
          >
            Conectar MetaMask
          </button>
        </>
      ) : (
        <>
          {/* -------- FORMULARIO PARA CREAR CONTRATO -------- */}
          <CreateContractForm
            property={property}
            setProperty={setProperty}
            rent={rent}
            setRent={setRent}
            onSubmit={createContract}
          />

          {/* -------- LISTA DE CONTRATOS -------- */}
          <LandlordContractList contracts={myContracts} />
        </>
      )}

      <ErrorAlert message={error} />
    </div>
  );
}
