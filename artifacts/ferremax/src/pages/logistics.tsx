import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Truck, Package, MapPin, Search, Plus, CheckCircle, Clock } from "lucide-react";
import { apiFetch, formatDate } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendiente", color: "bg-gray-100 text-gray-700" },
  shipped: { label: "En Camino", color: "bg-blue-100 text-blue-700" },
  delivered: { label: "Entregado", color: "bg-green-100 text-green-700" },
  cancelled: { label: "Cancelado", color: "bg-red-100 text-red-700" },
};

export default function LogisticsPage() {
  const [activeTab, setActiveTab] = useState("remisiones");
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: shipments = [], isLoading } = useQuery({
    queryKey: ["shipments", activeTab],
    queryFn: () => apiFetch<any[]>(`/shipments?type=${activeTab === "remisiones" ? "remision" : "guia"}`),
  });

  const updateStatusMut = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => 
      apiFetch(`/shipments/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["shipments"] }); toast({ title: "Estado actualizado" }); },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Logística</h1>
          <p className="text-sm text-gray-500">Gestión de entregas y guías de embarque</p>
        </div>
        <Button className="bg-orange-600 hover:bg-orange-700 gap-2">
          <Plus size={16} /> Nueva entrega
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="remisiones">Remisiones</TabsTrigger>
          <TabsTrigger value="guias">Guías de Embarque</TabsTrigger>
        </TabsList>

        <div className="mt-5 space-y-4">
          {isLoading ? (
            <div className="text-center py-12 text-gray-400">Cargando...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {shipments.map((s: any) => (
                <Card key={s.id} className="overflow-hidden">
                  <CardHeader className="bg-gray-50 p-4 border-b">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        {activeTab === "remisiones" ? <Package size={18} className="text-orange-500" /> : <Truck size={18} className="text-blue-500" />}
                        <span className="font-bold text-sm">#SHP-{s.id}</span>
                      </div>
                      <Badge className={statusLabels[s.status]?.color}>{statusLabels[s.status]?.label}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-400 uppercase font-semibold">Destino</p>
                      <div className="flex items-start gap-2 text-sm text-gray-700">
                        <MapPin size={14} className="mt-0.5 shrink-0" />
                        <span>{s.destinationAddress || "Dirección no especificada"}</span>
                      </div>
                    </div>
                    
                    {s.carrier && (
                      <div className="space-y-1">
                        <p className="text-xs text-gray-400 uppercase font-semibold">Transportista</p>
                        <p className="text-sm text-gray-700">{s.carrier} {s.trackingNumber && `(${s.trackingNumber})`}</p>
                      </div>
                    )}

                    <div className="pt-2 flex justify-between gap-2">
                      {s.status === "pending" && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 text-xs"
                          onClick={() => updateStatusMut.mutate({ id: s.id, status: "shipped" })}
                        >
                          <Truck size={12} className="mr-1" /> Marcar Enviado
                        </Button>
                      )}
                      {s.status === "shipped" && (
                        <Button 
                          size="sm" 
                          className="flex-1 text-xs bg-green-600 hover:bg-green-700"
                          onClick={() => updateStatusMut.mutate({ id: s.id, status: "delivered" })}
                        >
                          <CheckCircle size={12} className="mr-1" /> Entregado
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {!shipments.length && (
                <div className="col-span-3 text-center py-16 text-gray-400">
                  <Truck size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No hay {activeTab} registradas</p>
                </div>
              )}
            </div>
          )}
        </div>
      </Tabs>
    </div>
  );
}
