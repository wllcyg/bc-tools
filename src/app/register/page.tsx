"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Unlock, User, ShieldCheck, Loader2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// 1. 定义表单校验 Schema (类似 AntD 的 rules)
const registerSchema = z
  .object({
    username: z.string().min(2, "用户名至少需要 2 个字符"),
    email: z.string().email("请输入有效的电子邮箱地址"),
    password: z.string().min(6, "密码长度至少需要 6 个字符"),
    confirmPassword: z.string().min(1, "请确认您的密码"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "两次输入的密码不一致",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 2. 初始化 useForm
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // 3. 提交处理函数
  const onSubmit = async (values: RegisterFormValues) => {
    setGlobalError(null);
    setSuccess(false);
    setLoading(true);

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          username: values.username,
          avatar_url: "",
        },
      },
    });

    setLoading(false);
    if (signUpError) {
      setGlobalError(signUpError.message);
      console.error("Error signing up:", signUpError);
    } else {
      setSuccess(true);
      console.log("User signed up:", data);
      // 注册成功后跳转到登录页，给用户预留时间看提示
      setTimeout(() => {
        router.push("/login");
      }, 2500);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-zinc-50 dark:bg-zinc-950 transition-colors duration-500">
      {/* 动态流体背景装饰 */}
      <div className="absolute top-0 -left-48 w-96 h-96 bg-blue-500/20 rounded-full blur-[128px] animate-pulse dark:bg-blue-900/20"></div>
      <div className="absolute bottom-0 -right-48 w-96 h-96 bg-purple-500/20 rounded-full blur-[128px] animate-pulse delay-700 dark:bg-purple-900/20"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.02)_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_0%,rgba(255,255,255,0.02)_100%)]"></div>

      <div className="relative w-full max-w-md px-6 py-12 z-10">
        <Card className="border-white/20 bg-white/70 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:border-zinc-800/50 dark:bg-zinc-900/70 dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden transition-all duration-300 hover:shadow-[0_25px_60px_rgba(0,0,0,0.15)]">
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-500 via-purple-500 to-pink-500"></div>

          <CardHeader className="space-y-4 pt-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 text-zinc-50 shadow-xl dark:bg-zinc-50 dark:text-zinc-900 transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-linear-to-br from-zinc-900 to-zinc-500 dark:from-zinc-50 dark:to-zinc-400">
                创建新账号
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="px-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {/* 全局错误与成功提示 */}
                {globalError && (
                  <div className="p-3 text-sm font-medium text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg animate-in fade-in slide-in-from-top-1 duration-300">
                    {globalError}
                  </div>
                )}
                {success && (
                  <div className="p-3 text-sm font-medium text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg animate-in fade-in slide-in-from-top-1 duration-300">
                    注册成功！请检查您的邮箱以完成验证。
                  </div>
                )}

                {/* 用户名 */}
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-zinc-500">用户名</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                          <Input
                            placeholder="您的姓名"
                            className="pl-10 h-12 bg-zinc-50/50 border-zinc-200 focus:bg-white transition-all dark:bg-zinc-950/50 dark:border-zinc-800"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 邮箱 */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-zinc-500">电子邮箱</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                          <Input
                            type="email"
                            placeholder="name@example.com"
                            className="pl-10 h-12 bg-zinc-50/50 border-zinc-200 focus:bg-white transition-all dark:bg-zinc-950/50 dark:border-zinc-800"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 密码 */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-zinc-500">设置密码</FormLabel>
                      <FormControl>
                        <div className="relative group">
                          {form.watch("password") ? (
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-500 animate-in zoom-in-50 duration-300" />
                          ) : (
                            <Unlock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 animate-in spin-in-12 duration-300" />
                          )}
                          <Input
                            type="password"
                            placeholder="••••••••"
                            className="pl-10 h-12 bg-zinc-50/50 border-zinc-200 focus:bg-white transition-all dark:bg-zinc-950/50 dark:border-zinc-800"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 确认密码 */}
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-zinc-500">确认密码</FormLabel>
                      <FormControl>
                        <div className="relative group">
                          {form.watch("confirmPassword") ? (
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pink-500 animate-in zoom-in-50 duration-300" />
                          ) : (
                            <Unlock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 animate-in spin-in-12 duration-300" />
                          )}
                          <Input
                            type="password"
                            placeholder="••••••••"
                            className="pl-10 h-12 bg-zinc-50/50 border-zinc-200 focus:bg-white transition-all dark:bg-zinc-950/50 dark:border-zinc-800"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 text-md font-bold shadow-lg shadow-zinc-900/20 active:scale-[0.98] transition-all bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 cursor-pointer"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      正在处理...
                    </>
                  ) : "立即注册"}
                </Button>
              </form>
            </Form>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 py-8 bg-zinc-50/50 dark:bg-zinc-950/30 border-t border-zinc-100 dark:border-zinc-800">
            <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              已有账号?{" "}
              <Link
                href="/login"
                className="font-bold text-zinc-900 hover:text-blue-600 transition-shadow dark:text-zinc-100 dark:hover:text-blue-400 cursor-pointer"
              >
                立即登录
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
