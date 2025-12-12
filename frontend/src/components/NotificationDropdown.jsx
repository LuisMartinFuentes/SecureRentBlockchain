import React from "react";

export default function NotificationDropdown({ isOpen, onClose, notifications = [] }) {

    if (!isOpen) return null;

    return (
        <div className="absolute right-0 mt-2 w-80 bg-white text-gray-800 shadow-2xl rounded-xl z-50 overflow-hidden border border-gray-200 animate-fadeIn">
            <div className="bg-purple-600 text-white p-3 font-bold flex justify-between items-center">
                <span>Notificaciones</span>
                <button onClick={onClose} className="text-sm hover:text-gray-200">✕</button>
            </div>

            <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                        No tienes nuevas notificaciones.
                    </div>
                ) : (
                    notifications.map((n) => (
                        <div key={n.id} className={`p-3 border-b border-gray-100 hover:bg-gray-50 ${n.type === 'success' ? 'bg-green-50' : ''}`}>
                            <p className="text-sm">{n.message}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
