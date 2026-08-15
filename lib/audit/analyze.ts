/**
 * @project  TurnstileProof — iamuvin.com
 * @author   Uvin Vindula (IAMUVIN)
 * @website  https://iamuvin.com
 * @company  ASI Research Labs — asiresearch.io
 * @built    2026
 * @license  MIT
 */
import { auditInputSchema, type AuditInput } from "@/lib/schemas/audit";
import type {
  AuditResult,
  Control,
  Finding,
  ReleaseState,
  Severity,
} from "@/lib/audit/types";

const SITEVERIFY = "challenges.cloudflare.com/turnstile/v0/siteverify";
const TEST_SITEKEYS = [
  "1x00000000000000000000AA",
  "2x00000000000000000000AB",
  "1x00000000000000000000BB",
  "2x00000000000000000000BB",
  "3x00000000000000000000FF",
];
const TEST_SECRETS = [
  "1x0000000000000000000000000000000AA",
  "2x0000000000000000000000000000000AA",
  "3x0000000000000000000000000000000AA",
];
const severityRank: Record<Severity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  notice: 3,
};

function lineOf(source: string, pattern: RegExp | string): number | undefined {
  const index =
    typeof pattern === "string"
      ? source.indexOf(pattern)
      : source.search(pattern);
  if (index < 0) return undefined;
  return source.slice(0, index).split("\n").length;
}

function finding(input: Finding): Finding {
  return input;
}

function parseHostnames(source: string): {
  approved: string[];
  findings: Finding[];
} {
  const approved: string[] = [];
  const findings: Finding[] = [];
  const lines = source.split(/\r?\n/);

  lines.forEach((raw, index) => {
    const hostname = raw.trim();
    if (!hostname || hostname.startsWith("#")) return;
    const invalid =
      hostname.includes("://") ||
      hostname.includes("*") ||
      hostname.includes("/") ||
      hostname.includes(":") ||
      !/^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i.test(
        hostname,
      );
    if (invalid) {
      findings.push(
        finding({
          rule: "TUR009",
          severity: "medium",
          surface: "hostnames",
          line: index + 1,
          title: "Production hostname is not dashboard-ready",
          message:
            "Cloudflare hostname entries must omit schemes, ports, paths, and wildcards.",
          repair: "Enter one fully qualified hostname per line.",
        }),
      );
      return;
    }
    if (/^(localhost|127\.0\.0\.1)(?:$|\.)/i.test(hostname)) {
      findings.push(
        finding({
          rule: "TUR010",
          severity: "high",
          surface: "hostnames",
          line: index + 1,
          title: "Localhost is listed for production",
          message:
            "Cloudflare recommends keeping local domains off production widgets.",
          repair:
            "Use test credentials locally and restrict the production widget.",
        }),
      );
      return;
    }
    approved.push(hostname.toLowerCase());
  });

  return { approved: [...new Set(approved)].sort(), findings };
}

