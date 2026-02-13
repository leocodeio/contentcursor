import { redirect } from "@remix-run/node";
import { getLinkAccountUrl } from "~/server/services/creator/accounts.server";

export const action = async ({ request }: { request: Request }) => {
  const result = await getLinkAccountUrl(request);
  if (result.success) {
    return redirect(result.data || "");
  }
  return new Response(
    JSON.stringify({ error: "Failed to get link account url" }),
    {
      status: 500,
    }
  );
};
