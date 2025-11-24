import React, { useState, useEffect } from "react";
import { useWeb3 } from "../../context/Web3Context";
import ErrorAlert from "../../components/ErrorAlert";

export default function LandlordProperties() {
  const { account, contract, signer } = useWeb3();
  const [properties, setProperties] = useState([]);
  const [newDesc, setNewDesc] = useState("");
  const [newImage, setNewImage] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [error, setError] = useState("");

  // Cargar propiedades cuando cambie el contrato o la cuenta
  useEffect(() => {
    if (contract && account) {
      loadProperties();
    }
  }, [contract, account]);

  async function loadProperties() {
    try {
      // Usamos el contrato del context, que ya tiene signer o provider
      const counter = await contract.propertyCounter();
      let list = [];

      for (let i = 1; i <= counter; i++) {
        const prop = await contract.getProperty(i);
        if (prop.owner.toLowerCase() === account.toLowerCase()) {
          list.push(prop);
        }
      }

      setProperties(list);
    } catch (err) {
      console.error(err);
      setError("Error al cargar propiedades");
    }
  }

  async function createProperty() {
    if (!newDesc.trim()) return;
    if (!contract) {
      setError("Contrato no inicializado");
      return;
    }

    try {
      // Concatenar descripción con imagen, ubicación y precio
      // Formato: Desc |IMG| Url |LOC| Location |PRICE| Price
      let fullDesc = newDesc;
      if (newImage.trim()) fullDesc += ` |IMG| ${newImage.trim()}`;
      if (newLocation.trim()) fullDesc += ` |LOC| ${newLocation.trim()}`;
      if (newPrice.trim()) fullDesc += ` |PRICE| ${newPrice.trim()}`;

      const tx = await contract.createProperty(fullDesc);
      await tx.wait();

      alert("Propiedad creada");
      setNewDesc("");
      setNewImage("");
      loadProperties();
    } catch (err) {
      console.error(err);
      setError("Error al crear propiedad");
    }
  }

  return (
    <div className="p-4 md:p-6 text-white mt-4 md:mt-10 animate-fadeInUp flex flex-col items-center">
      <h2 className="text-4xl font-bold mb-4">Mis Propiedades</h2>

      {/* CREAR PROPIEDAD */}
      <div className="bg-gray-800 p-4 rounded mb-6 w-full max-w-lg">
        <h3 className="text-xl mb-2">Registrar nueva propiedad</h3>

        <input
          type="text"
          value={newDesc}
          onChange={(e) => setNewDesc(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white mb-3"
          placeholder="Descripción de la propiedad"
        />

        <input
          type="text"
          value={newImage}
          onChange={(e) => setNewImage(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white mb-3"
          placeholder="URL de la imagen (opcional)"
        />

        <input
          type="text"
          value={newLocation}
          onChange={(e) => setNewLocation(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white mb-3"
          placeholder="Ubicación (Dirección)"
        />

        <input
          type="number"
          value={newPrice}
          onChange={(e) => setNewPrice(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white mb-3"
          placeholder="Precio Estimado (ETH)"
        />

        <button
          onClick={createProperty}
          className="bg-purple-500 px-4 py-2 rounded hover:bg-purple-600 w-full"
        >
          Guardar propiedad
        </button>
      </div>

      {/* LISTA */}
      {properties.length === 0 ? (
        <p className="text-gray-300">Aún no tienes propiedades.</p>
      ) : (
        <ul className="space-y-3 w-full max-w-2xl">
          {properties.map((p, idx) => {
            const parts = p.description.split(" |IMG| ");
            const descText = parts[0];
            const imgUrl = parts[1] || "";

            return (
              <li key={idx} className="bg-gray-800 p-4 rounded flex flex-col md:flex-row gap-4 items-center">
                {imgUrl && (
                  <img
                    src={imgUrl}
                    alt="Propiedad"
                    className="w-32 h-32 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <p><b>ID:</b> {p.id.toString()}</p>
                  <p><b>Descripción:</b> {descText}</p>
                  <p><b>Disponible:</b> {p.isAvailable ? "Sí" : "No"}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <ErrorAlert message={error} />
    </div>
  );
}
