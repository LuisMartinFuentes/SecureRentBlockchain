import React, { useState, useEffect } from "react";
import { useWeb3 } from "../../context/Web3Context";
import ErrorAlert from "../../components/ErrorAlert";
import StatusModal from "../../components/StatusModal";
import { useEthPrice } from "../../hooks/useEthPrice";

export default function LandlordProperties({ setView }) {
  const { account, contract, signer } = useWeb3();
  const { ethPrice } = useEthPrice();
  const [properties, setProperties] = useState([]);
  const [newDesc, setNewDesc] = useState("");
  const [newImage, setNewImage] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [error, setError] = useState("");

  const [currency, setCurrency] = useState("ETH"); // "ETH" or "MXN"
  const [priceMXN, setPriceMXN] = useState("");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: "",
    message: "",
    type: "info"
  });

  // Cargar propiedades cuando cambie el contrato o la cuenta
  useEffect(() => {
    if (contract && account) {
      loadProperties();
    }
  }, [contract, account]);

  // Actualizar conversiones cuando cambia el precio de ETH
  useEffect(() => {
    if (ethPrice && newPrice && currency === "ETH") {
      setPriceMXN((parseFloat(newPrice) * ethPrice).toFixed(2));
    } else if (ethPrice && priceMXN && currency === "MXN") {
      setNewPrice((parseFloat(priceMXN) / ethPrice).toFixed(6));
    }
  }, [ethPrice]);

  async function loadProperties() {
    try {
      // Usamos el contrato del context, que ya tiene signer o provider
      const counter = await contract.propertyCounter();

      // Obtener contratos del landlord para verificar si ya hay uno activo por propiedad
      const myContractsIds = await contract.getContractsByLandlord(account);
      const myContracts = [];
      for (let id of myContractsIds) {
        const c = await contract.getRentContract(id);
        myContracts.push(c);
      }

      let list = [];

      for (let i = 1; i <= counter; i++) {
        const prop = await contract.getProperty(i);
        if (prop.owner.toLowerCase() === account.toLowerCase()) {
          // Cargar solicitudes
          const requests = await contract.getPropertyRequests(i);

          // Verificar si hay contrato activo/pendiente para esta propiedad
          // Status: 0=PendingSignature, 1=Active, 2=Finished, 3=Cancelled
          const activeContract = myContracts.find(
            c => c.propertyId.toString() === prop.id.toString() &&
              (Number(c.status) === 0 || Number(c.status) === 1)
          );

          list.push({
            id: prop.id,
            owner: prop.owner,
            description: prop.description,
            isAvailable: prop.isAvailable,
            requests,
            hasActiveContract: !!activeContract,
            activeContractStatus: activeContract ? activeContract.status : null
          });
        }
      }

      setProperties(list);
    } catch (err) {
      console.error(err);
      setError("Error al cargar propiedades");
    }
  }

  function handlePriceChange(val) {
    if (currency === "ETH") {
      setNewPrice(val);
      if (val && ethPrice) {
        setPriceMXN((parseFloat(val) * ethPrice).toFixed(2));
      } else {
        setPriceMXN("");
      }
    } else {
      setPriceMXN(val);
      if (val && ethPrice) {
        setNewPrice((parseFloat(val) / ethPrice).toFixed(6));
      } else {
        setNewPrice("");
      }
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

  async function createProperty() {
    setError("");
    if (!newDesc.trim()) return;
    if (!contract) {
      setError("Contrato no inicializado");
      return;
    }

    try {
      // Concatenar descripción con imagen, ubicación y precio
      // Formato: Desc |IMG| Url |LOC| Location |PRICE_TYPE| Price
      let fullDesc = newDesc;
      if (newImage.trim()) fullDesc += ` |IMG| ${newImage.trim()}`;
      if (newLocation.trim()) fullDesc += ` |LOC| ${newLocation.trim()}`;

      // Save price with specific tag based on currency
      if (currency === "MXN" && priceMXN) {
        fullDesc += ` |PRICE_MXN| ${priceMXN}`;
      } else if (currency === "ETH" && newPrice) {
        fullDesc += ` |PRICE_ETH| ${newPrice}`;
      }

      // Verificar duplicados
      // Parseamos las propiedades existentes para comparar la descripción base
      const isDuplicate = properties.some(p => {
        // p.description puede tener tags, extraemos la parte de texto
        let existingDesc = p.description.split(" |IMG| ")[0].split(" |LOC| ")[0].split(" |PRICE_MXN| ")[0].split(" |PRICE_ETH| ")[0].split(" |PRICE| ")[0];
        return existingDesc.trim().toLowerCase() === newDesc.trim().toLowerCase();
      });

      if (isDuplicate) {
        setError("No puedes crear dos propiedades iguales (misma descripción).");
        return;
      }

      const tx = await contract.createProperty(fullDesc);
      await tx.wait();

      showSuccessModal("Propiedad creada exitosamente");
      setNewDesc("");
      setNewImage("");
      setNewLocation("");
      setNewPrice("");
      setPriceMXN("");
      loadProperties();
    } catch (err) {
      console.error(err);
      setError("Error al crear propiedad: ");
    }
  }

  const mxnPriceDisplay = newPrice && ethPrice ? (parseFloat(newPrice) * ethPrice).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }) : null;

  return (
    <div className="p-4 md:p-6 text-white mt-4 md:mt-10 animate-fadeInUp flex flex-col items-center">

      <StatusModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
      />

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

        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-bold">Precio Estimado</label>
          <div className="flex bg-gray-700 rounded p-1">
            <button
              onClick={() => setCurrency("ETH")}
              className={`px-3 py-1 rounded text-sm font-bold transition-colors ${currency === "ETH" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"}`}
            >
              ETH
            </button>
            <button
              onClick={() => setCurrency("MXN")}
              className={`px-3 py-1 rounded text-sm font-bold transition-colors ${currency === "MXN" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"}`}
            >
              MXN
            </button>
          </div>
        </div>

        <div className="relative mb-1">
          <input
            className="w-full p-2 rounded bg-gray-700 text-white"
            type="number"
            step={currency === "ETH" ? "0.0001" : "1"}
            value={currency === "ETH" ? newPrice : priceMXN}
            onChange={(e) => handlePriceChange(e.target.value)}
            placeholder={currency === "ETH" ? "Ej. 0.05" : "Ej. 3500"}
          />
          <span className="absolute right-3 top-2 text-gray-400 font-bold">{currency}</span>
        </div>

        <div className="text-right mb-4 h-6">
          {currency === "ETH" && newPrice && ethPrice && (
            <p className="text-sm text-green-400">≈ {mxnPriceDisplay}</p>
          )}
          {currency === "MXN" && priceMXN && ethPrice && (
            <p className="text-sm text-purple-400">≈ {newPrice} ETH</p>
          )}
        </div>

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
            // Parse description tags
            // Format: Desc |IMG| Url |LOC| Location |PRICE_TYPE| Price
            let descClean = p.description.split(" |IMG| ")[0].split(" |LOC| ")[0];

            // Remove price tags from description
            descClean = descClean.split(" |PRICE_MXN| ")[0].split(" |PRICE_ETH| ")[0].split(" |PRICE| ")[0];

            const imgMatch = p.description.match(/\|IMG\| (.*?)( \|LOC\|| \|PRICE_MXN\|| \|PRICE_ETH\|| \|PRICE\||$)/);
            const imgUrl = imgMatch ? imgMatch[1] : "";

            const locMatch = p.description.match(/\|LOC\| (.*?)( \|PRICE_MXN\|| \|PRICE_ETH\|| \|PRICE\||$)/);
            const location = locMatch ? locMatch[1] : "";

            // Try to match specific price tags
            const priceMxnMatch = p.description.match(/\|PRICE_MXN\| (\d+(\.\d+)?)/);
            const priceEthMatch = p.description.match(/\|PRICE_ETH\| (\d+(\.\d+)?)/);
            const priceLegacyMatch = p.description.match(/\|PRICE\| (\d+(\.\d+)?)/);

            let displayPrice = null;
            let rentData = { rent: "", currency: "ETH" };

            if (priceMxnMatch) {
              const mxnVal = parseFloat(priceMxnMatch[1]);
              const ethVal = ethPrice ? (mxnVal / ethPrice).toFixed(6) : "Calculando...";
              displayPrice = (
                <p className="text-green-400 font-bold">
                  Precio: {mxnVal.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })} <span className="text-gray-400 font-normal">({ethVal} ETH)</span>
                </p>
              );
              rentData = { rent: mxnVal, currency: "MXN" };
            } else if (priceEthMatch || priceLegacyMatch) {
              const ethVal = priceEthMatch ? priceEthMatch[1] : priceLegacyMatch[1];
              const mxnVal = ethPrice ? (parseFloat(ethVal) * ethPrice).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }) : "Calculando...";
              displayPrice = (
                <p className="text-green-400 font-bold">
                  Precio: {mxnVal} <span className="text-gray-400 font-normal">({ethVal} ETH)</span>
                </p>
              );
              rentData = { rent: ethVal, currency: "ETH" };
            }

            return (
              <li key={idx} className="bg-gray-800 p-4 rounded flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  {imgUrl && (
                    <img
                      src={imgUrl}
                      alt="Propiedad"
                      className="w-32 h-32 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <p><b>ID:</b> {p.id.toString()}</p>
                    <p><b>Descripción:</b> {descClean}</p>
                    {location && <p><b>Ubicación:</b> {location}</p>}
                    {displayPrice}
                    <p><b>Disponible:</b> {p.isAvailable ? "Sí" : "No"}</p>
                  </div>
                </div>

                {/* SOLICITUDES DE RENTA */}
                {p.requests && p.requests.length > 0 && !p.hasActiveContract && (
                  <div className="bg-gray-700 p-3 rounded mt-2">
                    <h4 className="font-bold text-yellow-400 mb-2">Solicitudes de Renta:</h4>
                    <ul className="space-y-2">
                      {p.requests.map((req, rIdx) => (
                        <li key={rIdx} className="flex justify-between items-center bg-gray-800 p-2 rounded">
                          <span className="text-sm text-gray-300">
                            {req.tenant} <br />
                            <span className="text-xs text-gray-500">
                              {new Date(Number(req.timestamp) * 1000).toLocaleString()}
                            </span>
                          </span>
                          <button
                            onClick={() => {
                              setView("landlordCreate", {
                                createContractData: {
                                  propertyId: p.id.toString(),
                                  tenant: req.tenant,
                                  rent: rentData.rent,
                                  currency: rentData.currency
                                }
                              });
                            }}
                            className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1 rounded"
                          >
                            Crear Contrato
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {p.hasActiveContract && (
                  <div className={`p-2 rounded mt-2 text-center text-sm ${Number(p.activeContractStatus) === 0 ? "bg-yellow-900 text-yellow-200" : "bg-green-900 text-green-200"}`}>
                    {Number(p.activeContractStatus) === 0 ? "Pendiente de firma" : "Propiedad con contrato activo"}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <ErrorAlert message={error} />
    </div>
  );
}
