export default function TenantInfo() {

    return (

        <div className="animate-fadeInUp select-none cursor-default px-4 pb-8">
            <div className="flex flex-col items-center justify-center text-center mt-10 md:mt-17">
                <h1 className="select-none cursor-default text-3xl md:text-5xl font-bold text-black-700 mb-4">
                    Bienvenido, Arrendatario
                </h1>
            </div>

            <div className="flex flex-col items-center">
                <p className="text-center text-white max-w-md text-lg md:text-xl mb-8 mt-4 mx-auto">
                    Firma y gestiona tus contratos de renta de forma segura,
                    sin intermediarios y con verificación en la blockchain.
                </p>

                <p className="mt-6 text-white max-w-2xl mx-auto leading-relaxed text-center md:text-left">
                    Con nosotros podrás revisar los contratos creados por tu arrendador,
                    validar los términos del acuerdo y firmar digitalmente con tu cuenta de MetaMask.
                    Todos los contratos quedan almacenados de manera pública y verificable en Ethereum.
                    Para ingresar al Panel de Arrendatario solo dale click al boton de la barra de navegacion
                    que dice "Arrendatario" y listo!!!
                </p>
                <ul className="mt-8 text-gray-300 space-y-2 text-left mx-auto max-w-md">
                    <li>🔹 Ver contratos disponibles para tu dirección.</li>
                    <li>🔹 Revisar los detalles del contrato antes de firmar.</li>
                    <li>🔹 Firmar electrónicamente en la blockchain.</li>
                    <li>🔹 Consultar tu historial de contratos firmados.</li>
                </ul>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center w-full px-4 md:px-20 mt-8 md:mt-0 gap-8 md:gap-0">
                <img
                    src="/Arrendatario2Img.png"
                    alt="Arrendador Img"
                    className="w-48 h-auto md:w-64 object-contain"
                />

                <img
                    src="/ArrendatarioImg.png"
                    alt="Arrendador2 Img"
                    className="w-60 h-auto md:w-80 object-contain"
                />
            </div>

        </div>
    );
}