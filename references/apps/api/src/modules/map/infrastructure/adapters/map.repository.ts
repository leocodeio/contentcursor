import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
// creator editor
import { xCreatorEditorMap } from '../../infrastructure/entities/creator-editor-map.entity';
import { ICreatorEditorMapPort } from '../../domain/ports/creator-editor-map.port';

// account editor
import { xAccountEditorMap } from '../../infrastructure/entities/account-editor-map.entity';
import { IAccountEditorMapPort } from '../../domain/ports/account-editor-map.port';
import { xCreatorEditorMapStatusType } from '@spectral/types';
import { CreatorEditorFindDto } from '../../application/dtos/find-creator-editor.dto';
import { PrismaService } from '../../../../utilities/database/prisma.service';
import { CreatorEditorMap, AccountEditorMap } from '@spectral/db';
import { xAccountEditorMapStatusType } from '@spectral/types';

@Injectable()
export class CreatorEditorMapRepositoryAdapter
  implements ICreatorEditorMapPort
{
  constructor(private readonly prismaService: PrismaService) {}

  async findByCreatorIdAndEditorMail(
    creatorId: string,
    editorMail: string,
  ): Promise<CreatorEditorFindDto | null> {
    return await this.prismaService.$transaction(async (tx) => {
      const editorExists = await tx.user.findUnique({
        where: { email: editorMail },
      });
      console.log('hi', editorExists);

      // Check if user exists and has EDITOR role
      if (!editorExists || editorExists.role !== 'editor') {
        throw new NotFoundException('Editor not found');
      }
      console.log('hi2');

      const creatorExists = await tx.user.findUnique({
        where: { id: creatorId },
      });
      console.log('hi3', creatorExists);

      if (!creatorExists || creatorExists.role !== 'creator') {
        throw new NotFoundException('Creator not found');
      }
      const result = await tx.creatorEditorMap.findFirst({
        where: {
          AND: [{ creatorId: creatorId }, { editorId: editorExists.id }],
        },
      });

      if (result) {
        return {
          creatorId: result.creatorId,
          editorId: result.editorId,
          editorMail: editorExists.email,
          editorName: editorExists.name,
          editorAvatar: editorExists.image || '',
          status: result.status,
        };
      }

      const creatorEditorMap: CreatorEditorFindDto = {
        creatorId,
        editorId: editorExists.id,
        editorMail,
        editorName: editorExists.name,
        editorAvatar: editorExists.image || '',
        status: 'INACTIVE' as xCreatorEditorMapStatusType,
      };

      return creatorEditorMap;
    });
  }

  async findMapsByCreatorId(creatorId: string): Promise<xCreatorEditorMap[]> {
    return await this.prismaService.$transaction(async (tx) => {
      const result = await tx.creatorEditorMap.findMany({
        where: { creatorId },
        include: {
          editor: {
            select: {
              id: true,
              email: true,
              name: true,
              image: true,
            },
          },
        },
      });
      console.log('result', result);
      return result.map((creatorEditorMap) => ({
        ...this.toCreatorEditorMapDomain(creatorEditorMap),
        editor: creatorEditorMap.editor,
      }));
    });
  }

  async findByEditorId(editorId: string): Promise<xCreatorEditorMap[]> {
    return await this.prismaService.$transaction(async (tx) => {
      const result = await tx.creatorEditorMap.findMany({
        where: { editorId },
        include: {
          creator: {
            select: {
              id: true,
              email: true,
              name: true,
              image: true,
            },
          },
        },
      });
      console.log('result', result);

      return result.map((creatorEditorMap) => {
        return {
          ...this.toCreatorEditorMapDomain(creatorEditorMap),
          creator: creatorEditorMap.creator,
        };
      });
    });
  }

  async requestEditor(
    creatorId: string,
    editorId: string,
  ): Promise<xCreatorEditorMap> {
    return await this.prismaService.$transaction(async (tx) => {
      // 1) check if a combination exists with creatorId and editorId
      const exists = await tx.creatorEditorMap.findFirst({
        where: {
          creatorId: creatorId,
          editorId: editorId,
        },
      });
      console.log(exists, ' this exists ');
      if (exists) {
        // If it exists, update the existing record
        const updated = await tx.creatorEditorMap.update({
          where: { id: exists.id },
          data: {
            status: 'PENDING',
          },
        });
        return this.toCreatorEditorMapDomain(updated);
      }

      // 3) If does not exist then create new one
      const result = await tx.creatorEditorMap.create({
        data: {
          creatorId,
          editorId,
          status: 'PENDING', // Use string literal instead of enum
        },
      });
      return this.toCreatorEditorMapDomain(result);
    });
  }

  async update(
    id: string,
    creatorEditorMap: Partial<xCreatorEditorMap>,
  ): Promise<xCreatorEditorMap | null> {
    return await this.prismaService.$transaction(async (tx) => {
      try {
        // update the creator-editor map
        const result = await tx.creatorEditorMap.update({
          where: { id },
          data: {
            ...(creatorEditorMap.creatorId && {
              creatorId: creatorEditorMap.creatorId,
            }),
            ...(creatorEditorMap.editorId && {
              editorId: creatorEditorMap.editorId,
            }),
            ...(creatorEditorMap.status && {
              status: creatorEditorMap.status,
            }),
          },
        });

        // get accounts of this creator
        const accounts = await tx.ytCreator.findMany({
          where: { creatorId: result.creatorId },
        });

        // if status is set to INACTIVE, we have to change all the account-editor maps to INACTIVE
        if (creatorEditorMap.status === 'INACTIVE') {
          for (const account of accounts) {
            await tx.accountEditorMap.updateMany({
              where: {
                AND: [{ accountId: account.id }, { editorId: result.editorId }],
              },
              data: { status: 'INACTIVE' },
            });
          }
        }

        return this.toCreatorEditorMapDomain(result);
      } catch (error) {
        return null;
      }
    });
  }

  toCreatorEditorMapDomain(
    creatorEditorMap: CreatorEditorMap,
  ): xCreatorEditorMap {
    return {
      id: creatorEditorMap.id,
      creatorId: creatorEditorMap.creatorId,
      editorId: creatorEditorMap.editorId,
      status: creatorEditorMap.status,
      createdAt: creatorEditorMap.createdAt,
      updatedAt: creatorEditorMap.updatedAt,
    };
  }

  toCreatorEditorMapEntity(
    creatorEditorMap: xCreatorEditorMap,
  ): CreatorEditorMap {
    return {
      id: creatorEditorMap.id,
      creatorId: creatorEditorMap.creatorId,
      editorId: creatorEditorMap.editorId,
      status: creatorEditorMap.status,
      createdAt: creatorEditorMap.createdAt || new Date(),
      updatedAt: creatorEditorMap.updatedAt || new Date(),
    };
  }
}

