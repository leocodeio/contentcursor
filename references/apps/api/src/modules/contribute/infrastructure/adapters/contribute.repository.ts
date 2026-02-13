import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/utilities/database/prisma.service';
import {
  IContributePort,
  CreateContributeData,
  CreateVersionData,
  UpdateVersionStatusData,
  CreateVersionCommentData,
} from '../../domain/ports/contribute.port';
import { xDomainContribute } from '../../domain/models/contribute.model';
import {
  xDomainContributionVersion,
  xDomainVersionComment,
} from '@spectral/types';

@Injectable()
export class ContributeRepositoryAdapter implements IContributePort {
  constructor(private readonly prisma: PrismaService) {}

  async createContribution(
    data: CreateContributeData,
  ): Promise<xDomainContribute> {
    return await this.prisma.$transaction(async (tx) => {
      // 1) Create contribution
      const contribution = await tx.contribute.create({
        data: {
          accountId: data.accountId,
          editorId: data.editorId,
          videoId: data.videoId,
          thumbnailId: data.thumbnailId,
          title: data.title,
          description: data.description,
          tags: data.tags,
          duration: data.duration,
        },
        include: {
          account: true,
          editor: true,
          video: true,
          thumbnail: true,
        },
      });

      // Make an entry in version table
      await tx.contributionVersion.create({
        data: {
          contributeId: contribution.id,
          versionNumber: 1,
          status: 'PENDING',
          title: contribution.title,
          description: contribution.description,
          videoId: contribution.videoId,
          thumbnailId: contribution.thumbnailId,
          duration: contribution.duration,
        },
      });

      return {
        id: contribution.id,
        status: contribution.status,
        accountId: contribution.accountId,
        editorId: contribution.editorId,
        videoId: contribution.videoId,
        thumbnailId: contribution.thumbnailId,
        title: contribution.title,
        description: contribution.description,
        tags: contribution.tags,
        duration: contribution.duration,
        account: contribution.account
          ? {
              id: contribution.account.id,
              email: contribution.account.email,
              creatorId: contribution.account.creatorId,
              status: contribution.account.status,
            }
          : undefined,
        editor: contribution.editor
          ? {
              id: contribution.editor.id,
              name: contribution.editor.name,
              email: contribution.editor.email,
              emailVerified: contribution.editor.emailVerified,
              image: contribution.editor.image,
              role: contribution.editor.role,
              phone: contribution.editor.phone,
              phoneVerified: contribution.editor.phoneVerified,
              profileCompleted: contribution.editor.profileCompleted,
              subscriptionId: contribution.editor.subscriptionId,
            }
          : undefined,
        video: contribution.video
          ? {
              id: contribution.video.id,
              type: contribution.video.type,
              integrationUrl: contribution.video.integrationUrl,
              integrationKey: contribution.video.integrationKey,
            }
          : undefined,
        thumbnail: contribution.thumbnail
          ? {
              id: contribution.thumbnail.id,
              type: contribution.thumbnail.type,
              integrationUrl: contribution.thumbnail.integrationUrl,
              integrationKey: contribution.thumbnail.integrationKey,
            }
          : undefined,
      };
    });
  }

