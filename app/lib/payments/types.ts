export type InitializePaymentParams = {
  email: string;
  amount: number;
  reference: string;
  callbackUrl: string;
};

export type InitializePaymentResponse = {
  authorizationUrl: string;
  reference: string;
};

export type VerifyPaymentResult = {
  success: boolean;
  transactionId?: number;
  txRef?: string;
};

export type Bank = {
  code: string;
  name: string;
};

export type VerifyBankAccountResult = {
  accountName: string;
};

export type TransferRecipient = {
  bankCode: string;
  accountNumber: string;
  accountName?: string;
};

export type TransferResult = {
  success: boolean;
  reference: string;
};

export interface PaymentProvider {
  initializePayment(
    params: InitializePaymentParams,
  ): Promise<InitializePaymentResponse>;

  verifyPayment(reference: string): Promise<VerifyPaymentResult>;

  getBanks(country: string): Promise<Bank[]>;

  verifyBankAccount(
    bankCode: string,
    accountNumber: string,
  ): Promise<VerifyBankAccountResult>;

  transfer(
    recipient: TransferRecipient,
    amount: number,
    narration: string,
  ): Promise<TransferResult>;
}
