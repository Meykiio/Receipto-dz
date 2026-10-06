import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { UserSettings } from "@/types";

interface UserSettingsContextType {
  userSettings: UserSettings | null;
  isLoading: boolean;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
}

const UserSettingsContext = createContext<UserSettingsContextType | undefined>(undefined);

export const UserSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) {
        setUserSettings(null);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          setUserSettings({
            userId: data.user_id,
            fullName: data.full_name || "",
            currency: data.currency || "DZD",
            dateFormat: data.date_format || "DD/MM/YYYY",
            locale: (data.locale as "ar" | "fr" | "en") || "ar",
            createdAt: data.created_at,
            updatedAt: data.updated_at
          });
        } else {
          const { data: newSettings, error: createError } = await supabase
            .from('user_settings')
            .insert({
              user_id: user.id,
              full_name: "",
              currency: "DZD",
              date_format: "DD/MM/YYYY",
              locale: "ar"
            })
            .select('*')
            .single();

          if (createError) throw createError;
          if (newSettings) {
            setUserSettings({
              userId: newSettings.user_id,
              fullName: newSettings.full_name || "",
              currency: newSettings.currency || "DZD",
              dateFormat: newSettings.date_format || "DD/MM/YYYY",
              locale: (newSettings.locale as "ar" | "fr" | "en") || "ar",
              createdAt: newSettings.created_at,
              updatedAt: newSettings.updated_at
            });
          }
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [user]);

  const updateSettings = async (settings: Partial<UserSettings>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_settings')
        .update({
          full_name: settings.fullName,
          currency: settings.currency,
          date_format: settings.dateFormat,
          locale: settings.locale,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setUserSettings(prev => prev ? { ...prev, ...settings } : null);
    } catch (error) {
      console.error("Error updating settings:", error);
      throw error;
    }
  };

  return (
    <UserSettingsContext.Provider value={{ userSettings, isLoading, updateSettings }}>
      {children}
    </UserSettingsContext.Provider>
  );
};

export const useUserSettings = () => {
  const context = useContext(UserSettingsContext);
  if (!context) {
    throw new Error("useUserSettings must be used within UserSettingsProvider");
  }
  return context;
};
