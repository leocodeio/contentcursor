import { Session, User } from "@prisma/client";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { validateSession } from "~/server/services/auth/db.server";

export const ROUTE_PATH = "/feature" as const;

export async function loader({ request }: LoaderFunctionArgs): Promise<any> {
  const session = (await validateSession(request)) as {
    session: Session;
    user: User;
  };

  return { user: session?.user };
}
