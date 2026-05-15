import { Router } from "express";
import { db, categoriesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: Router = Router();

router.get("/categories", async (req, res): Promise<void> => {
  const cats = await db.select().from(categoriesTable);
  res.json(cats);
});

router.post("/categories", async (req, res): Promise<void> => {
  const { name, description } = req.body;
  if (!name) { res.status(400).json({ error: "Name required" }); return; }
  const [cat] = await db.insert(categoriesTable).values({ name, description }).returning();
  res.status(201).json(cat);
});

router.patch("/categories/:id", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
  const [cat] = await db.update(categoriesTable).set(req.body).where(eq(categoriesTable.id, id)).returning();
  if (!cat) { res.status(404).json({ error: "Not found" }); return; }
  res.json(cat);
});

router.delete("/categories/:id", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
  await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
  res.sendStatus(204);
});

export default router;
