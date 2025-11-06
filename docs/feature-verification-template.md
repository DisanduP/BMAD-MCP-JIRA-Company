# Feature Verification Template

## Feature Information
- **Feature Name**: [Feature description]
- **Branch Name**: feature/add-[feature-name]-[timestamp]
- **Jira Issue**: [JIRA-XXX]
- **Assigned Agent**: [Agent Name]
- **Verification Date**: [YYYY-MM-DD]

## Implementation Checklist

### ✅ Code Implementation Status
- [ ] Feature code is fully implemented
- [ ] No TODO/FIXME comments remain in code
- [ ] No console.log/debug statements (except necessary ones)
- [ ] Code follows project style guidelines
- [ ] Error handling implemented
- [ ] Edge cases covered

### ✅ Testing Status
- [ ] Unit tests written and passing
- [ ] Integration tests written and passing
- [ ] Manual testing completed
- [ ] Cross-browser testing done (if applicable)
- [ ] Mobile responsiveness tested (if applicable)
- [ ] No test regressions introduced

### ✅ Documentation Status
- [ ] Code has proper JSDoc/comments
- [ ] README updated with new features
- [ ] API documentation updated
- [ ] Breaking changes documented
- [ ] Migration guide created (if needed)

### ✅ Quality Assurance
- [ ] ESLint passes with no errors
- [ ] Code coverage meets requirements (>80%)
- [ ] Security scan passes
- [ ] Performance benchmarks pass
- [ ] Bundle size within limits

### ✅ Integration Status
- [ ] Database migrations created (if needed)
- [ ] Environment variables documented
- [ ] Dependencies updated in package.json
- [ ] Build process works correctly
- [ ] Deployment configuration updated

## Verification Results

### Automated Checks
```bash
# Run this command to verify implementation
npm run verify-feature

# Expected output:
✅ Code implementation: COMPLETE
✅ Testing: ALL PASSING
✅ Documentation: UPDATED
✅ Quality gates: PASSED
✅ Integration: READY
```

### Manual Verification Steps
1. **Start the application**
   ```bash
   npm start
   ```

2. **Test the feature**
   - [ ] Feature works as expected
   - [ ] UI/UX is intuitive
   - [ ] No console errors
   - [ ] Performance is acceptable

3. **Test edge cases**
   - [ ] Error scenarios handled gracefully
   - [ ] Loading states work properly
   - [ ] Offline functionality (if applicable)

## Pull Request Readiness

### PR Creation Checklist
- [ ] Feature branch is up to date with main
- [ ] No merge conflicts exist
- [ ] Commit messages follow conventional format
- [ ] Branch naming follows convention: `feature/add-{feature}-{timestamp}`

### PR Content Template
```markdown
## 🚀 Feature: [Feature Name]

### ✨ What's New
- [Brief description of the feature]
- [Key benefits]
- [User impact]

### 🔧 Technical Details
- [Architecture changes]
- [New dependencies]
- [Database changes]
- [API changes]

### 🧪 Testing
- [Testing approach]
- [Coverage details]
- [Manual test steps]

### 📋 Related Issues
- Closes [JIRA-XXX]
- Related to #[PR numbers]

### 🏷️ Labels
- enhancement
- frontend/backend
- [priority level]

*🤖 This PR was created automatically by the BMad workflow system*
```

## Merge Decision

### Option A: Terminal Merge
```bash
# Check PR status
gh pr view

# Merge with squash
gh pr merge --squash --delete-branch

# Or merge with merge commit
gh pr merge --merge --delete-branch
```

### Option B: GitHub Web Interface
- Navigate to PR URL
- Review all changes
- Request reviews if needed
- Approve and merge through GitHub UI
- Delete branch after merge

## Post-Merge Actions

### Automated
- [ ] Jira issue moved to "Done"
- [ ] Branch deleted
- [ ] Deployment triggered
- [ ] Notifications sent

### Manual
- [ ] Update changelog
- [ ] Notify stakeholders
- [ ] Monitor deployment
- [ ] Create follow-up tasks if needed

## Verification Signature

**Verified By**: [Agent Name]  
**Verification Status**: [✅ READY / ❌ NEEDS WORK]  
**Comments**: [Any additional notes or concerns]

---

## Emergency Rollback Plan

If issues are discovered after merge:

1. **Immediate rollback**
   ```bash
   git revert HEAD --no-edit
   git push origin main
   ```

2. **Create hotfix branch**
   ```bash
   git checkout -b hotfix/issue-description
   # Fix the issue
   git commit -m "fix: resolve issue description"
   git push origin hotfix/issue-description
   ```

3. **Create new PR for hotfix**

---

*This template ensures comprehensive feature verification before PR creation and provides clear merge options for seamless deployment.*
