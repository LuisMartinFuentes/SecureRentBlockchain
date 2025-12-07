import React, { useEffect, useState } from "react";
import { useWeb3 } from "../../context/Web3Context";
import ErrorAlert from "../../components/ErrorAlert";
import { ethers } from "ethers";

export default function ExploreProperties({ setView, setSelectedProperty }) {
    const { contract } = useWeb3();
    const [properties, setProperties] = useState([]);
    const [filteredProperties, setFilteredProperties] = useState([]);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    // ... loadProperties ...

    useEffect(() => {
        const lowerTerm = searchTerm.toLowerCase();
        const filtered = properties.filter(p =>
            p.description.toLowerCase().includes(lowerTerm) ||
            p.id.toString().includes(lowerTerm)
        );
        setFilteredProperties(filtered);
    }, [searchTerm, properties]);

    async function requestRent(propertyId) {
        try {
            if (!contract) return;
            const tx = await contract.requestRent(propertyId);
            await tx.wait();
            alert("Solicitud enviada con éxito!");
        } catch (err) {
            console.error(err);
            setError("Error al enviar solicitud: " + (err.reason || err.message));
        }
    }

    async function loadProperties() {
        try {
            if (!contract) {
                return;
            }

            // 1. Obtener total de propiedades
            const totalProps = await contract.propertyCounter();

            // 2. Obtener total de contratos para verificar cuáles están activos
            const totalContracts = await contract.contractCounter();

            const occupiedPropertyIds = new Set();

            for (let i = 1; i <= Number(totalContracts); i++) {
                try {
                    const c = await contract.getRentContract(i);
                    // Si el contrato está Activo (1), la propiedad está ocupada
                    if (Number(c.status) === 1) {
                        occupiedPropertyIds.add(c.propertyId.toString());
                    }
                } catch (e) {
                    console.error("Error cargando contrato " + i, e);
                }
            }

            const list = [];

            for (let i = 1; i <= Number(totalProps); i++) {
                try {
                    const p = await contract.getProperty(i);

                    // Parsear descripción, imagen, ubicación y precio de forma robusta
                    let descText = p.description;
                    let imgUrl = "";
                    let location = "";
                    let priceEst = "0";

                    // 1. Extraer Precio
                    if (descText.includes(" |PRICE| ")) {
                        const parts = descText.split(" |PRICE| ");
                        priceEst = parts[1];
                        descText = parts[0];
                    }

                    // 2. Extraer Ubicación
                    if (descText.includes(" |LOC| ")) {
                        const parts = descText.split(" |LOC| ");
                        location = parts[1];
                        descText = parts[0];
                    }

                    // 3. Extraer Imagen
                    if (descText.includes(" |IMG| ")) {
                        const parts = descText.split(" |IMG| ");
                        imgUrl = parts[1];
                        descText = parts[0];
                    }

                    // Verificar si está realmente disponible (Blockchain + Contratos Activos)
                    const isOccupied = occupiedPropertyIds.has(p.id.toString());
                    const realAvailability = p.isAvailable && !isOccupied;

                    list.push({
                        id: p.id,
                        owner: p.owner,
                        description: descText,
                        image: imgUrl,
                        location: location,
                        priceEst: priceEst,
                        isAvailable: realAvailability,
                    });
                } catch (e) {
                    console.error("Error cargando propiedad " + i, e);
                }
            }

            setProperties(list);
        } catch (err) {
            console.error("Error en loadProperties:", err);
            setError("No se pudieron cargar las propiedades.");
        }
    }

    useEffect(() => {
        loadProperties();
    }, [contract]);

    return (
        <div className="animate-fadeIn p-6">
            <h1 className="text-4xl font-bold mb-6">Explorar Propiedades</h1>

            {/* SEARCH BAR */}
            <div className="mb-8">
                <input
                    type="text"
                    placeholder="Buscar por descripción o ID..."
                    className="w-full p-4 rounded-xl text-black shadow-lg focus:outline-none focus:ring-2 
                    focus:ring-purple-500 bg-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <ErrorAlert message={error} />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.map((p) => (
                    <div
                        key={p.id}
                        className="bg-gray-800 text-white rounded-xl shadow-lg p-5 hover:scale-105 transition-all cursor-pointer border border-gray-700 relative"
                    >
                        <div onClick={() => {
                            setSelectedProperty(p);
                            setView("propertyDetails");
                        }}>
                            <h2 className="text-xl font-bold mb-2">Propiedad #{p.id.toString()}</h2>
                            <p className="text-gray-300 mb-2">{p.description}</p>
                            {p.location && (
                                <p className="text-gray-400 text-sm mb-2">📍 {p.location}</p>
                            )}
                            <p className="text-purple-400 font-bold mb-2">
                                {p.priceEst} ETH / mes
                            </p>
                            <p className="text-sm text-gray-400">
                                Dueño: {p.owner.slice(0, 6)}...{p.owner.slice(-4)}
                            </p>

                            <span
                                className={`mt-3 inline-block px-3 py-1 rounded-full text-sm font-semibold
                  ${p.isAvailable ? "bg-green-900 text-green-200" : "bg-red-900 text-red-200"}`}
                            >
                                {p.isAvailable ? "Disponible" : "No disponible"}
                            </span>
                        </div>

                        {/* Botón Solicitar Renta */}
                        {p.isAvailable && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    requestRent(p.id);
                                }}
                                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
                            >
                                Solicitar Renta
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
