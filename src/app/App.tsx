import { useState, useRef, useCallback, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid
} from "recharts";
import {
  MapPin, Car, Clock, Star, Shield, Zap, Search, Filter, Plus,
  ChevronRight, ChevronLeft, Check, X, TrendingUp, Users, DollarSign,
  Activity, Navigation, Bike, Camera, ArrowRight, Calendar, CreditCard,
  Wallet, Building2, Menu, Sparkles, Target, Leaf, CheckCircle, XCircle,
  Upload, BarChart3, Layers, Eye, Phone, Twitter, Linkedin, Instagram,
  ParkingSquare, CircleParking, Fuel, Wind, Mail, Share2, Copy,
  AlertCircle, EyeOff, Loader2, QrCode, MessageCircle, Route, Milestone
} from "lucide-react";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  reload
} from "firebase/auth"; 
import { auth, db, storage } from "../firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

/* ─── Types ─── */
type Page =
  | "landing" | "login" | "signup" | "forgot-password" | "verify-email" | "auth-success"
  | "driver" | "search" | "details" | "booking" | "owner" | "add-spot"
  | "ai-analysis" | "smart-allocation" | "manage-spots" | "community";

type AuthUser = { name: string; email: string; role: "driver" | "owner" };

type SpotType = {
  id: number; name: string; building: string; block: string;
  area: string; address: string; landmark: string; entry: string;
  coords: { lat: number; lng: number };
  dist: string; walkTime: string; driveTime: string;
  price: number; avail: string; score: number; rating: number;
  img: string; vehicles: string[]; safety: number;
  cover: boolean; cctv: boolean; guard: boolean; ev: boolean; open24: boolean;
  owner: { name: string; phone: string; rating: number };
};

/* ─── Colors ─── */
const BLUE = "#6D28D9";
const SKY = "#7C3AED";
const NAVY = "#1A1535";
const GREEN = "#059669";
const AMBER = "#F59E0B";
const PURPLE = "#EC4899";
const RED = "#F43F5E";
const VIOLET = "#8B5CF6";
const INDIGO = "#4F46E5";

/* ─── Data ─── */
const spots: SpotType[] = [
  {
    id: 1, name: "Green Residency Visitor Parking", 
    building: "Green Residency Apartment", block: "Block B · B1 Basement",
    area: "Koramangala", address: "4th Cross Road, Koramangala 5th Block, Bangalore – 560095",
    landmark: "Opposite Forum Mall, next to Star Bazaar supermarket",
    entry: "Enter through Gate 2 on 4th Cross Road. Visitor parking is on the B1 basement level. Show booking QR at the security cabin to receive entry pass.",
    coords: { lat: 12.9352, lng: 77.6245 },
    dist: "0.3 km", walkTime: "4 min", driveTime: "2 min",
    price: 40, avail: "Available", score: 97, rating: 4.9,
    img: "photo-1590674899484-d5640e854abe",
    vehicles: ["bike","hatchback","sedan"], safety: 9.2,
    cover: true, cctv: true, guard: true, ev: false, open24: true,
    owner: { name: "Rajesh Kumar", phone: "+91 98765 43210", rating: 4.9 },
  
  },
  {
    id: 2, name: "Indiranagar 100ft Road Hub",
    building: "Kumar's Commercial Complex", block: "Ground Floor · Open Lot",
    area: "Indiranagar", address: "100 Feet Road, Indiranagar, Bangalore – 560038",
    landmark: "Near Toit Brewpub, directly opposite HDFC Bank ATM",
    entry: "Enter from the service lane on 100ft Road. Attendant available 8am–10pm. After hours use the digital lock code sent in your booking confirmation email.",
    coords: { lat: 12.9784, lng: 77.6408 },
    dist: "0.7 km", walkTime: "9 min", driveTime: "4 min",
    price: 55, avail: "3 left", score: 91, rating: 4.7,
    img: "photo-1506521781263-d8422e82f27a",
    vehicles: ["bike","hatchback","sedan","suv"], safety: 8.8,
    cover: false, cctv: true, guard: false, ev: true, open24: true,
    owner: { name: "Anita Rao", phone: "+91 87654 32109", rating: 4.7 },
  },
  {
    id: 3, name: "HSR Layout Society Parking",
    building: "Sobha Silicon Oasis Towers", block: "Tower C · Visitor Lot",
    area: "HSR Layout", address: "Sector 2, HSR Layout, Bangalore – 560102",
    landmark: "Near HSR Club, behind Narayana Hrudayalaya Hospital",
    entry: "Use the visitor entrance on Sector 2 main road. Register at security desk with your booking ID. Allocated spot number will be assigned on arrival.",
    coords: { lat: 12.9116, lng: 77.6382 },
    dist: "1.2 km", walkTime: "15 min", driveTime: "6 min",
    price: 30, avail: "Available", score: 88, rating: 4.5,
    img: "photo-1558618666-fcd25c85cd64",
    vehicles: ["bike","hatchback"], safety: 8.1,
    cover: true, cctv: true, guard: true, ev: false, open24: true,
    owner: { name: "Suresh Patel", phone: "+91 76543 21098", rating: 4.5 },
  },
  {
    id: 4, name: "Whitefield IT Park Premium",
    building: "Prestige Tech Park", block: "Basement Level 2 · Visitor Zone",
    area: "Whitefield", address: "EPIP Zone, Whitefield Main Road, Bangalore – 560066",
    landmark: "Inside Prestige Tech Park, Gate 1 near ITPL Metro Station",
    entry: "Enter through Gate 1 main entrance. Proceed to Basement 2 via the left ramp. Visitor zone is marked in blue. Show QR code at the boom barrier for automatic entry.",
    coords: { lat: 12.9698, lng: 77.7499 },
    dist: "2.4 km", walkTime: "30 min", driveTime: "12 min",
    price: 70, avail: "1 left", score: 85, rating: 4.8,
    img: "photo-1573348722427-f1d6819fdf98",
    vehicles: ["bike","hatchback","sedan","suv"], safety: 9.5,
    cover: true, cctv: true, guard: true, ev: true, open24: true,
    owner: { name: "Meera Nair", phone: "+91 65432 10987", rating: 4.8 },
  },
  {
    id: 5, name: "BTM Layout Open Yard",
    building: "Standalone Plot", block: "Open Air · Ground Level",
    area: "BTM Layout", address: "2nd Stage, BTM Layout, Bangalore – 560076",
    landmark: "Adjacent to BTM Bus Terminal, near Udupi Garden Restaurant",
    entry: "Open lot with no gates. Park only in numbered slots. Contact owner via the app to receive your slot number before arriving.",
    coords: { lat: 12.9166, lng: 77.6101 },
    dist: "1.8 km", walkTime: "22 min", driveTime: "9 min",
    price: 25, avail: "Available", score: 79, rating: 4.3,
    img: "photo-1592853625511-ad0edcc69c07",
    vehicles: ["bike","hatchback","sedan"], safety: 7.8,
    cover: false, cctv: false, guard: false, ev: false, open24: true,
    owner: { name: "Vikram Singh", phone: "+91 54321 09876", rating: 4.3 },
  },
];

const earningsData = [
  { month: "Jan", earnings: 4200 }, { month: "Feb", earnings: 5800 },
  { month: "Mar", earnings: 5100 }, { month: "Apr", earnings: 7400 },
  { month: "May", earnings: 6800 }, { month: "Jun", earnings: 9200 },
];
const bookingData = [
  { day: "Mon", bookings: 12 }, { day: "Tue", bookings: 19 },
  { day: "Wed", bookings: 15 }, { day: "Thu", bookings: 22 },
  { day: "Fri", bookings: 28 }, { day: "Sat", bookings: 34 },
  { day: "Sun", bookings: 26 },
];

/* ─── QR Code SVG ─── */
function QRCodeSVG({ bookingId }: { bookingId: string }) {
  const SIZE = 29;
  const isFinderPattern = (r: number, c: number): boolean | null => {
    const inTL = r <= 8 && c <= 8;
    const inTR = r <= 8 && c >= SIZE - 9;
    const inBL = r >= SIZE - 9 && c <= 8;
    if (!inTL && !inTR && !inBL) return null;
    let fr = r, fc = c;
    if (inTR) fc = c - (SIZE - 9) + 1;
    if (inBL) fr = r - (SIZE - 9) + 1;
    if (fr === 7 || fc === 7) return false;
    if (fr > 6 || fc > 6) return null;
    return fr === 0 || fr === 6 || fc === 0 || fc === 6 || (fr >= 2 && fr <= 4 && fc >= 2 && fc <= 4);
  };

  const cells = Array.from({ length: SIZE }, (_, r) =>
    Array.from({ length: SIZE }, (_, c): boolean => {
      const fp = isFinderPattern(r, c);
      if (fp !== null) return fp;
      if (r === 6) return c % 2 === 0;
      if (c === 6) return r % 2 === 0;
      const seed = bookingId.charCodeAt((r * 3 + c * 7) % bookingId.length);
      return ((r * 31 + c * 17 + seed) * 2654435761 >>> 0) % 3 !== 0;
    })
  );

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full h-full" shapeRendering="crispEdges">
      <rect width={SIZE} height={SIZE} fill="white" />
      {cells.map((row, r) => row.map((filled, c) =>
        filled ? <rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill={NAVY} /> : null
      ))}
    </svg>
  );
}

/* ─── SpotShare Logo Mark ─── */
function SpotLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <defs>
        <linearGradient id="lgMark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6D28D9"/>
          <stop offset="100%" stopColor="#EC4899"/>
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="12" fill="url(#lgMark)"/>
      <path d="M20 8C15.03 8 11 12.03 11 17c0 6.25 9 17 9 17s9-10.75 9-17c0-4.97-4.03-9-9-9z" fill="white" opacity="0.95"/>
      <circle cx="20" cy="17" r="4.5" fill="url(#lgMark)"/>
      <circle cx="20" cy="17" r="2" fill="white"/>
    </svg>
  );
}

/* ─── Navbar ─── */
function Navbar({ page, setPage, authUser, setAuthUser }: {
  page: Page; setPage: (p: Page) => void;
  authUser: AuthUser | null; setAuthUser: (u: AuthUser | null) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <button onClick={() => setPage("landing")} className="flex items-center gap-2.5 font-bold text-xl" style={{ fontFamily: "Outfit, sans-serif" }}>
          <SpotLogo size={34} />
          <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(135deg, ${BLUE}, ${PURPLE})` }}>SpotShare</span>
        </button>

        <div className="hidden md:flex items-center gap-6">
          {([["landing","Home"],["search","Find Parking"],["add-spot","List Your Space"],["community","About"]] as [Page,string][]).map(([p,l]) => (
            <button key={p} onClick={() => setPage(p)}
              className={`text-sm font-medium transition-colors ${page === p ? "text-blue-600" : "text-slate-600 hover:text-blue-600"}`}
              style={{ fontFamily: "Inter, sans-serif" }}>
              {l}
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {authUser ? (
            <>
              <button onClick={() => setPage(authUser.role === "driver" ? "driver" : "owner")}
                className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: `linear-gradient(135deg, ${BLUE}, ${SKY})` }}>
                  {authUser.name[0]}
                </div>
                {authUser.name.split(" ")[0]}
              </button>
              <button onClick={() => { setAuthUser(null); setPage("landing"); }}
                className="text-sm font-medium text-slate-500 hover:text-red-500 transition-colors px-3 py-1.5">
                Log out
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setPage("login")} className="text-sm font-medium text-slate-500 hover:text-violet-700 px-3 py-1.5 transition-colors" style={{ fontFamily: "Inter, sans-serif" }}>Log in</button>
              <button onClick={() => setPage("signup")} className="text-sm font-semibold text-white px-5 py-2.5 rounded-xl hover:opacity-90 hover:scale-[1.02] transition-all shadow-md" style={{ background: `linear-gradient(135deg, ${BLUE}, ${PURPLE})`, fontFamily: "Inter, sans-serif", boxShadow: `0 4px 14px rgba(109,40,217,0.35)` }}>
                Get Started
              </button>
            </>
          )}
        </div>
        <button className="md:hidden p-2" onClick={() => setOpen(!open)}><Menu size={20} /></button>
      </div>
      {open && (
        <div className="md:hidden bg-white border-t border-border px-4 py-4 flex flex-col gap-3">
          {([["landing","Home"],["search","Find Parking"],["add-spot","List Your Space"],["community","About"]] as [Page,string][]).map(([p,l]) => (
            <button key={p} onClick={() => { setPage(p); setOpen(false); }} className="text-left text-sm font-medium text-slate-700 py-1">{l}</button>
          ))}
          {authUser
            ? <button onClick={() => { setAuthUser(null); setPage("landing"); setOpen(false); }} className="text-left text-sm font-medium text-red-500 py-1">Log out</button>
            : <>
                <button onClick={() => { setPage("login"); setOpen(false); }} className="text-left text-sm font-medium text-slate-700 py-1">Log in</button>
                <button onClick={() => { setPage("signup"); setOpen(false); }} className="text-left text-sm font-semibold py-1" style={{ color: BLUE }}>Sign Up</button>
              </>
          }
        </div>
      )}
    </nav>
  );
}

/* ─── Auth Layout ─── */
function AuthLayout({ children, image, badge, headline, sub }: {
  children: React.ReactNode; image: string; badge: string; headline: string; sub: string;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between p-10 relative overflow-hidden" style={{ background: "radial-gradient(ellipse at 25% 60%, rgba(124,58,237,0.5) 0%, transparent 55%), radial-gradient(ellipse at 75% 20%, rgba(236,72,153,0.35) 0%, transparent 50%), linear-gradient(160deg, #0D0920 0%, #1A0D3B 100%)" }}>
        <div className="absolute inset-0">
          <img src={`https://images.unsplash.com/${image}?w=800&h=1000&fit=crop&auto=format`} alt="" className="w-full h-full object-cover opacity-10" />
        </div>
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage:"linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)", backgroundSize:"32px 32px" }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2.5 font-bold text-xl text-white" style={{ fontFamily: "Outfit, sans-serif" }}>
            <SpotLogo size={28} />
            <span className="text-transparent bg-clip-text" style={{ backgroundImage:"linear-gradient(135deg, #A78BFA, #F472B6)" }}>SpotShare</span>
          </div>
        </div>
        <div className="relative z-10">
          <span className="inline-block text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3 py-1.5 rounded-full mb-5">{badge}</span>
          <h2 className="text-3xl font-bold text-white leading-tight mb-3" style={{ fontFamily: "Outfit, sans-serif" }}>{headline}</h2>
          <p className="text-blue-200 text-sm leading-relaxed">{sub}</p>
          <div className="mt-8 flex gap-4">
            {[["5,000+","Spots"],["10K+","Drivers"],["95%","Utilization"]].map(([v,l]) => (
              <div key={l} className="text-center">
                <div className="text-2xl font-black text-white" style={{ fontFamily: "Outfit, sans-serif" }}>{v}</div>
                <div className="text-xs text-blue-300 mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Right panel */}
      <div className="flex items-center justify-center p-6 sm:p-10 bg-slate-50 pt-24 lg:pt-10">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ─── Login Page ─── */
function LoginPage({ setPage, setAuthUser }: { setPage: (p: Page) => void; setAuthUser: (u: AuthUser) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  

  const handleLogin = async () => {
  setError("");

  if (!email || !password) {
    setError("Please fill in all fields.");
    return;
  }

  setLoading(true);

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    if (!user.emailVerified) {
      setError("Please verify your email before logging in.");
      return;
    }

    setAuthUser({
      name: user.displayName || "User",
      email: user.email || "",
      role: "driver",
    });

    setPage("auth-success");
  } catch (error: any) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};
const handleGoogleLogin = async () => {
  try {
    const provider = new GoogleAuthProvider();

    const result = await signInWithPopup(auth, provider);

    const user = result.user;

    setAuthUser({
      name: user.displayName || "User",
      email: user.email || "",
      role: "driver",
    });

    setPage("auth-success");
  } catch (error: any) {
    alert(error.message);
  }
};

  return (
    <AuthLayout image="photo-1590674899484-d5640e854abe" badge="Welcome Back" headline="Park smarter, earn better — every day." sub="Log in to access your personalized parking dashboard and reservations.">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>Log in to SpotShare</h1>
        <p className="text-sm text-slate-500 mb-7">New here? <button onClick={() => setPage("signup")} className="font-semibold hover:underline" style={{ color: BLUE }}>Create an account</button></p>

        {/* Google */}
        <button  onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-3 border-2 border-slate-200 rounded-xl py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all mb-4">
          <svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-400 font-medium">or</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {error && (
          <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" /> <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email address</label>
            <div className={`flex items-center gap-2 bg-white border-2 rounded-xl px-4 py-3 transition-colors ${email && !email.includes("@") ? "border-red-300" : "border-slate-200 focus-within:border-blue-500"}`}>
              <Mail size={16} className="text-slate-400 flex-shrink-0" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="flex-1 text-sm outline-none bg-transparent text-slate-800 placeholder-slate-400" />
              {email && !email.includes("@") && <AlertCircle size={15} className="text-red-400 flex-shrink-0" />}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-600">Password</label>
              <button onClick={() => setPage("forgot-password")} className="text-xs font-medium hover:underline" style={{ color: BLUE }}>Forgot password?</button>
            </div>
            <div className="flex items-center gap-2 bg-white border-2 border-slate-200 focus-within:border-blue-500 rounded-xl px-4 py-3 transition-colors">
              <Shield size={16} className="text-slate-400 flex-shrink-0" />
              <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password"
                className="flex-1 text-sm outline-none bg-transparent text-slate-800 placeholder-slate-400" onKeyDown={e => e.key === "Enter" && handleLogin()} />
              <button onClick={() => setShowPw(!showPw)} className="text-slate-400 hover:text-slate-600 flex-shrink-0">
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setRemember(!remember)}>
            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${remember ? "border-blue-600 bg-blue-600" : "border-slate-300"}`}>
              {remember && <Check size={10} className="text-white" />}
            </div>
            <span className="text-sm text-slate-600">Remember me for 30 days</span>
          </div>
        </div>

        <button onClick={handleLogin} disabled={loading}
          className="w-full mt-5 py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-70"
          style={{ background: `linear-gradient(135deg, ${BLUE}, ${SKY})` }}>
          {loading ? <><Loader2 size={18} className="animate-spin" /> Signing in…</> : "Sign In →"}
        </button>
      </div>
    </AuthLayout>
  );
}

/* ─── Sign Up Page ─── */
function SignupPage({ setPage, setAuthUser }: { setPage: (p: Page) => void; setAuthUser: (u: AuthUser) => void }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [role, setRole] = useState<"driver" | "owner" | "">("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const upd = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const strength = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();
  const strengthLabels = ["","Weak","Fair","Good","Strong"];
  const strengthColors = ["","#EF4444","#F59E0B","#3B82F6","#10B981"];

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.email.includes("@")) e.email = "Enter a valid email";
    if (form.phone.length < 10) e.phone = "Enter a valid 10-digit number";
    if (form.password.length < 8) e.password = "Password must be at least 8 characters";
    if (form.password !== form.confirm) e.confirm = "Passwords do not match";
    if (!role) e.role = "Please select your role";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
    const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
    );
    await sendEmailVerification(userCredential.user);

    setAuthUser({
        name: form.name,
        email: userCredential.user.email || "",
        role: role as "driver" | "owner"
    });

    setPage("verify-email");
} catch (error: any) {
    console.log(error);
    alert(error.code);

} finally {
    setLoading(false);
}
  };

  const field = (k: keyof typeof form, label: string, type: string, placeholder: string, icon: React.ReactNode, extra?: React.ReactNode) => (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
      <div className={`flex items-center gap-2 bg-white border-2 rounded-xl px-4 py-3 transition-colors ${errors[k] ? "border-red-300" : "border-slate-200 focus-within:border-blue-500"}`}>
        <span className="text-slate-400 flex-shrink-0">{icon}</span>
        <input type={type} value={form[k]} onChange={upd(k)} placeholder={placeholder} className="flex-1 text-sm outline-none bg-transparent text-slate-800 placeholder-slate-400" />
        {extra}
      </div>
      {errors[k] && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors[k]}</p>}
    </div>
  );

  return (
    <AuthLayout image="photo-1573348722427-f1d6819fdf98" badge="Join SpotShare" headline="Start parking smarter or earning from your space today." sub="Join thousands of drivers and space owners building a smarter parking ecosystem.">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>Create your account</h1>
        <p className="text-sm text-slate-500 mb-6">Already have an account? <button onClick={() => setPage("login")} className="font-semibold hover:underline" style={{ color: BLUE }}>Log in</button></p>

        <div className="space-y-4">
          {field("name","Full Name","text","Arjun Sharma",<Users size={16} />)}
          {field("email","Email Address","email","you@example.com",<Mail size={16} />)}
          {field("phone","Phone Number","tel","10-digit mobile number",<Phone size={16} />)}

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
            <div className={`flex items-center gap-2 bg-white border-2 rounded-xl px-4 py-3 transition-colors ${errors.password ? "border-red-300" : "border-slate-200 focus-within:border-blue-500"}`}>
              <Shield size={16} className="text-slate-400 flex-shrink-0" />
              <input type={showPw ? "text" : "password"} value={form.password} onChange={upd("password")} placeholder="Min. 8 characters" className="flex-1 text-sm outline-none bg-transparent text-slate-800 placeholder-slate-400" />
              <button onClick={() => setShowPw(!showPw)} className="text-slate-400 hover:text-slate-600"><EyeOff size={15} /></button>
            </div>
            {form.password && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex gap-1 flex-1">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="flex-1 h-1.5 rounded-full transition-all" style={{ background: i <= strength ? strengthColors[strength] : "#E2E8F0" }} />
                  ))}
                </div>
                <span className="text-xs font-semibold" style={{ color: strengthColors[strength] }}>{strengthLabels[strength]}</span>
              </div>
            )}
            {errors.password && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.password}</p>}
          </div>

          {field("confirm","Confirm Password","password","Re-enter your password",<Check size={16} />,
            form.confirm && (form.password === form.confirm
              ? <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
              : <XCircle size={14} className="text-red-400 flex-shrink-0" />)
          )}

          {/* Role selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">I am a…</label>
            <div className="grid grid-cols-2 gap-3">
              {([["driver","Driver","I want to find and reserve parking",Car],["owner","Space Owner","I want to list and earn from my space",Building2]] as [string,string,string,React.ElementType][]).map(([r,l,d,Icon]) => (
                <button key={r} onClick={() => setRole(r as "driver"|"owner")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center ${role===r ? "border-blue-600 bg-blue-50" : "border-slate-200 hover:border-blue-300 bg-white"}`}>
                  <Icon size={24} className={role===r?"text-blue-600":"text-slate-400"} />
                  <span className={`text-sm font-bold ${role===r?"text-blue-700":"text-slate-700"}`}>{l}</span>
                  <span className={`text-xs leading-tight ${role===r?"text-blue-500":"text-slate-400"}`}>{d}</span>
                  {role===r && <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center"><Check size={11} className="text-white" /></div>}
                </button>
              ))}
            </div>
            {errors.role && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.role}</p>}
          </div>
        </div>

        <button onClick={handleSignup} disabled={loading}
          className="w-full mt-5 py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-70"
          style={{ background: `linear-gradient(135deg, ${BLUE}, ${SKY})` }}>
          {loading ? <><Loader2 size={18} className="animate-spin" />Creating account…</> : "Create Account →"}
        </button>
        <p className="text-xs text-slate-400 text-center mt-4">By creating an account you agree to our Terms of Service and Privacy Policy.</p>
      </div>
    </AuthLayout>
  );
}

