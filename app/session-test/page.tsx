import { SessionInspector } from "@/components/session-inspector"

export default function SessionTestPage() {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Session Test Page</h1>
      <p className="mb-6">This page is for testing session data access.</p>

      <div className="p-4 border rounded-md mb-6">
        <p>Check the bottom right corner of the screen for the Session Inspector.</p>
        <p className="text-sm text-muted-foreground mt-2">
          The inspector shows both the formatted session data and the raw session object.
        </p>
      </div>

      <SessionInspector />
    </div>
  )
}
