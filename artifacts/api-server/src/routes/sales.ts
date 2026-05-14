import { Router } from "express";
import { db, salesTable, customersTable, productsTable, activityLogTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router: Router = Router();

function formatSale(s: any) {
  return {
    ...s,
    subtotal: Number(s.subtotal || 0),
    discount: s.discount ? Number(s.discount) : null,
    tax: s.tax ? Number(s.tax) : null,
    total: Number(s.total || 0),
  };
}

router.get("/sales", async (req, res): Promise<void> => {
  const { status, customerId, from, to, limit = "100", offset = "0" } = req.query as Record<string, string>;
  const conditions: string[] = [];
  if (status) conditions.push(`s.status = '${status}'`);
  if (customerId) conditions.push(`s.customer_id = ${parseInt(customerId)}`);
  if (from) conditions.push(`s.created_at >= '${from}'`);
  if (to) conditions.push(`s.created_at <= '${to}'`);
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const result = await db.execute(sql.raw(`SELECT * FROM sales ${where} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`));
  res.json(result.rows.map((s: any) => ({
    id: s.id, customerId: s.customer_id, customerName: s.customer_name,
    items: s.items, subtotal: Number(s.subtotal || 0),
    discount: s.discount ? Number(s.discount) : null, tax: s.tax ? Number(s.tax) : null,
    total: Number(s.total), status: s.status, paymentMethod: s.payment_method,
    notes: s.notes, createdAt: s.created_at,
  })));
});

router.post("/sales", async (req, res): Promise<void> => {
  const { customerId, items, discount = 0, tax = 0, paymentMethod = "efectivo", notes } = req.body;
  if (!items?.length) { res.status(400).json({ error: "Items required" }); return; }
  let customerName: string | null = null;
  if (customerId) {
    const [c] = await db.select().from(customersTable).where(eq(customersTable.id, customerId));
    if (c) customerName = c.name;
  }
  const enrichedItems = await Promise.all(items.map(async (item: any) => {
    const [p] = await db.select().from(productsTable).where(eq(productsTable.id, item.productId));
    const total = item.quantity * item.unitPrice - (item.discount || 0);
    // Reduce stock
    if (p) await db.update(productsTable).set({ stock: Math.max(0, p.stock - item.quantity) }).where(eq(productsTable.id, item.productId));
    return { productId: item.productId, productName: p?.name || "Producto", quantity: item.quantity, unitPrice: item.unitPrice, discount: item.discount || 0, total };
  }));
  const subtotal = enrichedItems.reduce((s, i) => s + i.total, 0);
  const total = subtotal - Number(discount) + Number(tax);
  const [sale] = await db.insert(salesTable).values({
    customerId: customerId || null, customerName, items: enrichedItems,
    subtotal: String(subtotal), discount: String(discount), tax: String(tax),
    total: String(total), status: "completed", paymentMethod, notes,
  }).returning();
  // Update customer total purchases
  if (customerId) await db.execute(sql`UPDATE customers SET total_purchases = COALESCE(total_purchases::numeric, 0) + ${total} WHERE id = ${customerId}`);
  await db.insert(activityLogTable).values({ type: "sale", description: `Nueva venta: $${total.toLocaleString("es-CO")}${customerName ? ` - ${customerName}` : ""}`, entityId: sale.id });
  res.status(201).json(formatSale(sale));
});

router.get("/sales/:id", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
  const [sale] = await db.select().from(salesTable).where(eq(salesTable.id, id));
  if (!sale) { res.status(404).json({ error: "Not found" }); return; }
  res.json(formatSale(sale));
});

router.patch("/sales/:id", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
  const [sale] = await db.update(salesTable).set(req.body).where(eq(salesTable.id, id)).returning();
  if (!sale) { res.status(404).json({ error: "Not found" }); return; }
  res.json(formatSale(sale));
});

export default router;
