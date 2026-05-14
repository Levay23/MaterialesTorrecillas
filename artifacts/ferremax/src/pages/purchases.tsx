import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, ClipboardList, CheckCircle, Clock } from "lucide-react";
import { apiFetch, formatCOP, formatDate } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const statusConfig: Record<string, any> = {
  pending: { label: "Pendiente", color: "bg-yellow-100 text-yellow-700" },
  received: { label: "Recibida", color: "bg-green-100 text-green-700" },
  cancelled: { label: "Cancelada", color: "bg-red-100 text-red-700" },
};

export default function PurchasesPage() {
  const [dialog, setDialog] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [supplierId, setSupplierId] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: purchases = [] } = useQuery({ queryKey: ["purchases"], queryFn: () => apiFetch<any[]>("/purchases") });
  const { data: suppliers = [] } = useQuery({ queryKey: ["suppliers"], queryFn: () => apiFetch<any[]>("/suppliers") });
  const { data: products = [] } = useQuery({ queryKey: ["products", ""], queryFn: () => apiFetch<any[]>("/products") });

  const createMut = useMutation({
    mutationFn: (data: any) => apiFetch("/purchases", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["purchases"] }); setDialog(false); setItems([]); toast({ title: "Orden de compra creada" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, status }: any) => apiFetch(`/purchases/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["purchases"] }); qc.invalidateQueries({ queryKey: ["products"] }); toast({ title: "Orden actualizada" }); },
  });

  const addItem = (product: any) => {
    if (items.find(i => i.productId === product.id)) return;
    setItems([...items, { productId: product.id, productName: product.name, quantity: 1, unitPrice: product.purchasePrice || 0, total: product.purchasePrice || 0 }]);
  };

  const updateQty = (productId: number, qty: number) =>
    setItems(items.map(i => i.productId === productId ? { ...i, quantity: qty, total: qty * i.unitPrice } : i));

  const total = items.reduce((s, i) => s + i.total, 0);

  const handleCreate = () => {
    if (!supplierId) { toast({ title: "Selecciona un proveedor", variant: "destructive" }); return; }
    if (!items.length) { toast({ title: "Agrega al menos un producto", variant: "destructive" }); return; }
    createMut.mutate({ supplierId, items, notes });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Órdenes de compra</h1>
          <p className="text-sm text-gray-500">{purchases.filter((p: any) => p.status === "pending").length} pendientes</p>
        </div>
        <Button onClick={() => { setItems([]); setSupplierId(null); setNotes(""); setDialog(true); }} className="bg-orange-600 hover:bg-orange-700 gap-2">
          <Plus size={16} /> Nueva orden
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {purchases.map((p: any) => {
          const s = statusConfig[p.status] || statusConfig.pending;
          return (
            <Card key={p.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <ClipboardList size={15} className="text-orange-600" />
                      <span className="font-mono text-xs text-gray-400">#{p.id}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900">{p.supplierName}</h3>
                    <p className="text-xs text-gray-400">{Array.isArray(p.items) ? p.items.length : 0} productos</p>
                  </div>
                  <Badge className={`text-xs ${s.color}`}>{s.label}</Badge>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xl font-bold text-orange-600">{formatCOP(p.total)}</span>
                  {p.status === "pending" && (
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-xs h-7 gap-1" onClick={() => updateMut.mutate({ id: p.id, status: "received" })}>
                      <CheckCircle size={12} /> Marcar recibida
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {!purchases.length && (
          <div className="col-span-3 text-center py-16 text-gray-400">
            <ClipboardList size={40} className="mx-auto mb-3 opacity-30" />
            <p>No hay órdenes de compra</p>
          </div>
        )}
      </div>

      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Nueva orden de compra</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Proveedor *</Label>
              <Select value={supplierId ? String(supplierId) : ""} onValueChange={v => setSupplierId(parseInt(v))}>
                <SelectTrigger><SelectValue placeholder="Seleccionar proveedor..." /></SelectTrigger>
                <SelectContent>{suppliers.map((s: any) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Agregar productos</Label>
              <Select onValueChange={v => { const p = products.find((p: any) => p.id === parseInt(v)); if (p) addItem(p); }}>
                <SelectTrigger><SelectValue placeholder="Seleccionar producto..." /></SelectTrigger>
                <SelectContent>{products.map((p: any) => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {items.map(item => (
                  <div key={item.productId} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{item.productName}</p></div>
                    <Input type="number" value={item.quantity} min={1} onChange={e => updateQty(item.productId, parseInt(e.target.value) || 1)} className="w-20 h-7 text-sm text-center" />
                    <Input type="number" value={item.unitPrice} min={0} onChange={e => setItems(items.map(i => i.productId === item.productId ? { ...i, unitPrice: Number(e.target.value), total: item.quantity * Number(e.target.value) } : i))} className="w-28 h-7 text-sm text-right" placeholder="Precio" />
                    <span className="text-sm font-semibold w-24 text-right">{formatCOP(item.total)}</span>
                    <button onClick={() => setItems(items.filter(i => i.productId !== item.productId))} className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-1.5"><Label>Notas</Label><Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Observaciones..." /></div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t"><span>Total estimado</span><span className="text-orange-600">{formatCOP(total)}</span></div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setDialog(false)}>Cancelar</Button>
              <Button className="flex-1 bg-orange-600 hover:bg-orange-700" onClick={handleCreate} disabled={createMut.isPending}>Crear orden</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
