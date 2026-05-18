"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/hooks/useT";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useStore();
  const t = useT();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await new Promise((r) => setTimeout(r, 700));
    login("backer");
    toast.success(t.register.successToast);
    router.push("/market");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-semibold text-foreground">Spotlight</span>
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-1">{t.register.title}</h1>
        <p className="text-sm text-muted-foreground mb-6">{t.register.subtitle}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="first" className="text-sm">{t.register.firstName}</Label>
              <Input id="first" className="mt-1.5" placeholder="Alex" />
            </div>
            <div>
              <Label htmlFor="last" className="text-sm">{t.register.lastName}</Label>
              <Input id="last" className="mt-1.5" placeholder="Kim" />
            </div>
          </div>
          <div>
            <Label htmlFor="email" className="text-sm">{t.register.email}</Label>
            <Input id="email" type="email" className="mt-1.5" placeholder="you@studio.com" />
          </div>
          <div>
            <Label htmlFor="pass" className="text-sm">{t.register.password}</Label>
            <Input id="pass" type="password" className="mt-1.5" placeholder={t.register.passwordPlaceholder} />
          </div>
          <Button type="submit" className="w-full">{t.register.createAccount}</Button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-5">
          {t.register.alreadyHaveAccount}{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">{t.register.signIn}</Link>
        </p>
      </div>
    </div>
  );
}
