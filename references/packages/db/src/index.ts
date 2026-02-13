import { PrismaClient } from "@prisma/client";

export type {
  // Auth
  User,
  Session,
  Account,
  Payment,
  Subscription,
  Verification,

  // Api
  YtCreator,
  YtCreatorStatus,
  CreatorEditorMap,
  AccountEditorMap,
  Folder,
  FolderItem,
  Media,
  Contribute,

  // Versioning
  ContributionVersion,
  ContributionVersionStatus,
  VersionComment,

  // add all enums from prisma
  $Enums,

  // Add other types you need
} from "@prisma/client";

// Export the main PrismaClient
export { PrismaClient };

// Create and export a singleton instance
declare global {
  var __db__: PrismaClient | undefined;
}

export const db =
  globalThis.__db__ ??
  new PrismaClient({
    // log: ["query", "info", "warn", "error"],
    log: ["error"], // Adjust logging as needed
  });
// new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__db__ = db;
}
