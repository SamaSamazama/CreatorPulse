import { Button } from "@/components/ui/button";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { ArrowRight, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <h1 style={{color: 'red', fontSize: '80px', position: 'fixed', top: 0, left: 0, zIndex: 9999}}>TEST UPDATE 123</h1>
      <header className="px-6 py-4 border-b flex justify-between items-center">
        <h1 className="text-2xl font-bold">CreatorPulse</h1>
        <div className="flex gap-4">
          <SignInButton mode="modal"><Button variant="ghost">Log in</Button></SignInButton>
          <SignUpButton mode="modal"><Button>Get Started</Button></SignUpButton>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 space-y-8">
        <h1 className="text-5xl md:text-7xl font-bold">Stop Guessing.<br/><span className="text-primary">Start Predicting.</span></h1>
        <p className="text-xl text-muted-foreground max-w-2xl">AI-powered YouTube growth platform.</p>
        <SignUpButton mode="modal"><Button size="lg" className="text-lg px-8">Start Free <ArrowRight className="ml-2 h-5 w-5" /></Button></SignUpButton>
      </main>
    </div>
  );
}