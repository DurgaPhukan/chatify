import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config'; // Ensure ConfigModule is loaded in your app
import { AuthService } from './auth.service'; // Optional: Validate user details using AuthService

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService, // Optional, for extra validation
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'), // Environment variable
    });
  }

  /**
   * Validate the JWT payload.
   * @param payload - The decoded JWT payload.
   * @returns The authenticated user's data.
   */
  async validate(payload: any) {
    // Validate the payload (e.g., ensure user exists in the database)
    const user = await this.authService.validateUser(payload.email, payload.password);

    if (!user) {
      throw new UnauthorizedException('Invalid token or user does not exist');
    }

    // Return the user data to be added to the request object
    return {
      userId: payload.sub,
      email: payload.email,
      roles: payload.roles, // Include roles for RBAC
    };
  }
}
