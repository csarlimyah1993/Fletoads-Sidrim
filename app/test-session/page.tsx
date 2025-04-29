import { DebugSession } from "@/components/debug-session"

export default function TestSessionPage() {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Session Test Page</h1>
      <DebugSession />

      <div className="p-4 bg-muted rounded-md">
        <p className="mb-4">
          This page helps diagnose session-related issues. If you're seeing TypeScript errors related to
          <code className="bg-muted-foreground/20 px-1 rounded">tipoUsuario</code> or other session properties:
        </p>

        <ol className="list-decimal pl-5 space-y-2">
          <li>
            Make sure you've updated the{" "}
            <code className="bg-muted-foreground/20 px-1 rounded">types/next-auth.d.ts</code> file
          </li>
          <li>Restart the TypeScript server (Ctrl+Shift+P → TypeScript: Restart TS Server)</li>
          <li>
            Check that your auth callbacks in <code className="bg-muted-foreground/20 px-1 rounded">lib/auth.ts</code>{" "}
            are correctly passing the properties
          </li>
          <li>Clear your browser cookies and try logging in again</li>
        </ol>
      </div>
    </div>
  )
}
