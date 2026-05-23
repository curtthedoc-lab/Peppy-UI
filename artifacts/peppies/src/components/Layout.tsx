import { Link, useLocation } from "wouter";
import { Home, PenLine, Calculator, Clock, Settings } from "lucide-react";
import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/log", icon: PenLine, label: "Log" },
    { href: "/calculator", icon: Calculator, label: "Calculator" },
    { href: "/history", icon: Clock, label: "History" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="flex flex-col h-[100dvh] w-full max-w-[430px] mx-auto bg-background text-foreground relative overflow-hidden shadow-2xl">
      <div className="flex-1 overflow-y-auto pb-[80px] scrollbar-none relative">
        <AnimatePresence mode="wait">
          <motion.main
            key={location}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="h-full"
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>

      <nav className="absolute bottom-0 w-full h-[80px] bg-background/80 backdrop-blur-xl border-t border-border flex items-center justify-around px-2 pb-safe z-50">
        {navItems.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center w-full h-full relative" data-testid={`nav-${item.label.toLowerCase()}`}>
              <div className="relative p-2">
                <Icon
                  size={24}
                  className={`transition-colors duration-300 ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </div>
              <span className={`text-[10px] mt-1 font-medium transition-colors duration-300 ${isActive ? "text-primary" : "text-muted-foreground"}`}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
