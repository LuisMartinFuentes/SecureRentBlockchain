import React, { useState, useEffect } from "react";
import { useWeb3 } from "../../context/Web3Context";
import ErrorAlert from "../../components/ErrorAlert";
import { ethers } from "ethers";
import { useEthPrice } from "../../hooks/useEthPrice";

export default function LandlordPayments() {
    const { account, contract } = useWeb3();
    const { ethPrice } = useEthPrice();
    const [payments, setPayments] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        if (contract && account) {
            loadPayments();
        }
    }, [contract, account]);

    async function loadPayments() {
        try {
            // 1. Obtener mis contratos como landlord
            const myContractsIds = await contract.getContractsByLandlord(account);
            const myContractsIdsStrings = myContractsIds.map(id => id.toString());

            // 2. Obtener TODOS los eventos RentPaid (o filtrar por contrato si son pocos, pero mejor traer todos y filtrar en cliente si no hay index por landlord)
            // El evento es: event RentPaid(uint256 indexed contractId, address indexed tenant, uint256 amount, uint8 monthsPaid);
            // Podemos filtrar por contractId si iteramos, pero es ineficiente si son muchos.
            // Mejor traemos todos los eventos RentPaid y filtramos los que coincidan con mis contratos.
            // NOTA: Si hay muchos eventos globales, esto puede ser lento.
            // Una optimización sería iterar mis contratos y pedir eventos para cada uno.

            let allEvents = [];
            for (let id of myContractsIdsStrings) {
                const filter = contract.filters.RentPaid(id);
                const events = await contract.queryFilter(filter);
                allEvents = [...allEvents, ...events];
            }

            // 3. Mapear
            const list = allEvents.map((e) => ({
                id: e.args[0].toString(),
                tenant: e.args[1],
                amount: e.args[2],
                monthsPaid: e.args[3].toString(),
                txHash: e.transactionHash,
                blockNumber: e.blockNumber
            }));

            // 4. Ordenar por fecha (bloque) descendente
            list.sort((a, b) => b.blockNumber - a.blockNumber);

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
                    <p>No hay cobros registrados.</p>
                ) : (
                    payments.map((p, idx) => {
                        const amountEth = ethers.formatEther(p.amount);
                        const mxnAmount = ethPrice ? (parseFloat(amountEth) * ethPrice).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }) : "Cargando...";
                        return (
                            <div key={idx} className="bg-green-900/30 border border-green-600/50 p-4 rounded shadow flex flex-col md:flex-row justify-between items-center gap-4">
                                <div>
                                    <h2 className="text-xl font-semibold text-green-200">Contrato #{p.id}</h2>
                                    <p className="text-gray-300">Inquilino: {p.tenant.slice(0, 6)}...{p.tenant.slice(-4)}</p>
                                    <p className="text-gray-300">Monto: {mxnAmount} ({amountEth} ETH)</p>
                                    <p className="text-gray-300">Mes cobrado: #{p.monthsPaid}</p>
                                </div>

                                <a
                                    href={`https://sepolia.etherscan.io/tx/${p.txHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded text-sm transition-colors"
                                >
                                    Ver en Etherscan
                                </a>
                            </div>
                        );
                    })
                )}
            </div>

            <ErrorAlert message={error} />
        </div>
    );
}
