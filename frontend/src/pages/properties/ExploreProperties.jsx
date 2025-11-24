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

    async function loadProperties() {
        try {
            if (!contract) return;

            // 1. Obtener total de propiedades
            const totalProps = await contract.propertyCounter();

            // 2. Obtener total de contratos para verificar cuáles están activos
            const totalContracts = await contract.contractCounter();
            const occupiedPropertyIds = new Set();

            for (let i = 1; i <= Number(totalContracts); i++) {
                const c = await contract.getRentContract(i);
                // Si el contrato está Activo (1), la propiedad está ocupada
                if (Number(c.status) === 1) {
                    occupiedPropertyIds.add(c.propertyId.toString());
                }
            }

            const list = [];

            for (let i = 1; i <= Number(totalProps); i++) {
                const p = await contract.getProperty(i);

                // Parsear descripción, imagen y ubicación
                // Formato esperado: Desc |IMG| Url |LOC| Location
                const parts = p.description.split(" |IMG| ");
                const descText = parts[0];
                const rest = parts[1] || "";

                const locParts = rest.split(" |LOC| ");
                const imgUrl = locParts[0] || "";
                const locRest = locParts[1] || "";

                const priceParts = locRest.split(" |PRICE| ");
                const location = priceParts[0] || "";
                const priceEst = priceParts[1] || "0";

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
                    price: p.price,
                });
            }

            setProperties(list);
        } catch (err) {
            console.error(err);
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
                        className="bg-gray-800 text-white rounded-xl shadow-lg p-5 hover:scale-105 transition-all cursor-pointer border border-gray-700"
                        onClick={() => {
                            setSelectedProperty(p);
                            setView("propertyDetails");
                        }}
                    >
                        <h2 className="text-xl font-bold mb-2">Propiedad #{p.id}</h2>
                        <p className="text-gray-300 mb-2">{p.description}</p>
                        {p.location && (
                            <p className="text-gray-400 text-sm mb-2">📍 {p.location}</p>
                        )}
                        <p className="text-purple-400 font-bold mb-2">
                            {Number(p.price) > 0 ? ethers.formatEther(p.price) : p.priceEst} ETH / mes
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
                ))}
            </div>
        </div>
    );
}
