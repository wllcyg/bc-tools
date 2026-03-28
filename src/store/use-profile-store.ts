import { create } from "zustand";
import { createClient } from "@/utils/supabase/client";

export type Role = "admin" | "edu_admin" | "teacher" | "student";

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: Role;
  email: string;
}

interface ProfileState {
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;
  setProfile: (profile: Profile | null) => void;
  fetchProfile: () => Promise<void>;
  clearProfile: () => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  loading: false,
  initialized: false,
  setProfile: (profile) => set({ profile, initialized: true }),
  clearProfile: () => set({ profile: null, initialized: false }),
  fetchProfile: async () => {
    // 如果已经初始化且正在加载，或者已经有数据，则不再重复请求
    if (get().loading) return;
    
    set({ loading: true });
    const supabase = createClient();
    
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        const { data: dbProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .single();

        set({
          profile: {
            id: authUser.id,
            full_name: dbProfile?.full_name || authUser.user_metadata?.username || null,
            avatar_url: dbProfile?.avatar_url || authUser.user_metadata?.avatar_url || null,
            role: dbProfile?.role || "student",
            email: authUser.email || "",
          },
          initialized: true,
        });
      } else {
        set({ profile: null, initialized: true });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      set({ loading: false });
    }
  },
}));
