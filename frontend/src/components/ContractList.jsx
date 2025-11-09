export default function ContractList({ contracts, signContract }) {
  return (
    <div className="select-none cursor-default animate-fadeInUp bg-black p-6 rounded shadow-md mt-10 py-10 px-120">
      <h3 className="text-xl font-semibold mb-4">Contratos disponibles</h3>
      {contracts.length === 0 ? (
        <p>No hay contratos aún.</p>
      ) : (
        contracts.map((contract, idx) => (
          <div
            key={idx}
            className="border-b py-2 flex justify-between items-center"
          >
            <div>
              <p>🏠 Propiedad: {contract.property}</p>
              <p>💰 Renta: {contract.rent} ETH</p>
            </div>
            <button
              onClick={() => signContract(contract.id)}
              className="bg-blue-500 text-white px-4 py-1 rounded"
            >
              Firmar
            </button>
          </div>
        ))
      )}
    </div>
  );
}
