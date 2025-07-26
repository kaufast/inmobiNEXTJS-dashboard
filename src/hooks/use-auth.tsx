import { createContext, ReactNode, useContext, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  refetchUser: () => Promise<any>;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, InsertUser>;
};

type LoginData = Pick<InsertUser, "username" | "password">;

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  // Query for checking session and getting user data
  const {
    data: user,
    error,
    isLoading,
    refetch,
  } = useQuery<SelectUser | null, Error>({
    queryKey: ["/api/user"],
    queryFn: async () => {
      // First check session status
      const sessionCheck = await apiRequest("GET", "/api/auth/check-session");
      const sessionData = await sessionCheck.json();
      
      if (!sessionData.authenticated) {
        console.log('Session not authenticated');
        return null;
      }
      
      // If authenticated, get user data
      const userResponse = await apiRequest("GET", "/api/auth/user");
      if (!userResponse.ok) {
        throw new Error("Failed to fetch user data");
      }
      
      const userData = await userResponse.json();
      logSafeUserData(userData);
      return userData;
    },
    staleTime: 1000 * 60, // 1 minute
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: 2,
  });
  
  // Force refetch user data every time the provider mounts
  useEffect(() => {
    console.log('AuthProvider mounted, fetching user data');
    refetch();
    
    const timer = setInterval(() => {
      console.log('Periodic session check');
      refetch();
    }, 15000); // Refresh every 15 seconds
    
    return () => clearInterval(timer);
  }, [refetch]);

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      console.log('Attempting login for:', credentials.username);
      const res = await apiRequest("POST", "/api/auth/login", credentials);
      
      if (!res.ok) {
        const error = await res.json();
        console.error('Login failed:', error);
        throw new Error(error.message || "Login failed");
      }
      
      const data = await res.json();
      logSafeUserData(data);
      return data;
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      // Force refetch to ensure user data is updated
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      logSafeLoginData(user);
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.fullName || user.username}!`,
      });
    },
    onError: (error: Error) => {
      console.error('Login mutation error:', error);
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: InsertUser) => {
      console.log('Attempting registration for:', userData.username);
      const res = await apiRequest("POST", "/api/auth/register", userData);
      
      if (!res.ok) {
        const error = await res.json();
        console.error('Registration failed:', error);
        throw new Error(error.message || "Registration failed");
      }
      
      const data = await res.json();
      logSafeUserData(data);
      return data;
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      // Force refetch to ensure user data is updated
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      logSafeRegistrationData(user);
      toast({
        title: "Registration successful",
        description: `Welcome to inMobi, ${user.fullName || user.username}!`,
      });
    },
    onError: (error: Error) => {
      console.error('Registration mutation error:', error);
      toast({
        title: "Registration failed",
        description: error.message || "Could not create account",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      console.log('Attempting logout');
      const res = await apiRequest("POST", "/api/auth/logout");
      
      if (!res.ok) {
        const error = await res.json();
        console.error('Logout failed:', error);
        throw new Error(error.message || "Logout failed");
      }
    },
    onSuccess: () => {
      // Clear the cache completely
      queryClient.clear();
      // Set the user data to null
      queryClient.setQueryData(["/api/user"], null);
      console.log("Logout successful, user cleared");
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    },
    onError: (error: Error) => {
      console.error('Logout mutation error:', error);
      toast({
        title: "Logout failed",
        description: error.message || "Could not log out",
        variant: "destructive",
      });
    },
  });

  // Function to manually refresh user data
  const refetchUser = async () => {
    console.log("Manually refetching user data");
    return refetch();
  };
  
  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        error,
        refetchUser,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

const logSafeUserData = (userData: any) => {
  if (!userData) return;
  const { password, ...safeUserData } = userData;
  console.log('User data fetched');
};

const logSafeLoginData = (user: any) => {
  if (!user) return;
  const { password, ...safeUserData } = user;
  console.log("Login successful");
};

const logSafeRegistrationData = (user: any) => {
  if (!user) return;
  const { password, ...safeUserData } = user;
  console.log("Registration successful");
};