import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const usersRouter = Router();
usersRouter.use(requireAuth);

usersRouter.get("/", async (req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true },
    orderBy: { createdAt: "asc" },
  });
  res.json(users);
});

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.enum(["ADMIN", "BODEGA"]).optional(),
});

usersRouter.put("/:id", requireRole("ADMIN"), async (req, res) => {
  const parsed = updateUserSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: parsed.data,
      select: { id: true, name: true, email: true, role: true },
    });
    res.json(user);
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(400).json({ error: "Ese correo ya está en uso" });
    }
    throw err;
  }
});

const resetPasswordSchema = z.object({
  newPassword: z.string().min(6),
});

usersRouter.put("/:id/password", requireRole("ADMIN"), async (req, res) => {
  const parsed = resetPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await prisma.user.update({
    where: { id: req.params.id },
    data: { passwordHash },
  });

  res.json({ ok: true });
});
