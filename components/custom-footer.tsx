export function CustomFooter() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto py-4">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
          <div className="text-sm text-muted-foreground">
            © 2025 Raj Patil GitHub Webhook Dashboard. Built for monitoring repository events.
          </div>
          <div className="text-sm text-muted-foreground">Powered by Next.js & Neon Database</div>
        </div>
      </div>
    </footer>
  )
}
