import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const typeOrmConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.TYPEORM_HOST,
  port: Number(process.env.TYPEORM_PORT),
  username: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  database: process.env.TYPEORM_DATABASE,
  synchronize: Boolean(process.env.TYPEORM_SYNCHONIZE),
  logging: Boolean(process.env.TYPEORM_LOGGING),
  entities: [process.env.TYPEORM_ENTITIES],
  migrations: [process.env.TYPEORM_MIGRATIONS],
  subscribers: [process.env.TYPEORM_SUBSCRIBERS],
  migrationsTableName: process.env.TYPEORM_MIGRATIONS_TABLE_NAME,
};

export const typeOrmMigrationConfig = new DataSource(typeOrmConfig);
