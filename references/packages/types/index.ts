import { $Enums } from "@spectral/db";
// User entity types
import { User } from "@spectral/db";
export type xUser = User;

// User domain types
export type xDomainUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: string | null;
  phone: string | null;
  phoneVerified: boolean | null;
  profileCompleted: boolean | null;
  subscriptionId: string | null;
};

// YtCreator
// YtCreatorStatus enum
export type xYtCreatorStatusType = $Enums.YtCreatorStatus;

// YtCreator entity types
import { YtCreator } from "@spectral/db";
export type xYtCreator = YtCreator;

// YtCreator domain types
export type xDomainYtCreator = {
  id: string;
  email: string;
  creatorId: string;
  status: $Enums.YtCreatorStatus;
};

// CreatorEditorMap

// CreatorEditorMapStatus enum
export type xCreatorEditorMapStatusType = $Enums.CreatorEditorMapStatus;

// CreatorEditorMap entity types
import { CreatorEditorMap } from "@spectral/db";
export type xCreatorEditorMap = CreatorEditorMap;

// CreatorEditorMap domain types
export type xDomainCreatorEditorMap = {
  id: string;
  creatorId: string;
  editorId: string;
  status: xCreatorEditorMapStatusType;
  creator?: xDomainUser;
  editor?: xDomainUser;
};

// AccountEditorMap

// AccountEditorMapStatus enum
export type xAccountEditorMapStatusType = $Enums.AccountEditorMapStatus;

// AccountEditorMap entity types
import { AccountEditorMap } from "@spectral/db";
export type xAccountEditorMap = AccountEditorMap;

// AccountEditorMap domain types
export type xDomainAccountEditorMap = {
  id: string;
  accountId: string;
  editorId: string;
  status: xAccountEditorMapStatusType;
  account?: xDomainYtCreator;
  editor?: xDomainUser;
};

// Folder entity types
import { Folder } from "@spectral/db";
export type xFolder = Folder;

// Folder domain types
export type xDomainFolders = {
  id: string;
  folderId: string;
  name: string;
  creatorId: string;
  editorId: string;
  accountId: string;
};

// FolderItems entity types
import { FolderItem } from "@spectral/db";
export type xFolderItem = FolderItem;

// FolderItems domain types
export type xDomainFolderItem = {
  id: string;
  folderId: string;
  mediaId: string;
  media: xDomainMedia;
};

// Media

// MediaType enum
export type xMediaType = $Enums.MediaType;

// Media entity types
import { Media } from "@spectral/db";
export type xMedia = Media;

// Media domain types
export type xDomainMedia = {
  id: string;
  type: xMediaType;
  integrationUrl: string | null;
  integrationKey: string | null;
};

// Contribute

// ContributeStatus enum
export type xContributeStatusType = $Enums.ContributeStatus;

// Contribute entity types
import { Contribute } from "@spectral/db";
export type xContribute = Contribute;

// Contribute domain types
export type xDomainContribute = {
  id: string;
  status: xContributeStatusType;
  accountId: string;
  editorId: string;
  videoId: string;
  thumbnailId: string;
  title: string;
  description: string;
  tags: string[];
  duration: number;
  account?: xDomainYtCreator;
  editor?: xDomainUser;
  video?: xDomainMedia;
  thumbnail?: xDomainMedia;
  versions?: xDomainContributionVersion[];
};

// ContributionVersion

// ContributionVersionStatus enum
export type xContributionVersionStatusType = $Enums.ContributionVersionStatus;

// ContributionVersion entity types
import { ContributionVersion } from "@spectral/db";
export type xContributionVersion = ContributionVersion;

// ContributionVersion domain types
export type xDomainContributionVersion = {
  id: string;
  contributeId: string;
  versionNumber: number;
  status: xContributionVersionStatusType;
  title: string;
  description: string;
  tags: string[];
  videoId: string;
  thumbnailId: string;
  duration: number;
  createdAt: Date;
  updatedAt: Date;
  contribute?: xDomainContribute;
  video?: xDomainMedia;
  thumbnail?: xDomainMedia;
  comments?: xDomainVersionComment[];
};

// VersionComment

// VersionComment entity types
import { VersionComment } from "@spectral/db";
export type xVersionComment = VersionComment;

// VersionComment domain types
export type xDomainVersionComment = {
  id: string;
  versionId: string;
  authorId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  version?: xDomainContributionVersion;
  author?: xDomainUser;
};
