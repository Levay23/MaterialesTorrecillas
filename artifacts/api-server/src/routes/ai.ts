import { Router } from "express";
import { db, aiConfigTable, knowledgeItemsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { logger } from "../lib/logger";

const router: Router = Router();

async function getOrCreateConfig() {
  const configs = await db.select().from(aiConfigTable).limit(1);
  const defaultPrompt = "Hola, soy Andrea, tu asistente virtual profesional de Materiales Torrecillas. Soy amable, experta en ferretería y construcción, y estoy aquí para ayudarte de manera eficiente. Siempre saludo cordialmente, soy muy educada y proporciono recomendaciones precisas basadas en las necesidades del cliente y nuestra base de conocimiento.";
  
  if (configs.length) {
    const config = configs[0];
    // Actualizar si hay API Key en el entorno y no en la DB
    if (process.env.GROQ_API_KEY && (!config.apiKey || config.apiKey === "***")) {
      await db.update(aiConfigTable).set({ apiKey: process.env.GROQ_API_KEY, enabled: true }).where(eq(aiConfigTable.id, config.id));
    }
    return config;
  }

  const [c] = await db.insert(aiConfigTable).values({
    model: "llama3-8b-8192",
    temperature: "0.7",
    maxTokens: 500,
    enabled: true,
    apiKey: process.env.GROQ_API_KEY || null,
    autoReplyEnabled: false,
    systemPrompt: defaultPrompt,
  }).returning();
  return c;
}

router.get("/ai/config", async (req, res): Promise<void> => {
  const config = await getOrCreateConfig();
  res.json({
    ...config,
    temperature: Number(config.temperature),
    apiKey: config.apiKey ? "***" : null,
  });
});

router.patch("/ai/config", async (req, res): Promise<void> => {
  const config = await getOrCreateConfig();
  const updates: Record<string, any> = { ...req.body };
  if (updates.temperature !== undefined) updates.temperature = String(updates.temperature);
  const [updated] = await db.update(aiConfigTable).set(updates).where(eq(aiConfigTable.id, config.id)).returning();
  res.json({ ...updated, temperature: Number(updated.temperature), apiKey: updated.apiKey ? "***" : null });
});

router.post("/ai/chat", async (req, res): Promise<void> => {
  const { message } = req.body;
  if (!message) { res.status(400).json({ error: "Message required" }); return; }
  
  const config = await getOrCreateConfig();
  
  // Fetch knowledge base for context
  const knowledge = await db.select().from(knowledgeItemsTable).limit(20);
  const knowledgeContext = knowledge.map(k => `${k.title}: ${k.content}`).join("\n");
  
  const systemPrompt = config.systemPrompt || "Eres una asesora profesional de ferretería Materiales Torrecillas. Eres amable, experta y rápida. Siempre saludas cordialmente y recomiendas productos según la necesidad del cliente.";
  const fullPrompt = `${systemPrompt}\n\nBase de conocimiento:\n${knowledgeContext}`;
  
  if (!config.apiKey || config.apiKey === "***") {
    // Demo response when no API key
    res.json({ response: `¡Hola! Soy la asistente virtual de Materiales Torrecillas. Estoy lista para ayudarte con herramientas, materiales y cotizaciones. Tu mensaje: "${message}". Para activar la IA completa, configura tu API key de Groq en Configuración > IA.` });
    return;
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${config.apiKey}` },
      body: JSON.stringify({
        model: (config.model === "llama3-8b-8192" ? "llama-3.3-70b-versatile" : config.model) || "llama-3.3-70b-versatile",
        messages: [{ role: "system", content: fullPrompt }, { role: "user", content: message }],
        temperature: Number(config.temperature) || 0.7,
        max_tokens: config.maxTokens || 500,
      }),
    });
    const data = await response.json() as any;
    res.json({ response: data.choices?.[0]?.message?.content || "Lo siento, no pude procesar tu solicitud." });
  } catch (err) {
    logger.error({ err }, "AI chat error");
    res.json({ response: "Lo siento, hubo un error al procesar tu solicitud. Por favor intenta de nuevo." });
  }
});

// Knowledge base
router.get("/knowledge", async (req, res): Promise<void> => {
  const { category } = req.query as Record<string, string>;
  let items = await db.select().from(knowledgeItemsTable).orderBy(knowledgeItemsTable.category, knowledgeItemsTable.title);
  if (category) items = items.filter(i => i.category === category);
  res.json(items);
});

router.post("/knowledge", async (req, res): Promise<void> => {
  const { title, content, category } = req.body;
  if (!title || !content || !category) { res.status(400).json({ error: "Title, content, category required" }); return; }
  const [item] = await db.insert(knowledgeItemsTable).values({ title, content, category }).returning();
  res.status(201).json(item);
});

router.patch("/knowledge/:id", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
  const [item] = await db.update(knowledgeItemsTable).set(req.body).where(eq(knowledgeItemsTable.id, id)).returning();
  if (!item) { res.status(404).json({ error: "Not found" }); return; }
  res.json(item);
});

router.delete("/knowledge/:id", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
  await db.delete(knowledgeItemsTable).where(eq(knowledgeItemsTable.id, id));
  res.sendStatus(204);
});

export default router;

