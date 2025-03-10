import { Device, Reward, Scan, User } from "../types/express.js";

export default abstract class RepositoryInterface {
  // Vendor Table Actions
  abstract findVendorByEmail(email: string): Promise<User | undefined>;
  abstract findVendorById(id: string): Promise<User | undefined>;
  abstract createVendor(
    email: string,
    password: string,
    name: string
  ): Promise<User>;
  abstract deleteVendor(id: string): Promise<boolean>;

  // User Table Actions
  abstract findUserByEmail(email: string): Promise<User | undefined>;
  abstract findUserById(id: string): Promise<User | undefined>;
  abstract createUser(
    email: string,
    password: string,
    name: string
  ): Promise<User>;
  abstract updateUserPassword(
    id: string,
    password: string
  ): Promise<User | undefined>;
  abstract updateUserName(id: string, name: string): Promise<User | undefined>;
  abstract deleteUser(id: string): Promise<boolean>;

  // Device Table Actions
  abstract createDevice(deviceId: string, macAddress: string): Promise<void>;
  abstract registerDevice(
    id: string,
    vendorId: string,
    deviceName: string,
    deviceLocation: string,
    deviceDescription: string
  ): Promise<any>;
  abstract getDevice(id: string): Promise<Device | undefined>;
  abstract findDevicesByVendor(vendorId: string): Promise<Device[] | undefined>;
  abstract findDeviceById(id: string): Promise<Device | undefined>;
  abstract updateDeviceTimestamp(
    id: string,
    wasProvisioned: Boolean
  ): Promise<Device>;
  abstract updateDeviceDetails(
    id: string,
    deviceName: string,
    deviceLocation: string,
    deviceDescription: string
  ): Promise<boolean>;
  abstract deleteDevice(id: string): Promise<boolean>;

  // Reward Table Actions
  abstract getRewards(): Promise<Reward[] | undefined>;

  // Scan Table Actions
  abstract createScan(deviceId: string, scanData: string): Promise<Scan>;
  abstract getScanByData(scanData: string): Promise<Scan[]>;
  abstract updateScanUserId(scanData: string, userId: string): Promise<Scan>;
  abstract getScans(): Promise<Scan>;
  // abstract getScansByDevice(deviceId: string): Promise<Scan>;
  abstract getScansByUser(userId: string): Promise<Scan>;
}
