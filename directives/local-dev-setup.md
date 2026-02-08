# SOP: Local Development Setup

Set up a complete local development environment for IRL.

## Overview

This procedure installs all dependencies and configures your local machine for IRL development, including:
- Node.js runtime and npm packages
- Python client environment
- Java SDK (optional)
- Architecture validation agent
- MCP servers for Claude Desktop

## Prerequisites

- **Operating System:** Linux, macOS, or WSL2 (Windows)
- **Node.js:** Version 20+ ([Download](https://nodejs.org/))
- **Python:** Version 3.8+ (for client development)
- **Java:** JDK 11+ (optional, for Java client development)
- **Git:** Installed and configured

## Procedure

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/irl.git
cd irl
```

**Expected Output:**
```
Cloning into 'irl'...
remote: Enumerating objects: ...
```

### 2. Install Node.js Dependencies

```bash
# Install packages for architecture validation agent
cd agents
npm install

cd ..
```

**Expected Output:**
```
added 47 packages, and audited 48 packages in 3s
```

### 3. Install Website Dependencies (Optional)

```bash
cd website
npm install
cd ..
```

**Expected Output:**
```
added 156 packages in 8s
```

### 4. Set Up Python Client Environment

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# No dependencies needed - client uses stdlib only
# Verify client is importable
python3 -c "from clients.python.irl import Firewall; print('✓ Python client ready')"
```

**Expected Output:**
```
✓ Python client ready
```

### 5. Set Up Environment Variables

```bash
# Create .env file (do NOT commit this file)
cat > .env << 'EOF'
# Anthropic API Key (required for architecture validation and MCP AI Proposer)
ANTHROPIC_API_KEY=your_api_key_here

# Optional: Email notifications for architecture validation
IRL_VALIDATION_EMAIL=your-email@example.com

# Optional: Slack webhook for notifications
IRL_VALIDATION_SLACK_WEBHOOK=https://hooks.slack.com/services/...

# Optional: Auto-push architecture reports to git
IRL_VALIDATION_AUTO_PUSH=false
EOF

# Load environment variables
export $(cat .env | xargs)
```

**Expected Output:**
```
(no output - file created successfully)
```

### 6. Verify Installation

```bash
# Test architecture validation agent
node agents/test-agent.js
```

**Expected Output:**
```
✅ All tests passed! Agent is ready to use.
```

### 7. Create Local Directories

```bash
# Create runtime directories (ignored by git)
mkdir -p registry quarantine released patches neo4j
```

**Expected Output:**
```
(no output - directories created)
```

### 8. Optional: Install Java Client Dependencies

```bash
# Java client has zero dependencies - uses java.net.http
# Verify Java is installed
java -version
javac -version
```

**Expected Output:**
```
openjdk version "11.0.x" ...
javac 11.0.x
```

## Expected Output

After completing all steps, you should have:
- ✓ Repository cloned
- ✓ Node.js dependencies installed
- ✓ Python client environment configured
- ✓ Environment variables set
- ✓ Architecture validation agent tested
- ✓ Runtime directories created

## Troubleshooting

### "npm: command not found"

**Solution:** Install Node.js from https://nodejs.org/

```bash
# Verify Node.js installation
node --version
npm --version
```

### "python3: command not found"

**Solution:** Install Python 3.8+

```bash
# Ubuntu/Debian
sudo apt-get install python3 python3-venv

# macOS (using Homebrew)
brew install python3

# Verify installation
python3 --version
```

### "Cannot import Firewall"

**Solution:** Ensure you're in the repository root when importing

```bash
cd /path/to/irl
python3 -c "from clients.python.irl import Firewall; print('OK')"
```

### "ANTHROPIC_API_KEY not set"

**Solution:** Export the environment variable

```bash
export ANTHROPIC_API_KEY='sk-ant-...'
echo $ANTHROPIC_API_KEY  # Verify it's set
```

### Architecture validation test fails with 401

**Solution:** Your API key is invalid or expired

1. Go to https://console.anthropic.com/
2. Generate a new API key
3. Update `.env` file
4. Re-export: `export $(cat .env | xargs)`

## Related SOPs

- [deploy.md](deploy.md) - Deploy IRL to GitHub Actions or cron
- [mcp-server-setup.md](mcp-server-setup.md) - Configure MCP servers
- [architecture-validation.md](architecture-validation.md) - Run validation agent
- [api-usage.md](api-usage.md) - Use Python/Java clients

## Next Steps

After setup is complete:
1. Review [architecture-validation.md](architecture-validation.md) to run your first validation
2. Read [api-usage.md](api-usage.md) to learn how to use the clients
3. Explore [mcp-server-setup.md](mcp-server-setup.md) for agent-driven workflows
