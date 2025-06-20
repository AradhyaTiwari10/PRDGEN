import { AuthForm } from "@/components/auth/auth-form";

export default function SignupPage() {
  return (
<div
  className="min-h-screen flex items-center justify-center w-full"
  style={{
    background:
      "linear-gradient(135deg, #18181b 0%, #23272f 60%, #101014 100%)",
    backgroundColor: "#101014",
  }}
>
  <div className="bg-[#18181b] border border-white/10 rounded-2xl shadow-2xl p-8 md:p-12 w-full max-w-md">
    <AuthForm mode="signup" />
  </div>
</div>

  );
}
