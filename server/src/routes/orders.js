import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

export const ordersRouter = Router();
ordersRouter.use(requireAuth);

const orderSchema = z.object({
  customerId: z.string().min(1),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
});

const STATUSES = ["EN_PREPARACION", "EN_TRANSITO", "ENTREGADO", "PENDIENTE_PAGO"];

ordersRouter.get("/", async (req, res) => {
  const { status } = req.query;
  const orders = await prisma.order.findMany({
    where: { status: status || undefined },
    include: { customer: true, items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(orders);
});

ordersRouter.get("/:id", async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { customer: true, items: { include: { product: true } }, shipment: true },
  });
  if (!order) return res.status(404).json({ error: "Pedido no encontrado" });
  res.json(order);
});

ordersRouter.post("/", async (req, res) => {
  const parsed = orderSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { customerId, items } = parsed.data;

  try {
    const order = await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: items.map((i) => i.productId) } },
      });

      let total = 0;
      const itemsData = items.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (!product) throw new Error(`Producto ${item.productId} no encontrado`);
        if (product.stock < item.quantity) {
          throw new Error(`Stock insuficiente para ${product.name}`);
        }
        total += Number(product.price) * item.quantity;
        return {
          productId: product.id,
          quantity: item.quantity,
          unitPrice: product.price,
        };
      });

      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      const count = await tx.order.count();
      const code = `#${8000 + count + 1}`;

      return tx.order.create({
        data: {
          code,
          customerId,
          total,
          items: { create: itemsData },
        },
        include: { customer: true, items: { include: { product: true } } },
      });
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

ordersRouter.patch("/:id/status", async (req, res) => {
  const parsed = z.object({ status: z.enum(STATUSES) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: { status: parsed.data.status },
  });
  res.json(order);
});
