// src/routes/confirm-email.tsx
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LogoMark } from "@/components/brand";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/confirm-email")({
  head: () => ({ meta: [{ title: "Confirmando correo — Hey Ely" }] }),
  component: ConfirmEmailPage,
});

function ConfirmEmailPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const navigate = useNavigate();

  useEffect(() => {
    // Escuchar si Supabase valida la sesión desde el token en la URL
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        setStatus("success");
      }
    });

    supabase.auth.getSession().then(({ data, error }) => {
      if (data.session) {
        setStatus("success");
      } else if (error) {
        setStatus("error");
      } else {
        // Breve espera por si el cliente de Supabase procesa el hash
        setTimeout(async () => {
          const { data: retry } = await supabase.auth.getSession();
          if (retry.session) {
            setStatus("success");
          } else {
            setStatus("error");
          }
        }, 800);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-background text-foreground">
        <div className="max-w-md w-full p-8 bg-card/70 backdrop-blur-2xl border border-border/80 rounded-3xl text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
          <h2 className="text-xl font-bold">Enlace inválido o expirado</h2>
          <p className="text-xs text-muted-foreground">
            No pudimos confirmar tu correo. Es posible que el enlace haya caducado o ya haya sido utilizado.
          </p>
          <button
            onClick={() => navigate({ to: "/auth" })}
            className="w-full py-3 bg-foreground text-background font-bold rounded-full text-sm"
          >
            Ir al inicio de sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background text-foreground">
      <div className="max-w-md w-full p-8 bg-card/70 backdrop-blur-2xl border border-border/80 rounded-3xl text-center space-y-4">
        <LogoMark className="mx-auto" />
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
        <h2 className="text-2xl font-black">¡Correo confirmado!</h2>
        <p className="text-sm text-muted-foreground">
          Tu cuenta ha sido activada con éxito. Ya puedes empezar a usar Hey Ely.
        </p>
        <button
          onClick={() => navigate({ to: "/app" })} // Cambia "/app" a tu pantalla principal
          className="w-full py-3.5 bg-foreground text-background font-bold rounded-full text-sm shadow-md"
        >
          Ir a la aplicación
        </button>
      </div>
    </div>
  );
}