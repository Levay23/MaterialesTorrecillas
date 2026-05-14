import { Router } from "express";
import { db, quotesTable, salesTable, customersTable, productsTable, activityLogTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router: Router = Router();

function formatQuote(q: any) {
  return {
    ...q,
    subtotal: Number(q.subtotal || 0),
    discount: q.discount ? Number(q.discount) : null,
    tax: q.tax ? Number(q.tax) : null,
    total: Number(q.total || 0),
    validUntil: q.validUntil instanceof Date ? q.validUntil.toISOString() : q.validUntil,
  };
}

router.get("/quotes", async (req, res): Promise<void> => {
  const { status, customerId } = req.query as Record<string, string>;
  const conditions: string[] = [];
  if (status) conditions.push(`status = '${status}'`);
  if (customerId) conditions.push(`customer_id = ${parseInt(customerId)}`);
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const result = await db.execute(sql.raw(`SELECT * FROM quotes ${where} ORDER BY created_at DESC`));
  res.json(result.rows.map((q: any) => ({
    id: q.id, customerId: q.customer_id, customerName: q.customer_name,
    items: q.items, subtotal: Number(q.subtotal || 0),
    discount: q.discount ? Number(q.discount) : null, tax: q.tax ? Number(q.tax) : null,
    total: Number(q.total), status: q.status, notes: q.notes,
    validUntil: q.valid_until, createdAt: q.created_at,
  })));
});

router.post("/quotes", async (req, res): Promise<void> => {
  const { customerId, items, discount = 0, tax = 0, notes, validUntil } = req.body;
  if (!items?.length) { res.status(400).json({ error: "Items required" }); return; }
  let customerName: string | null = null;
  if (customerId) {
    const [c] = await db.select().from(customersTable).where(eq(customersTable.id, customerId));
    if (c) customerName = c.name;
  }
  const enrichedItems = await Promise.all(items.map(async (item: any) => {
    const [p] = await db.select().from(productsTable).where(eq(productsTable.id, item.productId));
    const total = item.quantity * item.unitPrice - (item.discount || 0);
    return { productId: item.productId, productName: p?.name || "Producto", quantity: item.quantity, unitPrice: item.unitPrice, discount: item.discount || 0, total };
  }));
  const subtotal = enrichedItems.reduce((s, i) => s + i.total, 0);
  const total = subtotal - Number(discount) + Number(tax);
  const [quote] = await db.insert(quotesTable).values({
    customerId: customerId || null, customerName, items: enrichedItems,
    subtotal: String(subtotal), discount: String(discount), tax: String(tax),
    total: String(total), status: "pending", notes,
    validUntil: new Date(validUntil || Date.now() + 7 * 24 * 60 * 60 * 1000),
  }).returning();
  await db.insert(activityLogTable).values({ type: "quote", description: `Nueva cotización: $${total.toLocaleString("es-CO")}`, entityId: quote.id });
  res.status(201).json(formatQuote(quote));
});

router.get("/quotes/:id", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
  const [q] = await db.select().from(quotesTable).where(eq(quotesTable.id, id));
  if (!q) { res.status(404).json({ error: "Not found" }); return; }
  res.json(formatQuote(q));
});

router.patch("/quotes/:id", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
  const [q] = await db.update(quotesTable).set(req.body).where(eq(quotesTable.id, id)).returning();
  if (!q) { res.status(404).json({ error: "Not found" }); return; }
  res.json(formatQuote(q));
});

router.post("/quotes/:id/convert", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
  const [q] = await db.select().from(quotesTable).where(eq(quotesTable.id, id));
  if (!q) { res.status(404).json({ error: "Not found" }); return; }
  const [sale] = await db.insert(salesTable).values({
    customerId: q.customerId, customerName: q.customerName, items: q.items as any,
    subtotal: q.subtotal, discount: q.discount, tax: q.tax, total: q.total,
    status: "completed", paymentMethod: "efectivo", notes: q.notes,
  }).returning();
  await db.update(quotesTable).set({ status: "approved" }).where(eq(quotesTable.id, id));
  res.status(201).json({ id: sale.id, customerId: sale.customerId, customerName: sale.customerName, items: sale.items, subtotal: Number(sale.subtotal), discount: sale.discount ? Number(sale.discount) : null, tax: sale.tax ? Number(sale.tax) : null, total: Number(sale.total), status: sale.status, paymentMethod: sale.paymentMethod, notes: sale.notes, createdAt: sale.createdAt });
});

export default router;
