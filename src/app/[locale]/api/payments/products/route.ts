/**
 * Products API Route
 *
 * This route handles product-related operations using the Creem SDK.
 * Currently implements:
 * - GET: Fetches all available products with pricing and product IDs
 *
 * @module api/products
 */

import { Creem } from "creem";
import { NextResponse } from "next/server";
import { getSubscriptionPlans } from "~/servers/subscription";

/**
 * Initialize Creem SDK client
 * Server index 1 is used for test environment
 */
const creem = new Creem({
  serverIdx: 1,
});

/**
 * GET /api/products
 *
 * Fetches all products from Creem's API with pagination support,
 * combined with local subscription plans for pricing information.
 *
 * @async
 * @function
 * @returns {Promise<NextResponse>} JSON response containing:
 * - On success: Array of products with pricing and product IDs
 * - On error: Error message with 500 status code
 *
 * @example Response format
 * {
 *   success: true,
 *   data: {
 *     creemProducts: Array<{
 *       id: string;
 *       name: string;
 *       description: string;
 *       ...
 *     }>;
 *     subscriptionPlans: Array<{
 *       id: string;
 *       name: string;
 *       price: number;
 *       currency: string;
 *       dailyLimit: number;
 *       features: object;
 *     }>;
 *     premiumProduct: {
 *       creemProductId: string;
 *       price: number;
 *       currency: string;
 *       name: string;
 *       dailyLimit: number;
 *     }
 *   }
 * }
 */
export async function GET() {
  const apiKey = process.env.CREEM_API_KEY;
  const creemProductId = process.env.CREEM_PRODUCT_ID;

  try {
    // Fetch products from Creem API
    const creemProducts = await creem.searchProducts({
      xApiKey: apiKey as string,
      pageNumber: 0,
      pageSize: 100,
    });

    // Fetch local subscription plans
    const subscriptionPlans = await getSubscriptionPlans();

    // Find the premium plan with Creem product ID
    const premiumPlan = subscriptionPlans.find(plan => 
      plan.id === creemProductId || 
      (plan.features as any)?.creem_product_id === creemProductId
    );

    // Construct response with both Creem products and local pricing
    const response = {
      success: true,
      data: {
        creemProducts,
        subscriptionPlans,
        premiumProduct: premiumPlan ? {
          creemProductId: creemProductId,
          price: premiumPlan.price,
          currency: premiumPlan.currency,
          name: premiumPlan.name,
          dailyLimit: premiumPlan.dailyLimit,
          features: premiumPlan.features
        } : null
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch products" 
      },
      { status: 500 },
    );
  }
}
