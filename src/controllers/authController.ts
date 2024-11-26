import { User } from "../types/express";

// In-memory users "database"
const users: User[] = [];
let userIdCounter = 1;

// Create a new user
export const createUser = (username: string, password: string): User => {
  const newUser = { id: String(userIdCounter++), username, password };
  users.push(newUser);
  return newUser;
};

// Find a user by username
export const findUserByUsername = (username: string): User | undefined => {
  return users.find((user) => user.username === username);
};

// Find a user by ID
export const findUserById = (id: string): User | undefined => {
  return users.find((user) => user.id === id);
};
