import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ArrowRight, Command } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const mainRef = useRef(null);
  const stepsRef = useRef([]);

  const handleCtaClick = () => {
    navigate(isAuthenticated ? "/dashboard" : "/auth");
  };

  useGSAP(() => {
    // 1. HERO REVEAL
    gsap.from(".hero-text", {
      y: 100,
      opacity: 0,
      duration: 1.2,
      stagger: 0.2,
      ease: "power4.out",
    });

    // 2. INFINITE MARQUEE
    gsap.to(".marquee-inner", {
      xPercent: -50,
      ease: "none",
      duration: 25,
      repeat: -1
    });

    // 3. IMAGE PARALLAX
    stepsRef.current.forEach((step) => {
      if (step) {
        const img = step.querySelector(".step-img");
        gsap.to(img, {
          scrollTrigger: {
            trigger: step,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
          y: -80,
          ease: "none",
        });
      }
    });

    // 4. FOOTER SCROLL TEXT
    gsap.from(".footer-bg-text", {
      scrollTrigger: {
        trigger: "footer",
        start: "top bottom",
        end: "bottom top",
        scrub: 2,
      },
      xPercent: -15,
    });
  }, { scope: mainRef });

  return (
    <div ref={mainRef} className="relative min-h-screen bg-[#080808] text-[#E5E5E5] selection:bg-yellow-400 selection:text-black overflow-x-hidden">
      
      {/* GLOBAL FRAME */}
      <div className="fixed inset-2 md:inset-4 border border-white/10 pointer-events-none z-[120]" />

      {/* NAVBAR */}
      <nav className="fixed top-2 md:top-4 left-2 md:left-4 right-2 md:right-4 z-[110] flex justify-between items-center px-4 md:px-10 py-4 md:py-6 border-b border-white/10 bg-[#080808]/90 backdrop-blur-xl">
        <div className="flex items-center gap-2 md:gap-3">
          <Command size={20} className="text-yellow-400" />
          <span className="font-anton text-xl md:text-3xl uppercase tracking-tighter text-white">MiniDrive</span>
        </div>
        
        <button 
          onClick={handleCtaClick} 
          className="relative px-4 md:px-8 py-2 overflow-hidden cursor-pointer group border border-white/20"
        >
          <span className="relative z-10 font-anton text-xs  md:text-sm tracking-widest group-hover:text-black transition-colors duration-500">
            {isAuthenticated ? "DASHBOARD" : "SIGN_UP"}
          </span>
          <div className="absolute inset-0 bg-yellow-400 translate-y-[101%] group-hover:translate-y-0 transition-transform duration-500 ease-in-out" />
        </button>
      </nav>

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex flex-col justify-center pt-20 px-4 md:px-10">
        <div className="w-full max-w-7xl mx-auto">
          <span className="hero-text text-yellow-400 font-mono text-[10px] tracking-[0.4em] uppercase mb-4 block">
            [ {isAuthenticated ? "ONLINE" : "READY"} ]
          </span>
 <h1 className="hero-text font-anton text-[16vw] md:text-[12vw] leading-[0.9] uppercase mb-6 md:mb-8 cursor-default">
  {/* The "Secure" Container with its own group hover */}
  <span className="relative inline-block overflow-hidden group/secure align-top">
    {/* Base Layer: Outlined (Transparent) */}
    <span 
      className="relative z-10 transition-colors duration-500 block"
      
    >
      Secure
    </span>
    
    {/* Fill Layer: Yellow text that rises up */}
    <span 
      className="absolute inset-0 z-20 text-yellow-400 translate-y-full group-hover/secure:translate-y-0 transition-transform duration-500 ease-out pointer-events-none"
      style={{ WebkitTextStroke: "3px white" }} // Keep stroke so it matches the base perfectly
    >
      Secure
    </span>
  </span>

  <br /> 

  {/* The Storage text remains outlined and unaffected */}
  <span className="text-transparent block" style={{ WebkitTextStroke: "3px white" }}>
    Storage
  </span>
</h1>
          <div className="hero-text w-full flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-10">
             <p className="max-w-md text-zinc-400 font-mono text-[10px] md:text-xs uppercase tracking-widest leading-loose">
               A simple way to keep your files safe. Your data is encrypted and saved across our private cloud network.
             </p>
             <button onClick={handleCtaClick} className="group flex flex-col items-start md:items-end">
                <div className="flex items-center gap-2 md:gap-4 text-yellow-400 group-hover:text-white transition-colors">
                  <span className="font-anton text-5xl  cursor-pointer md:text-8xl uppercase italic">
                    {isAuthenticated ? "OPEN" : "START"}
                  </span>
                  <ArrowRight size={40} className="md:w-[60px] md:h-[60px] -rotate-45 group-hover:rotate-0 transition-transform duration-500" />
                </div>
             </button>
          </div>
        </div>
      </section>

      {/* INFINITE MARQUEE */}
      <div className="py-4 md:py-8 border-y border-white/5 bg-white/[0.01] overflow-hidden whitespace-nowrap">
        <div className="marquee-inner flex gap-10">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center gap-6 md:gap-10">
              <span className="font-anton text-2xl md:text-4xl uppercase opacity-20">Safe.Fast.Private</span>
              <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-yellow-400 rounded-full" />
              <span className="font-anton text-2xl md:text-4xl uppercase opacity-20 italic text-transparent" style={{ WebkitTextStroke: "1px white" }}>Encrypted_Files</span>
              <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-yellow-400 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* THE 2 IMAGE SECTIONS */}
      <section className="px-2 md:px-4 py-10 md:py-20 space-y-4">
        {[
          { 
            title: "Private", 
            img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2000",
            tag: "SECURITY_LEVEL_1"
          },
          { 
            title: "Global", 
            img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2000",
            tag: "FAST_ACCESS"
          }
        ].map((item, i) => (
          <div key={i} ref={el => stepsRef.current[i] = el} className="group relative border border-white/10 overflow-hidden bg-zinc-900/20">
            <div className="grid md:grid-cols-2 items-center min-h-[400px] md:min-h-[700px]">
              <div className={`p-6 md:p-20 z-10 ${i % 2 !== 0 ? 'md:order-2' : ''}`}>
                <span className="text-yellow-400 font-mono text-[10px] tracking-[0.5em] mb-4 block underline underline-offset-8 uppercase">{item.tag}</span>
                <h4 className="font-anton text-[18vw] md:text-[9vw] uppercase leading-none mb-6 md:mb-10 text-white">{item.title}</h4>
                <p className="text-zinc-500 font-mono text-[10px] md:text-xs uppercase tracking-[0.2em] mb-8 md:mb-12 max-w-xs">Your files are split into small parts and locked with high-level encryption.</p>
                <button onClick={handleCtaClick} className="px-6 md:px-8 py-3 md:py-4 border border-white/20 rounded-none font-anton text-lg md:text-xl uppercase hover:bg-yellow-400 hover:text-black transition-all">Get Started</button>
              </div>
              <div className={`relative h-[300px] md:h-full overflow-hidden grayscale brightness-50 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-1000 ${i % 2 !== 0 ? 'md:order-1' : ''}`}>
                <img src={item.img} className="step-img w-full h-full object-cover scale-125 origin-center" alt={item.title} />
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* FOOTER CTA */}
      <footer className="relative border-t border-white/10 px-4 md:px-10 py-32 md:py-60 text-center bg-[#080808] overflow-hidden">
        
        {/* TEXT OVERLAY */}
        <h3 className="footer-bg-text absolute top-1/2 left-0 font-anton text-[25vw] leading-none uppercase text-white/[0.02] whitespace-nowrap pointer-events-none select-none">
          MINIDRIVE_SECURE_STORAGE
        </h3>

        <div className="relative z-10">
          <h3 className="font-anton text-[12vw] md:text-[10vw] leading-none uppercase mb-10 md:mb-16 italic text-white">
            {isAuthenticated ? "Dashboard" : "Join.Now"}
          </h3>
          <button onClick={handleCtaClick} className="px-10 md:px-16 py-5 md:py-8 bg-white text-black font-anton text-xl md:text-3xl uppercase hover:bg-yellow-400 transition-colors shadow-2xl">
            {isAuthenticated ? "Enter Drive" : "Create Account"}
          </button>
        </div>

        <div className="mt-20 md:mt-40 flex flex-col md:flex-row justify-between items-center opacity-30 font-mono text-[8px] md:text-[9px] uppercase tracking-[0.4em] gap-4 md:gap-6">
          <p>© 2026 MiniDrive.</p>
          <div className="flex gap-6 md:gap-10">
            <span>SECURE_CONNECTION</span>
            <span>ENCRYPTED_DATA</span>
          </div>
        </div>
      </footer>
    </div>
  );
}