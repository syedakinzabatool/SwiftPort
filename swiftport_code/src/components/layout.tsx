import { Link, useLocation } from "wouter";
import { LayoutDashboard, Send, ArrowDownToLine, History, User } from "lucide-react";
import { motion } from "framer-motion";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
    { href: "/send", icon: Send, label: "Send" },
    { href: "/receive", icon: ArrowDownToLine, label: "Receive" },
    { href: "/history", icon: History, label: "History" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col md:flex-row pb-16 md:pb-0">
      <main className="flex-1 overflow-y-auto">
        <motion.div
          key={location}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="max-w-2xl mx-auto h-full"
        >
          {children}
        </motion.div>
      </main>

      {/* Bottom Nav for Mobile */}
      <nav className="fixed bottom-0 w-full bg-card border-t md:hidden z-50">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} className="flex-1 h-full">
                <div className={`flex flex-col items-center justify-center h-full space-y-1 ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                  <item.icon size={20} className={isActive ? 'stroke-[2.5px]' : ''} />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-card h-[100dvh] order-first">
        <div className="p-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold">S</div>
            <span className="text-xl font-bold">SwiftPort</span>
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} className="block">
                <div className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'}`}>
                  <item.icon size={20} className={isActive ? 'stroke-[2.5px]' : ''} />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </aside>
    </div>
  );
}