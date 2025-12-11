import React from "react";

export default function StatusModal({
    isOpen,
    onClose,
    title,
    message,
    type = "info", // info, success, error, warning
    onConfirm,
    confirmText = "Aceptar",
    cancelText = "Cancelar"
}) {
    if (!isOpen) return null;

    const isConfirm = !!onConfirm;

    // Colors based on type
    let titleColor = "text-purple-400";
    let borderColor = "border-gray-600";

    if (type === "success") {
        titleColor = "text-green-400";
        borderColor = "border-green-500/30";
    } else if (type === "error") {
        titleColor = "text-red-400";
        borderColor = "border-red-500/30";
    } else if (type === "warning") {
        titleColor = "text-yellow-400";
        borderColor = "border-yellow-500/30";
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn">
            <div className={`bg-gray-800/95 backdrop-blur-xl text-white p-6 rounded-2xl shadow-2xl w-full max-w-md relative border ${borderColor}`}>

                {/* Close Button (only if not a confirmation modal, or strictly optional) */}
                {!isConfirm && (
                    <button
                        onClick={onClose}
                        className="absolute top-2 right-2 text-gray-400 hover:text-white text-2xl font-bold"
                    >
                        &times;
                    </button>
                )}

                <h2 className={`text-2xl font-bold mb-4 text-center ${titleColor}`}>
                    {title}
                </h2>

                <p className="text-center text-gray-300 mb-8 text-lg">
                    {message}
                </p>

                <div className="flex justify-center gap-4">
                    {isConfirm ? (
                        <>
                            <button
                                onClick={onClose}
                                className="px-6 py-2 rounded-xl bg-gray-600 hover:bg-gray-500 text-white font-semibold transition-colors"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                className={`px-6 py-2 rounded-xl font-semibold transition-colors text-white
                  ${type === 'warning' ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'}
                `}
                            >
                                {confirmText}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onClose}
                            className="px-8 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-colors"
                        >
                            Aceptar
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}
