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

  const [unreadCount, setUnreadCount] = useState(0);

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

      // 3. Evento RentRequested (Para Arrendador: "Alguien quiere rentar tu propiedad")
      const filterRequested = contract.filters.RentRequested(null, null);
      const eventsRequested = await contract.queryFilter(filterRequested);

      // Filtrar solicitudes para mis propiedades
      // Optimizacion: Obtener dueños de las propiedades involucradas
      const requestedNotifications = [];
      for (const e of eventsRequested) {
        try {
          // Verificar si ya existe el contrato activo para no notificar cosas viejas? 
          // O simplemente notificar todo. El usuario quiere saber si le mandaron solicitud.

          // Verificar dueño de la propiedad
          const propId = e.args[0];
          const prop = await contract.getProperty(propId);

          if (prop.owner.toLowerCase() === account.toLowerCase()) {
            requestedNotifications.push({
              id: e.transactionHash + "requested",
              type: "info",
              message: `¡Solicitud de Renta! El usuario ${e.args[1].slice(0, 6)}... quiere rentar tu propiedad #${propId}.`,
              time: "Reciente"
            });
          }
        } catch (err) {
          console.error("Error procesando request event", err);
        }
      }

      // 4. Evento ContractCreated (Para Inquilino: "El dueño creó el contrato")
      // ContractCreated(uint256 contractId, uint256 propertyId, address landlord, address tenant, ...)
      // Asumimos que el tenant es el arg 3 (índice 3) o revisamos filtros.
      // Si no estamos seguros de la estructura, consultamos logs sin filtro y vemos args.
      const filterCreated = contract.filters.ContractCreated(null, null, null, null);
      const eventsCreated = await contract.queryFilter(filterCreated);

      const createdNotifications = eventsCreated
        .filter(e => e.args[3] && e.args[3].toLowerCase() === account.toLowerCase()) // Asumiendo args[3] es tenant
        .map(e => ({
          id: e.transactionHash + "created",
          type: "success",
          message: `¡Contrato Creado! El dueño ha generado el contrato #${e.args[0]} para la propiedad #${e.args[1]}.`,
          time: "Reciente"
        }));

      const allNotifications = [...signedNotifications, ...paymentReceived, ...paymentSent, ...requestedNotifications, ...createdNotifications];
      setNotifications(allNotifications);

      // Calcular no leídas
      const readIds = JSON.parse(localStorage.getItem(`secureRent_read_${account}`) || "[]");
      const unread = allNotifications.filter(n => !readIds.includes(n.id)).length;
      setUnreadCount(unread);

    } catch (err) {
      console.error("Error cargando notificaciones", err);
    }
  }

  function markAsRead() {
    if (unreadCount > 0) {
      const readIds = JSON.parse(localStorage.getItem(`secureRent_read_${account}`) || "[]");
      const newIds = notifications.map(n => n.id);
      // Combinar y guardar únicos
      const uniqueIds = [...new Set([...readIds, ...newIds])];
      localStorage.setItem(`secureRent_read_${account}`, JSON.stringify(uniqueIds));
      setUnreadCount(0);
    }
  }

  // Mostrar solo los primeros y últimos caracteres de la wallet
  const shortAccount = account
    ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}`
    : "";

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="select-none cursor-default flex justify-between items-center p-4 bg-purple-500 text-white relative shadow-lg z-50">

      {/* LOGO + HOME */}
      <div
        onClick={() => setView("home")}
        className="flex items-center space-x-3 cursor-pointer flex-shrink-0"
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

      {/* DESKTOP MENU */}
      <div className="hidden md:flex space-x-6 items-center">

        {/* VER PROPIEDADES */}
        <div
          onClick={() => setView("explore")}
          className="flex items-center space-x-2 cursor-pointer bg-white text-purple-800 px-4 py-2 rounded-full shadow-md transform hover:scale-105 transition-all duration-300"
        >
          <img
            src="/Click AQUI PARA EXPLORAR LAS PROPIEDADES.png"
            alt="Explore"
            className="w-6 h-6 object-contain"
          />
          <span className="font-bold">Ver Propiedades</span>
        </div>

        {/* MENU ARRENDADOR */}
        <div
          className="relative"
          onMouseEnter={() => setOpenLandlordMenu(true)}
          onMouseLeave={() => setOpenLandlordMenu(false)}
        >
          <button
            className="bg-white text-purple-800 px-4 py-2 rounded transform hover:scale-110 transition-transform duration-300"
          >
            Menú de Arrendador ▼
          </button>

          {openLandlordMenu && (
            <div className="absolute right-0 mt-0 w-48 bg-white text-purple-800 shadow-lg rounded z-50 pt-2">
              <button onClick={() => setView("landlordProperties")} className="block w-full text-left px-4 py-2 hover:bg-purple-100">Mis Propiedades</button>
              <button onClick={() => setView("landlordContracts")} className="block w-full text-left px-4 py-2 hover:bg-purple-100">Contratos de Arrendador</button>
              <button onClick={() => setView("landlordPayments")} className="block w-full text-left px-4 py-2 hover:bg-purple-100">Historial de Cobros</button>
            </div>
          )}
        </div>

        {/* MENU ARRENDATARIO */}
        <div
          className="relative"
          onMouseEnter={() => setOpenTenantMenu(true)}
          onMouseLeave={() => setOpenTenantMenu(false)}
        >
          <button
            className="bg-white text-purple-800 px-4 py-2 rounded transform hover:scale-110 transition-transform duration-300"
          >
            Menú de Arrendatario ▼
          </button>

          {openTenantMenu && (
            <div className="absolute right-0 mt-0 w-48 bg-white text-purple-800 shadow-lg rounded z-50 pt-2">
              <button onClick={() => setView("tenantContracts")} className="block w-full text-left px-4 py-2 hover:bg-purple-100">Mis Contratos</button>
              <button onClick={() => setView("tenantPayments")} className="block w-full text-left px-4 py-2 hover:bg-purple-100">Historial de Pagos</button>
            </div>
          )}
        </div>

        {/* NOTIFICACIONES */}
        <div
          className="relative"
          onMouseEnter={() => {
            setOpenNotifications(true);
            markAsRead();
          }}
          onMouseLeave={() => setOpenNotifications(false)}
        >
          <button className="p-2 mr-4 text-white hover:text-yellow-300 transition-colors relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 block h-4 w-4 rounded-full bg-red-500 ring-2 ring-white text-xs flex items-center justify-center font-bold">
                {unreadCount}
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
        <div
          className="relative"
          onMouseEnter={() => setOpenUserMenu(true)}
          onMouseLeave={() => setOpenUserMenu(false)}
        >
          <button className="bg-purple-700 px-4 py-2 rounded hover:bg-purple-800 transition-all">
            {shortAccount} ▼
          </button>
          {openUserMenu && (
            <div className="absolute right-0 mt-0 w-48 bg-white text-purple-800 shadow-lg rounded z-50 pt-2">
              <button onClick={() => { setShowAccountInfo(true); setOpenUserMenu(false); }} className="block w-full text-left px-4 py-2 hover:bg-purple-100">Información de la cuenta</button>
              <button onClick={onLogout} className="block w-full text-left px-4 py-2 hover:bg-purple-100 text-red-600 font-bold">Cerrar Sesión</button>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE MENU BUTTON */}
      <div className="md:hidden flex items-center">
        {/* Notificaciones en Mobile (fuera del menú hamburguesa para acceso rápido) */}
        <div className="relative mr-4" onClick={() => { setOpenNotifications(!openNotifications); markAsRead(); }}>
          <button className="p-1 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-red-500 ring-1 ring-white"></span>
            )}
          </button>
          {/* Dropdown de notificaciones en mobile */}
          {openNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-white text-black rounded shadow-xl z-50 overflow-hidden">
              <NotificationDropdown isOpen={true} onClose={() => setOpenNotifications(false)} notifications={notifications} />
            </div>
          )}
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-white hover:text-purple-200 focus:outline-none"
        >
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-purple-600 px-4 pt-2 pb-4 space-y-2 shadow-inner z-50">
          <button
            onClick={() => { setView("explore"); setIsMobileMenuOpen(false); }}
            className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-purple-700"
          >
            🏠 Ver Propiedades
          </button>

          <div className="border-t border-purple-500 pt-2">
            <p className="px-3 text-xs font-semibold text-purple-200 uppercase tracking-wider">Arrendador</p>
            <button onClick={() => { setView("landlordProperties"); setIsMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-purple-700 pl-6">Mis Propiedades</button>
            <button onClick={() => { setView("landlordContracts"); setIsMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-purple-700 pl-6">Contratos</button>
            <button onClick={() => { setView("landlordPayments"); setIsMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-purple-700 pl-6">Cobros</button>
          </div>

          <div className="border-t border-purple-500 pt-2">
            <p className="px-3 text-xs font-semibold text-purple-200 uppercase tracking-wider">Arrendatario</p>
            <button onClick={() => { setView("tenantContracts"); setIsMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-purple-700 pl-6">Mis Contratos</button>
            <button onClick={() => { setView("tenantPayments"); setIsMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-purple-700 pl-6">Pagos</button>
          </div>

          <div className="border-t border-purple-500 pt-2">
            <button onClick={() => { setShowAccountInfo(true); setIsMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-purple-700">Mi Cuenta ({shortAccount})</button>
            <button onClick={() => { onLogout(); setIsMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-300 hover:bg-purple-700">Cerrar Sesión</button>
          </div>
        </div>
      )}

      {/* MODAL DE INFORMACIÓN */}
      <AccountInfoModal
        isOpen={showAccountInfo}
        onClose={() => setShowAccountInfo(false)}
      />

    </nav>
  );
}
