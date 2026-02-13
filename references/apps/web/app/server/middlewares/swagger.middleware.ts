// middleware/basicAuth.ts
export function secureSwaggerRoute(request: Request) {
  const authHeader = request.headers.get("authorization");
  console.log("Authorization header:", authHeader);
  if (!authHeader || !authHeader.startsWith("Basic ")) {
    console.log("No authorization header or not Basic auth");
    return new Response("Unauthorized", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Swagger Docs"',
      },
    });
  }

  const base64Credentials = authHeader.split(" ")[1];
  const credentials = Buffer.from(base64Credentials, "base64").toString(
    "ascii"
  );
  const [username, password] = credentials.split(":");

  const expectedUser = process.env.SWAGGER_USER;
  const expectedPass = process.env.SWAGGER_PASSWORD;

  if (username !== expectedUser || password !== expectedPass) {
    return new Response("Unauthorized", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Swagger Docs"',
      },
    });
  }

  return null;
}
