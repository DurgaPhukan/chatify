import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) { }

  /**
  * Check if email already exists
  */
  private async checkEmailExists(email: string): Promise<boolean> {
    const existingUser = await this.userModel.findOne({ email });
    return !!existingUser;
  }

  /**
   * Register a new user
   */
  async register(
    email: string,
    password: string,
    name: string,
    roles: string[] = ['user'],
  ): Promise<UserDocument> {
    const emailExists = await this.checkEmailExists(email);

    if (emailExists) {
      throw new ConflictException('Email is already registered');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const verificationToken = uuidv4();
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const newUser = new this.userModel({
      email,
      password: hashedPassword,
      name,
      roles,
      verificationToken,
      verificationTokenExpires,
      isVerified: false,
    });
    console.log(newUser)
    try {
      await newUser.save();
      await this.sendVerificationEmail(email, verificationToken);
      return newUser;
    } catch (error) {
      if (error.code === 11000) { // MongoDB duplicate key error
        throw new ConflictException('Email is already registered');
      }
      throw error;
    }
  }

  async sendVerificationEmail(email: string, token: string) {
    const verificationLink = `http://localhost:3000/auth/verify?token=${token}`;

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Verify your email',
        html: `<p>Click <a href="${verificationLink}">here</a> to verify your email.</p>`,
      });
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  async verifyUser(token: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({ verificationToken: token });

    if (!user) {
      throw new UnauthorizedException('Invalid verification token');
    }

    if (user.verificationTokenExpires < new Date()) {
      throw new UnauthorizedException('Verification token has expired');
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    await user.save();

    return user;
  }

  async resendVerificationEmail(email: string): Promise<void> {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.isVerified) {
      throw new ConflictException('User is already verified');
    }

    const verificationToken = uuidv4();
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    user.verificationToken = verificationToken;
    user.verificationTokenExpires = verificationTokenExpires;
    await user.save();

    await this.sendVerificationEmail(email, verificationToken);
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
