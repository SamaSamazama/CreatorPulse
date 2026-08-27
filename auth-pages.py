import os

files = {
    'app/sign-in/page.tsx': """import { SignIn } from "@clerk/nextjs";
export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
    </div>
  );
}
""",
    'app/sign-up/page.tsx': """import { SignUp } from "@clerk/nextjs";
export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
    </div>
  );
}
""",
}

for path, content in files.items():
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

print("AUTH PAGES CREATED")