import { Link, useLocation } from "wouter";
import { Home, PenLine, Calculator, Apple, Clock, Settings } from "lucide-react";
import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/log", icon: PenLine, label: "Log" },
  { href: "/calculator", icon: Calculator, label: "Calc" },
  { href: "/nutrition", icon: Apple, label: "Food" },
  { href: "/history", icon: Clock, label: "History" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="flex flex-col h-[100dvh] w-full max-w-[430px] mx-auto bg-background text-foreground relative overflow-hidden">
      <div
        className="flex-1 overflow-y-auto scrollbar-none relative"
        style={{ paddingBottom: "calc(72px + env(safe-area-inset-bottom, 12px))" }}
      >
        <AnimatePresence mode="wait">
          <motion.main
            key={location}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="min-h-full"
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>

      <nav
        className="absolute bottom-0 w-full bg-card/90 backdrop-blur-2xl border-t border-border/60 flex items-center justify-around px-1 z-40"
        style={{
          height: "calc(72px + env(safe-area-inset-bottom, 12px))",
          paddingBottom: "env(safe-area-inset-bottom, 12px)",
        }}
      >
        {navItems.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center flex-1 h-full gap-1 relative select-none cursor-pointer active:opacity-70"
              style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              <motion.div
                className="relative flex items-center justify-center pointer-events-none"
                whileTap={{ scale: 0.88 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 -m-2.5 rounded-2xl bg-primary/12 pointer-events-none"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.2 : 1.8}
                  className={`relative z-10 transition-colors duration-200 ${
                    isActive ? "text-primary" : "text-muted-foreground/70"
                  }`}
                />
              </motion.div>
              <span
                className={`text-[10px] font-medium tracking-wide transition-colors duration-200 leading-none ${
                  isActive ? "text-primary" : "text-muted-foreground/60"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
