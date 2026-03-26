"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export type Role = "admin" | "edu_admin" | "teacher" | "student";

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: Role;
  email: string;
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        const { data: dbProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .single();

        setProfile({
          id: authUser.id,
          full_name: dbProfile?.full_name || authUser.user_metadata?.username || null,
          avatar_url: dbProfile?.avatar_url || authUser.user_metadata?.avatar_url || null,
          role: dbProfile?.role || "student",
          email: authUser.email || "",
        });
      }
      setLoading(false);
    };

    fetchProfile();
  }, [supabase]);

  return { profile, loading };
}
