"use client";

import { useEffect } from "react";
import { useProfileStore, type Role, type Profile } from "@/store/use-profile-store";

export type { Role, Profile };

export function useProfile() {
  const { profile, loading, initialized, fetchProfile } = useProfileStore();

  useEffect(() => {
    if (!initialized && !loading) {
      fetchProfile();
    }
  }, [initialized, loading, fetchProfile]);

  return { profile, loading };
}
