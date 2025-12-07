import React, { useState, useEffect } from "react";
import { useWeb3 } from "../../context/Web3Context";
import ErrorAlert from "../../components/ErrorAlert";
import { ethers } from "ethers";

export default function TenantContracts({ setView }) {
  const { account, contract } = useWeb3();
  const [contracts, setContracts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (contract && account) {
      loadContracts();
    }
  }, [contract, account]);

  async function loadContracts() {
    try {
      const ids = await contract.getContractsByTenant(account);
      const list = [];

      for (let id of ids) {
        const data = await contract.getRentContract(id);

        // Solo mostrar si soy el inquilino
        if (data.tenant.toLowerCase() === account.toLowerCase()) {
          list.push({
            id,
            propertyId: data.propertyId,
            landlord: data.landlord,
            tenant: data.tenant,
            monthlyRent: data.monthlyRent,
            monthsPaid: data.monthsPaid,
            totalMonths: data.totalMonths,
            status: data.status,
          });
        }
      }

      setContracts(list);
    } catch (err) {
      console.error(err);
      setError("Error al cargar contratos");
    }
  }

  return (
    <div className="animate-fadeInUp p-4 md:p-6 text-white mt-4 md:mt-10 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">Mis Contratos</h1>

      <div className="mt-6 space-y-8">

        {/* PENDIENTES */}
        <div>
          <h2 className="text-2xl font-bold mb-4 text-yellow-400">Pendientes de Firma</h2>
          {contracts.filter(c => Number(c.status) === 0).length === 0 ? (
            <p className="text-gray-400">No tienes contratos pendientes.</p>
          ) : (
            <div className="space-y-4">
              {contracts.filter(c => Number(c.status) === 0).map((c) => (
                <div
                  key={c.id}
                  className="bg-yellow-900/30 border border-yellow-600/50 p-4 rounded shadow cursor-pointer hover:bg-yellow-900/50 transition-all"
                  onClick={() => setView("contractDetails", { contract: c })}
                >
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-yellow-200">Contrato #{c.id}</h2>
                    <span className="bg-yellow-600 text-white text-xs px-2 py-1 rounded">Requiere Firma</span>
                  </div>
                  <p className="text-gray-300 mt-2">Propiedad: {c.propertyId}</p>
                  <p className="text-gray-300">Renta: {ethers.formatEther(c.monthlyRent)} ETH</p>
                  <p className="text-gray-400 text-sm mt-1">Arrendador: {c.landlord.slice(0, 6)}...{c.landlord.slice(-4)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ACTIVOS E HISTORIAL */}
        <div>
          <h2 className="text-2xl font-bold mb-4 text-green-400">Mis Rentas Activas</h2>
          {contracts.filter(c => Number(c.status) > 0).length === 0 ? (
            <p className="text-gray-400">No tienes rentas activas.</p>
          ) : (
            <div className="space-y-4">
              {contracts.filter(c => Number(c.status) > 0).map((c) => (
                <div
                  key={c.id}
                  className="bg-purple-700/40 p-4 rounded shadow cursor-pointer hover:bg-purple-700/60 transition-all"
                  onClick={() => setView("contractDetails", { contract: c })}
                >
                  <h2 className="text-xl font-semibold">Contrato #{c.id}</h2>
                  <p>Propiedad: {c.propertyId}</p>
                  <p>Renta mensual: {ethers.formatEther(c.monthlyRent)} ETH</p>
                  <p>Pagado: {c.monthsPaid.toString()}/{c.totalMonths.toString()} meses</p>
                  <p>Estado: {Number(c.status) === 1 ? "Activo" : Number(c.status) === 2 ? "Finalizado" : "Cancelado"}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      <ErrorAlert message={error} />
    </div>
  );
}
