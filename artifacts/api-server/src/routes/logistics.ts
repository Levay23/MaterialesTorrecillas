import { Router } from "express";
import { db, shipmentsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: Router = Router();

router.get("/shipments", async (req, res): Promise<void> => {
  const { status, type } = req.query as Record<string, string>;
  let query = db.select().from(shipmentsTable).$dynamic();
  
  const conditions = [];
  if (status) conditions.push(eq(shipmentsTable.status, status));
  if (type) conditions.push(eq(shipmentsTable.type, type));
  
  // Basic where logic
  if (conditions.length === 1) query = query.where(conditions[0]);
  
  const shipments = await query.orderBy(shipmentsTable.createdAt);
  res.json(shipments);
});

router.post("/shipments", async (req, res): Promise<void> => {
  const [shipment] = await db.insert(shipmentsTable).values(req.body).returning();
  res.status(201).json(shipment);
});

router.patch("/shipments/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const [shipment] = await db.update(shipmentsTable).set(req.body).where(eq(shipmentsTable.id, id)).returning();
  if (!shipment) { res.status(404).json({ error: "Not found" }); return; }
  res.json(shipment);
});

export default router;
