import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, Send, Wifi, WifiOff, QrCode, User, ArrowLeft, RefreshCw, Power } from "lucide-react";
import { apiFetch, formatDateTime } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function WhatsAppPage() {
  const [selectedConvo, setSelectedConvo] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [showChat, setShowChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: status, refetch: refetchStatus } = useQuery({
    queryKey: ["whatsapp-status"],
    queryFn: () => apiFetch<any>("/whatsapp/status"),
    refetchInterval: (query) => {
      const s = query.state.data as any;
      if (!s?.connected && s?.status === "connecting") return 2000;
      if (!s?.connected) return 5000;
      return 10000;
    },
  });

  const { data: convos = [] } = useQuery({
    queryKey: ["whatsapp-conversations"],
    queryFn: () => apiFetch<any[]>("/whatsapp/conversations"),
    refetchInterval: status?.connected ? 5000 : 15000,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["whatsapp-messages", selectedConvo?.id],
    queryFn: () => apiFetch<any[]>(`/whatsapp/conversations/${selectedConvo.id}/messages`),
    enabled: !!selectedConvo,
    refetchInterval: 4000,
  });

  const connectMut = useMutation({
    mutationFn: () => apiFetch("/whatsapp/connect", { method: "POST" }),
    onSuccess: () => {
      toast({ title: "Iniciando conexión...", description: "Escanea el código QR con tu WhatsApp" });
      refetchStatus();
    },
  });

  const disconnectMut = useMutation({
    mutationFn: () => apiFetch("/whatsapp/disconnect", { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["whatsapp-status"] });
      toast({ title: "WhatsApp desconectado" });
    },
  });

  const sendMut = useMutation({
    mutationFn: (content: string) =>
      apiFetch(`/whatsapp/conversations/${selectedConvo.id}/messages`, {
        method: "POST",
        body: JSON.stringify({ content }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["whatsapp-messages", selectedConvo?.id] });
      qc.invalidateQueries({ queryKey: ["whatsapp-conversations"] });
      setMessage("");
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!message.trim() || !selectedConvo) return;
    sendMut.mutate(message.trim());
  };

  const openConvo = (c: any) => {
    setSelectedConvo(c);
    setShowChat(true);
  };

  const isConnecting = status?.status === "connecting";
  const isConnected = status?.connected;
  const hasQR = !!status?.qr;

  return (
    <div className="h-full flex flex-col space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">WhatsApp CRM</h1>
        <div className="flex items-center gap-2 flex-wrap">
          {isConnected ? (
            <>
              <Badge className="bg-green-100 text-green-700 gap-1.5 px-3">
                <Wifi size={12} /> Conectado — {status.phone}
              </Badge>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => disconnectMut.mutate()}
                disabled={disconnectMut.isPending}
              >
                <Power size={14} className="mr-1" /> Desconectar
              </Button>
            </>
          ) : (
            <>
              <Badge className={`gap-1.5 px-3 ${isConnecting ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"}`}>
                {isConnecting ? <RefreshCw size={12} className="animate-spin" /> : <WifiOff size={12} />}
                {isConnecting ? "Conectando..." : "Desconectado"}
              </Badge>
              {!isConnecting && (
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 gap-1.5"
                  onClick={() => connectMut.mutate()}
                  disabled={connectMut.isPending}
                >
                  <Power size={14} /> Conectar WhatsApp
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* QR Code panel */}
      {!isConnected && (
        <Card className="border-dashed border-2 border-gray-200">
          <CardContent className="p-5 md:p-8">
            {hasQR ? (
              <div className="flex flex-col md:flex-row items-center gap-6">
                <img src={status.qr} alt="QR WhatsApp" className="w-48 h-48 md:w-56 md:h-56 rounded-xl border shadow-sm" />
                <div className="text-center md:text-left">
                  <h3 className="font-semibold text-gray-900 mb-2 text-lg">Escanea el código QR</h3>
                  <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside text-left">
                    <li>Abre WhatsApp en tu teléfono</li>
                    <li>Toca los 3 puntos ≡ → Dispositivos vinculados</li>
                    <li>Toca <strong>Vincular un dispositivo</strong></li>
                    <li>Apunta la cámara al código QR</li>
                  </ol>
                  <p className="text-xs text-gray-400 mt-3">El código se actualiza automáticamente</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <QrCode size={28} className="text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Conectar WhatsApp</h3>
                <p className="text-sm text-gray-500 mb-4 max-w-sm mx-auto">
                  {isConnecting
                    ? "Generando código QR, espera un momento..."
                    : "Haz clic en \"Conectar WhatsApp\" para vincular tu número y recibir mensajes en tiempo real."}
                </p>
                {isConnecting && (
                  <div className="flex items-center justify-center gap-2 text-yellow-600">
                    <RefreshCw size={16} className="animate-spin" />
                    <span className="text-sm">Iniciando sesión de WhatsApp...</span>
                  </div>
                )}
                {!isConnecting && (
                  <Button
                    className="bg-green-600 hover:bg-green-700 gap-2"
                    onClick={() => connectMut.mutate()}
                    disabled={connectMut.isPending}
                  >
                    <Power size={16} /> Iniciar conexión
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Chat area */}
      <div className="flex-1 min-h-0">
        {/* Mobile: show either list or chat */}
        <div className="md:hidden h-full">
          {showChat && selectedConvo ? (
            <ChatPanel
              convo={selectedConvo}
              messages={messages}
              message={message}
              setMessage={setMessage}
              onSend={handleSend}
              isPending={sendMut.isPending}
              messagesEndRef={messagesEndRef}
              onBack={() => { setShowChat(false); setSelectedConvo(null); }}
            />
          ) : (
            <ConversationList
              convos={convos}
              selectedConvo={selectedConvo}
              onSelect={openConvo}
              isMobile
            />
          )}
        </div>

        {/* Desktop: side by side */}
        <div className="hidden md:grid grid-cols-3 gap-4 h-full" style={{ minHeight: 400 }}>
          <ConversationList
            convos={convos}
            selectedConvo={selectedConvo}
            onSelect={openConvo}
          />
          <Card className="col-span-2 overflow-hidden flex flex-col">
            {selectedConvo ? (
              <ChatPanel
                convo={selectedConvo}
                messages={messages}
                message={message}
                setMessage={setMessage}
                onSend={handleSend}
                isPending={sendMut.isPending}
                messagesEndRef={messagesEndRef}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <MessageCircle size={48} className="mx-auto mb-3 opacity-20" />
                  <p>Selecciona una conversación</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function ConversationList({ convos, selectedConvo, onSelect, isMobile }: any) {
  return (
    <Card className={`overflow-hidden flex flex-col ${isMobile ? "h-full" : ""}`}>
      <CardHeader className="pb-3 border-b shrink-0">
        <CardTitle className="text-sm">Conversaciones ({convos.length})</CardTitle>
      </CardHeader>
      <div className="flex-1 overflow-y-auto">
        {convos.map((c: any) => (
          <div
            key={c.id}
            onClick={() => onSelect(c)}
            className={`flex items-center gap-3 p-3 cursor-pointer border-b border-gray-50 hover:bg-gray-50 transition-colors ${selectedConvo?.id === c.id ? "bg-orange-50" : ""}`}
          >
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <User size={16} className="text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium truncate">{c.name}</p>
                {c.unreadCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center shrink-0 ml-1">
                    {c.unreadCount}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 truncate">{c.phone}</p>
              {c.lastMessage && <p className="text-xs text-gray-500 truncate">{c.lastMessage}</p>}
            </div>
          </div>
        ))}
        {!convos.length && (
          <div className="text-center py-12 text-gray-400 text-sm px-4">
            <MessageCircle size={32} className="mx-auto mb-2 opacity-30" />
            Sin conversaciones aún
          </div>
        )}
      </div>
    </Card>
  );
}

function ChatPanel({ convo, messages, message, setMessage, onSend, isPending, messagesEndRef, onBack }: any) {
  return (
    <>
      <CardHeader className="pb-3 border-b shrink-0">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack} className="mr-1 -ml-2 p-1">
              <ArrowLeft size={18} />
            </Button>
          )}
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <User size={14} className="text-green-600" />
          </div>
          <div>
            <p className="font-semibold text-sm">{convo.name}</p>
            <p className="text-xs text-gray-400">{convo.phone}</p>
          </div>
        </div>
      </CardHeader>
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 bg-gray-50">
        {messages.map((m: any) => (
          <div key={m.id} className={`flex ${m.fromMe ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] md:max-w-[70%] px-3 py-2 rounded-2xl text-sm ${
                m.fromMe
                  ? "bg-green-500 text-white rounded-tr-sm"
                  : "bg-white text-gray-800 shadow-sm rounded-tl-sm"
              }`}
            >
              <p>{m.content}</p>
              <p className={`text-xs mt-1 ${m.fromMe ? "text-green-100" : "text-gray-400"}`}>
                {formatDateTime(m.createdAt)}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
        {!messages.length && (
          <div className="text-center py-10 text-gray-400 text-sm">Sin mensajes en esta conversación</div>
        )}
      </div>
      <div className="p-3 border-t flex gap-2 shrink-0">
        <Input
          placeholder="Escribe un mensaje..."
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={e => e.key === "Enter" && onSend()}
          className="flex-1"
        />
        <Button onClick={onSend} className="bg-green-600 hover:bg-green-700" disabled={isPending}>
          <Send size={15} />
        </Button>
      </div>
    </>
  );
}