/* ─── Forgot Password Page ─── */
function ForgotPasswordPage({ setPage }: { setPage: (p: Page) => void }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <AuthLayout image="photo-1558618666-fcd25c85cd64" badge="Account Recovery" headline="No worries — we'll get you back in." sub="Enter the email linked to your SpotShare account and we'll send a reset link.">
      <div>
        <button onClick={() => setPage("login")} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors">
          <ChevronLeft size={16} /> Back to login
        </button>
        {sent ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: `${GREEN}20` }}>
              <Mail size={30} style={{ color: GREEN }} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>Check your inbox</h2>
            <p className="text-sm text-slate-500 mb-6">We sent a reset link to <strong>{email}</strong>. It expires in 15 minutes.</p>
            <button onClick={() => setPage("verify-email")} className="w-full py-3.5 rounded-xl font-bold text-white" style={{ background: `linear-gradient(135deg, ${BLUE}, ${SKY})` }}>
              Continue to Verification →
            </button>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-slate-900 mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>Forgot password?</h1>
            <p className="text-sm text-slate-500 mb-7">We'll email you a secure link to reset it.</p>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email address</label>
              <div className="flex items-center gap-2 bg-white border-2 border-slate-200 focus-within:border-blue-500 rounded-xl px-4 py-3 transition-colors mb-5">
                <Mail size={16} className="text-slate-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                  className="flex-1 text-sm outline-none bg-transparent text-slate-800 placeholder-slate-400" />
              </div>
              <button onClick={() => { setLoading(true); setTimeout(() => { setSent(true); setLoading(false); }, 1200); }} disabled={!email || loading}
                className="w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-60"
                style={{ background: `linear-gradient(135deg, ${BLUE}, ${SKY})` }}>
                {loading ? <><Loader2 size={18} className="animate-spin" />Sending…</> : "Send Reset Link"}
              </button>
            </div>
          </>
        )}
      </div>
    </AuthLayout>
  );
}

/* ─── Verify Email Page ─── */
function VerifyEmailPage({ setPage }: { setPage: (p: Page) => void }) {
  const [otp, setOtp] = useState(["","","","","",""]);
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);
  const refs = useRef<(HTMLInputElement|null)[]>([]);

  const handleInput = (i: number, v: string) => {
    if (v.length > 1) return;
    const next = [...otp]; next[i] = v;
    setOtp(next);
    if (v && i < 5) refs.current[i+1]?.focus();
  };

  const handleKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) refs.current[i-1]?.focus();
  };

  const handleVerify = async () => {
  setLoading(true);

  try {
    if (!auth.currentUser) {
      alert("No user is signed in.");
      return;
    }
    await auth.currentUser.reload();
    console.log("Current User:", auth.currentUser);
    console.log("Email Verified:", auth.currentUser.emailVerified);

    const verified = auth.currentUser.emailVerified;
    alert("Verified: " + verified);

    if (verified) {
      setPage("auth-success");
    } else {
      alert("Please verify your email first. Then click Verify & Continue again.");
    }
  } catch (error: any) {
    alert(error.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <AuthLayout image="photo-1592853625511-ad0edcc69c07" badge="Email Verification" headline="One last step to secure your account." sub="A 6-digit code was sent to your registered email address. It expires in 10 minutes.">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>Verify your email</h1>
        <p className="text-sm text-slate-500 mb-8">
  Click the verification link sent to your email. After verifying, return here and press <b>Verify & Continue</b>.
</p>
        

        <button onClick={handleVerify} disabled={loading}
          className="w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-60 mb-4"
          style={{ background: `linear-gradient(135deg, ${BLUE}, ${SKY})` }}>
          {loading ? <><Loader2 size={18} className="animate-spin" />Verifying…</> : "Verify & Continue →"}
        </button>

        <div className="text-center">
          {resent ? (
            <p className="text-sm text-green-600 font-medium flex items-center justify-center gap-1"><CheckCircle size={14} />Code resent!</p>
          ) : (
            <button onClick={() => setResent(true)} className="text-sm text-slate-500 hover:text-blue-600 transition-colors">
              Didn't receive any mail? <span className="font-semibold" style={{ color: BLUE }}>Resend</span>
            </button>
          )}
        </div>
      </div>
    </AuthLayout>
  );
}

/* ─── Auth Success Page ─── */
function AuthSuccessPage({ setPage, authUser }: { setPage: (p: Page) => void; authUser: AuthUser | null }) {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(160deg, #0A0F1E 0%, #1E3A8A 100%)", fontFamily: "Inter, sans-serif" }}>
      <div className="text-center max-w-md mx-auto px-4">
        <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: `${GREEN}25`, border: `3px solid ${GREEN}40` }}>
          <CheckCircle size={52} style={{ color: GREEN }} />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>
          Welcome{authUser ? `, ${authUser.name.split(" ")[0]}` : ""}! 🎉
        </h1>
        <p className="text-blue-200 mb-2">Your account is all set up.</p>
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-8">
          {authUser?.role === "driver" ? <Car size={14} className="text-blue-300" /> : <Building2 size={14} className="text-blue-300" />}
          <span className="text-sm font-medium text-blue-100">
            {authUser?.role === "driver" ? "Driver Account" : "Space Owner Account"}
          </span>
        </div>
        <div className="bg-white/10 backdrop-blur rounded-2xl p-5 mb-7 text-left border border-white/20">
          <h3 className="font-semibold text-white mb-3 text-sm">What you can do now:</h3>
          <div className="space-y-2.5">
            {authUser?.role === "driver"
              ? [["Search & reserve parking spots near you",Search],["Track your bookings and history",Calendar],["Get AI-powered spot recommendations",Sparkles]].map(([t, Icon]: [string, React.ElementType]) => (
                  <div key={t} className="flex items-center gap-2.5"><div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0"><Check size={10} className="text-green-400" /></div><span className="text-sm text-blue-100">{t}</span></div>
                ))
              : [["List and manage your parking spaces",ParkingSquare],["Track earnings and booking analytics",TrendingUp],["Use AI to analyze your space value",Sparkles]].map(([t, Icon]: [string, React.ElementType]) => (
                  <div key={t} className="flex items-center gap-2.5"><div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0"><Check size={10} className="text-green-400" /></div><span className="text-sm text-blue-100">{t}</span></div>
                ))
            }
          </div>
        </div>
        <button onClick={() => setPage(authUser?.role === "owner" ? "owner" : "driver")}
          className="w-full py-4 rounded-xl font-bold text-white text-lg hover:scale-105 transition-all shadow-2xl"
          style={{ background: `linear-gradient(135deg, ${BLUE}, ${SKY})` }}>
          {authUser?.role === "owner" ? "Go to Owner Dashboard →" : "Start Finding Parking →"}
        </button>
      </div>
    </div>
  );
}

