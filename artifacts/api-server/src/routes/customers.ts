import { Router } from "express";
import { db, customersTable, salesTable, activityLogTable } from "@workspace/db";
import { eq, like, or, sql } from "drizzle-orm";

const router: Router = Router();

router.get("/customers", async (req, res): Promise<void> => {
  const { search, type, limit = "100", offset = "0" } = req.query as Record<string, string>;
  let query = db.select().from(customersTable).$dynamic();
  const conditions = [];
  if (search) conditions.push(or(like(customersTable.name, `%${search}%`), like(customersTable.phone, `%${search}%`), like(customersTable.email!, `%${search}%`)));
  if (type) conditions.push(eq(customersTable.type, type));
  if (conditions.length) query = query.where(sql`${conditions[0]}`);
  const customers = await query.limit(parseInt(limit)).offset(parseInt(offset));
  res.json(customers.map(c => ({ ...c, totalPurchases: c.totalPurchases ? Number(c.totalPurchases) : 0 })));
});

router.post("/customers", async (req, res): Promise<void> => {
  const { name, phone, type = "regular", ...rest } = req.body;
  if (!name || !phone) { res.status(400).json({ error: "Name and phone required" }); return; }
  const [customer] = await db.insert(customersTable).values({ name, phone, type, ...rest }).returning();
  await db.insert(activityLogTable).values({ type: "customer", description: `Nuevo cliente: ${name}`, entityId: customer.id });
  res.status(201).json({ ...customer, totalPurchases: Number(customer.totalPurchases || 0) });
});

router.get("/customers/:id", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
  const [customer] = await db.select().from(customersTable).where(eq(customersTable.id, id));
  if (!customer) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...customer, totalPurchases: Number(customer.totalPurchases || 0) });
});

router.patch("/customers/:id", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
  const [customer] = await db.update(customersTable).set(req.body).where(eq(customersTable.id, id)).returning();
  if (!customer) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...customer, totalPurchases: Number(customer.totalPurchases || 0) });
});

router.delete("/customers/:id", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
  await db.delete(customersTable).where(eq(customersTable.id, id));
  res.sendStatus(204);
});

router.get("/customers/:id/purchases", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
  const sales = await db.select().from(salesTable).where(eq(salesTable.customerId, id)).orderBy(sql`created_at DESC`);
  res.json(sales.map(s => ({
    ...s,
    subtotal: Number(s.subtotal), discount: s.discount ? Number(s.discount) : null,
    tax: s.tax ? Number(s.tax) : null, total: Number(s.total),
  })));
});

export default router;
