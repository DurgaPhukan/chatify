import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) { }

  async register(
    email: string,
    password: string,
    name: string,
    roles: string[] = ['user'],
  ): Promise<UserDocument> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new this.userModel({
      email,
      password: hashedPassword,
      name,
      roles,
    });

    return newUser.save();
  }

  async login(email: string, password: string): Promise<{ accessToken: string }> {
    const user = await this.userModel.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user._id.toString() };
    return { accessToken: this.jwtService.sign(payload) };
  }

  async validateUser(email: string, password: string): Promise<UserDocument | null> {
    const user = await this.userModel.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async getUsers(
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<{ users: UserDocument[]; total: number }> {
    const skip = (page - 1) * limit;

    // Build search query
    const searchQuery = search
      ? {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }
      : {};

    const users = await this.userModel.find(searchQuery).skip(skip).limit(limit).exec();
    const total = await this.userModel.countDocuments(searchQuery).exec();

    return { users, total };
  }
}
