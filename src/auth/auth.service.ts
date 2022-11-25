import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { GenerateTokenDto } from './dto/generate-token.dto';
import { TokensType } from './types/tokens.type';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/users/entities/user.entity';
import { TokenEntity } from './entities/token.entity';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(TokenEntity)
    private tokenRepository: Repository<TokenEntity>,

    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,

    private userService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private hashData(data: string) {
    return bcrypt.hash(data, 10);
  }

  async registration(
    createUserDto: CreateUserDto,
  ): Promise<UserEntity & TokensType> {
    try {
      const passwordHash = await this.hashData(createUserDto.password);
      const newUser = await this.userService.create({
        ...createUserDto,
        password: passwordHash,
      });

      // ? transaction

      const tokens = await this.generateTokens({
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
      });
      await this.updateRefreshToken(newUser.id, tokens.refreshToken);

      return {
        ...newUser,
        ...tokens,
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async login(loginDto: LoginDto): Promise<TokensType> {
    try {
      const recivedUser = await this.userRepository.findOneBy({
        email: loginDto.email,
      });

      if (!recivedUser) {
        throw new ForbiddenException('Wrong password or email.');
      }

      const passwordMatches = await bcrypt.compare(
        loginDto.password,
        recivedUser.password,
      );

      if (!passwordMatches) {
        throw new ForbiddenException('Wrong password or email.');
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

  async logout(userId: number): Promise<TokenEntity> {
    try {
      const receivedTokens = await this.tokenRepository.findOneBy({ userId });

      return this.tokenRepository.save({
        ...receivedTokens,
        refreshToken: null,
      });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async refresh(userId: number, refreshToken: string): Promise<TokensType> {
    const recivedUser = await this.userRepository.findOneBy({ id: userId });

    if (!recivedUser) {
      throw new ForbiddenException('User not found.');
    }

    const recivedToken = await this.tokenRepository.findOneBy({
      userId: recivedUser.id,
    });

    if (refreshToken !== recivedToken.refreshToken) {
      throw new ForbiddenException();
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

  async generateTokens(payload: GenerateTokenDto): Promise<TokensType> {
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
