import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, FileText, CheckCircle, XCircle, Clock } from "lucide-react";
import { apiFetch, formatCOP, formatDate } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const statusConfig: Record<string, any> = {
  pending: { label: "Pendiente", icon: Clock, color: "bg-yellow-100 text-yellow-700" },
  approved: { label: "Aprobada", icon: CheckCircle, color: "bg-green-100 text-green-700" },
  rejected: { label: "Rechazada", icon: XCircle, color: "bg-red-100 text-red-700" },
  expired: { label: "Vencida", icon: Clock, color: "bg-gray-100 text-gray-700" },
};

export default function QuotesPage() {
  const [dialog, setDialog] = useState<"create" | "view" | null>(null);
  const [selected, setSelected] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState("");
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: quotes = [] } = useQuery({
    queryKey: ["quotes"],
    queryFn: () => apiFetch<any[]>("/quotes"),
  });

  const { data: customers = [] } = useQuery({ queryKey: ["customers"], queryFn: () => apiFetch<any[]>("/customers") });
  const { data: products = [] } = useQuery({ queryKey: ["products", ""], queryFn: () => apiFetch<any[]>("/products") });

  const createMut = useMutation({
    mutationFn: (data: any) => apiFetch("/quotes", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["quotes"] }); setDialog(null); toast({ title: "Cotización creada" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const convertMut = useMutation({
    mutationFn: (id: number) => apiFetch(`/quotes/${id}/convert`, { method: "POST" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["quotes"] }); qc.invalidateQueries({ queryKey: ["sales"] }); toast({ title: "Cotización convertida en venta" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const addItem = (product: any) => {
    const existing = items.find(i => i.productId === product.id);
    if (existing) return;
    setItems([...items, { productId: product.id, productName: product.name, quantity: 1, unitPrice: product.salePrice, discount: 0, total: product.salePrice }]);
  };

  const removeItem = (productId: number) => setItems(items.filter(i => i.productId !== productId));
  const updateItemQty = (productId: number, qty: number) => {
    setItems(items.map(i => i.productId === productId ? { ...i, quantity: qty, total: qty * i.unitPrice - i.discount } : i));
  };

  const subtotal = items.reduce((s, i) => s + i.total, 0);
  const total = subtotal - discount;

  const handleCreate = () => {
    if (!items.length) { toast({ title: "Agrega al menos un producto", variant: "destructive" }); return; }
    createMut.mutate({ customerId, items, discount, tax: 0, notes });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cotizaciones</h1>
          <p className="text-sm text-gray-500">{quotes.filter((q: any) => q.status === "pending").length} pendientes</p>
        </div>
        <Button onClick={() => { setItems([]); setCustomerId(null); setDiscount(0); setNotes(""); setDialog("create"); }} className="bg-orange-600 hover:bg-orange-700 gap-2">
          <Plus size={16} /> Nueva cotización
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {quotes.map((q: any) => {
          const s = statusConfig[q.status] || statusConfig.pending;
          return (
            <Card key={q.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => { setSelected(q); setDialog("view"); }}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-orange-600" />
                    <span className="font-mono text-sm text-gray-500">#{q.id}</span>
                  </div>
                  <Badge className={`text-xs ${s.color}`}>{s.label}</Badge>
                </div>
                <h3 className="font-semibold text-gray-900">{q.customerName || "Cliente mostrador"}</h3>
                <p className="text-xs text-gray-400 mt-1">{Array.isArray(q.items) ? q.items.length : 0} productos · Vence: {formatDate(q.validUntil)}</p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xl font-bold text-orange-600">{formatCOP(q.total)}</span>
                  {q.status === "pending" && (
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-xs h-7" onClick={e => { e.stopPropagation(); convertMut.mutate(q.id); }}>
                      <CheckCircle size={12} className="mr-1" /> Convertir
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {!quotes.length && (
          <div className="col-span-3 text-center py-16 text-gray-400">
            <FileText size={40} className="mx-auto mb-3 opacity-30" />
            <p>No hay cotizaciones registradas</p>
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={dialog === "create"} onOpenChange={() => setDialog(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Nueva cotización</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Cliente</Label>
              <Select value={customerId ? String(customerId) : "none"} onValueChange={v => setCustomerId(v !== "none" ? parseInt(v) : null)}>
                <SelectTrigger><SelectValue placeholder="Seleccionar cliente..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Cliente mostrador</SelectItem>
                  {customers.map((c: any) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Agregar productos</Label>
              <Select onValueChange={v => { const p = products.find((p: any) => p.id === parseInt(v)); if (p) addItem(p); }}>
                <SelectTrigger><SelectValue placeholder="Seleccionar producto..." /></SelectTrigger>
                <SelectContent>
                  {products.map((p: any) => <SelectItem key={p.id} value={String(p.id)}>{p.name} — {formatCOP(p.salePrice)}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {items.map(item => (
                  <div key={item.productId} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{item.productName}</p></div>
                    <Input type="number" value={item.quantity} min={1} onChange={e => updateItemQty(item.productId, parseInt(e.target.value) || 1)} className="w-20 h-7 text-sm text-center" />
                    <span className="text-sm font-semibold w-24 text-right">{formatCOP(item.total)}</span>
                    <button onClick={() => removeItem(item.productId)} className="text-red-400 hover:text-red-600"><XCircle size={16} /></button>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="space-y-1.5 flex-1"><Label>Descuento</Label><Input type="number" value={discount} onChange={e => setDiscount(Number(e.target.value))} /></div>
              <div className="space-y-1.5 flex-1"><Label>Notas</Label><Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Observaciones..." /></div>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total</span>
              <span className="text-orange-600">{formatCOP(total)}</span>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setDialog(null)}>Cancelar</Button>
              <Button className="flex-1 bg-orange-600 hover:bg-orange-700" onClick={handleCreate} disabled={createMut.isPending}>Crear cotización</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
