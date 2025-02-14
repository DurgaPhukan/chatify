import { Controller, Post, Get, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { IsEmail, IsNotEmpty, MinLength, IsInt, Min, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer'; // Add this import

class RegisterDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsNotEmpty()
  name: string;

  roles?: string[];
}

class LoginDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}

class PaginationDto {
  @Type(() => Number) // Add this decorator
  @IsInt()
  @Min(1)
  page: number;

  @Type(() => Number) // Add this decorator
  @IsInt()
  @Min(1)
  limit: number;

  @IsOptional()
  @IsString()
  search?: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    const { email, password, name, roles } = registerDto;
    const user = await this.authService.register(email, password, name, roles);
    return {
      message: 'User registered successfully',
      user: { id: user._id, email: user.email, name: user.name },
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const { email, password } = loginDto;
    const result = await this.authService.login(email, password);
    return {
      message: 'Login successful',
      accessToken: result.accessToken,
    };
  }

  @Get('users')
  @HttpCode(HttpStatus.OK)
  async getUsers(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search?: string,
  ) {
    console.log('PPP', page, limit, search);
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
  }

}