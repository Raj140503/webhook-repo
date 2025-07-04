# GitHub Webhook Dashboard

A comprehensive GitHub webhook handling system built with Next.js, TypeScript, and Neon Database. This project monitors GitHub repository events (Push, Pull Request, Merge) and displays them in a clean, minimal UI.

## 🎯 **Project Overview**

This project fulfills the developer assessment task requirements:

- **GitHub Webhook Integration**: Automatically receives GitHub events (Push, Pull Request, Merge)
- **Database Storage**: Stores events in PostgreSQL (Neon) with the required schema
- **Real-time UI**: Displays events in the specified format with 15-second auto-refresh
- **Clean Design**: Minimal, responsive interface for monitoring repository activity

## 📋 **Features**

### GitHub Event Handling
- ✅ **Push Events**: `{author} pushed to {to_branch} on {timestamp}`
- ✅ **Pull Request Events**: `{author} submitted a pull request from {from_branch} to {to_branch} on {timestamp}`
- ✅ **Merge Events**: `{author} merged branch {from_branch} to {to_branch} on {timestamp}`

### Technical Features
- 🔒 **Secure webhook handling** with GitHub signature verification
- 📊 **Real-time dashboard** with auto-refresh every 15 seconds
- 🗄️ **Database storage** matching the required schema
- 🎨 **Clean, minimal UI** with proper event formatting
- 📱 **Responsive design** for all devices

## 🗄️ **Database Schema**

The system uses PostgreSQL with the following schema (matching MongoDB requirements):

\`\`\`sql
github_events (
  id VARCHAR(255) PRIMARY KEY,
  action VARCHAR(50) NOT NULL,           -- "push", "pull_request", "merge"
  author VARCHAR(255) NOT NULL,          -- GitHub username
  from_branch VARCHAR(255),              -- Source branch (null for push)
  to_branch VARCHAR(255) NOT NULL,       -- Target branch
  timestamp TIMESTAMP NOT NULL,          -- Event timestamp
  request_id VARCHAR(255) NOT NULL       -- GitHub delivery ID
)
\`\`\`

## 🚀 **Getting Started**

### Prerequisites
- Node.js 18+
- A Neon database (or any PostgreSQL database)
- GitHub repository for testing webhooks

### Installation

1. **Clone and install**:
   \`\`\`bash
   npm install
   \`\`\`

2. **Set up environment variables**:
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   
   Update the following variables:
   - `DATABASE_URL`: Your Neon database connection string
   - `WEBHOOK_SECRET`: GitHub webhook secret (optional but recommended)

3. **Initialize the database**:
   - Start the development server: `npm run dev`
   - Visit [http://localhost:3000](http://localhost:3000)
   - Click "Initialize Database Tables" in the dashboard

4. **Configure GitHub webhook**:
   - Go to your GitHub repository → Settings → Webhooks
   - Add webhook with URL: `https://your-app.vercel.app/api/github/webhook`
   - Select events: Pushes, Pull requests
   - Set content type: `application/json`
   - Add secret if using `WEBHOOK_SECRET`

## 📡 **API Endpoints**

### GitHub Webhook Endpoints
- `POST /api/github/webhook` - Main GitHub webhook endpoint
- `GET /api/github/webhook` - Health check for webhook endpoint
- `GET /api/github/events` - Retrieve stored GitHub events
- `POST /api/init` - Initialize database tables

### Event Processing

The system processes the following GitHub events:

1. **Push Events** (`push`):
   - Captures: author, target branch, timestamp
   - Format: "Travis" pushed to "staging" on 1st April 2021 - 9:30 PM UTC

2. **Pull Request Events** (`pull_request` with action `opened`):
   - Captures: author, source branch, target branch, timestamp
   - Format: "Travis" submitted a pull request from "staging" to "master" on 1st April 2021 - 9:00 AM UTC

3. **Merge Events** (`pull_request` with action `closed` and `merged: true`):
   - Captures: author, source branch, target branch, timestamp
   - Format: "Travis" merged branch "dev" to "master" on 2nd April 2021 - 12:00 PM UTC

## 🎨 **UI Features**

### Dashboard Components
- **Statistics Cards**: Total events, pushes, pull requests, merges
- **Event Timeline**: Chronological list of GitHub events
- **Auto-refresh**: Updates every 15 seconds automatically
- **Event Formatting**: Displays events in the exact required format

### Configuration Panel
- **Webhook URL**: Copy-paste ready webhook URL
- **Setup Instructions**: Step-by-step GitHub webhook configuration
- **Event Types**: Visual indicators for different event types

## 🔧 **Deployment**

### Deploy to Vercel

1. **Push to GitHub**: Commit your code to a Git repository
2. **Connect to Vercel**: Import your repository in Vercel dashboard
3. **Set Environment Variables**:
   - `DATABASE_URL`: Your Neon database connection string
   - `WEBHOOK_SECRET`: GitHub webhook secret (optional)
4. **Deploy**: Vercel will automatically build and deploy

### Post-Deployment Setup

1. **Initialize Database**: Visit your deployed app and click "Initialize Database Tables"
2. **Configure GitHub Webhook**: Use the deployed URL in your GitHub repository webhook settings
3. **Test**: Make a push, create a PR, or merge to see events appear

## 🧪 **Testing**

### Manual Testing
1. **Push to repository**: Make a commit and push to any branch
2. **Create Pull Request**: Open a PR between branches
3. **Merge Pull Request**: Complete a PR merge
4. **Check Dashboard**: Events should appear within 15 seconds

### Event Format Verification
The dashboard displays events in the exact format specified:
- Push: `"Travis" pushed to "staging" on 1st April 2021 - 9:30 PM UTC`
- PR: `"Travis" submitted a pull request from "staging" to "master" on 1st April 2021 - 9:00 AM UTC`
- Merge: `"Travis" merged branch "dev" to "master" on 2nd April 2021 - 12:00 PM UTC`

## 📝 **Assessment Requirements Checklist**

- ✅ GitHub webhook integration for Push, Pull Request, Merge events
- ✅ Database storage with required schema (PostgreSQL instead of MongoDB)
- ✅ UI polling every 15 seconds
- ✅ Exact event format display as specified
- ✅ Clean, minimal design
- ✅ Proper error handling and logging
- ✅ Deployment-ready configuration

## 🔗 **Repository Structure**

This project serves as the **webhook-repo** mentioned in the assessment. You'll need to create a separate **action-repo** for testing the webhooks.

## 📞 **Support**

For any issues or questions:
1. Check the browser console for error messages
2. Verify environment variables are set correctly
3. Ensure database is initialized
4. Test webhook endpoint health at `/api/github/webhook`

## 📄 **License**

MIT License - see LICENSE file for details.
