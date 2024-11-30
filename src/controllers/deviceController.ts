import { Device } from "../types/express";

// In-memory users "database"
const devices: Device[] = [];

let deviceIdCounter = 1;

/**
 * This method is used by the device to register itself.
 * @param id If this is passed, it means the device is not calling the server for the first time and we dont need to create a new entry for it
 * @returns The device object with the latest updates
 */
export const registerDevice = (id: String | null): String | null => {
  // if id is null, create new dynamodb entry and get the id
  // else search for the id in the dynamodb and return the data + id
  if (id) {
    // Update the DynamoDB entry
    const deviceFound = devices.find((device) => device.deviceId === id);
    deviceFound!.lastActionTimestamp = new Date();
    return deviceFound !== undefined ? deviceFound.deviceId : null;
  } else {
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
    devices.push(newDevice);
    return tempDeviceID;
  }
};

export const findDevicesByVendor = (vendorId: string): Device[] | undefined => {
  return devices.filter((device) => device.vendorId === vendorId);
};

// Find device by vendor
export const findDeviceById = (deviceId: string): Device | undefined => {
  return devices.find((device) => device.deviceId === deviceId);
};
