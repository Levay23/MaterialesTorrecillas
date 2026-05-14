import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";

const router: IRouter = Router();

import { usersTable } from "@workspace/db";
import { db } from "@workspace/db";

router.get("/healthz", async (_req, res) => {
  try {
    // Probar una consulta simple
    await db.select().from(usersTable).limit(1);
    res.json({ status: "ok", database: "connected" });
  } catch (err: any) {
    res.status(500).json({ 
      status: "error", 
      message: err.message,
      path: err.path,
      stack: err.stack 
    });
  }
});

export default router;
