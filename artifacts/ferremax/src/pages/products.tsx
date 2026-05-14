import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Search, Plus, Edit, Trash2, Package, AlertTriangle, ArrowUpDown } from "lucide-react";
import { apiFetch, formatCOP } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [dialog, setDialog] = useState<"create" | "edit" | "stock" | null>(null);
  const [selected, setSelected] = useState<any>(null);
  const [stockType, setStockType] = useState<"entrada" | "salida">("entrada");
  const [stockQty, setStockQty] = useState(1);
  const [stockReason, setStockReason] = useState("");
  const { toast } = useToast();
  const qc = useQueryClient();
  const { register, handleSubmit, reset, setValue, formState: { isSubmitting } } = useForm<any>();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", search, catFilter],
    queryFn: () => apiFetch<any[]>(`/products?search=${search}${catFilter !== "all" ? `&categoryId=${catFilter}` : ""}`),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => apiFetch<any[]>("/categories"),
  });

  const createMut = useMutation({
    mutationFn: (data: any) => apiFetch("/products", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["products"] }); setDialog(null); reset(); toast({ title: "Producto creado" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateMut = useMutation({
    mutationFn: (data: any) => apiFetch(`/products/${selected.id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["products"] }); setDialog(null); reset(); toast({ title: "Producto actualizado" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => apiFetch(`/products/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["products"] }); toast({ title: "Producto eliminado" }); },
  });

  const stockMut = useMutation({
    mutationFn: () => apiFetch(`/products/${selected.id}/adjust-stock`, {
      method: "POST",
      body: JSON.stringify({ quantity: stockQty, type: stockType, reason: stockReason }),
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["products"] }); setDialog(null); toast({ title: "Stock ajustado" }); },
  });

  const openEdit = (p: any) => { setSelected(p); reset(p); setDialog("edit"); };
  const openStock = (p: any) => { setSelected(p); setDialog("stock"); };
  const onSubmit = (data: any) => {
    if (dialog === "edit") updateMut.mutate(data);
    else createMut.mutate(data);
  };

  const lowStockCount = products.filter((p: any) => p.stock <= p.minStock).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
          <p className="text-sm text-gray-500">{products.length} productos · {lowStockCount > 0 && <span className="text-amber-600">{lowStockCount} con stock bajo</span>}</p>
        </div>
        <Button onClick={() => { reset({}); setDialog("create"); }} className="bg-orange-600 hover:bg-orange-700 gap-2">
          <Plus size={16} /> Nuevo producto
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <Input placeholder="Buscar por nombre, SKU..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {categories.map((c: any) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? <div className="text-center py-12 text-gray-400">Cargando...</div> : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["SKU", "Producto", "Categoría", "Precio venta", "Stock", "Acciones"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p: any) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.sku}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{p.name}</div>
                    {p.brand && <div className="text-xs text-gray-400">{p.brand}</div>}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{p.categoryName || "—"}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{formatCOP(p.salePrice)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Badge variant={p.stock === 0 ? "destructive" : p.stock <= p.minStock ? "secondary" : "outline"} className="text-xs">
                        {p.stock} und
                      </Badge>
                      {p.stock <= p.minStock && p.stock > 0 && <AlertTriangle size={13} className="text-amber-500" />}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openStock(p)} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Ajustar stock"><ArrowUpDown size={14} /></button>
                      <button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={14} /></button>
                      <button onClick={() => deleteMut.mutate(p.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!products.length && (
            <div className="text-center py-16 text-gray-400">
              <Package size={40} className="mx-auto mb-3 opacity-30" />
              <p>No hay productos registrados</p>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialog === "create" || dialog === "edit"} onOpenChange={() => setDialog(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{dialog === "edit" ? "Editar producto" : "Nuevo producto"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5"><Label>Nombre *</Label><Input {...register("name", { required: true })} /></div>
              <div className="space-y-1.5"><Label>SKU *</Label><Input {...register("sku", { required: true })} /></div>
              <div className="space-y-1.5"><Label>Código de barras</Label><Input {...register("barcode")} /></div>
              <div className="space-y-1.5"><Label>Precio compra</Label><Input type="number" {...register("purchasePrice")} /></div>
              <div className="space-y-1.5"><Label>Precio venta *</Label><Input type="number" {...register("salePrice", { required: true })} /></div>
              <div className="space-y-1.5"><Label>Precio mayorista</Label><Input type="number" {...register("wholesalePrice")} /></div>
              <div className="space-y-1.5"><Label>Marca</Label><Input {...register("brand")} /></div>
              <div className="space-y-1.5"><Label>Stock actual</Label><Input type="number" {...register("stock")} defaultValue={0} /></div>
              <div className="space-y-1.5"><Label>Stock mínimo</Label><Input type="number" {...register("minStock")} defaultValue={5} /></div>
              <div className="col-span-2 space-y-1.5">
                <Label>Categoría</Label>
                <Select defaultValue={selected?.categoryId ? String(selected.categoryId) : ""} onValueChange={v => setValue("categoryId", parseInt(v))}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c: any) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setDialog(null)}>Cancelar</Button>
              <Button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-700" disabled={isSubmitting}>
                {dialog === "edit" ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Stock Dialog */}
      <Dialog open={dialog === "stock"} onOpenChange={() => setDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Ajustar stock — {selected?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button variant={stockType === "entrada" ? "default" : "outline"} className={stockType === "entrada" ? "bg-green-600 hover:bg-green-700 flex-1" : "flex-1"} onClick={() => setStockType("entrada")}>Entrada</Button>
              <Button variant={stockType === "salida" ? "default" : "outline"} className={stockType === "salida" ? "bg-red-600 hover:bg-red-700 flex-1" : "flex-1"} onClick={() => setStockType("salida")}>Salida</Button>
            </div>
            <div className="space-y-1.5"><Label>Cantidad</Label><Input type="number" min={1} value={stockQty} onChange={e => setStockQty(parseInt(e.target.value) || 1)} /></div>
            <div className="space-y-1.5"><Label>Motivo</Label><Input placeholder="Motivo del ajuste..." value={stockReason} onChange={e => setStockReason(e.target.value)} /></div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setDialog(null)}>Cancelar</Button>
              <Button className="flex-1 bg-orange-600 hover:bg-orange-700" onClick={() => stockMut.mutate()}>Confirmar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
