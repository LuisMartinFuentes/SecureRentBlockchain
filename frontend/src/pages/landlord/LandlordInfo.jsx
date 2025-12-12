export default function LandlordInfo() {
    return (

        <div className="animate-fadeInUp select-none cursor-default px-4 pb-8">
            <div className="flex flex-col items-center justify-center text-center mt-10 md:mt-17">
                <h1 className="select-none cursor-default text-3xl md:text-5xl font-bold text-black-700 mb-4">
                    Bienvenido, Arrendador
                </h1>
            </div>

            <div className="flex flex-col items-center">
                <p className="text-center text-white max-w-md text-lg md:text-xl mb-8 mt-4 mx-auto">
                    Administra tus propiedades y contratos de renta con total seguridad
                    y transparencia gracias a la tecnología blockchain.
                </p>

                <p className="mt-4 text-white max-w-2xl mx-auto leading-relaxed text-center md:text-left">
                    Con nosotros podrás registrar tus propiedades, crear contratos inteligentes
                    con tus arrendatarios y verificar su firma digital.
                    Todo se almacena en la blockchain de Ethereum, garantizando que
                    la información sea inmutable y segura.
                    Para ingresar al Panel de Arrendador solo dale click al boton de la barra de navegacion
                    que dice "Arrendador" y listo!!!
                </p>
                <ul className="mt-4 text-gray-300 space-y-2 text-left mx-auto max-w-md">
                    <li>🔹 Crear contratos inteligentes de arrendamiento.</li>
                    <li>🔹 Definir montos de renta en ETH.</li>
                    <li>🔹 Verificar las firmas de los arrendatarios.</li>
                    <li>🔹 Consultar tus contratos activos y su estado.</li>
                </ul>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center w-full px-4 md:px-20 mt-8 md:mt-0 gap-8 md:gap-0">
                <img
                    src="/ArrendadorImg.png"
                    alt="Arrendador Img"
                    className="w-60 h-auto md:w-80 object-contain"
                />

                <img
                    src="/Arrendador2Img.png"
                    alt="Arrendador2 Img"
                    className="w-48 h-auto md:w-64 object-contain"
                />
            </div>

        </div>
    );
}