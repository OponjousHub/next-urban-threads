import crypto from "crypto";

export function generateRecoveryCodes(count = 10) {
  const codes: string[] = [];

  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(4).toString("hex").toUpperCase();
    codes.push(code);
  }

  return codes;
}

export function hashCode(code: string) {
  return crypto.createHash("sha256").update(code).digest("hex");
}
