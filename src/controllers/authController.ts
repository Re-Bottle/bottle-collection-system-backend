import { User } from "../types/express";

// In-memory users "database"
const users: User[] = [];
let userIdCounter = 1;

// Create a new user
export const createUser = (email: string, password: string, name: string): User => {
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
