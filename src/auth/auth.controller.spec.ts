import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Token } from './entities/token.entity';

describe('AuthController', () => {
  let authController: AuthController;

  const usersTable = [
    {
      fullName: 'User Userson',
      email: 'user@gmail.com',
      password: '1234',
      id: 1,
      isActivated: false,
    },
    {
      fullName: 'User1 Userson1',
      email: 'user1@gmail.com',
      password: '1234',
      id: 2,
      isActivated: false,
    },
    {
      fullName: 'User2 Userson2',
      email: 'user2@gmail.com',
      password: '1234',
      id: 3,
      isActivated: false,
    },
  ];

  const tokenRepositoryFactory = {};

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
        isActivated: false,
      };
    }),
    update: jest.fn((dto) => {
      return {
        ...dto,
        id: expect.any(Number),
        isActivated: false,
      };
    }),
    remove: jest.fn((dto) => {
      return {
        ...dto,
        id: expect.any(Number),
        isActivated: false,
      };
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          useValue: tokenRepositoryFactory,
          provide: getRepositoryToken(Token),
        },
        {
          useValue: usersRepositoryFactory,
          provide: getRepositoryToken(User),
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  it('registration (success): should register a new user', async () => {
    expect(
      await authController.registration({
        fullName: 'User12 Userson12',
        email: 'user12@gmail.com',
        password: '1234',
      }),
    ).toStrictEqual({
      id: expect.any(Number),
      fullName: 'User12 Userson12',
      email: 'user12@gmail.com',
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    });
  });
});
