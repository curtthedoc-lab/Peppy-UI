import { motion } from "framer-motion";
import { PenLine, Scale, Droplets } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export function Home() {
  return (
    <div className="p-6 h-full flex flex-col">
      <header className="mb-8 mt-4">
        <h1 className="text-xl font-medium text-muted-foreground">Good morning</h1>
        <h2 className="text-3xl font-bold text-primary mt-1 tracking-tight">Peppies</h2>
      </header>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-4"
      >
        {/* Recent Injections */}
        <motion.div variants={itemVariants} className="bg-card rounded-2xl p-5 border border-card-border shadow-sm flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
              <PenLine size={20} />
            </div>
            <h3 className="font-semibold text-lg">Recent Injections</h3>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <p className="text-muted-foreground text-sm">No injections logged yet</p>
            <Link href="/log" asChild>
              <Button variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10 -mr-2" size="sm" data-testid="button-log-now">
                Log now
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Weight Tracking */}
        <motion.div variants={itemVariants} className="bg-card rounded-2xl p-5 border border-card-border shadow-sm flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                <Scale size={20} />
              </div>
              <h3 className="font-semibold text-lg">Weight Tracking</h3>
            </div>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold tracking-tight">-- <span className="text-xl text-muted-foreground font-medium">kg</span></p>
            </div>
            <div className="w-16 h-8 opacity-40">
              <svg viewBox="0 0 100 40" className="w-full h-full stroke-primary fill-none stroke-2 stroke-[round]">
                <path d="M0,20 Q10,10 20,20 T40,20 T60,20 T80,20 T100,20" />
              </svg>
            </div>
            <Button variant="outline" size="sm" className="rounded-full px-4" data-testid="button-track-weight">Track</Button>
          </div>
        </motion.div>

        {/* Hydration */}
        <motion.div variants={itemVariants} className="bg-card rounded-2xl p-5 border border-card-border shadow-sm flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
              <Droplets size={20} />
            </div>
            <h3 className="font-semibold text-lg">Hydration</h3>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-muted" />
                  <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray="125.6" strokeDashoffset="125.6" className="text-primary" />
                </svg>
                <span className="absolute text-sm font-bold">0</span>
              </div>
              <p className="text-muted-foreground text-sm font-medium">0 of 8 glasses</p>
            </div>
            <Button variant="secondary" size="sm" className="rounded-full px-4" data-testid="button-add-water">+ Add</Button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
