import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUserDto } from './dto/get-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<GetUserDto> {
    try {
      const findSimularUser = await this.userRepository.findOneBy({
        email: createUserDto.email,
      });

      if (findSimularUser) {
        throw new BadRequestException(
          `Пользователь с email:${createUserDto.email} уже существует.`,
        );
      }

      const newUser = await this.userRepository.save(
        this.userRepository.create(createUserDto),
      );

      return { ...new GetUserDto(newUser) };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findAll(): Promise<User[]> {
    try {
      return this.userRepository.find();
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findOne(id: number): Promise<User> {
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

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      const recivedUser = await this.userRepository.findOneBy({ id });
      const findSimularUser = await this.userRepository.findOneBy({
        email: updateUserDto.email,
      });

      if (!recivedUser) {
        throw new NotFoundException();
      }

      if (findSimularUser && findSimularUser?.id !== id) {
        throw new BadRequestException(
          `Пользователь с email:${updateUserDto.email} уже существует.`,
        );
      }

      const updatedUser = await this.userRepository.save({
        ...recivedUser,
        ...updateUserDto,
      });

      return { ...new GetUserDto(updatedUser) };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async remove(id: number) {
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
