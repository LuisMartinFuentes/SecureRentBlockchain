import React, { useState } from "react";
import * as THREE from "three";
import { ethers } from "ethers";
import { contractAddress, contractABI } from "../utils/contractConfig";
import CreateContractForm from "../components/CreateContractForm";
import ErrorAlert from "../components/ErrorAlert";
import MetaMaskFox3D from "../components/MetaMaskFox3D";

THREE.Cache.enabled = true;

export default function Landlord() {
  const [account, setAccount] = useState(null);
  const [property, setProperty] = useState("");
  const [rent, setRent] = useState("");
  const [error, setError] = useState("");

// Conexión con MetaMask
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

    // Si el usuario canceló el inicio de sesión
    if (err.code === 4001 || err.message.includes("User rejected")) {
      setError("Se debe iniciar sesión en MetaMask para continuar.");
      setTimeout(() => setError(""), 4000);
    } 
    // Si MetaMask no está instalado
    else if (err.message.includes("MetaMask")) {
      setError("MetaMask no está instalado en este navegador.");
      setTimeout(() => setError(""), 4000);
    } 
    // Cualquier otro error
    else {
      setError(err.message || "No se pudo conectar a MetaMask.");
      setTimeout(() => setError(""), 4000);
    }
  }
}

  //Creacion de contrato con Blockchain 
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
    } catch (error) {
      console.error("Error en createContract:", error);
      setError(error.message || "Error al crear contrato");
    }
  }

  return (
    <div className="animate-fadeInUp select-none cursor-default p-6 flex flex-col items-center justify-center text-center mt-12">
      <h2 className="select-none cursor-default text-5xl font-semibold -mt-1"
      >Panel del Arrendador</h2>

      {!account ? (
         <>
          <MetaMaskFox3D onClick={connectWallet} className="-mt-15 metamask-logo-float" />

          <button
            onClick={connectWallet}
            className="select-none cursor-default mt-8 bg-green-500 hover:bg-green-600 text-white text-xl py-2 px-12
            rounded transform hover:scale-110 transition-all duration-300"
          >
            Conectar MetaMask
          </button>
        </>
      ) : (
        <CreateContractForm
          property={property}
          setProperty={setProperty}
          rent={rent}
          setRent={setRent}
          onSubmit={createContract}
        />
      )}
     <ErrorAlert message={error} />
    </div>
  );
}
