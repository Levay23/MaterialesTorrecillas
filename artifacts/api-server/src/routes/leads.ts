import { Router } from "express";
import { db, leadsTable } from "@workspace/db";
import { eq, like, or } from "drizzle-orm";

const router: Router = Router();

router.get("/leads", async (req, res): Promise<void> => {
  const { search, status } = req.query as Record<string, string>;
  let query = db.select().from(leadsTable).$dynamic();
  
  const conditions = [];
  if (search) conditions.push(or(like(leadsTable.name, `%${search}%`), like(leadsTable.phone, `%${search}%`)));
  if (status) conditions.push(eq(leadsTable.status, status));
  
  if (conditions.length > 0) {
    query = query.where(conditions.length === 1 ? conditions[0] : or(...conditions));
  }
  
  const leads = await query.orderBy(leadsTable.createdAt);
  res.json(leads);
});

router.post("/leads", async (req, res): Promise<void> => {
  const [lead] = await db.insert(leadsTable).values(req.body).returning();
  res.status(201).json(lead);
});

router.get("/leads/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const [lead] = await db.select().from(leadsTable).where(eq(leadsTable.id, id));
  if (!lead) { res.status(404).json({ error: "Not found" }); return; }
  res.json(lead);
});

router.patch("/leads/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const [lead] = await db.update(leadsTable).set(req.body).where(eq(leadsTable.id, id)).returning();
  if (!lead) { res.status(404).json({ error: "Not found" }); return; }
  res.json(lead);
});

router.delete("/leads/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  await db.delete(leadsTable).where(eq(leadsTable.id, id));
  res.sendStatus(204);
});

export default router;
