import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

export const shipmentsRouter = Router();
shipmentsRouter.use(requireAuth);

const shipmentSchema = z.object({
  orderId: z.string().min(1),
  driver: z.string().optional(),
  city: z.string().optional(),
  status: z.enum(["PENDIENTE", "PROGRAMADO", "EN_RUTA", "ENTREGADO"]).optional(),
  eta: z.string().datetime().nullable().optional(),
});

shipmentsRouter.get("/", async (req, res) => {
  const shipments = await prisma.shipment.findMany({
    include: { order: { include: { customer: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(shipments);
});

shipmentsRouter.post("/", async (req, res) => {
  const parsed = shipmentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const shipment = await prisma.shipment.create({ data: parsed.data });
  res.status(201).json(shipment);
});

shipmentsRouter.put("/:id", async (req, res) => {
  const parsed = shipmentSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const shipment = await prisma.shipment.update({
    where: { id: req.params.id },
    data: parsed.data,
  });
  res.json(shipment);
});
