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
  const [configDialog, setConfigDialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const qc = useQueryClient();
  const { register, handleSubmit, reset, setValue } = useForm<any>();

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

  const configMut = useMutation({
    mutationFn: (data: any) => apiFetch("/ai/config", { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ai-config"] }); setConfigDialog(false); toast({ title: "Configuración guardada" }); },
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

  const onConfigSubmit = (data: any) => {
    const payload: any = { ...data };
    if (payload.temperature) payload.temperature = parseFloat(payload.temperature);
    if (payload.maxTokens) payload.maxTokens = parseInt(payload.maxTokens);
    configMut.mutate(payload);
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
          <p className="text-sm text-gray-500">Powered by Groq — {config?.apiKey ? "Configurado" : "Sin API key"}</p>
        </div>
        <Button variant="outline" onClick={() => { reset(config); setConfigDialog(true); }} className="gap-2">
          <Settings size={16} /> Configurar
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <Card className="col-span-3 flex flex-col" style={{ height: "calc(100vh - 260px)" }}>
          <CardHeader className="pb-3 border-b shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                <Bot size={18} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm">Asistente Materiales Torrecillas</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <p className="text-xs text-gray-400">En línea · {config?.model === "llama3-8b-8192" ? "llama-3.3-70b-versatile" : (config?.model || "llama-3.3-70b-versatile")}</p>
                </div>
              </div>
            </div>
          </CardHeader>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "bot" && (
                  <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center shrink-0 mt-1">
                    <Bot size={13} className="text-purple-600" />
                  </div>
                )}
                <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-orange-600 text-white rounded-tr-sm"
                    : "bg-white text-gray-800 shadow-sm rounded-tl-sm"
                }`}>
                  {m.content}
                </div>
                {m.role === "user" && (
                  <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center shrink-0 mt-1">
                    <User size={13} className="text-orange-600" />
                  </div>
                )}
              </div>
            ))}
            {chatMut.isPending && (
              <div className="flex gap-3 justify-start">
                <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                  <Bot size={13} className="text-purple-600" />
                </div>
                <div className="bg-white shadow-sm rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t shrink-0 flex gap-2">
            <Input
              placeholder="Escribe tu mensaje..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              className="flex-1"
            />
            <Button onClick={sendMessage} disabled={chatMut.isPending || !input.trim()} className="bg-purple-600 hover:bg-purple-700">
              <Send size={15} />
            </Button>
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Zap size={14} className="text-yellow-500" />Preguntas rápidas</CardTitle></CardHeader>
            <CardContent className="p-3 space-y-2">
              {quickQuestions.map((q, i) => (
                <button key={i} onClick={() => { setInput(q); }} className="w-full text-left text-xs p-2.5 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors">
                  {q}
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Estado IA</CardTitle></CardHeader>
            <CardContent className="p-3 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Modelo</span><span className="font-medium text-xs">{config?.model}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Temperatura</span><span className="font-medium">{config?.temperature}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Max tokens</span><span className="font-medium">{config?.maxTokens}</span></div>
              <div className="flex justify-between">
                <span className="text-gray-500">API Key</span>
                <Badge className={config?.apiKey ? "bg-green-100 text-green-700 text-xs" : "bg-red-100 text-red-700 text-xs"}>
                  {config?.apiKey ? "Configurada" : "No configurada"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={configDialog} onOpenChange={setConfigDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Configuración de IA</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onConfigSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-2"><Key size={13} />API Key de Groq</Label>
              <Input type="password" placeholder="gsk_..." {...register("apiKey")} />
              <p className="text-xs text-gray-400">Obtén tu API key en <a href="https://console.groq.com" target="_blank" className="text-blue-600 underline">console.groq.com</a></p>
            </div>
            <div className="space-y-1.5">
              <Label>Modelo</Label>
              <Input {...register("model")} defaultValue="llama-3.3-70b-versatile" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Temperatura (0-2)</Label><Input type="number" step="0.1" min="0" max="2" {...register("temperature")} /></div>
              <div className="space-y-1.5"><Label>Max Tokens</Label><Input type="number" {...register("maxTokens")} /></div>
            </div>
            <div className="space-y-1.5">
              <Label>Prompt del sistema</Label>
              <textarea {...register("systemPrompt")} rows={4} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setConfigDialog(false)}>Cancelar</Button>
              <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700">Guardar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

