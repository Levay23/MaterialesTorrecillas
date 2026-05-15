import { Router } from "express";
import { db, activityLogTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const router: Router = Router();

function formatRow(r: any) {
  return {
    id: r.id,
    name: r.name,
    sku: r.sku || "",
    barcode: r.barcode || null,
    description: r.description || null,
    brand: r.brand || null,
    categoryId: r.category_id || null,
    categoryName: r.category_name || null,
    supplierId: r.supplier_id || null,
    supplierName: r.supplier_name || null,
    salePrice: Number(r.price || 0),
    purchasePrice: Number(r.cost || 0),
    wholesalePrice: r.wholesale_price ? Number(r.wholesale_price) : null,
    stock: r.stock,
    minStock: r.min_stock,
    unit: r.unit || "unidad",
    imageUrl: r.image_url || null,
    status: r.status || "active",
    createdAt: r.created_at,
  };
}

const PRODUCT_SELECT = sql`
  SELECT p.id, p.name, p.sku, p.barcode, p.description, p.brand,
         p.category_id, c.name as category_name,
         p.supplier_id, s.name as supplier_name,
         p.price, p.cost, p.wholesale_price,
         p.stock, p.min_stock, p.unit, p.image_url, p.status, p.created_at
  FROM products p
  LEFT JOIN categories c ON c.id = p.category_id
  LEFT JOIN suppliers s ON s.id = p.supplier_id
`;

router.get("/products", async (req, res): Promise<void> => {
  try {
    const { search, categoryId, lowStock, limit = "200", offset = "0" } = req.query as Record<string, string>;
    const result = await db.execute(sql`
      ${PRODUCT_SELECT}
      WHERE 1=1
      ${search ? sql`AND (p.name ILIKE ${'%' + search + '%'} OR p.sku ILIKE ${'%' + search + '%'})` : sql``}
      ${categoryId ? sql`AND p.category_id = ${parseInt(categoryId)}` : sql``}
      ${lowStock === 'true' ? sql`AND CAST(p.stock AS numeric) <= CAST(p.min_stock AS numeric)` : sql``}
      ORDER BY p.name ASC
      LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
    `);
    res.json(result.rows.map(formatRow));
  } catch (err: any) {
    console.error("GET /products error:", err?.message || err);
    res.status(500).json({ error: "Error al obtener productos", detail: err?.message });
  }
});

router.post("/products", async (req, res): Promise<void> => {
  try {
    const { name, sku, salePrice, purchasePrice, stock, minStock, brand, categoryId, supplierId, unit, description, imageUrl, status } = req.body;
    if (!name || !salePrice) { res.status(400).json({ error: "Name y salePrice son requeridos" }); return; }
    const result = await db.execute(sql`
      INSERT INTO products (name, sku, price, cost, stock, min_stock, brand, category_id, supplier_id, unit, description, image_url, status)
      VALUES (
        ${name}, ${sku || null}, ${String(salePrice)}, ${String(purchasePrice || 0)},
        ${String(stock || 0)}, ${String(minStock || 5)}, ${brand || null},
        ${categoryId || null}, ${supplierId || null}, ${unit || 'unidad'},
        ${description || null}, ${imageUrl || null}, ${status || 'active'}
      )
      RETURNING *
    `);
    const p = result.rows[0] as any;
    await db.insert(activityLogTable).values({ type: "product", description: `Nuevo producto: ${name}`, entityId: p.id });
    res.status(201).json(formatRow(p));
  } catch (err: any) {
    console.error("POST /products error:", err?.message || err);
    res.status(500).json({ error: "Error al crear producto", detail: err?.message });
  }
});

router.get("/products/:id", async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const result = await db.execute(sql`${PRODUCT_SELECT} WHERE p.id = ${id}`);
    if (!result.rows.length) { res.status(404).json({ error: "Not found" }); return; }
    res.json(formatRow(result.rows[0]));
  } catch (err: any) {
    res.status(500).json({ error: "Error al obtener producto", detail: err?.message });
  }
});

router.patch("/products/:id", async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const { name, sku, salePrice, purchasePrice, wholesalePrice, stock, minStock, brand, categoryId, supplierId, unit, description, imageUrl, status } = req.body;
    const setParts: any[] = [];
    if (name !== undefined) setParts.push(sql`name = ${name}`);
    if (sku !== undefined) setParts.push(sql`sku = ${sku}`);
    if (salePrice !== undefined) setParts.push(sql`price = ${String(salePrice)}`);
    if (purchasePrice !== undefined) setParts.push(sql`cost = ${String(purchasePrice)}`);
    if (wholesalePrice !== undefined) setParts.push(sql`wholesale_price = ${String(wholesalePrice)}`);
    if (stock !== undefined) setParts.push(sql`stock = ${String(stock)}`);
    if (minStock !== undefined) setParts.push(sql`min_stock = ${String(minStock)}`);
    if (brand !== undefined) setParts.push(sql`brand = ${brand}`);
    if (categoryId !== undefined) setParts.push(sql`category_id = ${categoryId}`);
    if (supplierId !== undefined) setParts.push(sql`supplier_id = ${supplierId}`);
    if (unit !== undefined) setParts.push(sql`unit = ${unit}`);
    if (description !== undefined) setParts.push(sql`description = ${description}`);
    if (imageUrl !== undefined) setParts.push(sql`image_url = ${imageUrl}`);
    if (status !== undefined) setParts.push(sql`status = ${status}`);
    if (!setParts.length) { res.status(400).json({ error: "No fields to update" }); return; }
    const setClause = setParts.reduce((acc, part, i) => i === 0 ? part : sql`${acc}, ${part}`);
    const result = await db.execute(sql`UPDATE products SET ${setClause} WHERE id = ${id} RETURNING *`);
    if (!result.rows.length) { res.status(404).json({ error: "Not found" }); return; }
    res.json(formatRow(result.rows[0]));
  } catch (err: any) {
    res.status(500).json({ error: "Error al actualizar producto", detail: err?.message });
  }
});

router.delete("/products/:id", async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    await db.execute(sql`DELETE FROM products WHERE id = ${id}`);
    res.sendStatus(204);
  } catch (err: any) {
    res.status(500).json({ error: "Error al eliminar producto", detail: err?.message });
  }
});

router.post("/products/:id/adjust-stock", async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const { quantity, type, reason } = req.body;
    const existing = await db.execute(sql`SELECT * FROM products WHERE id = ${id}`);
    if (!existing.rows.length) { res.status(404).json({ error: "Not found" }); return; }
    const p = existing.rows[0] as any;
    const delta = type === "entrada" ? Number(quantity) : -Number(quantity);
    const newStock = String(Math.max(0, Number(p.stock || 0) + delta));
    const updated = await db.execute(sql`UPDATE products SET stock = ${newStock} WHERE id = ${id} RETURNING *`);
    await db.insert(activityLogTable).values({ type: "stock", description: `${type === "entrada" ? "Entrada" : "Salida"} de stock: ${p.name} (${reason})`, entityId: id });
    res.json(formatRow(updated.rows[0]));
  } catch (err: any) {
    res.status(500).json({ error: "Error al ajustar stock", detail: err?.message });
  }
});

export default router;
