import {
  xDomainContribute,
  xContributionVersionStatusType,
  xDomainContributionVersion,
  xDomainVersionComment,
} from '@spectral/types';

export interface CreateContributeData {
  accountId: string;
  editorId: string;
  videoId: string;
  thumbnailId: string;
  title: string;
  description: string;
  tags: string[];
  duration: number;
}

export interface CreateVersionData {
  contributeId: string;
  title: string;
  description: string;
  tags: string[];
  videoId: string;
  thumbnailId: string;
  duration: number;
}

export interface UpdateVersionStatusData {
  status: xContributionVersionStatusType;
}

export interface CreateVersionCommentData {
  versionId: string;
  authorId: string;
  content: string;
}

export abstract class IContributePort {
  abstract createContribution(
    data: CreateContributeData,
  ): Promise<xDomainContribute>;

  abstract getContributionsByAccountId(
    accountId: string,
  ): Promise<xDomainContribute[]>;

  abstract getContributionById(id: string): Promise<xDomainContribute | null>;

  // Versioning methods
  abstract createVersion(
    data: CreateVersionData,
  ): Promise<xDomainContributionVersion>;

  abstract getVersionsByContributionId(
    contributeId: string,
  ): Promise<xDomainContributionVersion[]>;

  abstract updateVersionStatus(
    versionId: string,
    data: UpdateVersionStatusData,
  ): Promise<xDomainContributionVersion>;

  abstract getVersionById(
    versionId: string,
  ): Promise<xDomainContributionVersion | null>;

  // Comment methods
  abstract createVersionComment(
    data: CreateVersionCommentData,
  ): Promise<xDomainVersionComment>;

  abstract getVersionComments(
    versionId: string,
  ): Promise<xDomainVersionComment[]>;
}
