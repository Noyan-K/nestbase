import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common/exceptions';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let usersController: UsersController;

  const usersTable = [
    {
      fullName: 'User Userson',
      email: 'user@gmail.com',
      password: '1234',
      id: 1,
    },
    {
      fullName: 'User1 Userson1',
      email: 'user1@gmail.com',
      password: '1234',
      id: 2,
    },
    {
      fullName: 'User2 Userson2',
      email: 'user2@gmail.com',
      password: '1234',
      id: 3,
    },
  ];

  const usersRepositoryFactory = {
    find: jest.fn(() => {
      return usersTable;
    }),
    findOneBy: jest.fn((where) => {
      return usersTable.find((user) => {
        if (where?.id) {
          return user.id === where.id;
        } else if (where?.email) {
          return user.email === where.email;
        }
      });
    }),
    create: jest.fn((dto) => {
      return {
        ...dto,
      };
    }),
    save: jest.fn((dto) => {
      return {
        ...dto,
        id: expect.any(Number),
      };
    }),
    update: jest.fn((dto) => {
      return {
        ...dto,
        id: expect.any(Number),
      };
    }),
    remove: jest.fn((dto) => {
      return {
        ...dto,
        id: expect.any(Number),
      };
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        {
          useValue: usersRepositoryFactory,
          provide: getRepositoryToken(User),
        },
      ],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
    jest.clearAllMocks();
  });

  it('findAll (success): should find all users', async () => {
    expect(await usersController.findAll()).toStrictEqual(usersTable);
  });

  it('findOne (success): should find one user by id', async () => {
    expect(await usersController.findOne(2)).toStrictEqual(usersTable[1]);
  });

  it('findOne (error): should throw error (Not Found)', async () => {
    try {
      await usersController.findOne(32);
    } catch (e) {
      expect(e).toBeInstanceOf(BadRequestException);
      expect(e.message).toBe('Not Found');
    }
  });

  it('create (success): should create a new user', async () => {
    expect(
      await usersController.create({
        fullName: 'User12 Userson12',
        email: 'user12@gmail.com',
        password: '1234',
      }),
    ).toStrictEqual({
      fullName: 'User12 Userson12',
      email: 'user12@gmail.com',
      id: expect.any(Number),
    });
  });

  it('create (error): should throw error (email already exists)', async () => {
    try {
      await usersController.create({
        fullName: 'User1 Userson1',
        email: 'user1@gmail.com',
        password: '1234',
      });
    } catch (e) {
      expect(e).toBeInstanceOf(BadRequestException);
      expect(e.message).toBe(
        'Пользователь с email:user1@gmail.com уже существует.',
      );
    }
  });

  it('update (success): should update user by id', async () => {
    expect(
      await usersController.update(2, {
        fullName: 'User12 Userson12',
        email: 'user12@gmail.com',
        password: '1234',
      }),
    ).toStrictEqual({
      fullName: 'User12 Userson12',
      email: 'user12@gmail.com',
      id: 2,
    });
  });

  it('update (error): should throw error (Not Found)', async () => {
    try {
      await usersController.update(212, {
        fullName: 'User12 Userson12',
        email: 'user12@gmail.com',
        password: '1234',
      });
    } catch (e) {
      expect(e).toBeInstanceOf(BadRequestException);
      expect(e.message).toBe('Not Found');
    }
  });

  it('update (error): should throw error (email already exists)', async () => {
    try {
      await usersController.update(1, {
        fullName: 'User1 Userson1',
        email: 'user1@gmail.com',
        password: '1234',
      });
    } catch (e) {
      expect(e).toBeInstanceOf(BadRequestException);
      expect(e.message).toBe(
        'Пользователь с email:user1@gmail.com уже существует.',
      );
    }
  });

  it('remove (success): should remove user by id', async () => {
    expect(await usersController.remove(2)).toStrictEqual(usersTable[1]);
  });

  it('remove (error): should throw error (Not Found)', async () => {
    try {
      await usersController.remove(212);
    } catch (e) {
      expect(e).toBeInstanceOf(BadRequestException);
      expect(e.message).toBe('Not Found');
    }
  });
});
