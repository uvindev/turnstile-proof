import type { AuditInput } from "@/lib/schemas/audit";

export const unsafeSample: AuditInput = {
  clientCode: `import Turnstile from "react-turnstile";

export function SignupChallenge() {
  return <Turnstile sitekey="1x00000000000000000000AA" onVerify={setToken} />;
}`,
  serverCode: `export async function createAccount(token: string) {
  await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: JSON.stringify({
      secret: process.env.TURNSTILE_SECRET_KEY,
      response: token,
    }),
  });
  return persistAccount();
}`,
  testCode: `it("submits the protected form", async () => {
  process.env.TURNSTILE_SITE_KEY = "1x00000000000000000000AA";
  await submitSignup();
});`,
  hostnames: `https://app.example.com
*.example.com
localhost:3000`,
};

export const safeSample: AuditInput = {
  clientCode: `<Turnstile
  sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
  onVerify={setToken}
  onError={showChallengeError}
  onExpire={resetChallenge}
  onTimeout={resetChallenge}
/>`,
  serverCode: `export async function verifyTurnstile(token: string) {
  if (!token) return { ok: false, status: 400 };
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: JSON.stringify({
      secret: process.env.TURNSTILE_SECRET_KEY,
      response: token,
      idempotency_key: crypto.randomUUID(),
    }),
  });
  const outcome = await response.json();
  if (!outcome.success) {
    if (outcome["error-codes"]?.includes("timeout-or-duplicate")) return { ok: false, status: 409 };
    return { ok: false, status: 403 };
  }
  return { ok: true, status: 200 };
}`,
  testCode: `const PASS_SITEKEY = "1x00000000000000000000AA";
const FAIL_SITEKEY = "2x00000000000000000000AB";
const SPENT_SECRET = "3x0000000000000000000000000000000AA";`,
  hostnames: `app.example.com
checkout.example.com`,
};
