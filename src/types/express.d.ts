export interface User {
  id: string;
  username: string;
  password: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
