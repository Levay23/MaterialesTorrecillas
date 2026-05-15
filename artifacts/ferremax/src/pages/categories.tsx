import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Plus, Edit, Trash2, FolderTree } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function CategoriesPage() {
  const [dialog, setDialog] = useState<"create" | "edit" | null>(null);
  const [selected, setSelected] = useState<any>(null);
  const { toast } = useToast();
  const qc = useQueryClient();
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<any>();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => apiFetch<any[]>("/categories"),
  });

  const createMut = useMutation({
    mutationFn: (data: any) => apiFetch("/categories", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["categories"] }); setDialog(null); reset(); toast({ title: "Categoría creada" }); },
  });

  const updateMut = useMutation({
    mutationFn: (data: any) => apiFetch(`/categories/${selected.id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["categories"] }); setDialog(null); reset(); toast({ title: "Categoría actualizada" }); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => apiFetch(`/categories/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["categories"] }); toast({ title: "Categoría eliminada" }); },
  });

  const onSubmit = (data: any) => {
    if (dialog === "edit") updateMut.mutate(data);
    else createMut.mutate(data);
  };

  const openEdit = (c: any) => { setSelected(c); reset(c); setDialog("edit"); };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorías de Productos</h1>
          <p className="text-sm text-gray-500">Gestiona las familias de tus artículos de ferretería</p>
        </div>
        <Button onClick={() => { reset({}); setDialog("create"); }} className="bg-orange-600 hover:bg-orange-700 gap-2">
          <Plus size={16} /> Nueva categoría
        </Button>
      </div>

      {isLoading ? <div className="text-center py-12 text-gray-400">Cargando...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((c: any) => (
            <div key={c.id} className="p-5 bg-white border border-gray-200 rounded-xl flex items-center justify-between hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <FolderTree size={18} className="text-orange-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{c.name}</p>
                  <p className="text-xs text-gray-500">{c.description || "Sin descripción"}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => openEdit(c)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={16} /></button>
                <button onClick={() => deleteMut.mutate(c.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
          {!categories.length && (
            <div className="col-span-full text-center py-16 text-gray-400 bg-white border border-gray-200 border-dashed rounded-xl">
              <FolderTree size={40} className="mx-auto mb-3 opacity-30" />
              <p>No hay categorías registradas</p>
              <Button onClick={() => { reset({}); setDialog("create"); }} variant="link" className="text-orange-600 mt-2">Crear la primera</Button>
            </div>
          )}
        </div>
      )}

      <Dialog open={dialog === "create" || dialog === "edit"} onOpenChange={() => setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{dialog === "edit" ? "Editar categoría" : "Nueva categoría"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5"><Label>Nombre</Label><Input {...register("name", { required: true })} placeholder="Ej: Cementos, Herramientas, etc." /></div>
            <div className="space-y-1.5"><Label>Descripción</Label><Input {...register("description")} placeholder="Opcional" /></div>
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
