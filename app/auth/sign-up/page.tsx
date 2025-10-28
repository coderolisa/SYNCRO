"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Building2, Users, ArrowLeft } from "lucide-react"

export default function SignUpPage() {
  const [signupType, setSignupType] = useState<"select" | "individual" | "team">("select")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [workDomain, setWorkDomain] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      setIsLoading(false)
      return
    }

    if (signupType === "team" && !companyName) {
      setError("Company name is required")
      setIsLoading(false)
      return
    }

    if (signupType === "team" && !workDomain) {
      setError("Work domain is required")
      setIsLoading(false)
      return
    }

    try {
      const userData = {
        email,
        fullName,
        accountType: signupType,
        companyName: companyName || null,
        workEmailDomain: workDomain || null,
        createdAt: new Date().toISOString(),
      }

      localStorage.setItem("subsync_user", JSON.stringify(userData))
      localStorage.setItem("subsync_authenticated", "true")

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      router.push("/")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (signupType === "select") {
    return (
      <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-background">
        <div className="w-full max-w-lg">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Welcome to SubSync AI</CardTitle>
              <CardDescription>Choose how you want to get started</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <button
                onClick={() => setSignupType("individual")}
                className="flex items-start gap-4 p-6 rounded-lg border-2 border-border hover:border-primary transition-colors text-left group"
              >
                <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">Individual Account</h3>
                  <p className="text-sm text-muted-foreground">
                    Perfect for personal subscription tracking and management
                  </p>
                </div>
              </button>

              <button
                onClick={() => setSignupType("team")}
                className="flex items-start gap-4 p-6 rounded-lg border-2 border-border hover:border-primary transition-colors text-left group"
              >
                <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">Team Workspace</h3>
                  <p className="text-sm text-muted-foreground">
                    Collaborate with your team, manage department budgets, and track company subscriptions
                  </p>
                </div>
              </button>

              <div className="mt-4 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/auth/login" className="underline underline-offset-4 hover:text-primary">
                  Sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-background">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <Button variant="ghost" size="sm" onClick={() => setSignupType("select")} className="w-fit -ml-2 mb-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <CardTitle className="text-2xl font-bold">
              {signupType === "individual" ? "Create Individual Account" : "Create Team Workspace"}
            </CardTitle>
            <CardDescription>
              {signupType === "individual"
                ? "Start tracking your personal subscriptions"
                : "Set up your team workspace and invite members"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp}>
              <div className="flex flex-col gap-4">
                {signupType === "team" && (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        type="text"
                        placeholder="Acme Inc."
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        autoComplete="organization"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="workDomain">Work Email Domain</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">@</span>
                        <Input
                          id="workDomain"
                          type="text"
                          placeholder="company.com"
                          required
                          value={workDomain}
                          onChange={(e) => setWorkDomain(e.target.value.replace("@", ""))}
                          className="flex-1"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Team members with this domain can join your workspace
                      </p>
                    </div>
                  </>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="name"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">{signupType === "team" ? "Work Email" : "Email"}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={signupType === "team" ? `you@${workDomain || "company.com"}` : "you@example.com"}
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                  {signupType === "team" && workDomain && !email.endsWith(`@${workDomain}`) && email.includes("@") && (
                    <p className="text-xs text-amber-600">Email should match your work domain (@{workDomain})</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="repeat-password">Confirm Password</Label>
                  <Input
                    id="repeat-password"
                    type="password"
                    required
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>

                {error && (
                  <p className="text-sm text-destructive" role="alert">
                    {error}
                  </p>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating account..." : signupType === "team" ? "Create Workspace" : "Sign up"}
                </Button>
              </div>

              <div className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <Link href="/auth/login" className="underline underline-offset-4 hover:text-primary">
                  Sign in
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
