import { User } from "../types/express";

// In-memory users "database"
const users: User[] = [];
const vendors: User[] = [];

let userIdCounter = 1;
let vendorIdCounter = 1;

// Create a new user
export const createVendor = (
  email: string,
  password: string,
  name: string
): User => {
  const newUser = { id: String(vendorIdCounter++), email, password, name };
  vendors.push(newUser);
  return newUser;
};

// Find a user by email
export const findVendorByEmail = (email: string): User | undefined => {
  return vendors.find((user) => user.email === email);
};

// Find a user by ID
export const findVendorById = (id: string): User | undefined => {
  return vendors.find((user) => user.id === id);
};

// Create a new user
export const createUser = (
  email: string,
  password: string,
  name: string
): User => {
  const newUser = { id: String(userIdCounter++), email, password, name };
  users.push(newUser);
  return newUser;
};

// Find a user by email
export const findUserByEmail = (email: string): User | undefined => {
  return users.find((user) => user.email === email);
};

// Find a user by ID
export const findUserById = (id: string): User | undefined => {
  return users.find((user) => user.id === id);
};
