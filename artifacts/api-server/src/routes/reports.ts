import { Router } from "express";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

const router: Router = Router();

router.get("/reports/sales", async (req, res): Promise<void> => {
  const { from, to } = req.query as Record<string, string>;
  const fromDate = from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const toDate = to || new Date().toISOString();

  const summaryRes = await db.execute(sql`
    SELECT COUNT(*)::int as total_sales,
           COALESCE(SUM(CAST(total AS numeric)), 0)::float as total_revenue,
           COALESCE(AVG(CAST(total AS numeric)), 0)::float as average_ticket
    FROM sales WHERE status = 'completed' AND created_at BETWEEN ${fromDate}::timestamptz AND ${toDate}::timestamptz
  `);
  const summary = (summaryRes.rows[0] || {}) as any;

  const byPaymentRes = await db.execute(sql`
    SELECT payment_method as method, COUNT(*)::int as count, SUM(CAST(total AS numeric))::float as total
    FROM sales WHERE status = 'completed' AND created_at BETWEEN ${fromDate}::timestamptz AND ${toDate}::timestamptz
    GROUP BY payment_method ORDER BY total DESC
  `);

  const byDayRes = await db.execute(sql`
    SELECT to_char(created_at AT TIME ZONE 'America/Mexico_City', 'YYYY-MM-DD') as date,
           SUM(CAST(total AS numeric))::float as total, COUNT(*)::int as count
    FROM sales WHERE status = 'completed' AND created_at BETWEEN ${fromDate}::timestamptz AND ${toDate}::timestamptz
    GROUP BY date ORDER BY date ASC
  `);

  res.json({
    totalSales: summary.total_sales || 0,
    totalRevenue: summary.total_revenue || 0,
    averageTicket: summary.average_ticket || 0,
    byPaymentMethod: byPaymentRes.rows || [],
    byDay: byDayRes.rows || [],
  });
});

router.get("/reports/inventory", async (req, res): Promise<void> => {
  const summaryRes = await db.execute(sql`
    SELECT COUNT(*)::int as total_products,
           COALESCE(SUM(CAST(sale_price AS numeric) * stock), 0)::float as total_value,
           SUM(CASE WHEN stock <= min_stock AND stock > 0 THEN 1 ELSE 0 END)::int as low_stock_count,
           SUM(CASE WHEN stock = 0 THEN 1 ELSE 0 END)::int as out_of_stock_count
    FROM products
  `);
  const summary = (summaryRes.rows[0] || {}) as any;

  const byCategoryRes = await db.execute(sql`
    SELECT COALESCE(c.name, 'Sin categoría') as category,
           COUNT(p.id)::int as count,
           COALESCE(SUM(CAST(p.sale_price AS numeric) * p.stock), 0)::float as value
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    GROUP BY c.name ORDER BY value DESC
  `);

  res.json({
    totalProducts: summary.total_products || 0,
    totalValue: summary.total_value || 0,
    lowStockCount: summary.low_stock_count || 0,
    outOfStockCount: summary.out_of_stock_count || 0,
    byCategory: byCategoryRes.rows || [],
  });
});

router.get("/reports/customers", async (req, res): Promise<void> => {
  const summaryRes = await db.execute(sql`
    SELECT COUNT(*)::int as total_customers,
           SUM(CASE WHEN created_at >= DATE_TRUNC('month', NOW()) THEN 1 ELSE 0 END)::int as new_this_month
    FROM customers
  `);
  const summary = (summaryRes.rows[0] || {}) as any;

  const byTypeRes = await db.execute(sql`
    SELECT type, COUNT(*)::int as count FROM customers GROUP BY type ORDER BY count DESC
  `);

  const topCustomersRes = await db.execute(sql`
    SELECT id as "customerId", name, COALESCE(total_purchases::numeric, 0)::float as "totalSpent",
           (SELECT COUNT(*) FROM sales WHERE customer_id = customers.id)::int as "purchaseCount"
    FROM customers ORDER BY total_purchases::numeric DESC NULLS LAST LIMIT 10
  `);

  res.json({
    totalCustomers: summary.total_customers || 0,
    newThisMonth: summary.new_this_month || 0,
    byType: byTypeRes.rows || [],
    topCustomers: topCustomersRes.rows || [],
  });
});

export default router;
