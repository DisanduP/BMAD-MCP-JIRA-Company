# BMad Feature Development Workflow

## Overview
This document outlines the automated feature development workflow using BMad agents with GitHub integration. The workflow ensures features are properly developed, tested, and deployed through automated pull request management.

## Workflow Steps

### Phase 1: Feature Analysis & Planning
**Agent: Analyst**
- Analyze the feature request
- Determine implementation complexity
- Create technical specifications
- Estimate development time

### Phase 2: Branch Creation & Development
**Agent: Developer**
- Create feature branch: `feature/add-{feature-name}-{timestamp}`
- Implement the feature code
- Add comprehensive tests
- Update documentation

### Phase 3: Code Quality Verification
**Agent: Code Reviewer**
- Run automated tests
- Check code quality metrics
- Verify functionality
- Ensure no breaking changes

### Phase 4: Pull Request Creation
**Agent: DevOps**
- Verify feature implementation is complete
- Check for any open issues or TODOs
- Create detailed pull request
- Add proper labels and reviewers

### Phase 5: PR Review & Merge
**Interactive Choice:**
- **Option A**: Terminal merge approval
- **Option B**: GitHub web interface merge

---

## Feature Verification Checklist

Before creating a PR, ensure:

### ✅ Code Implementation
- [ ] Feature code is fully implemented
- [ ] No TODO comments remain
- [ ] No console.log statements (except for debugging)
- [ ] Code follows project conventions

### ✅ Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] No regressions introduced

### ✅ Documentation
- [ ] Code is properly documented
- [ ] README updated if needed
- [ ] API documentation updated
- [ ] Breaking changes documented

### ✅ Quality Gates
- [ ] Linting passes
- [ ] Code coverage meets requirements
- [ ] Security scan passes
- [ ] Performance benchmarks pass

---

## Automated PR Creation Process

### Step 1: Branch Verification
```bash
# Check current branch
git branch --show-current

# Verify feature implementation
git log --oneline -10
git status
```

### Step 2: Code Quality Check
```bash
# Run tests
npm test

# Run linting
npm run lint

# Check for TODOs
grep -r "TODO\|FIXME\|XXX" src/ --exclude-dir=node_modules
```

### Step 3: PR Creation
```bash
# Create PR with GitHub CLI or API
gh pr create \
  --title "feat: Add {feature-name}" \
  --body "Automated PR for {feature-description}" \
  --base main \
  --head feature/add-{feature-name}-{timestamp}
```

### Step 4: Merge Options

#### Option A: Terminal Merge
```bash
# Check PR status
gh pr view {PR_NUMBER}

# Approve and merge
gh pr merge {PR_NUMBER} --merge --delete-branch
```

#### Option B: GitHub Web Interface
- Open PR URL in browser
- Review changes
- Approve and merge through GitHub UI
- Delete branch after merge

---

## Agent Responsibilities

### Analyst Agent
- Feature analysis and planning
- Complexity assessment
- Technical specification creation

### Developer Agent
- Code implementation
- Test creation
- Documentation updates

### Code Reviewer Agent
- Quality assurance
- Test execution
- Code review

### DevOps Agent
- Branch management
- PR creation
- Deployment coordination

---

## Error Handling

### If Feature Not Fully Implemented
- Return to Developer Agent
- Add TODO comments for remaining work
- Re-run verification checks

### If Tests Fail
- Notify Developer Agent
- Provide test failure details
- Block PR creation until resolved

### If Quality Gates Fail
- Run automated fixes where possible
- Notify appropriate agent for manual fixes
- Re-run quality checks

---

## Success Metrics

- ✅ Feature fully implemented
- ✅ All tests passing
- ✅ Code quality standards met
- ✅ Documentation updated
- ✅ PR created and ready for merge
- ✅ Successful deployment

---

## Integration Points

- **GitHub API**: Branch management, PR creation
- **Jira API**: Issue tracking and status updates
- **CI/CD Pipeline**: Automated testing and quality gates
- **Slack/Discord**: Notification system for reviews

---

*This workflow ensures consistent, high-quality feature development with automated quality assurance and streamlined deployment processes.*
