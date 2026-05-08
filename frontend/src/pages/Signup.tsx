import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative min-h-screen w-full bg-[hsl(var(--background))] overflow-hidden">
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
            Engineering Innovation, Powering Progress
          </h2>
          <p className="text-white/80 font-normal text-[18px] leading-[28px]">
            Trusted partner for AI, data, and digital product solutions.
          </p>
        </div>
      </aside>

      <main className="relative lg:absolute lg:left-[57.36%] lg:top-1/2 lg:-translate-y-1/2 flex min-h-screen lg:min-h-0 items-center justify-center p-4 lg:p-0 lg:w-[42.64%]">
        <div className="w-full max-w-[512px] bg-[hsl(var(--brand-card))] border border-[hsl(var(--brand-card-border)/0.4)] shadow-[0px_20px_40px_rgba(31,27,22,0.06)] rounded-xl px-6 sm:px-12 pt-12 sm:pt-[73px] pb-12 flex flex-col gap-8">
          <form className="flex flex-col gap-6 w-full">
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="px-1 text-[12px] font-medium leading-[18px] tracking-[0.3px] capitalize text-[hsl(var(--brand-label))]">
                Full Name *
              </label>
              <input
                id="name"
                type="text"
                placeholder="Enter your full name"
                className="h-[55px] px-5 py-[18px] rounded-lg bg-[hsl(var(--brand-input))] text-[16px] leading-[19px] text-[hsl(var(--brand-text))] placeholder:text-[hsl(var(--brand-text))] outline-none focus:ring-2 focus:ring-[hsl(var(--brand-input-border))]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="px-1 text-[12px] font-medium leading-[18px] tracking-[0.3px] capitalize text-[hsl(var(--brand-label))]">
                Email Address *
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter email address"
                className="h-[55px] px-5 py-[18px] rounded-lg bg-[hsl(var(--brand-input))] text-[16px] leading-[19px] text-[hsl(var(--brand-text))] placeholder:text-[hsl(var(--brand-text))] outline-none focus:ring-2 focus:ring-[hsl(var(--brand-input-border))]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="px-1 text-[12px] font-medium leading-[18px] tracking-[0.3px] capitalize text-[hsl(var(--brand-label))]">
                Password *
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
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

            <div className="flex items-center gap-3 px-1">
              <input
                id="terms"
                type="checkbox"
                className="w-5 h-5 rounded bg-[hsl(var(--brand-input))] border border-[hsl(var(--brand-input-border))] accent-[hsl(var(--brand-dark))]"
              />
              <label htmlFor="terms" className="text-[14px] leading-[20px] text-[hsl(var(--brand-label))]">
                I agree to the Terms & Privacy
              </label>
            </div>

            <button
              type="submit"
              className="h-[60px] w-full rounded-full bg-[hsl(var(--brand-dark))] text-[hsl(0_0%_97%)] text-[18px] font-semibold leading-[28px] shadow-[0px_10px_15px_-3px_rgba(127,86,21,0.2),0px_4px_6px_-4px_rgba(127,86,21,0.2)] hover:opacity-95 transition"
            >
              Create Account
            </button>
          </form>

          <p className="text-center text-[14px] text-[hsl(var(--brand-label))]">
            Already have an account?{" "}
            <Link to="/" className="font-semibold text-[hsl(var(--brand-dark))] hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Signup;
