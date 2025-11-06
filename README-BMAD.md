# BMAD - Bot-Managed Automated Development

## 🚀 Complete MCP-Based Development Automation

BMAD is a comprehensive system that automates the entire software development lifecycle using Model Context Protocol (MCP) servers for Jira and GitHub integration.

## ✨ What BMAD Does

- **Jira Issue Management**: Creates, updates, and tracks issues automatically
- **Git Operations**: Branch creation, commits, pushes via MCP
- **Pull Request Automation**: Creates PRs with proper descriptions and linking
- **Status Synchronization**: Keeps Jira and GitHub statuses in sync
- **Feature Implementation**: Automated code generation for common features

## 🛠️ Quick Setup

### 1. Prerequisites
```bash
# Required versions
node --version  # v18+
npm --version   # v8+
git --version   # v2.30+
```

### 2. Install MCP Servers
```bash
# Jira MCP Server
npm install -g @aashari/mcp-server-atlassian-jira

# GitHub MCP Server
npm install -g github-mcp-server
```

### 3. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit with your credentials
nano .env
```

### 4. Install Dependencies
```bash
npm install axios dotenv
```

### 5. Test Setup
```bash
# Test Jira MCP
source .env && npx @aashari/mcp-server-atlassian-jira ls-projects

# Test GitHub MCP
source .env && npx github-mcp-server git-status
```

## 🎯 Usage

### Run Complete Workflow
```bash
# Automate entire feature development
node complete-mcp-workflow.js "Add Dark Mode Toggle"
```

### Available Scripts
- `complete-mcp-workflow.js` - Full automation pipeline
- `enhanced-task-dates-workflow.js` - Task dates feature
- `dark-mode-mcp-workflow.js` - Dark mode feature

## 📖 Documentation

For detailed setup instructions, see:
- **[BMAD-MCP-SETUP-GUIDE.md](BMAD-MCP-SETUP-GUIDE.md)** - Complete setup guide
- **[.env.example](.env.example)** - Environment variables template

## 🔧 Key Components

### MCP Servers Used
- **@aashari/mcp-server-atlassian-jira**: Jira operations
- **github-mcp-server**: Git repository operations

### Workflow Phases
1. **Jira Issue Creation** → Creates feature tickets
2. **Git Branch Setup** → Creates feature branches
3. **Development** → Implements features automatically
4. **Commit & Push** → Commits changes via MCP
5. **PR Creation** → Creates pull requests
6. **Status Sync** → Updates Jira when PR merges

## 🏗️ Architecture

```
BMAD Workflow
├── 📊 Jira MCP Server
│   ├── Issue Creation
│   ├── Status Transitions
│   └── Comment Management
├── 🐙 GitHub MCP Server
│   ├── Branch Operations
│   ├── Commit Management
│   └── Repository Status
├── 🔄 Direct API Calls
│   ├── PR Creation/Monitoring
│   └── GitHub Webhooks
└── 🤖 Automation Scripts
    ├── Feature Implementation
    ├── Error Handling
    └── Status Synchronization
```

## 🚀 Features Demonstrated

- ✅ **Dark Mode Toggle**: Complete UI feature with state management
- ✅ **Enhanced Task Dates**: Date picker and formatting
- ✅ **Mark All Complete**: Bulk operations with confirmation
- ✅ **Priority Color Indicators**: Visual priority coding

## 🔒 Security

- Environment variables for all credentials
- Token scope limitations
- No secrets in version control
- Secure API communication

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/your-feature`
3. Run BMAD workflow: `node complete-mcp-workflow.js "Your Feature"`
4. Test thoroughly
5. Create pull request

## 📄 License

This project demonstrates MCP-based automation techniques. See individual MCP server licenses for usage terms.

---

**Built with ❤️ using MCP Protocol**</content>
<parameter name="filePath">/Users/disandup/Desktop/BMAD Github/BMAD-MCP-JIRA-Company/README-BMAD.md
