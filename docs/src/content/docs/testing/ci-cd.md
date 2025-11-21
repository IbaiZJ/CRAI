---
title: CI/CD Pipeline
description: Automated testing and deployment with GitHub Actions
---

CRAI uses GitHub Actions for continuous integration and deployment.

## Workflows

### AI Backend Tests

**File:** `.github/workflows/ai-backend-tests.yml`

Runs on:
- Push to `main` branch
- Pull requests to `main`
- Changes in `ai/` directory

**Steps:**
1. Checkout code
2. Setup Python 3.13
3. Install dependencies
4. Run pytest with coverage
5. Upload coverage reports

**Badge:**
[![AI Backend Tests](https://github.com/IbaiZJ/CRAI/actions/workflows/ai-backend-tests.yml/badge.svg)](https://github.com/IbaiZJ/CRAI/actions/workflows/ai-backend-tests.yml)

### Frontend CI

**File:** `.github/workflows/frontend-ci.yml`

Runs on:
- Push to `main` branch
- Pull requests to `main`

**Steps:**
1. Checkout code
2. Setup Node.js 20
3. Install dependencies
4. Run linter
5. Run tests
6. Build application

**Badge:**
[![Frontend CI](https://github.com/IbaiZJ/CRAI/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/IbaiZJ/CRAI/actions/workflows/frontend-ci.yml)

### SonarCloud Analysis

**File:** `.github/workflows/sonarCloud.yml`

Analyzes:
- Code quality
- Security vulnerabilities
- Code coverage
- Technical debt

## Viewing Results

1. Go to repository on GitHub
2. Click **Actions** tab
3. Select workflow run
4. View logs and artifacts

## Artifacts

The following artifacts are saved:
- Coverage reports (30 days retention)
- Test results
- Build outputs

## Branch Protection

Recommended settings for `main` branch:
- ☑️ Require status checks before merging
- ☑️ Require `AI Backend Tests` to pass
- ☑️ Require `Frontend CI` to pass

## Next Steps

- View [Testing Overview](/testing/overview/)
- Learn about [Deployment](/deployment/production/)
