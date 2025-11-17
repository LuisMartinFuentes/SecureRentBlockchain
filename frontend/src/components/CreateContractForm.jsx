export default function CreateContractForm({
  property,
  setProperty,
  rent,
  setRent,
  onSubmit,
}) {
  return (
    <div className="select-none cursor-default animate-fadeInUp 
                    bg-black/40 backdrop-blur-md 
                    p-6 rounded-2xl shadow-xl 
                    w-full max-w-md mx-auto mt-10">

      <h3 className="text-2xl font-semibold mb-6 text-center">
        Crear Nuevo Contrato
      </h3>

      <input
        type="text"
        placeholder="Dirección de la propiedad"
        value={property}
        onChange={(e) => setProperty(e.target.value)}
        className="bg-gray-900/60 border border-gray-700 text-white
                   w-full p-3 mb-4 rounded-xl placeholder-gray-400 
                   focus:outline-none focus:ring-2 focus:ring-purple-500"
      />

      <input
        type="number"
        placeholder="Renta mensual (ETH)"
        value={rent}
        onChange={(e) => setRent(e.target.value)}
        className="bg-gray-900/60 border border-gray-700 text-white
                   w-full p-3 mb-4 rounded-xl placeholder-gray-400 
                   focus:outline-none focus:ring-2 focus:ring-purple-500"
      />

      <button
        onClick={onSubmit}
        className="w-full py-3 rounded-xl 
                   bg-green-500 hover:bg-green-600 
                   text-white font-semibold 
                   transition transform hover:scale-105 shadow-lg"
      >
        Crear contrato
      </button>
    </div>
  );
}
