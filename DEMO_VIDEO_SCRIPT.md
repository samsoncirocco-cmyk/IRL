# IRL Agent-Native Governance - HeyGen Demo Script

**Duration:** 2:30 minutes
**Format:** AI Avatar + Screen Recordings
**Target Audience:** Engineering Managers, VPs of Engineering, Platform Engineers

---

## Scene 1: Hook - The Problem (0:00 - 0:20)
**Duration:** 20 seconds
**Avatar:** Professional, sitting at desk
**Tone:** Empathetic, problem-focused

### Avatar Narration:
```
"Your platform engineer reviews 50 schema drift incidents every morning.
Each one takes 1-2 minutes to analyze. That's an hour of manual work. Every. Single. Day.

Most are simple field renamings—username becomes user_name—but they still need human approval.

What if an AI agent could do this in 30 seconds?"
```

### Screen Recording:
- Show CLI terminal with `node governance.js list` command
- Display long list of quarantined incidents scrolling
- Show timestamp: "9:00 AM - Alex starts incident review"
- Show clock ticking forward: "9:15 AM... 9:30 AM... 10:00 AM"
- Text overlay: "1+ hour daily"

### Visual Elements:
- Red highlighting around "50 incidents"
- Timer animation showing time wasted
- Frustrated developer icon

---

## Scene 2: Solution Introduction (0:20 - 0:45)
**Duration:** 25 seconds
**Avatar:** Same, now energized
**Tone:** Confident, excited

### Avatar Narration:
```
"Introducing IRL: The first agent-native data governance platform.

We built MCP servers that work with Claude Desktop, so AI agents can autonomously manage your data quality—24/7.

Agents auto-approve safe schema changes, flag complex drift for human review, and prevent data corruption. All without writing a single line of code."
```

### Screen Recording:
- Show IRL logo with tagline: "Your AI Ops Engineer for Data Quality"
- Display Claude Desktop interface
- Show MCP servers configuration in claude_desktop_config.json:
  ```json
  {
    "mcpServers": {
      "irl-governance": { ... },
      "irl-sentinel": { ... }
    }
  }
  ```
- Animated graphic: "3 MCP Servers | 11 Tools | 8 Resource URIs"

### Visual Elements:
- Green checkmarks appearing
- "Agent-Native" badge
- "Claude Desktop Ready" badge

---

## Scene 3: Live Demo - Agent in Action (0:45 - 1:30)
**Duration:** 45 seconds
**Avatar:** Picture-in-picture (small, bottom right)
**Tone:** Demonstrative, walking through

### Avatar Narration:
```
"Watch how it works. I ask Claude to review and auto-approve safe patches for user_integration.

The agent uses the list_quarantined_incidents tool and finds 2 incidents.

For the first incident, it detects a simple field rename—username to user_name. Safe to auto-approve.

The agent uses approve_patch, and boom—payload healed and released in seconds.

For the second incident, there's a type mismatch: total changed from number to string. The agent flags it for human review and creates a GitHub issue.

That's it. Two incidents analyzed, one auto-approved, one flagged—all in 30 seconds."
```

### Screen Recording (Full Screen Demo):

**Part 1: User Input (0:45 - 0:50)**
- Show Claude Desktop interface
- User types: "Review and auto-approve safe patches for user_integration"
- Hit enter

**Part 2: Agent Thinking (0:50 - 0:55)**
- Show "Thinking..." animation
- Text overlay: "Agent analyzing 2 incidents..."

**Part 3: Incident 1 - Auto-Approve (0:55 - 1:05)**
- Show tool call: `list_quarantined_incidents`
- Response: "Found 2 incidents"
- Show tool call: `preview_incident` for incident 1
- Display drift analysis:
  ```
  - FIELD_REMOVED: username
  - FIELD_ADDED: user_name
  Analysis: Simple field rename, safe to approve
  ```
- Show tool call: `approve_patch`
- Success animation: ✓ "Approved and released!"
- Show file path: `/released/user_integration/2026-01-01_healed.json`

**Part 4: Incident 2 - Flag for Review (1:05 - 1:20)**
- Show tool call: `preview_incident` for incident 2
- Display drift analysis:
  ```
  - TYPE_MISMATCH: total (number → string)
  - FIELD_ADDED: email
  Analysis: Complex drift, requires human review
  ```
- Show GitHub issue creation
- Issue title: "Complex drift detected: user_integration"

