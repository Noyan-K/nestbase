import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { GenerateTokenDto } from './dto/generate-token.dto';
import { Tokens } from './types/tokens.type';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Token } from './entities/token.entity';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Token) private tokenRepository: Repository<Token>,
    @InjectRepository(User) private userRepository: Repository<User>,
    private userService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private hashData(data: string) {
    return bcrypt.hash(data, 10);
  }

  async registration(createUserDto: CreateUserDto): Promise<Tokens> {
    try {
      const passwordHash = await this.hashData(createUserDto.password);
      const newUser = await this.userService.create({
        ...createUserDto,
        password: passwordHash,
      });

      // ! Transactions

      const tokens = await this.generateTokens({
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
      });
      await this.updateRefreshToken(newUser.id, tokens.refreshToken);

      return { ...newUser, ...tokens };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async login(loginDto: LoginDto): Promise<Tokens> {
    try {
      const recivedUser = await this.userRepository.findOneBy({
        email: loginDto.email,
      });

      if (!recivedUser) {
        throw new ForbiddenException('Не правильный пароль или email.');
      }

      const passwordMatches = await bcrypt.compare(
        loginDto.password,
        recivedUser.password,
      );

      if (!passwordMatches) {
        throw new ForbiddenException('Не правильный пароль или email.');
      }

      const tokens = await this.generateTokens({
        id: recivedUser.id,
        email: recivedUser.email,
        fullName: recivedUser.fullName,
      });

      await this.updateRefreshToken(recivedUser.id, tokens.refreshToken);

      return tokens;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async logout(userId: number): Promise<object> {
    try {
      const receivedToke = await this.tokenRepository.findOneBy({ userId });
      this.tokenRepository.save({
        ...receivedToke,
        refreshToken: null,
      });

      return {
        message: 'success',
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async refresh(userId: number, refreshToken: string) {
    const recivedUser = await this.userRepository.findOneBy({ id: userId });

    if (!recivedUser) {
      throw new ForbiddenException('1');
    }

    const recivedToken = await this.tokenRepository.findOneBy({
      userId: recivedUser.id,
    });

    const isRefreshTokenMatches = refreshToken === recivedToken.refreshToken;

    if (!isRefreshTokenMatches) {
      throw new ForbiddenException('2');
    }

    const tokens = await this.generateTokens({
      id: recivedUser.id,
      email: recivedUser.email,
      fullName: recivedUser.fullName,
    });

    await this.updateRefreshToken(recivedUser.id, tokens.refreshToken);

    return tokens;
  }

  async updateRefreshToken(userId, refreshToken) {
    const recivedToken = await this.tokenRepository.findOneBy({ userId });

    if (!recivedToken) {
      const newToken = this.tokenRepository.create({
        userId,
        refreshToken,
      });

      await this.tokenRepository.save(newToken);
    } else {
      await this.tokenRepository.save({
        ...recivedToken,
        refreshToken,
      });
    }
  }

  async generateTokens(payload: GenerateTokenDto): Promise<Tokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('ACCESS_TOKEN_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('REFRESH_TOKEN_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
