import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
import { NextRequest } from "next/server";

// import {
//   handleOrderPaid,
//   handleSubscriptionCanceled,
//   handleSubscriptionRevoked,
// } from "../payments/payment.server";

/*
 * prisma
 * Singleton pattern for Next.js to prevent multiple instances in development
 */

const prismaClientSingleton = () => {
  return new PrismaClient();
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export { prisma };

/*
 * better-auth
 */
export const auth = betterAuth({
  /*
   * database
   */
  trustedOrigins: [process.env.NEXT_PUBLIC_BETTER_AUTH_URL as string],
  database: prismaAdapter(prisma, {
    provider: "mongodb",
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
   * plugins
   */
  plugins: [
    // polar({
    //   client: polarClient,
    //   // createCustomerOnSignUp: true,
    //   use: [
    //     checkout({
    //       products: [
    //         {
    //           productId: "d6fd3bbd-8fae-4302-b4a6-240497c03626",
    //           slug: "benificial",
    //         },
    //       ],
    //       successUrl: "/api/payments/success?checkout_id={CHECKOUT_ID}",
    //       authenticatedUsersOnly: true,
    //     }),
    //     portal(),
    //     usage(),
    //     webhooks({
    //       secret: process.env.POLAR_WEBHOOK_SECRET!,
    //       onOrderPaid: handleOrderPaid,
    //       onSubscriptionCanceled: handleSubscriptionCanceled,
    //       onSubscriptionRevoked: handleSubscriptionRevoked,
    //     }),
    //   ],
    // }),
  ],
});

export default auth;

// session
export const getSession = async (request: NextRequest) => {
  const session = await auth.api.getSession(request);
  return session;
};
