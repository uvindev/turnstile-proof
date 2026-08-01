# Opportunity brief

## Selected: TurnstileProof

Web teams and implementation agencies add Cloudflare Turnstile to signup, login, checkout, and contact forms. Their recurring release job spans four surfaces: the browser widget, server-side Siteverify, deterministic failure tests, and dashboard hostnames.

Cloudflare states that server-side validation is mandatory. Tokens expire after five minutes and can be redeemed once. Cloudflare also publishes pass, fail, and spent-token credentials for automated tests, recommends separate credentials by environment, and restricts production hostnames to dashboard-ready names.

The current workaround is documentation review plus runtime inspection in Turnstile Analytics. Analytics can show validation outcomes after traffic arrives, but it does not inspect a pull request before release. TurnstileProof checks representative snippets locally and emits a source-free control report.

Paid value: repository extraction, multi-form inventory, reviewed exceptions, policy history, and pull-request annotations. Proposed Team price: `[TARGET] $18 per team/month`. Demand and willingness to pay are `[UNVERIFIED]`.

## Alternatives considered

### CSP release diff

Application-security teams need to review policy changes, but Google CSP Evaluator, HeaderPilot, CSP Analyser, CSPctl, Report URI, and CSPScan already cover evaluation, diffing, monitoring, or combinations of them. Report URI starts at $54.99/month and CSPScan lists a $29/month Pro plan. A narrow diff product would enter a crowded surface.

### Stripe API-version migration check

Stripe documents breaking major releases and provides version testing in Workbench. The workflow is valuable, but a trustworthy checker would need a maintained changelog model across SDKs, webhook endpoints, Connect, and product-specific event shapes. Stripe owns the strongest distribution and the authoritative upgrade path.

## Sources

- https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
- https://developers.cloudflare.com/turnstile/troubleshooting/testing/
- https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/widget-configurations/
- https://developers.cloudflare.com/turnstile/additional-configuration/hostname-management/
- https://developers.cloudflare.com/turnstile/turnstile-analytics/token-validation/
- https://developers.cloudflare.com/turnstile/plans/
- https://www.w3.org/TR/CSP/
- https://report-uri.com/
- https://cspscan.com/pricing
- https://docs.stripe.com/api/versioning
