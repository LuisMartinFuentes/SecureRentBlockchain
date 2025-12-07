export default function Home({ setView }) {
  return (
    <div className="animate-fadeInUp flex flex-col items-center justify-center text-center mt-20 md:mt-32 px-4">
      <h1 className="select-none cursor-default text-5xl md:text-7xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-purple-500 to-purple-700 animate-pulse drop-shadow-sm"
      >🏠 Bienvenido a SecureRent 🏠</h1>
      <p className="select-none cursor-default text-white max-w-2xl text-2xl md:text-3xl mb-16 mt-4 leading-relaxed animate-float">
        Gestiona y crea contratos de arrendamiento de forma segura y transparente mediante blockchain.
      </p>

      <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto mt-4">
        <button
          onClick={() => setView("landlordInfo")}
          className="select-none cursor-default bg-purple-600 hover:bg-purple-700 text-white 
          text-lg font-semibold px-8 md:px-14 py-3 md:py-2 rounded hover:scale-110 transition-all duration-300 w-full md:w-auto"
        >
          Soy Arrendador
        </button>
        <button
          onClick={() => setView("tenantInfo")}
          className="select-none cursor-default bg-purple-600 hover:bg-purple-700 text-white 
          text-lg font-semibold px-8 md:px-14 py-3 md:py-2 rounded hover:scale-110 transition-all duration-300 w-full md:w-auto"
        >
          Soy Arrendatario
        </button>
      </div >
    </div >
  );
}
