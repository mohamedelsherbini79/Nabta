export type TransactionStatus = "PAID" | "FAILED" | "PENDING";

export interface PaymentSession {
  tranRef: string;
  redirectUrl: string;
}

export interface CreatePaymentSessionParams {
  orderId: string;
  amount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerIp: string;
  addressLine: string;
  city: string;
  callbackUrl: string;
  returnUrl: string;
}

export interface PaymentProvider {
  createPaymentSession(params: CreatePaymentSessionParams): Promise<PaymentSession>;
  queryTransaction(tranRef: string): Promise<TransactionStatus>;
}

export class PaymentGatewayNotConfiguredError extends Error {
  constructor() {
    super("Payment gateway is not configured (missing PAYTABS_PROFILE_ID/PAYTABS_SERVER_KEY).");
    this.name = "PaymentGatewayNotConfiguredError";
  }
}

function paytabsCredentials(): { profileId: string; serverKey: string; baseUrl: string } {
  const profileId = process.env.PAYTABS_PROFILE_ID;
  const serverKey = process.env.PAYTABS_SERVER_KEY;
  if (!profileId || !serverKey) {
    throw new PaymentGatewayNotConfiguredError();
  }
  return {
    profileId,
    serverKey,
    baseUrl: process.env.PAYTABS_BASE_URL || "https://secure-egypt.paytabs.com",
  };
}

// PayTabs Hosted Payment Page API (v2, REST — no SDK): https://site.paytabs.com/en/paytabs-api/
const paytabsProvider: PaymentProvider = {
  async createPaymentSession(params) {
    const { profileId, serverKey, baseUrl } = paytabsCredentials();

    const res = await fetch(`${baseUrl}/payment/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: serverKey },
      body: JSON.stringify({
        profile_id: profileId,
        tran_type: "sale",
        tran_class: "ecom",
        cart_id: params.orderId,
        cart_currency: params.currency,
        cart_amount: params.amount,
        cart_description: `Pharmacy order ${params.orderId}`,
        customer_details: {
          name: params.customerName,
          email: params.customerEmail,
          phone: params.customerPhone,
          street1: params.addressLine,
          city: params.city,
          state: params.city,
          country: "EG",
          zip: "00000",
          ip: params.customerIp,
        },
        callback: params.callbackUrl,
        return: params.returnUrl,
      }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.redirect_url || !data?.tran_ref) {
      throw new Error(`PayTabs payment/request failed: ${data?.message ?? res.statusText}`);
    }

    return { tranRef: data.tran_ref, redirectUrl: data.redirect_url };
  },

  async queryTransaction(tranRef) {
    const { profileId, serverKey, baseUrl } = paytabsCredentials();

    const res = await fetch(`${baseUrl}/payment/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: serverKey },
      body: JSON.stringify({ profile_id: profileId, tran_ref: tranRef }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.payment_result) {
      throw new Error(`PayTabs payment/query failed: ${data?.message ?? res.statusText}`);
    }

    const status: string = data.payment_result.response_status;
    if (status === "A") return "PAID";
    if (status === "H" || status === "P") return "PENDING";
    return "FAILED";
  },
};

export const paymentProvider: PaymentProvider = paytabsProvider;
