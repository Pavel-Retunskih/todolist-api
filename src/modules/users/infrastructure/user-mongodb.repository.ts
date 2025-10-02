import { UserRepository } from '../domain/user.repository';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument, UserSchema } from './user.schema';
import { User } from '../domain/user.entity';

@Injectable()
export class UserMongodbRepository implements UserRepository {
  constructor(
    @InjectModel(UserSchema.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async createUser(user: Pick<User, 'email' | 'passwordHash'>): Promise<User> {
    const newUser = new this.userModel({
      email: user.email,
      passwordHash: user.passwordHash,
    });
    const createdUser = await newUser.save();

    return new User(
      createdUser._id.toString(),
      createdUser.email,
      createdUser.passwordHash,
      createdUser.createdAt,
      createdUser.updatedAt,
    );
  }

  async updateUser(id: string, updates: User): Promise<User> {
    const { id: _, ...updateData } = updates;
    const updatedUser = await this.userModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      throw new Error(`User with ${id} not found`);
    }

    return new User(
      updatedUser._id.toString(),
      updatedUser.email,
      updatedUser.passwordHash,
      updatedUser.createdAt,
      updatedUser.updatedAt,
    );
  }

  async deleteUser(id: string): Promise<void> {
    await this.userModel.findByIdAndDelete(id);
  }

  async getUserById(id: string): Promise<User | null> {
    const currentUser = await this.userModel.findById(id).exec();
    if (!currentUser) return null;
    return new User(
      currentUser._id.toString(),
      currentUser.email,
      currentUser.passwordHash,
      currentUser.createdAt,
      currentUser.updatedAt,
    );
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const currentUser = await this.userModel.findOne({ email }).exec();
    if (!currentUser) return null;
    return new User(
      currentUser._id.toString(),
      currentUser.email,
      currentUser.passwordHash,
      currentUser.createdAt,
      currentUser.updatedAt,
    );
  }

  async findUserByEmailWithPassword(
    email: string,
    passwordHash: string,
  ): Promise<User | null> {
    const currentUser = await this.userModel
      .findOne({ email })
      .select('+passwordHash')
      .exec();

    if (!currentUser) return null;

    return new User(
      currentUser._id.toString(),
      currentUser.email,
      currentUser.passwordHash,
      currentUser.createdAt,
      currentUser.updatedAt,
    );
  }
}
