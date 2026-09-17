# ResultsCX Supervisor Intelligence

A responsive supervisor analytics prototype for healthcare contact center QA. It uses realistic, anonymized mock evaluations and simulated AI hypotheses. There is no backend or Amazon Bedrock connection in this version.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. Use `npm run build` and `npm run lint` for checks.

## What to explore

- **Overview:** team QA metrics, weekly score trend, issue frequencies, and agents to review.
- **Issue explorer:** select a pattern, compare affected agents, inspect source evaluations, and read a mock root-cause hypothesis.
- **Agents:** compare performance, then inspect one agent’s flagged and strong evaluations.
- **Evidence library:** search and filter evaluations, open the source comment, and identify the human validation point.

The team, time range, and search controls apply across the workspace. The mock dataset includes repeated issues, isolated flags, high performers, a low sample case, and mixed signals.

## Structure and Bedrock handoff

```text
src/
  App.jsx                         Supervisor views and interactions
  App.css, index.css              Responsive design system
  components/BrandLogo.jsx       Hosted brand asset with text fallback
  data/mockData.js                Anonymized QA records
  services/analyticsService.js   Filter and aggregate interface
  services/mockAnalysisService.js Simulated AI analysis interface
```

The UI calls `mockAnalysisService.analyzeIssue(issueId, evaluations)` and `mockAnalysisService.analyzeAgent(agentId, evaluations)`. A future API-backed service can implement these methods and return the same result shapes. Keep Bedrock calls and credentials on the server; the frontend should call that API. `analyticsService` can likewise be replaced with API queries when real QA records are available.

All AI text is explicitly presented as a hypothesis for supervisor validation. It does not make personnel decisions.
