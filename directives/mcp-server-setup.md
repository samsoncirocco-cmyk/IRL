# SOP: MCP Server Setup

Configure IRL MCP servers for Claude Desktop and custom agents.

## Overview

IRL provides three MCP (Model Context Protocol) servers that enable agents to autonomously manage governance workflows:

1. **irl-governance** - Incident lifecycle management (list, preview, approve, reject)
2. **irl-sentinel** - Proactive validation (fingerprint, drift detection, invariants)
3. **irl-ai-proposer** - Patch generation (deterministic and AI-powered)

## Prerequisites

- **Node.js:** Version 20+ installed
- **Claude Desktop:** Installed ([Download](https://claude.ai/download))
- **Anthropic API Key:** For AI-powered patch generation (optional)
- **IRL Repository:** Cloned and dependencies installed

---

## Procedure

### 1. Locate Claude Desktop Config File

```bash
# macOS
CONFIG_FILE="$HOME/Library/Application Support/Claude/claude_desktop_config.json"

# Linux
CONFIG_FILE="$HOME/.config/Claude/claude_desktop_config.json"

# Windows
CONFIG_FILE="%APPDATA%\Claude\claude_desktop_config.json"

# Verify file exists
ls -la "$CONFIG_FILE"
```

**Expected Output:**
```
-rw-r--r-- 1 user user 234 Feb 08 00:30 /Users/user/Library/Application Support/Claude/claude_desktop_config.json
```

If file doesn't exist, create it:
```bash
mkdir -p "$(dirname "$CONFIG_FILE")"
echo '{"mcpServers": {}}' > "$CONFIG_FILE"
```

### 2. Add MCP Server Configurations

```bash
# Edit the config file
nano "$CONFIG_FILE"  # or use your preferred editor
```

Add this configuration:

```json
{
  "mcpServers": {
    "irl-governance": {
      "command": "node",
      "args": ["/path/to/irl/irl/mcp/governance-server.js"],
      "env": {
        "IRL_ROOT": "/path/to/irl"
      }
    },
    "irl-sentinel": {
      "command": "node",
      "args": ["/path/to/irl/irl/mcp/sentinel-server.js"],
      "env": {
        "IRL_ROOT": "/path/to/irl"
      }
    },
    "irl-ai-proposer": {
      "command": "node",
      "args": ["/path/to/irl/irl/mcp/ai-proposer-server.js"],
      "env": {
        "IRL_ROOT": "/path/to/irl",
        "ANTHROPIC_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

**Replace** `/path/to/irl` with your actual repository path.

**Note:** `ANTHROPIC_API_KEY` is only required for `irl-ai-proposer` when using AI-powered patch generation (`use_ai=true`).

### 3. Verify Server Files Exist

```bash
# Check that MCP server files exist
ls -la /path/to/irl/irl/mcp/*.js
```

**Expected Output:**
```
-rw-r--r-- 1 user user 4521 Feb 06 03:50 governance-server.js
-rw-r--r-- 1 user user 3892 Feb 06 03:50 sentinel-server.js
-rw-r--r-- 1 user user 3456 Feb 06 03:50 ai-proposer-server.js
```

**Note:** If these files don't exist yet, the MCP server implementation is pending. The configuration above is the target state.

### 4. Restart Claude Desktop

```bash
# macOS
osascript -e 'quit app "Claude"'
open -a Claude

# Linux
killall claude
claude &

# Windows
# Close Claude from system tray, then reopen from Start menu
```

### 5. Verify MCP Servers are Connected

1. Open Claude Desktop
2. Start a new conversation
3. Look for MCP server indicators in the UI (typically shown as available tools)
4. Test a simple command:

**User:** "List available IRL governance tools"

**Claude:** The irl-governance server provides these tools:
- `list_quarantined_incidents` - List all quarantined incidents
- `preview_incident` - View drift details for a specific incident
- `approve_patch` - Approve and release a healed payload
- `reject_incident` - Reject and archive an incident

### 6. Test Each Server

#### Test irl-governance

**User:** "List quarantined incidents for user_integration"

**Expected Response:**
```
I'll check for quarantined incidents.

[Uses list_quarantined_incidents tool]

Found X quarantined incidents for user_integration:
- Incident ID: 2026-01-01T17-28-20-262Z_228986
  Status: QUARANTINED
  Timestamp: 2026-01-01T17:28:20.262Z
...
```

#### Test irl-sentinel

**User:** "Compute fingerprint for this payload: {\"total\": 100, \"currency\": \"USD\"}"

**Expected Response:**
```
[Uses compute_fingerprint tool]

Fingerprint: c8352fbb67ec6942...
No invariant violations detected.
```

#### Test irl-ai-proposer

**User:** "Generate a patch for field rename from 'username' to 'user_name'"

**Expected Response:**
```
[Uses generate_patch tool]

Generated patch:
[
  {
    "op": "rename",
    "path": "username",
    "target": "user_name"
  }
]
```

---

## Expected Output

After setup is complete:
- ✓ Claude Desktop can access all three MCP servers
- ✓ Tools are available in conversations
- ✓ Test commands execute successfully
- ✓ Resources are accessible (quarantine://, registry://, etc.)

---

## Troubleshooting

### MCP servers not showing in Claude Desktop

**Solution:** Check config file syntax

```bash
# Validate JSON syntax
cat "$CONFIG_FILE" | python3 -m json.tool
```

If syntax error:
```
Expecting property name enclosed in double quotes: line 5 column 3 (char 89)
```

Fix the JSON syntax and restart Claude Desktop.

### "command not found: node"

**Solution:** Ensure Node.js is in PATH

```bash
# Check Node.js installation
which node
node --version

# If not found, add to PATH or use absolute path
{
  "command": "/usr/local/bin/node",
  "args": ["/path/to/irl/irl/mcp/governance-server.js"]
}
```

### Server crashes immediately

**Solution:** Check server logs

```bash
# Manually run the server to see errors
node /path/to/irl/irl/mcp/governance-server.js
```

Common issues:
- `IRL_ROOT` environment variable not set
- Missing Node.js dependencies
- File permissions

### "IRL_ROOT not found"

**Solution:** Verify `IRL_ROOT` in config matches repository path

```bash
# Check actual path
pwd  # Run from IRL repository root

# Update config file with correct path
```

### AI-powered patch generation fails

**Solution:** Verify `ANTHROPIC_API_KEY` is set

```bash
# Test API key manually
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model": "claude-3-5-sonnet-20241022", "max_tokens": 1024, "messages": [{"role": "user", "content": "Hello"}]}'
```

If 401 error, API key is invalid. Generate new key at https://console.anthropic.com/

---

## Advanced Configuration

### Custom Port for MCP Servers

By default, MCP servers use stdio communication. For custom setups:

```json
{
  "irl-governance": {
    "command": "node",
    "args": ["/path/to/irl/irl/mcp/governance-server.js"],
    "env": {
      "IRL_ROOT": "/path/to/irl",
      "MCP_PORT": "8080"  // Optional custom port
    }
  }
}
```

### Multiple IRL Instances

To manage multiple IRL deployments:

```json
{
  "mcpServers": {
    "irl-governance-prod": {
      "command": "node",
      "args": ["/path/to/irl-prod/irl/mcp/governance-server.js"],
      "env": {"IRL_ROOT": "/path/to/irl-prod"}
    },
    "irl-governance-staging": {
      "command": "node",
      "args": ["/path/to/irl-staging/irl/mcp/governance-server.js"],
      "env": {"IRL_ROOT": "/path/to/irl-staging"}
    }
  }
}
```

---

## Usage Examples

### Auto-Approve Safe Patches

**User:** "Review all quarantined incidents for finance_integration and auto-approve simple field renamings"

**Claude:**
1. Uses `list_quarantined_incidents` to get all incidents
2. Uses `preview_incident` for each to analyze drift
3. Auto-approves incidents with only FIELD_ADDED + FIELD_REMOVED
4. Flags complex drift (TYPE_MISMATCH) for human review

### Proactive Validation in CI/CD

**User:** "Validate this payload before deployment: {\"total\": -10, \"currency\": \"USD\"}"

**Claude:**
1. Uses `compute_fingerprint` to check structure
2. Uses `validate_invariants` to check semantic rules
3. Reports: "❌ Invariant violation: total must be >= 0"
4. Blocks deployment

### Generate and Test Patches

**User:** "Generate a patch to rename 'amt' to 'total' and test it on this payload: {\"amt\": 100}"

**Claude:**
1. Uses `generate_patch` to create rename instruction
2. Uses `apply_patch_preview` to test patch
3. Shows healed payload: `{"total": 100}`
4. Confirms patch is safe to approve

---

## Related SOPs

- [agent-governance-automation.md](agent-governance-automation.md) - Automate incident workflows
- [incident-handling.md](incident-handling.md) - Manual incident review process
- [local-dev-setup.md](local-dev-setup.md) - Development environment setup

---

## Next Steps

1. Review [agent-governance-automation.md](agent-governance-automation.md) for automation patterns
2. Read [docs/MCP_WORKFLOWS.md](../docs/MCP_WORKFLOWS.md) for complete workflow examples
3. Experiment with tools in Claude Desktop conversations