export function analyzeTurnstile(input: AuditInput): AuditResult {
  const parsed = auditInputSchema.parse(input);
  const { clientCode, serverCode, testCode, hostnames } = parsed;
  const findings: Finding[] = [];
  const hasWidget =
    /(?:Turnstile|cf-turnstile|turnstile\.render|data-sitekey)/i.test(
      clientCode,
    );
  const hasSiteverify = serverCode.includes(SITEVERIFY);
  const hasSuccessGate =
    /(?:if\s*\(\s*!?\s*\w+(?:\?\.)?\.success|\[\s*["']success["']\s*\]|\{\s*success\s*\})/i.test(
      serverCode,
    );
  const hasTokenGuard =
    /if\s*\(\s*!\s*(?:token|response|turnstileToken|turnstileResponse)\b/i.test(
      serverCode,
    );
  const clientSecretSignal = /TURNSTILE_SECRET|secret[_-]?key/i.test(
    clientCode,
  );
  const clientTestSecret = TEST_SECRETS.find((key) => clientCode.includes(key));
  const productionTestKey = [...TEST_SITEKEYS, ...TEST_SECRETS].find(
    (key) => clientCode.includes(key) || serverCode.includes(key),
  );
  const hasLifecycleHandlers =
    /(?:onError|error-callback|errorCallback)/i.test(clientCode) &&
    /(?:onExpire|expired-callback|expiredCallback)/i.test(clientCode) &&
    /(?:onTimeout|timeout-callback|timeoutCallback)/i.test(clientCode);
  const hasFailureTest =
    testCode.includes("2x00000000000000000000AB") ||
    testCode.includes("2x00000000000000000000BB") ||
    testCode.includes("2x0000000000000000000000000000000AA") ||
    testCode.includes("3x0000000000000000000000000000000AA");
  const hasTimeoutHandling = /timeout-or-duplicate/i.test(serverCode);
  const hasIdempotency = /idempotency_key/i.test(serverCode);

  if (!hasWidget)
    findings.push(
      finding({
        rule: "TUR001",
        severity: "high",
        surface: "client",
        title: "No Turnstile widget was detected",
        message:
          "The production client sample has no supported widget or render call.",
        repair:
          "Include the protected form's widget integration in the client input.",
      }),
    );
  if (!hasSiteverify)
    findings.push(
      finding({
        rule: "TUR002",
        severity: "critical",
        surface: "server",
        title: "Server-side Siteverify is missing",
        message: "A client widget alone does not protect the submitted action.",
        repair:
          "POST the token and server-held secret to Cloudflare Siteverify.",
      }),
    );
  if (hasSiteverify && !hasSuccessGate)
    findings.push(
      finding({
        rule: "TUR003",
        severity: "critical",
        surface: "server",
        line: lineOf(serverCode, SITEVERIFY),
        title: "Protected action is not gated on success",
        message:
          "Siteverify is called, but its success result is not used to deny failure.",
        repair:
          "Parse the response and stop the action unless success is true.",
      }),
    );
  if (clientSecretSignal || clientTestSecret)
    findings.push(
      finding({
        rule: "TUR004",
        severity: "critical",
        surface: "client",
        line: lineOf(clientCode, /TURNSTILE_SECRET|secret[_-]?key/i),
        title: "Secret-key material appears in client code",
        message: "Turnstile secret keys belong only in the server environment.",
        repair:
          "Remove the secret signal from the client bundle and rotate a real exposed key.",
      }),
    );
  if (productionTestKey)
    findings.push(
      finding({
        rule: "TUR005",
        severity: "high",
        surface: clientCode.includes(productionTestKey) ? "client" : "server",
        line: lineOf(
          clientCode.includes(productionTestKey) ? clientCode : serverCode,
          productionTestKey,
        ),
        title: "Cloudflare test credential is in production code",
        message:
          "Published dummy credentials provide deterministic test outcomes.",
        repair:
          "Load production credentials from environment-specific configuration.",
      }),
    );
  if (hasSiteverify && !hasTokenGuard)
    findings.push(
      finding({
        rule: "TUR006",
        severity: "high",
        surface: "server",
        line: lineOf(serverCode, SITEVERIFY),
        title: "Missing-token requests are not rejected early",
        message:
          "The server sample reaches validation without an explicit token-presence guard.",
        repair:
          "Return a client error before Siteverify when the token is absent.",
      }),
    );
  if (hasWidget && !hasLifecycleHandlers)
    findings.push(
      finding({
        rule: "TUR007",
        severity: "medium",
        surface: "client",
        line: lineOf(clientCode, /Turnstile|cf-turnstile|turnstile\.render/i),
        title: "Challenge lifecycle recovery is incomplete",
        message:
          "Error, expiry, and timeout paths are not all visible in the client sample.",
        repair:
          "Handle error, expired, and timeout callbacks with a clear retry path.",
      }),
    );
  if (!hasFailureTest)
    findings.push(
      finding({
        rule: "TUR008",
        severity: "medium",
        surface: "tests",
        title: "Automated failure coverage is missing",
        message:
          "The test sample does not use a Cloudflare fail or spent-token credential.",
        repair:
          "Add deterministic failure and duplicate-token cases with official test keys.",
      }),
    );
  if (hasSiteverify && !hasTimeoutHandling)
    findings.push(
      finding({
        rule: "TUR011",
        severity: "notice",
        surface: "server",
        title: "Expired and replayed tokens share no recovery path",
        message:
          "The sample does not identify Cloudflare's timeout-or-duplicate result.",
        repair: "Return a retryable response and reset the client challenge.",
      }),
    );
  if (hasSiteverify && !hasIdempotency)
    findings.push(
      finding({
        rule: "TUR012",
        severity: "notice",
        surface: "server",
        title: "Siteverify retry idempotency is not present",
        message:
          "Cloudflare accepts an optional idempotency key for safe retries.",
        repair: "Send a request UUID when the validation call can be retried.",
      }),
    );

  const hostnameResult = parseHostnames(hostnames);
  findings.push(...hostnameResult.findings);
  if (hostnameResult.approved.length === 0)
    findings.push(
      finding({
        rule: "TUR013",
        severity: "medium",
        surface: "hostnames",
        title: "No approved production hostname remains",
        message:
          "The supplied list contains no valid fully qualified hostname.",
        repair: "Add the exact production hostnames configured for the widget.",
      }),
    );

  findings.sort(
    (a, b) =>
      severityRank[a.severity] - severityRank[b.severity] ||
      a.surface.localeCompare(b.surface) ||
      (a.line ?? 0) - (b.line ?? 0) ||
      a.rule.localeCompare(b.rule),
  );
  const releaseState: ReleaseState = findings.some((item) =>
    ["critical", "high"].includes(item.severity),
  )
    ? "blocked"
    : findings.some((item) => item.severity === "medium")
      ? "review"
      : "ready";
  const controls: Control[] = [
    {
      id: "widget",
      label: "Client widget",
      status: hasWidget ? "pass" : "fail",
      evidence: hasWidget ? "Widget marker found" : "No widget marker",
    },
    {
      id: "siteverify",
      label: "Server verification",
      status: hasSiteverify ? "pass" : "fail",
      evidence: hasSiteverify ? "Siteverify endpoint found" : "Endpoint absent",
    },
    {
      id: "success-gate",
      label: "Failure denial",
      status: hasSuccessGate ? "pass" : "fail",
      evidence: hasSuccessGate
        ? "Success result gates flow"
        : "No success gate",
    },
    {
      id: "client-secret",
      label: "Client secret boundary",
      status: clientSecretSignal || clientTestSecret ? "fail" : "pass",
      evidence:
        clientSecretSignal || clientTestSecret
          ? "Secret signal found"
          : "No secret signal",
    },
    {
      id: "lifecycle",
      label: "Lifecycle recovery",
      status: hasLifecycleHandlers ? "pass" : "review",
      evidence: hasLifecycleHandlers
        ? "Error, expiry, timeout handled"
        : "Handler coverage incomplete",
    },
    {
      id: "failure-test",
      label: "Failure test",
      status: hasFailureTest ? "pass" : "review",
      evidence: hasFailureTest
        ? "Official failure credential found"
        : "No failure credential",
    },
    {
      id: "hostnames",
      label: "Production hostnames",
      status:
        hostnameResult.findings.length === 0 &&
        hostnameResult.approved.length > 0
          ? "pass"
          : "review",
      evidence: `${hostnameResult.approved.length} valid hostname${hostnameResult.approved.length === 1 ? "" : "s"}`,
    },
  ];
  const artifact = {
    version: 1 as const,
    releaseState,
    controls: controls.map(({ id, status }) => ({ id, status })),
    approvedHostnames: hostnameResult.approved,
  };
  return {
    releaseState,
    findings,
    controls,
    approvedHostnames: hostnameResult.approved,
    artifact,
  };
}
