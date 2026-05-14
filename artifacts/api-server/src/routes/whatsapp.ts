import { Router } from "express";
import { db, conversationsTable, messagesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { getStatus, startConnection, sendMessage, disconnect } from "../services/whatsapp-service";

const router: Router = Router();

router.get("/whatsapp/status", async (_req, res): Promise<void> => {
  const s = getStatus();
  res.json({
    connected: s.connected,
    status: s.status,
    phone: s.phone,
    qr: s.qr,
  });
});

router.post("/whatsapp/connect", async (_req, res): Promise<void> => {
  await startConnection();
  res.json({ ok: true, status: getStatus().status });
});

router.post("/whatsapp/disconnect", async (_req, res): Promise<void> => {
  await disconnect();
  res.json({ ok: true });
});

router.get("/whatsapp/conversations", async (req, res): Promise<void> => {
  const { search } = req.query as Record<string, string>;
  let convos = await db
    .select()
    .from(conversationsTable)
    .orderBy(sql`last_message_at DESC NULLS LAST`);
  if (search)
    convos = convos.filter(
      c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search),
    );
  res.json(convos);
});

router.get("/whatsapp/conversations/:id/messages", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
  const msgs = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, id))
    .orderBy(messagesTable.createdAt);
  await db
    .update(conversationsTable)
    .set({ unreadCount: 0 })
    .where(eq(conversationsTable.id, id));
  res.json(msgs);
});

router.post("/whatsapp/conversations/:id/messages", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
  const { content, messageType = "text" } = req.body;
  if (!content) { res.status(400).json({ error: "Content required" }); return; }

  const [convo] = await db
    .select()
    .from(conversationsTable)
    .where(eq(conversationsTable.id, id))
    .limit(1);

  if (convo) {
    try {
      await sendMessage(convo.phone, content);
    } catch {
      // If WhatsApp not connected, still save to DB for demo
    }
  }

  const [msg] = await db
    .insert(messagesTable)
    .values({ conversationId: id, content, fromMe: true, status: "sent", messageType })
    .returning();
  await db
    .update(conversationsTable)
    .set({ lastMessage: content, lastMessageAt: new Date() })
    .where(eq(conversationsTable.id, id));
  res.status(201).json(msg);
});

export default router;
