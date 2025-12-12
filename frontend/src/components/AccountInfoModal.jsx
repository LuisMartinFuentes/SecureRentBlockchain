import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "../context/Web3Context";

export default function AccountInfoModal({ isOpen, onClose }) {
    const { account, provider, contract } = useWeb3();
    const [balance, setBalance] = useState("0");
    const [propertyCount, setPropertyCount] = useState(0);
    const [landlordContracts, setLandlordContracts] = useState(0);
    const [tenantContracts, setTenantContracts] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && account && provider && contract) {
            loadData();
        }
    }, [isOpen, account, provider, contract]);

    async function loadData() {
        setLoading(true);
        try {
            // 1. Balance
            const bal = await provider.getBalance(account);
            setBalance(ethers.formatEther(bal));

            // 2. Propiedades (Iterar para contar las propias)
            const totalProps = await contract.propertyCounter();
            let myProps = 0;
            for (let i = 1; i <= Number(totalProps); i++) {
                const p = await contract.getProperty(i);
                if (p.owner.toLowerCase() === account.toLowerCase()) {
                    myProps++;
                }
            }
            setPropertyCount(myProps);

            // 3. Contratos como Arrendador
            const lContracts = await contract.getContractsByLandlord(account);
            setLandlordContracts(lContracts.length);

            // 4. Contratos como Arrendatario
            const tContracts = await contract.getContractsByTenant(account);
            setTenantContracts(tContracts.length);

        } catch (err) {
            console.error("Error cargando info de cuenta:", err);
        } finally {
            setLoading(false);
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn">
            <div className="bg-gray-800/95 backdrop-blur-xl text-white p-6 rounded-2xl shadow-2xl w-full max-w-md relative border border-gray-600">

                {/* Botón Cerrar */}
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-400 hover:text-white text-2xl font-bold"
                >
                    &times;
                </button>

                <h2 className="text-2xl font-bold mb-6 text-center text-purple-400">
                    Información de la Cuenta
                </h2>

                {loading ? (
                    <div className="text-center py-8 text-gray-300">Cargando datos...</div>
                ) : (
                    <div className="space-y-4">

                        <div className="bg-gray-700 p-3 rounded border border-gray-600">
                            <p className="text-sm text-gray-400">Cuenta</p>
                            <p className="font-mono font-bold text-sm break-all text-gray-200">{account}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-purple-900/30 p-3 rounded text-center border border-purple-500/30">
                                <p className="text-2xl font-bold text-purple-400">{parseFloat(balance).toFixed(4)}</p>
                                <p className="text-xs text-gray-400">ETH Saldo</p>
                            </div>

                            <div className="bg-blue-900/30 p-3 rounded text-center border border-blue-500/30">
                                <p className="text-2xl font-bold text-blue-400">{propertyCount}</p>
                                <p className="text-xs text-gray-400">Propiedades</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-green-900/30 p-3 rounded text-center border border-green-500/30">
                                <p className="text-2xl font-bold text-green-400">{landlordContracts}</p>
                                <p className="text-xs text-gray-400">Contratos (Arrendador)</p>
                            </div>

                            <div className="bg-orange-900/30 p-3 rounded text-center border border-orange-500/30">
                                <p className="text-2xl font-bold text-orange-400">{tenantContracts}</p>
                                <p className="text-xs text-gray-400">Contratos (Inquilino)</p>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}