**Part 5: Summary (1:20 - 1:30)**
- Show final summary:
  ```
  Summary:
  ✓ Auto-approved: 1 incident (simple field rename)
  ⚠ Flagged for review: 1 incident (type mismatch)
  Time taken: 32 seconds
  ```

### Visual Elements:
- Tool call animations (API request graphics)
- Green ✓ for auto-approved
- Yellow ⚠ for flagged
- Timer showing "32 seconds"

---

## Scene 4: Impact & ROI (1:30 - 1:50)
**Duration:** 20 seconds
**Avatar:** Full screen, professional
**Tone:** Authoritative, data-driven

### Avatar Narration:
```
"The impact? 92% reduction in incident triage time.

What used to take an hour now takes 5 minutes—because you only review the flagged cases.

That's 10 hours saved per week. Per engineer.

At $100 per hour, that's $52,000 in annual savings per engineer."
```

### Screen Recording:
- Animated comparison chart:
  ```
  Manual Review:     ████████████████ 60 minutes
  Agent Automation:  █ 5 minutes

  Reduction: 92%
  ```
- ROI calculation animation:
  ```
  10 hours/week × 52 weeks × $100/hour = $52,000/year saved
  IRL Cost: $2,000/month = $24,000/year
  Net Savings: $28,000/year
  ROI: 2.17x
  ```
- Counter animation showing hours saved accumulating

### Visual Elements:
- Bold percentage: "92%" in large font
- Dollar signs "$$$" animation
- Green arrow pointing up for savings

---

## Scene 5: Technical Details (1:50 - 2:10)
**Duration:** 20 seconds
**Avatar:** Split screen (50/50 with code)
**Tone:** Technical, confident

### Avatar Narration:
```
"Under the hood, we built three MCP servers: Governance, Sentinel, and AI Proposer.

Eleven tools total—for listing incidents, detecting drift, validating invariants, and generating patches.

It works with Claude Desktop out of the box. No custom agent code needed.

Just add three lines to your config, restart Claude, and you're live."
```

### Screen Recording:
- Show file structure:
  ```
  irl/mcp/
  ├── governance-server.js (549 lines)
  ├── sentinel-server.js (370 lines)
  └── ai-proposer-server.js (430 lines)
  ```
- Show tool list animation:
  ```
  Governance Tools:
  • list_quarantined_incidents
  • preview_incident
  • approve_patch
  • reject_incident

  Sentinel Tools:
  • compute_fingerprint
  • detect_drift
  • validate_invariants
  • strip_pii

  AI Proposer Tools:
  • generate_patch
  • validate_patch
  • apply_patch_preview
  ```
- Show Claude Desktop config (simplified):
  ```json
  {
    "mcpServers": {
      "irl-governance": { ... }
    }
  }
  ```

### Visual Elements:
- Code syntax highlighting
- Animated file icons
- "Plug & Play" badge

---

## Scene 6: Call to Action (2:10 - 2:30)
**Duration:** 20 seconds
**Avatar:** Full screen, friendly close
**Tone:** Inviting, clear CTA

### Avatar Narration:
```
"IRL is the first agent-native data governance platform. We're among the first to build for the agent economy.

Ready to automate your data quality workflows?

Visit irl.dev to get started with Claude Desktop today. Or book a demo to see custom agent workflows in action.

Your AI ops engineer is waiting."
```

### Screen Recording:
- Show IRL website homepage
- Display three CTAs:
  ```
  [Get Started with Claude Desktop]
  [Book a Demo]
  [View Agent Workflows]
  ```
- Show final tagline animation:
  ```
  IRL: Your AI Ops Engineer for Data Quality
  Agent-Native | 92% Faster | 24/7 Automation
  ```
- QR code appears for easy access: "Scan to try now"

### Visual Elements:
- Animated logo
- CTA buttons with hover effects
- Contact info: hello@irl.dev
- Social proof: "First MCP Governance Platform"

---

## Closing Credits (2:30)
**Duration:** 5 seconds (optional)

### Screen:
```
IRL - Agent-Native Data Governance
irl.dev | hello@irl.dev | @irl_platform

Built with ❤️ for the agent economy
```

---

## HeyGen Production Notes

### Avatar Selection
**Recommended Avatar:**
- Professional, 30-40 years old
- Tech industry appearance (casual business attire)
- Energetic but credible
- Gender: Any (suggest female for diversity in tech demos)

**Alternative Avatars:**
- Scene 1-2: "Marketing Executive" style (hook & pitch)
- Scene 3-5: "Technical Expert" style (demo & details)
- Scene 6: Same as Scene 1 (consistency)

