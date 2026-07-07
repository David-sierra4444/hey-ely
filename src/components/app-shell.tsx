import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { LogoMark } from "@/components/brand";
import { EmergencyButton } from "@/components/emergency-button";
import { supabase } from "@/integrations/supabase/client";
import { useSession, useProfile } from "@/lib/session";
import { Home, MessageCircle, Target, Gamepad2, BookOpen, Newspaper, User, Sparkles, PawPrint, BarChart3, Users, ClipboardList, Bell, LogOut, Globe } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";

const studentNav = [
  { to: "/app", label: "Inicio", icon: Home, exact: true },
  { to: "/app/chat", label: "Chat con Ely", icon: MessageCircle },
  { to: "/app/misiones", label: "Misiones", icon: Target },
  { to: "/app/juegos", label: "Juegos", icon: Gamepad2 },
  { to: "/app/recursos", label: "Recursos", icon: BookOpen },
  { to: "/app/noticias", label: "Noticias", icon: Newspaper },
  { to: "/app/avatar", label: "Avatar", icon: Sparkles },
  { to: "/app/mascota", label: "Mascota", icon: PawPrint },
  { to: "/app/perfil", label: "Perfil", icon: User },
];

const adminNav = [
  { to: "/admin", label: "Panel", icon: BarChart3, exact: true },
  { to: "/admin/estudiantes", label: "Estudiantes", icon: Users },
  { to: "/admin/encuestas", label: "Encuestas", icon: ClipboardList },
  { to: "/admin/alertas", label: "Alertas", icon: Bell },
  { to: "/admin/noticias", label: "Noticias", icon: Newspaper },
];

export function AppShell({ children, admin = false }: { children?: ReactNode; admin?: boolean }) {
  const { user, loading } = useSession();
  const { profile } = useProfile(user?.id);
  const navigate = useNavigate();
  const loc = useLocation();
  const qc = useQueryClient();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (profile && admin && profile.user_type !== "admin") navigate({ to: "/app" });
    if (profile && !admin && profile.user_type === "admin") navigate({ to: "/admin" });
  }, [profile, admin, navigate]);

  const nav = admin ? adminNav : studentNav;

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <header className="sticky top-0 z-30 backdrop-blur-md bg-background/70 border-b">
        <div className="max-w-7xl mx-auto flex items-center gap-4 px-4 py-3">
          <Link to="/"><LogoMark size={34} /></Link>
          <nav className="hidden md:flex items-center gap-1 ml-6 flex-1">
            {nav.map((item) => {
              const active = item.exact ? loc.pathname === item.to : loc.pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link key={item.to} to={item.to}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition ${active ? "bg-primary text-primary-foreground shadow-soft" : "hover:bg-secondary"}`}>
                  <Icon className="h-4 w-4" /> {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            {profile && (
              <div className="hidden sm:flex flex-col text-right leading-tight">
                <span className="text-sm font-bold">{profile.full_name.split(" ")[0]}</span>
                <span className="text-[11px] text-muted-foreground">Nivel {profile.level} · {profile.xp} XP</span>
              </div>
            )}
            <a href="https://hey-ely-ears-to-you.lovable.app/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold hover:bg-secondary" title="Sitio web oficial de Hey Ely">
              <Globe className="h-4 w-4" /> <span className="hidden sm:inline">Sitio Web</span>
            </a>
            <button onClick={signOut} className="rounded-full border p-2 hover:bg-secondary" title="Salir">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {children ?? <Outlet />}
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-background/95 backdrop-blur border-t">
        <div className="grid grid-cols-5">
          {nav.slice(0, 5).map((item) => {
            const active = item.exact ? loc.pathname === item.to : loc.pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link key={item.to} to={item.to}
                className={`flex flex-col items-center gap-0.5 py-2 text-[11px] ${active ? "text-primary font-bold" : "text-muted-foreground"}`}>
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <EmergencyButton />
    </div>
  );
}
