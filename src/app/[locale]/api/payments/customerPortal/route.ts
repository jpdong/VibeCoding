/**
 * Customer Portal API Route
 *
 * Generates a secure link to the customer portal using the Creem SDK.
 * The portal allows customers to manage their subscriptions and billing information.
 *
 * @module api/customerPortal
 */

import { Creem } from "creem";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import { getUserSubscription } from "~/servers/subscription";

/**
 * Initialize Creem SDK client
 * Server index 1 is used for test environment
 */
const creem = new Creem({
  serverIdx: 1,
});

/**
 * GET /api/customerPortal
 *
 * Generates a unique URL for accessing the customer portal.
 * Requires a valid customer ID to generate the portal link.
 *
 * @async
 * @function
 * @param {NextRequest} req - Next.js request object containing:
 *   - customer_id: Query parameter identifying the customer
 *
 * @returns {Promise<NextResponse>} JSON response containing:
 * - Success: { url: string } - Portal access URL
 * - Error: { error: string } with appropriate status code
 *
 * @example
 * // Request
 * GET /api/customerPortal?customer_id=cus_123
 *
 * // Success Response
 * {
 *   "url": "https://portal.creem.io/cp_123..."
 * }
 *
 * // Error Response
 * {
 *   "error": "Unauthorized"
 * }
 * Status: 401 Unauthorized
 */
export async function GET(req: NextRequest) {
  try {
    // Check user authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.user_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKey = process.env.CREEM_API_KEY;
    let customerId = req.nextUrl.searchParams.get("customer_id");

    // If no customer_id provided, try to get it from user's subscription
    if (!customerId) {
      const subscription = await getUserSubscription(session.user.user_id);
      if (!subscription?.creemSubscriptionId) {
        return NextResponse.json(
          { error: "No active subscription found" },
          { status: 404 }
        );
      }
      
      // For now, we'll use the subscription ID as customer reference
      // In a real scenario, you'd need to store the customer ID separately
      return NextResponse.json(
        { 
          success: false, 
          error: "Customer portal not available. Please contact support to manage your subscription." 
        },
        { status: 400 }
      );
    }

    // Generate customer portal link using Creem SDK
    const customerPortalLogin = await creem.generateCustomerLinks({
      xApiKey: apiKey as string,
      createCustomerPortalLinkRequestEntity: {
        customerId: customerId,
      },
    });

    // Return the portal URL for client-side redirect
    return NextResponse.json({ 
      success: true,
      portalUrl: customerPortalLogin.customerPortalLink 
    });
  } catch (error) {
    console.error("Error generating customer portal link:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate portal link" },
      { status: 500 },
    );
  }
}
