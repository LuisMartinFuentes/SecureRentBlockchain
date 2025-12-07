import React, { useState } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "../../context/Web3Context";
import ErrorAlert from "../../components/ErrorAlert";

export default function ContractDetails({ contractData, setView }) {
    const { contract, account } = useWeb3();
    const [loading, setLoading] = useState(false);
    const [txHash, setTxHash] = useState("");
    const [creationTxHash, setCreationTxHash] = useState("");
    const [error, setError] = useState("");

    // Cargar hash de creación del contrato
    React.useEffect(() => {
        if (contract && contractData) {
            getCreationTx();
        }
    }, [contract, contractData]);

    async function getCreationTx() {
        try {
            const filter = contract.filters.ContractCreated(contractData.id);
            const events = await contract.queryFilter(filter);
            if (events.length > 0) {
                setCreationTxHash(events[0].transactionHash);
            }
        } catch (err) {
            console.error("Error buscando tx de creación", err);
        }
    }

    if (!contractData) return <div className="text-white text-center mt-10">No se seleccionó ningún contrato.</div>;

    const isLandlord = account && contractData.landlord && contractData.landlord.toLowerCase() === account.toLowerCase();
    const statusMap = ["Pendiente de Firma", "Activo", "Finalizado", "Cancelado"];
    const statusColor = ["text-yellow-400", "text-green-400", "text-blue-400", "text-red-400"];

    async function signContract() {
        try {
            setLoading(true);
            const tx = await contract.signRentContract(contractData.id);
            await tx.wait();
            setTxHash(tx.hash);
            alert("¡Contrato firmado exitosamente! Ahora está ACTIVO.");
            // setView("tenantContracts"); // No regresar para mostrar el link
        } catch (err) {
            console.error(err);
            setError("Error al firmar el contrato.");
        } finally {
            setLoading(false);
        }
    }

    async function payRent() {
        try {
            setLoading(true);
            // El valor debe enviarse en wei
            const tx = await contract.payMonthlyRent(contractData.id, {
                value: contractData.monthlyRent.toString()
            });
            await tx.wait();
            setTxHash(tx.hash);
            alert("¡Renta pagada exitosamente!");
            // setView("tenantPayments"); // No regresar para mostrar el link
        } catch (err) {
            console.error(err);
            setError("Error al pagar la renta.");
        } finally {
            setLoading(false);
        }
    }

    async function cancelContract() {
        if (!confirm("¿Estás seguro de que deseas cancelar este contrato? Esta acción no se puede deshacer.")) return;
        try {
            setLoading(true);
            const tx = await contract.cancelContract(contractData.id);
            await tx.wait();
            setTxHash(tx.hash);
            alert("¡Contrato cancelado exitosamente!");
            // setView("landlordContracts"); // No regresar para mostrar el link
        } catch (err) {
            console.error(err);
            setError("Error al cancelar el contrato.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="animate-fadeInUp p-4 md:p-8 max-w-4xl mx-auto text-white">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
                <button onClick={() => setView(isLandlord ? "landlordContracts" : "tenantContracts")} className="text-purple-300 hover:text-white">
                    &larr; Volver
                </button>
                <div className="text-right">
                    <h1 className="text-3xl font-bold">Contrato #{contractData.id.toString()}</h1>
                    {creationTxHash && (
                        <a
                            href={`https://sepolia.etherscan.io/tx/${creationTxHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-400 hover:text-blue-300 underline"
                        >
                            Ver en Etherscan
                        </a>
                    )}
                </div>
            </div>

            {/* DOCUMENTO VISUAL */}
            <div className="bg-gray-800 text-white p-8 rounded-lg shadow-2xl relative overflow-hidden border border-gray-700">

                {/* Marca de agua o Badge */}
                <div className="absolute top-4 right-4 opacity-10 pointer-events-none">
                    <img src="/logo.png" alt="Watermark" className="w-32 h-32" />
                </div>

                <h2 className="text-2xl font-serif font-bold text-center mb-8 border-b-2 border-gray-600 pb-4 text-purple-300">
                    CONTRATO DE ARRENDAMIENTO
                </h2>

                <div className="space-y-6 font-serif text-lg leading-relaxed text-gray-300">
                    <p>
                        Este contrato se celebra entre el Arrendador <strong className="text-white">{contractData.landlord}</strong> y
                        el Arrendatario <strong className="text-white">{contractData.tenant}</strong>.
                    </p>

                    <p>
                        <strong className="text-purple-400">Propiedad ID:</strong> {contractData.propertyId.toString()} <br />
                        <strong className="text-purple-400">Renta Mensual:</strong> {ethers.formatEther(contractData.monthlyRent)} ETH <br />
                        <strong className="text-purple-400">Duración:</strong> {contractData.totalMonths.toString()} meses <br />
                        <strong className="text-purple-400">Estado Actual:</strong> <span className={`font-bold ${Number(contractData.status) === 0 ? "text-yellow-400" : Number(contractData.status) === 1 ? "text-green-400" : "text-gray-400"}`}>
                            {statusMap[Number(contractData.status)]}
                        </span>
                    </p>

                    <div className="bg-gray-900/50 p-4 rounded border border-gray-600 text-sm">
                        <h3 className="font-bold mb-2 text-gray-200">Términos y Condiciones (Blockchain Verified)</h3>
                        <p className="text-gray-400">
                            1. El pago de la renta se realizará a través de este contrato inteligente.<br />
                            2. La firma de este contrato es digital e inmutable en la blockchain de Ethereum.<br />
                            3. El incumplimiento de pago quedará registrado en el historial público del contrato.
                        </p>
                    </div>
                </div>

                {/* FIRMAS */}
                <div className="mt-12 grid grid-cols-2 gap-8 text-center font-serif">
                    <div>
                        <div className="border-t border-gray-500 pt-2 text-gray-400">Firma del Arrendador</div>
                        <div className="text-xs text-gray-500 mt-1 truncate px-4">{contractData.landlord}</div>
                        <div className="text-green-500 font-bold mt-1 font-sans text-xs">✓ CREADO Y APROBADO</div>
                    </div>
                    <div>
                        <div className="border-t border-gray-500 pt-2 text-gray-400">Firma del Arrendatario</div>
                        <div className="text-xs text-gray-500 mt-1 truncate px-4">{contractData.tenant}</div>
                        {Number(contractData.status) > 0 ? (
                            <div className="text-green-500 font-bold mt-1 font-sans text-xs">✓ FIRMADO DIGITALMENTE</div>
                        ) : (
                            <div className="text-yellow-500 font-bold mt-1 font-sans text-xs">PENDIENTE DE FIRMA</div>
                        )}
                    </div>
                </div>
            </div>

            {/* ACCIONES */}
            <div className="mt-8 flex justify-center gap-4 flex-wrap">
                {/* Botón Firmar (Solo Inquilino) */}
                {Number(contractData.status) === 0 && (
                    !isLandlord && contractData.tenant.toLowerCase() === account.toLowerCase() ? (
                        <button
                            onClick={signContract}
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl text-xl font-bold shadow-lg transform hover:scale-105 transition-all"
                        >
                            {loading ? "Firmando..." : "Firmar Contrato"}
                        </button>
                    ) : (
                        !isLandlord && (
                            <div className="text-yellow-400 font-bold text-lg bg-yellow-900/30 px-6 py-3 rounded-xl border border-yellow-600/50">
                                Esperando firma del inquilino
                            </div>
                        )
                    )
                )}

                {/* Botón Cancelar (Solo Dueño y Pendiente) */}
                {Number(contractData.status) === 0 && isLandlord && (
                    <button
                        onClick={cancelContract}
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl text-xl font-bold shadow-lg transform hover:scale-105 transition-all"
                    >
                        {loading ? "Cancelando..." : "Cancelar Contrato"}
                    </button>
                )}

                {/* Botón Pagar (Solo Inquilino y Activo) */}
                {Number(contractData.status) === 1 && (
                    <button
                        onClick={payRent}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl text-xl font-bold shadow-lg transform hover:scale-105 transition-all"
                    >
                        {loading ? "Procesando..." : "Pagar Renta"}
                    </button>
                )}
            </div>

            {
                txHash && (
                    <div className="mt-6 p-4 bg-green-900/50 border border-green-500 rounded text-center animate-fadeInUp">
                        <p className="text-green-300 mb-2 text-lg font-bold">¡Transacción Confirmada!</p>
                        <a
                            href={`https://sepolia.etherscan.io/tx/${txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 underline break-all text-lg"
                        >
                            Ver transacción en Etherscan
                        </a>
                    </div>
                )
            }

            <ErrorAlert message={error} />
        </div>
    );
}
