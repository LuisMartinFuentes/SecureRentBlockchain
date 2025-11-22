import { ethers } from "ethers";

export default function ContractList({ contracts, openDetails }) {
  return (
    <div className="select-none cursor-default animate-fadeInUp bg-black/40 backdrop-blur-md p-6 rounded-2xl shadow-xl mt-10 w-full max-w-3xl">
      <h3 className="text-2xl font-semibold mb-6">Lista de Contratos</h3>

      {contracts.length === 0 ? (
        <p className="text-gray-300">No hay contratos disponibles aún.</p>
      ) : (
        contracts.map((contract, idx) => (
          <div
            key={idx}
            className="border-b border-gray-600 py-4 flex justify-between items-center"
          >
            <div className="text-left">
              <p><strong>ID:</strong> #{Number(contract.id)}</p>
              <p><strong>Propiedad:</strong> {contract.propertyAddress}</p>
              <p><strong>Renta:</strong> {ethers.formatEther(contract.rentAmount)} ETH</p>
            </div>

            <button
              onClick={() => openDetails(contract)}
              className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded-lg transition"
            >
              Ver Detalles
            </button>
          </div>
        ))
      )}
    </div>
  );
}
