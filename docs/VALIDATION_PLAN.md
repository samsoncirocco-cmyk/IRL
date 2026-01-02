# IRL MCP Validation Plan

90-day plan to validate strategic claims and build proof points for agent-native positioning.

## Validation Goals

**Primary Goal**: Prove that agent-native governance delivers measurable ROI (92% time savings, 22.5x ROI)

**Secondary Goals**:
- Validate "agent-native" messaging resonates with buyers
- Build 3-5 case studies with real data
- Establish network effects evidence
- Test pricing models (usage-based vs seat-based)

---

## Phase 1: Baseline Measurement (Days 1-14)

### Objective
Establish baseline metrics before agent automation to measure improvement.

### Tasks

#### 1.1 Instrument Current Workflows
**Action Items**:
- [ ] Add timing logs to `governance.js` CLI commands
- [ ] Track: `list` time, `preview` time, `approve` time per incident
- [ ] Log to `audit_log.json` with timestamps

**Code Changes**:
```javascript
// In governance.js
const startTime = Date.now();
const incidents = listQuarantined(integrationName);
const listTime = Date.now() - startTime;

appendJsonLog(AUDIT_LOG_PATH, {
  action: 'list_quarantined',
  integration: integrationName,
  incident_count: incidents.length,
  duration_ms: listTime,
  timestamp: new Date().toISOString()
});
```

**Success Metric**: Can measure time per operation for 10+ manual reviews

#### 1.2 Recruit 3-5 Design Partners
**Target Companies**:
- AI-forward engineering teams (Replit, Cursor, Vercel, etc.)
- Companies with 50+ daily schema drift incidents
- Teams already using Claude Desktop or exploring agents

**Outreach Template**:
```
Subject: Free "Agent Automation Audit" for Data Governance

Hi [Name],

I noticed [Company] processes [X] integrations with frequent schema changes.

We're building IRL - the first agent-native data governance platform. 
We'd like to offer you a free "Agent Automation Audit":

1. We'll analyze your current incident review process
2. Set up IRL MCP servers with Claude Desktop
3. Measure time savings from agent automation
4. You get free automation, we get case study data

Interested in a 15-min call?

[Your name]
```

**Success Metric**: 3-5 companies commit to 30-day trial

#### 1.3 Create Measurement Dashboard
**Track Metrics**:
- Manual review time per incident (baseline)
- Number of incidents per day
- Approval rate (safe vs complex)
- Time to resolution

**Tool**: Simple script that reads `audit_log.json` and generates CSV

**Success Metric**: Can generate weekly reports showing trends

---

## Phase 2: Agent Deployment (Days 15-45)

### Objective
Deploy agents with design partners and measure actual time savings.

### Tasks

#### 2.1 Deploy MCP Servers
**For Each Partner**:
- [ ] Install IRL MCP servers in their environment
- [ ] Configure Claude Desktop with all 3 servers
- [ ] Train team on agent workflows (30-min session)
- [ ] Set up monitoring/logging

**Deployment Checklist**:
```bash
# Partner setup script
1. Clone IRL repo
2. cd irl/mcp && npm install
3. Configure Claude Desktop config.json
4. Test: "List incidents for [integration]"
5. Verify agent can approve patches
```

**Success Metric**: 3-5 partners have agents running

#### 2.2 Run Parallel Comparison
**Methodology**:
- Week 1: Manual review only (baseline)
- Week 2-4: Agent automation with human oversight
- Track: Time per incident, approval rate, error rate

**Data Collection**:
```javascript
// Track agent vs human decisions
{
  incident_id: "...",
  reviewed_by: "agent" | "human",
  decision: "approved" | "rejected" | "flagged",
  duration_ms: 1234,
  reasoning: "Simple field rename",
  timestamp: "..."
}
```

**Success Metric**: 100+ incidents reviewed by both agents and humans

#### 2.3 Measure Time Savings
**Calculations**:
- Manual time: Sum of all human review durations
- Agent time: Sum of all agent review durations
- Time saved: Manual - Agent
- Percentage: (Time saved / Manual) × 100

**Target**: Prove 80%+ time savings (adjust 92% claim if needed)

**Success Metric**: Data shows 80%+ time reduction across all partners

---

## Phase 3: Case Study Development (Days 46-75)

### Objective
Build 3-5 detailed case studies with real data and testimonials.

### Tasks

#### 3.1 Collect Partner Testimonials
**Interview Questions**:
1. "How much time did agents save your team per week?"
2. "What was the biggest surprise about agent automation?"
3. "Would you pay for this? How much?"
4. "What would you tell other teams considering this?"

**Template**:
```
[Company Name] Case Study

Before IRL:
- [X] incidents/day requiring manual review
- [Y] hours/week spent on incident triage
- [Z]% of incidents were simple renamings

After IRL Agents:
- Agents auto-approved [X]% of incidents
- Time saved: [Y] hours/week → [Z] hours/week
- Team now focuses on [complex cases/strategic work]

Quote: "[Testimonial from engineering manager]"

ROI: [X]x return (time saved × hourly rate / IRL cost)
```

