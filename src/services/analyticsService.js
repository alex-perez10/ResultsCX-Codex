import { agents, evaluations, issues } from '../data/mockData.js'

export const analyticsService = {
  getAgents: () => agents,
  getIssues: () => issues,
  getEvaluations: () => evaluations,
  filterEvaluations({ team = 'All teams', period = '6 weeks', search = '' } = {}) {
    const days = period === '2 weeks' ? 14 : period === '4 weeks' ? 28 : 42
    const latest = Math.max(...evaluations.map(row => new Date(row.date).getTime()))
    const cutoff = latest - (days - 1) * 86400000
    const query = search.trim().toLowerCase()
    return evaluations.filter(row => {
      const agent = agents.find(item => item.id === row.agentId)
      return new Date(row.date).getTime() >= cutoff &&
        (team === 'All teams' || agent.team === team) &&
        (!query || [agent.name, row.category, row.comment, row.id, row.callType].some(value => value.toLowerCase().includes(query)))
    })
  },
  getIssueStats(rows) {
    return issues.map(issue => {
      const matches = rows.filter(row => row.issueId === issue.id)
      const agentIds = [...new Set(matches.map(row => row.agentId))]
      return { ...issue, count: matches.length, agents: agentIds.length, agentIds, rate: rows.length ? Math.round(matches.length / rows.length * 100) : 0 }
    }).sort((a, b) => b.count - a.count)
  },
  getAgentStats(rows) {
    return agents.map(agent => {
      const own = rows.filter(row => row.agentId === agent.id)
      const flagged = own.filter(row => row.issueId)
      const issueCounts = issues.map(issue => ({ issue, count: flagged.filter(row => row.issueId === issue.id).length })).sort((a, b) => b.count - a.count)
      return { ...agent, evaluations: own.length, score: own.length ? Math.round(own.reduce((sum, row) => sum + row.score, 0) / own.length) : null, flags: flagged.length, topIssue: issueCounts[0]?.count ? issueCounts[0].issue : null, topIssueCount: issueCounts[0]?.count || 0 }
    }).filter(agent => agent.evaluations).sort((a, b) => b.flags - a.flags || a.score - b.score)
  },
  getWeeklyStats(rows) {
    const weeks = ['Aug 03', 'Aug 10', 'Aug 17', 'Aug 24', 'Aug 31', 'Sep 07']
    return weeks.map((label, index) => {
      const from = new Date('2026-08-03T00:00:00Z').getTime() + index * 7 * 86400000
      const weekRows = rows.filter(row => { const time = new Date(row.date).getTime(); return time >= from && time < from + 7 * 86400000 })
      return { label, count: weekRows.length, score: weekRows.length ? Math.round(weekRows.reduce((sum, row) => sum + row.score, 0) / weekRows.length) : null, flagged: weekRows.filter(row => row.issueId).length }
    })
  },
}
