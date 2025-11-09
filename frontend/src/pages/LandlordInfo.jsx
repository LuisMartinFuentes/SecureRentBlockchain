export default function LandlordInfo(){
    return(
        
    <div className="animate-fadeInUp select-none cursor-default">
        <div className="flex flex-col items-center justify-center text-center mt-17">
            <h1 className="select-none cursor-default text-5xl font-bold text-black-700 mb-4">
                Bienvenido, Arrendador
            </h1>

        </div>

        <div>
            <p className="justify-center text-center text-white max-w-md text-xl mb-8 mt-4 ml-130">
            Administra tus propiedades y contratos de renta con total seguridad 
            y transparencia gracias a la tecnología blockchain.
            </p>

            <p className="mt-4 text-white max-w-2xl mx-auto leading-relaxed mr-100">
            Con nosotros podrás registrar tus propiedades, crear contratos inteligentes 
            con tus arrendatarios y verificar su firma digital. 
            Todo se almacena en la blockchain de Ethereum, garantizando que 
            la información sea inmutable y segura. 
            Para ingresar al Panel de Arrendador solo dale click al boton de la barra de navegacion
            que dice "Arrendador" y listo!!!
            </p>
            <ul className="mt-4 text-gray-300 space-y-2 text-left ml-105">
            <li>🔹 Crear contratos inteligentes de arrendamiento.</li>
            <li>🔹 Definir montos de renta en ETH.</li>
            <li>🔹 Verificar las firmas de los arrendatarios.</li>
            <li>🔹 Consultar tus contratos activos y su estado.</li>
            </ul>
        </div>  

        <div className="flex justify-between items-center w-full px-20 -mt-70">
        <img 
            src="/ArrendadorImg.png"
            alt="Arrendador Img"
            className="w-80 h-auto object-contain -ml-10 -mt-10"
        />

        <img 
            src="/Arrendador2Img.png"
            alt="Arrendador2 Img"
            className="w-64 h-auto object-contain"
        />
        </div>

    </div>
    );
}