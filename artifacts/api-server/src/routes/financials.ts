import { Router } from "express";
import { db, accountsTable, paymentsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router: Router = Router();

router.get("/accounts", async (req, res): Promise<void> => {
  const { type, status } = req.query as Record<string, string>;
  let query = db.select().from(accountsTable).$dynamic();
  
  if (type) query = query.where(eq(accountsTable.type, type));
  if (status) query = query.where(eq(accountsTable.status, status));
  
  const accounts = await query.orderBy(accountsTable.dueDate);
  res.json(accounts.map(a => ({ ...a, amount: Number(a.amount), balance: Number(a.balance) })));
});

router.post("/payments", async (req, res): Promise<void> => {
  const { accountId, amount, ...rest } = req.body;
  
  // Transaction to update account balance and insert payment
  const result = await db.transaction(async (tx) => {
    const [payment] = await tx.insert(paymentsTable).values({ accountId, amount, ...rest }).returning();
    
    const [account] = await tx.select().from(accountsTable).where(eq(accountsTable.id, accountId));
    const newBalance = Number(account.balance) - Number(amount);
    const newStatus = newBalance <= 0 ? "paid" : "partial";
    
    await tx.update(accountsTable)
      .set({ balance: newBalance.toString(), status: newStatus })
      .where(eq(accountsTable.id, accountId));
      
    return payment;
  });
  
  res.status(201).json(result);
});

export default router;
