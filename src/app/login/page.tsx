"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Lock, Unlock, Loader2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";

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

// 1. 定义登录校验 Schema
const loginSchema = z.object({
  email: z.string().email("请输入有效的电子邮箱地址"),
  password: z.string().min(1, "请输入密码"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 2. 初始化 useForm
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // 3. 提交处理函数
  const onSubmit = async (values: LoginFormValues) => {
    setGlobalError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    setLoading(false);
    if (error) {
      setGlobalError("登录失败：账号或密码错误");
      console.error("Login error:", error.message);
    } else {
      router.push("/");
      router.refresh(); // 刷新以确保客户端状态更新
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
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 text-zinc-50 shadow-xl dark:bg-zinc-50 dark:text-zinc-900 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
              <Lock className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-linear-to-br from-zinc-900 to-zinc-500 dark:from-zinc-50 dark:to-zinc-400">
                欢迎回来
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="px-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* 全局错误提示 */}
                {globalError && (
                  <div className="p-3 text-sm font-medium text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg animate-in fade-in slide-in-from-top-1 duration-300">
                    {globalError}
                  </div>
                )}

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
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-zinc-500">登录密码</FormLabel>
                        <Link
                          href="#"
                          className="text-xs font-semibold text-zinc-900 hover:text-blue-600 transition-colors dark:text-zinc-100 dark:hover:text-blue-400"
                        >
                          忘记密码?
                        </Link>
                      </div>
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

                <Button 
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 text-md font-bold shadow-lg shadow-zinc-900/20 active:scale-[0.98] transition-all bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 cursor-pointer" 
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      正在登录...
                    </>
                  ) : "登录账户"}
                </Button>
              </form>
            </Form>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 py-8 bg-zinc-50/50 dark:bg-zinc-950/30 border-t border-zinc-100 dark:border-zinc-800">
            <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              还没有账号?{" "}
              <Link
                href="/register"
                className="font-bold text-zinc-900 hover:text-blue-600 transition-shadow dark:text-zinc-100 dark:hover:text-blue-400 cursor-pointer"
              >
                免费注册
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
