import { agents, issues } from '../data/mockData.js'

const hypotheses = {
  documentation: 'Case notes may be completed after the verbal resolution, when follow-up details are easiest to miss. Review the documentation workflow and recent case closures before choosing a coaching action.',
  probing: 'Agents may be moving to a familiar answer before confirming the member’s full intent. Review whether the call guide prompts an open question early enough.',
  sop: 'The pattern may reflect workflow friction or uncertainty about the order of required steps. Validate the current SOP and listen to a sample of calls.',
  listening: 'Time pressure or script adherence may be competing with recognition of member cues. A call review can distinguish a skill gap from an isolated miss.',
  accuracy: 'Plan-specific benefit details may be difficult to verify quickly. Check the reference material used during these calls.',
  control: 'Hold practices and closing summaries may be inconsistent. Review call context before attributing this to an individual agent.',
}

function evidenceLabel(count, sample) {
  if (sample < 3) return 'Limited'
  if (count >= 4) return 'Strong'
  if (count >= 2) return 'Moderate'
  return 'Limited'
}

export const mockAnalysisService = {
  async analyzeIssue(issueId, rows) {
    const issue = issues.find(item => item.id === issueId)
    const relevant = rows.filter(row => row.issueId === issueId)
    const affected = [...new Set(relevant.map(row => row.agentId))]
    const repeated = affected.filter(id => relevant.filter(row => row.agentId === id).length >= 2)
    return {
      title: issue.title,
      hypothesis: hypotheses[issueId],
      evidenceStrength: evidenceLabel(relevant.length, rows.length),
      pattern: repeated.length ? `Repeated for ${repeated.length} ${repeated.length === 1 ? 'agent' : 'agents'}` : relevant.length ? 'Isolated in the current sample' : 'No evidence in current filters',
      caveat: relevant.length < 3 ? 'Small sample. Gather more evaluations before drawing a conclusion.' : 'Evaluator comments indicate a pattern, but call context and workflow conditions still need supervisor review.',
      nextStep: relevant.length ? `Validate ${Math.min(3, relevant.length)} source evaluations and review the applicable workflow with the team.` : 'Expand the date range or team filter to review more evaluations.',
      affectedAgents: affected.map(id => agents.find(agent => agent.id === id)),
      evidenceIds: relevant.slice(0, 4).map(row => row.id),
    }
  },
  async analyzeAgent(agentId, rows) {
    const own = rows.filter(row => row.agentId === agentId)
    const flagged = own.filter(row => row.issueId)
    const counts = issues.map(issue => ({ issue, count: flagged.filter(row => row.issueId === issue.id).length })).sort((a, b) => b.count - a.count)
    const lead = counts[0]
    const positive = own.length - flagged.length
    return {
      evidenceStrength: evidenceLabel(lead?.count || 0, own.length),
      headline: own.length < 3 ? 'Too few evaluations for a reliable trend' : lead?.count >= 2 ? `${lead.issue.category} appears repeatedly` : flagged.length ? 'Flags appear mixed or isolated' : 'Consistently strong recent evaluations',
      summary: own.length < 3 ? 'This agent has a small QA sample. Review more calls before identifying a pattern.' : lead?.count >= 2 ? `${lead.count} of ${own.length} evaluations mention ${lead.issue.category.toLowerCase()}. ${positive} evaluations show no flagged issue, so review both types of calls before coaching.` : flagged.length ? `The ${flagged.length} flagged evaluations span different categories or occur infrequently. Review context before deciding on a focus area.` : 'The recent evaluations show accurate resolution and consistent workflow adherence.',
      nextStep: own.length < 3 ? 'Queue additional QA reviews.' : lead?.count >= 2 ? 'Listen to two flagged calls and one strong call together; confirm the cause with the agent.' : 'Continue routine sampling and monitor for recurrence.',
    }
  },
}
