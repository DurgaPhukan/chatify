import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { IsEmail, IsNotEmpty, MinLength, IsInt, Min, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { AuthGuard } from '@nestjs/passport';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';

class RegisterDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsNotEmpty()
  name: string;

  @IsOptional()
  roles?: string[];
}

class LoginDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}

class ResendVerificationEmailDto {
  @IsEmail()
  email: string;
}

class PaginationDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number;

  @IsOptional()
  @IsString()
  search?: string;
}
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly httpService: HttpService,
  ) { }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // This route handles Google authentication redirection.
  }

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    const user = req.user;

    try {
      const registeredUser = await this.authService.registerOrFindGoogleUser(user);
      const token = this.authService.generateJwtToken(registeredUser);

      // Redirect with token to the frontend
      return res.redirect(`http://localhost:3000?token=${token}`);
    } catch (error) {
      console.error('Error in Google Auth Redirect:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Authentication failed');
    }
  }

  @Post('google/callback')
  async googleAuthCallback(@Body() body, @Res() res) {
    const { code } = body;

    if (!code) {
      return res.status(400).json({ message: 'Authorization code is missing' });
    }

    try {
      // Exchange code for tokens
      const tokenResponse = await this.httpService
        .post('https://oauth2.googleapis.com/token', {
          code: code,
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          redirect_uri: 'http://localhost:3000/auth/google/callback',
          grant_type: 'authorization_code',
        })
        .toPromise();

      const { access_token } = tokenResponse.data;

      // Fetch user info
      const userInfoResponse = await this.httpService
        .get('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${access_token}` },
        })
        .toPromise();

      const user = userInfoResponse.data;

      // Find or register the user
      const registeredUser = await this.authService.registerOrFindGoogleUser(user);

      // Generate JWT token
      const jwtToken = this.authService.generateJwtToken(registeredUser);

      // Return the token to the frontend
      return res.status(200).json({ token: jwtToken });
    } catch (error) {
      console.error('Error during callback processing:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    const { email, password, name, roles } = registerDto;

    try {
      const user = await this.authService.register(email, password, name, roles);
      return {
        message: 'User registered successfully. Please check your email to verify your account.',
        user: { id: user._id, email: user.email, name: user.name },
      };
    } catch (error) {
      console.error('Error in Register:', error);
      throw new BadRequestException(`Registration failed`);
    }
  }

  @Get('verify')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Query('token') token: string) {
    try {
      const user = await this.authService.verifyUser(token);
      return {
        message: 'Email verified successfully',
        user: { id: user._id, email: user.email, name: user.name },
      };
    } catch (error) {
      console.error('Error in Email Verification:', error);
      throw new BadRequestException('Email verification failed');
    }
  }

  @Post('resend-verification-email')
  @HttpCode(HttpStatus.OK)
  async resendVerificationEmail(@Body() resendVerificationEmailDto: ResendVerificationEmailDto) {
    const { email } = resendVerificationEmailDto;

    try {
      await this.authService.resendVerificationEmail(email);
      return {
        message: 'Verification email resent successfully',
      };
    } catch (error) {
      console.error('Error in Resend Verification Email:', error);
      throw new BadRequestException('Failed to resend verification email');
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const { email, password } = loginDto;

    try {
      const result = await this.authService.login(email, password);
      return {
        message: 'Login successful',
        accessToken: result.accessToken,
      };
    } catch (error) {
      console.error('Error in Login:', error);
      throw new BadRequestException('Invalid credentials');
    }
  }

  @Get('users')
  @HttpCode(HttpStatus.OK)
  async getUsers(@Query() paginationDto: PaginationDto) {
    const { page, limit, search } = paginationDto;

    try {
      const { users, total } = await this.authService.getUsers(page, limit, search);
      return {
        message: 'Users fetched successfully',
        data: {
          users,
          total,
          page,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new BadRequestException('Failed to fetch users');
    }
  }
}
