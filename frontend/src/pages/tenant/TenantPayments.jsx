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
      const ids = await contract.getContractsByTenant(account);
      const list = [];

      for (let id of ids) {
        const data = await contract.getRentContract(id);

        list.push({
          id,
          monthlyRent: Number(data.monthlyRent),
          monthsPaid: data.monthsPaid,
          totalMonths: data.totalMonths,
          lastPayment: data.monthsPaid > 0 ? "Pagado" : "Sin pagos",
        });
      }

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
          payments.map((p) => (
            <div key={p.id} className="bg-purple-700/40 p-4 rounded shadow">
              <h2 className="text-xl font-semibold">Contrato #{p.id}</h2>



              <p>Renta mensual: {ethers.formatEther(p.monthlyRent)} ETH</p>
              <p>Meses pagados: {p.monthsPaid}/{p.totalMonths}</p>
              <p>Último pago: {p.lastPayment}</p>
            </div>
          ))
        )}
      </div>

      <ErrorAlert message={error} />
    </div>
  );
}
