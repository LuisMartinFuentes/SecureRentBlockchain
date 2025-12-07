import { useState } from "react";
import LandlordInfo from "./landlord/LandlordInfo";
import TenantInfo from "./tenant/TenantInfo";

export default function Home({ setView }) {
  const [expandedSection, setExpandedSection] = useState(null);

  return (
    <div className="animate-fadeInUp flex flex-col items-center justify-center text-center mt-10 md:mt-16 px-4">
      <h1 className="select-none cursor-default text-5xl md:text-7xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-purple-500 to-purple-700 animate-pulse drop-shadow-sm"
      >🏠 Bienvenido a SecureRent 🏠</h1>
      <p className="select-none cursor-default text-white max-w-2xl text-2xl md:text-3xl mb-16 mt-4 leading-relaxed animate-float">
        Gestiona y crea contratos de arrendamiento de forma segura y transparente mediante blockchain.
      </p>

      <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto mt-4 mb-12">
        <button
          onClick={() => setExpandedSection(expandedSection === "landlord" ? null : "landlord")}
          className={`select-none cursor-default text-white text-lg font-semibold px-8 md:px-14 py-3 md:py-2 rounded hover:scale-110 transition-all duration-300 w-full md:w-auto
            ${expandedSection === "landlord" ? "bg-purple-800 ring-2 ring-purple-400" : "bg-purple-600 hover:bg-purple-700"}`}
        >
          Soy Arrendador
        </button>
        <button
          onClick={() => setExpandedSection(expandedSection === "tenant" ? null : "tenant")}
          className={`select-none cursor-default text-white text-lg font-semibold px-8 md:px-14 py-3 md:py-2 rounded hover:scale-110 transition-all duration-300 w-full md:w-auto
            ${expandedSection === "tenant" ? "bg-purple-800 ring-2 ring-purple-400" : "bg-purple-600 hover:bg-purple-700"}`}
        >
          Soy Arrendatario
        </button>
      </div>

      {/* SECCIONES DESPLEGABLES */}
      <div className="w-full max-w-6xl mx-auto transition-all duration-500 ease-in-out overflow-hidden">

        {expandedSection === "landlord" && (
          <div className="animate-fadeInUp bg-gray-900/50 rounded-3xl p-8 border border-purple-500/30 shadow-2xl">
            <LandlordInfo />
          </div>
        )}

        {expandedSection === "tenant" && (
          <div className="animate-fadeInUp bg-gray-900/50 rounded-3xl p-8 border border-purple-500/30 shadow-2xl">
            <TenantInfo />
          </div>
        )}

      </div>

    </div>
  );
}
