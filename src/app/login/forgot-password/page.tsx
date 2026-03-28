"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const siteUrl = window.location.origin;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${siteUrl}/api/auth/callback?next=/reset-password`,
      });

      if (error) throw error;

      setSuccess(true);
      toast.success("重置邮件已发送至您的邮箱");
    } catch (error: any) {
      toast.error(error.message || "发送失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-zinc-50 dark:bg-zinc-950 px-4">
      <div className="absolute top-0 -left-48 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px] animate-pulse"></div>
      <div className="absolute bottom-0 -right-48 w-96 h-96 bg-purple-500/10 rounded-full blur-[128px] animate-pulse delay-700"></div>

      <Card className="w-full max-w-md border-none shadow-2xl bg-white/70 backdrop-blur-2xl dark:bg-zinc-900/70 relative z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        <CardHeader className="space-y-4 pt-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 text-zinc-50 shadow-xl dark:bg-zinc-50 dark:text-zinc-900 transform -rotate-3">
            <Mail className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-extrabold tracking-tight">找回密码</CardTitle>
            <CardDescription>
              {success ? "邮件已发送" : "请输入您的邮箱地址，我们将向您发送重置链接"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-8 pb-4">
          {success ? (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 text-center animate-in zoom-in-95 duration-500">
              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                请检查您的收件箱（以及垃圾邮件箱）。重置链接将在 24 小时内有效。
              </p>
            </div>
          ) : (
            <form onSubmit={handleRequestReset} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-zinc-500">电子邮箱</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="pl-10 h-12 bg-white/50 dark:bg-zinc-950/50"
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-md font-bold shadow-lg shadow-zinc-900/20 active:scale-[0.98] transition-all bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                发送重置链接
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center pb-8 pt-2">
          <Link
            href="/login"
            className="flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-zinc-900 transition-colors dark:hover:text-zinc-100"
          >
            <ArrowLeft className="h-4 w-4" />
            返回登录
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