  async getContributionsByAccountId(
    accountId: string,
  ): Promise<xDomainContribute[]> {
    const contributions = await this.prisma.contribute.findMany({
      where: {
        accountId,
      },
      include: {
        account: true,
        editor: true,
        video: true,
        thumbnail: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return contributions.map((contribution) => ({
      id: contribution.id,
      status: contribution.status,
      accountId: contribution.accountId,
      editorId: contribution.editorId,
      videoId: contribution.videoId,
      thumbnailId: contribution.thumbnailId,
      title: contribution.title,
      description: contribution.description,
      tags: contribution.tags,
      duration: contribution.duration,
      account: contribution.account
        ? {
            id: contribution.account.id,
            email: contribution.account.email,
            creatorId: contribution.account.creatorId,
            status: contribution.account.status,
          }
        : undefined,
      editor: contribution.editor
        ? {
            id: contribution.editor.id,
            name: contribution.editor.name,
            email: contribution.editor.email,
            emailVerified: contribution.editor.emailVerified,
            image: contribution.editor.image,
            role: contribution.editor.role,
            phone: contribution.editor.phone,
            phoneVerified: contribution.editor.phoneVerified,
            profileCompleted: contribution.editor.profileCompleted,
            subscriptionId: contribution.editor.subscriptionId,
          }
        : undefined,
      video: contribution.video
        ? {
            id: contribution.video.id,
            type: contribution.video.type,
            integrationUrl: contribution.video.integrationUrl,
            integrationKey: contribution.video.integrationKey,
          }
        : undefined,
      thumbnail: contribution.thumbnail
        ? {
            id: contribution.thumbnail.id,
            type: contribution.thumbnail.type,
            integrationUrl: contribution.thumbnail.integrationUrl,
            integrationKey: contribution.thumbnail.integrationKey,
          }
        : undefined,
    }));
  }

  async getContributionById(id: string): Promise<xDomainContribute | null> {
    const contribution = await this.prisma.contribute.findUnique({
      where: { id },
      include: {
        account: true,
        editor: true,
        video: true,
        thumbnail: true,
        versions: {
          include: {
            video: true,
            thumbnail: true,
            comments: {
              include: {
                author: true,
              },
            },
          },
          orderBy: {
            versionNumber: 'desc',
          },
        },
      },
    });

    if (!contribution) {
      return null;
    }

    return {
      id: contribution.id,
      status: contribution.status,
      accountId: contribution.accountId,
      editorId: contribution.editorId,
      videoId: contribution.videoId,
      thumbnailId: contribution.thumbnailId,
      title: contribution.title,
      description: contribution.description,
      tags: contribution.tags,
      duration: contribution.duration,
      account: contribution.account
        ? {
            id: contribution.account.id,
            email: contribution.account.email,
            creatorId: contribution.account.creatorId,
            status: contribution.account.status,
          }
        : undefined,
      editor: contribution.editor
        ? {
            id: contribution.editor.id,
            name: contribution.editor.name,
            email: contribution.editor.email,
            emailVerified: contribution.editor.emailVerified,
            image: contribution.editor.image,
            role: contribution.editor.role,
            phone: contribution.editor.phone,
            phoneVerified: contribution.editor.phoneVerified,
            profileCompleted: contribution.editor.profileCompleted,
            subscriptionId: contribution.editor.subscriptionId,
          }
        : undefined,
      video: contribution.video
        ? {
            id: contribution.video.id,
            type: contribution.video.type,
            integrationUrl: contribution.video.integrationUrl,
            integrationKey: contribution.video.integrationKey,
          }
        : undefined,
      thumbnail: contribution.thumbnail
        ? {
            id: contribution.thumbnail.id,
            type: contribution.thumbnail.type,
            integrationUrl: contribution.thumbnail.integrationUrl,
            integrationKey: contribution.thumbnail.integrationKey,
          }
        : undefined,
      versions: contribution.versions?.map((version) => ({
        id: version.id,
        contributeId: version.contributeId,
        versionNumber: version.versionNumber,
        status: version.status,
        title: version.title,
        description: version.description,
        tags: version.tags,
        videoId: version.videoId,
        thumbnailId: version.thumbnailId,
        duration: version.duration,
        createdAt: version.createdAt,
        updatedAt: version.updatedAt,
        video: version.video
          ? {
              id: version.video.id,
              type: version.video.type,
              integrationUrl: version.video.integrationUrl,
              integrationKey: version.video.integrationKey,
            }
          : undefined,
        thumbnail: version.thumbnail
          ? {
              id: version.thumbnail.id,
              type: version.thumbnail.type,
              integrationUrl: version.thumbnail.integrationUrl,
              integrationKey: version.thumbnail.integrationKey,
            }
          : undefined,
        comments: version.comments?.map((comment) => ({
          id: comment.id,
          versionId: comment.versionId,
          authorId: comment.authorId,
          content: comment.content,
          createdAt: comment.createdAt,
          updatedAt: comment.updatedAt,
          author: comment.author
            ? {
                id: comment.author.id,
                name: comment.author.name,
                email: comment.author.email,
                emailVerified: comment.author.emailVerified,
                image: comment.author.image,
                role: comment.author.role,
                phone: comment.author.phone,
                phoneVerified: comment.author.phoneVerified,
                profileCompleted: comment.author.profileCompleted,
                subscriptionId: comment.author.subscriptionId,
              }
            : undefined,
        })),
      })),
    };
  }

  // Versioning methods
  async createVersion(
    data: CreateVersionData,
  ): Promise<xDomainContributionVersion> {
    // Get the next version number for this contribution
    const lastVersion = await this.prisma.contributionVersion.findFirst({
      where: { contributeId: data.contributeId },
      orderBy: { versionNumber: 'desc' },
    });

    const nextVersionNumber = (lastVersion?.versionNumber || 0) + 1;

    const version = await this.prisma.contributionVersion.create({
      data: {
        contributeId: data.contributeId,
        versionNumber: nextVersionNumber,
        title: data.title,
        description: data.description,
        tags: data.tags,
        videoId: data.videoId,
        thumbnailId: data.thumbnailId,
        duration: data.duration,
      },
      include: {
        contribute: true,
        video: true,
        thumbnail: true,
        comments: {
          include: {
            author: true,
          },
        },
      },
    });

    return {
      id: version.id,
      contributeId: version.contributeId,
      versionNumber: version.versionNumber,
      status: version.status,
      title: version.title,
      description: version.description,
      tags: version.tags,
      videoId: version.videoId,
      thumbnailId: version.thumbnailId,
      duration: version.duration,
      createdAt: version.createdAt,
      updatedAt: version.updatedAt,
      video: version.video
        ? {
            id: version.video.id,
            type: version.video.type,
            integrationUrl: version.video.integrationUrl,
            integrationKey: version.video.integrationKey,
          }
        : undefined,
      thumbnail: version.thumbnail
        ? {
            id: version.thumbnail.id,
            type: version.thumbnail.type,
            integrationUrl: version.thumbnail.integrationUrl,
            integrationKey: version.thumbnail.integrationKey,
          }
        : undefined,
      comments: version.comments?.map((comment) => ({
        id: comment.id,
        versionId: comment.versionId,
        authorId: comment.authorId,
        content: comment.content,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        author: comment.author
          ? {
              id: comment.author.id,
              name: comment.author.name,
              email: comment.author.email,
              emailVerified: comment.author.emailVerified,
              image: comment.author.image,
              role: comment.author.role,
              phone: comment.author.phone,
              phoneVerified: comment.author.phoneVerified,
              profileCompleted: comment.author.profileCompleted,
              subscriptionId: comment.author.subscriptionId,
            }
          : undefined,
      })),
    };
  }

  async getVersionsByContributionId(
    contributeId: string,
  ): Promise<xDomainContributionVersion[]> {
    const versions = await this.prisma.contributionVersion.findMany({
      where: { contributeId },
      include: {
        video: true,
        thumbnail: true,
        comments: {
          include: {
            author: true,
          },
        },
      },
      orderBy: { versionNumber: 'desc' },
    });

    return versions.map((version) => ({
      id: version.id,
      contributeId: version.contributeId,
      versionNumber: version.versionNumber,
      status: version.status,
      title: version.title,
      description: version.description,
      tags: version.tags,
      videoId: version.videoId,
      thumbnailId: version.thumbnailId,
      duration: version.duration,
      createdAt: version.createdAt,
      updatedAt: version.updatedAt,
      video: version.video
        ? {
            id: version.video.id,
            type: version.video.type,
            integrationUrl: version.video.integrationUrl,
            integrationKey: version.video.integrationKey,
          }
        : undefined,
      thumbnail: version.thumbnail
        ? {
            id: version.thumbnail.id,
            type: version.thumbnail.type,
            integrationUrl: version.thumbnail.integrationUrl,
            integrationKey: version.thumbnail.integrationKey,
          }
        : undefined,
      comments: version.comments?.map((comment) => ({
        id: comment.id,
        versionId: comment.versionId,
        authorId: comment.authorId,
        content: comment.content,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        author: comment.author
          ? {
              id: comment.author.id,
              name: comment.author.name,
              email: comment.author.email,
              emailVerified: comment.author.emailVerified,
              image: comment.author.image,
              role: comment.author.role,
              phone: comment.author.phone,
              phoneVerified: comment.author.phoneVerified,
              profileCompleted: comment.author.profileCompleted,
              subscriptionId: comment.author.subscriptionId,
            }
          : undefined,
      })),
    }));
  }

  async updateVersionStatus(
    versionId: string,
    data: UpdateVersionStatusData,
  ): Promise<xDomainContributionVersion> {
    // If accepting a version, disable accept/reject for other versions of the same contribution
    if (data.status === 'COMPLETED') {
      const version = await this.prisma.contributionVersion.findUnique({
        where: { id: versionId },
      });

      if (version) {
        // Update all other versions of the same contribution to REJECTED if they are PENDING
        await this.prisma.contributionVersion.updateMany({
          where: {
            contributeId: version.contributeId,
            id: { not: versionId },
            status: 'PENDING',
          },
          data: { status: 'REJECTED' },
        });

        // Update the contribution status to COMPLETED
        await this.prisma.contribute.update({
          where: { id: version.contributeId },
          data: { status: 'COMPLETED' },
        });
      }
    }

    const updatedVersion = await this.prisma.contributionVersion.update({
      where: { id: versionId },
      data: { status: data.status },
      include: {
        video: true,
        thumbnail: true,
        comments: {
          include: {
            author: true,
          },
        },
      },
    });

    return {
      id: updatedVersion.id,
      contributeId: updatedVersion.contributeId,
      versionNumber: updatedVersion.versionNumber,
      status: updatedVersion.status,
      title: updatedVersion.title,
      description: updatedVersion.description,
      tags: updatedVersion.tags,
      videoId: updatedVersion.videoId,
      thumbnailId: updatedVersion.thumbnailId,
      duration: updatedVersion.duration,
      createdAt: updatedVersion.createdAt,
      updatedAt: updatedVersion.updatedAt,
      video: updatedVersion.video
        ? {
            id: updatedVersion.video.id,
            type: updatedVersion.video.type,
            integrationUrl: updatedVersion.video.integrationUrl,
            integrationKey: updatedVersion.video.integrationKey,
          }
        : undefined,
      thumbnail: updatedVersion.thumbnail
        ? {
            id: updatedVersion.thumbnail.id,
            type: updatedVersion.thumbnail.type,
            integrationUrl: updatedVersion.thumbnail.integrationUrl,
            integrationKey: updatedVersion.thumbnail.integrationKey,
          }
        : undefined,
      comments: updatedVersion.comments?.map((comment) => ({
        id: comment.id,
        versionId: comment.versionId,
        authorId: comment.authorId,
        content: comment.content,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        author: comment.author
          ? {
              id: comment.author.id,
              name: comment.author.name,
              email: comment.author.email,
              emailVerified: comment.author.emailVerified,
              image: comment.author.image,
              role: comment.author.role,
              phone: comment.author.phone,
              phoneVerified: comment.author.phoneVerified,
              profileCompleted: comment.author.profileCompleted,
              subscriptionId: comment.author.subscriptionId,
            }
          : undefined,
      })),
    };
  }

  async getVersionById(
    versionId: string,
  ): Promise<xDomainContributionVersion | null> {
    const version = await this.prisma.contributionVersion.findUnique({
      where: { id: versionId },
      include: {
        contribute: {
          include: {
            account: true,
            editor: true,
          },
        },
        video: true,
        thumbnail: true,
        comments: {
          include: {
            author: true,
          },
        },
      },
    });

    if (!version) {
      return null;
    }

    return {
      id: version.id,
      contributeId: version.contributeId,
      versionNumber: version.versionNumber,
      status: version.status,
      title: version.title,
      description: version.description,
      tags: version.tags,
      videoId: version.videoId,
      thumbnailId: version.thumbnailId,
      duration: version.duration,
      createdAt: version.createdAt,
      updatedAt: version.updatedAt,
      contribute: version.contribute
        ? {
            id: version.contribute.id,
            status: version.contribute.status,
            accountId: version.contribute.accountId,
            editorId: version.contribute.editorId,
            videoId: version.contribute.videoId,
            thumbnailId: version.contribute.thumbnailId,
            title: version.contribute.title,
            description: version.contribute.description,
            tags: version.contribute.tags,
            duration: version.contribute.duration,
            account: version.contribute.account
              ? {
                  id: version.contribute.account.id,
                  email: version.contribute.account.email,
                  creatorId: version.contribute.account.creatorId,
                  status: version.contribute.account.status,
                }
              : undefined,
            editor: version.contribute.editor
              ? {
                  id: version.contribute.editor.id,
                  name: version.contribute.editor.name,
                  email: version.contribute.editor.email,
                  emailVerified: version.contribute.editor.emailVerified,
                  image: version.contribute.editor.image,
                  role: version.contribute.editor.role,
                  phone: version.contribute.editor.phone,
                  phoneVerified: version.contribute.editor.phoneVerified,
                  profileCompleted: version.contribute.editor.profileCompleted,
                  subscriptionId: version.contribute.editor.subscriptionId,
                }
              : undefined,
          }
        : undefined,
      video: version.video
        ? {
            id: version.video.id,
            type: version.video.type,
            integrationUrl: version.video.integrationUrl,
            integrationKey: version.video.integrationKey,
          }
        : undefined,
      thumbnail: version.thumbnail
        ? {
            id: version.thumbnail.id,
            type: version.thumbnail.type,
            integrationUrl: version.thumbnail.integrationUrl,
            integrationKey: version.thumbnail.integrationKey,
          }
        : undefined,
      comments: version.comments?.map((comment) => ({
        id: comment.id,
        versionId: comment.versionId,
        authorId: comment.authorId,
        content: comment.content,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        author: comment.author
          ? {
              id: comment.author.id,
              name: comment.author.name,
              email: comment.author.email,
              emailVerified: comment.author.emailVerified,
              image: comment.author.image,
              role: comment.author.role,
              phone: comment.author.phone,
              phoneVerified: comment.author.phoneVerified,
              profileCompleted: comment.author.profileCompleted,
              subscriptionId: comment.author.subscriptionId,
            }
          : undefined,
      })),
    };
  }

  async createVersionComment(
    data: CreateVersionCommentData,
  ): Promise<xDomainVersionComment> {
    const comment = await this.prisma.versionComment.create({
      data: {
        versionId: data.versionId,
        authorId: data.authorId,
        content: data.content,
      },
      include: {
        author: true,
        version: true,
      },
    });

    return {
      id: comment.id,
      versionId: comment.versionId,
      authorId: comment.authorId,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      author: comment.author
        ? {
            id: comment.author.id,
            name: comment.author.name,
            email: comment.author.email,
            emailVerified: comment.author.emailVerified,
            image: comment.author.image,
            role: comment.author.role,
            phone: comment.author.phone,
            phoneVerified: comment.author.phoneVerified,
            profileCompleted: comment.author.profileCompleted,
            subscriptionId: comment.author.subscriptionId,
          }
        : undefined,
    };
  }

  async getVersionComments(
    versionId: string,
  ): Promise<xDomainVersionComment[]> {
    const comments = await this.prisma.versionComment.findMany({
      where: { versionId },
      include: {
        author: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return comments.map((comment) => ({
      id: comment.id,
      versionId: comment.versionId,
      authorId: comment.authorId,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      author: comment.author
        ? {
            id: comment.author.id,
            name: comment.author.name,
            email: comment.author.email,
            emailVerified: comment.author.emailVerified,
            image: comment.author.image,
            role: comment.author.role,
            phone: comment.author.phone,
            phoneVerified: comment.author.phoneVerified,
            profileCompleted: comment.author.profileCompleted,
            subscriptionId: comment.author.subscriptionId,
          }
        : undefined,
    }));
  }
}
