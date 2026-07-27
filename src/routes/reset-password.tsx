import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LogoMark } from "@/components/brand";
import { toast } from "sonner";
import { Lock, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Nueva contraseña — Hey Ely" }] }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isSessionValid, setIsSessionValid] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Escuchar los cambios de autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsSessionValid(true);
      }
    });

    // 2. Verificar si ya hay una sesión activa traída por el token del enlace
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setIsSessionValid(true);
      } else {
        // Le damos un pequeño margen por si el listener tarda unos milisegundos en capturar el hash
        setTimeout(async () => {
          const { data: retrySession } = await supabase.auth.getSession();
          setIsSessionValid(!!retrySession.session);
        }, 500);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    if (password.length < 8) {
      return toast.error("La contraseña debe tener al menos 8 caracteres.");
    }

    if (password !== confirmPassword) {
      return toast.error("Las contraseñas no coinciden.");
    }

    setLoading(true);

    // Actualiza la contraseña del usuario utilizando la sesión activa de recuperación
    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      return toast.error(error.message);
    }

    setSuccess(true);
    toast.success("¡Contraseña actualizada correctamente!");
  }

  // Estado de carga inicial mientras se valida la sesión del correo
  if (isSessionValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Si la sesión no es válida o el enlace expiró
  if (isSessionValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-background text-foreground antialiased relative overflow-x-hidden">
        <div className="relative z-10 w-full max-w-md space-y-6">
          <div className="text-center">
            <LogoMark className="mx-auto" />
          </div>

          <div className="p-6 sm:p-8 bg-card/70 backdrop-blur-2xl border border-border/80 rounded-3xl shadow-2xl text-center space-y-5">
            <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-3xl mx-auto flex items-center justify-center border border-destructive/20 shadow-inner">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tight text-foreground">Enlace no válido o expirado</h2>
              <p className="text-sm text-muted-foreground">
                El enlace para restablecer tu contraseña ya fue utilizado o ha caducado. Por favor, solicita uno nuevo.
              </p>
            </div>

            <button
              onClick={() => navigate({ to: "/auth" })}
              className="w-full rounded-full bg-foreground text-background py-3.5 text-sm font-bold shadow-md transition-all hover:bg-foreground/90 hover:scale-[1.01] active:scale-[0.98]"
            >
              Volver al inicio de sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-background text-foreground antialiased selection:bg-primary/15 selection:text-primary relative overflow-x-hidden">
      
      {/* Background Effect */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-primary/10 via-cyan-500/5 to-transparent blur-[140px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-6">
        <div className="text-center">
          <LogoMark className="mx-auto" />
        </div>

        <div className="p-6 sm:p-8 bg-card/70 backdrop-blur-2xl border border-border/80 rounded-3xl shadow-2xl transition-all">
          {success ? (
            <div className="space-y-6 text-center py-2">
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 rounded-3xl mx-auto flex items-center justify-center border border-emerald-500/20 shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tight text-foreground">¡Contraseña Cambiada!</h2>
                <p className="text-sm text-muted-foreground">
                  Tu clave ha sido actualizada. Ya puedes iniciar sesión con tu nueva contraseña.
                </p>
              </div>

              <button
                onClick={() => navigate({ to: "/auth" })}
                className="w-full rounded-full bg-foreground text-background py-3.5 text-sm font-bold shadow-md transition-all hover:bg-foreground/90 hover:scale-[1.01] active:scale-[0.98]"
              >
                Ir a Iniciar Sesión
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-foreground">Crear nueva contraseña</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Ingresa tu nueva clave para volver a acceder a Hey Ely.
                </p>
              </div>

              <form onSubmit={submit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground/80">Nueva contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="password"
                      required
                      minLength={8}
                      placeholder="••••••••"
                      className="w-full rounded-2xl border border-border/80 bg-background/80 pl-10 pr-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground/80">Confirmar contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="password"
                      required
                      minLength={8}
                      placeholder="••••••••"
                      className="w-full rounded-2xl border border-border/80 bg-background/80 pl-10 pr-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  disabled={loading}
                  className="w-full rounded-full bg-foreground text-background py-3.5 text-sm font-bold shadow-md disabled:opacity-60 transition-all hover:bg-foreground/90 hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar contraseña"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}