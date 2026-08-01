# TurnstileProof 0.1 specification

## User journey

1. A web engineer opens a browser-local workbench with a risky sample already loaded.
2. They paste representative production client and server code, automated test setup, and production hostnames.
3. The workbench identifies missing enforcement, credential-boundary errors, lifecycle gaps, test gaps, and invalid hostnames.
4. The engineer repairs the integration and reruns the check.
5. They copy `turnstile-proof.json`, which contains control outcomes and public hostnames but no submitted code.

## Observable requirements

- Zod rejects any code field over 200,000 characters and the hostname field over 20,000.
- The audit detects a widget marker, the exact Siteverify endpoint, a success decision, a missing-token guard, client secret signals, production use of official test credentials, error/expiry/timeout handlers, failure test credentials, timeout-or-duplicate handling, optional idempotency, and hostname syntax.
- Critical and high findings block release. Medium findings require review. Notices do not change a ready state.
- Findings include a stable rule identifier, severity, surface, source line when available, cause, and repair.
- The generated artifact excludes all submitted source and test text.
- The risky sample, complete sample, empty-input recovery, copy action, Team pilot link, feedback link, and health endpoint work without a database.

## Non-functional constraints

- Analysis runs synchronously in the browser and makes no network request.
- Analytics events contain event names only: `workbench_viewed`, `integration_audited`, `control_report_copied`, `team_interest`, and `feedback_intent`.
- Controls meet a 44px minimum target and retain visible keyboard focus.
- The layout does not overflow at 320 CSS pixels.
- Response headers disable framing, MIME sniffing, cameras, microphones, and geolocation.
- The IAMUVIN gate must exit 0 with `SIGNED` as its final line.

## Monetization

The free workbench checks one supplied integration. Team is `[TARGET] $18 per team/month` for repository extraction, multi-form inventory, reviewed exceptions, history, and pull-request annotations. The checkout environment variable may point to a future payment page. Without it, the CTA opens a pilot email. Revenue remains unverified.

## Threat considerations

- Code can contain secrets. The product warns that processing is local and excludes code from its artifact and analytics.
- Static regex analysis can miss wrappers and cross-file control flow. The product states this limit beside the audit.
- A clean report cannot validate a real secret, dashboard configuration, Cloudflare availability, or bot rejection.
- Official test credentials are public by design, but must not ship in production client or server samples.

## Non-goals

- Calling Siteverify with user credentials.
- Storing, uploading, or executing submitted code.
- Testing live production forms or bypassing anti-bot controls.
- Proving security, compliance, or bot-blocking effectiveness.
- Deployment, checkout creation, or customer outreach in this iteration.
