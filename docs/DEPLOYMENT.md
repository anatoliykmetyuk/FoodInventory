# Deployment Guide

This guide explains how to deploy the Food Inventory application to Vercel.

## Prerequisites

- A GitHub account
- A Vercel account (free tier is sufficient)
- Node.js 18+ installed locally (for testing)

## Deployment Steps

### 1. Prepare the Repository

Ensure your code is committed and pushed to a GitHub repository.

### 2. Deploy to Vercel

1. Go to [Vercel](https://vercel.com) and sign in with your GitHub account
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will automatically detect it's a Vite project
5. Configure the project:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
6. Click "Deploy"

### 3. Environment Variables

No environment variables are required for this application as it uses client-side storage and OpenAI API keys are stored locally in the browser.

### 4. Post-Deployment

After deployment, your application will be available at a URL like `https://your-project.vercel.app`.

## Local Development

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Running Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e
```

## GitHub Actions CI/CD

The project includes a GitHub Actions workflow (`.github/workflows/test.yml`) that:
- Runs on push to main/master branches
- Runs on pull requests
- Executes unit tests with Vitest
- Executes E2E tests with Playwright
- Uploads test results as artifacts

## Troubleshooting

### Build Failures

- Ensure all dependencies are installed: `npm install`
- Check TypeScript errors: `npm run build`
- Verify Node.js version is 18+

### Vercel Deployment Issues

- Check build logs in Vercel dashboard
- Ensure `package.json` has correct build scripts
- Verify all dependencies are listed in `package.json`

