import { useEffect, useMemo, useState } from 'react'
import BrandLogo from './components/BrandLogo'
import { analyticsService } from './services/analyticsService'
import { mockAnalysisService } from './services/mockAnalysisService'
import './App.css'

const nav = [
  { id: 'overview', label: 'Overview', icon: 'grid' },
  { id: 'issues', label: 'Issue explorer', icon: 'layers' },
  { id: 'agents', label: 'Agents', icon: 'users' },
  { id: 'evidence', label: 'Evidence library', icon: 'file' },
]
const teams = ['All teams', 'Member Services', 'Benefits Support', 'Claims Support']
const periods = ['2 weeks', '4 weeks', '6 weeks']

function Icon({ name, size = 18 }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/></>,
    users: <><circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2H3ZM17 5a3 3 0 0 1 0 6M17 14a5 5 0 0 1 4 5v1h-3"/></>,
    file: <><path d="M6 3h8l4 4v14H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M14 3v5h5M8 13h7M8 17h7"/></>,
    search: <><circle cx="10.7" cy="10.7" r="6.7"/><path d="m16 16 5 5"/></>,
    chevron: <path d="m9 18 6-6-6-6"/>,
    arrow: <><path d="M5 12h14m-6-6 6 6-6 6"/></>,
    back: <><path d="M19 12H5m6 6-6-6 6-6"/></>,
    spark: <><path d="m12 2 1.7 6.3L20 10l-6.3 1.7L12 18l-1.7-6.3L4 10l6.3-1.7L12 2ZM19 17l.6 1.4L21 19l-1.4.6L19 21l-.6-1.4L17 19l1.4-.6L19 17Z"/></>,
    filter: <><path d="M4 7h16M7 12h10m-7 5h4"/><circle cx="8" cy="7" r="2" fill="currentColor" stroke="none"/><circle cx="15" cy="12" r="2" fill="currentColor" stroke="none"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v5m0-8h.01"/></>,
    close: <path d="M5 5 19 19M19 5 5 19"/>,
    menu: <path d="M4 6h16M4 12h16M4 18h16"/>,
  }
  return <svg {...common}>{paths[name]}</svg>
}

function Badge({ children, tone = 'neutral' }) { return <span className={`badge ${tone}`}>{children}</span> }
function Empty({ title = 'No evaluations match these filters', detail = 'Try a broader time range, team, or search term.' }) { return <div className="empty"><span className="empty-icon"><Icon name="search" size={22}/></span><h3>{title}</h3><p>{detail}</p></div> }
function SectionHeader({ eyebrow, title, detail, action }) { return <div className="section-header"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2>{detail && <p>{detail}</p>}</div>{action}</div> }

function TrendChart({ data }) {
  const valid = data.filter(point => point.score !== null)
  if (!valid.length) return <Empty />
  const width = 660, height = 178, bottom = 150
  const x = index => 35 + index * (width - 70) / 5
  const y = score => bottom - (score - 65) / 35 * 112
  const points = valid.map(point => `${x(data.indexOf(point))},${y(point.score)}`).join(' ')
  return <div className="chart-wrap"><svg className="trend-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Average QA score by week">
    {[70, 80, 90, 100].map(tick => <g key={tick}><line x1="35" x2="625" y1={y(tick)} y2={y(tick)} className="chart-grid"/><text x="4" y={y(tick)+4} className="chart-label">{tick}</text></g>)}
    <polyline points={points} fill="none" stroke="#003DA6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    {valid.map(point => <g key={point.label}><circle cx={x(data.indexOf(point))} cy={y(point.score)} r="5" fill="#fff" stroke="#003DA6" strokeWidth="3"/><title>{point.label}: {point.score}% from {point.count} evaluations</title></g>)}
    {data.map((point, index) => <text key={point.label} x={x(index)} y="174" textAnchor="middle" className="chart-label">{point.label}</text>)}
  </svg></div>
}

function IssueBars({ stats, onSelect }) {
  const max = Math.max(1, ...stats.map(item => item.count))
  return <div className="issue-bars">{stats.slice(0, 5).map(issue => <button key={issue.id} className="issue-bar-row" onClick={() => onSelect(issue.id)}>
    <span className="bar-name">{issue.category}</span><span className="bar-track"><span style={{ width: `${issue.count / max * 100}%` }} /></span><strong>{issue.count}</strong><Icon name="chevron" size={15}/>
  </button>)}</div>
}

