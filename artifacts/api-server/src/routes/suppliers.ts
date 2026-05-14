import { Router } from "express";
import { db, suppliersTable } from "@workspace/db";
import { eq, ilike } from "drizzle-orm";

const router: Router = Router();

router.get("/suppliers", async (req, res): Promise<void> => {
  const { search } = req.query as Record<string, string>;
  let suppliers = await db.select().from(suppliersTable).orderBy(suppliersTable.name);
  if (search) suppliers = suppliers.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
  res.json(suppliers);
});

router.post("/suppliers", async (req, res): Promise<void> => {
  const { name, phone, ...rest } = req.body;
  if (!name || !phone) { res.status(400).json({ error: "Name and phone required" }); return; }
  const [s] = await db.insert(suppliersTable).values({ name, phone, ...rest }).returning();
  res.status(201).json(s);
});

router.get("/suppliers/:id", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
  const [s] = await db.select().from(suppliersTable).where(eq(suppliersTable.id, id));
  if (!s) { res.status(404).json({ error: "Not found" }); return; }
  res.json(s);
});

router.patch("/suppliers/:id", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
  const [s] = await db.update(suppliersTable).set(req.body).where(eq(suppliersTable.id, id)).returning();
  if (!s) { res.status(404).json({ error: "Not found" }); return; }
  res.json(s);
});

router.delete("/suppliers/:id", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
  await db.delete(suppliersTable).where(eq(suppliersTable.id, id));
  res.sendStatus(204);
});

export default router;
