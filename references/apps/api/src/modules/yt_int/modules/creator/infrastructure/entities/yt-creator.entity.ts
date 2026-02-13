// import {
//   Column,
//   CreateDateColumn,
//   Entity,
//   Generated,
//   PrimaryGeneratedColumn,
//   UpdateDateColumn,
// } from 'typeorm';
// import { YtCreatorStatus } from '../../domain/enums/yt-creator-status.enum';

// @Entity({ name: 'creator_account_map' })
// export class YtCreatorEntity {
//   @PrimaryGeneratedColumn('cuid')
//   @Generated('cuid')
//   id: string;

//   @Column({ name: 'creator_id', type: 'cuid'})
//   creatorId: string;

//   @Column({ name: 'email', type: 'text' })
//   email: string;

//   @Column({ name: 'access_token', type: 'text', unique: true })
//   accessToken: string;

//   @Column({ name: 'refresh_token', type: 'text', unique: true })
//   refreshToken: string;

//   @Column({
//     type: 'enum',
//     enum: YtCreatorStatus,
//     default: YtCreatorStatus.active,
//   })
//   status: YtCreatorStatus;

//   @CreateDateColumn({ name: 'created_at' })
//   createdAt: Date;

//   @UpdateDateColumn({ name: 'updated_at' })
//   updatedAt: Date;
// }

// we will have have this in prisma

// ```prisma
// model YtCreator {
//   id          String   @id @default(cuid())
//   creatorId   String   @unique
//   email       String   @unique
//   accessToken String   @unique
//   refreshToken String  @unique
//   status      YtCreatorStatus @default(active)
//   createdAt   DateTime @default(now())
//   updatedAt   DateTime @updatedAt
// }

// enum YtCreatorStatus {
//   ACTIVE
//   INACTIVE
//   SUSPENDED
//   DELETED
// }
// ```
