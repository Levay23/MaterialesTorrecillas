import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Search, Plus, Edit, Trash2, Phone, Mail, MapPin, User } from "lucide-react";
import { apiFetch, formatCOP, formatDate } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const typeLabels: Record<string, { label: string; color: string }> = {
  regular: { label: "Regular", color: "bg-blue-100 text-blue-700" },
  mayorista: { label: "Mayorista", color: "bg-purple-100 text-purple-700" },
  vip: { label: "VIP", color: "bg-amber-100 text-amber-700" },
  credito: { label: "Crédito", color: "bg-green-100 text-green-700" },
};

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dialog, setDialog] = useState<"create" | "edit" | null>(null);
  const [selected, setSelected] = useState<any>(null);
  const { toast } = useToast();
  const qc = useQueryClient();
  const { register, handleSubmit, reset, setValue, formState: { isSubmitting } } = useForm<any>();

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["customers", search, typeFilter],
    queryFn: () => apiFetch<any[]>(`/customers?search=${search}&${typeFilter !== "all" ? `type=${typeFilter}` : ""}`),
  });

  const createMut = useMutation({
    mutationFn: (data: any) => apiFetch("/customers", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["customers"] }); setDialog(null); reset(); toast({ title: "Cliente creado" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateMut = useMutation({
    mutationFn: (data: any) => apiFetch(`/customers/${selected.id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["customers"] }); setDialog(null); reset(); toast({ title: "Cliente actualizado" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => apiFetch(`/customers/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["customers"] }); toast({ title: "Cliente eliminado" }); },
  });

  const openEdit = (c: any) => {
    setSelected(c);
    reset(c);
    setDialog("edit");
  };

  const onSubmit = (data: any) => {
    if (dialog === "edit") updateMut.mutate(data);
    else createMut.mutate(data);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-sm text-gray-500">{customers.length} registros</p>
        </div>
        <Button onClick={() => { reset({}); setDialog("create"); }} className="bg-orange-600 hover:bg-orange-700 gap-2">
          <Plus size={16} /> Nuevo cliente
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <Input placeholder="Buscar por nombre, teléfono..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            <SelectItem value="regular">Regular</SelectItem>
            <SelectItem value="mayorista">Mayorista</SelectItem>
            <SelectItem value="vip">VIP</SelectItem>
            <SelectItem value="credito">Crédito</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Cargando...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {customers.map((c: any) => (
            <Card key={c.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                      <User size={18} className="text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{c.name}</h3>
                      <Badge className={`text-xs ${typeLabels[c.type]?.color}`}>{typeLabels[c.type]?.label}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(c)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={14} /></button>
                    <button onClick={() => deleteMut.mutate(c.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                  </div>
                </div>
                <div className="space-y-1.5 text-sm text-gray-500">
                  {c.phone && <div className="flex items-center gap-2"><Phone size={13} /><span>{c.phone}</span></div>}
                  {c.email && <div className="flex items-center gap-2"><Mail size={13} /><span className="truncate">{c.email}</span></div>}
                  {c.city && <div className="flex items-center gap-2"><MapPin size={13} /><span>{c.city}</span></div>}
                </div>
                {c.totalPurchases > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-500">
                    <span>Total compras</span>
                    <span className="font-semibold text-gray-700">{formatCOP(c.totalPurchases)}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {!customers.length && (
            <div className="col-span-3 text-center py-16 text-gray-400">
              <User size={40} className="mx-auto mb-3 opacity-30" />
              <p>No hay clientes registrados</p>
            </div>
          )}
        </div>
      )}

      <Dialog open={!!dialog} onOpenChange={() => setDialog(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{dialog === "edit" ? "Editar cliente" : "Nuevo cliente"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label>Nombre completo *</Label>
                <Input {...register("name", { required: true })} placeholder="Juan García" />
              </div>
              <div className="space-y-1.5">
                <Label>Teléfono *</Label>
                <Input {...register("phone", { required: true })} placeholder="3001234567" />
              </div>
              <div className="space-y-1.5">
                <Label>Tipo de cliente</Label>
                <Select defaultValue={selected?.type || "regular"} onValueChange={v => setValue("type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="regular">Regular</SelectItem>
                    <SelectItem value="mayorista">Mayorista</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                    <SelectItem value="credito">Crédito</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Correo electrónico</Label>
                <Input {...register("email")} type="email" placeholder="correo@ejemplo.com" />
              </div>
              <div className="space-y-1.5">
                <Label>Ciudad</Label>
                <Input {...register("city")} placeholder="Ciudad" />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Dirección</Label>
                <Input {...register("address")} placeholder="Cra 45 #80-23" />
              </div>
              <div className="space-y-1.5">
                <Label>Cédula / NIT</Label>
                <Input {...register("document")} placeholder="1234567890" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setDialog(null)}>Cancelar</Button>
              <Button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-700" disabled={isSubmitting}>
                {dialog === "edit" ? "Actualizar" : "Crear cliente"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
