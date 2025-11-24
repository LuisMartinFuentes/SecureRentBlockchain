export default function Home({ setView }) {
  return (
    <div className="animate-fadeInUp flex flex-col items-center justify-center text-center mt-10 md:mt-17 px-4">
      <h1 className="select-none cursor-default text-3xl md:text-5xl font-bold text-black-700 mb-4"
      >Bienvenido a SecureRent</h1>
      <p className="select-none cursor-default text-white max-w-md text-lg md:text-xl mb-8 mt-4">
        Gestiona y crea contratos de arrendamiento de forma segura y transparente mediante blockchain.
      </p>

      <img
        src="/Click AQUI PARA EXPLORAR LAS PROPIEDADES.png"
        alt="Blockchain Home img"
        className="w-full max-w-lg h-auto object-contain md:-mt-3 hover:scale-110
      transition-transform duration-300"
        onClick={() => setView("explore")}

      />

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
