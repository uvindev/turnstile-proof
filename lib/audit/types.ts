export type Severity = "critical" | "high" | "medium" | "notice";
export type Surface = "client" | "server" | "tests" | "hostnames";
export type ControlStatus = "pass" | "fail" | "review";
export type ReleaseState = "blocked" | "review" | "ready";

export interface Finding {
  rule: string;
  severity: Severity;
  surface: Surface;
  line?: number;
  title: string;
  message: string;
  repair: string;
}

export interface Control {
  id: string;
  label: string;
  status: ControlStatus;
  evidence: string;
}

export interface ControlArtifact {
  version: 1;
  releaseState: ReleaseState;
  controls: Array<{ id: string; status: ControlStatus }>;
  approvedHostnames: string[];
}

export interface AuditResult {
  releaseState: ReleaseState;
  findings: Finding[];
  controls: Control[];
  approvedHostnames: string[];
  artifact: ControlArtifact;
}
