export default function ContractList({ contracts, signContract }) {
  return (
    <div className="bg-white p-6 rounded shadow-md">
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
