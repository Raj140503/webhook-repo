"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { RefreshCw, Webhook, Activity, AlertCircle, CheckCircle, Copy, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { DatabaseInit } from "@/components/database-init"

interface WebhookEvent {
  id: string
  event_type: string
  payload: any
  headers: Record<string, string>
  status: "success" | "failed" | "pending"
  created_at: string
  processed_at?: string
  error_message?: string
}

export function WebhookDashboard() {
  const [events, setEvents] = useState<WebhookEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [testing, setTesting] = useState(false)
  const [webhookUrl, setWebhookUrl] = useState("")
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchEvents()
    // Set the webhook URL based on current domain
    if (typeof window !== "undefined") {
      setWebhookUrl(`${window.location.origin}/api/webhooks/generic`)
    }
  }, [])

  const fetchEvents = async () => {
    try {
      setError(null)
      const response = await fetch("/api/webhooks/events")
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
      description: "Webhook URL copied to clipboard",
    })
  }

  const testWebhook = async () => {
    setTesting(true)
    try {
      const response = await fetch("/api/webhooks/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          test: true,
          timestamp: new Date().toISOString(),
          message: "Test webhook event",
          data: {
            user_id: "test-user-123",
            action: "test_action",
          },
        }),
      })

      if (response.ok) {
        toast({
          title: "Test sent!",
          description: "Test webhook event has been processed",
        })
        await fetchEvents()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to send test webhook")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send test webhook",
        variant: "destructive",
      })
    } finally {
      setTesting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-500"
      case "failed":
        return "bg-red-500"
      case "pending":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4" />
      case "failed":
        return <AlertCircle className="w-4 h-4" />
      case "pending":
        return <Activity className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Webhook className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {events.filter((e) => e.status === "success").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{events.filter((e) => e.status === "failed").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Activity className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {events.filter((e) => e.status === "pending").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Database Initialization */}
      <DatabaseInit />

      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">Recent Events</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Webhook Events</h2>
            <Button onClick={refreshEvents} variant="outline" size="sm" disabled={refreshing}>
              {refreshing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              Refresh
            </Button>
          </div>

          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 text-red-800">
                  <AlertCircle className="w-4 h-4" />
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
                  <p>Loading events...</p>
                </div>
              ) : events.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Webhook className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">No webhook events yet</p>
                    <Button onClick={testWebhook} disabled={testing}>
                      {testing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Send Test Event
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                events.map((event) => (
                  <Card key={event.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(event.status)}`} />
                          <CardTitle className="text-lg">{event.event_type}</CardTitle>
                          <Badge variant="outline">
                            {getStatusIcon(event.status)}
                            <span className="ml-1 capitalize">{event.status}</span>
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(event.created_at).toLocaleString()}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {event.error_message && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-800">{event.error_message}</p>
                          </div>
                        )}

                        <div>
                          <Label className="text-sm font-medium">Payload</Label>
                          <pre className="mt-1 p-3 bg-muted rounded-md text-sm overflow-x-auto max-h-40">
                            {JSON.stringify(event.payload, null, 2)}
                          </pre>
                        </div>

                        <div>
                          <Label className="text-sm font-medium">Headers</Label>
                          <pre className="mt-1 p-3 bg-muted rounded-md text-sm overflow-x-auto max-h-32">
                            {JSON.stringify(event.headers, null, 2)}
                          </pre>
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
              <CardTitle>Webhook Configuration</CardTitle>
              <CardDescription>Configure your webhook endpoints and test the integration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <div className="flex space-x-2">
                  <Input id="webhook-url" value={webhookUrl} readOnly className="font-mono" />
                  <Button onClick={copyWebhookUrl} variant="outline" size="icon">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Use this URL as your webhook endpoint in external services
                </p>
              </div>

              <div className="space-y-2">
                <Label>Test Webhook</Label>
                <Button onClick={testWebhook} className="w-full" disabled={testing}>
                  {testing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Send Test Event
                </Button>
                <p className="text-sm text-muted-foreground">Send a test webhook event to verify your setup</p>
              </div>

              <div className="space-y-2">
                <Label>Supported Event Types</Label>
                <div className="grid grid-cols-2 gap-2">
                  {["user.created", "user.updated", "payment.completed", "order.created", "test.event"].map((type) => (
                    <Badge key={type} variant="secondary">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
