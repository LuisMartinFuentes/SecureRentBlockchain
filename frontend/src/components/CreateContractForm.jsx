export default function CreateContractForm({
  property,
  setProperty,
  rent,
  setRent,
  onSubmit,
}) {
  return (
    <div className="bg-white p-6 rounded shadow-md max-w-md mx-auto">
      <h3 className="text-xl font-semibold mb-4">Crear nuevo contrato</h3>
      <input
        type="text"
        placeholder="Dirección de la propiedad"
        value={property}
        onChange={(e) => setProperty(e.target.value)}
        className="border w-full p-2 mb-3 rounded"
      />
      <input
        type="number"
        placeholder="Renta (en ETH)"
        value={rent}
        onChange={(e) => setRent(e.target.value)}
        className="border w-full p-2 mb-3 rounded"
      />
      <button
        onClick={onSubmit}
        className="bg-green-500 text-white px-4 py-2 rounded w-full"
      >
        Crear contrato
      </button>
    </div>
  );
}
