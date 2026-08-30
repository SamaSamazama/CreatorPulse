import { SignIn } from "@clerk/nextjs";
export default function CallbackPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn routing="path" path="/sign-in" />
    </div>
  );
}