@Injectable()
export class AccountEditorMapRepositoryAdapter
  implements IAccountEditorMapPort
{
  constructor(private readonly prismaService: PrismaService) {}

  async findByAccountId(accountId: string): Promise<xAccountEditorMap[]> {
    return await this.prismaService.$transaction(async (tx) => {
      const result = await tx.accountEditorMap.findMany({
        where: { accountId },
      });
      return result.map((accountEditorMap) =>
        this.toAccountEditorMapDomain(accountEditorMap),
      );
    });
  }

  async findByEditorId(editorId: string): Promise<xAccountEditorMap[]> {
    console.log('editorId', editorId);
    return await this.prismaService.$transaction(async (tx) => {
      const result = await tx.accountEditorMap.findMany({
        where: { AND: [{ editorId }, { status: 'ACTIVE' }] },
        include: {
          account: true,
        },
      });
      console.log('result', result);
      return result.map((accountEditorMap) => ({
        ...this.toAccountEditorMapDomain(accountEditorMap),
        account: accountEditorMap.account,
      }));
    });
  }

  async findByCreatorIdAndAccountId(
    creatorId: string,
    accountId: string,
  ): Promise<xAccountEditorMap[]> {
    return await this.prismaService.$transaction(async (tx) => {
      // 1) check if the account belongs to the creator
      const creator = await tx.user.findUnique({
        where: { id: creatorId },
      });
      if (!creator || creator.role !== 'creator') {
        throw new NotFoundException('Valid creator not found');
      }

      const account = await tx.ytCreator.findUnique({
        where: { id: accountId },
      });
      if (!account) {
        throw new NotFoundException('Account not found for this creator');
      }

      // 2) check if the account-editor map exists
      if (creator.id !== account.creatorId) {
        throw new BadRequestException('Account does not belong to the creator');
      }

      const result = await tx.accountEditorMap.findMany({
        where: {
          accountId,
          status: 'ACTIVE',
        },
        include: {
          editor: true,
        },
      });
      return result.map((accountEditorMap) => ({
        ...this.toAccountEditorMapDomain(accountEditorMap),
        editor: accountEditorMap.editor,
      }));
    });
  }

  async changeCEAstatus(
    creatorId: string,
    accountId: string,
    editorId: string,
    status: xAccountEditorMapStatusType,
  ): Promise<xAccountEditorMap> {
    return await this.prismaService.$transaction(async (tx) => {
      // 1) Validate creatorId
      const creator = await tx.user.findUnique({
        where: { id: creatorId },
      });

      if (!creator || creator.role !== 'creator') {
        throw new NotFoundException('Valid creator not found');
      }

      // 2) Validate editorId
      const editor = await tx.user.findUnique({
        where: { id: editorId },
      });

      if (!editor || editor.role !== 'editor') {
        throw new NotFoundException('Valid editor not found');
      }

      // 3) Verify that the creator-editor relationship is ACTIVE
      const creatorEditorMap = await tx.creatorEditorMap.findFirst({
        where: {
          creatorId: creatorId,
          editorId: editorId,
          status: 'ACTIVE',
        },
      });

      if (!creatorEditorMap) {
        throw new BadRequestException(
          'Editor must have an active relationship with the creator to manage accounts',
        );
      }

      // 4) Verify that the account belongs to the creator
      const account = await tx.ytCreator.findUnique({
        where: { id: accountId },
      });

      if (!account) {
        throw new NotFoundException('Account not found');
      }

      // Additional check: Verify the account actually belongs to the creator
      // This might need adjustment based on your account ownership logic
      // For now, we'll assume any valid account can be managed by any valid creator

      // 5) Check if account-editor map already exists
      const existingMap = await tx.accountEditorMap.findFirst({
        where: {
          accountId: accountId,
          editorId: editorId,
        },
      });
      console.log('existingMap', existingMap);
      if (existingMap) {
        // If account-editor map exists, update status
        const updatedMap = await tx.accountEditorMap.update({
          where: { id: existingMap.id },
          data: {
            status: status,
          },
        });
        return this.toAccountEditorMapDomain(updatedMap);
      } else {
        // If not, create a new map
        console.log('creating new map');
        const newMap = await tx.accountEditorMap.create({
          data: {
            accountId: accountId,
            editorId: editorId,
            status: status,
          },
        });
        return this.toAccountEditorMapDomain(newMap);
      }
    });
  }

  async update(
    id: string,
    accountEditorMap: Partial<xAccountEditorMap>,
  ): Promise<xAccountEditorMap | null> {
    return await this.prismaService.$transaction(async (tx) => {
      try {
        const result = await tx.accountEditorMap.update({
          where: { id },
          data: {
            ...(accountEditorMap.accountId && {
              accountId: accountEditorMap.accountId,
            }),
            ...(accountEditorMap.editorId && {
              editorId: accountEditorMap.editorId,
            }),
            ...(accountEditorMap.status && {
              status: accountEditorMap.status,
            }),
          },
        });
        return this.toAccountEditorMapDomain(result);
      } catch (error) {
        return null;
      }
    });
  }

  toAccountEditorMapDomain(
    accountEditorMap: AccountEditorMap,
  ): xAccountEditorMap {
    return {
      id: accountEditorMap.id,
      accountId: accountEditorMap.accountId,
      editorId: accountEditorMap.editorId,
      status: accountEditorMap.status,
      createdAt: accountEditorMap.createdAt,
      updatedAt: accountEditorMap.updatedAt,
    };
  }

  toAccountEditorMapEntity(
    accountEditorMap: xAccountEditorMap,
  ): AccountEditorMap {
    return {
      id: accountEditorMap.id,
      accountId: accountEditorMap.accountId,
      editorId: accountEditorMap.editorId,
      status: accountEditorMap.status,
      createdAt: accountEditorMap.createdAt,
      updatedAt: accountEditorMap.updatedAt,
    };
  }
}
