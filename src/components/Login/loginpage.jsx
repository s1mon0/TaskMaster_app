import React, { useState } from 'react';
import { supabase } from '../../supabase';
import { Loader2 } from 'lucide-react';

export default function LoginPage({ isDarkMode }) {
  const [isLoading, setIsLoading] = useState(null); // 'google' | 'apple' | null

  const handleOAuth = async (provider) => {
    setIsLoading(provider);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        // Po přihlášení přesměruje zpět na aplikaci
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      console.error(error);
      setIsLoading(null);
    }
    // Pokud vše OK, prohlížeč přesměruje na OAuth stránku
  };

  return (
    <div className="h-[100dvh] flex flex-col items-center justify-center bg-[#f2f2f7] dark:bg-black px-6 transition-colors duration-300">

      {/* Logo / ikona */}
      <div className="mb-10 flex flex-col items-center gap-4">
        <div className="w-20 h-20 bg-[#007aff] rounded-[22px] flex items-center justify-center shadow-xl shadow-[#007aff]/30">
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
            <path d="M10 32L18 14L26 26L31 18L38 32H10Z" fill="white" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            TaskMaster
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-[15px]">
            Vaše úkoly, vždy po ruce
          </p>
        </div>
      </div>

      {/* Přihlašovací tlačítka */}
      <div className="w-full max-w-sm flex flex-col gap-3">

        {/* Přihlásit přes Google */}
        <button
          onClick={() => handleOAuth('google')}
          disabled={isLoading !== null}
          className="flex items-center justify-center gap-3 w-full bg-white dark:bg-[#1c1c1e] text-gray-900 dark:text-white font-semibold py-4 px-6 rounded-2xl active:scale-95 transition-all disabled:opacity-60 shadow-sm border border-gray-200 dark:border-gray-800"
        >
          {isLoading === 'google' ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          )}
          Přihlásit se přes Google
        </button>
      </div>

      {/* Footer */}
      <p className="mt-10 text-center text-[13px] text-gray-400 dark:text-gray-600 max-w-xs">
        Přihlášením souhlasíte s tím, že vaše úkoly budou uloženy ve vašem účtu.
      </p>
    </div>
  );
}