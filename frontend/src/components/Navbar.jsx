export default function Navbar({ setView }) {
  return (
    <nav className="select-none cursor-default flex justify-between items-center p-4 bg-purple-500 text-white">
      
      <div 
        onClick={() => setView("home")}
        className="flex items-center space-x-3 cursor-pointer"
      >
        <img
          src="/logo.png"
          alt="SecureRent Logo"
          className="w-10 h-10 object-contain hover:scale-110 transition-transform duration-300"
        />
        <h1 className="text-2xl font-bold transform hover:scale-110 transition-transform duration-300">
          SecureRent
        </h1>
      </div>

      <div>
        <button
          onClick={() => setView("landlord")}
          className="mr-5 bg-white text-purple-800 px-4 py-2 rounded transform hover:scale-110 transition-transform duration-300"
        >
          Arrendador
        </button>
        <button
          onClick={() => setView("tenant")}
          className="mr-5 bg-white text-purple-800 px-4 py-2 rounded transform hover:scale-110 transition-transform duration-300"
        >
          Arrendatario
        </button>
      </div>

    </nav>
  );
}
