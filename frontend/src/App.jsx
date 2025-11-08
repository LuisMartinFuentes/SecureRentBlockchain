import React, { useState } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Landlord from "./pages/Landlord";
import Tenant from "./pages/Tenant";
import Footer from "./components/Footer";

export default function App() {
  const [view, setView] = useState("home");

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 text-gray-900">
      <Navbar setView={setView} />

      <main className="flex-grow p-6">
        {view === "home" && <Home setView={setView} />}
        {view === "landlord" && <Landlord />}
        {view === "tenant" && <Tenant />}
      </main>

      <Footer />

    </div>
  );
}
