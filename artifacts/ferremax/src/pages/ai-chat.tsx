import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Bot, Send, Settings, User, Zap, Key } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Message { role: "user" | "bot"; content: string; }

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", content: "¡Hola! Soy la asistente virtual de Materiales Torrecillas. ¿En qué puedo ayudarte hoy?" }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { data: config } = useQuery({
    queryKey: ["ai-config"],
    queryFn: () => apiFetch<any>("/ai/config"),
  });

  const chatMut = useMutation({
    mutationFn: (message: string) => apiFetch<any>("/ai/chat", { method: "POST", body: JSON.stringify({ message }) }),
    onSuccess: (data) => {
      setMessages(prev => [...prev, { role: "bot", content: data.response }]);
    },
    onError: () => {
      setMessages(prev => [...prev, { role: "bot", content: "Lo siento, no pude procesar tu solicitud." }]);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const msg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: msg }]);
    chatMut.mutate(msg);
  };

  const quickQuestions = [
    "¿Qué productos tienen disponibles?",
    "¿Cuál es el horario de atención?",
    "¿Tienen domicilios?",
    "¿Hacen precios especiales para constructoras?",
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Asistente IA</h1>
          <p className="text-sm text-gray-500">Consulta el inventario y resuelve dudas en tiempo real</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <Card className="col-span-3 flex flex-col shadow-sm border-gray-100" style={{ height: "calc(100vh - 200px)" }}>
          <CardHeader className="pb-3 border-b shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                <Bot size={18} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm">Andrea — Asistente Virtual</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <p className="text-xs text-gray-400">En línea · {config?.model || "llama-3.3-70b-versatile"}</p>
                </div>
              </div>
            </div>
          </CardHeader>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "bot" && (
                  <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center shrink-0 mt-1">
                    <Bot size={13} className="text-orange-600" />
                  </div>
                )}
                <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-orange-600 text-white rounded-tr-sm"
                    : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-sm"
                }`}>
                  {m.content}
                </div>
                {m.role === "user" && (
                  <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center shrink-0 mt-1">
                    <User size={13} className="text-gray-600" />
                  </div>
                )}
              </div>
            ))}
            {chatMut.isPending && (
              <div className="flex gap-3 justify-start">
                <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                  <Bot size={13} className="text-orange-600" />
                </div>
                <div className="bg-white shadow-sm border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-2 h-2 rounded-full bg-orange-300 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t shrink-0 flex gap-2 bg-white">
            <Input
              placeholder="Escribe tu mensaje..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              className="flex-1 border-gray-200 focus:ring-orange-500"
            />
            <Button onClick={sendMessage} disabled={chatMut.isPending || !input.trim()} className="bg-orange-600 hover:bg-orange-700">
              <Send size={15} />
            </Button>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="shadow-sm border-gray-100">
            <CardHeader className="pb-3 border-b"><CardTitle className="text-sm flex items-center gap-2"><Zap size={14} className="text-amber-500" />Preguntas rápidas</CardTitle></CardHeader>
            <CardContent className="p-3 space-y-2">
              {quickQuestions.map((q, i) => (
                <button key={i} onClick={() => { setInput(q); }} className="w-full text-left text-xs p-2.5 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors">
                  {q}
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-100">
            <CardHeader className="pb-3 border-b"><CardTitle className="text-sm">Andrea — Inteligencia Artificial</CardTitle></CardHeader>
            <CardContent className="p-4 space-y-4 text-sm">
              <div className="flex flex-col gap-1">
                <span className="text-gray-500 text-xs">Base de conocimiento</span>
                <span className="font-medium">Vínculo directo con Inventario</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={config?.apiKey ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-red-100 text-red-700 hover:bg-red-100"}>
                  {config?.apiKey ? "Motor Activo" : "Motor Inactivo"}
                </Badge>
                {config?.model && <Badge variant="outline" className="text-[10px]">{config.model}</Badge>}
              </div>
              <p className="text-[11px] text-gray-400 leading-tight">
                Andrea consulta automáticamente los productos, precios y stock para dar respuestas precisas.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

