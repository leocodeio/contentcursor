import { redirect } from "@remix-run/node";
import { Persona } from "~/models/persona";
import { getSession } from "~/server/services/auth/db.server";
import { linkAccount } from "~/server/services/creator/accounts.server";

export const loader = async ({ request }: { request: Request }) => {
  // console.log("callback request", request);

  // Get the URL from the request
  const url = new URL(request.url);

  // Get the 'code' query parameter
  const code = url.searchParams.get("code");
  // console.log("Extracted code:", code);

  // You can also extract other parameters if needed
  const scope = url.searchParams.get("scope");
  // console.log("Extracted scope:", scope);

  const session = await getSession(request);
  const creatorId = session?.user?.id!;
  const data = await linkAccount(request, {
    code: code!,
    creatorId: creatorId,
  });

  if (data?.success) {
    return redirect(
      "/feature/accounts?success=" + data.success + "&message=" + data.message
    );
  } else {
    return redirect(
      "/feature/accounts?success=" + false + "&message=" + data?.message
    );
  }
};
