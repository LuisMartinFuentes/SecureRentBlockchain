import React, { useState } from "react";
import { useWeb3 } from "../../context/Web3Context";
import { ethers } from "ethers";

export default function PropertyDetails({ property, setView }) {
    const { account, contract } = useWeb3();
    const [showRequestModal, setShowRequestModal] = useState(false);

    if (!property) {
        return (
            <div className="text-center mt-20 text-red-300 text-xl">
                Error: No se pudo cargar la propiedad.
            </div>
        );
    }

    // Parsear descripción, imagen, ubicación y precio
    // Si la propiedad viene de ExploreProperties, ya tiene los campos parseados.
    // Si viene de otro lado (raw), intentamos parsear.

    let descText = property.description;
    let imgUrl = property.image || "/housePlaceholder.jpg";
    let location = property.location || "";
    let priceEst = property.priceEst || "0";

    // Si no tenemos precio estimado (es "0") pero la descripción tiene tags, parseamos de nuevo (por si acaso)
    if (priceEst === "0" || !property.image) {
        if (descText.includes(" |PRICE| ")) {
            const parts = descText.split(" |PRICE| ");
            priceEst = parts[1];
            descText = parts[0];
        }

        if (descText.includes(" |LOC| ")) {
            const parts = descText.split(" |LOC| ");
            location = parts[1];
            descText = parts[0];
        }

        if (descText.includes(" |IMG| ")) {
            const parts = descText.split(" |IMG| ");
            imgUrl = parts[1];
            descText = parts[0];
        }
    }

    const isOwner = account && property.owner && property.owner.toLowerCase() === account.toLowerCase();

    return (
        <div className="animate-fadeIn p-6 max-w-4xl mx-auto text-white">

            {/* Imagen estilo Airbnb */}
            <div className="rounded-2xl overflow-hidden shadow-xl mb-6 border border-gray-700">
                <img
                    src={imgUrl}
                    alt="Property photo"
                    className="w-full h-80 object-cover"
                />
            </div>

            {/* Header */}
            <h1 className="text-4xl font-bold mb-2">
                Propiedad #{property.id}
            </h1>

            <p className="text-lg text-gray-300 mb-4">
                {descText}
            </p>

            {location && (
                <p className="text-gray-400 text-md mb-4 flex items-center gap-2">
                    📍 {location}
                </p>
            )}

            <p className="text-2xl font-bold text-purple-400 mb-4">
                {priceEst} ETH <span className="text-sm text-gray-400">/ mes</span>
            </p>

            <div className="flex items-center gap-3 text-gray-300 mb-4">
                <span className="text-sm">
                    Dueño:
                    <strong className="ml-2 text-white">
                        {property.owner.slice(0, 6)}...{property.owner.slice(-4)}
                    </strong>
                    {isOwner && <span className="ml-2 text-yellow-400">(Tú)</span>}
                </span>
            </div>

            {/* Estado */}
            <span
                className={`px-4 py-2 rounded-full text-lg font-semibold ${property.isAvailable ? "bg-green-900 text-green-200" : "bg-red-900 text-red-200"
                    } `}
            >
                {property.isAvailable ? "Disponible" : "No disponible"}
            </span>

            {/* BOTÓN */}
            <div className="mt-10">
                {property.isAvailable ? (
                    <button
                        onClick={() => setShowRequestModal(true)}
                        disabled={isOwner}
                        className={`px-10 py-4 rounded-xl text-xl font-semibold transition-all duration-300 shadow-xl
                            ${isOwner
                                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                                : "bg-purple-600 hover:bg-purple-700 text-white hover:scale-105 hover:shadow-purple-500/40"
                            }`}
                    >
                        {isOwner ? "Eres el dueño" : "Iniciar Solicitud"}
                    </button>
                ) : (
                    <p className="text-xl text-red-300 mt-4">
                        Esta propiedad no está disponible actualmente.
                    </p>
                )}
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
                    <div className="bg-gray-800 text-white p-8 rounded-2xl shadow-2xl max-w-lg w-full relative border border-gray-700">
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
