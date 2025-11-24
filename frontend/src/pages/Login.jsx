import { useState } from "react";
import { useWeb3 } from "../context/Web3Context";
import MetaMaskFox3D from "../components/MetaMaskFox3D";
import ErrorAlert from "../components/ErrorAlert";

export default function Login({ onLogin }) {
  const { connectWallet } = useWeb3();
  const [error, setError] = useState("");

  async function handleConnect() {
    setError(""); // Limpiar errores previos
    try {
      await connectWallet();
      onLogin();
    } catch (err) {
      console.error(err);
      // Ignorar error de solicitud pendiente
      if (err.code === -32002) {
        setError("Ya hay una solicitud pendiente en MetaMask. Por favor revísala.");
        return;
      }
      setError("Error al conectar con MetaMask");
    }
  }

  return (
    <div className="flex flex-col md:flex-row w-full min-h-[83vh] text-white overflow-hidden">

      {/* Left Side - Text & Logo */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 to-black relative overflow-hidden p-4 md:p-0">

        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 md:mb-8 relative z-10 tracking-wider text-center">
          Bienvenido A
        </h1>

        <div className="relative z-10 mt-4 md:mt-8">
          <img
            src="/logo.png"
            alt="SecureRent Logo"
            className="w-40 h-40 md:w-80 md:h-80 object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
          />
        </div>

      </div>

      <div className="w-full md:w-1/2 flex flex-col items-center justify-center bg-black/90 p-8 relative z-10">

        <div className="mb-8">
          <MetaMaskFox3D onClick={handleConnect} />
        </div>

        <p className="mb-8 text-lg md:text-xl opacity-80 font-light tracking-wide text-center">
          Conéctate para continuar
        </p>

        <button
          onClick={handleConnect}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 md:px-12 py-3 md:py-4 rounded-full text-lg md:text-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-purple-500/50"
        >
          Conectar con MetaMask
        </button>

        <ErrorAlert message={error} />

      </div>
    </div>
  );
}
