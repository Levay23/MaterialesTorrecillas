import { Router } from "express";
import { db, salesTable, customersTable, productsTable, quotesTable, conversationsTable, activityLogTable } from "@workspace/db";
import { sql, gte, and, lt } from "drizzle-orm";

const router: Router = Router();

router.get("/dashboard/summary", async (req, res): Promise<void> => {
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
  const [lowStock] = await db.select({ count: sql<number>`COUNT(*)::int` }).from(productsTable).where(sql`stock <= min_stock`);
  const [activeConvos] = await db.select({ count: sql<number>`COUNT(*)::int` }).from(conversationsTable).where(sql`unread_count > 0`);

  res.json({
    todaySales: Number(todaySalesRow?.total || 0),
    monthSales: Number(monthSalesRow?.total || 0),
    totalCustomers: customerCount?.count || 0,
    totalProducts: productCount?.count || 0,
    pendingQuotes: pendingQuotes?.count || 0,
    pendingInvoices: pendingInvoices?.count || 0,
    lowStockCount: lowStock?.count || 0,
    activeConversations: activeConvos?.count || 0,
  });
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
  res.json(result.rows);
});

router.get("/dashboard/low-stock", async (req, res): Promise<void> => {
  const products = await db.select().from(productsTable).where(sql`stock <= min_stock`).limit(20);
  res.json(products.map(p => ({
    ...p,
    purchasePrice: Number(p.purchasePrice),
    salePrice: Number(p.salePrice),
    wholesalePrice: p.wholesalePrice ? Number(p.wholesalePrice) : null,
    totalPurchases: null,
    createdAt: p.createdAt,
  })));
});

export default router;
