import { Router } from "express";
import { db, productsTable, categoriesTable, suppliersTable, activityLogTable } from "@workspace/db";
import { eq, ilike, or, sql } from "drizzle-orm";

const router: Router = Router();

function formatProduct(p: any, catName?: string | null, supName?: string | null) {
  return {
    ...p,
    purchasePrice: Number(p.cost || 0),
    salePrice: Number(p.price || 0),
    wholesalePrice: p.wholesalePrice ? Number(p.wholesalePrice) : null,
    categoryName: catName ?? null,
    supplierName: supName ?? null,
  };
}

router.get("/products", async (req, res): Promise<void> => {
  const { search, categoryId, lowStock, limit = "200", offset = "0" } = req.query as Record<string, string>;
  const result = await db.execute(sql`
    SELECT p.*, c.name as category_name, s.name as supplier_name
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN suppliers s ON s.id = p.supplier_id
    WHERE 1=1
    ${search ? sql`AND (p.name ILIKE ${'%' + search + '%'} OR p.sku ILIKE ${'%' + search + '%'})` : sql``}
    ${categoryId ? sql`AND p.category_id = ${parseInt(categoryId)}` : sql``}
    ${lowStock === 'true' ? sql`AND p.stock <= p.min_stock` : sql``}
    ORDER BY p.name ASC
    LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
  `);
  res.json(result.rows.map((r: any) => ({
    id: r.id, name: r.name, sku: r.sku, barcode: r.barcode, description: r.description,
    purchasePrice: Number(r.cost || 0), salePrice: Number(r.price || 0),
    wholesalePrice: r.wholesale_price ? Number(r.wholesale_price) : null,
    categoryId: r.category_id, categoryName: r.category_name,
    brand: r.brand, supplierId: r.supplier_id, supplierName: r.supplier_name,
    stock: r.stock, minStock: r.min_stock, imageUrl: r.image_url, createdAt: r.created_at,
  })));
});

router.post("/products", async (req, res): Promise<void> => {
  const { name, sku, salePrice, purchasePrice, stock, minStock, ...rest } = req.body;
  if (!name || !sku || !salePrice) { res.status(400).json({ error: "Name, sku, salePrice required" }); return; }
  const [p] = await db.insert(productsTable).values({ 
    name, 
    sku, 
    price: String(salePrice), 
    cost: String(purchasePrice || 0),
    stock: String(stock || 0), 
    minStock: String(minStock || 5), 
    ...rest 
  }).returning();
  await db.insert(activityLogTable).values({ type: "product", description: `Nuevo producto: ${name}`, entityId: p.id });
  res.status(201).json(formatProduct(p));
});

router.get("/products/:id", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
  const result = await db.execute(sql`
    SELECT p.*, c.name as category_name, s.name as supplier_name
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN suppliers s ON s.id = p.supplier_id
    WHERE p.id = ${id}
  `);
  if (!result.rows.length) { res.status(404).json({ error: "Not found" }); return; }
  const r: any = result.rows[0];
  res.json({
    id: r.id, name: r.name, sku: r.sku, barcode: r.barcode, description: r.description,
    purchasePrice: Number(r.cost || 0), salePrice: Number(r.price || 0),
    wholesalePrice: r.wholesale_price ? Number(r.wholesale_price) : null,
    categoryId: r.category_id, categoryName: r.category_name,
    brand: r.brand, supplierId: r.supplier_id, supplierName: r.supplier_name,
    stock: r.stock, minStock: r.min_stock, imageUrl: r.image_url, createdAt: r.created_at,
  });
});

router.patch("/products/:id", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
  const updates: Record<string, any> = { ...req.body };
  if (updates.salePrice !== undefined) { updates.price = String(updates.salePrice); delete updates.salePrice; }
  if (updates.purchasePrice !== undefined) { updates.cost = String(updates.purchasePrice); delete updates.purchasePrice; }
  if (updates.wholesalePrice !== undefined) updates.wholesalePrice = String(updates.wholesalePrice);
  const [p] = await db.update(productsTable).set(updates).where(eq(productsTable.id, id)).returning();
  if (!p) { res.status(404).json({ error: "Not found" }); return; }
  res.json(formatProduct(p));
});

router.delete("/products/:id", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
  await db.delete(productsTable).where(eq(productsTable.id, id));
  res.sendStatus(204);
});

router.post("/products/:id/adjust-stock", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
  const { quantity, type, reason } = req.body;
  const [p] = await db.select().from(productsTable).where(eq(productsTable.id, id));
  if (!p) { res.status(404).json({ error: "Not found" }); return; }
  const delta = type === "entrada" ? Number(quantity) : -Number(quantity);
  const currentStock = Number(p.stock || 0);
  const newStock = String(Math.max(0, currentStock + delta));
  const [updated] = await db.update(productsTable).set({ stock: newStock }).where(eq(productsTable.id, id)).returning();
  await db.insert(activityLogTable).values({ type: "stock", description: `${type === "entrada" ? "Entrada" : "Salida"} de stock: ${p.name} (${reason})`, entityId: id });
  res.json(formatProduct(updated));
});

export default router;
