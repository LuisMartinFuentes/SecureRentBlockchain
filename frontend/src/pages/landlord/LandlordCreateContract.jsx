import React, { useState, useEffect } from "react";
import { useWeb3 } from "../../context/Web3Context";
import ErrorAlert from "../../components/ErrorAlert";
import StatusModal from "../../components/StatusModal";
import { ethers } from "ethers";
import { useEthPrice } from "../../hooks/useEthPrice";

export default function LandlordCreateContract({ initialData }) {
  const { account, contract } = useWeb3();
  const { ethPrice } = useEthPrice();
  const [properties, setProperties] = useState([]);
  const [tenant, setTenant] = useState("");
  const [rent, setRent] = useState("");
  const [months, setMonths] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");
  const [isCreated, setIsCreated] = useState(false);

  const [currency, setCurrency] = useState("ETH"); // "ETH" or "MXN"
  const [rentMXN, setRentMXN] = useState("");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: "",
    message: "",
    type: "info"
  });

  useEffect(() => {
    if (contract && account) {
      loadProperties();
    }

    if (initialData) {
      if (initialData.propertyId) setPropertyId(initialData.propertyId);
      if (initialData.tenant) setTenant(initialData.tenant);
      if (initialData.rent) {
        if (initialData.currency === "MXN") {
          setCurrency("MXN");
          setRentMXN(initialData.rent);
          // Calculate initial ETH rent
          if (ethPrice) {
            setRent((parseFloat(initialData.rent) / ethPrice).toFixed(6));
          }
        } else {
          setCurrency("ETH");
          setRent(initialData.rent);
        }
      }
    }
  }, [contract, account, initialData, ethPrice]); // Added ethPrice to dependencies for initial rent calculation

  // Recalculate ETH rent if currency is MXN and price changes
  useEffect(() => {
    if (currency === "MXN" && rentMXN && ethPrice) {
      setRent((parseFloat(rentMXN) / ethPrice).toFixed(6));
    }
  }, [ethPrice, rentMXN, currency]);

  async function loadProperties() {
    try {
      const counter = await contract.propertyCounter();
      let list = [];

      for (let i = 1; i <= counter; i++) {
        const p = await contract.getProperty(i);
        if (
          p.owner.toLowerCase() === account.toLowerCase() &&
          p.isAvailable === true
        ) {
          list.push(p);
        }
      }

      setProperties(list);
    } catch (err) {
      console.error(err);
      setError("Error al cargar propiedades");
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

  async function createContract() {
    setError(""); // Clear previous errors
    if (!contract) {
      setError("Contrato no listo");
      return;
    }

    // Validar dirección
    if (!ethers.isAddress(tenant)) {
      setError("La dirección del arrendatario no es válida");
      return;
    }

    // Basic validation for form fields
    if (!propertyId || !tenant || !rent || !months) {
      setError("Completa todos los campos");
      return;
    }

    try {
      // Convertir la renta de ETH a Wei
      const rentInWei = ethers.parseEther(rent.toString());

      // --- DEBUGGING START ---
      const signerAddress = await contract.runner.getAddress();
      const propertyData = await contract.getProperty(propertyId);

      console.log("DEBUG CHECK:", {
        signer: signerAddress,
        propertyOwner: propertyData.owner,
        match: signerAddress.toLowerCase() === propertyData.owner.toLowerCase()
      });

      if (signerAddress.toLowerCase() !== propertyData.owner.toLowerCase()) {
        setError(`Error de propiedad: Tu cuenta (${signerAddress}) no es la dueña de esta propiedad (${propertyData.owner})`);
        return;
      }
      // --- DEBUGGING END ---

      console.log("Creating contract with:", {
        propertyId,
        tenant,
        rentInWei: rentInWei.toString(),
        months,
        account
      });

      const tx = await contract.createRentContract(
        propertyId,
        tenant,
        rentInWei,
        months
      );

      await tx.wait();

      setTxHash(tx.hash);
      showSuccessModal("Contrato creado exitosamente");
      setIsCreated(true); // Set isCreated to true on success
      setTenant("");
      setRent("");
      setRentMXN("");
      setMonths("");
      setPropertyId("");
      loadProperties(); // Recargar para actualizar disponibilidad
    } catch (err) {
      console.error(err);
      setError("Error al crear contrato: " + (err.reason || err.message));
    }
  }

  const mxnRentDisplay = rent && ethPrice ? (parseFloat(rent) * ethPrice).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }) : null;
  const fixedMxnDisplay = rentMXN ? parseFloat(rentMXN).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }) : null;

  return (
    <div className="p-4 md:p-6 text-white mt-4 md:mt-10 animate-fadeInUp flex flex-col items-center">

      <StatusModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
      />

      <h2 className="text-4xl font-bold mb-6">Crear Contrato</h2>

      <div className="bg-gray-800 p-5 rounded w-full max-w-lg">
        {/* Propiedad */}
        <label className="block mb-2 font-bold">Propiedad</label>
        <select
          value={propertyId}
          onChange={(e) => setPropertyId(e.target.value)}
          className={`w-full p-2 rounded bg-gray-700 mb-4 ${initialData?.propertyId ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={!!initialData?.propertyId}
        >
          <option value="">Seleccione una propiedad</option>
          {properties.map((p) => {
            const descText = p.description.split(" |IMG| ")[0];
            return (
              <option key={p.id.toString()} value={p.id.toString()}>
                #{p.id.toString()} — {descText}
              </option>
            );
          })}
        </select>

        {/* Tenant */}
        <label className="block mb-2 font-bold">Billetera del Inquilino (Wallet)</label>
        <input
          className={`w-full p-2 rounded bg-gray-700 mb-4 ${initialData?.tenant ? "opacity-50 cursor-not-allowed" : ""}`}
          value={tenant}
          onChange={(e) => setTenant(e.target.value)}
          placeholder="0x..."
          disabled={!!initialData?.tenant}
        />

        {/* Rent */}
        <label className="block mb-2 font-bold">Renta Mensual</label>

        {currency === "MXN" ? (
          <div className="mb-4">
            <p className="text-2xl font-bold text-green-400 mb-1">{fixedMxnDisplay}</p>
            <p className="text-sm text-gray-400">
              Equivalente a <span className="text-white font-bold">{rent} ETH</span> (Calculado en tiempo real)
            </p>
          </div>
        ) : (
          <div className="mb-4">
            <input
              className="w-full p-2 rounded bg-gray-700 mb-1 opacity-50 cursor-not-allowed"
              type="number"
              step="0.0001"
              value={rent}
              readOnly
              placeholder="Ej. 0.05"
            />
            {mxnRentDisplay && (
              <p className="text-sm text-green-400 text-right">
                ≈ {mxnRentDisplay} MXN
              </p>
            )}
          </div>
        )}

        {/* Months */}
        <label className="block mb-2 font-bold">Total de Meses</label>
        <input
          className="w-full p-2 rounded bg-gray-700 mb-4"
          type="number"
          value={months}
          onChange={(e) => setMonths(e.target.value)}
        />

        <ErrorAlert message={error} />

        {!isCreated ? (
          <button
            onClick={createContract}
            className="w-full bg-purple-500 py-2 rounded hover:bg-purple-600"
          >
            Crear contrato
          </button>
        ) : (
          <div className="mt-4 p-3 bg-green-900/50 border border-green-500 rounded text-center">
            <p className="text-green-300 mb-2">¡Transacción Exitosa!</p>
            {txHash && (
              <a
                href={`https://sepolia.etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline break-all"
              >
                Ver en Etherscan: {txHash}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
