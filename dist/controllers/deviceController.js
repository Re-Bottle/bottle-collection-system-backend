"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDeviceById = exports.findDeviceById = exports.findDevicesByVendor = exports.registerDevice = void 0;
// In-memory users "database"
const devices = new Map();
let deviceIdCounter = 1;
/**
 * This method is used by the device to register itself.
 * @param id If this is passed, it means the device is not calling the server for the first time and we dont need to create a new entry for it
 * @returns The device object with the latest updates
 */
const registerDevice = (id) => {
    // if id is null, create new dynamodb entry and get the id
    // else search for the id in the dynamodb and return the data + id
    if (id) {
        // Update the DynamoDB entry
        const deviceFound = devices.get(id);
        deviceFound.lastActionTimestamp = new Date();
        return deviceFound !== undefined ? deviceFound.deviceId : null;
    }
    else {
        // Create a new DynamoDB entry
        const tempDeviceID = String(deviceIdCounter++); // for testing
        const newDevice = {
            deviceId: tempDeviceID,
            deviceName: null,
            vendorId: null,
            deviceLocation: null,
            deviceFillLevel: 0,
            deviceDescription: null,
            claimableStatus: true,
            lastActionTimestamp: new Date(),
            deviceActiveStatus: true,
        };
        devices.set(tempDeviceID, newDevice);
        return tempDeviceID;
    }
};
exports.registerDevice = registerDevice;
const findDevicesByVendor = (vendorId) => {
    const result = [];
    devices.forEach((device) => {
        if (device.vendorId === vendorId) {
            result.push(device);
        }
    });
    return result;
};
exports.findDevicesByVendor = findDevicesByVendor;
// Find device by vendor
const findDeviceById = (deviceId) => devices.get(deviceId);
exports.findDeviceById = findDeviceById;
const updateDeviceById = (deviceId, device) => devices.set(deviceId, device);
exports.updateDeviceById = updateDeviceById;
