import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LogoMark, ElyMascot } from "@/components/brand";
import { toast } from "sonner";
import { Search, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Ingresar — Hey Ely" }] }),
  component: AuthPage,
});

type Mode = "signin" | "student" | "admin" | "natural";

function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function AuthPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) {
        const { data: p } = await supabase.from("profiles").select("user_type").eq("id", data.session.user.id).maybeSingle();
        navigate({ to: p?.user_type === "admin" ? "/admin" : "/app" });
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-background overflow-x-hidden">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="text-center md:text-left space-y-4">
          <Link to="/" className="inline-block"><LogoMark /></Link>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Hola, soy <span className="text-primary">Ely</span>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-sm mx-auto md:mx-0">
            Elige cómo quieres empezar. Es rápido, seguro y privado.
          </p>
          <div className="mt-6 hidden md:flex justify-center md:justify-start">
            <ElyMascot className="w-64 h-auto object-contain" />
          </div>
        </div>
        <div className="card-soft p-5 md:p-8 bg-card border rounded-3xl shadow-xl w-full min-w-0">
          {mode === "signin" && <SignIn onSwitch={setMode} />}
          {mode === "student" && <StudentSignUp onBack={() => setMode("signin")} />}
          {mode === "admin" && <AdminSignUp onBack={() => setMode("signin")} />}
          {mode === "natural" && <NaturalSignUp onBack={() => setMode("signin")} />}
        </div>
      </div>
    </div>
  );
}

function SignIn({ onSwitch }: { onSwitch: (m: Mode) => void }) {
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault(); 
    setLoading(true);
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      setLoading(false);
      return toast.error(error.message);
    }
    
    const { data: p } = await supabase.from("profiles").select("user_type").eq("id", data.user.id).maybeSingle();
    setLoading(false);
    toast.success("¡Bienvenido/a de vuelta!");
    navigate({ to: p?.user_type === "admin" ? "/admin" : "/app" });
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl md:text-2xl font-black">Iniciar sesión</h2>
        <p className="text-xs md:text-sm text-muted-foreground">Continúa tu camino con Ely.</p>
      </div>
      <form onSubmit={submit} className="space-y-3">
        <input type="email" required placeholder="Correo electrónico" className="w-full rounded-2xl border bg-background p-3 text-sm" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" required placeholder="Contraseña" className="w-full rounded-2xl border bg-background p-3 text-sm" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button disabled={loading} className="w-full rounded-full bg-primary text-primary-foreground py-3 text-sm font-bold shadow-md disabled:opacity-60 transition-transform active:scale-95">
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
      <div className="border-t pt-4 text-xs md:text-sm">
        <div className="font-extrabold mb-2 text-foreground/80">¿Aún no tienes cuenta?</div>
        <div className="grid gap-2">
          <button onClick={() => onSwitch("student")} className="rounded-2xl border p-3 text-left hover:bg-secondary/60 transition-colors"><span className="font-bold text-primary">Soy estudiante</span> <span className="text-muted-foreground">— pertenezco a un colegio</span></button>
          <button onClick={() => onSwitch("natural")} className="rounded-2xl border p-3 text-left hover:bg-secondary/60 transition-colors"><span className="font-bold text-purple-600">Soy usuario natural</span> <span className="text-muted-foreground">— sin institución</span></button>
          <button onClick={() => onSwitch("admin")} className="rounded-2xl border p-3 text-left hover:bg-secondary/60 transition-colors"><span className="font-bold text-emerald-600">Soy administrador institucional</span> <span className="text-muted-foreground">— rector, orientador...</span></button>
        </div>
      </div>
    </div>
  );
}

