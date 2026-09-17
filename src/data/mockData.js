export const agents = [
  { id: '01', name: 'Agent 01', team: 'Member Services', tenure: '18 months' },
  { id: '02', name: 'Agent 02', team: 'Member Services', tenure: '11 months' },
  { id: '03', name: 'Agent 03', team: 'Benefits Support', tenure: '2 years' },
  { id: '04', name: 'Agent 04', team: 'Benefits Support', tenure: '8 months' },
  { id: '05', name: 'Agent 05', team: 'Member Services', tenure: '3 years' },
  { id: '06', name: 'Agent 06', team: 'Claims Support', tenure: '14 months' },
  { id: '07', name: 'Agent 07', team: 'Claims Support', tenure: '6 months' },
  { id: '08', name: 'Agent 08', team: 'Benefits Support', tenure: '2 months' },
  { id: '09', name: 'Agent 09', team: 'Member Services', tenure: '22 months' },
  { id: '10', name: 'Agent 10', team: 'Claims Support', tenure: '9 months' },
]

export const issues = [
  { id: 'documentation', title: 'Incomplete case documentation', category: 'Documentation', severity: 'High', description: 'Required disposition or follow-up detail is missing from the member record.' },
  { id: 'probing', title: 'Insufficient probing questions', category: 'Probing Questions', severity: 'High', description: 'The agent moves toward a resolution before confirming the full member need.' },
  { id: 'sop', title: 'SOP steps skipped', category: 'SOP Adherence', severity: 'High', description: 'A required workflow step is omitted or completed out of sequence.' },
  { id: 'listening', title: 'Active listening gaps', category: 'Active Listening', severity: 'Moderate', description: 'The agent misses or does not acknowledge a member cue.' },
  { id: 'accuracy', title: 'Benefit information accuracy', category: 'Information Accuracy', severity: 'Moderate', description: 'Benefit information needs clearer verification before it is shared.' },
  { id: 'control', title: 'Call control and pacing', category: 'Call Control', severity: 'Moderate', description: 'The call loses structure or next steps are not clearly guided.' },
]

const comments = {
  documentation: [
    'The member was given the correct next step, but the case note did not capture the promised callback window.',
    'Disposition was selected; the reason for the benefit exception was not documented in the member record.',
    'Follow-up owner was discussed on the call but omitted from the final case summary.',
    'Clear verbal recap. The supporting case note still needs the reference number and action taken.',
  ],
  probing: [
    'The agent offered a claims status update before asking whether the member was calling about the same date of service.',
    'A second concern surfaced late in the call. An earlier open-ended question could have identified it sooner.',
    'The agent confirmed the plan but did not ask which provider the member was trying to reach.',
    'Resolution was accurate, though the member had to restate the original request before the agent clarified it.',
  ],
  sop: [
    'The identity verification sequence was completed after account details were discussed.',
    'The escalation path was appropriate, but the required knowledge-base check was not recorded.',
    'A required confirmation step in the claims adjustment workflow was skipped.',
    'The agent used the correct form but did not complete the final read-back step.',
  ],
  listening: [
    'The member mentioned an upcoming appointment twice before the urgency was acknowledged.',
    'The agent interrupted a clarification about medication coverage and moved to the standard script.',
    'The concern was eventually resolved, but the initial emotional cue was not acknowledged.',
  ],
  accuracy: [
    'The copay explanation was broadly correct; the plan-specific amount should have been verified first.',
    'The agent cited a general coverage rule without confirming this member’s benefit tier.',
    'A later evaluator confirmed that the quoted timeframe depended on the claim type.',
  ],
  control: [
    'The call had several long holds without a return update or clear expectation for the member.',
    'The agent answered the question but did not summarize the agreed next step before ending the call.',
    'The conversation moved between two topics without a clear transition.',
  ],
}

const positiveComments = [
  'Clear verification, accurate benefit explanation, and a concise summary of next steps.',
  'The agent used an open-ended question to identify the member’s underlying concern and resolved it in one call.',
  'Strong empathy and call ownership. Documentation matched the actions taken during the call.',
  'The agent followed the required workflow and confirmed that the member understood the resolution.',
]

const patterns = {
  '01': ['documentation', 'documentation', 'documentation', 'probing', null, 'documentation', 'listening', null],
  '02': ['probing', 'probing', 'probing', 'probing', 'control', null, 'probing', null],
  '03': [null, null, 'accuracy', null, null, null, null, null],
  '04': ['sop', 'sop', 'sop', 'documentation', 'sop', null, 'sop', 'documentation'],
  '05': [null, null, null, null, null, null, 'listening', null],
  '06': ['documentation', 'documentation', 'control', null, 'documentation', 'sop', null, 'documentation'],
  '07': ['listening', 'listening', null, 'control', 'listening', null, 'probing', null],
  '08': ['accuracy', null],
  '09': [null, 'probing', null, null, 'probing', null, null, null],
  '10': ['sop', null, 'sop', 'accuracy', null, 'sop', null, 'control'],
}

const start = new Date('2026-08-03T12:00:00Z')
export const evaluations = agents.flatMap((agent, agentIndex) => patterns[agent.id].map((issueId, index) => {
  const date = new Date(start)
  date.setUTCDate(start.getUTCDate() + index * 5 + agentIndex % 4)
  const issue = issues.find(item => item.id === issueId)
  const commentPool = issueId ? comments[issueId] : positiveComments
  return {
    id: `QA-${agent.id}-${String(index + 1).padStart(2, '0')}`,
    agentId: agent.id,
    date: date.toISOString().slice(0, 10),
    evaluator: `Evaluator ${String((agentIndex + index) % 4 + 1).padStart(2, '0')}`,
    score: issueId ? 68 + ((agentIndex * 7 + index * 3) % 16) : 90 + ((agentIndex + index * 3) % 10),
    issueId,
    category: issue?.category || ['Member Experience', 'Resolution Quality', 'Business Process', 'Compliance'][index % 4],
    comment: commentPool[(agentIndex + index) % commentPool.length],
    callType: ['Benefits inquiry', 'Claims status', 'Provider search', 'Coverage question'][index % 4],
  }
}))
