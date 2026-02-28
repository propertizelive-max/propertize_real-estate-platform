import { createContext, useContext, useEffect, useRef, useState } from "react";
// import { Session, User } from "@supabase/supabase-js";
import { supabase } from '@/lib/supabase'
import { TABLE } from '@/lib/tableNames'
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";

export type Profile = {
  id: string;
  role: string;
  full_name: string | null;
  phone: string | null;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  profileLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: { full_name?: string; contact?: string }) => Promise<void>;
  signOut: () => Promise<void>;
  fetchProfile: (userId: string) => Promise<Profile | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  const inFlightProfileRef = useRef<{
    userId: string;
    promise: Promise<Profile | null>;
  } | null>(null);

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from(TABLE.profiles)
      .select("id, role, full_name, phone")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Profile fetch error:", error.message);
      return null;
    }

    const profileData = data as Profile | null;
    if (profileData) setProfile(profileData);
    return profileData;
  };

  const loadProfile = async (userId: string) => {
    setProfileLoading(true);
    try {
      const existing = inFlightProfileRef.current;
      const promise =
        existing?.userId === userId
          ? existing.promise
          : (inFlightProfileRef.current = {
              userId,
              promise: fetchProfile(userId),
            }).promise;

      const profileData = await promise;
      setProfile(profileData);
    } finally {
      setProfileLoading(false);
    }
  };

  // 🔥 Initial Session Check
  useEffect(() => {
    let alive = true;

    const getInitialSession = async () => {
      setLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!alive) return;

      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (session?.user?.id) {
        void loadProfile(session.user.id);
      } else {
        setProfile(null);
      }
    };

    getInitialSession();

    // 🔥 Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, session: Session | null) => {
        if (!alive) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user?.id) {
          void loadProfile(session.user.id);
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      alive = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  // 🔥 Sign In
  const signIn = async (email: string, password: string) => {
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      throw error;
    }

    // Set these immediately for faster UI transitions; profile will be fetched in background.
    setSession(data.session);
    setUser(data.session?.user ?? null);
    setLoading(false);

    if (data.session?.user?.id) {
      void loadProfile(data.session.user.id);
    } else {
      setProfile(null);
    }
  };

  // 🔥 Sign Up — store full_name, phone in profiles table
  const signUp = async (email: string, password: string, metadata?: { full_name?: string; contact?: string }) => {
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: metadata ? { data: metadata } : undefined,
    });

    if (error) {
      setLoading(false);
      throw error;
    }

    if (data?.user?.id && metadata && (metadata.full_name || metadata.contact)) {
      await supabase.from(TABLE.profiles).upsert(
        {
          id: data.user.id,
          full_name: metadata.full_name || null,
          phone: metadata.contact || null,
        },
        { onConflict: "id" }
      );
    }

    setLoading(false);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setProfileLoading(false);
    inFlightProfileRef.current = null;
  };

  const isAdmin =
    profile?.role?.toLowerCase().trim() === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        profileLoading,
        isAdmin,
        signIn,
        signUp,
        signOut,
        fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
