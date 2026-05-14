import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Plus, Edit, Trash2, UserCog, Shield, Check, X } from "lucide-react";
import { apiFetch, formatDate } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

const roles = ["Super Admin", "Administrador", "Vendedor", "Soporte", "Solo Lectura"];
const roleColors: Record<string, string> = {
  "Super Admin": "bg-red-100 text-red-700",
  "Administrador": "bg-purple-100 text-purple-700",
  "Vendedor": "bg-blue-100 text-blue-700",
  "Soporte": "bg-teal-100 text-teal-700",
  "Solo Lectura": "bg-gray-100 text-gray-700",
};

export default function UsersPage() {
  const [dialog, setDialog] = useState<"create" | "edit" | null>(null);
  const [selected, setSelected] = useState<any>(null);
  const { toast } = useToast();
  const qc = useQueryClient();
  const { register, handleSubmit, reset, setValue, formState: { isSubmitting } } = useForm<any>();

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => apiFetch<any[]>("/users"),
  });

  const createMut = useMutation({
    mutationFn: (data: any) => apiFetch("/users", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["users"] }); setDialog(null); reset(); toast({ title: "Usuario creado" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateMut = useMutation({
    mutationFn: (data: any) => apiFetch(`/users/${selected.id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["users"] }); setDialog(null); reset(); toast({ title: "Usuario actualizado" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => apiFetch(`/users/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["users"] }); toast({ title: "Usuario eliminado" }); },
  });

  const toggleActive = (user: any) => {
    updateMut.mutate({ active: !user.active });
    setSelected(user);
  };

  const openEdit = (u: any) => { setSelected(u); reset(u); setDialog("edit"); };
  const onSubmit = (data: any) => { if (dialog === "edit") updateMut.mutate(data); else createMut.mutate(data); };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuarios del sistema</h1>
          <p className="text-sm text-gray-500">{users.filter((u: any) => u.active).length} activos de {users.length}</p>
        </div>
        <Button onClick={() => { reset({}); setDialog("create"); }} className="bg-orange-600 hover:bg-orange-700 gap-2">
          <Plus size={16} /> Nuevo usuario
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>{["Nombre", "Correo", "Rol", "Estado", "Creado", "Acciones"].map(h => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u: any) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                      <UserCog size={14} className="text-orange-600" />
                    </div>
                    <span className="font-medium">{u.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500">{u.email}</td>
                <td className="px-4 py-3"><Badge className={`text-xs ${roleColors[u.role] || "bg-gray-100 text-gray-700"}`}>{u.role}</Badge></td>
                <td className="px-4 py-3">
                  <Switch
                    checked={u.active}
                    onCheckedChange={() => {
                      setSelected(u);
                      updateMut.mutate({ active: !u.active });
                    }}
                  />
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(u.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(u)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={14} /></button>
                    <button onClick={() => deleteMut.mutate(u.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!users.length && <div className="text-center py-12 text-gray-400">No hay usuarios registrados</div>}
      </div>

      <Dialog open={!!dialog} onOpenChange={() => setDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{dialog === "edit" ? "Editar usuario" : "Nuevo usuario"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5"><Label>Nombre *</Label><Input {...register("name", { required: true })} /></div>
            <div className="space-y-1.5"><Label>Correo *</Label><Input type="email" {...register("email", { required: true })} /></div>
            {dialog === "create" && (
              <div className="space-y-1.5"><Label>Contraseña *</Label><Input type="password" {...register("password", { required: true })} /></div>
            )}
            <div className="space-y-1.5">
              <Label>Rol *</Label>
              <Select defaultValue={selected?.role || "Vendedor"} onValueChange={v => setValue("role", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{roles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setDialog(null)}>Cancelar</Button>
              <Button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-700" disabled={isSubmitting}>
                {dialog === "edit" ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
