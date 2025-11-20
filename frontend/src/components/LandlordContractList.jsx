import { ethers } from "ethers";

export default function LandlordContractList({ contracts }) {
  return (
    <div className="select-none cursor-default animate-fadeInUp bg-black/40 backdrop-blur-md p-6 rounded-2xl shadow-xl mt-10 w-full max-w-3xl">
      <h3 className="text-2xl font-semibold mb-6">Mis Contratos Creados</h3>

      {contracts.length === 0 ? (
        <p className="text-gray-300 text-lg">Aún no has creado contratos.</p>
      ) : (
        contracts.map((contract, idx) => (
          <div
            key={idx}
            className="border-b border-gray-600 py-4 flex justify-between items-center"
          >
            <div className="text-left leading-relaxed">
              <p><strong>ID:</strong> #{Number(contract.id)}</p>
              <p><strong>Dirección:</strong> {contract.propertyAddress}</p>
              <p><strong>Renta:</strong> {ethers.formatEther(contract.rentAmount)} ETH</p>
              <p>
                <strong>Estado:</strong>{" "}
                {contract.isSigned ? (
                  <span className="text-green-400 font-semibold">Firmado</span>
                ) : (
                  <span className="text-yellow-400 font-semibold">Pendiente</span>
                )}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
