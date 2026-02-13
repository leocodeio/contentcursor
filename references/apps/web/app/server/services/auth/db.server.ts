import { betterAuth, Session, User } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import {
  handleOrderPaid,
  handleSubscriptionCanceled,
  handleSubscriptionRevoked,
} from "../payments/payment.server";

/*
 * prisma
 */
import { db } from "@spectral/db";

/*
 * polar
 */
import {
  polar,
  checkout,
  portal,
  usage,
  webhooks,
} from "@polar-sh/better-auth";
import { Polar } from "@polar-sh/sdk";

/*
 * swagger
 */
/*
 * api docs
 */
import { openAPI } from "better-auth/plugins";

/*
 *bearer
 * auth
 */
import { bearer } from "better-auth/plugins";
import { redirect } from "@remix-run/node";

const polarClient = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  // Use 'sandbox' if you're using the Polar Sandbox environment
  // Remember that access tokens, products, etc. are completely separated between environments.
  // Access tokens obtained in Production are for instance not usable in the Sandbox environment.
  server: "sandbox",
});

/*
 * better-auth
 */
export const auth = betterAuth({
  /*
   * base URL configuration
   */
  baseURL: process.env.APP_BASE_URL,
  /*
   * database
   */
  trustedOrigins: [
    process.env.APP_BASE_URL as string,
    process.env.API_BASE_URL as string,
  ],
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),

  /*
   * email and password
   */
  emailAndPassword: {
    enabled: true,
  },

  /*
   * social providers
   * google
   */
  socialProviders: {
    google: {
      clientId: process.env.BETTER_AUTH_GOOGLE_ID!,
      clientSecret: process.env.BETTER_AUTH_GOOGLE_SECRET!,
      redirectUri: `${process.env.APP_BASE_URL}/api/auth/callback/google`,
    },
  },

  /*
   * additional fields
   */
  user: {
    additionalFields: {
      role: { type: "string", required: false, default: null, nullable: true },
      phone: { type: "string", required: false, default: null, nullable: true },
      phoneVerified: {
        type: "boolean",
        required: false,
        default: false,
      },
      profileCompleted: {
        type: "boolean",
        required: false,
        default: false,
      },
      subscriptionId: {
        type: "string",
        required: false,
        default: null,
        nullable: true,
      },
    },
  },

  /*
   * session and cookies
   */
  advanced: {
    cookiePrefix: "spectral",
  },
  session: {
    // expiresIn: 60 * 60 * 8, // 8 hours
    expiresIn: 60 * 60,
  },
  /*
   * plugins
   */
  plugins: [
    bearer(),
    openAPI(),
    polar({
      client: polarClient,
      // createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [
            {
              productId: "d6fd3bbd-8fae-4302-b4a6-240497c03626",
              slug: "benificial",
            },
          ],
          successUrl: "/api/payments/success?checkout_id={CHECKOUT_ID}",
          authenticatedUsersOnly: true,
        }),
        portal(),
        usage(),
        webhooks({
          secret: process.env.POLAR_WEBHOOK_SECRET!,
          onOrderPaid: handleOrderPaid,
          onSubscriptionCanceled: handleSubscriptionCanceled,
          onSubscriptionRevoked: handleSubscriptionRevoked,
        }),
      ],
    }),
  ],
});

// session
export const getSession = async (request: Request) => {
  const session = await auth.api.getSession(request);
  return session;
};

// validate session
export const validateSession = async (
  request: Request
): Promise<{ session: Session; user: User } | Response | null> => {
  const currentSession = await getSession(request);
  if (!currentSession) {
    return redirect("/");
  }
  if (!currentSession.user.profileCompleted) {
    return redirect("/feature/home/profile");
  }
  return currentSession;
};

// get access token
export const getAccessToken = async (request: Request) => {
  const session = await getSession(request);
  if (!session) {
    throw new Error("No session found");
  }
  return session.session.token;
};
