import { Router } from "express";
import { db, purchasesTable, suppliersTable, productsTable, activityLogTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router: Router = Router();

function formatPurchase(p: any) {
  return { ...p, total: Number(p.total || 0) };
}

router.get("/purchases", async (req, res): Promise<void> => {
  const { status, supplierId } = req.query as Record<string, string>;
  const conditions: string[] = [];
  if (status) conditions.push(`status = '${status}'`);
  if (supplierId) conditions.push(`supplier_id = ${parseInt(supplierId)}`);
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const result = await db.execute(sql.raw(`SELECT * FROM purchases ${where} ORDER BY created_at DESC`));
  res.json(result.rows.map((p: any) => ({
    id: p.id, supplierId: p.supplier_id, supplierName: p.supplier_name,
    items: p.items, total: Number(p.total), status: p.status, notes: p.notes, createdAt: p.created_at,
  })));
});

router.post("/purchases", async (req, res): Promise<void> => {
  const { supplierId, items, notes } = req.body;
  if (!supplierId || !items?.length) { res.status(400).json({ error: "Supplier and items required" }); return; }
  const [supplier] = await db.select().from(suppliersTable).where(eq(suppliersTable.id, supplierId));
  if (!supplier) { res.status(404).json({ error: "Supplier not found" }); return; }
  const enrichedItems = await Promise.all(items.map(async (item: any) => {
    const [p] = await db.select().from(productsTable).where(eq(productsTable.id, item.productId));
    return { productId: item.productId, productName: p?.name || "Producto", quantity: item.quantity, unitPrice: item.unitPrice, discount: 0, total: item.quantity * item.unitPrice };
  }));
  const total = enrichedItems.reduce((s, i) => s + i.total, 0);
  const [purchase] = await db.insert(purchasesTable).values({
    supplierId, supplierName: supplier.name, items: enrichedItems, total: String(total), status: "pending", notes,
  }).returning();
  await db.insert(activityLogTable).values({ type: "purchase", description: `Orden de compra a ${supplier.name}: $${total.toLocaleString("es-CO")}`, entityId: purchase.id });
  res.status(201).json(formatPurchase(purchase));
});

router.get("/purchases/:id", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
  const [p] = await db.select().from(purchasesTable).where(eq(purchasesTable.id, id));
  if (!p) { res.status(404).json({ error: "Not found" }); return; }
  res.json(formatPurchase(p));
});

router.patch("/purchases/:id", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
  const [p] = await db.update(purchasesTable).set(req.body).where(eq(purchasesTable.id, id)).returning();
  if (!p) { res.status(404).json({ error: "Not found" }); return; }
  // If received, increase stock
  if (req.body.status === "received" && p.items) {
    for (const item of p.items as any[]) {
      await db.execute(sql`UPDATE products SET stock = stock + ${item.quantity} WHERE id = ${item.productId}`);
    }
  }
  res.json(formatPurchase(p));
});

export default router;
