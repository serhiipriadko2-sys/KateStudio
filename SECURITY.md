# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them via:
- GitHub's private vulnerability reporting feature
- Email: security@k-sebe-yoga.com

### What to Include

- Type of vulnerability (XSS, SQL injection, auth bypass, etc.)
- Full paths of affected source files
- Step-by-step reproduction instructions
- Proof-of-concept or exploit code (if possible)
- Impact assessment

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Resolution Target**: Within 30 days

## Security Best Practices

### For Contributors

1. **Never commit secrets** - Use `.env` files and GitHub Secrets
2. **Keep dependencies updated** - Review dependabot alerts
3. **Code review required** - All PRs need approval

### Known Security Considerations

| Item | Status | Notes |
|------|--------|-------|
| Gemini API Key | Client-side | Rate limited by Google |
| Supabase Anon Key | Public by design | Protected by RLS |
| User Data | Protected | Row Level Security enabled |

## Security Features

- Supabase Auth with secure sessions
- Row Level Security (RLS) on all tables
- HTTPS for all communications
- Input validation and sanitization

---

Thank you for helping keep K Sebe Yoga Studio safe!
