"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/hooks/useT";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useStore();
  const t = useT();
  const [role, setRole] = useState<"backer" | "creator">("backer");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    login(role);
    toast.success(`Signed in as ${role === "backer" ? "Lucas Chen" : "Aria Song"}`);
    router.push("/market");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-between p-12">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-semibold text-lg">Spotlight</span>
        </div>
        <div>
          <blockquote className="text-white/90 text-xl font-medium leading-relaxed mb-4">
            {t.login.testimonial}
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-semibold">AS</div>
            <div>
              <p className="text-white text-sm font-medium">Aria Song</p>
              <p className="text-white/60 text-xs">{t.login.testimonialRole}</p>
            </div>
          </div>
        </div>
        <p className="text-white/40 text-xs">{t.login.copyright}</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-foreground">Spotlight</span>
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-1">{t.login.welcomeBack}</h1>
          <p className="text-sm text-muted-foreground mb-6">{t.login.subtitle}</p>

          {/* Role selector — demo only */}
          <div className="mb-5 p-3 bg-accent rounded-lg border border-border">
            <p className="text-xs font-medium text-foreground mb-2">{t.login.demoLabel}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setRole("backer")}
                className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-colors ${role === "backer" ? "bg-primary text-white" : "bg-white border border-border text-muted-foreground hover:text-foreground"}`}
              >
                Lucas Chen · Backer
              </button>
              <button
                onClick={() => setRole("creator")}
                className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-colors ${role === "creator" ? "bg-primary text-white" : "bg-white border border-border text-muted-foreground hover:text-foreground"}`}
              >
                Aria Song · Creator
              </button>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm">{t.login.email}</Label>
              <Input
                id="email"
                type="email"
                defaultValue={role === "backer" ? "lucas@neovision.co" : "aria@studio.me"}
                className="mt-1.5"
                readOnly
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-sm">{t.login.password}</Label>
              <Input id="password" type="password" defaultValue="••••••••" className="mt-1.5" readOnly />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t.login.signingIn : t.login.signIn}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-5">
            {t.login.noAccount}{" "}
            <Link href="/register" className="text-primary hover:underline font-medium">{t.login.signUp}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
