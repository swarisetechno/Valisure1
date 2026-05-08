import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi, saveAuthSession } from "@/services/api";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await authApi.login(email, password);

      // Save token and user data
      saveAuthSession(data.access_token, data.user);

      // Determine dashboard route based on role permission_level
      const permLevel = data.user?.role?.permission_level;
      let targetRoute = "/user-dashboard";

      if (permLevel === "admin") {
        targetRoute = "/admin-dashboard";
      } else if (permLevel === "editor") {
        targetRoute = "/author-dashboard";
      } else if (permLevel === "viewer") {
        targetRoute = "/user-dashboard";
      }

      navigate(targetRoute);
    } catch (err: any) {
      setError(err.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[hsl(var(--background))] overflow-hidden">
      {/* Left brand panel */}
      <aside
        className="hidden lg:flex absolute left-0 top-0 h-full w-[57.36%] flex-col justify-between p-6"
        style={{
          background:
            "linear-gradient(145.27deg, hsl(var(--brand-panel-from)) 0.63%, hsl(var(--brand-panel-to)) 65.19%)",
        }}
      >
        <h1 className="mt-12 ml-2 text-white font-semibold text-[50px] leading-[70px] tracking-[-0.4px]">
          ValiSure
        </h1>
        <div className="ml-2 mb-6 flex flex-col gap-[19px] max-w-[510px]">
          <h2 className="text-white font-light text-[48px] leading-[60px] tracking-[-1.2px]">
            AI Platform
          </h2>
          <p className="text-white/80 font-normal text-[18px] leading-[28px]">
            Automate and simplify the authoring & mangement of CSV and CSA
          </p>
        </div>
      </aside>

      {/* Login card */}
      <main className="relative lg:absolute lg:left-[57.36%] lg:top-1/2 lg:-translate-y-1/2 flex min-h-screen lg:min-h-0 items-center justify-center p-4 lg:p-0 lg:w-[42.64%]">
        <div className="w-full max-w-[512px] bg-[hsl(var(--brand-card))] border border-[hsl(var(--brand-card-border)/0.4)] shadow-[0px_20px_40px_rgba(31,27,22,0.06)] rounded-xl px-6 sm:px-12 pt-12 sm:pt-[73px] pb-12 flex flex-col gap-10">
          <form className="flex flex-col gap-6 w-full" onSubmit={handleLogin}>
            {/* Error Message */}
            {error && (
              <div className="px-4 py-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Email */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="px-1 text-[12px] font-medium leading-[18px] tracking-[0.3px] capitalize text-[hsl(var(--brand-label))]"
              >
                Email Address *
              </label>
              <input
                id="email"
                type="text"
                placeholder="Enter email or username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-[55px] px-5 py-[18px] rounded-lg bg-[hsl(var(--brand-input))] text-[16px] leading-[19px] text-[hsl(var(--brand-text))] placeholder:text-[hsl(var(--brand-text))] outline-none focus:ring-2 focus:ring-[hsl(var(--brand-input-border))]"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-1">
                <label
                  htmlFor="password"
                  className="text-[12px] font-medium leading-[18px] tracking-[0.3px] capitalize text-[hsl(var(--brand-label))]"
                >
                  Password *
                </label>
                <a
                  href="#"
                  className="text-[12px] font-medium leading-[18px] tracking-[0.3px] text-[hsl(var(--brand-label))] hover:underline"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full h-[55px] px-5 py-[18px] pr-12 rounded-lg bg-[hsl(var(--brand-input))] text-[16px] leading-[19px] text-[hsl(var(--brand-text))] placeholder:text-[hsl(var(--brand-text))] outline-none focus:ring-2 focus:ring-[hsl(var(--brand-input-border))]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[hsl(var(--brand-text))]"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-3 px-1">
              <input
                id="remember"
                type="checkbox"
                className="w-5 h-5 rounded bg-[hsl(var(--brand-input))] border border-[hsl(var(--brand-input-border))] accent-[hsl(var(--brand-dark))]"
              />
              <label
                htmlFor="remember"
                className="text-[14px] leading-[20px] text-[hsl(var(--brand-label))]"
              >
                Keep me signed
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="h-[60px] w-full rounded-full bg-[hsl(var(--brand-dark))] text-[hsl(0_0%_97%)] text-[18px] font-semibold leading-[28px] shadow-[0px_10px_15px_-3px_rgba(127,86,21,0.2),0px_4px_6px_-4px_rgba(127,86,21,0.2)] hover:opacity-95 transition disabled:opacity-50"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative w-full h-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full h-px bg-[hsl(var(--brand-divider))]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[hsl(var(--brand-card))] px-4 text-[12px] text-[hsl(var(--brand-label))]">
                or
              </span>
            </div>
          </div>

          {/* Info box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-xs font-semibold text-blue-900 mb-2">Connected to Backend API:</p>
            <p className="text-xs text-blue-800">
              Login uses the real backend at <code className="font-mono bg-blue-100 px-1 rounded">localhost:8000</code>. 
              Use credentials from the database.
            </p>
          </div>

          <p className="text-center text-[14px] text-[hsl(var(--brand-label))]">
            Don't have an account?{" "}
            <Link to="/signup" className="font-semibold text-[hsl(var(--brand-dark))] hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Login;
