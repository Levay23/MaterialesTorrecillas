import path from "node:path";
import fs from "node:fs/promises";
import { db, conversationsTable, messagesTable, aiConfigTable, knowledgeItemsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";

let sock: any = null;
let qrBase64: string | null = null;
let connectionStatus: "disconnected" | "connecting" | "connected" = "disconnected";
let connectedPhone: string | null = null;
let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

const SESSION_DIR = path.resolve(process.cwd(), "wa-session");

export function getStatus() {
  return {
    connected: connectionStatus === "connected",
    status: connectionStatus,
    phone: connectedPhone,
    qr: qrBase64,
  };
}

export async function startConnection() {
  if (connectionStatus === "connecting" || connectionStatus === "connected") return;
  connectionStatus = "connecting";
  qrBase64 = null;

  try {
    const baileys = await import("@whiskeysockets/baileys");
    const makeWASocket = baileys.default ?? (baileys as any).makeWASocket ?? baileys;
    const { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = baileys as any;
    const { Boom } = await import("@hapi/boom");
    const QRCode = (await import("qrcode")) as any;

    await fs.mkdir(SESSION_DIR, { recursive: true });
    const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);

    let version = [2, 3000, 1015920];
    try {
      const v = await fetchLatestBaileysVersion();
      version = v.version;
    } catch {}

    const silentLogger = {
      level: "silent",
      trace: () => {},
      debug: () => {},
      info: () => {},
      warn: () => {},
      error: () => {},
      fatal: () => {},
      child: () => silentLogger,
    } as any;

    sock = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: false,
      logger: silentLogger,
      browser: ["Materiales Torrecillas CRM", "Chrome", "120.0"],
    });

    sock.ev.on("connection.update", async (update: any) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        try {
          qrBase64 = await QRCode.toDataURL(qr);
        } catch (e) {
          logger.error({ e }, "QR generation error");
        }
      }

      if (connection === "close") {
        sock = null;
        const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
        const loggedOut = statusCode === DisconnectReason.loggedOut;
        logger.info({ statusCode, loggedOut }, "WhatsApp connection closed");

        if (loggedOut) {
          connectionStatus = "disconnected";
          connectedPhone = null;
          qrBase64 = null;
          await fs.rm(SESSION_DIR, { recursive: true, force: true }).catch(() => {});
        } else {
          connectionStatus = "disconnected";
          qrBase64 = null;
          if (reconnectTimeout) clearTimeout(reconnectTimeout);
          reconnectTimeout = setTimeout(() => startConnection(), 3000);
        }
      } else if (connection === "open") {
        connectionStatus = "connected";
        qrBase64 = null;
        connectedPhone = sock?.user?.id?.split(":")?.[0] ?? sock?.user?.id ?? null;
        logger.info({ phone: connectedPhone }, "WhatsApp connected");
      }
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("messages.upsert", async ({ messages, type }: any) => {
      if (type !== "notify") return;
      for (const msg of messages) {
        if (msg.key.fromMe || !msg.message) continue;
        const jid = msg.key.remoteJid;
        if (!jid || jid.endsWith("@g.us")) continue;

        const text =
          msg.message.conversation ||
          msg.message.extendedTextMessage?.text ||
          msg.message.imageMessage?.caption ||
          "";
        if (!text.trim()) continue;

        const phone = jid.split("@")[0];
        const pushName = msg.pushName || phone;

        try {
          let [convo] = await db
            .select()
            .from(conversationsTable)
            .where(eq(conversationsTable.phone, phone))
            .limit(1);

          if (!convo) {
            const [c] = await db
              .insert(conversationsTable)
              .values({ phone, name: pushName, lastMessage: text, lastMessageAt: new Date(), unreadCount: 1, status: "open" })
              .returning();
            convo = c;
          } else {
            await db
              .update(conversationsTable)
              .set({ lastMessage: text, lastMessageAt: new Date(), unreadCount: (convo.unreadCount || 0) + 1 })
              .where(eq(conversationsTable.id, convo.id));
          }

          await db.insert(messagesTable).values({
            conversationId: convo.id,
            content: text,
            fromMe: false,
            status: "received",
            messageType: "text",
          });

          await handleAutoReply(convo.id, jid, text);
        } catch (err) {
          logger.error({ err }, "Error processing incoming message");
        }
      }
    });
  } catch (err) {
    logger.error({ err }, "WhatsApp init error");
    connectionStatus = "disconnected";
  }
}

async function handleAutoReply(convoId: number, jid: string, userMessage: string) {
  try {
    const [config] = await db.select().from(aiConfigTable).limit(1);
    if (!config?.autoReplyEnabled || !config?.apiKey) return;

    const knowledge = await db.select().from(knowledgeItemsTable).limit(20);
    const knowledgeContext = knowledge.map(k => `${k.title}: ${k.content}`).join("\n");
    const systemPrompt =
      config.systemPrompt ||
      "Eres una asesora profesional de ferretería Materiales Torrecillas. Responde de forma concisa y útil. Máximo 3 oraciones.";

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.apiKey}` },
      body: JSON.stringify({
        model: config.model || "llama3-8b-8192",
        messages: [
          { role: "system", content: `${systemPrompt}\n\nBase de conocimiento:\n${knowledgeContext}` },
          { role: "user", content: userMessage },
        ],
        temperature: Number(config.temperature) || 0.7,
        max_tokens: 300,
      }),
    });

    const data = (await response.json()) as any;
    const reply = data.choices?.[0]?.message?.content?.trim();
    if (!reply || !sock) return;

    await sock.sendMessage(jid, { text: reply });

    await db.insert(messagesTable).values({
      conversationId: convoId,
      content: reply,
      fromMe: true,
      status: "sent",
      messageType: "text",
    });

    await db
      .update(conversationsTable)
      .set({ lastMessage: reply, lastMessageAt: new Date() })
      .where(eq(conversationsTable.id, convoId));
  } catch (err) {
    logger.error({ err }, "Auto-reply error");
  }
}

export async function sendMessage(phone: string, text: string) {
  if (!sock || connectionStatus !== "connected") throw new Error("WhatsApp no conectado");
  const jid = phone.includes("@") ? phone : `${phone}@s.whatsapp.net`;
  await sock.sendMessage(jid, { text });
}

export async function disconnect() {
  if (reconnectTimeout) clearTimeout(reconnectTimeout);
  try {
    if (sock) await sock.logout();
  } catch {}
  sock = null;
  connectionStatus = "disconnected";
  connectedPhone = null;
  qrBase64 = null;
  await fs.rm(SESSION_DIR, { recursive: true, force: true }).catch(() => {});
}

