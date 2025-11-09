import React, { useState } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Landlord from "./pages/Landlord";
import LandlordInfo from "./pages/LandlordInfo";
import Tenant from "./pages/Tenant";
import TenantInfo from "./pages/TenantInfo";
import Footer from "./components/Footer";

export default function App() {
  const [view, setView] = useState("home");

  return (
    <div className="flex flex-col text-gray-900 min-h-screen bg-zinc-700 text-white">
      <Navbar setView={setView} />

      <main className="flex-grow p-6">
        {view === "home" && <Home setView={setView} />}
        {view === "landlordInfo" && <LandlordInfo />}
        {view === "tenantInfo" && <TenantInfo />}
        {view === "landlord" && <Landlord />}
        {view === "tenant" && <Tenant />}

      </main>

      <Footer />

    </div>
  );
}
