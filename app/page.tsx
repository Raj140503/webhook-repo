import { GitHubWebhookDashboard } from "@/components/github-webhook-dashboard"
import { CustomFooter } from "@/components/custom-footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1">
        <div className="container mx-auto py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight">GitHub Webhook Dashboard</h1>
            <p className="text-muted-foreground mt-2">Monitor GitHub repository events (Push, Pull Request, Merge)</p>
          </div>
          <GitHubWebhookDashboard />
        </div>
      </main>
      <CustomFooter />
    </div>
  )
}
