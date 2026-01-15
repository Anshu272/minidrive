import { useState, useRef } from "react";
import gsap from "gsap";
import { Link, useNavigate } from "react-router-dom"; 
import { useGSAP } from "@gsap/react";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Command } from "lucide-react";

export default function Auth() {
  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const formRef = useRef(null);
  const contentRef = useRef(null);
  
  const navigate = useNavigate(); 
  const { login } = useAuth();

  const [mode, setMode] = useState("signup"); 
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(false); 

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(""); // RESTORED SUCCESS STATE

  useGSAP(() => {
    gsap.from(containerRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.8,
      ease: "power4.out",
    });
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(""); // Reset success on new attempt
    setIsLoading(true);

    try {
      const endpoint = mode === "signup"
          ? `${BASE_URL}/api/auth/signup`
          : `${BASE_URL}/api/auth/login`;

      const payload = mode === "signup"
          ? formData
          : { email: formData.email, password: formData.password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" ,
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Authentication failed");
        setIsLoading(false);
      } else {
        // SUCCESSFUL LOGIN/SIGNUP
        setSuccess(mode === "signup" ? "ACCOUNT_CREATED" : "ACCESS_GRANTED");
        login({
  user: data.user,
  token: data.token,
});

        // Delay navigation so the user sees the success state
        setTimeout(() => navigate("/dashboard"), 1200);
      }
    } catch (err) {
      setError("Server Error: Check Connection");
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    if (isAnimating) return;
    setIsAnimating(true);

    const tl = gsap.timeline({
      defaults: { ease: "expo.inOut" },
      onComplete: () => setIsAnimating(false),
    });

    const isDesktop = window.innerWidth >= 1024;

    if (isDesktop) {
      tl.to(imageRef.current, { width: "100%", duration: 0.8 });
      tl.add(() => {
        setMode((prev) => (prev === "signup" ? "login" : "signup"));
        setError("");
        setSuccess("");
      });
      tl.to(imageRef.current, { width: "45%", duration: 0.8 });
    } else {
      tl.to(contentRef.current, { opacity: 0, x: 10, duration: 0.3 });
      tl.add(() => {
        setMode((prev) => (prev === "signup" ? "login" : "signup"));
        setError("");
        setSuccess("");
      });
      tl.to(contentRef.current, { opacity: 1, x: 0, duration: 0.3 });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080808] px-4 py-12 selection:bg-yellow-400 selection:text-black">
      
      <div className="fixed inset-2 md:inset-4 border border-white/10 pointer-events-none z-[120]" />

      <button 
        onClick={() => navigate("/")}
        className="fixed top-8 left-8 md:top-12 md:left-12 z-[130] flex items-center gap-4 font-anton text-[10px] md:text-xs tracking-[0.3em] text-zinc-500 hover:text-yellow-400 transition-colors uppercase"
      >
        <ArrowLeft size={20} />
        Back
      </button>

      <div
        ref={containerRef}
        className="relative w-full shadow-yellow-400/10 shadow-2xl max-w-7xl h-[85vh] min-h-[700px] border border-white/10 bg-[#0a0a0a] overflow-hidden"
      >
        {/* IMAGE PANEL */}
        <div
          ref={imageRef}
          className={`absolute top-0 z-20 h-full w-[45%] hidden lg:block overflow-hidden border-white/10
            ${mode === "signup" ? "left-0 border-r" : "right-0 border-l"}`}
        >
          <img
            src="https://images5.alphacoders.com/136/thumb-1920-1367326.jpeg"
            alt="Visual"
            className="absolute inset-0 h-full w-full object-cover brightness-50"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative h-full flex flex-col justify-between p-16">
            <div className="flex items-center gap-3">
              <Command size={24} className="text-yellow-400" />
              <span className="font-anton text-2xl uppercase tracking-tighter text-white">MiniDrive</span>
            </div>
            <h1 className="text-7xl font-anton text-white leading-none uppercase italic">
              {mode === "signup" ? "The Future" : "Welcome"}<br />
              <span className="text-yellow-400">{mode === "signup" ? "Starts Here." : "Back."}</span>
            </h1>
          </div>
        </div>

        {/* FORM PANEL */}
        <div
          ref={formRef}
          className={`h-full w-full lg:w-[55%] flex items-start lg:items-center text-white
            ${mode === "signup" ? "lg:ml-auto" : "lg:mr-auto"}`}
        >  
          <div ref={contentRef} className="w-full px-8 py-20 pt-28 md:px-20 lg:px-16 xl:px-24">
            <header className="mb-12">
              <h2 className="text-5xl md:text-7xl font-anton uppercase mb-4 leading-none">
                {mode === "signup" ? "Sign Up" : "Login"}
              </h2>
              <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">
                {mode === "signup" ? "Already a member?" : "New here?"}
                <button
                  type="button"
                  onClick={switchMode}
                  disabled={isAnimating}
                  className="ml-4 text-white underline underline-offset-4 hover:text-yellow-400 disabled:opacity-50 transition-colors"
                >
                  {mode === "signup" ? "Log In" : "Sign Up"}
                </button>
              </p>
            </header>

            {/* STATUS MESSAGES */}
            {error && (
              <div className="mb-8 border border-red-500/50 bg-red-500/5 px-4 py-4 text-[10px] font-mono uppercase tracking-widest text-red-400">
                ERROR: {error}
              </div>
            )}
            {success && (
              <div className="mb-8 border border-emerald-500/50 bg-emerald-500/5 px-4 py-4 text-[10px] font-mono uppercase tracking-widest text-emerald-400">
                STATUS: {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
              {mode === "signup" && (
                <div className="group border-b border-white/10 focus-within:border-yellow-400 transition-colors">
                  <input
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Full Name"
                    required
                    className="w-full bg-transparent px-2 py-4 font-mono text-xs tracking-widest outline-none"
                  />
                </div>
              )}

              <div className="group border-b border-white/10 focus-within:border-yellow-400 transition-colors">
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  required
                  className="w-full bg-transparent px-2 py-4 font-mono text-xs tracking-widest outline-none"
                />
              </div>

              <div className="group border-b border-white/10 focus-within:border-yellow-400 transition-colors relative">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  required
                  className="w-full bg-transparent px-2 py-4 font-mono text-xs tracking-widest outline-none"
                />
                {mode === "login" && (
                  <div className="absolute right-2 bottom-4">
                    <Link to="/forgot-password" size="tiny" className="text-[10px] font-mono uppercase text-zinc-500 hover:text-yellow-400 transition-colors">
                      Forgot?
                    </Link>
                  </div>
                )}
              </div>

              {mode === "signup" && (
                <div className="group border-b border-white/10 focus-within:border-yellow-400 transition-colors">
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm Password"
                    required
                    className="w-full bg-transparent px-2 py-4 font-mono text-xs tracking-widest outline-none"
                  />
                </div>
              )}

              <div className="pt-8">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="relative cursor-pointer w-full border border-white/10 py-6 overflow-hidden group"
                >
                  <span className="relative cursor-pointer z-10 font-anton text-2xl uppercase tracking-widest group-hover:text-black transition-colors duration-500 text-white">
                    {isLoading ? "Verifying..." : mode === "signup" ? "Create Account" : "Login"}
                  </span>
                  <div className="absolute inset-0 bg-yellow-400 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}