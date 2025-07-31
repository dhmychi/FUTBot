import React, { createContext, useContext, useEffect, useState } from 'react';
// تم حذف كود supabase بالكامل. أضف هنا كود KeyAuth أو أي كود مصادقة آخر.

interface AuthContextType {
  user: any | null; // Changed from User to any as User is no longer imported
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null); // Changed from User to any as User is no longer imported
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // تم حذف كود supabase بالكامل. أضف هنا كود KeyAuth أو أي كود مصادقة آخر.
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    // تم حذف كود supabase بالكامل. أضف هنا كود KeyAuth أو أي كود مصادقة آخر.
  };

  const signOut = async () => {
    // تم حذف كود supabase بالكامل. أضف هنا كود KeyAuth أو أي كود مصادقة آخر.
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};