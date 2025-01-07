import { User } from "../types/express.js";

export default abstract class RepositoryInterface {

    abstract findVendorByEmail(email: string): Promise<User | undefined>;
    abstract findVendorById(id: string): Promise<User | undefined>;
    abstract createVendor(
        email: string,
        password: string,
        name: string
    ): Promise<User>;

    abstract findUserByEmail(email: string): Promise<User | undefined>;
    abstract findUserById(id: string): Promise<User | undefined>;
    abstract createUser(email: string, password: string, name: string): Promise<User>;
    abstract updateUserPassword(id: string, password: string): Promise<User | undefined>;
    
}