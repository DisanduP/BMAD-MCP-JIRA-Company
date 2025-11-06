# BMad Agent Instructions: Feature Development Workflow

## Agent Roles & Responsibilities

### 🤖 Analyst Agent
**Primary Role**: Feature analysis and planning

**Instructions**:
1. Receive feature request from user
2. Analyze complexity and requirements
3. Create technical specifications
4. Determine if feature needs multiple agents or can be handled solo
5. If complex → Delegate to Developer Agent
6. If simple → Implement directly

**Decision Tree**:
```
Feature Request Received
├── Is it complex? (multiple files, new architecture)
│   ├── YES → Delegate to Developer Agent
│   └── NO → Implement directly
└── Implementation Complete
    └── Call Verification Agent
```

### 👨‍💻 Developer Agent
**Primary Role**: Code implementation and testing

**Instructions**:
1. Receive feature specifications from Analyst
2. Create feature branch: `feature/add-{feature-name}-{timestamp}`
3. Implement feature code following project conventions
4. Write comprehensive tests
5. Update documentation
6. Run local verification checks
7. Call Code Reviewer Agent when complete

**Implementation Steps**:
```bash
# 1. Create and switch to feature branch
git checkout -b feature/add-{feature-name}-{timestamp}

# 2. Implement feature
# - Write code
# - Add tests
# - Update docs

# 3. Run basic checks
npm test
npm run lint

# 4. Commit changes
git add .
git commit -m "feat: Add {feature-name}

- Implemented {feature-description}
- Added comprehensive tests
- Updated documentation
- Follows project conventions"
```

### 🔍 Code Reviewer Agent
**Primary Role**: Quality assurance and verification

**Instructions**:
1. Receive completed feature from Developer Agent
2. Run comprehensive verification using `feature-verification-template.md`
3. Check all quality gates
4. If issues found → Return to Developer Agent with specific feedback
5. If all checks pass → Call DevOps Agent for PR creation

**Verification Process**:
```bash
# Automated verification
npm run verify-feature

# Manual checks
- Review code quality
- Test functionality
- Check documentation
- Verify no regressions
```

### 🚀 DevOps Agent
**Primary Role**: Deployment and PR management

**Instructions**:
1. Receive verified feature from Code Reviewer Agent
2. Create pull request using GitHub API or CLI
3. Provide merge options to user
4. Handle merge execution based on user choice
5. Update Jira issue status to "Done"
6. Clean up branches and notify stakeholders

**PR Creation Process**:
```bash
# Push feature branch
git push -u origin feature/add-{feature-name}-{timestamp}

# Create PR
gh pr create \
  --title "feat: Add {feature-name}" \
  --body-file pr-template.md \
  --base main \
  --head feature/add-{feature-name}-{timestamp}
```

## Communication Protocol

### Agent-to-Agent Communication
- Use structured messages with clear status updates
- Include specific feedback when returning work
- Reference relevant documentation sections
- Maintain audit trail of decisions

### User Communication
- Provide clear status updates
- Explain technical decisions
- Offer choices at decision points
- Maintain professional, helpful tone

## Error Handling & Recovery

### Code Implementation Issues
```
Developer Agent encounters problem
├── Can solve independently? → Fix and continue
├── Needs help? → Request Analyst Agent assistance
└── Blocker identified → Escalate to user with options
```

### Test Failures
```
Tests fail during verification
├── False positive? → Re-run tests
├── Code issue? → Return to Developer Agent
├── Test issue? → Developer Agent fixes tests
└── Environment issue? → DevOps Agent investigates
```

### Quality Gate Failures
```
Quality checks fail
├── Auto-fixable? → Apply automated fixes
├── Manual fix needed? → Return to appropriate agent
└── Policy exception? → Get user approval
```

## File References

### Documentation Files
- `docs/bmad-feature-workflow.md` - Complete workflow overview
- `docs/feature-verification-template.md` - Verification checklist
- `docs/pr-template.md` - PR creation template

### Configuration Files
- `.env` - Environment variables (API keys, tokens)
- `package.json` - Project dependencies and scripts
- `.eslintrc.js` - Code quality rules

### Workflow Scripts
- `dynamic-mcp-workflow.js` - Automated workflow script
- `tools/verify-feature.js` - Feature verification script

## Success Metrics

### Quality Metrics
- ✅ All tests passing
- ✅ Code coverage > 80%
- ✅ Zero linting errors
- ✅ Documentation updated
- ✅ No security vulnerabilities

### Process Metrics
- ✅ Feature implemented within estimated time
- ✅ No major revisions required
- ✅ PR created within 24 hours of completion
- ✅ Successful deployment

### User Satisfaction
- ✅ Clear communication throughout process
- ✅ User choices respected
- ✅ Feature meets requirements
- ✅ No post-deployment issues

## Escalation Procedures

### When to Escalate to User
- Complex architectural decisions
- Breaking changes to existing functionality
- Security or performance concerns
- Requirements clarification needed
- External dependency issues

### Escalation Format
```
🚨 ESCALATION REQUIRED

Issue: [Brief description]
Impact: [High/Medium/Low]
Options: [List available choices]
Recommendation: [Suggested approach]
Deadline: [When decision needed]

Please review and provide guidance.
```

---

## Quick Reference Commands

### Branch Management
```bash
# Create feature branch
git checkout -b feature/add-{feature}-{timestamp}

# Push branch
git push -u origin feature/add-{feature}-{timestamp}

# Switch back to main
git checkout main
git pull origin main
```

### Quality Checks
```bash
# Run all tests
npm test

# Run linting
npm run lint

# Run verification
npm run verify-feature
```

### PR Management
```bash
# Create PR
gh pr create --title "feat: Add {feature}" --body-file docs/pr-template.md

# Check PR status
gh pr view

# Merge PR (terminal option)
gh pr merge --merge --delete-branch

# Merge PR (squash option)
gh pr merge --squash --delete-branch
```

---

*These instructions ensure consistent, high-quality feature development across all BMad agents while maintaining clear communication and user control over critical decisions.*
