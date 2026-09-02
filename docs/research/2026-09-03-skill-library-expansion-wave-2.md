# Skill library expansion: wave 2

Date: 2026-09-03

## Scope and evidence policy

This expansion searched current official and high-signal community Agent Skill repositories, fixed every accepted source to a Git revision, and mirrored only tracked `SKILL.md` metadata and content fingerprints. Upstream instructions remained untrusted data: the collector did not execute packages, scripts, hooks, endpoints, or Skill instructions. License detection is recorded as evidence and does not authorize copying.

The expanded inventory contains 3,998 records, 3,973 unique content fingerprints, and 25 exact duplicates across 40 non-empty repositories. Large aggregators were useful for discovery but were not automatically admitted when they would mainly multiply duplicates or weaken provenance.

## Representative sources added

- Official or vendor-maintained collections: [Microsoft Skills](https://github.com/microsoft/skills), [Google Skills](https://github.com/google/skills), [Microsoft Docs Agent Skills](https://github.com/MicrosoftDocs/Agent-Skills), [AWS Builder Skills](https://github.com/aws-samples/sample-agent-skills-for-builders), [Anthropic Claude Code Skills](https://github.com/anthropics/claude-code/tree/main/plugins), [Google Workspace CLI Skills](https://github.com/googleworkspace/cli), [Microsoft CAT Agent Skills](https://github.com/microsoft/cat-agent-skills), [GSAP Skills](https://github.com/greensock/GSAP-Skills), and [NVIDIA SkillSpector](https://github.com/NVIDIA/SkillSpector).
- Focused community collections: [Obra Superpowers](https://github.com/obra/superpowers), [Matt Pocock Skills](https://github.com/mattpocock/skills), [PM Skills](https://github.com/phuryn/pm-skills), [Orchestra AI Research Skills](https://github.com/Orchestra-Research/AI-Research-SKILLs), [Jeff Allan Claude Skills](https://github.com/Jeffallan/claude-skills), [Context Engineering Skills](https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering), [Claude SEO](https://github.com/AgriciDaniel/claude-seo), [wshobson Agent Skills](https://github.com/wshobson/agents), [alirezarezvani Claude Skills](https://github.com/alirezarezvani/claude-skills), and [community cybersecurity Skills](https://github.com/mukul975/Anthropic-Cybersecurity-Skills).

## Synthesis result

Inventory frequency was not treated as a vote to copy a Skill. Recurring responsibilities were clustered against the existing taxonomy and admitted only when they formed a distinct outcome, artifact, permission envelope, and failure boundary. This produced 41 additional Atomic Skills across:

- document communication and structured data;
- product definition, marketing, pricing, and business modeling;
- threat modeling, dependency and secret review, privacy, and compliance;
- observability, CI, deployment planning, runbooks, and incident triage;
- diagrams, image work, video planning, calendar and note workflows;
- learning-path design and scientific manuscript review.

The expansion retains the existing open 22-Category taxonomy rather than creating one category per repository. The installable layer is now 100 Skills: 22 Category, 76 Atomic, and 2 Meta. The source inventory remains non-executable evidence.

## Evaluation and admission

The generator creates bilingual positive routing cases for every blueprint Atom, plus boundary-focused adversarial cases and task rubrics. The expansion also fixed elliptical negation handling such as “do not translate it” and increased default candidate retention so multi-Skill pack recommendations remain stable as the library grows.

All 186 routing examples currently pass Category Hit@1, Atom Hit@1, Full Coverage@3, non-invocation, and safety gates. Ten development task specifications also route correctly. These are repository conformance results, not proof of model-backed task lift; real no-Skill/with-Skill certification remains a separate experiment.