/* ─── Landing Page ─── */
function LandingPage({ setPage }: { setPage: (p: Page) => void }) {
  return (
    <div style={{ fontFamily: "Inter, sans-serif" }}>
      {/* ── Hero ── */}
      <section className="pt-28 pb-20 px-4 sm:px-6 relative overflow-hidden" style={{ background: "radial-gradient(ellipse at 20% 60%, rgba(109,40,217,0.45) 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(236,72,153,0.3) 0%, transparent 50%), linear-gradient(160deg, #0D0920 0%, #1A0D3B 60%, #2D1B69 100%)" }}>
        {/* Floating orbs */}
        <div className="absolute top-16 right-[10%] w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, #A78BFA, transparent)" }} />
        <div className="absolute bottom-8 left-[5%] w-48 h-48 rounded-full opacity-15 blur-2xl pointer-events-none" style={{ background: "radial-gradient(circle, #F472B6, transparent)" }} />
        {/* Grid texture */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full mb-7 border" style={{ background: "rgba(167,139,250,0.12)", borderColor: "rgba(167,139,250,0.3)", color: "#C4B5FD" }}>
              <Sparkles size={12} /> Smart Community Parking Network
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-black text-white mb-6 leading-[1.15]" style={{ fontFamily: "Outfit, sans-serif" }}>
              Turn Unused Spaces Into{" "}
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(90deg, #A78BFA, #F472B6)" }}>
                Parking Opportunities
              </span>
            </h1>
            <p className="text-[1.05rem] mb-8 max-w-lg leading-relaxed" style={{ color: "#C4B5FD" }}>
              Find available parking nearby or monetize unused spaces in your community — Connecting drivers with trusted parking spaces nearby.
            </p>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => setPage("signup")}
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-white transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg, #7C3AED, #EC4899)", boxShadow: "0 8px 24px rgba(124,58,237,0.45)" }}>
                <Search size={17} /> Find Parking
              </button>
              <button onClick={() => setPage("signup")}
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold transition-all hover:bg-white/20"
                style={{ background: "rgba(255,255,255,0.1)", color: "white", border: "1.5px solid rgba(255,255,255,0.25)" }}>
                <Plus size={17} /> List Your Spot
              </button>
            </div>
            {/* Trust badges */}
            <div className="flex items-center gap-5 mt-8">
              {[["4.9★","App Store"],["4.8★","Play Store"],["50+","Cities"]].map(([v,l]) => (
                <div key={l} className="text-center">
                  <div className="text-white font-bold text-sm">{v}</div>
                  <div className="text-[10px] mt-0.5" style={{ color: "#A78BFA" }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="hidden lg:block relative"><MapIllustration /></div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="px-4 sm:px-6 -mt-8 relative z-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon:<ParkingSquare size={20}/>, val:"5,000+", label:"Parking Spots", grad:"linear-gradient(135deg,#6D28D9,#7C3AED)" },
            { icon:<Users size={20}/>, val:"10,000+", label:"Happy Drivers", grad:"linear-gradient(135deg,#EC4899,#F472B6)" },
            { icon:<Activity size={20}/>, val:"95%", label:"Utilization Rate", grad:"linear-gradient(135deg,#059669,#34D399)" },
            { icon:<MapPin size={20}/>, val:"50+", label:"Cities Live", grad:"linear-gradient(135deg,#F59E0B,#FBBF24)" },
          ].map(({icon,val,label,grad}) => (
            <div key={label} className="bg-white rounded-2xl p-5 border border-border flex items-center gap-4" style={{ boxShadow: "0 4px 20px rgba(109,40,217,0.08)" }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-white flex-shrink-0" style={{ background: grad }}>{icon}</div>
              <div>
                <div className="text-2xl font-black" style={{ fontFamily:"Outfit, sans-serif", color: NAVY }}>{val}</div>
                <div className="text-xs text-slate-400 mt-0.5">{label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it Works ── */}
      <section className="py-24 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <div className="inline-block text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4" style={{ background: `${BLUE}12`, color: BLUE }}>Simple Process</div>
          <h2 className="text-3xl sm:text-4xl font-black mb-3" style={{ fontFamily:"Outfit, sans-serif", color: NAVY }}>How SpotShare Works</h2>
          <p className="text-slate-400 max-w-md mx-auto">Search · Reserve · Navigate · Park — end to end in minutes</p>
        </div>
        <div className="grid md:grid-cols-4 gap-5">
          {[
            { n:"01", icon:<Search size={22}/>, title:"Search", desc:"Enter destination, see nearby spots with live availability.", grad:"linear-gradient(135deg,#6D28D9,#7C3AED)" },
            { n:"02", icon:<Sparkles size={22}/>, title:"AI Match", desc:"AI picks the best spot for your vehicle, time, and budget.", grad:"linear-gradient(135deg,#EC4899,#F472B6)" },
            { n:"03", icon:<CheckCircle size={22}/>, title:"Reserve", desc:"Book instantly with secure one-tap payments.", grad:"linear-gradient(135deg,#059669,#34D399)" },
            { n:"04", icon:<Navigation size={22}/>, title:"Navigate", desc:"Turn-by-turn directions straight to your spot.", grad:"linear-gradient(135deg,#F59E0B,#FBBF24)" },
          ].map(({n,icon,title,desc,grad},i) => (
            <div key={n} className="relative p-6 rounded-2xl overflow-hidden group hover:-translate-y-1 transition-all duration-300" style={{ background: "white", boxShadow: "0 2px 20px rgba(109,40,217,0.07)", border: "1px solid rgba(109,40,217,0.08)" }}>
              <div className="text-[4.5rem] font-black absolute -top-2 -right-1 leading-none select-none" style={{ fontFamily:"Outfit, sans-serif", background: grad, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", opacity: 0.12 }}>{n}</div>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 text-white" style={{ background: grad }}>{icon}</div>
              <h3 className="text-base font-bold mb-1.5" style={{ fontFamily:"Outfit, sans-serif", color: NAVY }}>{title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              {i < 3 && <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 border-violet-200 bg-white z-10 flex items-center justify-center"><ChevronRight size={12} className="text-violet-300" /></div>}
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured Spots ── */}
      <section className="py-16 px-4 sm:px-6" style={{ background: "linear-gradient(180deg, #F6F5FF 0%, white 100%)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-black" style={{ fontFamily:"Outfit, sans-serif", color: NAVY }}>Top Spots Near You</h2>
              <p className="text-slate-400 text-sm mt-1">Verified, rated, and ready to book</p>
            </div>
            <button onClick={() => setPage("search")} className="text-sm font-semibold flex items-center gap-1.5 px-4 py-2 rounded-xl border transition-all hover:shadow-md" style={{ color: BLUE, borderColor: `${BLUE}25`, background: `${BLUE}06` }}>
              View all <ArrowRight size={14}/>
            </button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {spots.slice(0,3).map(s => <SpotCard key={s.id} spot={s} onReserve={() => setPage("details")} />)}
          </div>
        </div>
      </section>

      {/* ── Earn CTA ── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto rounded-3xl p-10 sm:p-14 text-center relative overflow-hidden" style={{ background: "radial-gradient(ellipse at 30% 50%, rgba(236,72,153,0.3) 0%, transparent 60%), radial-gradient(ellipse at 70% 30%, rgba(109,40,217,0.4) 0%, transparent 55%), linear-gradient(135deg, #1A0D3B 0%, #2D1B69 100%)" }}>
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage:"linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)", backgroundSize:"32px 32px" }} />
          <div className="relative z-10">
            <div className="inline-block text-xs font-bold px-4 py-1.5 rounded-full mb-5" style={{ background:"rgba(167,139,250,0.2)", color:"#C4B5FD", border:"1px solid rgba(167,139,250,0.3)" }}>For Space Owners</div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4" style={{ fontFamily:"Outfit, sans-serif" }}>Have a Parking Space?<br/>Earn From It.</h2>
            <p className="mb-8 text-lg max-w-xl mx-auto" style={{ color: "#C4B5FD" }}>Join thousands of owners earning passive income by listing unused spots. Zero upfront cost, instant payouts.</p>
            <button onClick={() => setPage("signup")} className="bg-white font-bold text-lg px-9 py-4 rounded-xl hover:shadow-2xl hover:scale-105 transition-all" style={{ color: BLUE }}>
              Start Earning Today →
            </button>
          </div>
        </div>
      </section>

      <footer style={{ background: "#0D0920" }} className="text-white py-14 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2.5 font-bold text-lg mb-4" style={{ fontFamily:"Outfit, sans-serif" }}>
              <SpotLogo size={28} />
              <span className="text-transparent bg-clip-text" style={{ backgroundImage:`linear-gradient(135deg, #A78BFA, #F472B6)` }}>SpotShare</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">Making parking smarter and communities better through shared spaces.</p>
            <div className="flex gap-3 mt-4">{[Twitter,Linkedin,Instagram].map((I,i) => <div key={i} className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center cursor-pointer hover:bg-slate-700"><I size={14} className="text-slate-400" /></div>)}</div>
          </div>
          {[{title:"Product",links:["Find Parking","List Space","AI Analysis","Smart Allocation"]},{title:"Company",links:["About Us","Careers","Blog","Press"]},{title:"Support",links:["Help Center","Contact","Privacy","Terms"]}].map(({title,links}) => (
            <div key={title}><h4 className="font-semibold text-sm mb-4">{title}</h4><ul className="space-y-2">{links.map(l => <li key={l}><a className="text-slate-400 text-sm hover:text-white transition-colors cursor-pointer">{l}</a></li>)}</ul></div>
          ))}
        </div>
        <div className="max-w-7xl mx-auto border-t border-slate-800 mt-10 pt-6 text-center text-slate-500 text-sm">© 2025 SpotShare Technologies. All rights reserved.</div>
      </footer>
    </div>
  );
}

function MapIllustration() {
  return (
    <div className="relative w-full h-96">
      <svg viewBox="0 0 400 340" className="w-full h-full" style={{filter:"drop-shadow(0 20px 60px rgba(0,0,0,0.3))"}}>
        <defs><linearGradient id="mapBg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#1e3a8a"/><stop offset="100%" stopColor="#1e40af"/></linearGradient></defs>
        <rect width="400" height="340" rx="20" fill="url(#mapBg)"/>
        {[60,120,180,240,300].map(x => <line key={x} x1={x} y1="0" x2={x} y2="340" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>)}
        {[60,120,180,240,300].map(y => <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>)}
        <rect x="0" y="150" width="400" height="16" fill="rgba(255,255,255,0.12)" rx="8"/>
        <rect x="180" y="0" width="16" height="340" fill="rgba(255,255,255,0.12)" rx="8"/>
        {[{x:30,y:30,c:"#10B981"},{x:100,y:200,c:"#10B981"},{x:220,y:80,c:"#F59E0B"},{x:290,y:220,c:"#10B981"},{x:50,y:240,c:"#EF4444"},{x:320,y:60,c:"#10B981"}].map(({x,y,c},i) => (
          <g key={i}><rect x={x} y={y} width="36" height="28" rx="6" fill={c} opacity="0.9"/><text x={x+18} y={y+18} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">P</text></g>
        ))}
        {[{x:200,y:158,big:true},{x:95,y:55,big:false},{x:310,y:240,big:false}].map(({x,y,big},i) => (
          <g key={i}><circle cx={x} cy={y} r={big?14:9} fill={big?"#7C3AED":"#A78BFA"} opacity="0.95"/><circle cx={x} cy={y} r={big?6:4} fill="white"/>{big&&<circle cx={x} cy={y} r={22} fill="rgba(124,58,237,0.2)"/>}</g>
        ))}
        <g transform="translate(155,230)"><rect x="0" y="6" width="40" height="20" rx="5" fill="#60A5FA"/><rect x="6" y="0" width="28" height="14" rx="4" fill="#93C5FD"/><circle cx="8" cy="26" r="5" fill="#1E3A8A"/><circle cx="32" cy="26" r="5" fill="#1E3A8A"/><circle cx="8" cy="26" r="2.5" fill="#60A5FA"/><circle cx="32" cy="26" r="2.5" fill="#60A5FA"/></g>
        <g transform="translate(12,300)">{[{c:"#10B981",l:"Available"},{c:"#F59E0B",l:"Few Left"},{c:"#EF4444",l:"Full"}].map(({c,l},i) => <g key={l} transform={`translate(${i*110},0)`}><rect x="0" y="0" width="10" height="10" rx="2" fill={c}/><text x="14" y="9" fill="rgba(255,255,255,0.7)" fontSize="9">{l}</text></g>)}</g>
      </svg>
    </div>
  );
}

/* ─── Spot Card ─── */
function SpotCard({ spot, onReserve }: { spot: SpotType; onReserve: () => void }) {
  const availColor = spot.avail === "Available" ? GREEN : spot.avail === "1 left" ? RED : AMBER;
  return (
    <div className="bg-white rounded-2xl overflow-hidden group hover:-translate-y-1 transition-all duration-300 cursor-pointer" onClick={onReserve}
      style={{ border: "1px solid rgba(109,40,217,0.09)", boxShadow: "0 4px 20px rgba(109,40,217,0.07)" }}>
      <div className="relative h-48 bg-slate-100 overflow-hidden">
        <img src={`https://images.unsplash.com/${spot.img}?w=400&h=220&fit=crop&auto=format`} alt={spot.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"/>
        {/* Gradient overlay bottom */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(26,21,53,0.6) 0%, transparent 55%)" }} />
        <div className="absolute top-3 left-3">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full text-white" style={{ background: availColor }}>{spot.avail}</span>
        </div>
        <div className="absolute top-3 right-3 rounded-full px-2.5 py-1 flex items-center gap-1" style={{ background: "rgba(26,21,53,0.7)", backdropFilter: "blur(8px)" }}>
          <Sparkles size={11} className="text-violet-300"/><span className="text-xs font-bold text-white">{spot.score}%</span>
        </div>
        <div className="absolute bottom-3 left-4">
          <div className="text-white font-bold text-sm leading-tight" style={{ fontFamily:"Outfit, sans-serif" }}>{spot.name}</div>
          <div className="flex items-center gap-1 mt-0.5"><MapPin size={10} className="text-violet-300"/><span className="text-xs text-violet-200">{spot.dist}</span></div>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Star size={13} className="text-amber-400 fill-amber-400"/>
            <span className="text-sm font-semibold" style={{ color: NAVY }}>{spot.rating}</span>
            <span className="text-xs text-slate-400">(124)</span>
          </div>
          <div className="text-right">
            <span className="text-xl font-black" style={{ color: BLUE, fontFamily:"Outfit, sans-serif" }}>₹{spot.price}</span>
            <span className="text-xs text-slate-400 ml-1">/hr</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap mb-3">
          {spot.cctv && <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background:`${BLUE}10`, color:BLUE }}>CCTV</span>}
          {spot.ev && <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background:`${GREEN}15`, color:GREEN }}>EV</span>}
          {spot.cover && <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background:`${AMBER}15`, color:AMBER }}>Covered</span>}
        </div>
        <button onClick={e => { e.stopPropagation(); onReserve(); }}
          className="w-full py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-all"
          style={{ background:`linear-gradient(135deg, ${BLUE}, ${SKY})`, boxShadow:`0 4px 12px rgba(109,40,217,0.3)` }}>
          Reserve Now
        </button>
      </div>
    </div>
  );
}

/* ─── Driver Dashboard ─── */
function DriverDashboard({
  setPage,
  setSearchQuery,
}: {
  setPage: (p: Page) => void;
  setSearchQuery: (query: string) => void;
}) {
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [vehicle, setVehicle] = useState("Sedan");
  const [destination, setDestination] = useState("");
  useEffect(() => {
  const loadBookings = async () => {
    try {
      const snapshot = await getDocs(collection(db, "bookings"));

      const data = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter(
          (booking: any) =>
            booking.userEmail === auth.currentUser?.email
        );

      setMyBookings(data);
    } catch (error) {
      console.error(error);
    }
  };

  loadBookings();
}, []);
  return (
    <div className="pt-16 min-h-screen" style={{background:"#F5F7FF",fontFamily:"Inter, sans-serif"}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-border mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-5" style={{fontFamily:"Outfit, sans-serif"}}>Find Parking</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[{label:"Destination",placeholder:"Enter destination",icon:<MapPin size={16}/>},{label:"Date",placeholder:"Today, Jun 23",icon:<Calendar size={16}/>},{label:"Time",placeholder:"Now · 2hrs",icon:<Clock size={16}/>}].map(({label,placeholder,icon}) => (
              <div key={label}>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">{label}</label>
                <div className="flex items-center gap-2 bg-slate-50 border border-border rounded-xl px-3 py-2.5">
                  <span className="text-slate-400">{icon}</span>
                  <input
  className="bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none w-full"
  placeholder={placeholder}
  value={label === "Destination" ? destination : ""}
  onChange={(e) => {
    if (label === "Destination") {
      setDestination(e.target.value);
    }
  }}
/>
                </div>
              </div>
            ))}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Vehicle</label>
              <select className="w-full bg-slate-50 border border-border rounded-xl px-3 py-2.5 text-sm text-slate-700 outline-none" value={vehicle} onChange={e => setVehicle(e.target.value)}>
                {["Bike","Hatchback","Sedan","SUV"].map(v => <option key={v}>{v}</option>)}
              </select>
            </div>
          </div>
         <button
  onClick={() => {
    if (!destination.trim()) {
      alert("Please enter a destination.");
      return;
    }

    setSearchQuery(destination);
    setPage("search");
  }}
  className="mt-5 w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white hover:opacity-90 hover:scale-[1.02] transition-all"
  style={{ background: `linear-gradient(135deg, ${BLUE}, ${SKY})` }}
>
  <Search size={18} />
  Search Parking
</button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[{label:"Available Nearby",val:"23",sub:"within 1km",icon:<ParkingSquare size={20}/>,color:BLUE},{label:"Cheapest Spot",val:"₹25/hr",sub:"BTM Layout",icon:<DollarSign size={20}/>,color:GREEN},{label:"Closest Spot",val:"0.3 km",sub:"Koramangala",icon:<Navigation size={20}/>,color:SKY},{label:"Avg Walk",val:"4 min",sub:"to destination",icon:<Activity size={20}/>,color:PURPLE}].map(({label,val,sub,icon,color}) => (
            <div key={label} className="bg-white rounded-2xl p-5 border border-border shadow-sm">
              <div className="flex items-center justify-between mb-3"><span className="text-xs font-medium text-slate-500">{label}</span><div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:`${color}15`,color}}>{icon}</div></div>
              <div className="text-2xl font-bold text-slate-900" style={{fontFamily:"Outfit, sans-serif"}}>{val}</div>
              <div className="text-xs text-slate-400 mt-0.5">{sub}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-slate-900" style={{fontFamily:"Outfit, sans-serif"}}>Parking Heatmap</h3>
              <button onClick={() => setPage("search")} className="text-xs font-medium flex items-center gap-1" style={{color:BLUE}}>Full Map <ChevronRight size={14}/></button>
            </div>
            <div className="p-5"><MiniHeatmap /></div>
          </div>
          <div className="bg-white rounded-2xl border border-border shadow-sm">
            <div className="p-5 border-b border-border"><h3 className="font-bold text-slate-900" style={{fontFamily:"Outfit, sans-serif"}}>Recommended</h3></div>
            <div className="p-4 space-y-3">
              {spots.slice(0,4).map(s => (
                <div key={s.id} onClick={() => setPage("details")} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors border border-transparent hover:border-border">
                  <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100"><img src={`https://images.unsplash.com/${s.img}?w=80&h=80&fit=crop&auto=format`} alt={s.name} className="w-full h-full object-cover"/></div>
                  <div className="flex-1 min-w-0"><div className="text-sm font-semibold text-slate-900 truncate">{s.name}</div><div className="text-xs text-slate-400">{s.dist} · {s.walkTime} walk · ₹{s.price}/hr</div></div>
                  <div className="text-xs font-bold px-2 py-1 rounded-lg flex-shrink-0" style={{background:`${BLUE}15`,color:BLUE}}>{s.score}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-8 bg-white rounded-2xl border border-border shadow-sm">
  <div className="p-5 border-b border-border">
    <h3
      className="font-bold text-slate-900"
      style={{ fontFamily: "Outfit, sans-serif" }}
    >
      My Bookings
    </h3>
  </div>

  <div className="divide-y divide-border">
    {myBookings.length === 0 ? (
      <p className="p-5 text-slate-500">
        You haven't booked any parking spots yet.
      </p>
    ) : (
      myBookings.map((booking) => (
        <div
          key={booking.id}
          className="p-5 flex items-center justify-between"
        >
          <div>
  <h4 className="font-semibold text-slate-900">
    {booking.spotName}
  </h4>

  <p className="text-sm text-slate-500 mt-1">
    Amount: ₹{booking.amount}
  </p>

  <p className="text-sm text-slate-500">
    Payment: {booking.paymentMethod.toUpperCase()}
  </p>

  <p className="text-xs text-slate-400 mt-1">
    Booked:
    {" "}
    {booking.bookedAt?.toDate
      ? booking.bookedAt.toDate().toLocaleString()
      : "Just now"}
  </p>
</div>

          <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-semibold">
            {booking.status}
          </span>
        </div>
      ))
    )}
  </div>
</div>
      </div>
    </div>
  );
}

function MiniHeatmap() {
  const cells = [[0,0,1,2,1,0,0],[0,1,2,3,2,1,0],[1,2,3,3,3,2,1],[0,1,2,3,2,1,0],[0,0,1,2,1,1,0],[0,0,0,1,0,0,0]];
  const colors = ["#E0F2FE","#7DD3FC","#F59E0B","#EF4444"];
  return (
    <div>
      <div className="grid gap-1.5" style={{gridTemplateColumns:"repeat(7,1fr)"}}>
        {cells.flat().map((v,i) => <div key={i} className="h-10 rounded-lg flex items-center justify-center text-xs font-bold hover:scale-110 cursor-pointer transition-all" style={{background:colors[v],color:v>1?"white":"#64748B"}}>{v>0?["","P","!","X"][v]:""}</div>)}
      </div>
      <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
        {[["#E0F2FE","Empty"],["#7DD3FC","Available"],["#F59E0B","Limited"],["#EF4444","Full"]].map(([c,l]) => <div key={l} className="flex items-center gap-1.5"><div className="w-3 h-3 rounded" style={{background:c}}/>{l}</div>)}
      </div>
    </div>
  );
}

/* ─── Search Results ─── */
function SearchResults({
  setPage,
  setSelectedSpot,
  searchQuery,
}: {
  setPage: (p: Page) => void;
  setSelectedSpot: (spot: any) => void;
  searchQuery: string;
}) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [priceMax, setPriceMax] = useState(100);
  const [firebaseSpots, setFirebaseSpots] = useState<any[]>([]);
  useEffect(() => {
  const loadSpots = async () => {
    try {
      const snapshot = await getDocs(collection(db, "parkingSpots"));

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log("Firestore Spots:", data);

      setFirebaseSpots(data);
    } catch (error) {
      console.error("Error loading spots:", error);
    }
  };

  loadSpots();
}, []);
const filteredSpots = [
  ...spots,
  ...firebaseSpots.map((spot) => ({
    id: spot.id,
    name: spot.address,
    building: "User Listed Parking",
    block: "Available",
    area: spot.landmark,
    address: spot.address,
    landmark: spot.landmark,
    entry: "Owner will provide entry instructions.",
    coords: { lat: 0, lng: 0 },
    dist: "New",
    walkTime: "0 min",
    driveTime: "0 min",
    price: spot.hourlyRate,
    avail: "Available",
    score: 100,
    rating: 5,
    img: spot.images?.[0] || "photo-1590674899484-d5640e854abe",
    vehicles: ["bike", "car"],
    safety: 10,
    cover: true,
    cctv: true,
    guard: false,
    ev: false,
    open24: true,
    owner: {
      name: "Owner",
      phone: "",
      rating: 5,
    },
  })),
].filter((s) => {
  const matchesPrice = s.price <= priceMax;

  const matchesSearch =
    searchQuery.trim() === "" ||
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.address || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.landmark || "").toLowerCase().includes(searchQuery.toLowerCase());

  let matchesFilter = true;

  switch (activeFilter) {
    case "Bike":
      matchesFilter = s.vehicles?.includes("bike");
      break;

    case "Car":
      matchesFilter =
        s.vehicles?.includes("hatchback") ||
        s.vehicles?.includes("sedan");
      break;

    case "SUV":
      matchesFilter = s.vehicles?.includes("suv");
      break;

    case "EV Friendly":
      matchesFilter = s.ev;
      break;

    case "Covered":
      matchesFilter = s.cover;
      break;

    case "24/7":
      matchesFilter = s.open24;
      break;

    default:
      matchesFilter = true;
  }

  return matchesPrice && matchesSearch && matchesFilter;
});
console.log("Total:", [...spots, ...firebaseSpots].length);
console.log("Filtered:", filteredSpots.length);
  return (
    <div className="pt-16 min-h-screen" style={{background:"#F5F7FF",fontFamily:"Inter, sans-serif"}}>
      <div className="bg-white border-b border-border sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3 overflow-x-auto">
          <Filter size={16} className="text-slate-400 flex-shrink-0"/>
          {["All","Bike","Car","SUV","EV Friendly","Covered","24/7"].map(f => (
            <button key={f} onClick={() => setActiveFilter(f)} className={`text-xs font-semibold px-3.5 py-2 rounded-full whitespace-nowrap transition-all ${activeFilter===f?"text-white shadow-sm":"bg-white text-slate-600 border border-border hover:border-blue-300"}`}
              style={activeFilter===f?{background:`linear-gradient(135deg, ${BLUE}, ${SKY})`}:{}}>
              {f}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-slate-500">Max ₹{priceMax}/hr</span>
            <input type="range" min={20} max={200} value={priceMax} onChange={e => setPriceMax(Number(e.target.value))} className="w-24 accent-blue-600"/>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-700">
  {[...spots, ...firebaseSpots].length} spots found
</span>
              <select className="text-xs bg-white border border-border rounded-lg px-2 py-1.5 text-slate-600 outline-none"><option>Best Match</option><option>Cheapest</option><option>Nearest</option></select>
            </div>

            {/* Smart Route Card */}
            <SmartRouteCard />

            {filteredSpots.length === 0 ? (
  <div className="bg-white rounded-2xl border border-border p-10 text-center">
    <h3 className="text-xl font-bold text-slate-700">
      No parking spots found
    </h3>

    <p className="text-slate-500 mt-2">
      Try another destination.
    </p>
  </div>
) : (
  filteredSpots.map((s) => (
              <div key={s.id} onClick={() => {
  setSelectedSpot(s);
  setPage("details");
}} className="bg-white rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-md cursor-pointer transition-all hover:border-blue-200 group">
                <div className="flex">
                  <div className="w-28 h-auto flex-shrink-0 bg-slate-100 relative" style={{minHeight:120}}>
                   <img
  src={
    s.img.startsWith("http")
      ? s.img
      : `https://images.unsplash.com/${s.img}?w=200&h=200&fit=crop&auto=format`
  } alt={s.name} className="w-full h-full object-cover"/>
                    {s.score > 90 && <div className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-md">Best Match</div>}
                  </div>
                  <div className="p-3 flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h3 className="text-sm font-bold text-slate-900 leading-tight" style={{fontFamily:"Outfit, sans-serif"}}>{s.name}</h3>
                      <div className="text-right flex-shrink-0">
                        <div className="text-base font-bold" style={{color:BLUE}}>₹{s.price}</div>
                        <div className="text-xs text-slate-400">/hr</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-1"><MapPin size={10} className="text-slate-400"/><span className="text-xs text-slate-400">{s.dist}</span><span className="text-slate-300 mx-1">·</span><Star size={10} className="text-amber-400 fill-amber-400"/><span className="text-xs text-slate-400">{s.rating}</span></div>
                    {/* Walk & Drive times */}
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full"><Navigation size={9}/>{s.walkTime} walk</span>
                      <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full"><Car size={9}/>{s.driveTime} drive</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      <span
  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
    s.avail === "Available"
      ? "bg-green-100 text-green-700"
      : s.avail === "1 left"
      ? "bg-red-100 text-red-700"
      : "bg-amber-100 text-amber-700"
  }`}
>
  {s.avail}
</span>
                      {s.ev && <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">EV</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          </div>

          <div className="lg:col-span-3">
            <div className="sticky top-36 bg-white rounded-2xl border border-border shadow-sm overflow-hidden" style={{height:"calc(100vh - 180px)"}}>
              <FullMap
  spots={[
    ...spots,
    ...firebaseSpots.map((spot) => ({
      id: spot.id,
      name: spot.address,
      price: spot.hourlyRate,
      avail: spot.status || "Available",
      walkTime: "0 min",
      driveTime: "0 min",
      rating: 5,
      img: spot.images?.[0] || "",
      coords: { lat: 0, lng: 0 },
    })),
  ]}
  onSpotClick={(spot) => {
  setSelectedSpot(spot);
  setPage("details");
}}
/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SmartRouteCard() {
  const [selected, setSelected] = useState(0);
  const routes = [
    { type:"Fastest", icon:<Zap size={14}/>, time:"8 min", via:"via Residency Road", color:GREEN },
    { type:"Least Traffic", icon:<Activity size={14}/>, time:"12 min", via:"via Inner Ring Road", color:BLUE },
    { type:"Closest Walk", icon:<Navigation size={14}/>, time:"4 min walk", via:"via 4th Cross", color:PURPLE },
  ];
  return (
    <div className="rounded-2xl p-4 border-2 border-blue-100 mb-1" style={{background:"linear-gradient(135deg, #EFF6FF, #F0F9FF)"}}>
      <div className="flex items-center gap-2 mb-3">
        <Route size={16} style={{color:BLUE}}/><h4 className="text-sm font-bold text-slate-800" style={{fontFamily:"Outfit, sans-serif"}}>Best Route to Parking</h4>
      </div>
      <div className="space-y-2">
        {routes.map(({type,icon,time,via,color},i) => (
          <button key={type} onClick={() => setSelected(i)}
            className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all text-left ${selected===i?"bg-white border-2 shadow-sm":"border border-transparent hover:bg-white/60"}`}
            style={{borderColor:selected===i?color:"transparent"}}>
            <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{background:`${color}20`,color}}>{icon}</div><div><div className="text-xs font-semibold text-slate-700">{type}</div><div className="text-xs text-slate-400">{via}</div></div></div>
            <span className="text-sm font-bold" style={{color,fontFamily:"Outfit, sans-serif"}}>{time}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function FullMap({
  spots: mapSpots,
  onSpotClick,
}: {
  spots: any[];
  onSpotClick: (spot: any) => void;
}) {
  const [hovered, setHovered] = useState<number|null>(null);
  return (
    <div className="relative w-full h-full" style={{background:"#E8F0FE"}}>
      <svg viewBox="0 0 600 500" className="w-full h-full">
        <defs><pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(37,99,235,0.08)" strokeWidth="0.5"/></pattern></defs>
        <rect width="600" height="500" fill="#EEF4FD"/><rect width="600" height="500" fill="url(#grid)"/>
        {[{x1:0,y1:200,x2:600,y2:200},{x1:0,y1:350,x2:600,y2:350},{x1:150,y1:0,x2:150,y2:500},{x1:350,y1:0,x2:350,y2:500},{x1:480,y1:0,x2:480,y2:500}].map((r,i) => (
          <g key={i}><line x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} stroke="white" strokeWidth="12" strokeLinecap="round"/><line x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} stroke="rgba(37,99,235,0.15)" strokeWidth="1" strokeDasharray="8,8"/></g>
        ))}
        {[[20,60,110,120],[170,60,160,120],[20,230,110,100],[170,230,160,100],[380,60,80,120],[380,230,80,100],[20,380,110,100],[170,380,160,100],[380,380,80,100]].map(([x,y,w,h],i) => (
          <rect key={i} x={x} y={y} width={w} height={h} rx="8" fill={["#DBEAFE","#EDE9FE","#DCFCE7","#FEF3C7","#FCE7F3"][i%5]} opacity="0.7"/>
        ))}
        {mapSpots.map((s,i) => {
          const positions = [[280,185],[450,300],[80,320],[520,130],[200,420]];
          const [px,py] = positions[i] || [200+i*60, 200];
          const c = s.avail==="Available"?GREEN:s.avail==="1 left"?RED:AMBER;
          return (
            <g key={s.id} style={{cursor:"pointer"}} onClick={() => onSpotClick(s)} onMouseEnter={() => setHovered(s.id)} onMouseLeave={() => setHovered(null)}>
              <circle cx={px} cy={py} r={hovered===s.id?22:16} fill={c} opacity="0.15"/>
              <circle cx={px} cy={py} r={hovered===s.id?14:11} fill={c}/>
              <text x={px} y={py+4} textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">P</text>
              {hovered===s.id && (
                <g><rect x={px-55} y={py-58} width="110" height="44" rx="8" fill="white" filter="drop-shadow(0 2px 8px rgba(0,0,0,0.2))"/><text x={px} y={py-38} textAnchor="middle" fill={NAVY} fontSize="9" fontWeight="bold">{s.name}</text><text x={px} y={py-24} textAnchor="middle" fill={BLUE} fontSize="10" fontWeight="bold">₹{s.price}/hr · {s.walkTime} walk</text></g>
              )}
            </g>
          );
        })}
        <circle cx="300" cy="250" r="18" fill="rgba(37,99,235,0.15)"/><circle cx="300" cy="250" r="10" fill={BLUE}/><circle cx="300" cy="250" r="5" fill="white"/>
      </svg>
      <div className="absolute top-3 right-3 flex flex-col gap-2">
        <button className="w-9 h-9 bg-white rounded-lg shadow-md flex items-center justify-center text-slate-600 hover:bg-slate-50 text-lg font-bold">+</button>
        <button className="w-9 h-9 bg-white rounded-lg shadow-md flex items-center justify-center text-slate-600 hover:bg-slate-50 text-lg font-bold">−</button>
      </div>
      <div className="absolute bottom-3 left-3 bg-white rounded-xl px-3 py-2 shadow-md">
        <div className="flex items-center gap-3 text-xs">
          {[{c:GREEN,l:"Available"},{c:AMBER,l:"Limited"},{c:RED,l:"Full"}].map(({c,l}) => <div key={l} className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full" style={{background:c}}/><span className="text-slate-600">{l}</span></div>)}
        </div>
      </div>
    </div>
  );
}

/* ─── Route Map SVG (for Parking Details) ─── */
function RouteMapSVG({ spot }: { spot: SpotType }) {
  return (
    <div className="relative w-full" style={{height:240}}>
      <svg viewBox="0 0 500 240" className="w-full h-full">
        <defs>
          <pattern id="routeGrid" width="25" height="25" patternUnits="userSpaceOnUse">
            <path d="M 25 0 L 0 0 0 25" fill="none" stroke="rgba(37,99,235,0.07)" strokeWidth="0.5"/>
          </pattern>
          <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 z" fill={BLUE} opacity="0.7"/>
          </marker>
        </defs>
        <rect width="500" height="240" fill="#EEF4FD"/><rect width="500" height="240" fill="url(#routeGrid)"/>
        {/* Roads */}
        {[{x1:0,y1:120,x2:500,y2:120},{x1:0,y1:60,x2:500,y2:60},{x1:150,y1:0,x2:150,y2:240},{x1:320,y1:0,x2:320,y2:240}].map((r,i) => (
          <line key={i} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} stroke="white" strokeWidth="10" strokeLinecap="round"/>
        ))}
        {/* Road labels */}
        <text x="80" y="112" fill="#94A3B8" fontSize="7" fontWeight="500">4th Cross Road</text>
        <text x="325" y="90" fill="#94A3B8" fontSize="7" fontWeight="500" transform="rotate(90,325,90)">80 Feet Rd</text>
        {/* Buildings */}
        {[[20,75,80,35,"#DBEAFE"],[160,75,120,35,"#EDE9FE"],[340,75,120,35,"#DCFCE7"],[20,135,80,45,"#FEF3C7"],[160,135,120,45,"#FCE7F3"],[340,135,120,45,"#DBEAFE"]].map(([x,y,w,h,c],i) => (
          <rect key={i} x={x} y={y} width={w} height={h} rx="5" fill={c as string} opacity="0.8"/>
        ))}
        {/* Forum Mall landmark */}
        <rect x="160" y="135" width="120" height="45" rx="5" fill="#FEF9C3" opacity="0.9"/>
        <text x="220" y="162" textAnchor="middle" fill="#A16207" fontSize="7" fontWeight="bold">Forum Mall</text>

        {/* Route path */}
        <path d="M 100 195 L 100 120 L 150 120 L 150 80 L 320 80 L 320 120 L 380 120" stroke={BLUE} strokeWidth="3" fill="none" strokeDasharray="8,4" opacity="0.85" markerEnd="url(#arrowhead)"/>

        {/* User location */}
        <circle cx="100" cy="195" r="16" fill="rgba(37,99,235,0.15)"/>
        <circle cx="100" cy="195" r="10" fill={BLUE}/>
        <circle cx="100" cy="195" r="4.5" fill="white"/>
        <text x="100" y="215" textAnchor="middle" fill={BLUE} fontSize="8" fontWeight="bold">You</text>

        {/* Parking pin */}
        <circle cx="380" cy="120" r="18" fill="rgba(16,185,129,0.2)"/>
        <circle cx="380" cy="120" r="12" fill={GREEN}/>
        <text x="380" y="124" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">P</text>
        <text x="380" y="140" textAnchor="middle" fill={GREEN} fontSize="7" fontWeight="bold">{spot.name.split(" ").slice(0,2).join(" ")}</text>

        {/* Distance label on route */}
        <rect x="210" y="65" width="60" height="18" rx="9" fill={BLUE}/>
        <text x="240" y="77" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">{spot.dist}</text>

        {/* Walking time */}
        <rect x="80" y="150" width="38" height="16" rx="8" fill="white" filter="drop-shadow(0 1px 3px rgba(0,0,0,0.1))"/>
        <text x="99" y="161" textAnchor="middle" fill="#64748B" fontSize="7">{spot.walkTime}</text>
      </svg>

      {/* Controls */}
      <div className="absolute top-2 right-2 flex flex-col gap-1.5">
        <button className="w-7 h-7 bg-white rounded-lg shadow flex items-center justify-center text-slate-600 text-sm font-bold hover:bg-slate-50">+</button>
        <button className="w-7 h-7 bg-white rounded-lg shadow flex items-center justify-center text-slate-600 text-sm font-bold hover:bg-slate-50">−</button>
      </div>
    </div>
  );
}

/* ─── Navigation Section ─── */
function NavigationSection({ spot }: { spot: SpotType }) {
  const [tab, setTab] = useState<"map"|"directions">("map");
  const [copied, setCopied] = useState(false);
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${spot.coords.lat},${spot.coords.lng}&travelmode=driving`;
  const walkUrl = `https://www.google.com/maps/dir/?api=1&destination=${spot.coords.lat},${spot.coords.lng}&travelmode=walking`;

  const handleCopy = () => {
    navigator.clipboard.writeText(spot.address).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }).catch(() => {});
  };

  const directions = [
    { step:"Head north on 4th Cross Road toward Main Junction", dist:"0.1 km", icon:<ArrowRight size={14}/> },
    { step:"Turn right onto 80 Feet Road (Sarjapur Road)", dist:"0.15 km", icon:<ChevronRight size={14}/> },
    { step:"Turn left at Forum Mall signal", dist:"0.05 km", icon:<ChevronLeft size={14}/> },
    { step:"Enter Green Residency through Gate 2 on your right", dist:"Arrived", icon:<CheckCircle size={14}/> },
  ];

  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="p-5 border-b border-border">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:`${BLUE}15`,color:BLUE}}><Navigation size={18}/></div>
          <div>
            <h3 className="font-bold text-slate-900" style={{fontFamily:"Outfit, sans-serif"}}>Navigate to Parking Spot</h3>
            <p className="text-xs text-slate-400">{spot.walkTime} walk · {spot.driveTime} by car · {spot.dist}</p>
          </div>
        </div>
        {/* Route summary cards */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[{icon:<Navigation size={14}/>,label:"Walk",val:spot.walkTime,color:GREEN},{icon:<Car size={14}/>,label:"Drive",val:spot.driveTime,color:BLUE},{icon:<MapPin size={14}/>,label:"Distance",val:spot.dist,color:PURPLE}].map(({icon,label,val,color}) => (
            <div key={label} className="text-center p-2.5 rounded-xl bg-slate-50">
              <div className="flex justify-center mb-1" style={{color}}>{icon}</div>
              <div className="text-sm font-bold text-slate-900" style={{fontFamily:"Outfit, sans-serif"}}>{val}</div>
              <div className="text-xs text-slate-400">{label}</div>
            </div>
          ))}
        </div>
        {/* Tabs */}
        <div className="flex gap-1 bg-slate-50 p-1 rounded-xl">
          {(["map","directions"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${tab===t?"bg-white shadow-sm text-blue-600":"text-slate-500 hover:text-slate-700"}`}>{t==="map"?"🗺️ Map":"↗️ Directions"}</button>
          ))}
        </div>
      </div>

      {tab === "map" && <RouteMapSVG spot={spot}/>}

      {tab === "directions" && (
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>4 steps · {spot.dist} total</span><span>~{spot.driveTime} by car</span>
          </div>
          {directions.map(({step,dist,icon},i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold" style={{background:i===directions.length-1?GREEN:BLUE}}>{i===directions.length-1?<Check size={12}/>:i+1}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700 leading-snug">{step}</p>
                <span className="text-xs text-slate-400 mt-0.5 block" style={{fontFamily:"JetBrains Mono, monospace"}}>{dist}</span>
              </div>
              <span className="text-slate-400 flex-shrink-0">{icon}</span>
            </div>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="p-4 border-t border-border grid grid-cols-2 gap-2">
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white text-sm hover:opacity-90 transition-all" style={{background:`linear-gradient(135deg, ${BLUE}, ${SKY})`}}>
          <Navigation size={15}/> Open in Google Maps
        </a>
        <a href={walkUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm border-2 border-blue-200 text-blue-600 hover:bg-blue-50 transition-all">
          <Navigation size={15}/> Walking Directions
        </a>
        <button onClick={handleCopy} className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border border-border hover:bg-slate-50 transition-all ${copied?"border-green-300 text-green-600 bg-green-50":""}`}>
          {copied ? <><CheckCircle size={14}/>Copied!</> : <><Copy size={14}/> Copy Address</>}
        </button>
        <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border border-border hover:bg-slate-50 transition-all">
          <Share2 size={14}/> Share Location
        </button>
      </div>
    </div>
  );
}

/* ─── Parking Details ─── */
function ParkingDetails({
  setPage,
  selectedSpot,
}: {
  setPage: (p: Page) => void;
  selectedSpot: any;
}) {
  const spot = selectedSpot;
  if (!spot) {
  return (
    <div className="pt-20 text-center">
      <h2>No parking spot selected.</h2>
      <button
        onClick={() => setPage("search")}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        Back to Search
      </button>
    </div>
  );
}
  const [tab, setTab] = useState("overview");
  return (
    <div className="pt-16 min-h-screen" style={{background:"#F5F7FF",fontFamily:"Inter, sans-serif"}}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <button onClick={() => setPage("search")} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-5 transition-colors"><ChevronLeft size={16}/> Back to results</button>

        <div className="grid grid-cols-3 gap-3 mb-6 rounded-2xl overflow-hidden h-64">
          <div className="col-span-2 bg-slate-200 h-full"><img src={`https://images.unsplash.com/${spot.img}?w=700&h=400&fit=crop&auto=format`} alt={spot.name} className="w-full h-full object-cover"/></div>
          <div className="grid grid-rows-2 gap-3">
            {["photo-1506521781263-d8422e82f27a","photo-1558618666-fcd25c85cd64"].map((id,i) => <div key={i} className="bg-slate-200 overflow-hidden"><img src={`https://images.unsplash.com/${id}?w=300&h=180&fit=crop&auto=format`} alt="parking" className="w-full h-full object-cover"/></div>)}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            {/* Header */}
            <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900" style={{fontFamily:"Outfit, sans-serif"}}>{spot.name}</h1>
                  <p className="text-sm text-slate-500 mt-0.5">{spot.building} · {spot.block}</p>
                </div>
                <div className="flex items-center gap-1 text-sm font-semibold flex-shrink-0"><Star size={16} className="text-amber-400 fill-amber-400"/>{spot.rating}<span className="text-slate-400 font-normal">(124)</span></div>
              </div>

              <div className="flex gap-1 border-b border-border -mx-6 px-6 mb-5 mt-4">
                {["overview","location","amenities","reviews"].map(t => (
                  <button key={t} onClick={() => setTab(t)} className={`text-sm font-medium pb-3 px-3 capitalize border-b-2 transition-all ${tab===t?"border-blue-600 text-blue-600":"border-transparent text-slate-500 hover:text-slate-700"}`}>{t}</button>
                ))}
              </div>

              {tab==="overview" && (
                <div className="grid sm:grid-cols-3 gap-4">
                  {[{label:"Distance",val:spot.dist,icon:<Navigation size={16}/>},{label:"Price",val:`₹${spot.price}/hr`,icon:<DollarSign size={16}/>},{label:"Hours",val:"6am – 11pm",icon:<Clock size={16}/>}].map(({label,val,icon}) => (
                    <div key={label} className="bg-slate-50 rounded-xl p-4 text-center"><div className="flex justify-center mb-2 text-blue-600">{icon}</div><div className="font-bold text-slate-900" style={{fontFamily:"Outfit, sans-serif"}}>{val}</div><div className="text-xs text-slate-400 mt-0.5">{label}</div></div>
                  ))}
                </div>
              )}

              {tab==="location" && (
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[{label:"Building",val:spot.building,icon:<Building2 size={15}/>},{label:"Block",val:spot.block,icon:<Layers size={15}/>},{label:"Coordinates",val:`${spot.coords.lat}, ${spot.coords.lng}`,icon:<Target size={15}/>},{label:"Landmark",val:spot.landmark,icon:<Milestone size={15}/>}].map(({label,val,icon}) => (
                      <div key={label} className="p-3 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-1.5 mb-1 text-blue-600">{icon}<span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</span></div>
                        <p className="text-sm text-slate-800 font-medium">{val}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <div className="flex items-center gap-2 mb-2 text-amber-700"><Zap size={15}/><span className="text-xs font-bold uppercase tracking-wide">Entry Instructions</span></div>
                    <p className="text-sm text-amber-900 leading-relaxed">{spot.entry}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-1.5 mb-1 text-blue-600"><MapPin size={15}/><span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Full Address</span></div>
                    <p className="text-sm text-slate-800">{spot.address}</p>
                  </div>
                </div>
              )}

              {tab==="amenities" && (
                <div className="grid grid-cols-2 gap-3">
                  {[{label:"CCTV Surveillance",ok:spot.cctv,icon:<Eye size={16}/>},{label:"Covered Parking",ok:spot.cover,icon:<Building2 size={16}/>},{label:"Security Guard",ok:spot.guard,icon:<Shield size={16}/>},{label:"EV Charging",ok:spot.ev,icon:<Zap size={16}/>},{label:"24/7 Access",ok:true,icon:<Clock size={16}/>},{label:"Well Lit",ok:true,icon:<Sparkles size={16}/>}].map(({label,ok,icon}) => (
                    <div key={label} className={`flex items-center gap-3 p-3 rounded-xl border ${ok?"border-green-100 bg-green-50":"border-slate-100 bg-slate-50 opacity-60"}`}>
                      <span className={ok?"text-green-600":"text-slate-400"}>{icon}</span>
                      <span className={`text-sm font-medium ${ok?"text-slate-800":"text-slate-400"}`}>{label}</span>
                      {ok?<Check size={14} className="ml-auto text-green-600"/>:<X size={14} className="ml-auto text-slate-300"/>}
                    </div>
                  ))}
                </div>
              )}

              {tab==="reviews" && (
                <div className="space-y-4">
                  {[{name:"Rahul S.",rating:5,text:"Very safe and convenient. EV charging was a huge plus!",date:"3 days ago"},{name:"Priya M.",rating:4,text:"Good location, well-lit. Booking was seamless.",date:"1 week ago"},{name:"Arjun K.",rating:5,text:"Best parking spot near Koramangala. Highly recommended!",date:"2 weeks ago"}].map(r => (
                    <div key={r.name} className="border-b border-border pb-4 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold">{r.name[0]}</div>
                          <span className="text-sm font-semibold">{r.name}</span>
                        </div>
                        <div className="flex items-center gap-0.5">{[...Array(r.rating)].map((_,i) => <Star key={i} size={12} className="text-amber-400 fill-amber-400"/>)}</div>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">{r.text}</p>
                      <span className="text-xs text-slate-400 mt-1 block">{r.date}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation Section */}
            <NavigationSection spot={spot}/>

            {/* Vehicle compatibility */}
            <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4" style={{fontFamily:"Outfit, sans-serif"}}>Vehicle Compatibility</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[{type:"Bike",ok:true,icon:<Bike size={20}/>},{type:"Hatchback",ok:true,icon:<Car size={20}/>},{type:"Sedan",ok:true,icon:<Car size={20}/>},{type:"SUV",ok:false,icon:<Car size={20}/>}].map(({type,ok,icon}) => (
                  <div key={type} className={`flex flex-col items-center gap-2 p-4 rounded-xl border ${ok?"border-green-200 bg-green-50":"border-red-100 bg-red-50"}`}>
                    <span className={ok?"text-green-600":"text-red-400"}>{icon}</span>
                    <span className={`text-sm font-medium ${ok?"text-green-700":"text-red-400"}`}>{type}</span>
                    {ok?<CheckCircle size={16} className="text-green-500"/>:<XCircle size={16} className="text-red-400"/>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl p-5 border border-border shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4" style={{fontFamily:"Outfit, sans-serif"}}>Safety Score</h3>
              <div className="flex items-center justify-center">
                <div className="relative w-28 h-28">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#E2E8F0" strokeWidth="10"/>
                    <circle cx="50" cy="50" r="40" fill="none" stroke={GREEN} strokeWidth="10" strokeDasharray={`${(spot.safety/10)*251.2} 251.2`} strokeLinecap="round"/>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-2xl font-bold text-slate-900" style={{fontFamily:"Outfit, sans-serif"}}>{spot.safety}</span><span className="text-xs text-slate-400">/ 10</span></div>
                </div>
              </div>
              <div className="mt-3 text-center"><span className="text-xs font-semibold text-green-600 bg-green-100 px-2.5 py-1 rounded-full">High Safety</span></div>
            </div>

            {/* Owner info */}
            <div className="bg-white rounded-2xl p-5 border border-border shadow-sm">
              <h3 className="font-bold text-slate-900 mb-3" style={{fontFamily:"Outfit, sans-serif"}}>Space Owner</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-lg">{spot.owner.name[0]}</div>
                <div>
                  <div className="font-semibold text-slate-900">{spot.owner.name}</div>
                  <div className="flex items-center gap-1 text-xs text-slate-400"><Star size={11} className="text-amber-400 fill-amber-400"/>{spot.owner.rating} rating</div>
                </div>
              </div>
              <a href={`tel:${spot.owner.phone}`} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border-2 border-border text-slate-700 hover:bg-slate-50 transition-all">
                <Phone size={15}/> {spot.owner.phone}
              </a>
            </div>

            <button onClick={() => setPage("booking")} className="w-full py-4 rounded-xl font-bold text-white text-lg transition-all hover:opacity-90 hover:scale-[1.02] shadow-lg shadow-blue-500/30" style={{background:`linear-gradient(135deg, ${BLUE}, ${SKY})`}}>
              Book Spot · ₹{spot.price}/hr
            </button>
            <p className="text-xs text-slate-400 text-center">Free cancellation up to 1 hour before</p>
          </div>
        </div>
      </div>
    </div>
  );
  
}

/* ─── Booking Confirmation + Success ─── */
function BookingConfirmation({
  setPage,
  selectedSpot,
}: {
  setPage: (p: Page) => void;
  selectedSpot: any;
}) {
  const [payMethod, setPayMethod] = useState("upi");
  const [confirmed, setConfirmed] = useState(false);
  const spot = selectedSpot;
  if (!spot) {
  return (
    <div className="pt-20 text-center">
      <h2>No parking spot selected.</h2>
      <button
        onClick={() => setPage("search")}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        Back to Search
      </button>
    </div>
  );
}
  const confirmBooking = async () => {
  try {
    await addDoc(collection(db, "bookings"), {
      userEmail: auth.currentUser?.email || "",
      spotName: spot.name,
      amount: 80,
      paymentMethod: payMethod,
      bookedAt: serverTimestamp(),
      status: "Confirmed",
    });

    setConfirmed(true);
  } catch (error) {
    console.error(error);
    alert("Failed to create booking.");
  }
};

  if (confirmed) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center" style={{ background: "#F5F7FF", fontFamily: "Inter, sans-serif" }}>
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: `${GREEN}20` }}>
            <CheckCircle size={48} style={{ color: GREEN }} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-3" style={{ fontFamily: "Outfit, sans-serif" }}>Booking Confirmed!</h2>
          <p className="text-slate-500 mb-2">Your parking spot has been reserved</p>
          <div className="bg-white rounded-2xl p-5 border border-border shadow-sm my-6 text-left">
            <div className="space-y-3">
              {[
  ["Spot", spot.address],
  ["Date", new Date().toLocaleDateString()],
  ["Time", "Current Booking"],
  ["Total Paid", `₹${spot.hourlyRate}`]
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm">
                  <span className="text-slate-500">{k}</span>
                  <span className="font-semibold text-slate-900">{v}</span>
                </div>
              ))}
            </div>
          </div>
          <button onClick={() => setPage("driver")}
            className="w-full py-3.5 rounded-xl font-semibold text-white transition-all hover:opacity-90"
            style={{ background: `linear-gradient(135deg, ${BLUE}, ${SKY})` }}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen" style={{ background: "#F5F7FF", fontFamily: "Inter, sans-serif" }}>
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
        <button onClick={() => setPage("details")} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-5 transition-colors">
          <ChevronLeft size={16} /> Back
        </button>
        <h1 className="text-2xl font-bold text-slate-900 mb-6" style={{ fontFamily: "Outfit, sans-serif" }}>Confirm Booking</h1>

        <div className="bg-white rounded-2xl p-5 border border-border shadow-sm mb-5">
          <div className="flex gap-4 pb-4 border-b border-border mb-4">
            <div className="w-20 h-20 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
              <img src={`https://images.unsplash.com/${spot.img}?w=160&h=160&fit=crop&auto=format`} alt={spot.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>{spot.name}</h3>
              <p className="text-sm text-slate-400">{spot.address}, {spot.city}</p>
              <div className="flex items-center gap-1 mt-1">
                <Star size={12} className="text-amber-400 fill-amber-400" />
                <span className="text-sm font-medium">{spot.rating}</span>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {[["Date", "Jun 23, 2025"], ["Time", "10:00 AM – 12:00 PM"], ["Duration", "2 hours"], ["Vehicle", "Sedan"]].map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span className="text-slate-500">{k}</span>
                <span className="font-semibold text-slate-700">{v}</span>
              </div>
            ))}
            <div className="border-t border-border pt-3 flex justify-between">
              <span className="font-bold text-slate-900">Total</span>
              <span className="font-bold text-xl" style={{ color: BLUE, fontFamily: "Outfit, sans-serif" }}>₹{spot.hourlyRate}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-border shadow-sm mb-5">
          <h3 className="font-bold text-slate-900 mb-4" style={{ fontFamily: "Outfit, sans-serif" }}>Payment Method</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: "upi", label: "UPI", icon: <Phone size={20} /> },
              { id: "card", label: "Credit Card", icon: <CreditCard size={20} /> },
              { id: "debit", label: "Debit Card", icon: <CreditCard size={20} /> },
              { id: "wallet", label: "Wallet", icon: <Wallet size={20} /> },
            ].map(({ id, label, icon }) => (
              <button key={id} onClick={() => setPayMethod(id)}
                className={`flex items-center gap-2.5 p-3.5 rounded-xl border-2 transition-all ${payMethod === id ? "border-blue-600 bg-blue-50" : "border-border hover:border-blue-300"}`}>
                <span className={payMethod === id ? "text-blue-600" : "text-slate-400"}>{icon}</span>
                <span className={`text-sm font-medium ${payMethod === id ? "text-blue-600" : "text-slate-700"}`}>{label}</span>
                {payMethod === id && <Check size={14} className="ml-auto text-blue-600" />}
              </button>
            ))}
          </div>
          {payMethod === "upi" && (
            <div className="mt-4">
              <input className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-sm outline-none" placeholder="Enter UPI ID (e.g. name@upi)" />
            </div>
          )}
        </div>

        <button onClick={confirmBooking}
          className="w-full py-4 rounded-xl font-bold text-white text-lg hover:opacity-90 transition-all shadow-lg shadow-blue-500/30"
          style={{ background: `linear-gradient(135deg, ${BLUE}, ${SKY})` }}>
          Confirm &amp; Pay ₹{spot.hourlyRate}
        </button>
        <p className="text-xs text-slate-400 text-center mt-3">Secured by 256-bit SSL encryption</p>
      </div>
    </div>
  );
}

/* ─── Owner Dashboard ─── */
function OwnerDashboard({ setPage }: { setPage: (p: Page) => void }) {
  const [mySpots, setMySpots] = useState<any[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const totalSpots = mySpots.length;
  const currentMonth = new Date().toLocaleString("default", {
  month: "long",
  year: "numeric",
});

const mySpotNames = mySpots.map((spot) => spot.address);

const ownerBookings = myBookings.filter((booking) =>
  mySpotNames.includes(booking.spotName)
);

const activeBookings = ownerBookings.length;

const occupancyRate =
  totalSpots === 0
    ? 0
    : Math.round((activeBookings / totalSpots) * 100);
    const monthlyEarnings = ownerBookings.reduce(
  (sum, booking) => sum + (booking.amount || 0),
  0
);

  useEffect(() => {
  const loadMySpots = async () => {
    try {
      const snapshot = await getDocs(collection(db, "parkingSpots"));

      const data = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter(
          (spot: any) =>
            spot.ownerEmail === auth.currentUser?.email
        );

      setMySpots(data);
    } catch (error) {
      console.error(error);
    }
  };

  loadMySpots();
}, []);
useEffect(() => {
  const loadBookings = async () => {
    try {
      const snapshot = await getDocs(collection(db, "bookings"));

      const data = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

      setMyBookings(data);
    } catch (error) {
      console.error(error);
    }
  };

  loadBookings();
}, []);
const deleteSpot = async (id: string) => {
  if (!window.confirm("Delete this parking spot?")) return;

  try {
    await deleteDoc(doc(db, "parkingSpots", id));

    setMySpots((prev) => prev.filter((spot) => spot.id !== id));
  } catch (error) {
    console.error(error);
    alert("Failed to delete spot.");
  }
};

  return (
    <div className="pt-16 min-h-screen" style={{background:"#F5F7FF",fontFamily:"Inter, sans-serif"}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div><h1 className="text-2xl font-bold text-slate-900" style={{fontFamily:"Outfit, sans-serif"}}>Owner Dashboard</h1><p className="text-slate-500 text-sm mt-0.5">Welcome back, {auth.currentUser?.displayName || "Owner"} · {currentMonth}</p></div>
          <div className="flex gap-3">
            <button onClick={() => setPage("ai-analysis")} className="flex items-center gap-2 text-sm font-medium border border-border bg-white px-4 py-2.5 rounded-xl hover:shadow-sm transition-all"><Sparkles size={15} style={{color:BLUE}}/> AI Analysis</button>
            <button onClick={() => setPage("add-spot")} className="flex items-center gap-2 text-sm font-semibold text-white px-4 py-2.5 rounded-xl hover:opacity-90 transition-all" style={{background:`linear-gradient(135deg, ${BLUE}, ${SKY})`}}><Plus size={15}/> Add New Spot</button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[{label:"Total Spots",val: totalSpots.toString(),change:"+1 this month",icon:<ParkingSquare size={20}/>,color:BLUE},{label:"Active Bookings",val: activeBookings.toString(), change:"+3 today",icon:<Calendar size={20}/>,color:GREEN},{label:"Monthly Earnings",val:`₹${monthlyEarnings.toLocaleString()}`,change:"+34% vs last month",icon:<TrendingUp size={20}/>,color:PURPLE},{label:"Occupancy Rate",val:`${occupancyRate}%`, change:"Above avg",icon:<Activity size={20}/>,color:AMBER}].map(({label,val,change,icon,color}) => (
            <div key={label} className="bg-white rounded-2xl p-5 border border-border shadow-sm">
              <div className="flex items-center justify-between mb-3"><span className="text-xs font-medium text-slate-500">{label}</span><div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:`${color}15`,color}}>{icon}</div></div>
              <div className="text-2xl font-bold text-slate-900" style={{fontFamily:"Outfit, sans-serif"}}>{val}</div>
              <div className="text-xs text-green-600 mt-1 font-medium">{change}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-border shadow-sm">
            <h3 className="font-bold text-slate-900 mb-5" style={{fontFamily:"Outfit, sans-serif"}}>Earnings Trend</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={earningsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9"/>
                <XAxis dataKey="month" tick={{fontSize:11,fill:"#94A3B8"}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:11,fill:"#94A3B8"}} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}k`}/>
                <Tooltip formatter={(v: number) => [`₹${v}`,"Earnings"]} contentStyle={{borderRadius:12,border:"none",boxShadow:"0 4px 20px rgba(0,0,0,0.08)"}}/>
                <Area type="monotone" dataKey="earnings" stroke={BLUE} strokeWidth={2.5} fill={`${BLUE}20`} isAnimationActive={false} dot={{fill:BLUE,r:4}}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-border shadow-sm">
            <h3 className="font-bold text-slate-900 mb-5" style={{fontFamily:"Outfit, sans-serif"}}>Bookings This Week</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={bookingData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false}/>
                <XAxis dataKey="day" tick={{fontSize:11,fill:"#94A3B8"}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:11,fill:"#94A3B8"}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{borderRadius:12,border:"none",boxShadow:"0 4px 20px rgba(0,0,0,0.08)"}}/>
                <Bar dataKey="bookings" fill={SKY} radius={[6,6,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border shadow-sm">
          <div className="p-5 border-b border-border flex items-center justify-between"><h3 className="font-bold text-slate-900" style={{fontFamily:"Outfit, sans-serif"}}>My Parking Spots</h3><button
  onClick={() => setPage("manage-spots")}
  className="text-xs font-medium hover:underline"
  style={{ color: BLUE }}
>
  Manage All
</button> </div>
          <div className="divide-y divide-border">
            {mySpots.map((s) => (
              <div key={s.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0"><img src={`https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=100&h=100&fit=crop&auto=format`} alt={s.name} className="w-full h-full object-cover"/></div>
                <div className="flex-1 min-w-0"><div className="font-semibold text-sm text-slate-900">{s.address}</div><div className="text-xs text-slate-400">{s.landmark} · ₹{s.hourlyRate}/hr</div></div>
                <span
  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
    s.status === "available"
      ? "bg-green-100 text-green-700"
      : "bg-amber-100 text-amber-700"
  }`}
>
  {s.status}
</span>
                <div className="flex items-center gap-3">
  <div
    className="text-sm font-bold text-slate-700"
    style={{ fontFamily: "JetBrains Mono, monospace" }}
  >
    ₹{(s.hourlyRate * 18).toLocaleString()}
  </div>

  <button
    onClick={() => deleteSpot(s.id)}
    className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded-lg"
  >
    Delete
  </button>
</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Availability Step ─── */
function AvailabilityStep() {
  const [days, setDays] = useState([true,true,true,true,true,false,false]);
  const [amenities, setAmenities] = useState([true,true,false,false]);
  const labels = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const amenityLabels = ["CCTV Surveillance","Covered Parking","Security Guard","EV Charging"];
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-2">Available Days</label>
        <div className="flex flex-wrap gap-2">
          {labels.map((d,i) => <button key={d} onClick={() => setDays(days.map((v,j) => j===i?!v:v))} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${days[i]?"text-white shadow-sm":"bg-slate-50 border border-border text-slate-600 hover:border-blue-300"}`} style={days[i]?{background:`linear-gradient(135deg, ${BLUE}, ${SKY})`}:{}}>{d}</button>)}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-xs font-semibold text-slate-600 mb-1.5">Open From</label><input type="time" defaultValue="06:00" className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400"/></div>
        <div><label className="block text-xs font-semibold text-slate-600 mb-1.5">Close At</label><input type="time" defaultValue="22:00" className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400"/></div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-2">Amenities Available</label>
        <div className="grid grid-cols-2 gap-2">
          {amenityLabels.map((l,i) => <button key={l} onClick={() => setAmenities(amenities.map((v,j) => j===i?!v:v))} className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all text-sm ${amenities[i]?"border-blue-200 bg-blue-50 text-blue-700":"border-border bg-slate-50 text-slate-500"}`}><div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${amenities[i]?"border-blue-600 bg-blue-600":"border-slate-300"}`}>{amenities[i]&&<Check size={10} className="text-white"/>}</div>{l}</button>)}
        </div>
      </div>
    </div>
  );
}

/* ─── Add Parking Spot ─── */
function AddParkingSpot({ setPage }: { setPage: (p: Page) => void }) {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [streetAddress, setStreetAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [dailyRate, setDailyRate] = useState("");
  const [weeklyRate, setWeeklyRate] = useState("");
  const steps = ["Location","Photos","Pricing","Availability"];
  const saveParkingSpot = async () => {
  try {
    await addDoc(collection(db, "parkingSpots"), {
      ownerEmail: auth.currentUser?.email || "",
      createdAt: new Date(),

      status: "available",
    address: streetAddress,
    landmark: landmark,
    hourlyRate: Number(hourlyRate),
    dailyRate: Number(dailyRate),
    weeklyRate: Number(weeklyRate),

      images: images
    });

    setSubmitted(true);
  } catch (error) {
    console.error(error);
    alert("Failed to save parking spot.");
  }
};

  if (submitted) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center" style={{background:"#F5F7FF"}}>
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{background:`${GREEN}20`}}><CheckCircle size={42} style={{color:GREEN}}/></div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2" style={{fontFamily:"Outfit, sans-serif"}}>Spot Listed Successfully!</h2>
          <p className="text-slate-500 mb-6">Your parking spot is now live and accepting bookings.</p>
          <button onClick={() => setPage("owner")} className="w-full py-3.5 rounded-xl font-semibold text-white" style={{background:`linear-gradient(135deg, ${BLUE}, ${SKY})`}}>Go to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen" style={{background:"#F5F7FF",fontFamily:"Inter, sans-serif"}}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6" style={{fontFamily:"Outfit, sans-serif"}}>List Your Parking Space</h1>
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s,i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => i+1<step&&setStep(i+1)}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step===i+1?"text-white shadow-md shadow-blue-500/30":step>i+1?"bg-green-500 text-white":"bg-slate-100 text-slate-400"}`} style={step===i+1?{background:`linear-gradient(135deg, ${BLUE}, ${SKY})`}:{}}>
                  {step>i+1?<Check size={14}/>:i+1}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${step===i+1?"text-blue-600":step>i+1?"text-green-600":"text-slate-400"}`}>{s}</span>
              </div>
              {i<steps.length-1&&<div className={`flex-1 h-0.5 ${step>i+1?"bg-green-400":"bg-slate-200"}`}/>}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-6 border border-border shadow-sm mb-5">
          {step===1 && (
  <div className="space-y-4">
    <h2
      className="font-bold text-lg text-slate-900 mb-5"
      style={{ fontFamily: "Outfit, sans-serif" }}
    >
      Location Details
    </h2>

    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
        Street Address
      </label>
      <input
        value={streetAddress}
        onChange={(e) => setStreetAddress(e.target.value)}
        className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400"
        placeholder="e.g. 12, 4th Cross, MG Road"
      />
    </div>

    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
        Building / Complex Name
      </label>
      <input
        className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400"
        placeholder="e.g. Green Residency Apartment"
      />
    </div>

    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
        Area / Locality
      </label>
      <input
        className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400"
        placeholder="e.g. Koramangala"
      />
    </div>

    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
        City
      </label>
      <input
        className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400"
        placeholder="e.g. Bangalore"
      />
    </div>

    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
        Nearby Landmark
      </label>
      <input
        value={landmark}
        onChange={(e) => setLandmark(e.target.value)}
        className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400"
        placeholder="e.g. Opposite Forum Mall"
      />
    </div>

    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
        Entry Instructions
      </label>
      <textarea
        className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400"
        placeholder="How should drivers find and enter your spot?"
      />
    </div>
  </div>
)}
          {step===2 && (
            <div>
              <h2 className="font-bold text-lg text-slate-900 mb-5" style={{fontFamily:"Outfit, sans-serif"}}>Upload Photos</h2>
              <div className={`border-2 border-dashed rounded-2xl p-10 text-center mb-4 transition-all cursor-pointer ${dragOver?"border-blue-500 bg-blue-50":"border-slate-200 hover:border-blue-300 hover:bg-slate-50"}`} onDragOver={e=>{e.preventDefault();setDragOver(true)}} onDragLeave={()=>setDragOver(false)} onDrop={e=>{e.preventDefault();setDragOver(false)}}>
                <Upload size={32} className="mx-auto mb-3 text-slate-300"/>
                <p className="text-sm font-medium text-slate-600">Drag &amp; drop photos here</p>
                <p className="text-xs text-slate-400 mt-1">or click to browse · JPG, PNG up to 10MB</p>
                <button
  type="button"
  onClick={() => document.getElementById("imageUpload")?.click()}
  className="mt-4 text-sm font-semibold px-4 py-2 rounded-lg border-2 border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
>
  <Camera size={14} className="inline mr-1.5"/>
  Browse Files
</button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {images.map((id,i) => <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 group"><img
  src={id.startsWith("blob:") ? id : `https://images.unsplash.com/${id}?w=200&h=200&fit=crop&auto=format`}
  alt="upload"
  className="w-full h-full object-cover"
/><button onClick={()=>setImages(images.filter((_,j)=>j!==i))} className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} className="text-red-500"/></button></div>)}
                <>
  <input
    id="imageUpload"
    type="file"
    accept="image/*"
    multiple
    hidden
    onChange={async (e) => {
  if (!e.target.files) return;

  const files = Array.from(e.target.files);

  const uploadedUrls: string[] = [];

  for (const file of files) {
    const imageRef = ref(
      storage,
      `parking-images/${Date.now()}-${file.name}`
    );

    await uploadBytes(imageRef, file);

    const downloadURL = await getDownloadURL(imageRef);

    uploadedUrls.push(downloadURL);
  }

  setImages((prev) => [...prev, ...uploadedUrls]);
}}
  />

  <button
    onClick={() => document.getElementById("imageUpload")?.click()}
    className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 hover:border-blue-300 hover:text-blue-300 transition-colors"
  >
    <Plus size={24}/>
  </button>
</>
              </div>
            </div>
          )}
          {step===3 && (
  <div className="space-y-5">
    <h2
      className="font-bold text-lg text-slate-900 mb-5"
      style={{ fontFamily: "Outfit, sans-serif" }}
    >
      Set Your Pricing
    </h2>

    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
        Hourly Rate
      </label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
          ₹
        </span>
        <input
          value={hourlyRate}
          onChange={(e) => setHourlyRate(e.target.value)}
          className="w-full bg-slate-50 border border-border rounded-xl pl-8 pr-4 py-3 text-sm outline-none focus:border-blue-400"
          placeholder="40"
        />
      </div>
    </div>

    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
        Daily Rate
      </label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
          ₹
        </span>
        <input
          value={dailyRate}
          onChange={(e) => setDailyRate(e.target.value)}
          className="w-full bg-slate-50 border border-border rounded-xl pl-8 pr-4 py-3 text-sm outline-none focus:border-blue-400"
          placeholder="400"
        />
      </div>
    </div>

    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
        Weekly Rate
      </label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
          ₹
        </span>
        <input
          value={weeklyRate}
          onChange={(e) => setWeeklyRate(e.target.value)}
          className="w-full bg-slate-50 border border-border rounded-xl pl-8 pr-4 py-3 text-sm outline-none focus:border-blue-400"
          placeholder="2000"
        />
      </div>
    </div>
  </div>
)}
          {step===4 && (
            <div><h2 className="font-bold text-lg text-slate-900 mb-5" style={{fontFamily:"Outfit, sans-serif"}}>Set Availability</h2><AvailabilityStep/></div>
          )}
        </div>

        <div className="flex gap-3">
          {step>1 && <button onClick={()=>setStep(step-1)} className="flex-1 py-3.5 rounded-xl font-semibold border-2 border-border text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"><ChevronLeft size={16}/> Back</button>}
          <button onClick={() => {
              if (step < 4) {
                setStep(step + 1);
              } else {
                  saveParkingSpot();
              }
}} className="flex-1 py-3.5 rounded-xl font-semibold text-white transition-all hover:opacity-90 flex items-center justify-center gap-2" style={{background:`linear-gradient(135deg, ${BLUE}, ${SKY})`}}>
            {step<4?<><span>Next</span><ChevronRight size={16}/></>:<><Check size={16}/><span>Submit Listing</span></>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── AI Analysis ─── */
function AIAnalysis({ setPage }: { setPage: (p: Page) => void }) {
  const [analyzed, setAnalyzed] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mySpots, setMySpots] = useState<any[]>([]);
  const handleAnalyze = () => { setAnalyzing(true); setTimeout(()=>{setAnalyzing(false);setAnalyzed(true);},2000); };
  const suitability = [{type:"Bike",score:100,color:GREEN},{type:"Hatchback",score:95,color:BLUE},{type:"Sedan",score:95,color:SKY},{type:"SUV",score:65,color:AMBER},{type:"Truck",score:20,color:RED}];
  useEffect(() => {
  const loadSpots = async () => {
    try {
      const snapshot = await getDocs(collection(db, "parkingSpots"));

      const data = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter(
          (spot: any) =>
            spot.ownerEmail === auth.currentUser?.email
        );

      setMySpots(data);
    } catch (error) {
      console.error(error);
    }
  };

  loadSpots();
}, []);
const latestSpot = mySpots[mySpots.length - 1];

const recommendations = [];
const qualityScore =
  (latestSpot?.cctv ? 25 : 0) +
  (latestSpot?.cover ? 20 : 0) +
  (latestSpot?.ev ? 15 : 0) +
  (latestSpot?.guard ? 20 : 0) +
  ((latestSpot?.hourlyRate || 0) >= 40 ? 20 : 10);
  const estimatedMonthly =
  (latestSpot?.hourlyRate || 0) * 4 * 30;
  const recommendedPrice =
  (latestSpot?.hourlyRate || 0) < 60
    ? (latestSpot?.hourlyRate || 0) + 10
    : latestSpot?.hourlyRate || 0;

if (latestSpot) {
  if ((latestSpot.hourlyRate || 0) < 50) {
    recommendations.push("Increase your hourly rate to improve revenue.");
  } else {
    recommendations.push("Your hourly pricing is competitive.");
  }

  if (!latestSpot.cctv) {
    recommendations.push("Installing CCTV could improve trust and bookings.");
  } else {
    recommendations.push("CCTV availability increases customer confidence.");
  }

  if (!latestSpot.ev) {
    recommendations.push("Adding EV charging can attract more drivers.");
  }

  if (!latestSpot.cover) {
    recommendations.push("Covered parking can increase occupancy during rainy seasons.");
  }

  recommendations.push("Your listing is optimized for faster bookings.");
}
  const aiScore = suitability.reduce((sum, item) => sum + item.score, 0) / suitability.length;

  return (
    <div className="pt-16 min-h-screen" style={{background:"#F5F7FF",fontFamily:"Inter, sans-serif"}}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-2"><div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:`${BLUE}15`,color:BLUE}}><Sparkles size={20}/></div><h1 className="text-2xl font-bold text-slate-900" style={{fontFamily:"Outfit, sans-serif"}}>Smart Parking Analysis</h1><span className="text-xs font-semibold px-2.5 py-1 rounded-full text-white ml-auto" style={{background:`linear-gradient(135deg, ${BLUE}, ${PURPLE})`}}>AI Powered</span></div>
        <p className="text-slate-500 text-sm mb-7">Upload a photo of your parking space to get instant AI-powered suitability analysis</p>

        {!analyzed ? (
          <div className="grid lg:grid-cols-2 gap-6">
            <div>
              <div className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${analyzing?"border-blue-500 bg-blue-50":"border-slate-200 hover:border-blue-300 bg-white"}`}>
                {analyzing ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative w-16 h-16"><div className="absolute inset-0 rounded-full border-4 border-blue-100"/><div className="absolute inset-0 rounded-full border-4 border-t-blue-600 animate-spin"/></div>
                    <p className="font-semibold text-blue-600">Analyzing your parking space...</p>
                    <p className="text-sm text-slate-400">Detecting dimensions, surface, obstacles</p>
                  </div>
                ) : (<><Camera size={48} className="mx-auto mb-4 text-slate-300"/><h3 className="font-bold text-slate-700 mb-2" style={{fontFamily:"Outfit, sans-serif"}}>Upload Parking Photo</h3><p className="text-sm text-slate-400 mb-6">Get instant AI analysis for vehicle compatibility, safety, and dimensions</p>
                {selectedImage && (
  <div className="mb-6">
    <img
      src={selectedImage}
      alt="Parking Preview"
      className="w-full h-64 object-cover rounded-xl border border-border"
    />

    <button
      onClick={handleAnalyze}
      className="w-full mt-4 py-3 rounded-xl font-semibold text-white"
      style={{
        background: `linear-gradient(135deg, ${BLUE}, ${PURPLE})`,
      }}
    >
      Analyze Image
    </button>

    <button
      onClick={() => setSelectedImage(null)}
      className="w-full mt-3 py-2 rounded-xl border border-border text-slate-700 hover:bg-slate-50"
    >
      Choose Another Image
    </button>
  </div>
)}
  {!selectedImage && (
  <>
    <input
      id="parking-upload"
      type="file"
      accept="image/*"
      className="hidden"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedImage(URL.createObjectURL(file));
      }}
    />

    <button
      onClick={() =>
        document.getElementById("parking-upload")?.click()
      }
      className="px-6 py-3 rounded-xl font-semibold text-white hover:opacity-90"
      style={{
        background: `linear-gradient(135deg, ${BLUE}, ${SKY})`,
      }}
    >
      <Upload size={16} className="inline mr-2" />
      Upload Parking Photo
    </button>
  </>
)}</>)}
              </div>
              <div className="mt-4 bg-white rounded-2xl p-5 border border-border shadow-sm">
                <h3 className="font-semibold text-slate-800 mb-3 text-sm" style={{fontFamily:"Outfit, sans-serif"}}>What we analyze</h3>
                <div className="space-y-2.5">
                  {[{label:"Vehicle Suitability",desc:"Which vehicle types fit safely",icon:<Car size={14}/>},{label:"Space Dimensions",desc:"Estimated width and length",icon:<Layers size={14}/>},{label:"Surface Condition",desc:"Detect cracks, bumps, flooding risk",icon:<BarChart3 size={14}/>},{label:"Obstacle Detection",desc:"Pillars, walls, tight turns",icon:<Eye size={14}/>},{label:"Safety Assessment",desc:"Lighting, visibility, risk factors",icon:<Shield size={14}/>}].map(({label,desc,icon}) => (
                    <div key={label} className="flex items-center gap-3"><div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{background:`${BLUE}12`,color:BLUE}}>{icon}</div><div><div className="text-sm font-medium text-slate-700">{label}</div><div className="text-xs text-slate-400">{desc}</div></div></div>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-border shadow-sm flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4" style={{background:`${BLUE}10`}}><Sparkles size={36} style={{color:BLUE}}/></div>
              <h3 className="font-bold text-slate-900 mb-2" style={{fontFamily:"Outfit, sans-serif"}}>AI-Powered Intelligence</h3>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs">Our computer vision model analyzes your parking space in seconds to give you accurate vehicle compatibility scores and safety ratings.</p>
              <button onClick={handleAnalyze} className="mt-6 px-5 py-2.5 rounded-xl text-sm font-semibold text-white" style={{background:`linear-gradient(135deg, ${BLUE}, ${PURPLE})`}}>Try Demo Analysis →</button>
            </div>
          </div>
        ) : (
          <div>
            {selectedImage && (
  <div className="bg-white rounded-2xl p-4 border border-border shadow-sm mb-6">
    <img
      src={selectedImage}
      alt="Analyzed Parking"
      className="w-full h-72 object-cover rounded-xl"
    />
  </div>
)}
            <div
  className="mb-6 rounded-2xl p-6 text-white shadow-lg"
  style={{ background: `linear-gradient(135deg, ${BLUE}, ${PURPLE})` }}
>
  <div className="flex justify-between items-start">

    <div>
      <h2
        className="text-2xl font-bold"
        style={{ fontFamily: "Outfit, sans-serif" }}
      >
        🤖 AI Parking Quality Score
      </h2>

      <p className="text-blue-100 mt-2">
        Based on your latest parking listing
      </p>
    </div>

    <div className="text-6xl font-black opacity-20">
      {qualityScore}
    </div>

  </div>

  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">

    <div className="bg-white/10 rounded-xl p-4">
      <div className="text-3xl font-bold">
        {qualityScore}/100
      </div>
      <div className="text-blue-100 text-sm">
        Overall Score
      </div>
    </div>

    <div className="bg-white/10 rounded-xl p-4">
      <div className="text-3xl font-bold">
        ₹{recommendedPrice}
      </div>
      <div className="text-blue-100 text-sm">
        Suggested Price
      </div>
    </div>

    <div className="bg-white/10 rounded-xl p-4">
      <div className="text-3xl font-bold">
        ₹{estimatedMonthly.toLocaleString()}
      </div>
      <div className="text-blue-100 text-sm">
        Monthly Estimate
      </div>
    </div>

    <div className="bg-white/10 rounded-xl p-4">
      <div className="text-3xl font-bold">
        {qualityScore >= 80
          ? "⭐⭐⭐⭐⭐"
          : qualityScore >= 60
          ? "⭐⭐⭐⭐"
          : "⭐⭐⭐"}
      </div>
      <div className="text-blue-100 text-sm">
        AI Rating
      </div>
    </div>
    <div className="mt-6">
  <div className="flex justify-between text-sm mb-2">
    <span className="font-semibold text-white">
      AI Confidence
    </span>

    <span className="font-bold">
      {qualityScore >= 80
        ? "96%"
        : qualityScore >= 60
        ? "88%"
        : "72%"}
    </span>
  </div>

  <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
    <div
      className="h-full bg-white rounded-full transition-all"
      style={{
        width: `${
          qualityScore >= 80
            ? 96
            : qualityScore >= 60
            ? 88
            : 72
        }%`,
      }}
    />
  </div>
</div>

  </div>
</div>
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
                <h3 className="font-bold text-slate-900 mb-5" style={{fontFamily:"Outfit, sans-serif"}}>Vehicle Suitability</h3>
                <div className="space-y-4">
                  {suitability.map(({type,score,color}) => (
                    <div key={type}><div className="flex justify-between text-sm mb-1.5"><span className="font-medium text-slate-700">{type}</span><span className="font-bold" style={{color,fontFamily:"JetBrains Mono, monospace"}}>{score}%</span></div><div className="h-2.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{width:`${score}%`,background:color}}/></div></div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-5 border border-border shadow-sm grid grid-cols-2 gap-4">
                  {[
  {
    label: "Hourly Rate",
    val: `₹${latestSpot?.hourlyRate || 0}`,
    icon: <DollarSign size={16}/>,
    color: BLUE,
  },
  {
    label: "Daily Rate",
    val: `₹${latestSpot?.dailyRate || 0}`,
    icon: <Calendar size={16}/>,
    color: SKY,
  },
  {
    label: "Weekly Rate",
    val: `₹${latestSpot?.weeklyRate || 0}`,
    icon: <TrendingUp size={16}/>,
    color: PURPLE,
  },
  {
    label: "Status",
    val: latestSpot?.status || "Available",
    icon: <CheckCircle size={16}/>,
    color: GREEN,
  }
].map(({label,val,icon,color}) => (
                    <div key={label} className="text-center p-3 rounded-xl bg-slate-50"><div className="flex justify-center mb-1.5" style={{color}}>{icon}</div><div className="font-bold text-slate-900 text-sm" style={{fontFamily:"Outfit, sans-serif"}}>{val}</div><div className="text-xs text-slate-400">{label}</div></div>
                  ))}
                </div>
                <div className="bg-white rounded-2xl p-5 border border-border shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-4" style={{fontFamily:"Outfit, sans-serif"}}>Safety Assessment</h3>
                  <div className="space-y-3">
                    {[
  {
    label: "CCTV",
    val: latestSpot?.cctv ? "Available" : "Not Available",
    color: latestSpot?.cctv ? GREEN : RED,
  },
  {
    label: "Covered Parking",
    val: latestSpot?.cover ? "Yes" : "No",
    color: latestSpot?.cover ? GREEN : RED,
  },
  {
    label: "EV Charging",
    val: latestSpot?.ev ? "Available" : "Not Available",
    color: latestSpot?.ev ? GREEN : RED,
  },
  {
    label: "Guard",
    val: latestSpot?.guard ? "Available" : "Not Available",
    color: latestSpot?.guard ? GREEN : AMBER,
  }
].map(({label,val,color}) => (
                      <div key={label} className="flex items-center justify-between"><span className="text-sm text-slate-600">{label}</span><span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{background:`${color}15`,color}}>{val}</span></div>
                    ))}
                  </div>
                </div>
              </div>


  <h2
    className="text-xl font-bold mb-5"
    style={{ fontFamily: "Outfit, sans-serif" }}
  >
    🤖 AI Parking Quality Score
  </h2>

  <div className="grid grid-cols-2 gap-4">

    <div>
      <div className="text-4xl font-black">
        {qualityScore}/100
      </div>
      <div className="text-blue-100 text-sm">
        Overall Score
      </div>
    </div>

    <div>
      <div className="text-2xl font-bold">
        ₹{recommendedPrice}/hr
      </div>
      <div className="text-blue-100 text-sm">
        Recommended Price
      </div>
    </div>

    <div>
      <div className="text-2xl font-bold">
        ₹{estimatedMonthly.toLocaleString()}
      </div>
      <div className="text-blue-100 text-sm">
        Estimated Monthly Earnings
      </div>
    </div>

    <div>
      <div className="text-2xl font-bold">
        {qualityScore >= 80
          ? "Excellent"
          : qualityScore >= 60
          ? "Good"
          : "Average"}
      </div>
      <div className="text-blue-100 text-sm">
        AI Verdict
      </div>
    </div>

  </div>
</div>
            <div className="mt-6 bg-white rounded-2xl p-5 border border-border shadow-sm">
  <h3
    className="font-bold text-slate-900 mb-4"
    style={{ fontFamily: "Outfit, sans-serif" }}
  >
    🤖 AI Recommendations
  </h3>

  <div className="space-y-3">
    {recommendations.map((rec, index) => (
      <div
        key={index}
        className="flex items-start gap-3 p-3 rounded-xl bg-blue-50"
      >
        <Sparkles size={16} className="text-blue-600 mt-0.5" />
        <span className="text-sm text-slate-700">
          {rec}
        </span>
      </div>
    ))}
  </div>
</div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button onClick={()=>setAnalyzed(false)} className="flex-1 py-3.5 rounded-xl font-semibold border-2 border-border text-slate-700 hover:bg-slate-50 transition-all">Analyze Another</button><button
  onClick={() => window.print()}
  className="flex-1 py-3.5 rounded-xl font-semibold border border-blue-500 text-blue-600 hover:bg-blue-50 transition-all"
>
  📄 Download AI Report
</button>
              <button onClick={()=>setPage("add-spot")} className="flex-1 py-3.5 rounded-xl font-semibold text-white hover:opacity-90 transition-all" style={{background:`linear-gradient(135deg, ${BLUE}, ${SKY})`}}>List This Spot</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Smart Allocation ─── */
function SmartAllocation({ setPage }: { setPage: (p: Page) => void }) {
  const [searched, setSearched] = useState(false);
  const [dest, setDest] = useState("");
  const [vehicle, setVehicle] = useState("Sedan");
  const [destination, setDestination] = useState("");
const [bestSpot, setBestSpot] = useState(spots[0]);
const [rankedSpots, setRankedSpots] = useState(spots);
  const [time, setTime] = useState("10:00");
  const ranked = [
    {rank:1,name:"Green Residency Visitor Parking",dist:"0.3 km",price:40,score:97,avail:92,reasons:["Closest Distance","Lowest Cost","High Availability","AI Best Match"]},
    {rank:2,name:"Indiranagar 100ft Road Hub",dist:"0.7 km",price:55,score:91,avail:78,reasons:["EV Charging","Well Lit","CCTV"]},
    {rank:3,name:"HSR Layout Society Parking",dist:"1.2 km",price:30,score:88,avail:95,reasons:["Cheapest Option","Covered Parking"]},
    {rank:4,name:"Whitefield IT Park Premium",dist:"2.4 km",price:70,score:85,avail:45,reasons:["Premium Safety","Guard Available"]},
    {rank:5,name:"BTM Layout Open Yard",dist:"1.8 km",price:25,score:79,avail:88,reasons:["Budget Friendly"]},
  ];

  return (
    <div className="pt-16 min-h-screen" style={{background:"#F5F7FF",fontFamily:"Inter, sans-serif"}}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-2"><div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:`${PURPLE}15`,color:PURPLE}}><Target size={20}/></div><h1 className="text-2xl font-bold text-slate-900" style={{fontFamily:"Outfit, sans-serif"}}>Smart Parking Allocation</h1><span className="text-xs font-semibold px-2.5 py-1 rounded-full ml-auto" style={{background:`${PURPLE}15`,color:PURPLE}}>AI Powered</span></div>
        <p className="text-slate-500 text-sm mb-7">Let our AI find the optimal parking spot based on your exact requirements</p>

        <div className="bg-white rounded-2xl p-6 border border-border shadow-sm mb-6">
          <div className="grid sm:grid-cols-3 gap-4 mb-5">
            <div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Destination</label><div className="flex items-center gap-2 bg-slate-50 border border-border rounded-xl px-3 py-2.5"><MapPin size={16} className="text-slate-400"/><input className="bg-transparent text-sm outline-none w-full text-slate-700" placeholder="Where are you going?" value={dest} onChange={e=>setDest(e.target.value)}/></div></div>
            <div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Vehicle Type</label><select className="w-full bg-slate-50 border border-border rounded-xl px-3 py-2.5 text-sm text-slate-700 outline-none" value={vehicle} onChange={e=>setVehicle(e.target.value)}>{["Bike","Hatchback","Sedan","SUV"].map(v=><option key={v}>{v}</option>)}</select></div>
            <div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Arrival Time</label><div className="flex items-center gap-2 bg-slate-50 border border-border rounded-xl px-3 py-2.5"><Clock size={16} className="text-slate-400"/><input type="time" className="bg-transparent text-sm outline-none w-full text-slate-700" value={time} onChange={e=>setTime(e.target.value)}/></div></div>
          </div>
          <button onClick={() => {
  const ranked = [...spots].sort((a, b) => {
    let scoreA = a.score;
    let scoreB = b.score;

    if (
      vehicle === "SUV" &&
      a.vehicles.includes("suv")
    )
      scoreA += 15;

    if (
      vehicle === "SUV" &&
      b.vehicles.includes("suv")
    )
      scoreB += 15;

    if (
      vehicle === "Bike" &&
      a.vehicles.includes("bike")
    )
      scoreA += 15;

    if (
      vehicle === "Bike" &&
      b.vehicles.includes("bike")
    )
      scoreB += 15;

    return scoreB - scoreA;
  });

  setRankedSpots(ranked);
  setBestSpot(ranked[0]);
  setSearched(true);
}} className="w-full sm:w-auto flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white hover:opacity-90 transition-all" style={{background:`linear-gradient(135deg, ${PURPLE}, #A78BFA)`}}>
            <Sparkles size={18}/> Find Optimal Spot
          </button>
        </div>

        {searched && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-3">
              <div className="rounded-2xl p-6 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full -translate-y-8 translate-x-8 opacity-50"/>
                <div className="flex items-start gap-4 relative z-10">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white flex-shrink-0" style={{background:`linear-gradient(135deg, ${BLUE}, ${SKY})`}}><Target size={26}/></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1"><span className="text-xs font-bold px-2.5 py-1 rounded-full text-white" style={{background:BLUE}}>AI Recommended #1</span><span className="text-xs font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-700">{bestSpot.score}% Match</span></div>
                    <h2 className="text-xl font-bold text-slate-900" style={{fontFamily:"Outfit, sans-serif"}}>{bestSpot.name}</h2>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {ranked[0].reasons.map(r=><span key={r} className="flex items-center gap-1 text-xs font-medium text-blue-700 bg-white px-2.5 py-1 rounded-full border border-blue-200"><Check size={10}/> {r}</span>)}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-3xl font-black" style={{color:BLUE,fontFamily:"Outfit, sans-serif"}}>₹{bestSpot.price}</div>
                    <div className="text-sm text-slate-400">/hour</div>
                    <button onClick={()=>setPage("booking")} className="mt-3 px-5 py-2.5 rounded-xl font-semibold text-white text-sm" style={{background:`linear-gradient(135deg, ${BLUE}, ${SKY})`}}>Reserve Now</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-2 bg-white rounded-2xl border border-border shadow-sm">
              <div className="p-5 border-b border-border"><h3 className="font-bold text-slate-900" style={{fontFamily:"Outfit, sans-serif"}}>Top 5 Ranked Options</h3></div>
              <div className="divide-y divide-border">
                {rankedSpots.map((spot, index) => (
                  <div key={index + 1} className={`flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors ${index===0?"bg-blue-50/50":""}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 ${index===0?"text-white":"bg-slate-100 text-slate-500"}`} style={index===0?{background:`linear-gradient(135deg, ${BLUE}, ${SKY})`}:{}}>{index + 1}</div>
                    <div className="flex-1 min-w-0"><div className="font-semibold text-sm text-slate-900">{spot.name}</div><div className="text-xs text-slate-400 mt-0.5">{spot.dist} · ₹{spot.price}/hr · 100% available</div><div className="flex flex-wrap gap-1 mt-1"><div className="flex flex-wrap gap-1 mt-1">
  {spot.ev && (
    <span className="text-xs px-1.5 py-0.5 rounded bg-slate-100">
      EV
    </span>
  )}

  {spot.cover && (
    <span className="text-xs px-1.5 py-0.5 rounded bg-slate-100">
      Covered
    </span>
  )}

  {spot.cctv && (
    <span className="text-xs px-1.5 py-0.5 rounded bg-slate-100">
      CCTV
    </span>
  )}
</div></div></div>
                    <div className="text-right flex-shrink-0"><div className="text-lg font-bold" style={{color:index===0?BLUE:NAVY,fontFamily:"Outfit, sans-serif"}}>{spot.score}%</div><div className="text-xs text-slate-400">AI score</div></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-border shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4" style={{fontFamily:"Outfit, sans-serif"}}>Score Comparison</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={ranked.map(r=>({name:r.name.split(" ")[0],score:r.score}))} layout="vertical" barSize={18}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false}/>
                  <XAxis type="number" domain={[60,100]} tick={{fontSize:10,fill:"#94A3B8"}} axisLine={false} tickLine={false}/>
                  <YAxis dataKey="name" type="category" tick={{fontSize:11,fill:"#64748B"}} axisLine={false} tickLine={false} width={60}/>
                  <Tooltip contentStyle={{borderRadius:12,border:"none",boxShadow:"0 4px 20px rgba(0,0,0,0.08)"}}/>
                  <Bar dataKey="score" radius={[0,6,6,0]}>{ranked.map((_,i)=><Cell key={`rank-${i}`} fill={i===0?BLUE:i===1?SKY:i===2?GREEN:`${BLUE}60`}/>)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {!searched && <div className="bg-white rounded-2xl p-10 border border-border shadow-sm text-center"><Target size={48} className="mx-auto mb-4" style={{color:`${PURPLE}60`}}/><h3 className="font-bold text-slate-700 mb-2" style={{fontFamily:"Outfit, sans-serif"}}>Enter your destination above</h3><p className="text-sm text-slate-400">Our AI will rank the best available spots for your exact needs</p></div>}
      </div>
    </div>
  );
}

/* ─── Community Impact ─── */
function CommunityImpact() {
  const impactData = [{month:"Jan",fuel:1200,emissions:850},{month:"Feb",fuel:1800,emissions:1200},{month:"Mar",fuel:2400,emissions:1600},{month:"Apr",fuel:3200,emissions:2100},{month:"May",fuel:4100,emissions:2700},{month:"Jun",fuel:5600,emissions:3800}];
  const pieData = [{name:"Utilized",value:78},{name:"Shared",value:15},{name:"New",value:7}];
  return (
    <div className="pt-16 min-h-screen" style={{fontFamily:"Inter, sans-serif"}}>
      <section className="py-20 px-4 sm:px-6 text-white relative overflow-hidden" style={{background:`linear-gradient(160deg, ${NAVY} 0%, #1E3A8A 100%)`}}>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-xs font-medium px-3 py-1.5 rounded-full mb-6 border border-white/20"><Leaf size={12}/> Environmental Impact</div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4" style={{fontFamily:"Outfit, sans-serif"}}>Making Cities <span className="text-transparent bg-clip-text" style={{backgroundImage:"linear-gradient(90deg, #34D399, #6EE7B7)"}}>Greener</span> Together</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">Every shared parking space reduces traffic, saves fuel, and cuts emissions for a healthier community.</p>
        </div>
      </section>

      <section className="px-4 sm:px-6 -mt-10 relative z-20 max-w-5xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[{icon:<Fuel size={22}/>,val:"48,200 L",label:"Fuel Saved",sub:"Since launch",color:GREEN},{icon:<Wind size={22}/>,val:"124 Tons",label:"CO₂ Reduced",sub:"Carbon offset",color:SKY},{icon:<ParkingSquare size={22}/>,val:"5,200+",label:"Spaces Utilized",sub:"Across 50+ cities",color:BLUE},{icon:<Activity size={22}/>,val:"31%",label:"Traffic Reduced",sub:"In partner zones",color:PURPLE}].map(({icon,val,label,sub,color}) => (
            <div key={label} className="bg-white rounded-2xl p-5 shadow-md border border-border text-center"><div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{background:`${color}15`,color}}>{icon}</div><div className="text-2xl font-black text-slate-900 mb-0.5" style={{fontFamily:"Outfit, sans-serif"}}>{val}</div><div className="font-semibold text-slate-700 text-sm">{label}</div><div className="text-xs text-slate-400 mt-0.5">{sub}</div></div>
          ))}
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-900 mb-8" style={{fontFamily:"Outfit, sans-serif"}}>Impact Over Time</h2>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-border shadow-sm">
            <h3 className="font-bold text-slate-900 mb-5" style={{fontFamily:"Outfit, sans-serif"}}>Fuel Saved &amp; Emissions Reduced</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={impactData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9"/>
                <XAxis dataKey="month" tick={{fontSize:11,fill:"#94A3B8"}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:11,fill:"#94A3B8"}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{borderRadius:12,border:"none",boxShadow:"0 4px 20px rgba(0,0,0,0.08)"}}/>
                <Area type="monotone" dataKey="fuel" name="Fuel Saved (L)" stroke={GREEN} strokeWidth={2.5} fill={`${GREEN}30`} isAnimationActive={false} dot={false}/>
                <Area type="monotone" dataKey="emissions" name="CO₂ Reduced (kg)" stroke={BLUE} strokeWidth={2.5} fill={`${BLUE}25`} isAnimationActive={false} dot={false}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
            <h3 className="font-bold text-slate-900 mb-5" style={{fontFamily:"Outfit, sans-serif"}}>Space Utilization</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" isAnimationActive={false}>{pieData.map((d,i)=><Cell key={`pie-${d.name}`} fill={[GREEN,BLUE,AMBER][i]}/>)}</Pie><Tooltip contentStyle={{borderRadius:12,border:"none",boxShadow:"0 4px 20px rgba(0,0,0,0.08)"}}/></PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">{[{c:GREEN,l:"Utilized",v:"78%"},{c:BLUE,l:"Newly Shared",v:"15%"},{c:AMBER,l:"Coming Soon",v:"7%"}].map(({c,l,v})=><div key={l} className="flex items-center justify-between text-sm"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{background:c}}/><span className="text-slate-600">{l}</span></div><span className="font-bold text-slate-900">{v}</span></div>)}</div>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 sm:px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 mb-8" style={{fontFamily:"Outfit, sans-serif"}}>Community Stories</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[{name:"Anita R.",role:"Homeowner, Bangalore",quote:"I earn ₹6,000 extra every month just from my empty garage. SpotShare made it effortless.",img:"photo-1494790108377-be9c29b29330"},{name:"Dev K.",role:"Daily Commuter",quote:"I used to spend 20 minutes finding parking. Now I reserve a spot before I even leave home.",img:"photo-1507003211169-0a1dd7228f2d"},{name:"Priya M.",role:"Shop Owner, HSR Layout",quote:"Our vacant lot now generates revenue AND reduces parking chaos outside our shop.",img:"photo-1438761681033-6461ffad8d80"}].map(({name,role,quote,img}) => (
              <div key={name} className="bg-slate-50 rounded-2xl p-5 border border-border"><p className="text-sm text-slate-600 leading-relaxed mb-4">"{quote}"</p><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden"><img src={`https://images.unsplash.com/${img}?w=80&h=80&fit=crop&auto=format`} alt={name} className="w-full h-full object-cover"/></div><div><div className="text-sm font-bold text-slate-900">{name}</div><div className="text-xs text-slate-400">{role}</div></div></div></div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto rounded-3xl p-10 text-center" style={{background:`linear-gradient(135deg, #0A0F1E, #1E3A8A)`}}>
          <Leaf size={40} className="mx-auto mb-4 text-green-400"/>
          <h2 className="text-2xl font-bold text-white mb-3" style={{fontFamily:"Outfit, sans-serif"}}>Be Part of the Solution</h2>
          <p className="text-blue-200 mb-7">Join 10,000+ drivers and space owners already making a positive impact on their city.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button className="px-6 py-3 rounded-xl font-semibold text-white border border-white/30 hover:bg-white/10 transition-all">Find Parking</button>
            <button className="px-6 py-3 rounded-xl font-semibold text-blue-900 bg-white hover:shadow-lg transition-all">List Your Space</button>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ─── Root App ─── */
export default function App() {
  const [page, setPage] = useState<Page>("landing");
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-background" style={{fontFamily:"Inter, sans-serif"}}>
      {page !== "login" && page !== "signup" && page !== "forgot-password" && page !== "verify-email" && page !== "auth-success" && (
        <Navbar page={page} setPage={setPage} authUser={authUser} setAuthUser={setAuthUser}/>
      )}

      {page === "landing" && <LandingPage setPage={setPage}/>}
      {page === "login" && <LoginPage setPage={setPage} setAuthUser={setAuthUser}/>}
      {page === "signup" && <SignupPage setPage={setPage} setAuthUser={setAuthUser}/>}
      {page === "forgot-password" && <ForgotPasswordPage setPage={setPage}/>}
      {page === "verify-email" && <VerifyEmailPage setPage={setPage}/>}
      {page === "auth-success" && <AuthSuccessPage setPage={setPage} authUser={authUser}/>}
      {page === "driver" && (
  <DriverDashboard
    setPage={setPage}
    setSearchQuery={setSearchQuery}
  />
)}
      {page === "search" && (
  <SearchResults
    setPage={setPage}
    setSelectedSpot={setSelectedSpot}
    searchQuery={searchQuery}
  />
)}
      {page === "details" && (
  <ParkingDetails
    setPage={setPage}
    selectedSpot={selectedSpot}
  />
)}

{page === "booking" && (
  <BookingConfirmation
    setPage={setPage}
    selectedSpot={selectedSpot}
  />
)}
      {page === "owner" && <OwnerDashboard setPage={setPage}/>}
      {page === "add-spot" && <AddParkingSpot setPage={setPage}/>}
      {page === "ai-analysis" && <AIAnalysis setPage={setPage}/>}
      {page === "smart-allocation" && <SmartAllocation setPage={setPage}/>}
      {page === "community" && <CommunityImpact/>}
      {page === "manage-spots" && <ManageSpots setPage={setPage} />}

      {/* Quick nav dock */}
      {page !== "login" && page !== "signup" && page !== "forgot-password" && page !== "verify-email" && page !== "auth-success" && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 hidden lg:flex">
          <div className="bg-white/95 backdrop-blur border border-border rounded-2xl shadow-xl px-2 py-1.5 flex items-center gap-0.5">
            {([["landing","Home"],["driver","Driver"],["search","Search"],["details","Details"],["owner","Owner"],["ai-analysis","AI"],["smart-allocation","Allocate"],["community","Impact"]] as [Page,string][]).map(([p,l]) => (
              <button key={p} onClick={() => setPage(p)}
                className={`text-xs font-semibold px-3 py-2 rounded-xl transition-all whitespace-nowrap ${page===p?"text-white shadow-sm":"text-slate-500 hover:bg-slate-50"}`}
                style={page===p?{background:`linear-gradient(135deg, ${BLUE}, ${SKY})`}:{}}>
                {l}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
  
}


function ManageSpots({ setPage }: { setPage: (p: Page) => void }) {
  const [mySpots, setMySpots] = useState<any[]>([]);

  useEffect(() => {
    const loadMySpots = async () => {
      try {
        const snapshot = await getDocs(collection(db, "parkingSpots"));

        const data = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter(
            (spot: any) => spot.ownerEmail === auth.currentUser?.email
          );

        setMySpots(data);
      } catch (error) {
        console.error(error);
      }
    };

    loadMySpots();
  }, []);

  const deleteSpot = async (id: string) => {
    if (!confirm("Delete this parking spot?")) return;

    try {
      await deleteDoc(doc(db, "parkingSpots", id));

      setMySpots((prev) => prev.filter((spot) => spot.id !== id));
    } catch (error) {
      console.error(error);
      alert("Failed to delete.");
    }
  };

  return (
    <div
      className="pt-16 min-h-screen"
      style={{ background: "#F5F7FF", fontFamily: "Inter, sans-serif" }}
    >
      <div className="max-w-5xl mx-auto px-6 py-8">

        <button
          onClick={() => setPage("owner")}
          className="mb-6 text-blue-600 font-medium"
        >
          ← Back
        </button>

        <h1
          className="text-3xl font-bold mb-6"
          style={{ fontFamily: "Outfit, sans-serif" }}
        >
          Manage My Parking Spots
        </h1>

        <div className="space-y-4">
          {mySpots.map((spot) => (
            <div
              key={spot.id}
              className="bg-white rounded-xl p-5 shadow-sm flex justify-between items-center"
            >
              <div>
                <h3 className="font-bold text-lg">
                  {spot.address}
                </h3>

                <p className="text-slate-500">
                  {spot.landmark}
                </p>

                <p className="text-blue-600 font-semibold">
                  ₹{spot.hourlyRate}/hr
                </p>
              </div>

              <button
                onClick={() => deleteSpot(spot.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
              >
                Delete
              </button>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}