function StudentSignUp({ onBack }: { onBack: () => void }) {
  const [f, setF] = useState({ full_name: "", age: "", grade: "", course: "", email: "", password: "" });
  const [inst, setInst] = useState<{ id: string; name: string; city: string } | null>(null);
  const [q, setQ] = useState(""); 
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!q.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      const { data } = await supabase.from("institutions").select("id,name,city,department").ilike("name", `%${q}%`).limit(5);
      setResults(data ?? []);
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!inst) return toast.error("Por favor, selecciona tu institución educativa.");
    setLoading(true);

    // SOLUCIÓN: Inyectamos el institution_id directamente en metadata para que el trigger de profiles lo capture sin delays
    const { data, error } = await supabase.auth.signUp({
      email: f.email,
      password: f.password,
      options: { 
        data: { 
          user_type: "student", 
          full_name: f.full_name, 
          age: parseInt(f.age), 
          grade: f.grade, 
          course: f.course,
          institution_id: inst.id 
        } 
      },
    });

    if (error || !data.user) { 
      setLoading(false); 
      return toast.error(error?.message ?? "Error al registrar el estudiante"); 
    }

    // Doble verificación: Si tu trigger no maneja metadata, este fallback guardará la relación de respaldo de manera segura
    await supabase.from("profiles").update({ institution_id: inst.id }).eq("id", data.user.id);

    setLoading(false);
    toast.success(`¡Bienvenido/a, ${f.full_name.split(" ")[0]}!`);
    navigate({ to: "/app" });
  }

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground"><ArrowLeft className="h-3 w-3" /> Volver</button>
      <h2 className="text-xl md:text-2xl font-black">Registro de Estudiante</h2>
      <form onSubmit={submit} className="space-y-2.5">
        <input required placeholder="Nombre completo" className="w-full rounded-2xl border bg-background p-3 text-sm" value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} />
        <div className="grid grid-cols-3 gap-2">
          <input required type="number" min={8} max={30} placeholder="Edad" className="rounded-2xl border bg-background p-3 text-sm" value={f.age} onChange={(e) => setF({ ...f, age: e.target.value })} />
          <input required placeholder="Grado" className="rounded-2xl border bg-background p-3 text-sm" value={f.grade} onChange={(e) => setF({ ...f, grade: e.target.value })} />
          <input placeholder="Curso (opc.)" className="rounded-2xl border bg-background p-3 text-sm" value={f.course} onChange={(e) => setF({ ...f, course: e.target.value })} />
        </div>
        <input required type="email" placeholder="Correo electrónico" className="w-full rounded-2xl border bg-background p-3 text-sm" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <input required type="password" minLength={8} placeholder="Contraseña (mín. 8 caracteres)" className="w-full rounded-2xl border bg-background p-3 text-sm" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />

        {/* Sección del buscador de colegios */}
        <div className="rounded-2xl border bg-secondary/20 p-3 space-y-2">
          <div className="text-xs font-bold text-foreground/80">Vincular mi Institución</div>
          {inst ? (
            <div className="flex items-center justify-between bg-background p-2.5 rounded-xl border border-primary/30">
              <div className="min-w-0 flex-1 pr-2">
                <div className="font-bold text-sm text-primary truncate">{inst.name}</div>
                <div className="text-xs text-muted-foreground truncate">{inst.city}</div>
              </div>
              <button type="button" onClick={() => { setInst(null); setQ(""); }} className="text-xs font-bold text-destructive hover:underline shrink-0">Cambiar</button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2">
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <input placeholder="Escribe el nombre de tu colegio..." value={q} onChange={(e) => setQ(e.target.value)} className="flex-1 bg-transparent outline-none text-sm" />
              </div>
              {results.length > 0 && (
                <div className="space-y-1 max-h-36 overflow-y-auto mt-2 border-t pt-2">
                  {results.map((r) => (
                    <button key={r.id} type="button" onClick={() => setInst(r)} className="w-full text-left rounded-xl border bg-background p-2 hover:border-primary/50 hover:bg-secondary/20 transition-all">
                      <div className="text-xs font-bold text-foreground truncate">{r.name}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{r.city}, {r.department}</div>
                    </button>
                  ))}
                </div>
              )}
              {q.trim() && results.length === 0 && (
                <div className="text-[11px] text-amber-600 bg-amber-500/5 p-2 rounded-xl border border-amber-500/10 mt-1">
                  No encontramos ese colegio. Asegúrate de escribirlo bien o pídele al orientador o rector de tu plantel que cree la cuenta institucional primero.
                </div>
              )}
            </>
          )}
        </div>

        <button disabled={loading} className="w-full rounded-full bg-primary text-primary-foreground py-3 text-sm font-bold shadow-md disabled:opacity-60">
          {loading ? "Creando cuenta..." : "Comenzar con Ely"}
        </button>
      </form>
    </div>
  );
}

