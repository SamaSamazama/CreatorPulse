import os

files = {
    'app/sign-up/sso-callback/page.tsx': """import { SignUp } from "@clerk/nextjs";
export default function CallbackPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp routing="path" path="/sign-up" />
    </div>
  );
}
""",
    'app/sign-in/sso-callback/page.tsx': """import { SignIn } from "@clerk/nextjs";
export default function CallbackPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn routing="path" path="/sign-in" />
    </div>
  );
}
"""
}

for path, content in files.items():
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
print("CALLBACK PAGES CREATED")