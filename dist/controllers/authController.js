"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUserById = exports.findUserByEmail = exports.createUser = exports.findVendorById = exports.findVendorByEmail = exports.createVendor = void 0;
// In-memory users "database"
const users = [];
const vendors = [];
let userIdCounter = 1;
let vendorIdCounter = 1;
// Create a new user
const createVendor = (email, password, name) => {
    const newUser = { id: String(vendorIdCounter++), email, password, name };
    vendors.push(newUser);
    return newUser;
};
exports.createVendor = createVendor;
// Find a user by email
const findVendorByEmail = (email) => {
    return vendors.find((user) => user.email === email);
};
exports.findVendorByEmail = findVendorByEmail;
// Find a user by ID
const findVendorById = (id) => {
    return vendors.find((user) => user.id === id);
};
exports.findVendorById = findVendorById;
// Create a new user
const createUser = (email, password, name) => {
    const newUser = { id: String(userIdCounter++), email, password, name };
    users.push(newUser);
    return newUser;
};
exports.createUser = createUser;
// Find a user by email
const findUserByEmail = (email) => {
    return users.find((user) => user.email === email);
};
exports.findUserByEmail = findUserByEmail;
// Find a user by ID
const findUserById = (id) => {
    return users.find((user) => user.id === id);
};
exports.findUserById = findUserById;
