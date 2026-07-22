import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LogoMark, ElyMascot } from "@/components/brand";
import { toast } from "sonner";
import { 
  Search, 
  ArrowLeft, 
  GraduationCap, 
  User, 
  Building2, 
  Check, 
  Loader2, 
  Lock, 
  Mail, 
  UserCheck 
} from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Ingresar — Hey Ely" }] }),
  component: AuthPage,
});

type Mode = "signin" | "student" | "admin" | "natural";

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function AuthPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) {
        const { data: p } = await supabase
          .from("profiles")
          .select("user_type")
          .eq("id", data.session.user.id)
          .maybeSingle();
        navigate({ to: p?.user_type === "admin" ? "/admin" : "/app" });
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-background text-foreground antialiased selection:bg-primary/15 selection:text-primary relative overflow-x-hidden">
      
      {/* Dynamic Glow Background Effects */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-primary/10 via-cyan-500/5 to-transparent blur-[140px] rounded-full" />
        <div className="absolute bottom-[10%] -left-[10%] w-[450px] h-[450px] bg-slate-500/5 blur-[140px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Left Column (Brand Identity & Mascot) */}
        <div className="md:col-span-5 text-center md:text-left space-y-6">
          <Link to="/" className="inline-block transition-transform hover:scale-[1.02]">
            <LogoMark />
          </Link>

          <div className="space-y-3">
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
              Hola, soy <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-cyan-600 to-slate-800">Ely</span>
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-sm mx-auto md:mx-0 leading-relaxed font-normal">
              Elige cómo quieres empezar. Un entorno seguro, totalmente privado y confidencial.
            </p>
          </div>

          <div className="pt-2 hidden md:flex justify-center md:justify-start">
            <div className="p-6 rounded-3xl border border-border/60 bg-gradient-to-b from-card/80 to-card/20 backdrop-blur-xl shadow-xl w-full max-w-[280px]">
              <ElyMascot className="w-full h-auto object-contain drop-shadow-md transition-transform duration-500 hover:scale-[1.03]" />
            </div>
          </div>
        </div>

        {/* Right Column (Form Container) */}
        <div className="md:col-span-7">
          <div className="p-6 sm:p-8 md:p-10 bg-card/70 backdrop-blur-2xl border border-border/80 rounded-3xl shadow-2xl w-full min-w-0 transition-all">
            {mode === "signin" && <SignIn onSwitch={setMode} />}
            {mode === "student" && <StudentSignUp onBack={() => setMode("signin")} />}
            {mode === "admin" && <AdminSignUp onBack={() => setMode("signin")} />}
            {mode === "natural" && <NaturalSignUp onBack={() => setMode("signin")} />}
          </div>
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-foreground">Iniciar sesión</h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">Continúa tu camino de bienestar con Ely.</p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground/80">Correo electrónico</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="email" 
              required 
              placeholder="tu@correo.com" 
              className="w-full rounded-2xl border border-border/80 bg-background/80 pl-10 pr-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground/80">Contraseña</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="password" 
              required 
              placeholder="••••••••" 
              className="w-full rounded-2xl border border-border/80 bg-background/80 pl-10 pr-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
        </div>

        <button 
          disabled={loading} 
          className="w-full rounded-full bg-foreground text-background py-3.5 text-sm font-bold shadow-md disabled:opacity-60 transition-all hover:bg-foreground/90 hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Entrar"}
        </button>
      </form>

      <div className="border-t border-border/60 pt-5 space-y-3">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
          ¿Aún no tienes cuenta? Crea una:
        </span>
        <div className="grid gap-2.5">
          
          <button 
            type="button"
            onClick={() => onSwitch("student")} 
            className="group w-full flex items-center gap-3.5 rounded-2xl border border-border/70 bg-background/40 p-3.5 text-left hover:border-foreground/30 hover:bg-secondary/40 transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-xs sm:text-sm text-foreground">Soy estudiante</div>
              <div className="text-[11px] text-muted-foreground truncate">Pertenezco a un colegio o institución</div>
            </div>
          </button>

          <button 
            type="button"
            onClick={() => onSwitch("natural")} 
            className="group w-full flex items-center gap-3.5 rounded-2xl border border-border/70 bg-background/40 p-3.5 text-left hover:border-foreground/30 hover:bg-secondary/40 transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center shrink-0 border border-cyan-500/20 group-hover:scale-105 transition-transform">
              <User className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-xs sm:text-sm text-foreground">Usuario independiente</div>
              <div className="text-[11px] text-muted-foreground truncate">Acceso personal sin vinculación escolar</div>
            </div>
          </button>

          <button 
            type="button"
            onClick={() => onSwitch("admin")} 
            className="group w-full flex items-center gap-3.5 rounded-2xl border border-border/70 bg-background/40 p-3.5 text-left hover:border-foreground/30 hover:bg-secondary/40 transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-500/10 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 border border-slate-500/20 group-hover:scale-105 transition-transform">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-xs sm:text-sm text-foreground">Administrador Institucional</div>
              <div className="text-[11px] text-muted-foreground truncate">Rectores, directivos o psicorientadores</div>
            </div>
          </button>

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
      const { data } = await supabase
        .from("institutions")
        .select("id,name,city,department")
        .ilike("name", `%${q}%`)
        .limit(5);
      setResults(data ?? []);
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!inst) return toast.error("Por favor, selecciona tu institución educativa.");
    setLoading(true);

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

    await supabase.from("profiles").update({ institution_id: inst.id }).eq("id", data.user.id);

    setLoading(false);
    toast.success(`¡Bienvenido/a, ${f.full_name.split(" ")[0]}!`);
    navigate({ to: "/app" });
  }

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 hover:text-foreground transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Volver al ingreso
      </button>

      <div>
        <h2 className="text-2xl font-black tracking-tight text-foreground">Registro de Estudiante</h2>
        <p className="text-xs text-muted-foreground mt-1">Conecta con tu comunidad educativa.</p>
      </div>

      <form onSubmit={submit} className="space-y-3.5">
        <input 
          required 
          placeholder="Nombre completo" 
          className="w-full rounded-2xl border border-border/80 bg-background/80 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" 
          value={f.full_name} 
          onChange={(e) => setF({ ...f, full_name: e.target.value })} 
        />
        
        <div className="grid grid-cols-3 gap-2.5">
          <input 
            required 
            type="number" 
            min={8} 
            max={30} 
            placeholder="Edad" 
            className="rounded-2xl border border-border/80 bg-background/80 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" 
            value={f.age} 
            onChange={(e) => setF({ ...f, age: e.target.value })} 
          />
          <input 
            required 
            placeholder="Grado" 
            className="rounded-2xl border border-border/80 bg-background/80 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" 
            value={f.grade} 
            onChange={(e) => setF({ ...f, grade: e.target.value })} 
          />
          <input 
            placeholder="Curso (opc.)" 
            className="rounded-2xl border border-border/80 bg-background/80 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" 
            value={f.course} 
            onChange={(e) => setF({ ...f, course: e.target.value })} 
          />
        </div>

        <input 
          required 
          type="email" 
          placeholder="Correo electrónico" 
          className="w-full rounded-2xl border border-border/80 bg-background/80 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" 
          value={f.email} 
          onChange={(e) => setF({ ...f, email: e.target.value })} 
        />
        
        <input 
          required 
          type="password" 
          minLength={8} 
          placeholder="Contraseña (mín. 8 caracteres)" 
          className="w-full rounded-2xl border border-border/80 bg-background/80 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" 
          value={f.password} 
          onChange={(e) => setF({ ...f, password: e.target.value })} 
        />

        {/* Vincular Institución */}
        <div className="rounded-2xl border border-border/80 bg-secondary/30 p-3.5 space-y-2.5">
          <div className="text-xs font-bold text-foreground/80 flex items-center justify-between">
            <span>Vincular mi Institución</span>
            {inst && <Check className="w-3.5 h-3.5 text-emerald-600" />}
          </div>
          
          {inst ? (
            <div className="flex items-center justify-between bg-background p-3 rounded-xl border border-primary/40 shadow-xs">
              <div className="min-w-0 flex-1 pr-2">
                <div className="font-bold text-xs sm:text-sm text-foreground truncate">{inst.name}</div>
                <div className="text-[11px] text-muted-foreground truncate">{inst.city}</div>
              </div>
              <button 
                type="button" 
                onClick={() => { setInst(null); setQ(""); }} 
                className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors shrink-0"
              >
                Cambiar
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 rounded-xl border border-border/80 bg-background px-3 py-2.5">
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <input 
                  placeholder="Escribe el nombre de tu colegio..." 
                  value={q} 
                  onChange={(e) => setQ(e.target.value)} 
                  className="flex-1 bg-transparent outline-none text-xs sm:text-sm" 
                />
              </div>

              {results.length > 0 && (
                <div className="space-y-1.5 max-h-36 overflow-y-auto mt-2 border-t border-border/40 pt-2">
                  {results.map((r) => (
                    <button 
                      key={r.id} 
                      type="button" 
                      onClick={() => setInst(r)} 
                      className="w-full text-left rounded-xl border border-border/60 bg-background p-2.5 hover:border-primary/50 hover:bg-secondary/30 transition-all"
                    >
                      <div className="text-xs font-bold text-foreground truncate">{r.name}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{r.city}, {r.department}</div>
                    </button>
                  ))}
                </div>
              )}

              {q.trim() && results.length === 0 && (
                <div className="text-[11px] text-muted-foreground bg-background p-2.5 rounded-xl border border-border/60 mt-1">
                  No se encontró la institución. Verifica la ortografía o solicita a tu colegio registrar la cuenta primero.
                </div>
              )}
            </>
          )}
        </div>

        <button 
          disabled={loading} 
          className="w-full rounded-full bg-foreground text-background py-3.5 text-sm font-bold shadow-md disabled:opacity-60 transition-all hover:bg-foreground/90 hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Comenzar con Ely"}
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
    
    const { data: exists } = await supabase
      .from("institutions")
      .select("id")
      .ilike("name", f.institution)
      .ilike("city", f.city)
      .ilike("department", f.department)
      .maybeSingle();

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
      return toast.error("Se creó el usuario, pero ocurrió un problema al registrar el colegio."); 
    }
    
    await supabase.from("profiles").update({ institution_id: instRow.id }).eq("id", data.user.id);
    setLoading(false);
    toast.success("Institución y administrador registrados con éxito");
    navigate({ to: "/admin" });
  }

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 hover:text-foreground transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Volver al ingreso
      </button>

      <div>
        <h2 className="text-2xl font-black tracking-tight text-foreground">Registro Institucional</h2>
        <p className="text-xs text-muted-foreground mt-1">Exclusivo para directivos y equipos de orientación escolar.</p>
      </div>

      <form onSubmit={submit} className="space-y-3">
        <input 
          required 
          placeholder="Nombre completo" 
          className="w-full rounded-2xl border border-border/80 bg-background/80 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" 
          value={f.full_name} 
          onChange={(e) => setF({ ...f, full_name: e.target.value })} 
        />
        <input 
          required 
          placeholder="Cargo (Rector, Psicorientador, Coordinator)" 
          className="w-full rounded-2xl border border-border/80 bg-background/80 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" 
          value={f.position} 
          onChange={(e) => setF({ ...f, position: e.target.value })} 
        />
        <input 
          required 
          placeholder="Nombre oficial del Colegio / Institución" 
          className="w-full rounded-2xl border border-border/80 bg-background/80 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" 
          value={f.institution} 
          onChange={(e) => setF({ ...f, institution: e.target.value })} 
        />
        
        <div className="grid grid-cols-2 gap-2.5">
          <input 
            required 
            placeholder="Ciudad / Municipio" 
            className="rounded-2xl border border-border/80 bg-background/80 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" 
            value={f.city} 
            onChange={(e) => setF({ ...f, city: e.target.value })} 
          />
          <input 
            required 
            placeholder="Departamento" 
            className="rounded-2xl border border-border/80 bg-background/80 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" 
            value={f.department} 
            onChange={(e) => setF({ ...f, department: e.target.value })} 
          />
        </div>

        <input 
          required 
          type="email" 
          placeholder="Correo institucional" 
          className="w-full rounded-2xl border border-border/80 bg-background/80 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" 
          value={f.email} 
          onChange={(e) => setF({ ...f, email: e.target.value })} 
        />
        <input 
          required 
          type="password" 
          minLength={8} 
          placeholder="Contraseña (mín. 8 caracteres)" 
          className="w-full rounded-2xl border border-border/80 bg-background/80 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" 
          value={f.password} 
          onChange={(e) => setF({ ...f, password: e.target.value })} 
        />

        <button 
          disabled={loading} 
          className="w-full rounded-full bg-foreground text-background py-3.5 text-sm font-bold shadow-md disabled:opacity-60 transition-all hover:bg-foreground/90 hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Registrar Institución"}
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
    <div className="space-y-5">
      <button onClick={onBack} className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 hover:text-foreground transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Volver al ingreso
      </button>

      <div>
        <h2 className="text-2xl font-black tracking-tight text-foreground">Cuenta Personal</h2>
        <p className="text-xs text-muted-foreground mt-1">Acompañamiento individual libre e independiente.</p>
      </div>

      <form onSubmit={submit} className="space-y-3.5">
        <input 
          required 
          placeholder="Tu nombre completo" 
          className="w-full rounded-2xl border border-border/80 bg-background/80 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" 
          value={f.full_name} 
          onChange={(e) => setF({ ...f, full_name: e.target.value })} 
        />
        <input 
          required 
          type="number" 
          min={8} 
          placeholder="Edad" 
          className="w-full rounded-2xl border border-border/80 bg-background/80 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" 
          value={f.age} 
          onChange={(e) => setF({ ...f, age: e.target.value })} 
        />
        <input 
          required 
          type="email" 
          placeholder="Correo electrónico" 
          className="w-full rounded-2xl border border-border/80 bg-background/80 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" 
          value={f.email} 
          onChange={(e) => setF({ ...f, email: e.target.value })} 
        />
        <input 
          required 
          type="password" 
          minLength={8} 
          placeholder="Contraseña (mín. 8 caracteres)" 
          className="w-full rounded-2xl border border-border/80 bg-background/80 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" 
          value={f.password} 
          onChange={(e) => setF({ ...f, password: e.target.value })} 
        />

        <button 
          disabled={loading} 
          className="w-full rounded-full bg-foreground text-background py-3.5 text-sm font-bold shadow-md disabled:opacity-60 transition-all hover:bg-foreground/90 hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Crear cuenta"}
        </button>
      </form>
    </div>
  );
}