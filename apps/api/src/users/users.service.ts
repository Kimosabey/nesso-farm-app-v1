import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';

const BCRYPT_ROUNDS = 12;

export interface CreateUserInput {
  phone: string;
  password: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  mustChangePassword?: boolean;
}

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  async findByPhone(phone: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ phone, isDeleted: false }).exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email, isDeleted: false }).exec();
  }

  async findByPhoneOrEmail(identifier: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({
        $or: [{ phone: identifier }, { email: identifier.toLowerCase() }],
        isDeleted: false,
      })
      .exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async create(input: CreateUserInput): Promise<UserDocument> {
    const existing = await this.findByPhone(input.phone);
    if (existing) {
      throw new ConflictException('A user with this phone already exists');
    }
    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
    const created = await this.userModel.create({
      phone: input.phone,
      email: input.email?.toLowerCase(),
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      role: input.role ?? 'admin',
      mustChangePassword: input.mustChangePassword ?? false,
    });
    return created;
  }

  async verifyPassword(user: UserDocument, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }

  async markLoggedIn(userId: string): Promise<void> {
    await this.userModel.updateOne({ _id: userId }, { $set: { lastLoginAt: new Date() } }).exec();
  }
}
