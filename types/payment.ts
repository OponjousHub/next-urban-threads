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

export interface PaymentProvider {
  initializePayment(input: {
    email: string;
    amount: number;
    reference: string;
    callbackUrl: string;
  }): Promise<{
    authorizationUrl: string;
    reference: string;
  }>;

  verifyPayment(reference: string): Promise<VerifyPaymentResult>;
}

export type VerifyPaymentResult = {
  success: boolean;
  transactionId?: number | string;
  txRef?: string;
};
