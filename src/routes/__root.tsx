import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { App as CapacitorApp } from "@capacitor/app";

import appCss from "../styles.css?url";
import { supabase } from "@/integrations/supabase/client";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="card-soft max-w-md text-center p-10">
        <div className="text-7xl">🐘</div>
        <h1 className="mt-4 text-3xl font-bold">Ups, no encontramos esta página</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Ely está buscándola por ti. Mientras tanto, vuelve al inicio.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-primary-foreground font-semibold shadow-soft hover:opacity-90 transition"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="card-soft max-w-md text-center p-10">
        <h1 className="text-xl font-bold">Algo salió mal</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Ely no pudo cargar esta página. Intenta de nuevo.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft"
          >
            Reintentar
          </button>
          <a href="/" className="rounded-full border bg-background px-5 py-2.5 text-sm font-semibold">
            Inicio
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Hey Ely — Bienestar emocional para adolescentes" },
      {
        name: "description",
        content:
          "Hey Ely es la plataforma de bienestar emocional que acompaña a adolescentes, familias e instituciones educativas con IA empática, actividades, recursos y prevención.",
      },
      { name: "theme-color", content: "#b8c6ee" },
      { property: "og:title", content: "Hey Ely — Bienestar emocional" },
      {
        property: "og:description",
        content: "IA empática, actividades y recursos para el bienestar emocional de adolescentes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Quicksand:wght@500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  // 1. Escuchar cambios de autenticación de Supabase
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        router.invalidate();
        if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [router, queryClient]);

  // 2. Escuchar el botón atrás físico/gesto del celular (Capacitor)
  useEffect(() => {
    const backButtonListener = CapacitorApp.addListener("backButton", () => {
      if (window.history.length > 1) {
        router.history.back();
      } else {
        CapacitorApp.minimizeApp();
      }
    });

    return () => {
      backButtonListener.then((handler) => handler.remove());
    };
  }, [router]);

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster richColors position="top-center" />
    </QueryClientProvider>
  );
}