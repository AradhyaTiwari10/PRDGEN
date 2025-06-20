import { AuthForm } from "@/components/auth/auth-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#18181b] via-[#23272f] to-[#101014] overflow-hidden">
      <div className="w-full max-w-md p-8 md:p-12 rounded-2xl border border-white/10 bg-[#0f0f11]/60 backdrop-blur-md shadow-xl">
        <AuthForm mode="login" />
      </div>
    </div>
  );
}
