import { auth } from "~/server/services/auth/db.server";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { secureSwaggerRoute } from "~/server/middlewares/swagger.middleware";

export async function loader({ request }: LoaderFunctionArgs) {
  // 1) If paths points to /api/auth/reference we will ask for swagger id and pass
  if (request.url.includes("/api/auth/reference")) {
    const authResult = secureSwaggerRoute(request);
    if (authResult) return authResult;
  }

  // 2) If paths points to /api/auth then we will handle the auth request
  return auth.handler(request);
}

export async function action({ request }: ActionFunctionArgs) {
  return auth.handler(request);
}
