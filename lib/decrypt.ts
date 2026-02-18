export function decrypt2FASecret(secret: string) {
  const bytes = CryptoJS.AES.decrypt(secret, process.env.TWO_FACTOR_SECRET!);

  return bytes.toString(CryptoJS.enc.Utf8).trim();
}
