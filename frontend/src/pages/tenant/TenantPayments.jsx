import React, { useState, useEffect } from "react";
import { useWeb3 } from "../../context/Web3Context";
import ErrorAlert from "../../components/ErrorAlert";
import { ethers } from "ethers";

export default function TenantPayments() {
  const { account, contract } = useWeb3();
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (contract && account) {
      loadPayments();
    }
  }, [contract, account]);

  async function loadPayments() {
    try {
      // Filtrar eventos RentPaid donde el tenant sea el usuario actual
      const filter = contract.filters.RentPaid(null, account);
      const events = await contract.queryFilter(filter);

      // Mapear eventos a objetos legibles
      const list = events.map((e) => ({
        id: e.args[0].toString(), // contractId
        amount: e.args[2], // amount
        monthsPaid: e.args[3].toString(), // monthsPaid
        txHash: e.transactionHash,
        blockNumber: e.blockNumber
      }));

      // Ordenar por bloque (más reciente primero)
      list.sort((a, b) => b.blockNumber - a.blockNumber);

      setPayments(list);
    } catch (err) {
      console.error(err);
      setError("Error al cargar pagos");
    }
  }

  return (
    <div className="animate-fadeInUp p-4 md:p-6 text-white mt-4 md:mt-10 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">Historial de Pagos</h1>

      <div className="mt-6 space-y-4">
        {payments.length === 0 ? (
          <p>No hay pagos registrados.</p>
        ) : (
          payments.map((p, idx) => (
            <div key={idx} className="bg-purple-700/40 p-4 rounded shadow flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h2 className="text-xl font-semibold">Contrato #{p.id}</h2>
                <p className="text-gray-300">Monto: {ethers.formatEther(p.amount)} ETH</p>
                <p className="text-gray-300">Mes pagado: #{p.monthsPaid}</p>
              </div>

              <a
                href={`https://sepolia.etherscan.io/tx/${p.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition-colors"
              >
                Ver en Etherscan ↗
              </a>
            </div>
          ))
        )}
      </div>

      <ErrorAlert message={error} />
    </div>
  );
}
