export default function Home({ setView }) {
  return (
    <div className="flex flex-col items-center justify-center text-center mt-16">
      <h1 className="select-none cursor-default text-4xl font-bold text-black-700 mb-4"
      >Bienvenido a SecureRent</h1>
      <p className="select-none cursor-default text-gray-600 max-w-md mb-8">
        Gestiona contratos de arrendamiento de forma segura y transparente mediante blockchain.
      </p>

      <div className="flex gap-4">
        <button
          onClick={() => setView("landlord")}
          className=" select-none cursor-default bg-purple-600 hover:bg-purple-700 text-white 
          font-semibold px-6 py-3 rounded transition-all duration-300"
        >
          Soy Arrendador
        </button>
        <button
          onClick={() => setView("tenant")}
          className="select-none cursor-default bg-purple-600 hover:bg-purple-700 text-white 
          font-semibold px-6 py-3 rounded transition-all duration-300"
        >
          Soy Arrendatario
        </button>
      </div>
    </div>
  );
}
