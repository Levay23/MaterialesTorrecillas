import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Search, Plus, Edit, Trash2, Phone, Mail, User, Info } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const statusLabels: Record<string, { label: string; color: string }> = {
  new: { label: "Nuevo", color: "bg-blue-100 text-blue-700" },
  contacted: { label: "Contactado", color: "bg-yellow-100 text-yellow-700" },
  quoted: { label: "Cotizado", color: "bg-purple-100 text-purple-700" },
  converted: { label: "Convertido", color: "bg-green-100 text-green-700" },
  lost: { label: "Perdido", color: "bg-red-100 text-red-700" },
};

export default function LeadsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialog, setDialog] = useState<"create" | "edit" | null>(null);
  const [selected, setSelected] = useState<any>(null);
  const { toast } = useToast();
  const qc = useQueryClient();
  const { register, handleSubmit, reset, setValue, formState: { isSubmitting } } = useForm<any>();

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["leads", search, statusFilter],
    queryFn: () => apiFetch<any[]>(`/leads?search=${search}&${statusFilter !== "all" ? `status=${statusFilter}` : ""}`),
  });

  const createMut = useMutation({
    mutationFn: (data: any) => apiFetch("/leads", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["leads"] }); setDialog(null); reset(); toast({ title: "Prospecto creado" }); },
  });

  const updateMut = useMutation({
    mutationFn: (data: any) => apiFetch(`/leads/${selected.id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["leads"] }); setDialog(null); reset(); toast({ title: "Prospecto actualizado" }); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => apiFetch(`/leads/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["leads"] }); toast({ title: "Prospecto eliminado" }); },
  });

  const openEdit = (l: any) => {
    setSelected(l);
    reset(l);
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
          <h1 className="text-2xl font-bold text-gray-900">Prospectos</h1>
          <p className="text-sm text-gray-500">{leads.length} prospectos en seguimiento</p>
        </div>
        <Button onClick={() => { reset({ status: "new" }); setDialog("create"); }} className="bg-orange-600 hover:bg-orange-700 gap-2">
          <Plus size={16} /> Nuevo prospecto
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <Input placeholder="Buscar por nombre o teléfono..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="new">Nuevo</SelectItem>
            <SelectItem value="contacted">Contactado</SelectItem>
            <SelectItem value="quoted">Cotizado</SelectItem>
            <SelectItem value="converted">Convertido</SelectItem>
            <SelectItem value="lost">Perdido</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Cargando...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {leads.map((l: any) => (
            <Card key={l.id} className="hover:shadow-md transition-shadow border-l-4 border-l-orange-500">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                      <User size={18} className="text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{l.name}</h3>
                      <Badge className={`text-xs ${statusLabels[l.status]?.color}`}>{statusLabels[l.status]?.label}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(l)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={14} /></button>
                    <button onClick={() => deleteMut.mutate(l.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                  </div>
                </div>
                <div className="space-y-1.5 text-sm text-gray-500">
                  {l.phone && <div className="flex items-center gap-2"><Phone size={13} /><span>{l.phone}</span></div>}
                  {l.email && <div className="flex items-center gap-2"><Mail size={13} /><span className="truncate">{l.email}</span></div>}
                  {l.interest && <div className="flex items-center gap-2"><Info size={13} /><span>Interés: {l.interest}</span></div>}
                </div>
              </CardContent>
            </Card>
          ))}
          {!leads.length && (
            <div className="col-span-3 text-center py-16 text-gray-400">
              <User size={40} className="mx-auto mb-3 opacity-30" />
              <p>No hay prospectos registrados</p>
            </div>
          )}
        </div>
      )}

      <Dialog open={!!dialog} onOpenChange={() => setDialog(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{dialog === "edit" ? "Editar prospecto" : "Nuevo prospecto"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label>Nombre completo *</Label>
                <Input {...register("name", { required: true })} placeholder="Nombre del prospecto" />
              </div>
              <div className="space-y-1.5">
                <Label>Teléfono *</Label>
                <Input {...register("phone", { required: true })} placeholder="3001234567" />
              </div>
              <div className="space-y-1.5">
                <Label>Estado</Label>
                <Select defaultValue={selected?.status || "new"} onValueChange={v => setValue("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Nuevo</SelectItem>
                    <SelectItem value="contacted">Contactado</SelectItem>
                    <SelectItem value="quoted">Cotizado</SelectItem>
                    <SelectItem value="converted">Convertido</SelectItem>
                    <SelectItem value="lost">Perdido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Interés (Productos/Servicios)</Label>
                <Input {...register("interest")} placeholder="¿Qué está buscando?" />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Notas</Label>
                <Input {...register("notes")} placeholder="Observaciones adicionales" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setDialog(null)}>Cancelar</Button>
              <Button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-700" disabled={isSubmitting}>
                {dialog === "edit" ? "Actualizar" : "Crear prospecto"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
