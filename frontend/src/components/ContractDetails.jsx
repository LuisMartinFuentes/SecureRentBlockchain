import { ethers } from "ethers";

export default function ContractDetails({ contract, id, signContract }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md mb-4">
      <h3 className="font-bold text-lg mb-2">Contrato #{id}</h3>
      <p><strong>Arrendador:</strong> {contract.landlord}</p>
      <p><strong>Inquilino:</strong> {contract.tenant || "No asignado"}</p>
      <p><strong>Dirección del inmueble:</strong> {contract.propertyAddress}</p>
      <p><strong>Renta:</strong> {ethers.formatEther(contract.rentAmount)} ETH</p>
      <p><strong>Firmado:</strong> {contract.isSigned ? "✅ Sí" : "❌ No"}</p>

      {!contract.isSigned && (
        <button
          className="mt-3 bg-indigo-500 hover:bg-indigo-600 text-white py-1 px-4 rounded"
          onClick={() => signContract(id)}
        >
          Firmar Contrato
        </button>
      )}
    </div>
  );
}
