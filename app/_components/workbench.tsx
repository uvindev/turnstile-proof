"use client";

import { useEffect, useState } from "react";
import { analyzeTurnstile } from "@/lib/audit/analyze";
import { safeSample, unsafeSample } from "@/lib/audit/sample";
import type { AuditResult, Severity } from "@/lib/audit/types";
import { trackEvent } from "@/lib/analytics";
import type { AuditInput } from "@/lib/schemas/audit";

const emptyInput: AuditInput = {
  clientCode: "",
  serverCode: "",
  testCode: "",
  hostnames: "",
};
const severityLabel: Record<Severity, string> = {
  critical: "block",
  high: "high",
  medium: "review",
  notice: "note",
};

export function Workbench() {
  const [input, setInput] = useState<AuditInput>(unsafeSample);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copyState, setCopyState] = useState("Copy control report");

  useEffect(() => {
    trackEvent("workbench_viewed");
  }, []);

  function update(field: keyof AuditInput, value: string) {
    setInput((current) => ({ ...current, [field]: value }));
    setError(null);
  }

  function runAudit() {
    if (!input.clientCode.trim() && !input.serverCode.trim()) {
      setResult(null);
      setError(
        "Paste the protected form's client or server code before running the release check.",
      );
      return;
    }
    try {
      setResult(analyzeTurnstile(input));
      setError(null);
      setCopyState("Copy control report");
      trackEvent("integration_audited");
    } catch {
      setResult(null);
      setError(
        "One input exceeds the 200,000-character browser limit. Split the integration by protected form.",
      );
    }
  }

  async function copyArtifact() {
    if (!result) return;
    await navigator.clipboard.writeText(
      JSON.stringify(result.artifact, null, 2),
    );
    setCopyState("Copied");
    trackEvent("control_report_copied");
  }

  return (
    <section className="workbench" id="audit" aria-labelledby="audit-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Release input</p>
          <h2 id="audit-title">Turnstile integration audit</h2>
        </div>
        <p className="privacy-stamp">BROWSER MEMORY / NO SOURCE UPLOAD</p>
      </div>

      <div className="input-grid">
        <label className="code-field wide">
          <span>
            <strong>Production client</strong>
            <small>{input.clientCode.length.toLocaleString()} / 200,000</small>
          </span>
          <textarea
            value={input.clientCode}
            onChange={(event) => update("clientCode", event.target.value)}
            maxLength={200_000}
            rows={10}
            spellCheck={false}
          />
        </label>
        <label className="code-field wide">
          <span>
            <strong>Production server</strong>
            <small>{input.serverCode.length.toLocaleString()} / 200,000</small>
          </span>
          <textarea
            value={input.serverCode}
            onChange={(event) => update("serverCode", event.target.value)}
            maxLength={200_000}
            rows={10}
            spellCheck={false}
          />
        </label>
        <label className="code-field">
          <span>
            <strong>Automated tests</strong>
            <small>official dummy credentials only</small>
          </span>
          <textarea
            value={input.testCode}
            onChange={(event) => update("testCode", event.target.value)}
            maxLength={200_000}
            rows={7}
            spellCheck={false}
          />
        </label>
        <label className="code-field">
          <span>
            <strong>Production hostnames</strong>
            <small>one dashboard entry per line</small>
          </span>
          <textarea
            value={input.hostnames}
            onChange={(event) => update("hostnames", event.target.value)}
            maxLength={20_000}
            rows={7}
            spellCheck={false}
          />
        </label>
      </div>

      <div className="actions">
        <button className="primary-action" type="button" onClick={runAudit}>
          Run release check
        </button>
        <button
          type="button"
          onClick={() => {
            setInput(unsafeSample);
            setResult(null);
            setError(null);
          }}
        >
          Restore risky sample
        </button>
        <button
          type="button"
          onClick={() => {
            setInput(safeSample);
            setResult(null);
            setError(null);
          }}
        >
          Load complete sample
        </button>
        <button
          type="button"
          onClick={() => {
            setInput(emptyInput);
            setResult(null);
            setError(null);
          }}
        >
          Clear
        </button>
      </div>

      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}

      {result ? (
        <div className="report" aria-live="polite">
          <div className={`release-state ${result.releaseState}`}>
            <div>
              <p className="eyebrow">Release decision</p>
              <h3>
                {result.releaseState === "blocked"
                  ? "Do not release this integration"
                  : result.releaseState === "review"
                    ? "Resolve the review queue"
                    : "Static controls are ready"}
              </h3>
            </div>
            <div className="totals">
              <span>
                <strong>
                  {
                    result.findings.filter((item) =>
                      ["critical", "high"].includes(item.severity),
                    ).length
                  }
                </strong>{" "}
                blockers
              </span>
              <span>
                <strong>
                  {
                    result.findings.filter((item) => item.severity === "medium")
                      .length
                  }
                </strong>{" "}
                reviews
              </span>
              <span>
                <strong>{result.approvedHostnames.length}</strong> hosts
              </span>
            </div>
          </div>

          <div className="control-board" aria-label="Control coverage">
            {result.controls.map((control) => (
              <article key={control.id} className={`control ${control.status}`}>
                <span>{control.status}</span>
                <strong>{control.label}</strong>
                <p>{control.evidence}</p>
              </article>
            ))}
          </div>

          {result.findings.length ? (
            <ol className="findings" aria-label="Release findings">
              {result.findings.map((item, index) => (
                <li key={`${item.rule}-${item.surface}-${item.line ?? index}`}>
                  <div className="finding-meta">
                    <span className={`severity ${item.severity}`}>
                      {severityLabel[item.severity]}
                    </span>
                    <code>{item.rule}</code>
                    <span>
                      {item.surface}
                      {item.line ? ` · line ${item.line}` : ""}
                    </span>
                  </div>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.message}</p>
                    <p className="repair">
                      <strong>Repair:</strong> {item.repair}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <div className="clean-state">
              <h3>No static release findings.</h3>
              <p>
                Run the protected action with Cloudflare’s pass, fail, and
                spent-token credentials before production.
              </p>
            </div>
          )}

          <div className="artifact">
            <div>
              <p className="eyebrow">Generated artifact</p>
              <h3>turnstile-proof.json</h3>
            </div>
            <button type="button" onClick={copyArtifact}>
              {copyState}
            </button>
            <pre>
              <code>{JSON.stringify(result.artifact, null, 2)}</code>
            </pre>
            <p>
              The artifact contains control outcomes and public hostnames.
              Submitted code is excluded.
            </p>
          </div>
        </div>
      ) : (
        <div className="empty-report">
          <span>01</span>
          <p>
            Run the sample to map the client, server, test, and hostname control
            chain.
          </p>
        </div>
      )}
    </section>
  );
}
