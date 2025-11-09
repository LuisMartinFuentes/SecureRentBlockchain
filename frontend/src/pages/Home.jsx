export default function Home({ setView }) {
  return (
    <div className="animate-fadeInUp flex flex-col items-center justify-center text-center mt-17">
      <h1 className="select-none cursor-default text-5xl font-bold text-black-700 mb-4"
      >Bienvenido a SecureRent</h1>
      <p className="select-none cursor-default text-white max-w-md text-xl mb-8 mt-4">
        Gestiona contratos de arrendamiento de forma segura y transparente mediante blockchain.
      </p>

      <img 
          src="/BlockchainImg.png"
          alt="Blockchain Home img"
          className="w-200 h-70 object-contain -mt-12"
      />

      <div className="flex gap-4">
        <button
          onClick={() => setView("landlordInfo")}
          className=" select-none cursor-default bg-purple-600 hover:bg-purple-700 text-white 
          text-lg font-semibold px-14 py-2 rounded transition-all duration-300"
        >
          Soy Arrendador
        </button>
        <button
          onClick={() => setView("tenantInfo")}
          className="select-none cursor-default bg-purple-600 hover:bg-purple-700 text-white 
          text-lg font-semibold px-14 py-2 rounded transition-all duration-300"
        >
          Soy Arrendatario
        </button>
      </div>
    </div>
  );
}
