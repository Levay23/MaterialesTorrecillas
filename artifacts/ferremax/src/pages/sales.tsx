import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, Trash2, ShoppingCart, User, Package, X } from "lucide-react";
import { apiFetch, formatCOP, formatDateTime } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface SaleItem { productId: number; productName: string; quantity: number; unitPrice: number; discount: number; total: number; }

export default function SalesPage() {
  const [tab, setTab] = useState<"pos" | "history">("pos");
  const [cartItems, setCartItems] = useState<SaleItem[]>([]);
  const [searchProd, setSearchProd] = useState("");
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [payMethod, setPayMethod] = useState("efectivo");
  const [discount, setDiscount] = useState(0);
  const [historySearch, setHistorySearch] = useState("");
  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: products = [] } = useQuery({
    queryKey: ["products", searchProd],
    queryFn: () => apiFetch<any[]>(`/products?search=${searchProd}`),
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: () => apiFetch<any[]>("/customers"),
  });

  const { data: sales = [] } = useQuery({
    queryKey: ["sales", historySearch],
    queryFn: () => apiFetch<any[]>("/sales"),
    enabled: tab === "history",
  });

  const saleMut = useMutation({
    mutationFn: (data: any) => apiFetch("/sales", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sales"] });
      qc.invalidateQueries({ queryKey: ["dashboard-summary"] });
      setCartItems([]); setDiscount(0); setCustomerId(null); setMobileCartOpen(false);
      toast({ title: "Venta registrada exitosamente" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const addToCart = (product: any) => {
    const existing = cartItems.find(i => i.productId === product.id);
    if (existing) {
      setCartItems(cartItems.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.unitPrice - i.discount } : i));
    } else {
      setCartItems([...cartItems, { productId: product.id, productName: product.name, quantity: 1, unitPrice: product.salePrice, discount: 0, total: product.salePrice }]);
    }
  };

  const removeFromCart = (productId: number) => setCartItems(cartItems.filter(i => i.productId !== productId));
  const updateQty = (productId: number, qty: number) => {
    if (qty <= 0) { removeFromCart(productId); return; }
    setCartItems(cartItems.map(i => i.productId === productId ? { ...i, quantity: qty, total: qty * i.unitPrice - i.discount } : i));
  };

  const subtotal = cartItems.reduce((s, i) => s + i.total, 0);
  const total = subtotal - discount;

  const processSale = () => {
    if (!cartItems.length) { toast({ title: "Agrega productos al carrito", variant: "destructive" }); return; }
    saleMut.mutate({ customerId, items: cartItems, discount, tax: 0, paymentMethod: payMethod });
  };

  const statusColors: Record<string, string> = {
    completed: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    cancelled: "bg-red-100 text-red-700",
  };

  const CartContent = () => (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-xs">Cliente (opcional)</Label>
        <Select value={customerId ? String(customerId) : "none"} onValueChange={v => setCustomerId(v !== "none" ? parseInt(v) : null)}>
          <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Cliente mostrador" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Cliente mostrador</SelectItem>
            {customers.map((c: any) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2 max-h-48 md:max-h-64 overflow-y-auto">
        {cartItems.map(item => (
          <div key={item.productId} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{item.productName}</p>
              <p className="text-xs text-gray-400">{formatCOP(item.unitPrice)} c/u</p>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => updateQty(item.productId, item.quantity - 1)} className="w-7 h-7 rounded bg-gray-200 hover:bg-gray-300 text-sm font-bold flex items-center justify-center">-</button>
              <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
              <button onClick={() => updateQty(item.productId, item.quantity + 1)} className="w-7 h-7 rounded bg-gray-200 hover:bg-gray-300 text-sm font-bold flex items-center justify-center">+</button>
            </div>
            <p className="text-sm font-semibold w-16 text-right shrink-0">{formatCOP(item.total)}</p>
            <button onClick={() => removeFromCart(item.productId)} className="text-gray-300 hover:text-red-500 transition-colors shrink-0"><Trash2 size={13} /></button>
          </div>
        ))}
        {!cartItems.length && (
          <div className="text-center py-8 text-gray-400 text-sm">Toca un producto para agregar</div>
        )}
      </div>
      <div className="border-t pt-3 space-y-2 text-sm">
        <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatCOP(subtotal)}</span></div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600 text-sm flex-1">Descuento</span>
          <Input type="number" value={discount} onChange={e => setDiscount(parseFloat(e.target.value) || 0)} className="h-7 w-24 text-right text-sm" />
        </div>
        <div className="flex justify-between font-bold text-base pt-1 border-t"><span>TOTAL</span><span className="text-orange-600">{formatCOP(total)}</span></div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Método de pago</Label>
        <Select value={payMethod} onValueChange={setPayMethod}>
          <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="efectivo">Efectivo</SelectItem>
            <SelectItem value="tarjeta">Tarjeta</SelectItem>
            <SelectItem value="transferencia">Transferencia</SelectItem>
            <SelectItem value="nequi">Nequi / Daviplata</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button className="w-full bg-orange-600 hover:bg-orange-700 h-11" onClick={processSale} disabled={saleMut.isPending}>
        {saleMut.isPending ? "Procesando..." : `Cobrar ${formatCOP(total)}`}
      </Button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Ventas</h1>
        <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
          <TabsList>
            <TabsTrigger value="pos">POS</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {tab === "pos" ? (
        <>
          {/* Desktop: side by side, Mobile: stacked with floating cart */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Product grid */}
            <div className="lg:col-span-3 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <Input placeholder="Buscar producto..." className="pl-9" value={searchProd} onChange={e => setSearchProd(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-3 max-h-[60vh] lg:max-h-[calc(100vh-280px)] overflow-y-auto pb-20 lg:pb-0">
                {products.slice(0, 40).map((p: any) => (
                  <button
                    key={p.id}
                    onClick={() => addToCart(p)}
                    className="text-left p-2.5 md:p-3 border border-gray-200 rounded-xl hover:border-orange-400 hover:bg-orange-50 active:bg-orange-100 transition-all"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Package size={13} className="text-gray-500" />
                      </div>
                      <Badge variant={p.stock === 0 ? "destructive" : "outline"} className="text-xs">{p.stock}</Badge>
                    </div>
                    <p className="text-xs md:text-sm font-medium text-gray-900 mt-1 leading-tight line-clamp-2">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.sku}</p>
                    <p className="text-sm md:text-base font-bold text-orange-600 mt-1">{formatCOP(p.salePrice)}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop cart */}
            <div className="hidden lg:block lg:col-span-2">
              <Card className="sticky top-0">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ShoppingCart size={16} className="text-orange-600" />
                    Carrito ({cartItems.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <CartContent />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Mobile: floating cart button */}
          <div className="lg:hidden">
            <button
              onClick={() => setMobileCartOpen(true)}
              className="fixed bottom-5 right-5 bg-orange-600 text-white rounded-full shadow-xl px-5 py-3 flex items-center gap-2 font-semibold z-30 active:bg-orange-700"
            >
              <ShoppingCart size={18} />
              {cartItems.length > 0 ? (
                <>
                  <span className="w-5 h-5 bg-white text-orange-600 rounded-full text-xs font-bold flex items-center justify-center">{cartItems.length}</span>
                  <span className="text-sm">{formatCOP(total)}</span>
                </>
              ) : (
                <span className="text-sm">Carrito</span>
              )}
            </button>

            {/* Mobile cart dialog */}
            <Dialog open={mobileCartOpen} onOpenChange={setMobileCartOpen}>
              <DialogContent className="max-w-sm mx-auto max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <ShoppingCart size={16} className="text-orange-600" />
                    Carrito ({cartItems.length})
                  </DialogTitle>
                </DialogHeader>
                <CartContent />
              </DialogContent>
            </Dialog>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <Input placeholder="Buscar ventas..." className="pl-9" value={historySearch} onChange={e => setHistorySearch(e.target.value)} />
          </div>
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="bg-gray-50 border-b">
                <tr>{["#", "Cliente", "Items", "Total", "Método", "Estado", "Fecha"].map(h => (
                  <th key={h} className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sales.filter((s: any) => !historySearch || s.customerName?.toLowerCase().includes(historySearch.toLowerCase())).map((s: any) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-3 md:px-4 py-3 font-mono text-xs text-gray-500">#{s.id}</td>
                    <td className="px-3 md:px-4 py-3 whitespace-nowrap">{s.customerName || "Mostrador"}</td>
                    <td className="px-3 md:px-4 py-3 text-gray-500">{Array.isArray(s.items) ? s.items.length : 0}</td>
                    <td className="px-3 md:px-4 py-3 font-semibold whitespace-nowrap">{formatCOP(s.total)}</td>
                    <td className="px-3 md:px-4 py-3 text-gray-500 capitalize whitespace-nowrap">{s.paymentMethod}</td>
                    <td className="px-3 md:px-4 py-3"><Badge className={`text-xs ${statusColors[s.status]}`}>{s.status}</Badge></td>
                    <td className="px-3 md:px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{formatDateTime(s.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!sales.length && <div className="text-center py-12 text-gray-400">No hay ventas registradas</div>}
          </div>
        </div>
      )}
    </div>
  );
}
