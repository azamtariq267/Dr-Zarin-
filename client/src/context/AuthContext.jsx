import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";

const Ctx = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!localStorage.getItem("zc_token")) { setReady(true); return; }
    api("/me").then(setUser).catch(() => localStorage.removeItem("zc_token")).finally(() => setReady(true));
  }, []);
  const signIn = (token, u) => { localStorage.setItem("zc_token", token); setUser(u); };
  const signOut = () => { localStorage.removeItem("zc_token"); setUser(null); };
  return <Ctx.Provider value={{ user, setUser, ready, signIn, signOut }}>{children}</Ctx.Provider>;
}
export const useAuth = () => useContext(Ctx);
