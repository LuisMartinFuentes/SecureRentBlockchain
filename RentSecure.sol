// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title RentSecure
 * @dev Sistema de renta con propiedades, contratos y pagos mensuales en ETH.
 */
contract RentSecure {
    // ----------------------------
    // Estructuras de datos
    // ----------------------------

    enum ContractStatus {
        PendingSignature,  // Creado por el arrendador, esperando firma
        Active,            // Firmado por el arrendatario
        Finished,          // Todos los meses pagados
        Cancelled          // Cancelado por el arrendador
    }

    struct Property {
        uint256 id;
        address owner;           // Arrendador
        string description;      // Dirección o descripción del inmueble
        bool isAvailable;        // Disponible para nuevos contratos
    }

    struct RentContract {
        uint256 id;
        uint256 propertyId;
        address landlord;
        address tenant;
        uint256 monthlyRent;     // en wei
        uint8 totalMonths;       // 6, 12, 24, etc.
        uint8 monthsPaid;        // cuántos meses se han pagado
        uint256 startDate;       // timestamp cuando se activa
        uint256 endDate;         // timestamp cuando termina el plazo
        ContractStatus status;
    }

    struct RentRequest {
        address tenant;
        uint256 timestamp;
        bool active;
    }

    // ----------------------------
    // Variables de estado
    // ----------------------------

    uint256 public propertyCounter;
    uint256 public contractCounter;

    mapping(uint256 => Property) public properties;          // propertyId => Property
    mapping(uint256 => RentContract) public contracts;       // contractId => RentContract
    mapping(uint256 => RentRequest[]) public propertyRequests; // propertyId => Requests

    // Para consultas rápidas
    mapping(address => uint256[]) public landlordContracts;  // landlord => [contractIds]
    mapping(address => uint256[]) public tenantContracts;    // tenant => [contractIds]

    // ----------------------------
    // Eventos
    // ----------------------------

    event PropertyCreated(
        uint256 indexed propertyId,
        address indexed owner,
        string description
    );

    event ContractCreated(
        uint256 indexed contractId,
        uint256 indexed propertyId,
        address indexed landlord,
        address tenant,
        uint256 monthlyRent,
        uint8 totalMonths
    );

    event ContractSigned(
        uint256 indexed contractId,
        address indexed tenant
    );

    event RentPaid(
        uint256 indexed contractId,
        address indexed tenant,
        uint256 amount,
        uint8 monthsPaid
    );

    event ContractFinished(
        uint256 indexed contractId
    );

    event ContractCancelled(
        uint256 indexed contractId
    );

    event RentRequested(
        uint256 indexed propertyId,
        address indexed tenant
    );

    // ----------------------------
    // Modificadores
    // ----------------------------

    modifier onlyLandlord(uint256 _contractId) {
        require(
            msg.sender == contracts[_contractId].landlord,
            "Solo el arrendador puede realizar esta accion"
        );
        _;
    }

    modifier onlyTenant(uint256 _contractId) {
        require(
            msg.sender == contracts[_contractId].tenant,
            "Solo el arrendatario puede realizar esta accion"
        );
        _;
    }

    // ----------------------------
    // Gestión de propiedades
    // ----------------------------

    /**
     * @dev Crea una nueva propiedad disponible para renta.
     * @param _description Dirección o descripcion del inmueble.
     */
    function createProperty(string memory _description) external {
        require(bytes(_description).length > 0, "Descripcion requerida");

        propertyCounter++;
        properties[propertyCounter] = Property({
            id: propertyCounter,
            owner: msg.sender,
            description: _description,
            isAvailable: true
        });

        emit PropertyCreated(propertyCounter, msg.sender, _description);
    }

    /**
     * @dev Cambia el estado de disponibilidad de una propiedad.
     */
    function setPropertyAvailability(uint256 _propertyId, bool _available) external {
        Property storage prop = properties[_propertyId];
        require(prop.id != 0, "Propiedad inexistente");
        require(prop.owner == msg.sender, "Solo el propietario puede cambiar disponibilidad");

        prop.isAvailable = _available;
    }

    /**
     * @dev Permite a un usuario solicitar rentar una propiedad.
     */
    function requestRent(uint256 _propertyId) external {
        Property storage prop = properties[_propertyId];
        require(prop.id != 0, "Propiedad inexistente");
        require(prop.isAvailable, "Propiedad no disponible");
        require(prop.owner != msg.sender, "El dueno no puede solicitar su propia propiedad");

        // Verificar si ya solicito (opcional, simple check)
        // Por simplicidad permitimos multiples o lo dejamos asi.
        
        propertyRequests[_propertyId].push(RentRequest({
            tenant: msg.sender,
            timestamp: block.timestamp,
            active: true
        }));

        emit RentRequested(_propertyId, msg.sender);
    }

    // ----------------------------
    // Gestión de contratos
    // ----------------------------

    /**
     * @dev Crea un contrato de renta sobre una propiedad existente.
     * @param _propertyId ID de la propiedad registrada.
     * @param _tenant Dirección del arrendatario (wallet que firmará y pagará).
     * @param _monthlyRent Renta mensual en wei.
     * @param _totalMonths Plazo total en meses (6, 12, 24, etc.).
     */
    function createRentContract(
        uint256 _propertyId,
        address _tenant,
        uint256 _monthlyRent,
        uint8 _totalMonths
    ) external {
        Property storage prop = properties[_propertyId];

        require(prop.id != 0, "Propiedad inexistente");
        require(prop.owner == msg.sender, "Solo el propietario puede crear contratos");
        require(prop.isAvailable, "La propiedad no esta disponible");
        require(_tenant != address(0), "Arrendatario invalido");
        require(_monthlyRent > 0, "Renta mensual debe ser mayor a 0");
        require(_totalMonths > 0, "Meses totales debe ser mayor a 0");

        contractCounter++;

        contracts[contractCounter] = RentContract({
            id: contractCounter,
            propertyId: _propertyId,
            landlord: msg.sender,
            tenant: _tenant,
            monthlyRent: _monthlyRent,
            totalMonths: _totalMonths,
            monthsPaid: 0,
            startDate: 0,
            endDate: 0,
            status: ContractStatus.PendingSignature
        });

        landlordContracts[msg.sender].push(contractCounter);
        tenantContracts[_tenant].push(contractCounter);

        emit ContractCreated(
            contractCounter,
            _propertyId,
            msg.sender,
            _tenant,
            _monthlyRent,
            _totalMonths
        );
    }

    /**
     * @dev El arrendatario firma el contrato para activarlo.
     *      A partir de aquí ya puede pagar la renta mensual.
     */
    function signRentContract(uint256 _contractId) external onlyTenant(_contractId) {
        RentContract storage rc = contracts[_contractId];

        require(rc.status == ContractStatus.PendingSignature, "El contrato no esta pendiente de firma");

        rc.status = ContractStatus.Active;
        rc.startDate = block.timestamp;
        rc.endDate = block.timestamp + (uint256(rc.totalMonths) * 30 days); // aproximacion

        emit ContractSigned(_contractId, msg.sender);
    }

    /**
     * @dev El arrendador puede cancelar un contrato antes de que sea firmado
     *      o, dependiendo del caso de uso, por incumplimiento.
     */
    function cancelContract(uint256 _contractId) external onlyLandlord(_contractId) {
        RentContract storage rc = contracts[_contractId];
        require(
            rc.status == ContractStatus.PendingSignature || rc.status == ContractStatus.Active,
            "Solo contratos pendientes o activos pueden cancelarse"
        );

        rc.status = ContractStatus.Cancelled;
        emit ContractCancelled(_contractId);
    }

    // ----------------------------
    // Pagos de renta
    // ----------------------------

    /**
     * @dev Paga un mes de renta. Debe enviarse exactamente monthlyRent en msg.value.
     *      El ETH se transfiere de inmediato al arrendador.
     */
    function payMonthlyRent(uint256 _contractId) external payable onlyTenant(_contractId) {
        RentContract storage rc = contracts[_contractId];

        require(rc.status == ContractStatus.Active, "El contrato no esta activo");
        require(rc.monthsPaid < rc.totalMonths, "Todos los meses ya fueron pagados");
        require(msg.value == rc.monthlyRent, "Monto enviado distinto a la renta mensual");

        // Transferir al arrendador
        (bool sent, ) = rc.landlord.call{value: msg.value}("");
        require(sent, "Fallo la transferencia al arrendador");

        // Actualizar estado
        rc.monthsPaid += 1;

        emit RentPaid(_contractId, msg.sender, msg.value, rc.monthsPaid);

        // Si ya se pagaron todos los meses, cerrar contrato
        if (rc.monthsPaid == rc.totalMonths) {
            rc.status = ContractStatus.Finished;
            emit ContractFinished(_contractId);
        }
    }

    // ----------------------------
    // Funciones de consulta (views)
    // ----------------------------

    function getContractsByLandlord(address _landlord)
        external
        view
        returns (uint256[] memory)
    {
        return landlordContracts[_landlord];
    }

    function getContractsByTenant(address _tenant)
        external
        view
        returns (uint256[] memory)
    {
        return tenantContracts[_tenant];
    }

    function getProperty(uint256 _propertyId)
        external
        view
        returns (Property memory)
    {
        return properties[_propertyId];
    }

    function getRentContract(uint256 _contractId)
        external
        view
        returns (RentContract memory)
    {
        return contracts[_contractId];
    }

    function getPropertyRequests(uint256 _propertyId)
        external
        view
        returns (RentRequest[] memory)
    {
        return propertyRequests[_propertyId];
    }
}
