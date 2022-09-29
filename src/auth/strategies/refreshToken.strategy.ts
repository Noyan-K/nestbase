import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtPayload, JwtPayloadWithRt } from '../types';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(config: ConfigService) {
    super({
      ignoreExpiration: false,
      secretOrKey: config.get<string>('REFRESH_TOKEN_SECRET'),
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const data = request?.cookies['auth-cookie'];

          if (!data) {
            return null;
          }

          return data;
        },
      ]),
    });
  }

  async validate(payload: JwtPayload) {
    if (payload === null) {
      throw new UnauthorizedException();
    }

    return payload;
  }
}
