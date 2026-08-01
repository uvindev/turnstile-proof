import { describe, expect, it } from "vitest";
import { analyzeTurnstile } from "@/lib/audit/analyze";
import { safeSample, unsafeSample } from "@/lib/audit/sample";

describe("analyzeTurnstile", () => {
  it("blocks the unsafe sample with actionable release findings", () => {
    const result = analyzeTurnstile(unsafeSample);
    expect(result.releaseState).toBe("blocked");
    expect(result.findings.map((finding) => finding.rule)).toEqual([
      "TUR003",
      "TUR005",
      "TUR006",
      "TUR007",
      "TUR013",
      "TUR009",
      "TUR009",
      "TUR009",
      "TUR008",
      "TUR011",
      "TUR012",
    ]);
  });

  it("marks the complete sample ready", () => {
    const result = analyzeTurnstile(safeSample);
    expect(result.releaseState).toBe("ready");
    expect(result.findings).toEqual([]);
    expect(result.controls.every((control) => control.status === "pass")).toBe(
      true,
    );
  });

  it("requires server-side Siteverify", () => {
    const result = analyzeTurnstile({
      ...safeSample,
      serverCode: "return true;",
    });
    expect(result.findings.some((finding) => finding.rule === "TUR002")).toBe(
      true,
    );
  });

  it("requires the protected action to use the success result", () => {
    const serverCode = `await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify");`;
    const result = analyzeTurnstile({ ...safeSample, serverCode });
    expect(result.findings.some((finding) => finding.rule === "TUR003")).toBe(
      true,
    );
  });

  it("finds a secret-key signal in client code", () => {
    const result = analyzeTurnstile({
      ...safeSample,
      clientCode: `${safeSample.clientCode}\nconst key = process.env.TURNSTILE_SECRET_KEY;`,
    });
    expect(result.findings.some((finding) => finding.rule === "TUR004")).toBe(
      true,
    );
  });

  it("finds official test credentials in production code", () => {
    const result = analyzeTurnstile({
      ...safeSample,
      clientCode: `<div class="cf-turnstile" data-sitekey="2x00000000000000000000AB"></div>`,
    });
    expect(result.findings.some((finding) => finding.rule === "TUR005")).toBe(
      true,
    );
  });

  it("does not flag official test credentials inside test code", () => {
    const result = analyzeTurnstile(safeSample);
    expect(result.findings.some((finding) => finding.rule === "TUR005")).toBe(
      false,
    );
  });

  it("asks for error, expiry, and timeout handlers", () => {
    const result = analyzeTurnstile({
      ...safeSample,
      clientCode: `<Turnstile sitekey={sitekey} onVerify={setToken} />`,
    });
    expect(result.findings.some((finding) => finding.rule === "TUR007")).toBe(
      true,
    );
  });

  it("asks for a deterministic failure test", () => {
    const result = analyzeTurnstile({
      ...safeSample,
      testCode: "it('passes')",
    });
    expect(result.findings.some((finding) => finding.rule === "TUR008")).toBe(
      true,
    );
  });

  it("rejects schemes, ports, paths, and wildcards in hostnames", () => {
    const result = analyzeTurnstile({
      ...safeSample,
      hostnames:
        "https://example.com\nexample.com:443\nexample.com/path\n*.example.com",
    });
    expect(
      result.findings.filter((finding) => finding.rule === "TUR009"),
    ).toHaveLength(4);
  });

  it("normalizes, sorts, and deduplicates approved hostnames", () => {
    const result = analyzeTurnstile({
      ...safeSample,
      hostnames: "Shop.Example.com\napp.example.com\nshop.example.com",
    });
    expect(result.approvedHostnames).toEqual([
      "app.example.com",
      "shop.example.com",
    ]);
  });

  it("generates an artifact without any submitted code", () => {
    const marker = "private-project-marker";
    const result = analyzeTurnstile({
      ...safeSample,
      clientCode: `${safeSample.clientCode}\n// ${marker}`,
    });
    expect(JSON.stringify(result.artifact)).not.toContain(marker);
  });

  it("reports source lines for detected production credentials", () => {
    const result = analyzeTurnstile(unsafeSample);
    expect(
      result.findings.find((finding) => finding.rule === "TUR005")?.line,
    ).toBe(4);
  });

  it("rejects inputs over the schema limit", () => {
    expect(() =>
      analyzeTurnstile({ ...safeSample, clientCode: "x".repeat(200_001) }),
    ).toThrow();
  });
});
