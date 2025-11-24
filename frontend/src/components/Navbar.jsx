import { useState, useEffect } from "react";
import AccountInfoModal from "./AccountInfoModal";
import NotificationDropdown from "./NotificationDropdown";
import { useWeb3 } from "../context/Web3Context";

export default function Navbar({ setView, account, onLogout }) {
  const { contract } = useWeb3();

  const [openTenantMenu, setOpenTenantMenu] = useState(false);
  const [openLandlordMenu, setOpenLandlordMenu] = useState(false);
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const [showAccountInfo, setShowAccountInfo] = useState(false);
  const [openNotifications, setOpenNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Cargar notificaciones
  useEffect(() => {
    if (contract && account) {
      loadNotifications();
    }
  }, [contract, account]);

  async function loadNotifications() {
    try {
      // 1. Evento ContractSigned (Para Arrendador: "El inquilino aceptó/firmó")
      const filterSigned = contract.filters.ContractSigned(null, null);
      const eventsSigned = await contract.queryFilter(filterSigned);

      // Obtener mis contratos como Landlord para filtrar
      const myLandlordContracts = await contract.getContractsByLandlord(account);
      const myLandlordContractIds = myLandlordContracts.map(id => id.toString());

      const signedNotifications = eventsSigned
        .filter((e) => myLandlordContractIds.includes(e.args[0].toString()))
        .map((e) => ({
          id: e.transactionHash + "signed",
          type: "success",
          message: `¡Contrato Aceptado! El inquilino ${e.args[1].slice(0, 6)}... ha firmado el contrato #${e.args[0]}.`,
          time: "Reciente"
        }));

      // 2. Evento RentPaid (Pagos realizados)
      const filterPaid = contract.filters.RentPaid(null, null, null, null);
      const eventsPaid = await contract.queryFilter(filterPaid);

      // A) Para el Arrendador: "Recibiste un pago"
      const paymentReceived = eventsPaid
        .filter((e) => myLandlordContractIds.includes(e.args[0].toString()))
        .map((e) => ({
          id: e.transactionHash + "paid_received",
          type: "success",
          message: `¡Pago Recibido! Contrato #${e.args[0]}: ${e.args[2]} wei pagados por el inquilino.`,
          time: "Reciente"
        }));

      // B) Para el Inquilino: "Tu pago fue confirmado"
      // El evento RentPaid tiene (contractId, tenant, amount, monthsPaid)
      // args[1] es tenant
      const paymentSent = eventsPaid
        .filter((e) => e.args[1].toLowerCase() === account.toLowerCase())
        .map((e) => ({
          id: e.transactionHash + "paid_sent",
          type: "info",
          message: `¡Pago Confirmado! Has pagado ${e.args[2]} wei para el contrato #${e.args[0]}.`,
          time: "Reciente"
        }));

      setNotifications([...signedNotifications, ...paymentReceived, ...paymentSent]);

    } catch (err) {
      console.error("Error cargando notificaciones", err);
    }
  }

  // Mostrar solo los primeros y últimos caracteres de la wallet
  const shortAccount = account
    ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}`
    : "";

  return (
    <nav className="select-none cursor-default flex justify-between items-center p-4 bg-purple-500 text-white relative">

      {/* LOGO + HOME */}
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


      {/* MENÚS */}
      <div className="flex space-x-6 items-center">

        {/* MENU ARRENDADOR */}
        <div className="relative">
          <button
            onClick={() => {
              setOpenLandlordMenu(!openLandlordMenu);
              setOpenTenantMenu(false);
              setOpenUserMenu(false);
            }}
            className="bg-white text-purple-800 px-4 py-2 rounded
            transform hover:scale-110 transition-transform duration-300"
          >
            Arrendador ▼
          </button>

          {openLandlordMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white text-purple-800 shadow-lg rounded z-50">
              <button
                onClick={() => setView("landlordProperties")}
                className="block w-full text-left px-4 py-2 hover:bg-purple-100"
              >
                Mis Propiedades
              </button>

              <button
                onClick={() => setView("landlordContracts")}
                className="block w-full text-left px-4 py-2 hover:bg-purple-100"
              >
                Contratos de Arrendador
              </button>

              <button
                onClick={() => setView("landlordPayments")}
                className="block w-full text-left px-4 py-2 hover:bg-purple-100"
              >
                Historial de Cobros
              </button>

              <button
                onClick={() => setView("landlordCreate")}
                className="block w-full text-left px-4 py-2 hover:bg-purple-100"
              >
                Crear Contrato
              </button>
            </div>
          )}
        </div>

        {/* MENU ARRENDATARIO */}
        <div className="relative">
          <button
            onClick={() => {
              setOpenTenantMenu(!openTenantMenu);
              setOpenLandlordMenu(false);
              setOpenUserMenu(false);
            }}
            className="bg-white text-purple-800 px-4 py-2 rounded
            transform hover:scale-110 transition-transform duration-300"
          >
            Arrendatario ▼
          </button>

          {openTenantMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white text-purple-800 shadow-lg rounded z-50">
              <button
                onClick={() => setView("tenantContracts")}
                className="block w-full text-left px-4 py-2 hover:bg-purple-100"
              >
                Mis Contratos
              </button>

              <button
                onClick={() => setView("tenantPayments")}
                className="block w-full text-left px-4 py-2 hover:bg-purple-100"
              >
                Historial de Pagos
              </button>
            </div>
          )}
        </div>

        {/* NOTIFICACIONES */}
        <div className="relative">
          <button
            onClick={() => setOpenNotifications(!openNotifications)}
            className="p-2 mr-4 text-white hover:text-yellow-300 transition-colors relative"
          >
            {/* Bell Icon SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {/* Badge Real */}
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 block h-4 w-4 rounded-full bg-red-500 ring-2 ring-white text-xs flex items-center justify-center font-bold">
                {notifications.length}
              </span>
            )}
          </button>

          <NotificationDropdown
            isOpen={openNotifications}
            onClose={() => setOpenNotifications(false)}
            notifications={notifications}
          />
        </div>

        {/* USUARIO / WALLET */}
        <div className="relative">
          <button
            onClick={() => {
              setOpenUserMenu(!openUserMenu);
              setOpenTenantMenu(false);
              setOpenLandlordMenu(false);
            }}
            className="bg-purple-700 px-4 py-2 rounded hover:bg-purple-800 transition-all"
          >
            {shortAccount} ▼
          </button>

          {openUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white text-purple-800 shadow-lg rounded z-50">
              <button
                onClick={() => {
                  setShowAccountInfo(true);
                  setOpenUserMenu(false);
                }}
                className="block w-full text-left px-4 py-2 hover:bg-purple-100"
              >
                Información de la cuenta
              </button>
              <button
                onClick={onLogout}
                className="block w-full text-left px-4 py-2 hover:bg-purple-100 text-red-600 font-bold"
              >
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>

      </div>

      {/* MODAL DE INFORMACIÓN */}
      <AccountInfoModal
        isOpen={showAccountInfo}
        onClose={() => setShowAccountInfo(false)}
      />

    </nav>
  );
}
