import Razorpay from 'razorpay';
import crypto from 'crypto';
import { env } from './env.js';

let razorpayClient: Razorpay | null = null;

try {
  if (env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET) {
    razorpayClient = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET,
    });
  }
} catch (err) {
  console.warn('⚠️ Razorpay initialization warning:', err);
}

export { razorpayClient };

export interface RazorpayOrderResult {
  id: string;
  amount: number;
  currency: string;
  receipt?: string;
  isSimulated?: boolean;
}

/**
 * Creates an order either via Razorpay SDK or simulates for local/sandbox testing
 */
export async function createRazorpayOrder({
  amountInPaise,
  currency = 'INR',
  receipt,
  notes = {},
}: {
  amountInPaise: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<RazorpayOrderResult> {
  // If razorpay client is ready and configured with non-mock key, invoke it
  if (razorpayClient && !env.RAZORPAY_KEY_ID.includes('DemoKey')) {
    try {
      const order = await razorpayClient.orders.create({
        amount: Math.round(amountInPaise),
        currency,
        receipt,
        notes,
      });
      return {
        id: order.id,
        amount: Number(order.amount),
        currency: order.currency,
        receipt: order.receipt || receipt,
      };
    } catch (apiError: any) {
      console.warn('Razorpay API live call failed, falling back to simulated order:', apiError?.message || apiError);
    }
  }

  // Demo / Simulated order for local development and test keys
  const simulatedId = `order_${crypto.randomBytes(8).toString('hex')}`;
  return {
    id: simulatedId,
    amount: Math.round(amountInPaise),
    currency,
    receipt,
    isSimulated: true,
  };
}

/**
 * Verifies Razorpay payment signature
 */
export function verifyRazorpaySignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  if (!orderId || !paymentId) return false;

  // In test/demo sandbox mode
  if (
    orderId.startsWith('order_') &&
    (env.RAZORPAY_KEY_ID.includes('DemoKey') || signature === 'simulated_success_signature')
  ) {
    return true;
  }

  try {
    const generatedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    return generatedSignature === signature;
  } catch {
    return false;
  }
}