**Success Metric**: 3-5 case studies with quotes and data

#### 3.2 Document Agent Decision Patterns
**Analysis**:
- Which patterns do agents auto-approve? (simple renamings, etc.)
- Which patterns do agents flag? (type mismatches, etc.)
- Accuracy rate: How often are agent decisions correct?

**Output**: "Agent Decision Patterns Report"

**Success Metric**: Can show agents are 95%+ accurate on simple cases

#### 3.3 Build ROI Calculator
**Tool**: Interactive web calculator

**Inputs**:
- Number of incidents/day
- Average review time per incident
- Engineering hourly rate
- Number of integrations

**Outputs**:
- Hours saved/week
- Cost savings/month
- ROI (savings / IRL cost)

**Success Metric**: Calculator live on website, used by 10+ prospects

---

## Phase 4: Messaging Validation (Days 76-90)

### Objective
Test "agent-native" messaging vs alternatives with real prospects.

### Tasks

#### 4.1 A/B Test Messaging
**Variants**:
- A: "Agent-native data governance platform"
- B: "AI-powered data governance automation"
- C: "Claude Desktop-ready schema governance"

**Test Method**:
- Landing page variants
- Email subject lines
- Sales deck versions

**Metrics**:
- Click-through rate
- Demo request rate
- "I understand the value" score (survey)

**Success Metric**: Identify which messaging resonates best

#### 4.2 Validate Buyer Persona
**Test**: Who actually buys?
- Platform Engineers (bottom-up)?
- Engineering Managers (top-down)?
- CTO/VPE (strategic)?

**Method**: Track demo requests, ask "What's your role?"

**Success Metric**: Identify primary buyer persona

#### 4.3 Test Pricing Models
**Options**:
- Usage-based: $0.02 per agent call
- Seat-based: $299/agent/month
- Hybrid: Base + usage overage

**Method**: Present all 3 to prospects, ask preference

**Success Metric**: Identify preferred pricing model

---

## Success Criteria

### Must-Have (Required for Fundraising)
- [ ] 3+ case studies with real data
- [ ] 80%+ time savings proven (adjust 92% if needed)
- [ ] 3+ paying customers (even at $0 for beta)
- [ ] ROI calculator with real customer data
- [ ] Testimonials from engineering managers

### Nice-to-Have (Strengthens Story)
- [ ] 5+ case studies
- [ ] 90%+ time savings
- [ ] Network effects evidence (patterns improve with usage)
- [ ] Anthropic mention/partnership (even informal)
- [ ] Public case study (company agrees to be named)

---

## Measurement Tools

### 1. Audit Log Analyzer
**File**: `scripts/analyze-agent-metrics.js`

**Outputs**:
- Time per operation (list, preview, approve)
- Agent vs human comparison
- Approval rate by pattern type
- Weekly summary report

### 2. ROI Calculator
**File**: `website/roi-calculator.html`

**Features**:
- Interactive inputs
- Real-time calculations
- Shareable results
- Export to PDF

### 3. Case Study Template
**File**: `docs/case-study-template.md`

**Sections**:
- Company background
- Before/after metrics
- Testimonial
- ROI calculation
- Technical details

---

## Timeline Summary

| Phase | Days | Key Deliverables |
|-------|------|------------------|
| Baseline | 1-14 | Measurement tools, 3-5 partners recruited |
| Deployment | 15-45 | Agents running, time savings measured |
| Case Studies | 46-75 | 3-5 case studies, ROI calculator |
| Validation | 76-90 | Messaging tested, pricing validated |

---

## Risk Mitigation

### Risk 1: Can't prove 92% time savings
**Mitigation**: 
- Adjust claim to measured percentage (even if 70-80%)
- Focus on absolute hours saved, not percentage
- "Saved 40 hours/week" is more credible than "92% reduction"

### Risk 2: No design partners interested
**Mitigation**:
- Offer free 90-day trial (not just audit)
- Target companies already using Claude Desktop
- Partner with AI/agent communities (Replit, Cursor)

### Risk 3: Agents make mistakes
**Mitigation**:
- Start conservative (only auto-approve obvious cases)
- Human reviews agent decisions initially
- Build confidence before full automation

### Risk 4: Messaging doesn't resonate
**Mitigation**:
- Test multiple variants early
- Pivot messaging based on feedback
- Lead with outcomes, not "agent-native" terminology

---

## Next Steps

1. **This Week**: Set up measurement tools, start partner outreach
2. **Week 2**: Deploy with first partner, begin baseline measurement
3. **Week 4**: Have 3+ partners running, collect first data
4. **Week 8**: Complete case studies, build ROI calculator
5. **Week 12**: Validate messaging, finalize proof points

**Key Principle**: Measure everything, claim only what you can prove.

