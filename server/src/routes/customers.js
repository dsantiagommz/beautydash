import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

export const customersRouter = Router();
customersRouter.use(requireAuth);

const customerSchema = z.object({
  name: z.string().min(1),
  contact: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  active: z.boolean().optional(),
});

customersRouter.get("/", async (req, res) => {
  const customers = await prisma.customer.findMany({
    include: {
      _count: { select: { orders: true } },
      orders: { select: { total: true } },
    },
    orderBy: { name: "asc" },
  });

  const withStats = customers.map(({ orders, _count, ...c }) => ({
    ...c,
    orderCount: _count.orders,
    totalSpend: orders.reduce((sum, o) => sum + Number(o.total), 0),
  }));

  res.json(withStats);
});

customersRouter.get("/:id", async (req, res) => {
  const customer = await prisma.customer.findUnique({
    where: { id: req.params.id },
    include: { orders: true },
  });
  if (!customer) return res.status(404).json({ error: "Cliente no encontrado" });
  res.json(customer);
});

customersRouter.post("/", async (req, res) => {
  const parsed = customerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const customer = await prisma.customer.create({ data: parsed.data });
  res.status(201).json(customer);
});

customersRouter.put("/:id", async (req, res) => {
  const parsed = customerSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const customer = await prisma.customer.update({
    where: { id: req.params.id },
    data: parsed.data,
  });
  res.json(customer);
});
