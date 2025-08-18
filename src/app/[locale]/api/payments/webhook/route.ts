/**
 * Webhook API Route
 * 
 * Handles incoming webhooks from Creem's payment system.
 * Processes both one-time payments and subscription lifecycle events.
 * Updates local database to maintain payment and subscription state.
 * 
 * @module api/webhook
 */

import { NextResponse, NextRequest } from "next/server";
import { 
  createUserSubscription, 
  updateSubscriptionStatus,
  recordPayment,
  getUserSubscriptionByCreemId
} from "~/servers/subscription";

/**
 * Webhook Response Interface
 * 
 * Represents the structure of incoming webhook events from Creem.
 * This is a simplified version focusing on essential fields for the template.
 * 
 * @interface WebhookResponse
 * @property {string} id - Unique identifier for the webhook event
 * @property {string} eventType - Type of event (e.g., "checkout.completed", "subscription.paid")
 * @property {Object} object - Contains the event payload
 * @property {string} object.request_id - Contains userId for one-time payments
 * @property {string} object.id - Unique identifier for the payment/subscription
 * @property {Object} object.customer - Customer information
 * @property {Object} object.product - Product information including billing type
 * @property {string} object.status - Current status of the payment/subscription
 * @property {Object} object.metadata - Additional data passed during checkout
 */
export interface WebhookResponse {
  id: string;
  eventType: string;
  object: {
    request_id: string;
    object: string;
    id: string;
    customer: {
      id: string;
    };
    product: {
      id: string;
      billing_type: string;
    };
    status: string;
    metadata: any;
  };
}

/**
 * POST /api/webhook
 * 
 * Processes incoming webhook events from Creem's payment system.
 * Handles both one-time payments and subscription lifecycle events.
 * 
 * Event Types Handled:
 * 1. One-Time Payments:
 *    - checkout.completed: Payment successful, fulfill purchase
 * 
 * 2. Subscriptions:
 *    - subscription.paid: New subscription or successful renewal
 *    - subscription.canceled: Subscription cancellation requested
 *    - subscription.expired: Subscription ended (payment failed or period ended)
 * 
 * @async
 * @function
 * @param {NextRequest} req - Incoming webhook request containing event data
 * @returns {Promise<NextResponse>} Confirmation of webhook processing
 * 
 * @example Webhook Event - One-Time Payment
 * {
 *   "id": "whk_123",
 *   "eventType": "checkout.completed",
 *   "object": {
 *     "request_id": "user_123",
 *     "id": "pay_123",
 *     "customer": { "id": "cus_123" },
 *     "product": {
 *       "id": "prod_123",
 *       "billing_type": "one-time"
 *     }
 *   }
 * }
 * 
 * @example Webhook Event - Subscription
 * {
 *   "id": "whk_456",
 *   "eventType": "subscription.paid",
 *   "object": {
 *     "id": "sub_123",
 *     "metadata": { "userId": "user_123" },
 *     "customer": { "id": "cus_123" },
 *     "product": {
 *       "id": "prod_456",
 *       "billing_type": "recurring"
 *     }
 *   }
 * }
 */
export async function POST(req: NextRequest) {
  const webhook = (await req.json()) as WebhookResponse;

  // Determine payment type based on billing_type
  const isSubscription = webhook.object.product.billing_type === "recurring";

  if (!isSubscription) {
    /**
     * One-Time Payment Flow
     * --------------------
     * 1. Verify payment completion via checkout.completed event
     * 2. Extract user ID from request_id (set during checkout)
     * 3. Store purchase record in database
     * 4. Enable access to purchased product/feature
     */
    if (webhook.eventType === "checkout.completed") {
      const userId = webhook.object.request_id;
      const productId = webhook.object.product.id;
      
      // For one-time payments, we could store them in payment_records table
      try {
        await recordPayment(
          userId,
          webhook.object.id,
          null, // No subscription ID for one-time payments
          9.99, // Should extract from webhook data
          "USD",
          "completed",
          "one-time"
        );
        console.log(`Recorded one-time payment for user: ${userId}`);
      } catch (error) {
        console.error("Failed to record one-time payment:", error);
      }
    }
  } else {
    /**
     * Subscription Flow
     * ----------------
     * Handles the complete subscription lifecycle:
     * 
     * 1. subscription.paid
     *    - New subscription or successful renewal
     *    - Create/update subscription record
     *    - Enable access to subscription features
     * 
     * 2. subscription.canceled
     *    - User requested cancellation
     *    - Mark subscription for non-renewal
     *    - Optionally maintain access until period end
     * 
     * 3. subscription.expired
     *    - Final state: payment failed or canceled period ended
     *    - Update subscription status
     *    - Revoke access to subscription features
     */
    if (webhook.eventType === "subscription.paid") {
      const userId = webhook.object.metadata.userId;
      const productId = webhook.object.product.id;
      const creemSubscriptionId = webhook.object.id;
      
      let subscriptionRecordId = null;
      
      try {
        // Calculate period dates (assuming monthly subscription)
        const currentDate = new Date();
        const periodStart = new Date(currentDate);
        const periodEnd = new Date(currentDate);
        periodEnd.setMonth(periodEnd.getMonth() + 1);

        // Try to update existing subscription first
        await updateSubscriptionStatus(
          creemSubscriptionId,
          "active",
          periodStart,
          periodEnd
        );
        
        // Get the subscription record ID for payment recording
        const existingSubscription = await getUserSubscriptionByCreemId(creemSubscriptionId);
        subscriptionRecordId = existingSubscription?.id;
        
        console.log(`Updated existing subscription: ${creemSubscriptionId}`);
      } catch (error) {
        // If update fails, create new subscription
        try {
          const newSubscription = await createUserSubscription(
            userId,
            'premium', // Use standard plan ID
            creemSubscriptionId,
            new Date(),
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
          );
          
          subscriptionRecordId = newSubscription.id;
          console.log(`Created new subscription for user: ${userId}`);
        } catch (createError) {
          console.error("Failed to create subscription:", createError);
        }
      }

      // Record the payment
      try {
        await recordPayment(
          userId,
          webhook.object.id, // Use subscription ID as payment ID for recurring payments
          subscriptionRecordId, // Now we have the actual subscription record ID
          9.99, // Price from environment or webhook data
          "USD",
          "completed"
        );
      } catch (paymentError) {
        console.error("Failed to record payment:", paymentError);
      }
    }

    if (webhook.eventType === "subscription.canceled") {
      // Handle subscription cancellation - keep active until period ends
      // This event is triggered when user cancels but should maintain access
      try {
        // Get existing subscription to check current period end
        const existingSubscription = await getUserSubscriptionByCreemId(webhook.object.id);
        if (existingSubscription) {
          // Instead of setting status to "canceled", we mark it for cancellation at period end
          // The subscription should remain "active" until the period expires
          console.log(`Subscription marked for cancellation at period end: ${webhook.object.id}`);
          // Note: cancel_at_period_end should already be set by our API
          // We don't change the status here - it remains "active"
        }
      } catch (error) {
        console.error("Failed to handle subscription cancellation:", error);
      }
    }

    if (webhook.eventType === "subscription.expired") {
      // Final subscription state update
      try {
        await updateSubscriptionStatus(
          webhook.object.id,
          "expired"
        );
        console.log(`Expired subscription: ${webhook.object.id}`);
      } catch (error) {
        console.error("Failed to expire subscription:", error);
      }
    }
  }

  // Confirm webhook processing
  return NextResponse.json({
    success: true,
    message: "Webhook received successfully",
  });
}
