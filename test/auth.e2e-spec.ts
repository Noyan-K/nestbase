import { Test } from '@nestjs/testing';
import { AppModule } from '../dist/app.module';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Tokens } from 'src/auth/types';

describe('AuthController', () => {
  let app: INestApplication;
  let tokens: Tokens;
  let newUserId: number;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it('registration (success): should register a new user', async () => {
    return request(app.getHttpServer())
      .post('/auth/registration')
      .send({
        fullName: 'User23 Userson23',
        email: 'user23@gmail.com',
        password: '1234',
      })
      .expect(201)
      .then(({ body }: request.Response) => {
        expect(body).toStrictEqual({
          fullName: 'User23 Userson23',
          email: 'user23@gmail.com',
          id: expect.any(Number),
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
        });

        newUserId = body.id;
        tokens = {
          accessToken: body.accessToken,
          refreshToken: body.refreshToken,
        };
      });
  });

  it('registration (error): should throw error (email already exists)', async () => {
    return request(app.getHttpServer())
      .post('/auth/registration')
      .send({
        fullName: 'User2 Userson2',
        email: 'user2@gmail.com',
        password: '1234',
      })
      .expect(400)
      .then(({ body }: request.Response) => {
        expect(body.message).toBe(
          'Пользователь с email:user2@gmail.com уже существует.',
        );
      });
  });

  it('login (success): should login', async () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'user23@gmail.com',
        password: '1234',
      })
      .then(({ body }: request.Response) => {
        expect(body).toStrictEqual({
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
        });
      });
  });

  it('login (error): should throw ForbiddenException', async () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'u1ser23@gmail.com',
        password: '1234',
      })
      .expect(400)
      .then(({ body }: request.Response) => {
        expect(body.message).toBe('Не правильный пароль или email.');
      });
  });

  it('login (error): should throw ForbiddenException', async () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'user23@gmail.com',
        password: '12341',
      })
      .expect(400)
      .then(({ body }: request.Response) => {
        expect(body.message).toBe('Не правильный пароль или email.');
      });
  });

  it('logout (success): should logout', async () => {
    return request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${tokens.accessToken}`)
      .then(({ body }: request.Response) => {
        expect(body).toStrictEqual({
          message: 'success',
        });
      });
  });

  it('refresh (success): should refresh', async () => {
    return request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Cookie', `auth-cookie:${tokens.refreshToken}`)
      .then(({ body }: request.Response) => {
        expect(body).toStrictEqual({
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
        });
      });
  });

  it('remove (success): should remove user by id', async () => {
    return request(app.getHttpServer())
      .delete(`/users/${newUserId}`)
      .expect(200)
      .then(({ body }: request.Response) => {
        expect(body).toStrictEqual({
          fullName: 'User23 Userson23',
          email: 'user23@gmail.com',
          password: expect.any(String),
        });
      });
  });
});
