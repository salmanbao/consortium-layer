// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract IoT {
    // Structure to store IoT data details
    struct IoTData {
        string deviceID;
        string dataHash;   // Hash of IoT data for integrity
        uint timestamp;
        string status;     // "pending", "validated", or "rejected"
    }

    // Mapping to store IoT data by ID
    mapping(string => IoTData) public iotDataRecords;
    
    // Events for data submission, validation, and rejection
    event DataSubmitted(string indexed IndexedDataID,string dataID, string deviceID, string dataHash, uint timestamp);
    event DataValidated(string indexed IndexedDataID, string dataID, string status, uint updatedTimestamp);

    // Function to submit IoT data from a private blockchain
    function submitIoTData(
        string memory dataId,
        string memory deviceID, 
        string memory dataHash, 
        uint timestamp
    ) public returns (bytes32) {
        
        // Ensure this data has not been submitted before
        require(bytes(iotDataRecords[dataId].deviceID).length == 0, "Data already submitted");
        
        // Initialize the IoT data entry
        iotDataRecords[dataId] = IoTData({
            deviceID: deviceID,
            dataHash: dataHash,
            timestamp: timestamp,
            status: "pending"
        });

        emit DataSubmitted(dataId,dataId ,deviceID, dataHash, timestamp);
    }

    // Function to mark data as validated
    function validateData(string memory dataID) public {
        // Check that the data exists
        require(bytes(iotDataRecords[dataID].deviceID).length > 0, "Data does not exist");

        // Ensure data is still pending validation
        require(keccak256(abi.encodePacked(iotDataRecords[dataID].status)) == keccak256("pending"), "Data already validated or rejected");

        // Mark data as validated
        iotDataRecords[dataID].status = "validated";

        emit DataValidated(dataID,dataID, "validated",block.timestamp);
    }

    // Function to mark data as rejected
    function rejectData(string calldata dataID) public {
        // Check that the data exists
        require(bytes(iotDataRecords[dataID].deviceID).length > 0, "Data does not exist");

        // Ensure data is still pending validation
        require(keccak256(abi.encodePacked(iotDataRecords[dataID].status)) == keccak256("pending"), "Data already validated or rejected");

        // Mark data as rejected
        iotDataRecords[dataID].status = "rejected";
        emit DataValidated(dataID, dataID,"rejected",block.timestamp);

    }

    // Function to get the status of a data record
    function getDataStatus(string calldata dataID) public view returns (string memory) {
        require(bytes(iotDataRecords[dataID].deviceID).length > 0, "Data does not exist");
        return iotDataRecords[dataID].status;
    }
}
