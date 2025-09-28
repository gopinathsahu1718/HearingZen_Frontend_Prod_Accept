// src/theme.tsx
import React, { createContext, useContext, useMemo, useState } from "react";
import { useColorScheme } from "react-native";

export type Theme = {
  mode: string;
  border: string;
  primary: string;
  success: string;
  primaryLight: string;
  background: string;
  card: string;
  text: string;
  subtext: string;
  accent: string;
  divider: string;
  shimmerA: string;
  shimmerB: string;
  glass: string;
};

const light: Theme = {
  background: "#EAF6FF",
  card: "#FFFFFF",
  text: "#0F172A",
  subtext: "#475569",
  accent: "#3386FD",
  divider: "#E5E7EB",
  shimmerA: "#E5E7EB",
  shimmerB: "#F3F4F6",
  glass: "rgba(255,255,255,0.6)",
  border: "",
  primary: "",
  success: "",
  primaryLight: "",
  mode: ""
};

const dark: Theme = {
  background: "#071428",
  card: "#0F1724",
  text: "#F8FAFC",
  subtext: "#9CA3AF",
  accent: "#60A5FA",
  divider: "#1F2937",
  shimmerA: "#0F1724",
  shimmerB: "#1E293B",
  glass: "rgba(255,255,255,0.05)",
  border: "",
  primary: "",
  success: "",
  primaryLight: "",
  mode: ""
  
};

type Ctx = { theme: Theme; toggle: () => void; isDark: boolean };
const ThemeCtx = createContext<Ctx>({ theme: light, toggle: () => {}, isDark: false });

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const system = useColorScheme();
  const [pref, setPref] = useState<"system" | "light" | "dark">("system");
  const isDark = pref === "system" ? system === "dark" : pref === "dark";
  const theme = useMemo(() => (isDark ? dark : light), [isDark]);

  const toggle = () =>
    setPref((p) => (p === "dark" ? "light" : p === "light" ? "system" : "dark"));

  return <ThemeCtx.Provider value={{ theme, toggle, isDark }}>{children}</ThemeCtx.Provider>;
};

export const useTheme = () => useContext(ThemeCtx).theme;
export const useThemeToggle = () => {
  const c = useContext(ThemeCtx);
  return { toggle: c.toggle, isDark: c.isDark };
};
