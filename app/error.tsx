"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="fatal-state">
      <p className="eyebrow">Workbench stopped</p>
      <h1>The browser could not finish this audit.</h1>
      <p>
        Your snippets have not been uploaded. Reload the local workbench and run
        the check again.
      </p>
      <button type="button" onClick={reset}>
        Reload the workbench
      </button>
    </main>
  );
}
