import { ethers } from "ethers";

export default function ContractList({ contracts, signContract, account }) {
  return (
    <div className="select-none cursor-default animate-fadeInUp bg-black/40 backdrop-blur-md p-6 rounded-2xl shadow-xl mt-10 w-full max-w-3xl">
      <h3 className="text-2xl font-semibold mb-6">Lista de Contratos</h3>

      {contracts.length === 0 ? (
        <p className="text-gray-300 text-lg">No hay contratos disponibles aún.</p>
      ) : (
        contracts.map((contract, idx) => (
          <div
            key={idx}
            className="border-b border-gray-600 py-4 flex justify-between items-center"
          >
            <div className="text-left leading-relaxed">
              <p><strong>ID:</strong> #{Number(contract.id)}</p>
              <p><strong>Dirección de la propiedad:</strong> {contract.propertyAddress}</p>
              <p><strong>Renta mensual:</strong> {ethers.formatEther(contract.rentAmount)} ETH</p>
              <p>
                <strong>Estado:</strong>{" "}
                {contract.isSigned ? (
                  <span className="text-green-400 font-semibold">✔ Firmado</span>
                ) : (
                  <span className="text-yellow-400 font-semibold">Pendiente</span>
                )}
              </p>
            </div>

            {/* Mostrar botón solo si:
                El contrato no está firmado
                El usuario NO es el arrendador
                checar todo en MetaMask para poder asegurar el funcionamiento.
            */}
            {!contract.isSigned && contract.landlord.toLowerCase() !== account.toLowerCase() && (
              <button
                onClick={() => signContract(contract.id)}
                className="bg-purple-500 hover:bg-purple-600 
                           text-white px-3 py-2 rounded-lg 
                           transition transform hover:scale-110 shadow-md"
              >
                Firmar
              </button>
            )}

            {/* Mensaje si el usuario es el dueño */}
            {!contract.isSigned && contract.landlord.toLowerCase() === account.toLowerCase() && (
              <span className="text-gray-400 text-sm italic">Eres el arrendador</span>
            )}
          </div>
        ))
      )}
    </div>
  );
}