function AdminSignUp({ onBack }: { onBack: () => void }) {
  const [f, setF] = useState({ full_name: "", position: "", institution: "", city: "", department: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault(); 
    setLoading(true);
    
    const { data: exists } = await supabase.from("institutions").select("id").ilike("name", f.institution).ilike("city", f.city).ilike("department", f.department).maybeSingle();
    if (exists) { 
      setLoading(false); 
      return toast.error("Esta institución ya se encuentra registrada en la plataforma."); 
    }

    const { data, error } = await supabase.auth.signUp({
      email: f.email, 
      password: f.password,
      options: { data: { user_type: "admin", full_name: f.full_name, position: f.position } },
    });
    
    if (error || !data.user) { 
      setLoading(false); 
      return toast.error(error?.message ?? "Error en el registro"); 
    }

    const slug = `${slugify(f.institution)}-${slugify(f.city)}-${Date.now().toString(36)}`;
    const { data: instRow, error: e2 } = await supabase.from("institutions").insert({
      name: f.institution, city: f.city, department: f.department, admin_user_id: data.user.id, slug,
    }).select().single();

    if (e2 || !instRow) { 
      setLoading(false); 
      return toast.error("Se creó tu usuario, pero no pudimos registrar la institución automáticamente."); 
    }
    
    await supabase.from("profiles").update({ institution_id: instRow.id }).eq("id", data.user.id);
    setLoading(false);
    toast.success("Institución y administrador registrados con éxito");
    navigate({ to: "/admin" });
  }

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground"><ArrowLeft className="h-3 w-3" /> Volver</button>
      <h2 className="text-xl md:text-2xl font-black">Registro Institucional</h2>
      <p className="text-xs text-muted-foreground">Exclusivo para directivos y equipos de orientación escolar.</p>
      <form onSubmit={submit} className="space-y-2.5">
        <input required placeholder="Nombre completo" className="w-full rounded-2xl border bg-background p-3 text-sm" value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} />
        <input required placeholder="Cargo (Rector, Psicorientador, Coordinador)" className="w-full rounded-2xl border bg-background p-3 text-sm" value={f.position} onChange={(e) => setF({ ...f, position: e.target.value })} />
        <input required placeholder="Nombre oficial del Colegio / Institución" className="w-full rounded-2xl border bg-background p-3 text-sm" value={f.institution} onChange={(e) => setF({ ...f, institution: e.target.value })} />
        <div className="grid grid-cols-2 gap-2">
          <input required placeholder="Ciudad / Municipio" className="rounded-2xl border bg-background p-3 text-sm" value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} />
          <input required placeholder="Departamento" className="rounded-2xl border bg-background p-3 text-sm" value={f.department} onChange={(e) => setF({ ...f, department: e.target.value })} />
        </div>
        <input required type="email" placeholder="Correo institucional" className="w-full rounded-2xl border bg-background p-3 text-sm" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <input required type="password" minLength={8} placeholder="Contraseña (mín. 8 caracteres)" className="w-full rounded-2xl border bg-background p-3 text-sm" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
        <button disabled={loading} className="w-full rounded-full bg-primary text-primary-foreground py-3 text-sm font-bold shadow-md disabled:opacity-60">
          {loading ? "Registrando plantel..." : "Registrar Institución"}
        </button>
      </form>
    </div>
  );
}

function NaturalSignUp({ onBack }: { onBack: () => void }) {
  const [f, setF] = useState({ full_name: "", age: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault(); 
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: f.email, 
      password: f.password,
      options: { data: { user_type: "natural", full_name: f.full_name, age: parseInt(f.age) } },
    });
    setLoading(false);
    if (error || !data.user) return toast.error(error?.message ?? "Error");
    toast.success(`¡Bienvenido/a, ${f.full_name.split(" ")[0]}!`);
    navigate({ to: "/app" });
  }

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground"><ArrowLeft className="h-3 w-3" /> Volver</button>
      <h2 className="text-xl md:text-2xl font-black">Cuenta Personal</h2>
      <form onSubmit={submit} className="space-y-2.5">
        <input required placeholder="Tu nombre" className="w-full rounded-2xl border bg-background p-3 text-sm" value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} />
        <input required type="number" min={8} placeholder="Edad" className="w-full rounded-2xl border bg-background p-3 text-sm" value={f.age} onChange={(e) => setF({ ...f, age: e.target.value })} />
        <input required type="email" placeholder="Correo electrónico" className="w-full rounded-2xl border bg-background p-3 text-sm" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <input required type="password" minLength={8} placeholder="Contraseña (mín. 8)" className="w-full rounded-2xl border bg-background p-3 text-sm" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
        <button disabled={loading} className="w-full rounded-full bg-primary text-primary-foreground py-3 text-sm font-bold shadow-md disabled:opacity-60">
          {loading ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>
    </div>
  );
}