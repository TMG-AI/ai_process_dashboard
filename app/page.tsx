import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-8">
      <div className="max-w-3xl text-center space-y-8">
        <h1 className="text-5xl font-bold tracking-tight">
          AI Project Autopilot
        </h1>
        <p className="text-xl text-muted-foreground">
          Automate your AI project development workflow with intelligent building and debugging modes
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/dashboard">
            <Button size="lg">
              Go to Dashboard
            </Button>
          </Link>
          <Link href="/projects/new">
            <Button size="lg" variant="outline">
              Create New Project
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
