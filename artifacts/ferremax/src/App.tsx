import { useState, useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/components/AuthProvider";
import Layout from "@/components/Layout";
import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import CustomersPage from "@/pages/customers";
import ProductsPage from "@/pages/products";
import SalesPage from "@/pages/sales";
import QuotesPage from "@/pages/quotes";
import SuppliersPage from "@/pages/suppliers";
import PurchasesPage from "@/pages/purchases";
import WhatsAppPage from "@/pages/whatsapp";
import AIChatPage from "@/pages/ai-chat";
import KnowledgePage from "@/pages/knowledge";
import UsersPage from "@/pages/users";
import ReportsPage from "@/pages/reports";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

function AppRoutes({ onLogout }: { onLogout: () => void }) {
  return (
    <Layout onLogout={onLogout}>
      <Switch>
        <Route path="/" component={DashboardPage} />
        <Route path="/clientes" component={CustomersPage} />
        <Route path="/productos" component={ProductsPage} />
        <Route path="/ventas" component={SalesPage} />
        <Route path="/cotizaciones" component={QuotesPage} />
        <Route path="/proveedores" component={SuppliersPage} />
        <Route path="/compras" component={PurchasesPage} />
        <Route path="/whatsapp" component={WhatsAppPage} />
        <Route path="/ia" component={AIChatPage} />
        <Route path="/conocimiento" component={KnowledgePage} />
        <Route path="/reportes" component={ReportsPage} />
        <Route path="/usuarios" component={UsersPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function AuthGate() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [manualLogin, setManualLogin] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-600 to-amber-500">
        <div className="text-white text-center">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-orange-100">Cargando Materiales Torrecillas...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !manualLogin) {
    return (
      <LoginPage
        onLogin={() => {
          setManualLogin(true);
          queryClient.invalidateQueries({ queryKey: ["me"] });
          setLocation("/");
        }}
      />
    );
  }

  return (
    <AppRoutes
      onLogout={() => {
        setManualLogin(false);
        queryClient.clear();
        setLocation("/");
        window.location.reload();
      }}
    />
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <AuthGate />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

