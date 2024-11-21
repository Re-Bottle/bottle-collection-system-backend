interface User {
  id: number;
  username: string;
  password: string;
}

// In-memory users "database"
const users: User[] = [];
let userIdCounter = 1;

// Create a new user
export const createUser = (username: string, password: string): User => {
  const newUser = { id: userIdCounter++, username, password };
  users.push(newUser);
  return newUser;
};

// Find a user by username
export const findUserByUsername = (username: string): User | undefined => {
  return users.find((user) => user.username === username);
};
