"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Star, CheckCircle, Zap, Users, Shield, Heart,
  ChevronDown, Smartphone, Monitor, ArrowRight,
  Bell, Gift, BarChart3, Sparkles,
} from "lucide-react";
import { Capacitor } from "@capacitor/core";

function useScrolled(threshold = 20) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > threshold);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, [threshold]);
  return scrolled;
}

function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Navbar() {
  const scrolled = useScrolled();
  const [open, setOpen] = useState(false);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-100"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl kq-gradient-bg flex items-center justify-center shadow-md">
            <Star className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="font-heading font-bold text-xl" style={{ color: "#5B5FF8" }}>
            KiddoQiddo
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {["Özellikler", "Nasıl Çalışır", "SSS"].map((item) => (
            <a
              key={item}
              href={`#${item === "Özellikler" ? "features" : item === "Nasıl Çalışır" ? "how" : "faq"}`}
              className="text-sm font-medium text-slate-600 hover:text-[#5B5FF8] transition-colors"
            >
              {item}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-700 hover:text-[#5B5FF8] transition-colors px-4 py-2"
          >
            Giriş Yap
          </Link>
          <Link
            href="/register"
            className="px-5 py-2.5 text-sm font-semibold text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, #5B5FF8, #7C4DFF)" }}
          >
            Ücretsiz Başla
          </Link>
        </div>

        <button
          className="md:hidden p-2 rounded-lg text-slate-600"
          onClick={() => setOpen(!open)}
          aria-label="Menü"
        >
          <div className="w-5 space-y-1">
            <span className={`block h-0.5 bg-current transition-all ${open ? "rotate-45 translate-y-1.5" : ""}`} />
            <span className={`block h-0.5 bg-current transition-all ${open ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 bg-current transition-all ${open ? "-rotate-45 -translate-y-1.5" : ""}`} />
          </div>
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-slate-100 px-4 pb-4 space-y-3"
          >
            {["Özellikler", "Nasıl Çalışır", "SSS"].map((item) => (
              <a key={item} href={`#${item === "Özellikler" ? "features" : item === "Nasıl Çalışır" ? "how" : "faq"}`}
                onClick={() => setOpen(false)}
                className="block py-2 text-sm font-medium text-slate-700"
              >
                {item}
              </a>
            ))}
            <Link href="/login" onClick={() => setOpen(false)} className="block py-2 text-sm font-medium text-slate-700">Giriş Yap</Link>
            <Link
              href="/register"
              onClick={() => setOpen(false)}
              className="block text-center py-2.5 px-4 text-sm font-semibold text-white rounded-xl"
              style={{ background: "linear-gradient(135deg, #5B5FF8, #7C4DFF)" }}
            >
              Ücretsiz Başla
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function HeroMockup() {
  return (
    <div className="relative w-full max-w-sm mx-auto select-none">
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="bg-white rounded-3xl shadow-2xl p-5 border border-slate-100"
        style={{ boxShadow: "0 30px 80px rgba(91,95,248,0.2)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-slate-400 font-medium">Merhaba,</p>
            <p className="font-heading font-bold text-slate-800">Ayşe 👋</p>
          </div>
          <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-full">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="text-sm font-bold text-amber-600">240</span>
          </div>
        </div>

        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Bugünkü Görevler</p>
        <div className="space-y-2">
          {[
            { icon: "📖", title: "20 dk kitap oku", pts: 30, done: true },
            { icon: "🦷", title: "Dişlerini fırçala", pts: 15, done: true },
            { icon: "🎒", title: "Çantanı hazırla", pts: 20, done: false },
            { icon: "🧹", title: "Odanı topla", pts: 25, done: false },
          ].map((task) => (
            <div
              key={task.title}
              className={`flex items-center gap-3 p-2.5 rounded-xl ${
                task.done ? "bg-green-50" : "bg-slate-50"
              }`}
            >
              <span className="text-lg">{task.icon}</span>
              <span className={`flex-1 text-xs font-medium ${task.done ? "line-through text-slate-400" : "text-slate-700"}`}>
                {task.title}
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${task.done ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                +{task.pts}⭐
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Günlük ilerleme</span>
            <span>2/4</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "50%" }}
              transition={{ delay: 0.5, duration: 1.2, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #5B5FF8, #7C4DFF)" }}
            />
          </div>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        className="absolute -top-4 -right-4 kq-glass rounded-2xl p-3 shadow-xl border border-white/80 flex items-center gap-2"
        style={{ boxShadow: "0 10px 30px rgba(91,95,248,0.15)" }}
      >
        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm" style={{ background: "linear-gradient(135deg, #5ED6A7, #10b981)" }}>
          ✅
        </div>
        <div>
          <p className="text-xs font-bold text-slate-700">Görev Onaylandı!</p>
          <p className="text-xs text-slate-400">+30 puan kazandı</p>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        className="absolute -bottom-4 -left-4 kq-glass rounded-2xl p-3 shadow-xl border border-white/80"
        style={{ boxShadow: "0 10px 30px rgba(255,184,77,0.2)" }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">🎁</span>
          <div>
            <p className="text-xs font-bold text-slate-700">Sinema Bileti</p>
            <div className="flex items-center gap-1">
              <div className="h-1.5 w-12 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full w-4/5 rounded-full" style={{ background: "#FFB84D" }} />
              </div>
              <span className="text-xs text-slate-400">80%</span>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        animate={{ rotate: [-3, 3, -3], scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 -right-8 w-14 h-14 rounded-2xl kq-gradient-bg shadow-xl flex items-center justify-center text-2xl"
      >
        🐱
      </motion.div>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20" style={{ background: "#F7F8FC" }}>
      <div className="absolute top-20 -left-48 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #5B5FF8, transparent)" }} />
      <div className="absolute bottom-10 -right-48 w-96 h-96 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #FFB84D, transparent)" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #7C4DFF, transparent)" }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border"
            style={{ background: "rgba(91,95,248,0.08)", borderColor: "rgba(91,95,248,0.2)", color: "#5B5FF8" }}
          >
            <Sparkles className="w-4 h-4" />
            Sağlıklı alışkanlıklar birlikte inşa edilir
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-2"
          >
            <h1 className="font-heading font-extrabold leading-tight" style={{ fontSize: "clamp(2.4rem, 5vw, 3.6rem)", color: "#101828" }}>
              Günlük Görevleri
            </h1>
            <h1 className="font-heading font-extrabold leading-tight kq-gradient-text" style={{ fontSize: "clamp(2.4rem, 5vw, 3.6rem)" }}>
              Aile Zaferlerine
            </h1>
            <h1 className="font-heading font-extrabold leading-tight" style={{ fontSize: "clamp(2.4rem, 5vw, 3.6rem)", color: "#101828" }}>
              Dönüştürün ✨
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg leading-relaxed max-w-lg"
            style={{ color: "#475467" }}
          >
            KiddoQiddo, ebeveynlerin sağlıklı rutinler oluşturmasına, ilerlemeyi ödüllendirmesine ve çocukları eğlenceli günlük görevlerle motive etmesine yardımcı olur.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-4"
          >
            <Link
              href="/register"
              className="group flex items-center gap-2 px-7 py-3.5 text-base font-semibold text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, #5B5FF8, #7C4DFF)" }}
            >
              Ücretsiz Başla
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#how"
              className="flex items-center gap-2 px-7 py-3.5 text-base font-semibold rounded-xl border-2 transition-all duration-200 hover:-translate-y-0.5"
              style={{ borderColor: "#5B5FF8", color: "#5B5FF8", background: "white" }}
            >
              Nasıl Çalışır?
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <p className="text-sm font-semibold mb-3" style={{ color: "#475467" }}>
              Şunlardan hangisisiniz?
            </p>
            <div className="grid grid-cols-2 gap-3 max-w-md">
              {[
                { emoji: "👨‍👩‍👧", label: "Ebeveyn", sub: "Görev oluştur, takip et", href: "/register?role=parent", accent: "#5B5FF8", border: "rgba(91,95,248,0.35)" },
                { emoji: "🧒", label: "Çocuk", sub: "Görev tamamla, ödül kazan", href: "/child-login", accent: "#FFB84D", border: "rgba(255,184,77,0.45)" },
              ].map((r) => (
                <Link
                  key={r.label}
                  href={r.href}
                  className="group flex flex-col gap-2 px-4 py-4 bg-white rounded-2xl border-2 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1"
                  style={{ borderColor: "rgba(0,0,0,0.08)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = r.border)}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(0,0,0,0.08)")}
                >
                  <span className="text-3xl">{r.emoji}</span>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "#101828" }}>{r.label}</p>
                    <p className="text-xs leading-snug" style={{ color: "#475467" }}>{r.sub}</p>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="flex items-center gap-6"
          >
            <div className="flex -space-x-2">
              {["🧑", "👩", "👨", "👩‍🦱"].map((emoji, i) => (
                <div key={i} className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-base bg-gradient-to-br from-indigo-100 to-purple-100 shadow-sm">
                  {emoji}
                </div>
              ))}
            </div>
            <div>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">500+ aile kullanıyor</p>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="flex justify-center lg:justify-end pr-12"
        >
          <HeroMockup />
        </motion.div>
      </div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-slate-400"
      >
        <span className="text-xs font-medium">Keşfet</span>
        <ChevronDown className="w-4 h-4" />
      </motion.div>
    </section>
  );
}

function Trust() {
  const pillars = [
    { icon: Shield, title: "Güvenli & Özel", desc: "Konum takibi yok. İstilacı izleme yok. Sadece pozitif alışkanlıklar.", color: "#5B5FF8", bg: "rgba(91,95,248,0.08)" },
    { icon: Heart, title: "Pozitif Ebeveynlik", desc: "Teşvik ve ödüller üzerine kurulu; ceza değil motivasyon.", color: "#5ED6A7", bg: "rgba(94,214,167,0.1)" },
    { icon: Zap, title: "Sağlıklı Alışkanlıklar", desc: "Kalıcı rutinler oluşturmak için tasarlandı.", color: "#FFB84D", bg: "rgba(255,184,77,0.1)" },
    { icon: Users, title: "Aile Odaklı", desc: "Ebeveynler ve çocuklar birlikte, her zaman güvenli.", color: "#7C4DFF", bg: "rgba(124,77,255,0.08)" },
  ];

  return (
    <section id="features" style={{ background: "white" }} className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeUp className="text-center mb-14">
          <h2 className="font-heading font-bold text-3xl sm:text-4xl" style={{ color: "#101828" }}>
            Modern Aileler İçin Tasarlandı
          </h2>
          <p className="mt-3 text-lg max-w-xl mx-auto" style={{ color: "#475467" }}>
            Teknoloji ve ebeveynliği doğru şekilde bir araya getiriyoruz.
          </p>
        </FadeUp>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((p, i) => (
            <FadeUp key={p.title} delay={i * 0.1}>
              <div className="kq-card-hover rounded-2xl p-6 border border-slate-100 h-full" style={{ background: "#F7F8FC" }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: p.bg }}>
                  <p.icon className="w-6 h-6" style={{ color: p.color }} />
                </div>
                <h3 className="font-heading font-bold text-lg mb-2" style={{ color: "#101828" }}>{p.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#475467" }}>{p.desc}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      no: "01",
      icon: "✏️",
      title: "Görevler Oluşturun",
      desc: "Ebeveynler çocukların yapmasını istedikleri basit günlük alışkanlıklar ve rutinler oluşturur.",
      examples: ["Kitap oku (20 dk)", "Dişleri fırçala", "Ödevini yap", "Odayı topla"],
      color: "#5B5FF8",
      bg: "rgba(91,95,248,0.08)",
    },
    {
      no: "02",
      icon: "⭐",
      title: "Çocuklar Tamamlar",
      desc: "Çocuklar görevleri tamamlar, seri oluşturur ve puan kazanır. Her başarı kutlanır!",
      examples: ["Günlük seriler", "Puan kazanma", "Ebeveyn onayı", "Seviye atlama"],
      color: "#FFB84D",
      bg: "rgba(255,184,77,0.1)",
    },
    {
      no: "03",
      icon: "🎁",
      title: "Ödülleri Kazanın",
      desc: "Puanlar ödüllerin, başarıların ve aile hedeflerinin kilidini açar. Herkes kazanır!",
      examples: ["Sinema gecesi", "Ekstra oyun süresi", "Dondurma ödülü", "Park gezisi"],
      color: "#5ED6A7",
      bg: "rgba(94,214,167,0.1)",
    },
  ];

  return (
    <section id="how" style={{ background: "#F7F8FC" }} className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeUp className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-4"
            style={{ background: "rgba(91,95,248,0.1)", color: "#5B5FF8" }}>
            Nasıl Çalışır?
          </span>
          <h2 className="font-heading font-bold text-3xl sm:text-4xl" style={{ color: "#101828" }}>
            3 Adımda Başlayın
          </h2>
          <p className="mt-3 text-lg max-w-xl mx-auto" style={{ color: "#475467" }}>
            Kurulum 5 dakika, faydası bir ömür boyu.
          </p>
        </FadeUp>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
          <div className="hidden lg:block absolute top-16 left-1/3 right-1/3 h-0.5 z-0"
            style={{ background: "linear-gradient(90deg, #5B5FF8, #FFB84D, #5ED6A7)" }} />

          {steps.map((step, i) => (
            <FadeUp key={step.no} delay={i * 0.15}>
              <div className="relative kq-card-hover bg-white rounded-3xl p-8 border border-slate-100 shadow-sm h-full">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm" style={{ background: step.bg }}>
                    {step.icon}
                  </div>
                  <span className="font-heading font-black text-4xl" style={{ color: "rgba(91,95,248,0.08)" }}>
                    {step.no}
                  </span>
                </div>

                <h3 className="font-heading font-bold text-xl mb-3" style={{ color: "#101828" }}>{step.title}</h3>
                <p className="text-sm leading-relaxed mb-5" style={{ color: "#475467" }}>{step.desc}</p>

                <div className="space-y-2">
                  {step.examples.map((ex) => (
                    <div key={ex} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: step.color }} />
                      <span className="text-sm font-medium" style={{ color: "#475467" }}>{ex}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

function ChildSection() {
  const features = [
    { icon: "🔥", label: "Günlük Seriler", desc: "Alışkanlıkları pekiştirir" },
    { icon: "🏆", label: "Ödül Mağazası", desc: "Gerçek ödüllerin kilidi açılır" },
    { icon: "⭐", label: "Puan Sistemi", desc: "Her görev puan kazandırır" },
    { icon: "📈", label: "Seviye Atlama", desc: "Büyüme görünür hale gelir" },
    { icon: "🐱", label: "Sevimli Evcil Hayvan", desc: "Dijital arkadaş motive eder" },
    { icon: "🏅", label: "Başarı Rozetleri", desc: "Milestonelar kutlanır" },
  ];

  const rewards = [
    { emoji: "🎬", label: "Film Gecesi" },
    { emoji: "🎮", label: "Ekstra Oyun Süresi" },
    { emoji: "🍦", label: "Dondurma" },
    { emoji: "🌳", label: "Park Gezisi" },
    { emoji: "🎨", label: "Sanat Zamanı" },
    { emoji: "📚", label: "Kitap Seçimi" },
  ];

  return (
    <section style={{ background: "white" }} className="py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <FadeUp>
            <span className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-4"
              style={{ background: "rgba(255,184,77,0.12)", color: "#d97706" }}>
              Çocuk Deneyimi
            </span>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl mb-4" style={{ color: "#101828" }}>
              Çocuklar Eğlenceli Ödüllerle<br />
              <span className="kq-gradient-text">Motive Kalır</span>
            </h2>
            <p className="text-lg mb-8 leading-relaxed" style={{ color: "#475467" }}>
              Gamification ile görevler bir yük değil, heyecan verici bir maceraya dönüşür.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {features.map((f) => (
                <div key={f.label} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: "#F7F8FC" }}>
                  <span className="text-2xl">{f.icon}</span>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "#101828" }}>{f.label}</p>
                    <p className="text-xs" style={{ color: "#475467" }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </FadeUp>

          <FadeUp delay={0.15}>
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-8">
              <p className="font-heading font-bold text-center mb-6" style={{ color: "#101828" }}>
                🎁 Ödül Örnekleri
              </p>
              <div className="grid grid-cols-3 gap-4">
                {rewards.map((r, i) => (
                  <motion.div
                    key={r.label}
                    whileHover={{ scale: 1.08, rotate: [-2, 2][i % 2] }}
                    className="flex flex-col items-center gap-2 bg-white rounded-2xl p-4 shadow-sm cursor-default"
                  >
                    <span className="text-3xl">{r.emoji}</span>
                    <span className="text-xs font-semibold text-center" style={{ color: "#475467" }}>{r.label}</span>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold" style={{ color: "#101828" }}>Sinema Bileti</span>
                  <span className="text-sm font-bold" style={{ color: "#5B5FF8" }}>180/200 ⭐</span>
                </div>
                <div className="h-3 rounded-full overflow-hidden" style={{ background: "#F7F8FC" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "90%" }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 1.5, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ background: "linear-gradient(90deg, #5B5FF8, #FFB84D)" }}
                  />
                </div>
                <p className="text-xs mt-2 text-center" style={{ color: "#475467" }}>Neredeyse orada! 🎉</p>
              </div>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

function ParentSection() {
  const features = [
    { icon: BarChart3, title: "Günlük İlerleme Takibi", desc: "Tüm çocukların durumunu tek bakışta görün" },
    { icon: CheckCircle, title: "Görev Onaylama", desc: "Tamamlanan görevleri tek tıkla onaylayın veya reddedin" },
    { icon: Gift, title: "Özel Ödüller", desc: "Ailenize özel kişiselleştirilmiş ödüller oluşturun" },
    { icon: BarChart3, title: "Haftalık Raporlar", desc: "İlerleme grafikleri ve başarı özetleri" },
    { icon: Users, title: "Çoklu Çocuk Desteği", desc: "Birden fazla çocuğu aynı panelden yönetin" },
    { icon: Bell, title: "Anlık Bildirimler", desc: "Görev tamamlandığında anında haberdar olun" },
  ];

  return (
    <section style={{ background: "#F7F8FC" }} className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <FadeUp className="order-2 lg:order-1">
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-slate-100"
              style={{ boxShadow: "0 20px 60px rgba(91,95,248,0.12)" }}>
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg kq-gradient-bg flex items-center justify-center">
                  <Star className="w-4 h-4 text-white fill-white" />
                </div>
                <div>
                  <p className="font-heading font-bold text-sm" style={{ color: "#101828" }}>Ebeveyn Paneli</p>
                  <p className="text-xs" style={{ color: "#475467" }}>Bugün, 14 Mayıs</p>
                </div>
                <div className="ml-auto flex items-center gap-1 text-xs px-2 py-1 rounded-full" style={{ background: "rgba(94,214,167,0.12)", color: "#059669" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                  Canlı
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { label: "Tamamlandı", val: "6", icon: "✅", color: "#5ED6A7" },
                  { label: "Bekleyen", val: "3", icon: "⏳", color: "#FFB84D" },
                  { label: "Toplam Puan", val: "420", icon: "⭐", color: "#5B5FF8" },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: "#F7F8FC" }}>
                    <p className="text-xl mb-1">{s.icon}</p>
                    <p className="font-bold text-lg" style={{ color: s.color }}>{s.val}</p>
                    <p className="text-xs" style={{ color: "#475467" }}>{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                {[
                  { name: "Ayşe", tasks: "4/4", pts: 120, pct: 100, avatar: "👧" },
                  { name: "Mehmet", tasks: "2/4", pts: 60, pct: 50, avatar: "👦" },
                  { name: "Zeynep", tasks: "3/5", pts: 90, pct: 60, avatar: "👧🏽" },
                ].map((child) => (
                  <div key={child.name} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "#F7F8FC" }}>
                    <span className="text-2xl">{child.avatar}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-semibold" style={{ color: "#101828" }}>{child.name}</span>
                        <span className="text-xs font-bold" style={{ color: "#5B5FF8" }}>⭐ {child.pts}</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "white" }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${child.pct}%`, background: child.pct === 100 ? "#5ED6A7" : "linear-gradient(90deg, #5B5FF8, #7C4DFF)" }} />
                      </div>
                    </div>
                    <span className="text-xs font-medium shrink-0" style={{ color: "#475467" }}>{child.tasks}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>

          <FadeUp delay={0.1} className="order-1 lg:order-2">
            <span className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-4"
              style={{ background: "rgba(91,95,248,0.08)", color: "#5B5FF8" }}>
              Ebeveyn Paneli
            </span>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl mb-4" style={{ color: "#101828" }}>
              Sakin ve Basit<br />
              <span className="kq-gradient-text">Bir Ebeveyn Paneli</span>
            </h2>
            <p className="text-lg mb-8 leading-relaxed" style={{ color: "#475467" }}>
              Her şeyi tek bir yerden yönetin. Karmaşık değil, sadece ihtiyacınız olanlar.
            </p>

            <div className="space-y-4">
              {features.map((f, i) => (
                <FadeUp key={f.title} delay={i * 0.05}>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: "rgba(91,95,248,0.08)" }}>
                      <f.icon className="w-5 h-5" style={{ color: "#5B5FF8" }} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: "#101828" }}>{f.title}</p>
                      <p className="text-sm" style={{ color: "#475467" }}>{f.desc}</p>
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

function Gamification() {
  const elements = [
    { emoji: "⭐", label: "XP Puanları", desc: "Her görev puan kazandırır" },
    { emoji: "🔥", label: "Seriler", desc: "Günlük alışkanlık zincirleri" },
    { emoji: "📈", label: "Seviye Atlama", desc: "Büyüme görünür hale gelir" },
    { emoji: "🪙", label: "Coin Sistemi", desc: "Ödül mağazasında harcanır" },
    { emoji: "🎁", label: "Ödül Mağazası", desc: "Aile ödülleri burada" },
    { emoji: "🐱", label: "Dijital Evcil", desc: "Motivasyonu destekler" },
    { emoji: "🏅", label: "Rozetler", desc: "Başarılar kutlanır" },
    { emoji: "📊", label: "İstatistikler", desc: "İlerleme görünür" },
  ];

  return (
    <section style={{ background: "white" }} className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeUp className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-4"
            style={{ background: "rgba(255,184,77,0.12)", color: "#d97706" }}>
            Gamification
          </span>
          <h2 className="font-heading font-bold text-3xl sm:text-4xl" style={{ color: "#101828" }}>
            Oyun Gibi Hissettiren<br />
            <span className="kq-gradient-text">Bir Motivasyon Sistemi</span>
          </h2>
          <p className="mt-3 text-lg max-w-xl mx-auto" style={{ color: "#475467" }}>
            Çocuklar rutin görevlere dönüşen egzersizleri oyun zanneder. Bu bizim sırrımız.
          </p>
        </FadeUp>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {elements.map((el, i) => (
            <FadeUp key={el.label} delay={i * 0.07}>
              <motion.div
                whileHover={{ scale: 1.05, y: -4 }}
                className="kq-card-hover bg-white border border-slate-100 rounded-2xl p-5 text-center cursor-default shadow-sm"
              >
                <div className="text-4xl mb-3">{el.emoji}</div>
                <p className="font-semibold text-sm mb-1" style={{ color: "#101828" }}>{el.label}</p>
                <p className="text-xs" style={{ color: "#475467" }}>{el.desc}</p>
              </motion.div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

function CrossPlatform() {
  return (
    <section style={{ background: "#F7F8FC" }} className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-10 sm:p-14 border border-slate-100 shadow-sm text-center"
          style={{ boxShadow: "0 20px 60px rgba(91,95,248,0.08)" }}>
          <FadeUp>
            <div className="flex justify-center gap-6 mb-8">
              <motion.div
                whileHover={{ scale: 1.1, rotate: -5 }}
                className="w-16 h-16 rounded-2xl kq-gradient-bg flex items-center justify-center shadow-lg"
              >
                <Monitor className="w-8 h-8 text-white" />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: "linear-gradient(135deg, #FFB84D, #f59e0b)" }}
              >
                <Smartphone className="w-8 h-8 text-white" />
              </motion.div>
            </div>

            <h2 className="font-heading font-bold text-3xl sm:text-4xl mb-4" style={{ color: "#101828" }}>
              Her Cihazda Çalışır
            </h2>
            <p className="text-lg max-w-2xl mx-auto leading-relaxed mb-8" style={{ color: "#475467" }}>
              KiddoQiddo web öncelikli ve mobil uyumlu olarak başlar. Telefonlarda, tabletlerde ve masaüstünde kusursuz çalışır.
              İleride aynı deneyimle mobil uygulama olarak kurulabilir.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              {[
                { icon: "🌐", label: "Web Tarayıcısı" },
                { icon: "📱", label: "Mobil Uyumlu" },
                { icon: "💻", label: "Masaüstü" },
                { icon: "📲", label: "Native App (Yakında)" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-white text-sm font-medium" style={{ color: "#475467" }}>
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const items = [
    {
      quote: "Ödev vakti çok daha kolay hale geldi. Artık ben hatırlatmıyorum, o hatırlatıyor!",
      name: "Aylin K.",
      role: "3 çocuk annesi",
      avatar: "👩",
      stars: 5,
    },
    {
      quote: "Kızımız şimdi BİZİ hatırlatıyor. Ödül sistemi şaşırtıcı şekilde işe yarıyor.",
      name: "Serkan & Elif T.",
      role: "İki çocuk ebeveyni",
      avatar: "👨‍👩‍👧",
      stars: 5,
    },
    {
      quote: "İlk hafta şüpheciyidim. İkinci haftada çocuklarım uyku öncesi görevlerini kontrol ediyor.",
      name: "Meral Y.",
      role: "Çalışan anne",
      avatar: "👩‍💼",
      stars: 5,
    },
  ];

  return (
    <section style={{ background: "white" }} className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeUp className="text-center mb-14">
          <h2 className="font-heading font-bold text-3xl sm:text-4xl" style={{ color: "#101828" }}>
            Aileler Ne Diyor?
          </h2>
          <p className="mt-3 text-lg" style={{ color: "#475467" }}>
            Gerçek ebeveynlerden gerçek deneyimler.
          </p>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <FadeUp key={item.name} delay={i * 0.1}>
              <div className="kq-card-hover rounded-2xl p-7 border border-slate-100 h-full" style={{ background: "#F7F8FC" }}>
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: item.stars }).map((_, si) => (
                    <Star key={si} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <blockquote className="text-base leading-relaxed mb-6 italic" style={{ color: "#101828" }}>
                  &ldquo;{item.quote}&rdquo;
                </blockquote>

                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-2xl"
                    style={{ background: "linear-gradient(135deg, rgba(91,95,248,0.1), rgba(124,77,255,0.1))" }}>
                    {item.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "#101828" }}>{item.name}</p>
                    <p className="text-xs" style={{ color: "#475467" }}>{item.role}</p>
                  </div>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  const items = [
    {
      q: "Bu bir gözetleme uygulaması mı?",
      a: "Kesinlikle hayır. KiddoQiddo konum takibi, ekran süresi izleme veya sosyal takip içermez. Tamamen olumlu alışkanlıklar ve motivasyon odaklıdır.",
    },
    {
      q: "Birden fazla çocukla kullanılabilir mi?",
      a: "Evet! Tek bir ebeveyn hesabından birden fazla çocuğu ayrı ayrı yönetebilirsiniz. Her çocuğun kendi profili, görevleri ve puanları vardır.",
    },
    {
      q: "Çocukların e-posta hesabına ihtiyacı var mı?",
      a: "Hayır. Çocuklar PIN tabanlı giriş sistemiyle kolayca erişir. Ebeveyn hesabı oluşturduktan sonra çocuklara özel PIN atarsınız.",
    },
    {
      q: "Mobil uygulama var mı?",
      a: "Platform web öncelikli ve mobil uyumludur. Tüm cihazlarda tarayıcıdan kullanabilirsiniz. Native mobil uygulama yakında geliyor.",
    },
    {
      q: "Ücretsiz mi?",
      a: "Başlangıç planı ücretsizdir. Temel özelliklerle hemen başlayabilirsiniz. İleri özellikler için premium plan yakında duyurulacak.",
    },
    {
      q: "Verilerimiz güvende mi?",
      a: "Evet. Tüm veriler şifreli olarak saklanır. Çocuk PIN'leri bcrypt ile hashlenir, hiçbir hassas veri açık metin olarak tutulmaz.",
    },
  ];

  return (
    <section id="faq" style={{ background: "#F7F8FC" }} className="py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <FadeUp className="text-center mb-14">
          <h2 className="font-heading font-bold text-3xl sm:text-4xl" style={{ color: "#101828" }}>
            Sık Sorulan Sorular
          </h2>
          <p className="mt-3 text-lg" style={{ color: "#475467" }}>
            Aklınızdaki soruların cevapları burada.
          </p>
        </FadeUp>

        <div className="space-y-3">
          {items.map((item, i) => (
            <FadeUp key={i} delay={i * 0.05}>
              <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="font-semibold text-sm sm:text-base" style={{ color: "#101828" }}>{item.q}</span>
                  <motion.div animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-5 h-5 shrink-0" style={{ color: "#5B5FF8" }} />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {open === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-5 text-sm leading-relaxed border-t border-slate-100 pt-4" style={{ color: "#475467" }}>
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

function PhotoCollage() {
  const tiles = [
    { emoji: "👨‍👩‍👧", label: "Aile Zamanı", bg: "from-indigo-100 to-purple-100", size: "row-span-2" },
    { emoji: "✅", label: "Görev Tamamla", bg: "from-green-100 to-emerald-100", size: "" },
    { emoji: "🏆", label: "Ödül Anı", bg: "from-amber-100 to-yellow-100", size: "" },
    { emoji: "🎉", label: "Kutlama", bg: "from-pink-100 to-rose-100", size: "row-span-2" },
    { emoji: "📚", label: "Kitap Zamanı", bg: "from-blue-100 to-sky-100", size: "" },
    { emoji: "🐱", label: "Dostum", bg: "from-purple-100 to-violet-100", size: "" },
    { emoji: "🎨", label: "Sanat", bg: "from-orange-100 to-amber-100", size: "" },
    { emoji: "🌟", label: "Başarı", bg: "from-yellow-100 to-lime-100", size: "" },
    { emoji: "🧩", label: "Oyun Vakti", bg: "from-teal-100 to-cyan-100", size: "" },
    { emoji: "🏅", label: "Rozet Kazandı", bg: "from-red-100 to-pink-100", size: "row-span-2" },
    { emoji: "🌈", label: "Mutluluk", bg: "from-sky-100 to-indigo-100", size: "" },
    { emoji: "💪", label: "Başardım!", bg: "from-lime-100 to-green-100", size: "" },
  ];

  return (
    <section className="py-20" style={{ background: "#F7F8FC" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeUp className="text-center mb-12">
          <h2 className="font-heading font-bold text-3xl sm:text-4xl" style={{ color: "#101828" }}>
            Ebeveynleri ve çocukları<br />
            <span className="kq-gradient-text">birbirine bağlayan platform</span>
          </h2>
        </FadeUp>

        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 auto-rows-[100px] gap-3">
          {tiles.map((tile, i) => (
            <motion.div
              key={tile.label}
              className={`bg-gradient-to-br ${tile.bg} rounded-2xl flex flex-col items-center justify-center gap-1 cursor-default select-none overflow-hidden ${tile.size}`}
              whileHover={{ scale: 1.04 }}
              transition={{ type: "spring", stiffness: 300 }}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              style={{ transitionDelay: `${i * 40}ms` }}
            >
              <span className="text-3xl sm:text-4xl">{tile.emoji}</span>
              <span className="text-xs font-semibold text-slate-600 text-center px-1">{tile.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const TWEETS = [
  { handle: "@ayse_anne", name: "Ayşe K.", emoji: "👩", text: "Artık çocuğum dişlerini fırçalamayı BİZE hatırlatıyor! @LittleSteps mucizesi 😂" },
  { handle: "@serkan_baba", name: "Serkan T.", emoji: "👨", text: "İlk hafta şüpheciyidim, ikinci haftada çocuklarım uyku öncesi görevlerini kontrol ediyor 🙌" },
  { handle: "@meral_hanım", name: "Meral Y.", emoji: "👩‍💼", text: "Ödev vakti çok daha kolay hale geldi. Artık ben hatırlatmıyorum, o hatırlatıyor!" },
  { handle: "@elif_anne", name: "Elif Ş.", emoji: "👩‍🦱", text: "Kızım 3 haftadır serisi var ve bozulmasın diye çok çalışıyor. Ödül sistemi gerçekten işe yarıyor 🔥" },
  { handle: "@mehmet_bey", name: "Mehmet A.", emoji: "👨‍💼", text: "2 çocuk için ayrı profil, tek panelden yönetim. Tam ihtiyacım olan şeydi 💯" },
  { handle: "@zeynep_anne", name: "Zeynep K.", emoji: "👩‍🦰", text: "Sinema bileti ödülü için haftalarca görevlerini eksiksiz yaptı. Ben de sözümü tutmak zorunda kaldım 😄" },
  { handle: "@hasan_bey", name: "Hasan Ö.", emoji: "👴", text: "Torunum görevlerini tamamlayınca puan kazanıyor, ben de küçük ödüller veriyorum. Harika bir sistem!" },
  { handle: "@fatma_anne", name: "Fatma D.", emoji: "👩‍🍳", text: "Sabah rutinimiz artık tartışmasız. Herkes görevini biliyor, sistem otomatik çalışıyor 🌅" },
  { handle: "@can_baba", name: "Can M.", emoji: "👨‍💻", text: "Çocuğum görevlerini tamamladıkça ebeveyn onayı beklediğini söylüyor. O anlar paha biçilemez ❤️" },
  { handle: "@selin_anne", name: "Selin B.", emoji: "🧑‍🦱", text: "Odanı topla görevi üç haftadır eksiksiz. Bir mucize bu ya 😭🎉" },
  { handle: "@ali_baba", name: "Ali R.", emoji: "🧔", text: "Kitap okuma alışkanlığı kazandırmak için inanılmaz bir araç. Tavsiye ediyorum!" },
  { handle: "@nalan_hanım", name: "Nalan C.", emoji: "👱‍♀️", text: "Çoklu çocuk desteği süper. Büyük kız ile küçük oğlan için farklı görevler, tek panelden 👌" },
];

function TweetCard({ tweet }: { tweet: typeof TWEETS[0] }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm w-72 shrink-0">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-xl bg-gradient-to-br from-indigo-100 to-purple-100">
          {tweet.emoji}
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: "#101828" }}>{tweet.name}</p>
          <p className="text-xs" style={{ color: "#475467" }}>{tweet.handle}</p>
        </div>
        <div className="ml-auto text-slate-300">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        </div>
      </div>
      <p className="text-sm leading-relaxed" style={{ color: "#101828" }}>{tweet.text}</p>
    </div>
  );
}

const TWEET_CARDS = TWEETS;
const COL_A = [...TWEET_CARDS.slice(0, 6), ...TWEET_CARDS.slice(0, 6)];
const COL_B = [...TWEET_CARDS.slice(6), ...TWEET_CARDS.slice(6)];

function SocialProof() {
  return (
    <section style={{ background: "#F7F8FC" }} className="py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeUp className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h2 className="font-heading font-bold text-3xl sm:text-4xl" style={{ color: "#101828" }}>
                Topluluğumuz süper<br />
                <span className="kq-gradient-text">gücümüzdür</span>
              </h2>
            </div>
            <Link
              href="#"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all hover:-translate-y-0.5"
              style={{ borderColor: "#5B5FF8", color: "#5B5FF8", background: "white" }}
            >
              Daha fazla mutlu aile gör
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </FadeUp>

        <div className="flex gap-4 mt-10 h-[520px] overflow-hidden relative">
          <div className="absolute inset-x-0 top-0 h-20 z-10 pointer-events-none" style={{ background: "linear-gradient(to bottom, #F7F8FC, transparent)" }} />
          <div className="absolute inset-x-0 bottom-0 h-20 z-10 pointer-events-none" style={{ background: "linear-gradient(to top, #F7F8FC, transparent)" }} />

          <div className="flex-1 overflow-hidden">
            <div className="animate-scroll-up flex flex-col gap-4">
              {COL_A.map((tweet, i) => (
                <TweetCard key={i} tweet={tweet} />
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-hidden hidden sm:block">
            <div className="animate-scroll-down flex flex-col gap-4">
              {COL_B.map((tweet, i) => (
                <TweetCard key={i} tweet={tweet} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Privacy() {
  const badges = [
    { icon: "🔒", title: "KVKK Uyumlu", desc: "Türk veri koruma mevzuatına tam uyum" },
    { icon: "🛡️", title: "SSL Şifreli", desc: "Tüm veriler şifreli iletilir ve saklanır" },
    { icon: "👶", title: "Çocuk Güvenli", desc: "PIN girişi, konum takibi yok, reklam yok" },
    { icon: "🚫", title: "İzleme Yok", desc: "Ekran süresi veya sosyal medya takibi yok" },
  ];

  return (
    <section className="py-24" style={{ background: "white" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-10 sm:p-14 border border-indigo-100"
          style={{ background: "linear-gradient(135deg, rgba(91,95,248,0.04) 0%, rgba(124,77,255,0.06) 100%)" }}>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <FadeUp>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: "rgba(91,95,248,0.1)" }}>
                  🔐
                </div>
                <span className="text-sm font-semibold px-3 py-1 rounded-full" style={{ background: "rgba(91,95,248,0.1)", color: "#5B5FF8" }}>
                  Gizlilik
                </span>
              </div>
              <h2 className="font-heading font-bold text-3xl sm:text-4xl mb-4" style={{ color: "#101828" }}>
                Gizlilik daima<br />
                <span className="kq-gradient-text">önceliğimizdir</span>
              </h2>
              <p className="text-lg leading-relaxed mb-6" style={{ color: "#475467" }}>
                Çocuklarınızın verilerini nasıl koruduğumuzu keşfedin. LittleSteps bir gözetleme aracı değil — 
                konum takibi yok, ekran süresi izleme yok, reklam yok. Sadece pozitif ebeveynlik.
              </p>
              <Link
                href="/privacy"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5"
                style={{ background: "rgba(91,95,248,0.1)", color: "#5B5FF8" }}
              >
                LittleSteps Gizlilik Merkezi
                <ArrowRight className="w-4 h-4" />
              </Link>
            </FadeUp>

            <FadeUp delay={0.1}>
              <div className="grid grid-cols-2 gap-4">
                {badges.map((b, i) => (
                  <motion.div
                    key={b.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm"
                  >
                    <span className="text-3xl mb-3 block">{b.icon}</span>
                    <p className="font-semibold text-sm mb-1" style={{ color: "#101828" }}>{b.title}</p>
                    <p className="text-xs leading-relaxed" style={{ color: "#475467" }}>{b.desc}</p>
                  </motion.div>
                ))}
              </div>
            </FadeUp>
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section style={{ background: "white" }} className="py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <FadeUp>
          <div className="relative rounded-3xl overflow-hidden p-12 sm:p-16"
            style={{ background: "linear-gradient(135deg, #5B5FF8 0%, #7C4DFF 60%, #9333ea 100%)" }}>
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 blur-3xl"
              style={{ background: "white", transform: "translate(30%, -30%)" }} />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10 blur-2xl"
              style={{ background: "#FFB84D", transform: "translate(-30%, 30%)" }} />

            <div className="relative z-10">
              <div className="flex justify-center gap-4 mb-8">
                {["⭐", "🎁", "🔥", "🏆", "🐱"].map((emoji, i) => (
                  <motion.span
                    key={i}
                    animate={{ y: [0, -8, 0], rotate: [0, i % 2 === 0 ? 5 : -5, 0] }}
                    transition={{ duration: 2 + i * 0.4, repeat: Infinity, ease: "easeInOut" }}
                    className="text-3xl"
                  >
                    {emoji}
                  </motion.span>
                ))}
              </div>

              <h2 className="font-heading font-extrabold text-3xl sm:text-5xl text-white mb-4">
                Bugün Daha İyi Alışkanlıklar<br />Oluşturmaya Başlayın
              </h2>
              <p className="text-lg text-white/80 mb-10 max-w-xl mx-auto">
                Rutinler oluşturun, çocuklarınızı motive edin ve küçük zaferleri ömür boyu sürecek alışkanlıklara dönüştürün.
              </p>

              <div className="flex flex-wrap gap-4 justify-center">
                <Link
                  href="/register"
                  className="group inline-flex items-center gap-2 px-8 py-4 bg-white font-heading font-bold text-base rounded-xl shadow-xl hover:shadow-2xl transition-all duration-200 hover:-translate-y-1"
                  style={{ color: "#5B5FF8" }}
                >
                  Ücretsiz Başla
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-200"
                >
                  Giriş Yap
                </Link>
              </div>

              <p className="mt-6 text-white/60 text-sm">Kredi kartı gerekmez · 2 dakikada kurulum · İptal her zaman mümkün</p>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ background: "#101828" }} className="py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl kq-gradient-bg flex items-center justify-center">
                <Star className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="font-heading font-bold text-xl text-white">KiddoQiddo</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: "#98A2B3" }}>
              Modern aileler için oluşturulmuş. Rutinleri eğlenceli, ödülleri gerçek kılan platform.
            </p>
            <p className="text-sm mt-4 font-semibold" style={{ color: "#FFB84D" }}>
              Küçük görevler. Mutlu çocuklar. Huzurlu ebeveynler.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-white mb-4">Ürün</p>
            <ul className="space-y-3">
              {["Özellikler", "Nasıl Çalışır", "SSS"].map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm transition-colors hover:text-white" style={{ color: "#98A2B3" }}>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-white mb-4">Yasal</p>
            <ul className="space-y-3">
              {["Gizlilik Politikası", "Kullanım Koşulları", "İletişim"].map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm transition-colors hover:text-white" style={{ color: "#98A2B3" }}>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm" style={{ color: "#667085" }}>
            © 2026 KiddoQiddo. Modern aileler için tasarlandı.
          </p>
          <div className="flex items-center gap-1 text-sm" style={{ color: "#667085" }}>
            Made with <Heart className="w-3.5 h-3.5 mx-1 fill-red-500 text-red-500" /> for families
          </div>
        </div>
      </div>
    </footer>
  );
}

function LandingPage() {
  return (
    <main className="overflow-x-hidden">
      <Navbar />
      <Hero />
      <PhotoCollage />
      <Trust />
      <HowItWorks />
      <ChildSection />
      <ParentSection />
      <Gamification />
      <CrossPlatform />
      <SocialProof />
      <Privacy />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}

function MobileWelcome() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-between px-6 py-12 pt-safe pb-safe bg-gradient-to-b from-[#5B5FF8] via-[#7C4DFF] to-[#9C27B0]">
      <div className="flex-1 flex flex-col items-center justify-center gap-6 w-full">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl"
        >
          <Star className="w-12 h-12 text-white fill-white" />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-white font-heading">KiddoQiddo</h1>
          <p className="text-white/75 mt-2 text-base">Aile rutinlerini eğlenceye dönüştür ✨</p>
        </motion.div>
      </div>

      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm space-y-4"
      >
        <p className="text-center text-white/60 text-sm font-medium uppercase tracking-widest mb-6">
          Kim olarak giriş yapıyorsun?
        </p>

        <Link
          href="/login"
          className="flex items-center justify-between w-full px-6 py-5 rounded-2xl bg-white text-[#5B5FF8] font-bold text-lg shadow-xl active:scale-[0.97] transition-transform duration-150"
        >
          <div className="flex items-center gap-4">
            <span className="text-3xl">👨‍👩‍👧</span>
            <div className="text-left">
              <div className="font-bold text-slate-900">Ebeveyn</div>
              <div className="text-sm font-normal text-slate-500">Aile paneline giriş</div>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400" />
        </Link>

        <Link
          href="/child-login"
          className="flex items-center justify-between w-full px-6 py-5 rounded-2xl bg-white/15 backdrop-blur-sm text-white font-bold text-lg border border-white/25 active:scale-[0.97] transition-transform duration-150"
        >
          <div className="flex items-center gap-4">
            <span className="text-3xl">🧒</span>
            <div className="text-left">
              <div className="font-bold text-white">Çocuk</div>
              <div className="text-sm font-normal text-white/60">Görevlerine bak</div>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-white/50" />
        </Link>
      </motion.div>

      <div className="h-4" />
    </div>
  );
}

export default function RootPage() {
  const [isNative, setIsNative] = useState<boolean | null>(null);

  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform());
  }, []);

  // Not yet mounted — render nothing to avoid hydration flash
  if (isNative === null) return null;

  return isNative ? <MobileWelcome /> : <LandingPage />;
}