function AnalysisPanel({ analysis, loading, kind = 'issue' }) {
  return <div className="analysis-panel"><div className="analysis-heading"><span className="analysis-icon"><Icon name="spark" size={19}/></span><div><span className="eyebrow">AI assisted analysis · Mock</span><h3>{kind === 'agent' ? analysis?.headline || 'Reviewing agent signals' : 'Working hypothesis'}</h3></div></div>
    {loading ? <div className="skeleton-group"><i/><i/><i/></div> : analysis ? <><p className="analysis-copy">{kind === 'agent' ? analysis.summary : analysis.hypothesis}</p><div className="analysis-meta"><div><span>Evidence strength</span><Badge tone={analysis.evidenceStrength === 'Strong' ? 'green' : analysis.evidenceStrength === 'Limited' ? 'amber' : 'blue'}>{analysis.evidenceStrength}</Badge></div>{analysis.pattern && <div><span>Pattern</span><strong>{analysis.pattern}</strong></div>}</div>{analysis.caveat && <p className="analysis-caveat"><Icon name="info" size={16}/>{analysis.caveat}</p>}<div className="next-step"><span>Suggested validation</span><p>{analysis.nextStep}</p></div></> : <p className="muted">Choose a record to see a mock analysis.</p>}
    <p className="human-note">AI findings are hypotheses. A supervisor should validate source calls and context before taking action.</p>
  </div>
}

