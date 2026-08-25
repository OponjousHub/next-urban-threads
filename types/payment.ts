// import { VerifyPaymentResult as PrismaVerifyPaymentResult } from "@prisma/client";
export interface InitializePaymentPayload {
  email: string;
  amount: number;
  currency: string;
  orderId: string;
}

export interface PaymentInitResponse {
  authorizationUrl: string;
  reference: string;
}

export interface VerifyPaymentResult {
  success: boolean;
  status: "successful" | "failed" | "pending";
  transactionId?: number;
  txRef?: string;
}

export interface PaymentProvider {
  initializePayment(input: {
    email: string;
    amount: number;
    currency: string;
    reference: string;
    callbackUrl: string;
  }): Promise<{
    authorizationUrl: string;
    reference: string;
  }>;

  verifyPayment(reference: string): Promise<VerifyPaymentResult>;
}
