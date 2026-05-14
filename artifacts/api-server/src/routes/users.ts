import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

const router: Router = Router();

router.get("/users", async (req, res): Promise<void> => {
  const users = await db.select({
    id: usersTable.id, name: usersTable.name, email: usersTable.email,
    role: usersTable.role, active: usersTable.active, createdAt: usersTable.createdAt,
  }).from(usersTable).orderBy(usersTable.name);
  res.json(users);
});

router.post("/users", async (req, res): Promise<void> => {
  const { name, email, role, password } = req.body;
  if (!name || !email || !password || !role) { res.status(400).json({ error: "Name, email, role, password required" }); return; }
  const hashed = await bcrypt.hash(password, 10);
  const [user] = await db.insert(usersTable).values({ name, email, role, password: hashed }).returning();
  res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role, active: user.active, createdAt: user.createdAt });
});

router.patch("/users/:id", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
  const updates: Record<string, any> = { ...req.body };
  delete updates.password;
  const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, id)).returning();
  if (!user) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role, active: user.active, createdAt: user.createdAt });
});

router.delete("/users/:id", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
  await db.delete(usersTable).where(eq(usersTable.id, id));
  res.sendStatus(204);
});

export default router;
