import { User } from './user.entity';

export interface UserRepository {
  createUser(user: Pick<User, 'email' | 'passwordHash'>): Promise<User>;

  getUserById(id: string): Promise<User | null>;

  getUserByEmail(email: string): Promise<User | null>;

  findUserByEmailWithPassword(
    email: string,
    password: string,
  ): Promise<User | null>;

  updateUser(id: string, updates: Partial<User>): Promise<User>;

  deleteUser(id: string): Promise<void>;
}
