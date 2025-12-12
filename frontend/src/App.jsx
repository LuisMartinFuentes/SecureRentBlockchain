import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import Home from "./pages/Home";
import LandlordInfo from "./pages/landlord/LandlordInfo";
import LandlordProperties from "./pages/landlord/LandlordProperties";
import LandlordCreateContract from "./pages/landlord/LandlordCreateContract";
import LandlordContracts from "./pages/landlord/LandlordContracts";
import LandlordPayments from "./pages/landlord/LandlordPayments";
import TenantInfo from "./pages/tenant/TenantInfo";
import TenantContracts from "./pages/tenant/TenantContracts";
import TenantPayments from "./pages/tenant/TenantPayments";
import ExploreProperties from "./pages/properties/ExploreProperties";
import PropertyDetails from "./pages/properties/PropertyDetails";
import ContractDetails from "./pages/contracts/ContractDetails";

import { useWeb3 } from "./context/Web3Context";

export default function App() {
  const { account, disconnectWallet, loading } = useWeb3();
  const [view, setView] = useState("home");
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedContract, setSelectedContract] = useState(null);
  const [createContractData, setCreateContractData] = useState(null);

  useEffect(() => {
    // Inicializar estado si no existe
    if (!window.history.state) {
      window.history.replaceState({ view: "home" }, "");
    }

    const handlePopState = (event) => {
      if (event.state && event.state.view) {
        setView(event.state.view);
        if (event.state.selectedProperty) setSelectedProperty(event.state.selectedProperty);
        if (event.state.selectedContract) setSelectedContract(event.state.selectedContract);
        if (event.state.createContractData) setCreateContractData(event.state.createContractData);
      } else {
        // Fallback a home si no hay estado
        setView("home");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  if (loading)
    return (
      <div className="text-white text-center mt-20">
        Cargando Web3...
      </div>
    );

  function handleViewChange(newView, data = null) {
    // Actualizar estado local
    setView(newView);
    if (data && data.property) {
      setSelectedProperty(data.property);
    }
    if (data && data.contract) {
      setSelectedContract(data.contract);
    }
    if (data && data.createContractData) {
      setCreateContractData(data.createContractData);
    }

    // Actualizar historial
    const stateToPush = {
      view: newView,
      selectedProperty: data?.property || (newView === view ? selectedProperty : null), // Mantener si es la misma vista, o null? Mejor simplificar
      selectedContract: data?.contract || null,
      createContractData: data?.createContractData || null
    };

    // Si estamos cambiando de vista, hacemos push.
    // Por simplicidad, siempre push si cambia la vista o los datos relevantes.
    window.history.pushState(stateToPush, "");
  }

  function handleLogin() {
    handleViewChange("home");
  }

  function handleLogout() {
    disconnectWallet();
    setView("login");
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-700 text-white">

      {/* NAV solo si hay sesión */}
      {account && (
        <Navbar
          setView={handleViewChange}
          account={account}
          onLogout={handleLogout}
        />
      )}

      <main className="flex-grow p-6">

        {!account ? (
          <Login onLogin={handleLogin} />
        ) : (
          <>
            {view === "home" && <Home setView={handleViewChange} />}

            {view === "explore" && (
              <ExploreProperties
                setView={handleViewChange}
                setSelectedProperty={setSelectedProperty}
              />
            )}

            {/* LANDLORD */}
            {view === "landlordInfo" && <LandlordInfo />}
            {view === "landlordProperties" && <LandlordProperties setView={handleViewChange} />}
            {view === "landlordCreate" && <LandlordCreateContract initialData={createContractData} />}
            {view === "landlordContracts" && <LandlordContracts setView={handleViewChange} />}
            {view === "landlordPayments" && <LandlordPayments />}

            {/* TENANT */}

            {/* TENANT */}
            {view === "tenantInfo" && <TenantInfo />}
            {view === "tenantContracts" && <TenantContracts setView={handleViewChange} />}
            {view === "tenantPayments" && <TenantPayments />}

            {/* PROPERTY DETAILS */}
            {view === "propertyDetails" && (
              <PropertyDetails
                property={selectedProperty}
                setView={handleViewChange}
              />
            )}
            {view === "contractDetails" && (
              <ContractDetails
                contractData={selectedContract}
                setView={handleViewChange}
              />
            )}
          </>
        )}

      </main>

      <Footer />
    </div>
  );
}
