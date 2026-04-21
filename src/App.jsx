import { useMemo, useState } from "react";

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

async function api(path, init) {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Request failed");
  return data;
}

export default function App() {
  const [mode, setMode] = useState("login"); // login | signup
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [businessName, setBusinessName] = useState("My Shop");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");

  const canCallApi = useMemo(() => Boolean(API_URL), []);

  async function onLogin(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const out = await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      setToken(out.token);
    } catch (err) {
      setError(err?.message || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  async function onSignup(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const out = await api("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          businessName,
          fullName,
          email,
          password,
          pin: pin ? pin : undefined,
        }),
      });
      setToken(out.token);
    } catch (err) {
      setError(err?.message || "Signup failed");
    } finally {
      setBusy(false);
    }
  }

  async function onMe() {
    setBusy(true);
    setError("");
    try {
      const out = await api("/api/me", { headers: { authorization: `Bearer ${token}` } });
      alert(JSON.stringify(out, null, 2));
    } catch (err) {
      setError(err?.message || "Request failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-full bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-md px-4 py-10">
        <div className="mb-6">
          <div className="text-2xl font-semibold tracking-tight">BILLSPARK</div>
          <div className="text-sm text-slate-400">Local-first POS & Inventory (GHS)</div>
        </div>

        {!canCallApi && (
          <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
            Set <span className="font-mono">VITE_API_URL</span> (see <span className="font-mono">frontend/.env.example</span>).
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="mb-3 flex gap-2">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 rounded-lg px-3 py-2 text-sm ${
                mode === "login" ? "bg-sky-500 text-white" : "bg-slate-800 text-slate-200"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 rounded-lg px-3 py-2 text-sm ${
                mode === "signup" ? "bg-sky-500 text-white" : "bg-slate-800 text-slate-200"
              }`}
            >
              Sign up
            </button>
          </div>

          {mode === "login" ? (
            <form onSubmit={onLogin} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">Email</label>
                <input
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-sky-500"
                  placeholder="you@shop.com"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Password</label>
                <input
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  type="password"
                  className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-sky-500"
                />
              </div>
              <button
                disabled={busy || !canCallApi}
                className="w-full rounded-lg bg-sky-500 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {busy ? "..." : "Login"}
              </button>
            </form>
          ) : (
            <form onSubmit={onSignup} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">Business name</label>
                <input
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Full name</label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-sky-500"
                  placeholder="you@shop.com"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Password</label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">POS PIN (optional 4 digits)</label>
                <input
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  inputMode="numeric"
                  className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-sky-500"
                  placeholder="1234"
                />
              </div>
              <button
                disabled={busy || !canCallApi}
                className="w-full rounded-lg bg-sky-500 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {busy ? "..." : "Create business"}
              </button>
            </form>
          )}
        </div>

        <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="text-xs text-slate-400">Session</div>
          <div className="mt-1 break-all font-mono text-[11px] text-slate-200">
            {token ? token : "No token yet"}
          </div>
          <button
            type="button"
            disabled={!token || busy || !canCallApi}
            onClick={onMe}
            className="mt-3 w-full rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-100 disabled:opacity-60"
          >
            Call /api/me
          </button>
        </div>
      </div>
    </div>
  );
}
