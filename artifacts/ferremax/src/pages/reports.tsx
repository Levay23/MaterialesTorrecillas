import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, TrendingUp, Users, Package } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import { apiFetch, formatCOP } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const COLORS = ["#f97316", "#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"];

export default function ReportsPage() {
  const [from, setFrom] = useState(() => {
    const d = new Date(); d.setDate(1);
    return d.toISOString().split("T")[0];
  });
  const [to, setTo] = useState(() => new Date().toISOString().split("T")[0]);

  const { data: salesReport } = useQuery({
    queryKey: ["report-sales", from, to],
    queryFn: () => apiFetch<any>(`/reports/sales?from=${from}&to=${to}`),
  });

  const { data: inventoryReport } = useQuery({
    queryKey: ["report-inventory"],
    queryFn: () => apiFetch<any>("/reports/inventory"),
  });

  const { data: customersReport } = useQuery({
    queryKey: ["report-customers"],
    queryFn: () => apiFetch<any>("/reports/customers"),
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
        <p className="text-sm text-gray-500">Análisis de ventas, inventario y clientes</p>
      </div>

      <Tabs defaultValue="sales">
        <TabsList>
          <TabsTrigger value="sales" className="gap-2"><TrendingUp size={14} />Ventas</TabsTrigger>
          <TabsTrigger value="inventory" className="gap-2"><Package size={14} />Inventario</TabsTrigger>
          <TabsTrigger value="customers" className="gap-2"><Users size={14} />Clientes</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-5 pt-4">
          <div className="flex gap-4 items-end">
            <div className="space-y-1.5">
              <Label>Desde</Label>
              <Input type="date" value={from} onChange={e => setFrom(e.target.value)} className="w-40" />
            </div>
            <div className="space-y-1.5">
              <Label>Hasta</Label>
              <Input type="date" value={to} onChange={e => setTo(e.target.value)} className="w-40" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total ventas", value: salesReport?.totalSales || 0, type: "number" },
              { label: "Ingresos totales", value: salesReport?.totalRevenue || 0, type: "currency" },
              { label: "Ticket promedio", value: salesReport?.averageTicket || 0, type: "currency" },
            ].map((stat, i) => (
              <Card key={i}>
                <CardContent className="p-5">
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stat.type === "currency" ? formatCOP(stat.value) : stat.value.toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-5">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Ventas por día</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={salesReport?.byDay || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d?.slice(5)} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: any) => [formatCOP(v), "Ventas"]} />
                    <Bar dataKey="total" fill="#f97316" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Por método de pago</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={salesReport?.byPaymentMethod || []} dataKey="total" nameKey="method" cx="50%" cy="50%" outerRadius={80} label={({ method, percent }) => `${method} ${(percent * 100).toFixed(0)}%`}>
                      {(salesReport?.byPaymentMethod || []).map((_: any, i: number) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any) => formatCOP(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-5 pt-4">
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Total productos", value: inventoryReport?.totalProducts || 0 },
              { label: "Valor en inventario", value: formatCOP(inventoryReport?.totalValue) },
              { label: "Stock bajo", value: inventoryReport?.lowStockCount || 0 },
              { label: "Sin stock", value: inventoryReport?.outOfStockCount || 0 },
            ].map((stat, i) => (
              <Card key={i}>
                <CardContent className="p-5">
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Valor por categoría</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={inventoryReport?.byCategory || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `$${(v / 1000000).toFixed(1)}M`} />
                  <YAxis type="category" dataKey="category" tick={{ fontSize: 11 }} width={140} />
                  <Tooltip formatter={(v: any) => [formatCOP(v), "Valor"]} />
                  <Bar dataKey="value" fill="#f97316" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-5 pt-4">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total clientes", value: customersReport?.totalCustomers || 0 },
              { label: "Nuevos este mes", value: customersReport?.newThisMonth || 0 },
              { label: "Tipos registrados", value: (customersReport?.byType || []).length },
            ].map((stat, i) => (
              <Card key={i}>
                <CardContent className="p-5">
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-5">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Por tipo de cliente</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={customersReport?.byType || []} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={75} label={({ type, count }) => `${type}: ${count}`}>
                      {(customersReport?.byType || []).map((_: any, i: number) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Top 10 clientes</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {(customersReport?.topCustomers || []).map((c: any, i: number) => (
                    <div key={c.customerId} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-600">{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{c.name}</p>
                        <p className="text-xs text-gray-400">{c.purchaseCount} compras</p>
                      </div>
                      <p className="text-sm font-semibold">{formatCOP(c.totalSpent)}</p>
                    </div>
                  ))}
                  {!customersReport?.topCustomers?.length && <p className="text-sm text-gray-400 text-center py-6">Sin datos aún</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
