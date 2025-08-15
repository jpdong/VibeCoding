import { NextRequest, NextResponse } from 'next/server';
import { createUserSubscription, updateSubscriptionStatus, recordPayment } from '~/servers/subscription';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('creem-signature');
    
    if (!signature) {
      return NextResponse.json(
        { success: false, error: 'Missing signature' },
        { status: 400 }
      );
    }

    // TODO: 验证 Creem webhook 签名
    const isValidSignature = await verifyCreemSignature(body, signature);
    if (!isValidSignature) {
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 400 }
      );
    }

    const event = JSON.parse(body);
    
    switch (event.type) {
      case 'subscription.created':
        await handleSubscriptionCreated(event.data);
        break;
        
      case 'subscription.updated':
        await handleSubscriptionUpdated(event.data);
        break;
        
      case 'subscription.deleted':
        await handleSubscriptionDeleted(event.data);
        break;
        
      case 'payment.succeeded':
        await handlePaymentSucceeded(event.data);
        break;
        
      case 'payment.failed':
        await handlePaymentFailed(event.data);
        break;
        
      default:
        console.log(`Unhandled webhook event type: ${event.type}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { success: false, error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function verifyCreemSignature(body: string, signature: string): Promise<boolean> {
  // TODO: 实现 Creem 签名验证
  // 这里需要根据 Creem 的实际签名验证方法来实现
  const webhookSecret = process.env.CREEM_WEBHOOK_SECRET;
  if (!webhookSecret) return false;
  
  // 示例签名验证逻辑（需要根据 Creem 文档调整）
  // const crypto = require('crypto');
  // const expectedSignature = crypto
  //   .createHmac('sha256', webhookSecret)
  //   .update(body)
  //   .digest('hex');
  
  // return signature === expectedSignature;
  return true; // 临时返回 true，需要实际实现
}

async function handleSubscriptionCreated(subscription: any) {
  const { customer, metadata, current_period_start, current_period_end } = subscription;
  
  if (metadata?.userId && metadata?.planId) {
    await createUserSubscription(
      metadata.userId,
      metadata.planId,
      subscription.id,
      new Date(current_period_start * 1000),
      new Date(current_period_end * 1000)
    );
  }
}

async function handleSubscriptionUpdated(subscription: any) {
  const { id, status, current_period_start, current_period_end } = subscription;
  
  await updateSubscriptionStatus(
    id,
    status,
    new Date(current_period_start * 1000),
    new Date(current_period_end * 1000)
  );
}

async function handleSubscriptionDeleted(subscription: any) {
  await updateSubscriptionStatus(subscription.id, 'cancelled');
}

async function handlePaymentSucceeded(payment: any) {
  const { customer, amount, currency, subscription, payment_method } = payment;
  
  // 查找相关订阅
  // TODO: 需要根据实际的 Creem 数据结构调整
  if (subscription && payment.metadata?.userId) {
    // 记录成功的支付
    // await recordPayment(
    //   payment.metadata.userId,
    //   payment.id,
    //   subscription.id,
    //   amount / 100, // Creem 通常以分为单位
    //   currency,
    //   'completed',
    //   payment_method?.type
    // );
  }
}

async function handlePaymentFailed(payment: any) {
  const { customer, amount, currency, subscription, failure_reason } = payment;
  
  if (subscription && payment.metadata?.userId) {
    // 记录失败的支付
    // await recordPayment(
    //   payment.metadata.userId,
    //   payment.id,
    //   subscription.id,
    //   amount / 100,
    //   currency,
    //   'failed'
    // );
  }
}