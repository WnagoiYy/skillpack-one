# Automation and operations: Atomic Skills

Connect systems, schedule work, deploy services, and operate repeatable workflows.

## Atomic Skills

- `atom-create-ci-pipeline` — **Create a CI pipeline**: Create one repository-scoped continuous-integration pipeline with reproducible checks, least privilege, caching, artifacts, failure diagnostics, and verification.
  - Risk: `reversible-write`
  - Lifecycle: analyze, transform
- `atom-design-automation-workflow` — **Design an automation workflow**: Specify one safe and observable repeatable workflow
  - Risk: `reversible-write`
  - Lifecycle: plan
- `atom-design-observability` — **Design observability**: Design one system observability plan with service objectives, signals, telemetry, dashboards, alerts, ownership, cost, and diagnostic workflows.
  - Risk: `read-only`
  - Lifecycle: analyze, verify
- `atom-plan-cloud-deployment` — **Plan a cloud deployment**: Plan one cloud deployment with environments, infrastructure boundaries, identity, networking, data, rollout, observability, cost, and rollback without provisioning resources.
  - Risk: `reversible-write`
  - Lifecycle: analyze, transform
- `atom-triage-production-incident` — **Triage a production incident**: Triage one active production incident using bounded read-only evidence to establish impact, timeline, hypotheses, containment options, and the next authorized action.
  - Risk: `read-only`
  - Lifecycle: analyze, verify
- `atom-write-operational-runbook` — **Write an operational runbook**: Write one executable operational runbook with triggers, prerequisites, diagnostics, safe actions, stop conditions, escalation, rollback, and verification.
  - Risk: `read-only`
  - Lifecycle: analyze, verify

Read only the selected Atomic Skill. Use a capability pack when the request has independently useful outcomes.
