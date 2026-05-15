import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, Package, ShoppingCart, FileText,
  Truck, ClipboardList, MessageCircle, Bot, BookOpen,
  BarChart3, LogOut, Menu, X, Hammer, Bell,
  ChevronRight, UserCog, UserPlus, Wallet, FolderTree
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Clientes", icon: Users, path: "/clientes" },
  { label: "Productos", icon: Package, path: "/productos" },
  { label: "Categorías", icon: FolderTree, path: "/categorias" },
  { label: "Ventas / POS", icon: ShoppingCart, path: "/ventas" },
  { label: "Cotizaciones", icon: FileText, path: "/cotizaciones" },
  { label: "Proveedores", icon: Truck, path: "/proveedores" },
  { label: "Compras", icon: ClipboardList, path: "/compras" },
  { label: "WhatsApp", icon: MessageCircle, path: "/whatsapp" },
  { label: "Asistente IA", icon: Bot, path: "/ia" },
  { label: "Base de Conocimiento", icon: BookOpen, path: "/conocimiento" },
  { label: "Reportes", icon: BarChart3, path: "/reportes" },
  { label: "Usuarios", icon: UserCog, path: "/usuarios", roles: ["Super Admin"] },
];

function isMobile() {
  return typeof window !== "undefined" && window.innerWidth < 768;
}

export default function Layout({ children, onLogout }: { children: React.ReactNode; onLogout: () => void }) {
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile());
  const [location] = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && !sidebarOpen) {
        setSidebarOpen(true);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [sidebarOpen]);

  const handleLogout = async () => {
    await apiFetch("/auth/logout", { method: "POST" });
    onLogout();
  };

  const handleNavClick = () => {
    if (isMobile()) setSidebarOpen(false);
  };

  const visibleNav = navItems.filter(item => !item.roles || item.roles.includes(user?.role || ""));

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile backdrop */}
      <AnimatePresence>
        {sidebarOpen && isMobile() && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-10 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed md:relative w-64 h-full bg-gray-900 text-white flex flex-col shadow-2xl z-20 shrink-0"
          >
            {/* Logo */}
            <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-700">
              <div className="bg-orange-500 rounded-lg p-2">
                <Hammer size={20} className="text-white" />
              </div>
              <div>
                <h1 className="font-bold text-sm leading-tight uppercase tracking-tighter">Mat. Torrecillas</h1>
                <p className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">Admin Panel</p>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="ml-auto text-gray-400 hover:text-white transition-colors md:hidden"
              >
                <X size={18} />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
              {visibleNav.map((item) => {
                const active = location === item.path || (item.path !== "/" && location.startsWith(item.path));
                return (
                  <Link key={item.path} href={item.path} onClick={handleNavClick}>
                    <div
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
                        active
                          ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                          : "text-gray-400 hover:bg-gray-800 hover:text-white"
                      }`}
                    >
                      <item.icon size={18} />
                      <span className="text-sm font-medium flex-1">{item.label}</span>
                      {active && <ChevronRight size={14} className="opacity-70" />}
                    </div>
                  </Link>
                );
              })}
            </nav>

            {/* User */}
            <div className="border-t border-gray-700 p-4">
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-orange-500 text-white text-xs">
                    {user?.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-gray-400 truncate">{user?.role}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-400 hover:text-red-400 text-sm transition-colors w-full"
              >
                <LogOut size={15} />
                Cerrar sesión
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-3 md:px-4 py-3 flex items-center gap-3 shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-600 hover:text-gray-900 p-1.5 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
          >
            {sidebarOpen && !isMobile() ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex-1" />
          <button className="relative text-gray-500 hover:text-gray-900 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <Bell size={18} />
          </button>
          <div className="text-sm text-gray-600 font-medium hidden sm:block truncate max-w-[120px]">{user?.name}</div>
          <Badge variant="secondary" className="text-xs hidden sm:flex">{user?.role}</Badge>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-3 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
