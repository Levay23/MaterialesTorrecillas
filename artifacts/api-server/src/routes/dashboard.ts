import { Router } from "express";
import { db, salesTable, customersTable, productsTable, quotesTable, conversationsTable, activityLogTable } from "@workspace/db";
import { sql, gte, and, lt } from "drizzle-orm";

const router: Router = Router();

router.get("/dashboard/summary", async (req, res): Promise<void> => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [todaySalesRow] = await db
      .select({ total: sql<number>`COALESCE(SUM(CAST(total AS numeric)), 0)` })
      .from(salesTable)
      .where(and(gte(salesTable.createdAt, todayStart), sql`status = 'completed'`));

    const [monthSalesRow] = await db
      .select({ total: sql<number>`COALESCE(SUM(CAST(total AS numeric)), 0)` })
      .from(salesTable)
      .where(and(gte(salesTable.createdAt, monthStart), sql`status = 'completed'`));

    const [customerCount] = await db.select({ count: sql<number>`COUNT(*)::int` }).from(customersTable);
    const [productCount] = await db.select({ count: sql<number>`COUNT(*)::int` }).from(productsTable);
    const [pendingQuotes] = await db.select({ count: sql<number>`COUNT(*)::int` }).from(quotesTable).where(sql`status = 'pending'`);
    const [pendingInvoices] = await db.select({ count: sql<number>`COUNT(*)::int` }).from(salesTable).where(sql`status = 'pending'`);

    const lowStockResult = await db.execute(sql`SELECT COUNT(*)::int as count FROM products WHERE CAST(stock AS numeric) <= CAST(min_stock AS numeric)`);
    const activeConvos = await db.execute(sql`SELECT COUNT(*)::int as count FROM conversations WHERE unread_count > 0`);

    res.json({
      todaySales: Number(todaySalesRow?.total || 0),
      monthSales: Number(monthSalesRow?.total || 0),
      totalCustomers: customerCount?.count || 0,
      totalProducts: productCount?.count || 0,
      pendingQuotes: pendingQuotes?.count || 0,
      pendingInvoices: pendingInvoices?.count || 0,
      lowStockCount: Number((lowStockResult.rows[0] as any)?.count || 0),
      activeConversations: Number((activeConvos.rows[0] as any)?.count || 0),
    });
  } catch (err) {
    console.error("dashboard/summary error:", err);
    res.json({ todaySales: 0, monthSales: 0, totalCustomers: 0, totalProducts: 0, pendingQuotes: 0, pendingInvoices: 0, lowStockCount: 0, activeConversations: 0 });
  }
});

router.get("/dashboard/sales-chart", async (req, res): Promise<void> => {
  const result = await db.execute(sql`
    SELECT 
      to_char(created_at AT TIME ZONE 'America/Mexico_City', 'YYYY-MM-DD') as date,
      COALESCE(SUM(CAST(total AS numeric)), 0)::float as total,
      COUNT(*)::int as count
    FROM sales
    WHERE created_at >= NOW() - INTERVAL '30 days' AND status = 'completed'
    GROUP BY date
    ORDER BY date ASC
  `);
  res.json(result.rows);
});

router.get("/dashboard/recent-activity", async (req, res): Promise<void> => {
  const items = await db.select().from(activityLogTable).orderBy(sql`created_at DESC`).limit(20);
  res.json(items.map(i => ({ ...i, createdAt: i.createdAt })));
});

router.get("/dashboard/top-products", async (req, res): Promise<void> => {
  try {
    const result = await db.execute(sql`
      SELECT
        (item->>'productId')::int as "productId",
        item->>'productName' as name,
        SUM((item->>'quantity')::int)::int as "totalSold",
        SUM((item->>'total')::numeric)::float as revenue
      FROM sales, jsonb_array_elements(items) as item
      WHERE status = 'completed' AND created_at >= NOW() - INTERVAL '30 days'
      GROUP BY "productId", name
      ORDER BY "totalSold" DESC
      LIMIT 10
    `);
    res.json(result.rows || []);
  } catch (error) {
    console.error("Error in top-products:", error);
    res.json([]);
  }
});

router.get("/dashboard/low-stock", async (req, res): Promise<void> => {
  try {
    const result = await db.execute(sql`
      SELECT 
        id, name, sku, stock, min_stock,
        COALESCE(price, 0)::float as price,
        COALESCE(cost, 0)::float as cost
      FROM products 
      WHERE CAST(stock AS numeric) <= CAST(min_stock AS numeric)
      ORDER BY stock ASC
      LIMIT 20
    `);
    res.json(result.rows.map((p: any) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      stock: p.stock,
      minStock: p.min_stock,
      salePrice: Number(p.price || 0),
      purchasePrice: Number(p.cost || 0),
    })));
  } catch (err) {
    console.error("low-stock error:", err);
    res.json([]);
  }
});

export default router;
