import { ethers } from "ethers";

export default function ContractDetails({ contract, account, close, sign }) {
  if (!contract) return null;

  const isLandlord =
    contract.landlord.toLowerCase() === account.toLowerCase();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn">
      <div className="bg-gray-800/95 backdrop-blur-xl text-white p-6 rounded-2xl shadow-2xl max-w-lg w-full relative border border-gray-600">

        <h2 className="text-3xl font-bold mb-4">
          Detalles del Contrato #{Number(contract.id)}
        </h2>

        <p><strong>Arrendador:</strong> {contract.landlord}</p>
        <p><strong>Inquilino:</strong> {contract.tenant || "No asignado"}</p>
        <p><strong>Dirección:</strong> {contract.propertyAddress}</p>
        <p><strong>Renta:</strong> {ethers.formatEther(contract.rentAmount)} ETH</p>
        <p>
          <strong>Estado:</strong>{" "}
          {contract.isSigned ? (
            <span className="text-green-400">Firmado</span>
          ) : (
            <span className="text-yellow-400">Pendiente</span>
          )}
        </p>

        {/* BOTONES */}
        <div className="mt-6 flex justify-between">
          <button
            onClick={close}
            className="bg-gray-500 hover:bg-gray-600 px-4 py-2 rounded"
          >
            Cerrar
          </button>

          {!contract.isSigned && !isLandlord && (
            <button
              onClick={() => sign(contract.id)}
              className="bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded"
            >
              Firmar Contrato
            </button>
          )}

          {isLandlord && !contract.isSigned && (
            <span className="text-gray-300 italic">Eres el arrendador</span>
          )}
        </div>
      </div>
    </div>
  );
}
