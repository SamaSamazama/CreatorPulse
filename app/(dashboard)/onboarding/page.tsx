import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Video } from "lucide-react";
export default function OnboardingPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center p-6">
      <Card className="w-full max-w-md text-center">
        <CardHeader><Video className="h-12 w-12 mx-auto text-red-600 mb-4" /><CardTitle>Connect Your Channel</CardTitle><CardDescription>To get started, connect your YouTube channel.</CardDescription></CardHeader>
        <CardContent><Button asChild size="lg" className="w-full bg-red-600 hover:bg-red-700"><a href="/api/auth/youtube"><Video className="mr-2 h-5 w-5" />Connect YouTube</a></Button></CardContent>
      </Card>
    </div>
  );
}
