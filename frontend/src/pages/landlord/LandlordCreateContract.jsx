import React, { useState, useEffect } from "react";
import { useWeb3 } from "../../context/Web3Context";
import ErrorAlert from "../../components/ErrorAlert";
import { ethers } from "ethers";

export default function LandlordCreateContract({ initialData }) {
  const { account, contract } = useWeb3();
  const [properties, setProperties] = useState([]);
  const [tenant, setTenant] = useState("");
  const [rent, setRent] = useState("");
  const [months, setMonths] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (contract && account) {
      loadProperties();
    }

    if (initialData) {
      if (initialData.propertyId) setPropertyId(initialData.propertyId);
      if (initialData.tenant) setTenant(initialData.tenant);
      if (initialData.rent) setRent(initialData.rent);
    }
  }, [contract, account, initialData]);

  async function loadProperties() {
    try {
      const counter = await contract.propertyCounter();
      let list = [];

      for (let i = 1; i <= counter; i++) {
        const p = await contract.getProperty(i);
        if (
          p.owner.toLowerCase() === account.toLowerCase() &&
          p.isAvailable === true
        ) {
          list.push(p);
        }
      }

      setProperties(list);
    } catch (err) {
      console.error(err);
      setError("Error al cargar propiedades");
    }
  }

  async function createContract() {
    if (!contract) {
      setError("Contrato no listo");
      return;
    }

    // Validar dirección
    if (!ethers.isAddress(tenant)) {
      setError("La dirección del arrendatario no es válida");
      return;
    }

    try {
      // Convertir la renta de ETH a Wei
      const rentInWei = ethers.parseEther(rent.toString());

      const tx = await contract.createRentContract(
        propertyId,
        tenant,
        rentInWei,
        months
      );

      await tx.wait();

      setTxHash(tx.hash);
      alert("Contrato creado");
      setTenant("");
      setRent("");
      setMonths("");
      setPropertyId("");
      loadProperties(); // Recargar para actualizar disponibilidad
    } catch (err) {
      console.error(err);
      setError("Error al crear contrato: " + (err.reason || err.message));
    }
  }

  return (
    <div className="p-4 md:p-6 text-white mt-4 md:mt-10 animate-fadeInUp flex flex-col items-center">
      <h2 className="text-4xl font-bold mb-6">Crear Contrato</h2>

      <div className="bg-gray-800 p-5 rounded w-full max-w-lg">
        {/* Propiedad */}
        <label className="block mb-2 font-bold">Propiedad</label>
        <select
          value={propertyId}
          onChange={(e) => setPropertyId(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 mb-4"
        >
          <option value="">Seleccione una propiedad</option>
          {properties.map((p) => {
            const descText = p.description.split(" |IMG| ")[0];
            return (
              <option key={p.id.toString()} value={p.id.toString()}>
                #{p.id.toString()} — {descText}
              </option>
            );
          })}
        </select>

        {/* Tenant */}
        <label className="block mb-2 font-bold">Billetera del Inquilino (Wallet)</label>
        <input
          className="w-full p-2 rounded bg-gray-700 mb-4"
          value={tenant}
          onChange={(e) => setTenant(e.target.value)}
          placeholder="0x..."
        />

        {/* Rent */}
        <label className="block mb-2 font-bold">Renta Mensual (ETH)</label>
        <input
          className="w-full p-2 rounded bg-gray-700 mb-4"
          type="number"
          step="0.0001"
          value={rent}
          onChange={(e) => setRent(e.target.value)}
          placeholder="Ej. 0.05"
        />

        {/* Months */}
        <label className="block mb-2 font-bold">Total de Meses</label>
        <input
          className="w-full p-2 rounded bg-gray-700 mb-4"
          type="number"
          value={months}
          onChange={(e) => setMonths(e.target.value)}
        />

        <button
          onClick={createContract}
          className="w-full bg-purple-500 py-2 rounded hover:bg-purple-600"
        >
          Crear contrato
        </button>

        {txHash && (
          <div className="mt-4 p-3 bg-green-900/50 border border-green-500 rounded text-center">
            <p className="text-green-300 mb-2">¡Transacción Exitosa!</p>
            <a
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline break-all"
            >
              Ver en Etherscan: {txHash}
            </a>
          </div>
        )}
      </div>

      <ErrorAlert message={error} />
    </div>
  );
}
