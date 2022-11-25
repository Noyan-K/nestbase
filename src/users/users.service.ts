import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    try {
      const newUser = await this.userRepository.save(
        this.userRepository.create(createUserDto),
      );

      return newUser;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findAll(): Promise<UserEntity[]> {
    try {
      return this.userRepository.find();
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findOne(id: number): Promise<UserEntity> {
    try {
      const recivedUser = await this.userRepository.findOneBy({ id });

      if (!recivedUser) {
        throw new NotFoundException();
      }

      return recivedUser;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    try {
      const recivedUser = await this.userRepository.findOneBy({ id });

      if (!recivedUser) {
        throw new NotFoundException();
      }

      return await this.userRepository.save({
        ...recivedUser,
        ...updateUserDto,
      });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async remove(id: number): Promise<UserEntity> {
    try {
      const recivedUser = await this.userRepository.findOneBy({ id });

      if (!recivedUser) {
        throw new NotFoundException();
      }

      return this.userRepository.remove(recivedUser);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
