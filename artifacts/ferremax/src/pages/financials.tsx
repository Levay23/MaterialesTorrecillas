import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Wallet, ArrowDownCircle, ArrowUpCircle, Search, DollarSign, Calendar } from "lucide-react";
import { apiFetch, formatCOP, formatDate } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendiente", color: "bg-yellow-100 text-yellow-700" },
  partial: { label: "Parcial", color: "bg-blue-100 text-blue-700" },
  paid: { label: "Pagado", color: "bg-green-100 text-green-700" },
  overdue: { label: "Vencido", color: "bg-red-100 text-red-700" },
};

export default function FinancialsPage() {
  const [activeTab, setActiveTab] = useState("receivable");
  const [paymentDialog, setPaymentDialog] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ["accounts", activeTab],
    queryFn: () => apiFetch<any[]>(`/accounts?type=${activeTab}`),
  });

  const payMut = useMutation({
    mutationFn: (data: any) => apiFetch("/payments", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ["accounts"] }); 
      setPaymentDialog(null); 
      setPaymentAmount("");
      toast({ title: "Pago registrado exitosamente" }); 
    },
  });

  const handlePayment = () => {
    if (!paymentAmount || isNaN(Number(paymentAmount))) return;
    payMut.mutate({
      accountId: paymentDialog.id,
      amount: paymentAmount,
      paymentMethod: "cash", // default for now
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finanzas</h1>
          <p className="text-sm text-gray-500">Gestión de cuentas por cobrar y por pagar</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="receivable" className="gap-2"><ArrowDownCircle size={16} /> Cuentas por Cobrar</TabsTrigger>
          <TabsTrigger value="payable" className="gap-2"><ArrowUpCircle size={16} /> Cuentas por Pagar</TabsTrigger>
        </TabsList>

        <div className="mt-5 space-y-4">
          {isLoading ? (
            <div className="text-center py-12 text-gray-400">Cargando...</div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                  <tr>
                    <th className="px-4 py-3">Referencia</th>
                    <th className="px-4 py-3">Monto Total</th>
                    <th className="px-4 py-3">Saldo Pendiente</th>
                    <th className="px-4 py-3">Vencimiento</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {accounts.map((a: any) => (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">#ACC-{a.id}</td>
                      <td className="px-4 py-3">{formatCOP(a.amount)}</td>
                      <td className="px-4 py-3 font-semibold text-orange-600">{formatCOP(a.balance)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400" />
                          {formatDate(a.dueDate)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={statusLabels[a.status]?.color}>{statusLabels[a.status]?.label}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {a.status !== "paid" && (
                          <Button size="sm" variant="outline" className="text-orange-600 border-orange-200 hover:bg-orange-50" onClick={() => setPaymentDialog(a)}>
                            <DollarSign size={14} className="mr-1" /> Abonar
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!accounts.length && (
                <div className="text-center py-16 text-gray-400 bg-white">
                  <Wallet size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No hay cuentas registradas en esta sección</p>
                </div>
              )}
            </div>
          )}
        </div>
      </Tabs>

      <Dialog open={!!paymentDialog} onOpenChange={() => setPaymentDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Pago / Abono</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 flex justify-between">
              <span className="text-sm text-orange-700">Saldo Pendiente:</span>
              <span className="font-bold text-orange-900">{paymentDialog && formatCOP(paymentDialog.balance)}</span>
            </div>
            <div className="space-y-2">
              <Label>Monto a pagar</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <Input 
                  type="number" 
                  className="pl-7" 
                  placeholder="0.00" 
                  value={paymentAmount} 
                  onChange={e => setPaymentAmount(e.target.value)} 
                />
              </div>
            </div>
            <Button className="w-full bg-orange-600 hover:bg-orange-700" onClick={handlePayment} disabled={payMut.isPending}>
              Confirmar Pago
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
