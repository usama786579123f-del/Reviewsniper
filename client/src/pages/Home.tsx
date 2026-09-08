/*
 * Crisis Command / Airy Precision: an asymmetric auth entrance with a calm
 * story panel, cobalt reticle identity, and explicit non-connected auth states.
 */
import { FormEvent, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  Target,
  UserRound,
} from "lucide-react";

const brandMark = "/manus-storage/reviewsniper-reticle_08e036e8.png";
const skyline = "/manus-storage/reviewsniper-skyline_ad533cd9.png";

const benefits = [
  { icon: Target, label: "Real-time crisis leads", detail: "Surface high-intent reputation signals." },
  { icon: ShieldCheck, label: "High-value niches", detail: "Focus your agency on the right markets." },
  { icon: Sparkles, label: "Actionable recovery plans", detail: "Turn review intelligence into next steps." },
];

function GoogleIcon() {
  return (
    <svg className="google-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M21.35 12.27c0-.73-.07-1.43-.21-2.1H12v3.98h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.27Z" />
      <path fill="#34A853" d="M12 21.5c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.74 9.74 0 0 0 12 21.5Z" />
      <path fill="#FBBC05" d="M6.54 13.58A5.86 5.86 0 0 1 6.23 12c0-.55.11-1.09.31-1.58V7.89H3.3A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.06 1.05 4.11l3.24-2.53Z" />
      <path fill="#EA4335" d="M12 6.39c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.83 3.47 14.63 2.5 12 2.5a9.74 9.74 0 0 0-8.7 5.39l3.24 2.53C7.31 8.11 9.46 6.39 12 6.39Z" />
    </svg>
  );
}

function BrandLockup({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand-lockup ${compact ? "brand-lockup--compact" : ""}`}>
      <img src={brandMark} alt="ReviewSniper reticle" className="brand-mark" />
      <div>
        <div className="brand-name">
          <span>Review</span><strong>Sniper</strong>
        </div>
        {!compact && <p className="brand-tagline">The Crisis-Lead Engine</p>}
      </div>
    </div>
  );
}

export default function AuthPage() {
  const [location, setLocation] = useLocation();
  const isSignup = location === "/signup";
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const copy = useMemo(() => {
    if (isSignup) {
      return {
        eyebrow: "Create your workspace",
        title: "Build your next\nsmart opportunity.",
        description: "Create a ReviewSniper workspace today. Connect your review source and bring live reputation signals into one focused command center.",
        formTitle: "Create account",
        formDescription: "Set up your ReviewSniper workspace",
        submit: "Create account",
        switchText: "Already have an account?",
        switchLabel: "Sign in",
        switchHref: "/login",
      };
    }
    return {
      eyebrow: "The signal is already there",
      title: "Find Bad Reviews.\nCreate Opportunities.",
      description: "Get real-time alerts for 1-star and 2-star reviews from high-value businesses. Help agencies protect their clients’ reputation.",
      formTitle: "Welcome back",
      formDescription: "Sign in to your ReviewSniper account",
      submit: "Login",
      switchText: "Don’t have an account?",
      switchLabel: "Create one",
      switchHref: "/signup",
    };
  }, [isSignup]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    toast.success("Demo session started", {
      description: "The dashboard opened locally. Connect your backend for real authentication.",
    });
    setLocation("/dashboard");
  }

  function showComingSoon(label: string) {
    toast.info(`${label} is not connected yet`, {
      description: "Connect the relevant backend or provider when you are ready.",
    });
  }

  return (
    <main className="auth-page">
      <section className="auth-story" style={{ backgroundImage: `url(${skyline})` }}>
        <div className="story-glow" />
        <div className="story-topline">
          <BrandLockup />
          <span className="secure-pill"><LockKeyhole size={13} /> Secure workspace</span>
        </div>

        <div className="story-copy">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{copy.title.split("\n").map((line, index) => <span key={line} className={index === 1 ? "accent-line" : ""}>{line}</span>)}</h1>
          <p className="story-description">{copy.description}</p>
          <div className="benefit-list">
            {benefits.map(({ icon: Icon, label, detail }) => (
              <div className="benefit-item" key={label}>
                <span className="benefit-icon"><Icon size={17} strokeWidth={1.8} /></span>
                <span><strong>{label}</strong><small>{detail}</small></span>
              </div>
            ))}
          </div>
        </div>

        <div className="story-footer">
          <span>© 2026 ReviewSniper. All rights reserved.</span>
          <span className="footer-links"><button onClick={() => showComingSoon("Privacy policy")}>Privacy</button><i /> <button onClick={() => showComingSoon("Terms")}>Terms</button></span>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-mobile-brand"><BrandLockup compact /></div>
        <div className="auth-card-wrap">
          <div className="auth-card">
            <div className="card-heading">
              <div className="card-icon"><Target size={19} /></div>
              <h2>{copy.formTitle}</h2>
              <p>{copy.formDescription}</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {isSignup && (
                <label className="field-label">
                  Full name
                  <span className="input-shell"><UserRound size={17} /><input name="name" type="text" placeholder="Your name" autoComplete="name" required /></span>
                </label>
              )}
              <label className="field-label">
                Email address
                <span className="input-shell"><Mail size={17} /><input name="email" type="email" placeholder="you@agency.com" autoComplete="email" required /></span>
              </label>
              <label className="field-label">
                Password
                <span className="input-shell"><LockKeyhole size={17} /><input name="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" autoComplete={isSignup ? "new-password" : "current-password"} minLength={6} required /><button type="button" className="icon-button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((current) => !current)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></span>
              </label>

              <div className="form-meta">
                {!isSignup ? <label className="check-label"><input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} /><span className="custom-check">{rememberMe && <Check size={12} />}</span> Remember me</label> : <span className="form-note">Use 6+ characters</span>}
                {!isSignup && <button type="button" className="text-action" onClick={() => showComingSoon("Password recovery")}>Forgot password?</button>}
              </div>

              <button type="submit" className="primary-button">{submitted ? "Ready to connect" : copy.submit}<ArrowRight size={17} /></button>
            </form>

            <div className="or-divider"><span>OR</span></div>
            <button type="button" className="google-button" onClick={() => showComingSoon("Google sign-in")}><GoogleIcon /> Continue with Google</button>
            <p className="switch-prompt">{copy.switchText} <Link href={copy.switchHref}>{copy.switchLabel}</Link></p>
          </div>
          <p className="auth-hint">Your data stays yours. Connect your own provider when you are ready.</p>
        </div>
      </section>
    </main>
  );
}
