import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  TrendingUp, Users, Package, FileText, AlertTriangle,
  MessageCircle, ShoppingCart, Clock
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from "recharts";
import { apiFetch, formatCOP, formatDateTime } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function StatCard({ label, value, icon: Icon, color, sub }: { label: string; value: string; icon: any; color: string; sub?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">{label}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
            </div>
            <div className={`p-3 rounded-xl ${color}`}>
              <Icon size={20} className="text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { data: summary } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: () => apiFetch<any>("/dashboard/summary"),
    refetchInterval: 30000,
  });

  const { data: chart } = useQuery({
    queryKey: ["sales-chart"],
    queryFn: () => apiFetch<any[]>("/dashboard/sales-chart"),
  });

  const { data: topProducts } = useQuery({
    queryKey: ["top-products"],
    queryFn: () => apiFetch<any[]>("/dashboard/top-products"),
  });

  const { data: activity } = useQuery({
    queryKey: ["recent-activity"],
    queryFn: () => apiFetch<any[]>("/dashboard/recent-activity"),
  });

  const { data: lowStock } = useQuery({
    queryKey: ["low-stock"],
    queryFn: () => apiFetch<any[]>("/dashboard/low-stock"),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Resumen operativo</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Ventas hoy" value={formatCOP(summary?.todaySales)} icon={TrendingUp} color="bg-green-500" />
        <StatCard label="Ventas del mes" value={formatCOP(summary?.monthSales)} icon={ShoppingCart} color="bg-blue-500" />
        <StatCard label="Total clientes" value={(summary?.totalCustomers || 0).toString()} icon={Users} color="bg-purple-500" />
        <StatCard label="Productos" value={(summary?.totalProducts || 0).toString()} icon={Package} color="bg-orange-500" />
        <StatCard label="Cotizaciones" value={(summary?.pendingQuotes || 0).toString()} sub="pendientes" icon={FileText} color="bg-yellow-500" />
        <StatCard label="Stock bajo" value={(summary?.lowStockCount || 0).toString()} sub="productos" icon={AlertTriangle} color="bg-red-500" />
        <StatCard label="Conversaciones" value={(summary?.activeConversations || 0).toString()} sub="activas WhatsApp" icon={MessageCircle} color="bg-teal-500" />
        <StatCard label="Fact. pendientes" value={(summary?.pendingInvoices || 0).toString()} icon={Clock} color="bg-indigo-500" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Ventas últimos 30 días</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chart || []}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => d?.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: any) => [formatCOP(v), "Ventas"]} labelFormatter={l => `Día ${l}`} />
                <Area type="monotone" dataKey="total" stroke="#f97316" strokeWidth={2} fill="url(#salesGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Productos más vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(topProducts || []).slice(0, 5).map((p: any, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-600">{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.totalSold} unidades</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-700">{formatCOP(p.revenue)}</p>
                </div>
              ))}
              {!topProducts?.length && (
                <p className="text-sm text-gray-400 text-center py-6">Sin ventas aún</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-500" />
              Productos con stock bajo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {(lowStock || []).map((p: any) => (
                <div key={p.id} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.sku}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={p.stock === 0 ? "destructive" : "secondary"} className="text-xs">
                      {p.stock === 0 ? "Agotado" : `${p.stock} und`}
                    </Badge>
                    <p className="text-xs text-gray-400 mt-0.5">Mín: {p.minStock}</p>
                  </div>
                </div>
              ))}
              {!lowStock?.length && <p className="text-sm text-gray-400 text-center py-6">Stock en buen nivel ✓</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Actividad reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {(activity || []).map((a: any) => (
                <div key={a.id} className="flex items-start gap-3 py-1.5 border-b border-gray-50 last:border-0">
                  <div className="w-2 h-2 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 truncate">{a.description}</p>
                    <p className="text-xs text-gray-400">{formatDateTime(a.createdAt)}</p>
                  </div>
                </div>
              ))}
              {!activity?.length && <p className="text-sm text-gray-400 text-center py-6">Sin actividad reciente</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
