import React, { useState, useEffect } from "react";
import { useWeb3 } from "../../context/Web3Context";
import { ethers } from "ethers";
import ErrorAlert from "../../components/ErrorAlert";
import StatusModal from "../../components/StatusModal";

import { useEthPrice } from "../../hooks/useEthPrice";

export default function PropertyDetails({ property, setView }) {
    const { account, contract } = useWeb3();
    const { ethPrice } = useEthPrice();
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [error, setError] = useState("");
    const [hasRequested, setHasRequested] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState({
        title: "",
        message: "",
        type: "info"
    });


    const [hasActiveContract, setHasActiveContract] = useState(false);

    useEffect(() => {
        if (contract && account && property) {
            checkStatus();
        }
    }, [contract, account, property]);

    async function checkStatus() {
        try {
            // 1. Obtener eventos de Solicitud (RentRequested)
            // Filtramos por propiedad y tenant (si es posible)
            // Si no, traemos por propiedad y filtramos en JS
            const filterReq = contract.filters.RentRequested(property.id, null);
            const eventsReq = await contract.queryFilter(filterReq);
            const myRequests = eventsReq.filter(e => e.args[1].toLowerCase() === account.toLowerCase());

            const lastRequestBlock = myRequests.length > 0
                ? myRequests[myRequests.length - 1].blockNumber
                : 0;

            // 2. Obtener eventos de Contrato Creado (ContractCreated)
            // ContractCreated(id, propertyId, landlord, tenant, ...)
            const filterContract = contract.filters.ContractCreated(null, property.id, null, null);
            const eventsContract = await contract.queryFilter(filterContract);
            const myContractsEvents = eventsContract.filter(e => e.args[3].toLowerCase() === account.toLowerCase());

            const lastContractBlock = myContractsEvents.length > 0
                ? myContractsEvents[myContractsEvents.length - 1].blockNumber
                : 0;

            // 3. Verificar si hay contrato activo
            let active = false;
            if (myContractsEvents.length > 0) {
                const lastContractId = myContractsEvents[myContractsEvents.length - 1].args[0];
                const contractData = await contract.getRentContract(lastContractId);
                // Status: 0=Pending, 1=Active, 2=Finished, 3=Cancelled
                if (Number(contractData.status) === 0 || Number(contractData.status) === 1) {
                    active = true;
                }
            }
            setHasActiveContract(active);

            // 4. Determinar si hay solicitud pendiente (Request > Contract)
            // Si no hay contrato, cualquier request es pendiente.
            // Si hay contrato, el request debe ser posterior al contrato.
            if (lastRequestBlock > lastContractBlock) {
                setHasRequested(true);
            } else {
                setHasRequested(false);
            }

        } catch (err) {
            console.error("Error checking status", err);
        }
    }

    function showSuccessModal(msg) {
        setModalConfig({
            title: "¡Éxito!",
            message: msg,
            type: "success"
        });
        setModalOpen(true);
    }

    async function requestRent() {
        try {
            setError("");
            const tx = await contract.requestRent(property.id);
            await tx.wait();
            showSuccessModal("Solicitud enviada con éxito!");
            // Actualizar estado manualmente para feedback inmediato
            setHasRequested(true);
            checkStatus(); // Re-verificar
        } catch (err) {
            console.error(err);
            setError("Error al enviar solicitud: " + (err.reason || err.message));
        }
    }

    if (!property) {
        return (
            <div className="text-center mt-20 text-red-300 text-xl">
                Error: No se pudo cargar la propiedad.
            </div>
        );
    }

    const isOwner = account && property.owner && property.owner.toLowerCase() === account.toLowerCase();

    // Calculate and display price based on priceData
    let displayPrice;
    if (property.priceData.type === "MXN") {
        const mxnVal = parseFloat(property.priceData.value);
        const ethVal = ethPrice ? (mxnVal / ethPrice).toFixed(6) : "...";
        displayPrice = (
            <p className="text-3xl font-bold text-purple-400 mb-6">
                {mxnVal.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })} <span className="text-lg text-gray-300">({ethVal} ETH)</span> <span className="text-sm text-gray-400">/ mes</span>
            </p>
        );
    } else { // ETH
        const ethVal = property.priceData.value;
        const mxnVal = ethPrice ? (parseFloat(ethVal) * ethPrice).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }) : "Cargando...";
        displayPrice = (
            <p className="text-3xl font-bold text-purple-400 mb-6">
                {mxnVal} <span className="text-lg text-gray-300">({ethVal} ETH)</span> <span className="text-sm text-gray-400">/ mes</span>
            </p>
        );
    }

    return (
        <div className="animate-fadeIn p-6 max-w-6xl mx-auto text-white">
            <StatusModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
            />
            <ErrorAlert message={error} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* COLUMNA IZQUIERDA: IMAGEN */}
                <div>
                    <div className="rounded-2xl overflow-hidden shadow-xl mb-6 border border-gray-700 h-96">
                        <img
                            src={property.image}
                            alt="Property photo"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* COLUMNA DERECHA: INFO + ACCIONES */}
                <div className="flex flex-col justify-center">
                    <h1 className="text-4xl font-bold mb-4">
                        Propiedad #{property.id}
                    </h1>

                    <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                        {property.description}
                    </p>

                    {property.location && (
                        <p className="text-gray-400 text-md mb-4 flex items-center gap-2">
                            📍 {property.location}
                        </p>
                    )}

                    {displayPrice}

                    <div className="flex items-center gap-3 text-gray-300 mb-6">
                        <span className="text-sm bg-gray-800 px-3 py-1 rounded-full border border-gray-600">
                            Dueño:
                            <strong className="ml-2 text-white">
                                {property.owner.slice(0, 6)}...{property.owner.slice(-4)}
                            </strong>
                            {isOwner && <span className="ml-2 text-yellow-400 font-bold">(Tú)</span>}
                        </span>
                    </div>

                    {/* Estado */}
                    <div className="mb-8">
                        <span
                            className={`px-4 py-2 rounded-full text-lg font-semibold ${property.isAvailable ? "bg-green-900 text-green-200" : "bg-red-900 text-red-200"
                                } `}
                        >
                            {property.isAvailable ? "Disponible" : "No disponible"}
                        </span>
                    </div>

                    {/* BOTONES DE ACCIÓN */}
                    <div className="flex flex-col gap-4">
                        {isOwner ? (
                            <div className="bg-purple-900/30 border border-purple-500/50 p-4 rounded-xl text-center">
                                <p className="text-purple-200 font-bold text-lg">Eres el dueño de esta propiedad</p>
                            </div>
                        ) : (
                            property.isAvailable ? (
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button
                                        onClick={() => setShowRequestModal(true)}
                                        className="flex-1 px-6 py-3 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg bg-blue-600 hover:bg-blue-700 text-white hover:scale-105"
                                    >
                                        Información del trámite
                                    </button>

                                    {hasActiveContract ? (
                                        <button
                                            disabled
                                            className="flex-1 px-6 py-3 rounded-xl text-lg font-semibold bg-green-900/50 text-green-200 cursor-not-allowed shadow-lg border border-green-500/50"
                                        >
                                            Tienes un contrato activo
                                        </button>
                                    ) : hasRequested ? (
                                        <button
                                            disabled
                                            className="flex-1 px-6 py-3 rounded-xl text-lg font-semibold bg-gray-600 text-gray-400 cursor-not-allowed shadow-lg"
                                        >
                                            Solicitud Enviada
                                        </button>
                                    ) : (
                                        <button
                                            onClick={requestRent}
                                            className="flex-1 px-6 py-3 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg bg-purple-600 hover:bg-purple-700 text-white hover:scale-105 hover:shadow-purple-500/40"
                                        >
                                            Solicitar Renta
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <p className="text-xl text-red-300 mt-4">
                                    Esta propiedad no está disponible actualmente.
                                </p>
                            )
                        )}
                    </div>
                </div>
            </div>

            {/* REGRESAR */}
            <button
                onClick={() => setView("explore")}
                className="mt-10 text-purple-300 hover:text-purple-500 underline text-lg"
            >
                ← Regresar
            </button>

            {/* MODAL DE SOLICITUD */}
            {showRequestModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn">
                    <div className="bg-gray-800/95 backdrop-blur-xl text-white p-8 rounded-2xl shadow-2xl max-w-lg w-full relative border border-gray-600">
                        <button
                            onClick={() => setShowRequestModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl"
                        >✕</button>

                        <h2 className="text-2xl font-bold mb-4 text-purple-400">Solicitar Renta</h2>
                        <p className="mb-4 text-gray-300">
                            Para rentar esta propiedad, el dueño debe crear el contrato inteligente. Sigue estos pasos:
                        </p>

                        <div className="bg-gray-700 p-4 rounded-lg mb-4 border border-gray-600">
                            <p className="font-bold text-sm text-gray-400 mb-1">1. Tu Dirección de Billetera:</p>
                            <div className="flex items-center justify-between bg-gray-900 p-2 rounded border border-gray-600">
                                <span className="font-mono text-sm truncate mr-2 text-gray-300">{account}</span>
                                <button
                                    onClick={() => navigator.clipboard.writeText(account)}
                                    className="text-purple-400 font-bold text-sm hover:underline"
                                >
                                    Copiar
                                </button>
                            </div>
                        </div>

                        <div className="bg-purple-900/30 p-4 rounded-lg mb-6 border border-purple-500/30">
                            <p className="font-bold text-sm text-purple-300 mb-1">2. Contacta al Dueño:</p>
                            <p className="text-sm text-gray-300 mb-2">
                                Envíale tu dirección y solicita que genere el contrato para la propiedad <strong>#{property.id}</strong>.
                            </p>
                            <div className="font-mono text-xs bg-gray-900 p-2 rounded border border-gray-600 text-gray-400 break-all">
                                Dueño: {property.owner}
                            </div>
                        </div>

                        <p className="text-sm text-center text-gray-500">
                            Una vez que el dueño cree el contrato, recibirás una notificación en esta plataforma.
                        </p>

                        <button
                            onClick={() => setShowRequestModal(false)}
                            className="w-full mt-6 bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors"
                        >
                            Entendido
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
