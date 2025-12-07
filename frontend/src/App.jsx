import React, { useState } from "react";
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

  if (loading)
    return (
      <div className="text-white text-center mt-20">
        Cargando Web3...
      </div>
    );



  function handleViewChange(newView, data = null) {
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
  }

  function handleLogin() {
    setView("home");
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
          setView={setView}
          account={account}
          onLogout={handleLogout}
        />
      )}

      <main className="flex-grow p-6">

        {!account ? (
          <Login onLogin={handleLogin} />
        ) : (
          <>
            {view === "home" && <Home setView={setView} />}

            {view === "explore" && (
              <ExploreProperties
                setView={setView}
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
