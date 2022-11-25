import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class TokenEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  userId: number;

  @Column({ unique: true, nullable: true })
  refreshToken: string;
}
