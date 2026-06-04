// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title ReportRegistry
/// @notice Contrato sencillo para registrar y verificar hashes de reportes ciudadanos en zkSYS
contract ReportRegistry {
    struct Report {
        string reportHash;
        uint256 timestamp;
    }

    mapping(string => Report) private reports;
    mapping(string => bool) private reportExists;

    event ReportRegistered(address indexed registrant, string reportHash, uint256 timestamp);

    /// @notice Registra un hash de reporte en la blockchain
    /// @param _hash El hash del reporte que se desea registrar
    function registerReportHash(string memory _hash) public {
require(bytes(_hash).length > 0, "El hash no puede estar vacio");
require(!reportExists[_hash], "Este hash ya fue registrado");

        reports[_hash] = Report({
            reportHash: _hash,
            timestamp: block.timestamp
        });
        reportExists[_hash] = true;

        emit ReportRegistered(msg.sender, _hash, block.timestamp);
    }

    /// @notice Verifica si un hash de reporte ya fue registrado
    /// @param _hash El hash del reporte a verificar
    /// @return exists True si el hash existe, false en caso contrario
    /// @return registeredAt Timestamp en el que se registró el hash (0 si no existe)
    function verifyReportHash(string memory _hash) public view returns (bool exists, uint256 registeredAt) {
        if (!reportExists[_hash]) {
            return (false, 0);
        }

        Report storage report = reports[_hash];
        return (true, report.timestamp);
    }
}