function App() {
  const [view, setView] = useState('overview')
  const [team, setTeam] = useState('All teams')
  const [period, setPeriod] = useState('6 weeks')
  const [search, setSearch] = useState('')
  const [selectedIssue, setSelectedIssue] = useState(null)
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [selectedEvidence, setSelectedEvidence] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [evidenceOnly, setEvidenceOnly] = useState(false)

  const rows = useMemo(() => analyticsService.filterEvaluations({ team, period, search }), [team, period, search])
  const issueStats = useMemo(() => analyticsService.getIssueStats(rows), [rows])
  const agentStats = useMemo(() => analyticsService.getAgentStats(rows), [rows])
  const weekly = useMemo(() => analyticsService.getWeeklyStats(rows), [rows])
  const score = rows.length ? Math.round(rows.reduce((sum, row) => sum + row.score, 0) / rows.length) : 0
  const flags = rows.filter(row => row.issueId).length
  const activeIssue = issueStats.find(issue => issue.id === selectedIssue)
  const activeAgent = agentStats.find(agent => agent.id === selectedAgent) || analyticsService.getAgents().find(agent => agent.id === selectedAgent)
  const evidenceRows = rows.filter(row => (!selectedIssue || row.issueId === selectedIssue) && (!selectedAgent || row.agentId === selectedAgent) && (!evidenceOnly || row.issueId)).sort((a,b) => b.date.localeCompare(a.date))
  const evidence = analyticsService.getEvaluations().find(row => row.id === selectedEvidence)

  const analysisKey = selectedAgent ? `agent-${selectedAgent}-${team}-${period}-${search}` : selectedIssue ? `issue-${selectedIssue}-${team}-${period}-${search}` : null
  const currentAnalysis = analysis?.key === analysisKey ? analysis.value : null
  useEffect(() => {
    if (!analysisKey) return
    let current = true
    const timer = setTimeout(() => {
      const request = selectedAgent ? mockAnalysisService.analyzeAgent(selectedAgent, rows) : mockAnalysisService.analyzeIssue(selectedIssue, rows)
      request.then(value => { if (current) setAnalysis({ key: analysisKey, value }) })
    }, 320)
    return () => { current = false; clearTimeout(timer) }
  }, [analysisKey, selectedIssue, selectedAgent, rows])

  const go = page => { setView(page); setSelectedIssue(null); setSelectedAgent(null); setSelectedEvidence(null); setMobileOpen(false); setEvidenceOnly(false) }
  const openIssue = id => { setSelectedIssue(id); setSelectedAgent(null); setView('issues'); setMobileOpen(false) }
  const openAgent = id => { setSelectedAgent(id); setView('agents'); setMobileOpen(false) }
  const openEvidence = id => setSelectedEvidence(id)
  const showEvidence = (issueId, agentId) => { setSelectedIssue(issueId || null); setSelectedAgent(agentId || null); setView('evidence') }
  const evidenceDrawer = evidence && <div className="drawer-backdrop" onMouseDown={() => setSelectedEvidence(null)}><aside className="evidence-drawer" role="dialog" aria-modal="true" aria-label="Evaluation evidence" onMouseDown={event => event.stopPropagation()}><div className="drawer-top"><div><span className="eyebrow">Source evaluation</span><h2>{evidence.id}</h2></div><button className="icon-button" aria-label="Close evidence" onClick={() => setSelectedEvidence(null)}><Icon name="close"/></button></div><div className="drawer-body"><div className="drawer-score"><span>QA score</span><strong>{evidence.score}%</strong><Badge tone={evidence.issueId ? 'amber' : 'green'}>{evidence.issueId ? 'Flagged' : 'Meets standard'}</Badge></div><div className="detail-grid"><div><span>Agent</span><strong>{`Agent ${evidence.agentId}`}</strong></div><div><span>Date</span><strong>{formatDate(evidence.date)}</strong></div><div><span>Evaluator</span><strong>{evidence.evaluator}</strong></div><div><span>Call type</span><strong>{evidence.callType}</strong></div><div><span>Category</span><strong>{evidence.category}</strong></div><div><span>Finding</span><strong>{evidence.issueId ? analyticsService.getIssues().find(item => item.id === evidence.issueId)?.title : 'No issue flagged'}</strong></div></div><div className="quote-block"><span className="eyebrow">Evaluator comment</span><p>“{evidence.comment}”</p></div><div className="validation-box"><Icon name="info" size={18}/><div><strong>Human validation point</strong><p>Review the full call and case record before confirming this finding or planning coaching.</p></div></div><button className="primary-button full" onClick={() => { setSelectedEvidence(null); openAgent(evidence.agentId) }}>View agent profile <Icon name="arrow" size={17}/></button></div></aside></div>

  return <div className="app-shell"><aside className={`sidebar ${mobileOpen ? 'open' : ''}`}><div className="sidebar-brand"><BrandLogo/><span>SUPERVISOR INTELLIGENCE</span></div><div className="workspace-label">WORKSPACE</div><nav aria-label="Main navigation">{nav.map(item => <button key={item.id} className={`nav-link ${view === item.id ? 'active' : ''}`} onClick={() => go(item.id)}><Icon name={item.icon}/><span>{item.label}</span>{view === item.id && <span className="nav-active-line"/>}</button>)}</nav><div className="sidebar-bottom"><div className="sidebar-insight"><span className="sidebar-insight-icon"><Icon name="spark" size={17}/></span><strong>Insight workspace</strong><p>Find patterns. Review the evidence. Coach with context.</p></div><div className="sidebar-user"><div className="avatar">SC</div><div><strong>Supervisor Console</strong><span>Healthcare operations</span></div></div></div></aside>
    <div className="main-area"><header className="topbar"><button className="mobile-menu icon-button" aria-label="Open menu" onClick={() => setMobileOpen(!mobileOpen)}><Icon name="menu"/></button><div className="breadcrumb">Workspace <Icon name="chevron" size={13}/> <strong>{nav.find(item => item.id === view)?.label}</strong></div><div className="topbar-right"><span className="live-dot"/> Mock data environment <span className="topbar-divider"/> <span className="topbar-date">Updated Sep 12, 2026</span></div></header>
      <main className="content"><div className="page-heading"><div><span className="eyebrow">HEALTHCARE OPERATIONS / QA INTELLIGENCE</span><h1>{view === 'overview' ? 'Team performance' : view === 'issues' ? selectedIssue ? activeIssue?.title : 'Issue explorer' : view === 'agents' ? selectedAgent ? activeAgent?.name : 'Agent performance' : 'Evidence library'}</h1><p>{view === 'overview' ? 'A clear view of quality trends, recurring issues, and where to look next.' : view === 'issues' ? selectedIssue ? activeIssue?.description : 'Explore recurring patterns across evaluations and teams.' : view === 'agents' ? selectedAgent ? `${activeAgent?.team} · ${activeAgent?.tenure} tenure` : 'Compare recent QA results and review individual signals.' : 'Inspect evaluator comments and the source of every finding.'}</p></div><div className="heading-badge"><span className="heading-badge-dot"/> Supervisor view</div></div>
        <div className="filterbar"><div className="filterbar-title"><Icon name="filter" size={17}/><span>Filters</span></div><label className="select-wrap"><span>Team</span><select value={team} onChange={event => setTeam(event.target.value)}>{teams.map(value => <option key={value}>{value}</option>)}</select></label><label className="select-wrap"><span>Time range</span><select value={period} onChange={event => setPeriod(event.target.value)}>{periods.map(value => <option key={value}>{value}</option>)}</select></label><label className="search-wrap"><Icon name="search" size={17}/><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search agents, comments, QA IDs..." aria-label="Search evaluations"/>{search && <button aria-label="Clear search" onClick={() => setSearch('')}><Icon name="close" size={15}/></button>}</label><span className="filter-count">{rows.length} evaluations</span></div>
        {view === 'overview' && <><div className="metrics-grid"><Metric label="Average QA score" value={rows.length ? `${score}%` : '—'} note="Across filtered evaluations" icon="grid"/><Metric label="Evaluations reviewed" value={rows.length} note={`Across ${new Set(rows.map(row => row.agentId)).size} agents`} icon="file"/><Metric label="Flagged evaluations" value={flags} note={rows.length ? `${Math.round(flags / rows.length * 100)}% of reviewed calls` : 'No matching calls'} icon="layers"/><Metric label="Recurring issue types" value={issueStats.filter(item => item.count >= 3).length} note="3+ observations in sample" icon="spark"/></div><div className="overview-grid"><section className="panel trend-panel"><SectionHeader eyebrow="QUALITY TREND" title="QA score over time" detail="Weekly average across selected evaluations"/><TrendChart data={weekly}/><div className="chart-foot"><span><i className="legend-line"/> Average QA score</span><span>Scores reflect sampled QA evaluations</span></div></section><section className="panel attention-panel"><SectionHeader eyebrow="PRIORITY SIGNALS" title="Where to look next" detail="Issues ranked by frequency"/><IssueBars stats={issueStats} onSelect={openIssue}/><button className="text-link" onClick={() => go('issues')}>Explore all issues <Icon name="arrow" size={16}/></button></section></div><div className="lower-grid"><section className="panel"><SectionHeader eyebrow="ISSUE PATTERNS" title="Recurring QA issues" detail="Select a pattern to inspect affected agents and evidence" action={<button className="text-link" onClick={() => go('issues')}>View all <Icon name="arrow" size={16}/></button>}/><div className="issue-list">{issueStats.slice(0, 4).map(issue => <button className="issue-list-item" key={issue.id} onClick={() => openIssue(issue.id)}><span className={`issue-marker ${issue.severity.toLowerCase()}`}/><div><strong>{issue.title}</strong><span>{issue.category} · {issue.agents} affected {issue.agents === 1 ? 'agent' : 'agents'}</span></div><div className="issue-list-right"><strong>{issue.count}</strong><span>flags</span></div><Icon name="chevron" size={17}/></button>)}</div></section><section className="panel review-panel"><SectionHeader eyebrow="AGENT REVIEW" title="Agents to review" detail="Signals that may warrant a closer look" action={<button className="text-link" onClick={() => go('agents')}>All agents <Icon name="arrow" size={16}/></button>}/>{agentStats.slice(0, 4).map(agent => <button className="review-row" key={agent.id} onClick={() => openAgent(agent.id)}><span className="agent-avatar">{agent.id}</span><span className="review-name"><strong>{agent.name}</strong><small>{agent.topIssue?.category || 'No flagged pattern'}</small></span><span className="review-score">{agent.score}%</span><Icon name="chevron" size={16}/></button>)}</section></div></>}
        {view === 'issues' && (!selectedIssue ? <section className="panel explorer-panel"><SectionHeader eyebrow="ALL CATEGORIES" title="Issue patterns" detail="Frequency is based on the evaluations in your current filters."/><div className="table-scroll"><table><thead><tr><th>Issue</th><th>Severity</th><th>Occurrences</th><th>Affected agents</th><th>Share of QA</th><th></th></tr></thead><tbody>{issueStats.filter(item => item.count).map(issue => <tr key={issue.id} onClick={() => openIssue(issue.id)} tabIndex="0" onKeyDown={event => event.key === 'Enter' && openIssue(issue.id)}><td><strong>{issue.title}</strong><small>{issue.category}</small></td><td><Badge tone={issue.severity === 'High' ? 'red' : 'amber'}>{issue.severity}</Badge></td><td><strong>{issue.count}</strong></td><td>{issue.agents}</td><td><div className="mini-bar"><span style={{width:`${issue.rate}%`}}/></div>{issue.rate}%</td><td><Icon name="chevron" size={16}/></td></tr>)}</tbody></table>{!issueStats.some(item => item.count) && <Empty/>}</div></section> : <><button className="back-link" onClick={() => setSelectedIssue(null)}><Icon name="back" size={16}/> All issues</button><div className="detail-layout"><div className="detail-main"><div className="detail-summary panel"><div className="detail-stat"><span>Occurrences</span><strong>{activeIssue.count}</strong></div><div className="detail-stat"><span>Affected agents</span><strong>{activeIssue.agents}</strong></div><div className="detail-stat"><span>Share of QA</span><strong>{activeIssue.rate}%</strong></div><div className="detail-stat"><span>Severity</span><Badge tone={activeIssue.severity === 'High' ? 'red' : 'amber'}>{activeIssue.severity}</Badge></div></div><section className="panel"><SectionHeader eyebrow="AFFECTED AGENTS" title="Who is showing this pattern?" detail="Repeated observations are a stronger signal than a single flag."/><div className="affected-list">{activeIssue.agentIds.map(id => { const count = rows.filter(row => row.agentId === id && row.issueId === selectedIssue).length; const agent = analyticsService.getAgents().find(item => item.id === id); return <button key={id} onClick={() => openAgent(id)}><span className="agent-avatar">{id}</span><span><strong>{agent.name}</strong><small>{agent.team}</small></span><Badge tone={count >= 2 ? 'blue' : 'neutral'}>{count >= 2 ? `${count} repeated` : '1 isolated'}</Badge><Icon name="chevron" size={17}/></button> })}{!activeIssue.agentIds.length && <Empty/>}</div></section><EvidenceTable rows={evidenceRows} onOpen={openEvidence} limit={5} onAll={() => showEvidence(selectedIssue, null)}/></div><AnalysisPanel analysis={currentAnalysis} loading={!currentAnalysis}/></div></>)}
        {view === 'agents' && (!selectedAgent ? <section className="panel explorer-panel"><SectionHeader eyebrow="TEAM ROSTER" title="Agent performance" detail="Select an agent to review QA history, patterns, and source comments."/><div className="table-scroll"><table><thead><tr><th>Agent</th><th>Team</th><th>QA score</th><th>Evaluations</th><th>Flags</th><th>Primary signal</th><th></th></tr></thead><tbody>{agentStats.map(agent => <tr key={agent.id} onClick={() => openAgent(agent.id)} tabIndex="0" onKeyDown={event => event.key === 'Enter' && openAgent(agent.id)}><td><span className="table-agent"><span className="agent-avatar">{agent.id}</span><strong>{agent.name}</strong></span></td><td>{agent.team}</td><td><strong>{agent.score}%</strong></td><td>{agent.evaluations}</td><td>{agent.flags}</td><td>{agent.evaluations < 3 ? <Badge tone="amber">Low sample</Badge> : agent.topIssueCount >= 2 ? <Badge tone="blue">{agent.topIssue.category}</Badge> : <Badge tone="green">No repeated issue</Badge>}</td><td><Icon name="chevron" size={16}/></td></tr>)}</tbody></table>{!agentStats.length && <Empty/>}</div></section> : <><button className="back-link" onClick={() => setSelectedAgent(null)}><Icon name="back" size={16}/> All agents</button><div className="detail-layout"><div className="detail-main"><div className="detail-summary panel"><div className="detail-stat"><span>Average QA</span><strong>{activeAgent.score == null ? String.fromCharCode(0x2014) : activeAgent.score + String.fromCharCode(37)}</strong></div><div className="detail-stat"><span>Evaluations</span><strong>{activeAgent.evaluations ?? 0}</strong></div><div className="detail-stat"><span>Flagged calls</span><strong>{activeAgent.flags ?? 0}</strong></div><div className="detail-stat"><span>Sample</span><Badge tone={(activeAgent.evaluations ?? 0) < 3 ? 'amber' : 'green'}>{(activeAgent.evaluations ?? 0) < 3 ? 'Limited' : 'Sufficient'}</Badge></div></div><section className="panel"><SectionHeader eyebrow="ISSUE BREAKDOWN" title="Signals for this agent" detail="Compare recurring categories with isolated findings."/><div className="agent-issue-list">{issueStats.filter(issue => rows.some(row => row.agentId === selectedAgent && row.issueId === issue.id)).map(issue => { const count = rows.filter(row => row.agentId === selectedAgent && row.issueId === issue.id).length; return <button key={issue.id} onClick={() => openIssue(issue.id)}><span className="issue-marker high"/><strong>{issue.category}</strong><Badge tone={count >= 2 ? 'blue' : 'neutral'}>{count} {count >= 2 ? 'repeated' : 'isolated'}</Badge><Icon name="chevron" size={17}/></button> })}{!rows.some(row => row.agentId === selectedAgent && row.issueId) && <p className="quiet-message">No flagged issues in the selected evaluations.</p>}</div></section><EvidenceTable rows={rows.filter(row => row.agentId === selectedAgent).sort((a,b) => b.date.localeCompare(a.date))} onOpen={openEvidence} limit={6} onAll={() => showEvidence(null, selectedAgent)}/></div><AnalysisPanel analysis={currentAnalysis} loading={!currentAnalysis} kind="agent"/></div></>)}
        {view === 'evidence' && <section className="panel explorer-panel"><SectionHeader eyebrow="SOURCE RECORDS" title="QA evaluations" detail="Evaluator comments are source evidence; AI hypotheses should be checked against these records." action={<label className="toggle"><input type="checkbox" checked={evidenceOnly} onChange={event => setEvidenceOnly(event.target.checked)}/><span>Flagged only</span></label>}/>{(selectedIssue || selectedAgent) && <div className="active-filter">Showing {selectedIssue && <span>{analyticsService.getIssues().find(item => item.id === selectedIssue)?.category}</span>}{selectedAgent && <span>Agent {selectedAgent}</span>}<button onClick={() => { setSelectedIssue(null); setSelectedAgent(null) }}>Clear selection <Icon name="close" size={13}/></button></div>}<div className="table-scroll"><table><thead><tr><th>Evaluation</th><th>Agent</th><th>Category</th><th>Score</th><th>Evaluator comment</th><th></th></tr></thead><tbody>{evidenceRows.map(row => <tr key={row.id} onClick={() => openEvidence(row.id)} tabIndex="0" onKeyDown={event => event.key === 'Enter' && openEvidence(row.id)}><td><strong>{row.id}</strong><small>{formatDate(row.date)}</small></td><td>Agent {row.agentId}</td><td><Badge tone={row.issueId ? 'amber' : 'green'}>{row.category}</Badge></td><td><strong>{row.score}%</strong></td><td className="comment-cell">{row.comment}</td><td><Icon name="chevron" size={16}/></td></tr>)}</tbody></table>{!evidenceRows.length && <Empty/>}</div></section>}
        <footer className="page-footer"><span>ResultsCX Supervisor Intelligence · Prototype data</span><span>Human review required for all AI findings</span></footer>
      </main></div>{mobileOpen && <button className="mobile-scrim" aria-label="Close menu" onClick={() => setMobileOpen(false)}/>} {evidenceDrawer}</div>
}

function Metric({ label, value, note, icon }) { return <div className="metric-card"><div className="metric-top"><span>{label}</span><span className="metric-icon"><Icon name={icon} size={18}/></span></div><strong>{value}</strong><small>{note}</small></div> }
function formatDate(date) { return new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) }
function EvidenceTable({ rows, onOpen, limit, onAll }) { return <section className="panel"><SectionHeader eyebrow="SOURCE EVIDENCE" title="Recent evaluations" detail="Open a record to inspect the evaluator's exact comment." action={<button className="text-link" onClick={onAll}>View all <Icon name="arrow" size={16}/></button>}/><div className="evidence-preview">{rows.slice(0, limit).map(row => <button key={row.id} onClick={() => onOpen(row.id)}><div className="evidence-top"><strong>{row.id}</strong><span>{formatDate(row.date)} · {row.evaluator}</span><Icon name="chevron" size={16}/></div><p>{row.comment}</p><div className="evidence-bottom"><Badge tone={row.issueId ? 'amber' : 'green'}>{row.category}</Badge><span>{row.score}% QA</span></div></button>)}{!rows.length && <Empty/>}</div></section> }

export default App


