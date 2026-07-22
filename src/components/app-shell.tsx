import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { LogoMark } from "@/components/brand";
import { EmergencyButton } from "@/components/emergency-button";
import { supabase } from "@/integrations/supabase/client";
import { useSession, useProfile } from "@/lib/session";
import { 
  Home, 
  MessageCircle, 
  Target, 
  Gamepad2, 
  BookOpen, 
  User, 
  Sparkles, 
  PawPrint, 
  BarChart3, 
  Users, 
  ClipboardList, 
  Bell, 
  LogOut,
  FileText // 👈 Icono para encuestas de estudiante
} from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const studentNav = [
  { to: "/app", label: "Inicio", icon: Home, exact: true },
  { to: "/app/chat", label: "Chat con Ely", icon: MessageCircle },
  { to: "/app/misiones", label: "Misiones", icon: Target },
  { to: "/app/encuestas", label: "Encuestas", icon: FileText }, // 👈 Agregado aquí
  { to: "/app/juegos", label: "Juegos", icon: Gamepad2 },
  { to: "/app/recursos", label: "Recursos", icon: BookOpen },
  { to: "/app/avatar", label: "Avatar", icon: Sparkles },
  { to: "/app/mascota", label: "Mascota", icon: PawPrint },
  { to: "/app/perfil", label: "Perfil", icon: User },
];

const adminNav = [
  { to: "/admin", label: "Panel", icon: BarChart3, exact: true },
  { to: "/admin/estudiantes", label: "Estudiantes", icon: Users },
  { to: "/admin/encuestas", label: "Encuestas", icon: ClipboardList },
  { to: "/admin/alertas", label: "Alertas", icon: Bell },
];

const PET_EMOJIS: Record<string, string> = {
  ely: "🐘", gato: "🐱", perro: "🐶", conejo: "🐰",
  panda: "🐼", zorro: "🦊", capibara: "🦫", pinguino: "🐧",
  buho: "🦉", axolote: "🦎", dragon: "🐉", robot: "🤖"
};

export function AppShell({ children, admin = false }: { children?: ReactNode; admin?: boolean }) {
  const { user, loading } = useSession();
  const { profile } = useProfile(user?.id);
  const navigate = useNavigate();
  const loc = useLocation();
  const qc = useQueryClient();

  // Comprobar si estamos en la pantalla del chat
  const isChatRoute = loc.pathname === "/app/chat";

  // Traer mascota activa para mostrarla globalmente
  const { data: petData } = useQuery({
    queryKey: ["active-pet-shell", user?.id],
    enabled: !!user && !admin,
    queryFn: async () => {
      const { data } = await supabase.from("pets").select("active_pet").eq("user_id", user!.id).maybeSingle();
      return data?.active_pet || "ely";
    }
  });

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
    <div className="min-h-screen pb-28 md:pb-0">
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
          <div className="ml-auto flex items-center gap-2.5 sm:gap-3">
            {profile && (
              <div className="flex items-center gap-2 bg-secondary/50 px-2.5 sm:px-3 py-1 rounded-full border border-border/50">
                <span className="text-lg sm:text-xl leading-none" title="Tu mascota activa">
                  {PET_EMOJIS[petData || "ely"] || "🐘"}
                </span>
                <div className="hidden sm:flex flex-col text-right leading-tight">
                  <span className="text-xs font-bold text-foreground">{profile.full_name.split(" ")[0]}</span>
                  <span className="text-[10px] text-muted-foreground font-semibold">Nivel {profile.level} · {profile.xp} XP</span>
                </div>
              </div>
            )}
            <button onClick={signOut} className="rounded-full border p-2 hover:bg-secondary transition-colors" title="Salir">
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
        <div className="flex overflow-x-auto scrollbar-none py-2 px-3 gap-1">
          {nav.map((item) => {
            const active = item.exact ? loc.pathname === item.to : loc.pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link 
                key={item.to} 
                to={item.to}
                className={`flex flex-col items-center justify-center gap-1 py-1.5 px-3 text-[11px] flex-shrink-0 min-w-[76px] rounded-xl transition-colors ${active ? "text-primary font-bold bg-primary/10" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Oculto en chat solo en móviles (hidden), visible en PC (md:block) */}
      <div className={isChatRoute ? "hidden md:block" : "block"}>
        <EmergencyButton />
      </div>
    </div>
  );
}