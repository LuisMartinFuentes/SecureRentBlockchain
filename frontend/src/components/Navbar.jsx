export default function Navbar({ setView }) {
  return (
    <nav className="select-none cursor-default
    flex justify-between items-center p-4 bg-purple-500 text-white">
      <h1
      onClick={() => setView("home")} 
      className="ml-3 text-2xl font-bold transform hover:scale-115 transition-transform duration-300"
      >SecureRent</h1>
      <div>
        <button
          onClick={() => setView("landlord")}
          className="mr-5 bg-white text-purple-800 px-4 py-2 rounded 
          transform hover:scale-115 transition-transform duration-300" 
        >
          Arrendador
        </button>
        <button
          onClick={() => setView("tenant")}
          className="mr-5 bg-white text-purple-800 px-4 py-2 rounded 
          transform hover:scale-115 transition-transform duration-300"
        >
          Arrendatario
        </button>
      </div>
    </nav>
  );
}
