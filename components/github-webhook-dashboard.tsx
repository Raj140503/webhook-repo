"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { RefreshCw, GitBranch, GitPullRequest, GitMerge, Activity, Copy, Loader2, Github } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { DatabaseInit } from "@/components/database-init"

interface GitHubEvent {
  id: string
  action: "push" | "pull_request" | "merge"
  author: string
  from_branch?: string
  to_branch: string
  timestamp: string
  request_id: string
}

export function GitHubWebhookDashboard() {
  const [events, setEvents] = useState<GitHubEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [webhookUrl, setWebhookUrl] = useState("")
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchEvents()
    // Set the webhook URL based on current domain
    if (typeof window !== "undefined") {
      setWebhookUrl(`${window.location.origin}/api/github/webhook`)
    }

    // Auto-refresh every 15 seconds as per requirements
    const interval = setInterval(fetchEvents, 15000)
    return () => clearInterval(interval)
  }, [])

  const fetchEvents = async () => {
    try {
      setError(null)
      const response = await fetch("/api/github/events")
      const data = await response.json()

      if (response.ok) {
        setEvents(data.events || [])
      } else {
        setError(data.message || "Failed to fetch events")
      }
    } catch (error) {
      console.error("Failed to fetch events:", error)
      setError("Network error while fetching events")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const refreshEvents = async () => {
    setRefreshing(true)
    await fetchEvents()
  }

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl)
    toast({
      title: "Copied!",
      description: "GitHub webhook URL copied to clipboard",
    })
  }

  const formatEventMessage = (event: GitHubEvent) => {
    const timestamp = new Date(event.timestamp).toLocaleString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    })

    switch (event.action) {
      case "push":
        return `"${event.author}" pushed to "${event.to_branch}" on ${timestamp}`
      case "pull_request":
        return `"${event.author}" submitted a pull request from "${event.from_branch}" to "${event.to_branch}" on ${timestamp}`
      case "merge":
        return `"${event.author}" merged branch "${event.from_branch}" to "${event.to_branch}" on ${timestamp}`
      default:
        return `"${event.author}" performed ${event.action} on ${timestamp}`
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case "push":
        return <GitBranch className="w-4 h-4" />
      case "pull_request":
        return <GitPullRequest className="w-4 h-4" />
      case "merge":
        return <GitMerge className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case "push":
        return "bg-blue-500"
      case "pull_request":
        return "bg-green-500"
      case "merge":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Github className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pushes</CardTitle>
            <GitBranch className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{events.filter((e) => e.action === "push").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pull Requests</CardTitle>
            <GitPullRequest className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {events.filter((e) => e.action === "pull_request").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Merges</CardTitle>
            <GitMerge className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {events.filter((e) => e.action === "merge").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Database Initialization */}
      <DatabaseInit />

      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">GitHub Events</TabsTrigger>
          <TabsTrigger value="configuration">Webhook Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Recent GitHub Events</h2>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                Auto-refresh: 15s
              </Badge>
              <Button onClick={refreshEvents} variant="outline" size="sm" disabled={refreshing}>
                {refreshing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Refresh
              </Button>
            </div>
          </div>

          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 text-red-800">
                  <Activity className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              </CardContent>
            </Card>
          )}

          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 mx-auto animate-spin mb-4" />
                  <p>Loading GitHub events...</p>
                </div>
              ) : events.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Github className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">No GitHub events yet</p>
                    <p className="text-sm text-muted-foreground">
                      Configure your GitHub repository webhook to start receiving events
                    </p>
                  </CardContent>
                </Card>
              ) : (
                events.map((event) => (
                  <Card key={event.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start space-x-4">
                        <div
                          className={`w-8 h-8 rounded-full ${getActionColor(event.action)} flex items-center justify-center text-white`}
                        >
                          {getActionIcon(event.action)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium leading-relaxed">{formatEventMessage(event)}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {event.action.replace("_", " ").toUpperCase()}
                            </Badge>
                            <span className="text-xs text-muted-foreground">ID: {event.request_id}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>GitHub Webhook Configuration</CardTitle>
              <CardDescription>Set up your GitHub repository to send webhooks to this endpoint</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <div className="flex space-x-2">
                  <Input id="webhook-url" value={webhookUrl} readOnly className="font-mono" />
                  <Button onClick={copyWebhookUrl} variant="outline" size="icon">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">Use this URL in your GitHub repository webhook settings</p>
              </div>

              <div className="space-y-4">
                <Label>GitHub Webhook Setup Instructions</Label>
                <div className="space-y-3 text-sm">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">1. Go to your GitHub repository</h4>
                    <p className="text-muted-foreground">Navigate to Settings → Webhooks → Add webhook</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">2. Configure the webhook</h4>
                    <ul className="text-muted-foreground space-y-1">
                      <li>• Payload URL: Use the webhook URL above</li>
                      <li>• Content type: application/json</li>
                      <li>• Secret: Optional (set WEBHOOK_SECRET env var)</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">3. Select events</h4>
                    <ul className="text-muted-foreground space-y-1">
                      <li>• Pushes</li>
                      <li>• Pull requests</li>
                      <li>• Pull request reviews (for merge detection)</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Supported GitHub Events</Label>
                <div className="grid grid-cols-1 gap-2">
                  <Badge variant="secondary" className="justify-start">
                    <GitBranch className="w-3 h-3 mr-2" />
                    Push Events
                  </Badge>
                  <Badge variant="secondary" className="justify-start">
                    <GitPullRequest className="w-3 h-3 mr-2" />
                    Pull Request Events
                  </Badge>
                  <Badge variant="secondary" className="justify-start">
                    <GitMerge className="w-3 h-3 mr-2" />
                    Merge Events (via PR merge)
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
