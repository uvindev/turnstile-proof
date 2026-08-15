# TurnstileProof

TurnstileProof reviews a Cloudflare Turnstile integration before release. Paste representative production client code, server verification code, automated test setup, and dashboard hostnames. The browser reports missing enforcement, credential-boundary mistakes, lifecycle gaps, test gaps, and invalid hostname entries.

Submitted code stays in browser memory. The generated report contains control outcomes and public hostnames only.

## Buyer and paid boundary

The free workbench checks one integration. The buyer is a web team or implementation agency protecting signup, login, checkout, or contact forms. Price, demand, customers, and revenue are unverified.

## Local setup

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open `http://localhost:3000`. Analytics is disabled unless `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` is configured. Event payloads contain names only.

## Verification

```bash
pnpm verify
pnpm audit --audit-level high
bash ./scripts/verify-signature.sh
```

`pnpm verify` runs formatting, ESLint, TypeScript, Vitest, the production build, and the signature gate.

## Limits

- Static matching can miss helper functions, generated clients, and cross-file control flow.
- A clean report cannot prove that the real secret works, dashboard hostnames match, Cloudflare is available, or bots are denied.
- Official test credentials and Turnstile behavior can change; compare releases with Cloudflare documentation.
- The Team CTA opens an email until a checkout URL is configured.
- This repository is not deployed by this iteration.

## Sources

- [Cloudflare server-side validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)
- [Cloudflare testing credentials](https://developers.cloudflare.com/turnstile/troubleshooting/testing/)
- [Cloudflare hostname management](https://developers.cloudflare.com/turnstile/additional-configuration/hostname-management/)

---

Built by Uvin Vindula — [iamuvin.com](https://iamuvin.com)
