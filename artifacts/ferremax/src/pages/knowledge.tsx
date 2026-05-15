import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Plus, BookOpen, Edit, Trash2, Search, Bot } from "lucide-react";
import { apiFetch, formatDate } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const categories = ["Información General", "Políticas", "Precios y Descuentos", "Productos", "Servicio al Cliente", "Técnico"];
const catColors: Record<string, string> = {
  "Información General": "bg-blue-100 text-blue-700",
  "Políticas": "bg-purple-100 text-purple-700",
  "Precios y Descuentos": "bg-green-100 text-green-700",
  "Productos": "bg-orange-100 text-orange-700",
  "Servicio al Cliente": "bg-teal-100 text-teal-700",
  "Técnico": "bg-gray-100 text-gray-700",
};

export default function KnowledgePage() {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [dialog, setDialog] = useState<"create" | "edit" | null>(null);
  const [selected, setSelected] = useState<any>(null);
  const { toast } = useToast();
  const qc = useQueryClient();
  const { register, handleSubmit, reset, setValue, formState: { isSubmitting } } = useForm<any>();
  const aiForm = useForm<any>();

  const { data: items = [] } = useQuery({
    queryKey: ["knowledge"],
    queryFn: () => apiFetch<any[]>("/knowledge"),
  });

  const { data: config } = useQuery({
    queryKey: ["ai-config"],
    queryFn: () => apiFetch<any>("/ai/config"),
  });

  const updateConfigMut = useMutation({
    mutationFn: (data: any) => apiFetch("/ai/config", { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ai-config"] });
      toast({ title: "Configuración guardada", description: "El asistente ha sido actualizado." });
    },
  });

  const filtered = items.filter((i: any) =>
    (catFilter === "all" || i.category === catFilter) &&
    (!search || i.title.toLowerCase().includes(search.toLowerCase()) || i.content.toLowerCase().includes(search.toLowerCase()))
  );

  const createMut = useMutation({
    mutationFn: (data: any) => apiFetch("/knowledge", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["knowledge"] }); setDialog(null); reset(); toast({ title: "Artículo creado" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateMut = useMutation({
    mutationFn: (data: any) => apiFetch(`/knowledge/${selected.id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["knowledge"] }); setDialog(null); reset(); toast({ title: "Artículo actualizado" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => apiFetch(`/knowledge/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["knowledge"] }); toast({ title: "Artículo eliminado" }); },
  });

  const openEdit = (item: any) => { setSelected(item); reset(item); setDialog("edit"); };
  const onSubmit = (data: any) => { if (dialog === "edit") updateMut.mutate(data); else createMut.mutate(data); };
  const onConfigSubmit = (data: any) => updateConfigMut.mutate(data);

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuración IA</h1>
          <p className="text-sm text-gray-500">Personalidad, motor y base de conocimientos de Andrea</p>
        </div>
      </div>

      {/* AI Assistant Personality & Motor */}
      <Card className="border-orange-100 shadow-sm overflow-hidden">
        <div className="bg-orange-50/50 px-5 py-3 border-b border-orange-100 flex items-center gap-2">
          <Bot size={18} className="text-orange-600" />
          <h2 className="font-semibold text-orange-900">Personalidad y Motor del Asistente</h2>
        </div>
        <CardContent className="p-5">
          <form onSubmit={aiForm.handleSubmit(onConfigSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Personalidad (Prompt del Sistema)</Label>
              <textarea 
                {...aiForm.register("systemPrompt")} 
                defaultValue={config?.systemPrompt || "Hola, soy Andrea, tu asistente virtual profesional de Materiales Torrecillas. Soy amable, experta en ferretería y construcción, y estoy aquí para ayudarte de manera eficiente. Siempre saludo cordialmente, soy muy educada y proporciono recomendaciones precisas basadas en las necesidades del cliente y nuestra base de conocimiento."} 
                rows={4} 
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Describe cómo debe comportarse Andrea..."
              />
              <p className="text-[10px] text-gray-400 italic">Describe el tono: amable, profesional, atento, etc.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>API Key (Groq)</Label>
                <Input type="password" {...aiForm.register("apiKey")} defaultValue={config?.apiKey || ""} placeholder="gsk_..." />
              </div>
              <div className="space-y-1.5">
                <Label>Modelo</Label>
                <Input {...aiForm.register("model")} defaultValue={config?.model || "llama-3.3-70b-versatile"} />
              </div>
              <div className="flex items-end">
                <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700" disabled={updateConfigMut.isPending}>
                  {updateConfigMut.isPending ? "Guardando..." : "Guardar Configuración"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="border-t border-gray-100 pt-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Base de Conocimiento Manual</h2>
            <p className="text-sm text-gray-500">Reglas, horarios y políticas específicas</p>
          </div>
          <Button onClick={() => { reset({}); setDialog("create"); }} variant="outline" className="border-orange-200 text-orange-700 hover:bg-orange-50 gap-2">
            <Plus size={16} /> Nuevo artículo
          </Button>
        </div>

        <div className="flex gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <Input placeholder="Buscar en la base de conocimiento..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={catFilter} onValueChange={setCatFilter}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item: any) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center">
                    <BookOpen size={16} className="text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    <Badge className={`text-xs ${catColors[item.category] || "bg-gray-100 text-gray-700"}`}>{item.category}</Badge>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openEdit(item)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={14} /></button>
                  <button onClick={() => deleteMut.mutate(item.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{item.content}</p>
            </CardContent>
          </Card>
        ))}
        {!filtered.length && (
          <div className="col-span-2 text-center py-16 text-gray-400">
            <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
            <p>No hay artículos en la base de conocimiento</p>
          </div>
        )}
      </div>

      <Dialog open={!!dialog} onOpenChange={() => setDialog(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{dialog === "edit" ? "Editar artículo" : "Nuevo artículo"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5"><Label>Título *</Label><Input {...register("title", { required: true })} /></div>
            <div className="space-y-1.5">
              <Label>Categoría *</Label>
              <Select defaultValue={selected?.category || categories[0]} onValueChange={v => setValue("category", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Contenido *</Label>
              <textarea {...register("content", { required: true })} rows={6} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="Escribe el contenido del artículo..." />
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setDialog(null)}>Cancelar</Button>
              <Button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-700" disabled={isSubmitting}>
                {dialog === "edit" ? "Actualizar" : "Crear artículo"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