### Voice Settings
- **Language:** English (US)
- **Tone:** Professional, enthusiastic
- **Speed:** 1.0x (normal)
- **Emphasis:** Key phrases (92%, agent-native, first-mover)

### Screen Recording Specifications
- **Resolution:** 1920x1080 (Full HD)
- **Frame Rate:** 30fps
- **Format:** MP4
- **Audio:** Muted (avatar voice only)

### Transitions
- **Between Scenes:** Smooth fade (0.5 seconds)
- **Tool Calls:** Quick cut (0.2 seconds)
- **Data Animations:** Ease-in-out

### Text Overlays
- **Font:** Inter or SF Pro (modern, readable)
- **Size:** 48pt for main text, 32pt for details
- **Color:** White text with 50% black shadow for readability
- **Position:** Lower third for most overlays

### Background Music
- **Style:** Upbeat, tech-focused, corporate
- **Volume:** -20dB (background only, don't overpower voice)
- **Suggested Tracks:**
  - "Tech Innovation" by Audiojungle
  - "Corporate Success" by Artlist
  - "Digital Future" by Epidemic Sound

---

## Alternative Versions

### Short Version (60 seconds)
**For Social Media (LinkedIn, Twitter)**
- Scene 1: Hook (10s)
- Scene 3: Demo (30s) - Incident 1 only
- Scene 4: Impact (10s) - ROI only
- Scene 6: CTA (10s)

### Long Version (5 minutes)
**For Sales Demos**
- Add Scene 2.5: "Why Agent-Native?" (30s) - competitive comparison
- Expand Scene 3: Show all 3 incidents (2 min)
- Add Scene 4.5: "Customer Stories" (1 min) - testimonials
- Add Scene 5.5: "Enterprise Features" (30s) - multi-tenancy, custom tools

### Technical Version (3 minutes)
**For Developer Audience**
- Same structure but more code-focused:
  - Show actual MCP server code
  - Demonstrate MCP Inspector testing
  - Show GitHub repo structure
  - Include installation commands

---

## Script Variations by Audience

### For Engineering Managers (Current Script)
- Focus: Time savings, ROI, team efficiency
- Tone: Business value + technical credibility

### For Platform Engineers
**Changes:**
- Scene 1: Start with "You spend hours reviewing incidents..."
- Scene 3: Show more technical details (tool parameters, response schemas)
- Scene 5: Expand to show actual code snippets
- Scene 6: CTA = "Fork on GitHub" + "Try with Claude Desktop"

### For C-Level Executives
**Changes:**
- Scene 1: "Schema drift costs enterprises $2M+ annually..."
- Scene 4: Focus on business metrics (uptime, revenue protection)
- Scene 5: Skip technical details, add "Enterprise Features"
- Scene 6: CTA = "Book Executive Briefing"

### For Investors
**Changes:**
- Scene 2: Add "First-mover in $35B market"
- Scene 4: Show market opportunity chart
- Scene 5: Add "Network effects from agent patterns"
- Scene 6: CTA = "Read Investor Deck" + "Schedule Meeting"

---

## Asset Checklist for HeyGen

### Required Screen Recordings
- [ ] CLI terminal showing incident list
- [ ] Claude Desktop interface (empty state)
- [ ] User typing query in Claude Desktop
- [ ] Agent response with tool calls animated
- [ ] list_quarantined_incidents tool call
- [ ] preview_incident tool call (incident 1)
- [ ] approve_patch tool call with success
- [ ] preview_incident tool call (incident 2)
- [ ] GitHub issue creation
- [ ] Summary screen with metrics
- [ ] ROI calculator animation
- [ ] File structure diagram
- [ ] Tool list animation
- [ ] Claude Desktop config example
- [ ] Website homepage (or mockup)

### Required Graphics
- [ ] IRL logo (transparent PNG)
- [ ] "Agent-Native" badge
- [ ] "Claude Desktop Ready" badge
- [ ] Comparison chart (Manual vs Agent)
- [ ] ROI calculation graphic
- [ ] File structure diagram
- [ ] Tool icons (11 tools)
- [ ] MCP server architecture diagram
- [ ] QR code linking to website

### Required Text Overlays
- [ ] "1+ hour daily" (Scene 1)
- [ ] "3 MCP Servers | 11 Tools | 8 Resource URIs" (Scene 2)
- [ ] "Agent analyzing 2 incidents..." (Scene 3)
- [ ] Drift analysis boxes (Scene 3)
- [ ] "✓ Approved and released!" (Scene 3)
- [ ] "Time taken: 32 seconds" (Scene 3)
- [ ] "92% reduction" (Scene 4)
- [ ] "$52,000/year saved" (Scene 4)
- [ ] "Plug & Play" (Scene 5)
- [ ] CTAs (Scene 6)

---

## HeyGen Upload Instructions

### Step 1: Create Project
1. Log into HeyGen
2. Create new video project: "IRL Agent-Native Demo"
3. Select template: "Professional Presentation"
4. Choose aspect ratio: 16:9 (landscape for YouTube/Vimeo)

### Step 2: Select Avatar
1. Browse avatar library
2. Filter: Professional > Tech Industry
3. Preview voice samples
4. Select avatar and voice

### Step 3: Import Assets
1. Upload all screen recordings (MP4 format)
2. Upload graphics (PNG format with transparency)
3. Upload logo and badges
4. Organize into folders by scene

### Step 4: Build Timeline
1. Create 6 scenes matching script structure
2. Add avatar to each scene (full screen or PIP as noted)
3. Insert screen recordings behind avatar
4. Add text overlays with timing marks
5. Apply transitions between scenes

### Step 5: Add Audio
1. Copy narration text into each scene
2. Set voice settings (speed, tone)
3. Preview and adjust timing
4. Add background music track (-20dB)
5. Balance audio levels

### Step 6: Polish
1. Add animations (tool calls, data viz)
2. Sync text overlays with narration
3. Add green checkmarks and warning icons
4. Insert CTAs with clickable buttons (if supported)
5. Preview full video

### Step 7: Export
1. Export settings: 1080p, 30fps, MP4
2. Download video file
3. Upload to YouTube/Vimeo
4. Add video description and tags

---

## Distribution Strategy

### Primary Channels
1. **Company Website** (irl.dev/demo)
   - Embed on homepage
   - Add to "Product" page
   - Include in docs

2. **YouTube**
   - Title: "IRL: The First Agent-Native Data Governance Platform | Live Demo"
   - Description: Full script + links
   - Tags: agent-native, MCP, Claude Desktop, data governance, AI automation

3. **LinkedIn**
   - Post 60s version
   - Caption: "We just built the first agent-native data governance platform. Watch it auto-approve schema drift in 30 seconds."
   - Target: Engineering Managers, VPs Eng

4. **Twitter/X**
   - Post 60s version
   - Thread with key takeaways
   - Tag @AnthropicAI, @ClaudeAI

5. **HN/Reddit**
   - r/programming, r/dataengineering
   - Post with context: "Show HN: IRL - Agent-native governance (demo)"

6. **Sales Demos**
   - Send to prospects pre-call
   - Play during discovery calls
   - Include in follow-up emails

### A/B Testing
**Version A (Current):** "Agent-Native Governance"
**Version B:** "92% Faster Incident Resolution"
**Version C:** "Your AI Ops Engineer for Data Quality"

Test thumbnails:
- Avatar speaking
- Before/after comparison chart
- "92%" big number
- Claude Desktop interface

---

## Success Metrics

### Engagement Metrics
- **View Rate:** Target 60%+ (people who start video)
- **Completion Rate:** Target 70%+ (watch to end)
- **Click-Through Rate:** Target 5%+ (click CTA)

### Business Metrics
- **Demo Requests:** Track from video CTA
- **Claude Desktop Installs:** Track from docs link
- **GitHub Stars:** Monitor repo traffic from video
- **Inbound Sales:** "I saw your video" mentions

### Optimization
- If completion rate < 50%: Shorten to 90 seconds
- If CTR < 3%: Test different CTAs
- If views < 1000 in Week 1: Boost on LinkedIn/Twitter

---

## Video Versions for Export

### Master Version (2:30)
- All scenes included
- For: Website, YouTube, Sales

### Social Short (0:60)
- Scenes 1, 3, 4, 6 only
- For: LinkedIn, Twitter, Instagram

### Technical Deep Dive (3:00)
- Add code walkthrough
- For: Developer audience, conference talks

### Executive Summary (1:30)
- Focus on ROI and business value
- For: C-level prospects, investor meetings

---

**Total Production Time Estimate:** 4-6 hours with HeyGen
**Cost:** $0-100 (depending on HeyGen plan)
**ROI:** Reusable asset for demos, marketing, sales

---

*Ready to generate! Upload to HeyGen and follow timeline structure above.* 🎬
