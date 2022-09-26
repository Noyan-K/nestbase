import { Test } from '@nestjs/testing';
import { AppModule } from '../dist/app.module';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';

describe('UsersController', () => {
  let app: INestApplication;
  let newUserId: number;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it('create (success): should create a new user', async () => {
    return request(app.getHttpServer())
      .post('/users')
      .send({
        fullname: 'User23 Userson23',
        email: 'user23@gmail.com',
        password: '1234',
      })
      .expect(201)
      .then(({ body }: request.Response) => {
        expect(body).toStrictEqual({
          fullname: 'User23 Userson23',
          email: 'user23@gmail.com',
          password: '1234',
          id: expect.any(Number),
          isActivated: false,
        });

        newUserId = body.id;
      });
  });

  it('create (error): should throw error (email already exists)', async () => {
    return request(app.getHttpServer())
      .post('/users')
      .send({
        fullname: 'User2 Userson2',
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

  it('findAll (success): should find all users', async () => {
    return request(app.getHttpServer())
      .get('/users')
      .expect(200)
      .then(({ body }: request.Response) => {
        const lastCreatedUser = body.find((user) => user.id === newUserId);

        expect(lastCreatedUser).toStrictEqual({
          fullname: 'User23 Userson23',
          email: 'user23@gmail.com',
          password: '1234',
          id: newUserId,
          isActivated: false,
        });
      });
  });

  it('findOne (success): should find one user by id', async () => {
    return request(app.getHttpServer())
      .get(`/users/${newUserId}`)
      .expect(200)
      .then(({ body }: request.Response) => {
        expect(body).toStrictEqual({
          fullname: 'User23 Userson23',
          email: 'user23@gmail.com',
          password: '1234',
          id: expect.any(Number),
          isActivated: false,
        });
      });
  });

  it('findOne (error): should throw error (Not Found)', async () => {
    return request(app.getHttpServer())
      .get(`/users/99999`)
      .then(({ body }: request.Response) => {
        expect(body.status).toBe(404);
        expect(body.message).toBe('Not Found');
      });
  });

  it('update (success): should update user by id', async () => {
    return request(app.getHttpServer())
      .patch(`/users/${newUserId}`)
      .send({
        fullname: 'User21 Userson21',
        email: 'user21@gmail.com',
        password: '1234',
      })
      .expect(200)
      .then(({ body }: request.Response) => {
        expect(body).toStrictEqual({
          fullname: 'User21 Userson21',
          email: 'user21@gmail.com',
          password: '1234',
          id: newUserId,
          isActivated: false,
        });
      });
  });

  it('update (error): should throw error (Not Found)', async () => {
    return request(app.getHttpServer())
      .patch(`/users/99999`)
      .send({
        fullname: 'User21 Userson21',
        email: 'user21@gmail.com',
        password: '1234',
      })
      .then(({ body }: request.Response) => {
        expect(body.status).toBe(404);
        expect(body.message).toBe('Not Found');
      });
  });

  it('update (error): should throw error (email already exists)', async () => {
    return request(app.getHttpServer())
      .patch(`/users/${newUserId}`)
      .send({
        fullname: 'User1 Userson1',
        email: 'user1@gmail.com',
        password: '1234',
      })
      .then(({ body }: request.Response) => {
        expect(body.status).toBe(400);
        expect(body.message).toBe(
          'Пользователь с email:user1@gmail.com уже существует.',
        );
      });
  });

  it('remove (success): should remove user by id', async () => {
    return request(app.getHttpServer())
      .delete(`/users/${newUserId}`)
      .expect(200)
      .then(({ body }: request.Response) => {
        expect(body).toStrictEqual({
          fullname: 'User21 Userson21',
          email: 'user21@gmail.com',
          password: '1234',
          isActivated: false,
        });
      });
  });

  it('remove (error): should throw error (Not Found)', async () => {
    return request(app.getHttpServer())
      .delete(`/users/9999`)
      .then(({ body }: request.Response) => {
        expect(body.status).toBe(404);
        expect(body.message).toBe('Not Found');
      });
  });
});
