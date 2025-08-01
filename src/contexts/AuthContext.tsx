import React, { createContext, useContext, useEffect, useState } from 'react';
// تم حذف كود supabase بالكامل. أضف هنا كود KeyAuth أو أي كود مصادقة آخر.

interface AuthContextType {
  user: any | null; // Changed from User to any as User is no longer imported
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  signUp: async () => {},
  signOut: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null); // Changed from User to any as User is no longer imported
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // تم حذف كود supabase بالكامل. أضف هنا كود KeyAuth أو أي كود مصادقة آخر.
    console.log('AuthContext: Setting loading to false');
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string) => {
    // تم حذف كود supabase بالكامل. أضف هنا كود KeyAuth أو أي كود مصادقة آخر.
    // تم حذف كود supabase بالكامل. أضف هنا كود KeyAuth أو أي كود مصادقة آخر.
  };

  const signOut = async () => {
    // تم حذف كود supabase بالكامل. أضف هنا كود KeyAuth أو أي كود مصادقة آخر.
    // تم حذف كود supabase بالكامل. أضف هنا كود KeyAuth أو أي كود مصادقة آخر.
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};