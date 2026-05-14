import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Search, Plus, Edit, Trash2, Truck, Phone, Mail, Globe, Building } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function SuppliersPage() {
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState<"create" | "edit" | null>(null);
  const [selected, setSelected] = useState<any>(null);
  const { toast } = useToast();
  const qc = useQueryClient();
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<any>();

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ["suppliers"],
    queryFn: () => apiFetch<any[]>("/suppliers"),
  });

  const filtered = suppliers.filter((s: any) => !search || s.name.toLowerCase().includes(search.toLowerCase()));

  const createMut = useMutation({
    mutationFn: (data: any) => apiFetch("/suppliers", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["suppliers"] }); setDialog(null); reset(); toast({ title: "Proveedor creado" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateMut = useMutation({
    mutationFn: (data: any) => apiFetch(`/suppliers/${selected.id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["suppliers"] }); setDialog(null); reset(); toast({ title: "Proveedor actualizado" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => apiFetch(`/suppliers/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["suppliers"] }); toast({ title: "Proveedor eliminado" }); },
  });

  const openEdit = (s: any) => { setSelected(s); reset(s); setDialog("edit"); };
  const onSubmit = (data: any) => { if (dialog === "edit") updateMut.mutate(data); else createMut.mutate(data); };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proveedores</h1>
          <p className="text-sm text-gray-500">{suppliers.length} registrados</p>
        </div>
        <Button onClick={() => { reset({}); setDialog("create"); }} className="bg-orange-600 hover:bg-orange-700 gap-2">
          <Plus size={16} /> Nuevo proveedor
        </Button>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <Input placeholder="Buscar proveedor..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      {isLoading ? <div className="text-center py-12 text-gray-400">Cargando...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((s: any) => (
            <Card key={s.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Truck size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{s.name}</h3>
                      {s.nit && <p className="text-xs text-gray-400">NIT: {s.nit}</p>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(s)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={14} /></button>
                    <button onClick={() => deleteMut.mutate(s.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                  </div>
                </div>
                <div className="space-y-1.5 text-sm text-gray-500">
                  {s.contactName && <div className="flex items-center gap-2"><Building size={13} /><span>{s.contactName}</span></div>}
                  {s.phone && <div className="flex items-center gap-2"><Phone size={13} /><span>{s.phone}</span></div>}
                  {s.email && <div className="flex items-center gap-2"><Mail size={13} /><span className="truncate">{s.email}</span></div>}
                  {s.website && <div className="flex items-center gap-2"><Globe size={13} /><span className="truncate text-blue-600">{s.website}</span></div>}
                </div>
              </CardContent>
            </Card>
          ))}
          {!filtered.length && (
            <div className="col-span-3 text-center py-16 text-gray-400">
              <Truck size={40} className="mx-auto mb-3 opacity-30" />
              <p>No hay proveedores registrados</p>
            </div>
          )}
        </div>
      )}

      <Dialog open={!!dialog} onOpenChange={() => setDialog(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{dialog === "edit" ? "Editar proveedor" : "Nuevo proveedor"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5"><Label>Nombre empresa *</Label><Input {...register("name", { required: true })} /></div>
              <div className="space-y-1.5"><Label>Contacto</Label><Input {...register("contactName")} /></div>
              <div className="space-y-1.5"><Label>Teléfono *</Label><Input {...register("phone", { required: true })} /></div>
              <div className="space-y-1.5"><Label>Correo</Label><Input {...register("email")} type="email" /></div>
              <div className="space-y-1.5"><Label>NIT</Label><Input {...register("nit")} /></div>
              <div className="col-span-2 space-y-1.5"><Label>Dirección</Label><Input {...register("address")} /></div>
              <div className="col-span-2 space-y-1.5"><Label>Sitio web</Label><Input {...register("website")} /></div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setDialog(null)}>Cancelar</Button>
              <Button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-700" disabled={isSubmitting}>{dialog === "edit" ? "Actualizar" : "Crear"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
