import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";

const router: Router = Router();
const SECRET = process.env.SESSION_SECRET || "ferremax-secret-2024";

router.post("/auth/login", async (req, res): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Email and password required" });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user || !user.active) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET, { expiresIn: "7d" });
  res.cookie("auth_token", token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, active: user.active, createdAt: user.createdAt } });
});

router.get("/auth/me", async (req, res): Promise<void> => {
  const token = req.cookies?.auth_token || req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const payload = jwt.verify(token, SECRET) as { id: number };
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, payload.id));
    if (!user || !user.active) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role, active: user.active, createdAt: user.createdAt });
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
});

router.post("/auth/logout", async (req, res): Promise<void> => {
  res.clearCookie("auth_token");
  res.json({ success: true });
});

export { SECRET };
export default router;
