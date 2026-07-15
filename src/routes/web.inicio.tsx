import { createFileRoute } from "@tanstack/react-router";
import { ElyMascot } from "@/components/brand";

export const Route = createFileRoute("/web/inicio")({
  head: () => ({ meta: [{ title: "Hey Ely — Módulo Web" }] }),
  component: () => (
    <div className="text-center py-10">
      <ElyMascot className="w-64 mx-auto" />
      <h1 className="mt-6 text-4xl font-extrabold">Estás a punto de ingresar al módulo web</h1>
      <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
        Aquí encontrarás información sobre nuestra plataforma, recursos, noticias y formas de contacto en nuestro entorno web oficial.
      </p>
      
      {/* Usamos una etiqueta <a> normal para enlaces externos fuera del router */}
      <a 
        href="https://hey-ely-ears-to-you.lovable.app/" 
        target="_blank" 
        rel="noopener noreferrer"
        className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-primary-foreground font-bold shadow-soft transition-transform hover:scale-105"
      >
        Ingresar a la web
      </a>
    </div>
  ),
});