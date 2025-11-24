import React, { useState, useEffect } from "react";
import { useWeb3 } from "../../context/Web3Context";
import ErrorAlert from "../../components/ErrorAlert";
import { ethers } from "ethers";

export default function LandlordPayments() {
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
            const ids = await contract.getContractsByLandlord(account);
            const list = [];

            for (let id of ids) {
                const data = await contract.getRentContract(id);

                list.push({
                    id,
                    tenant: data.tenant,
                    monthlyRent: Number(data.monthlyRent),
                    monthsPaid: data.monthsPaid,
                    totalMonths: data.totalMonths,
                    lastPayment: data.monthsPaid > 0 ? "Pagado" : "Sin pagos",
                });
            }

            setPayments(list);
        } catch (err) {
            console.error(err);
            setError("Error al cargar historial de cobros");
        }
    }

    return (
        <div className="animate-fadeInUp p-4 md:p-6 text-white mt-4 md:mt-10 max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-6">Historial de Cobros (Ingresos)</h1>

            <div className="mt-6 space-y-4">
                {payments.length === 0 ? (
                    <p>No hay contratos con cobros registrados.</p>
                ) : (
                    payments.map((p) => (
                        <div key={p.id} className="bg-green-900/30 border border-green-600/50 p-4 rounded shadow">
                            <h2 className="text-xl font-semibold text-green-200">Contrato #{p.id}</h2>
                            <p className="text-gray-300">Inquilino: {p.tenant.slice(0, 6)}...{p.tenant.slice(-4)}</p>
                            <p className="text-gray-300">Renta mensual: {ethers.formatEther(p.monthlyRent)} ETH</p>
                            <p className="text-gray-300">Meses cobrados: {p.monthsPaid}/{p.totalMonths}</p>
                            <p className="text-gray-400 text-sm">Estado de pagos: {p.lastPayment}</p>
                        </div>
                    ))
                )}
            </div>

            <ErrorAlert message={error} />
        </div>
    );
}
