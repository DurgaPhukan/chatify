import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) { }

  /**
   * Register a new user
   */
  async register(
    email: string,
    password: string,
    name: string,
    roles: string[] = ['user'],
  ): Promise<UserDocument> {
    const existingUser = await this.userModel.findOne({ email });

    if (existingUser) {
      throw new UnauthorizedException('Email is already registered');
    }

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

  /**
   * Login a user and generate an access token
   */
  async login(email: string, password: string): Promise<{ accessToken: string }> {
    const user = await this.userModel.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user._id.toString(), roles: user.roles };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }

  /**
   * Validate user credentials
   */
  async validateUser(email: string, password: string): Promise<UserDocument | null> {
    const user = await this.userModel.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  /**
   * Get paginated list of users with optional search
   */
  async getUsers(
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<{ users: UserDocument[]; total: number }> {
    const skip = (page - 1) * limit;

    const searchQuery = search
      ? {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }
      : {};

    const [users, total] = await Promise.all([
      this.userModel.find(searchQuery).skip(skip).limit(limit).exec(),
      this.userModel.countDocuments(searchQuery).exec(),
    ]);

    return { users, total };
  }

  /**
   * Register a user via Google OAuth or find an existing one
   */
  async registerOrFindGoogleUser(user: any): Promise<UserDocument> {
    const existingUser = await this.userModel.findOne({ email: user.email });

    if (existingUser) {
      return existingUser;
    }

    const newUser = new this.userModel({
      email: user.email,
      name: user.name,
      roles: ['user'], // Default role
      isActive: true,
      isGoogleUser: true, // Mark as a Google user
    });

    return newUser.save();
  }

  /**
   * Generate a JWT token for a user
   */
  generateJwtToken(user: UserDocument): string {
    const payload = { email: user.email, name: user.name, sub: user._id.toString(), roles: user.roles };
    return this.jwtService.sign(payload);
  }

  /**
   * Decode a JWT token
   */
  decodeJwtToken(token: string): any {
    return this.jwtService.decode(token);
  }
}
