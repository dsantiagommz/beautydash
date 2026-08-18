import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

export const productsRouter = Router();
productsRouter.use(requireAuth);

const productSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  categoryId: z.string().min(1),
  price: z.number().nonnegative(),
  stock: z.number().int().nonnegative(),
  minStock: z.number().int().nonnegative(),
  unit: z.string().min(1).default("unidad"),
  expiresAt: z.string().datetime().nullable().optional(),
  active: z.boolean().optional(),
});

productsRouter.get("/", async (req, res) => {
  const { search, categoryId } = req.query;
  const products = await prisma.product.findMany({
    where: {
      active: true,
      categoryId: categoryId || undefined,
      OR: search
        ? [
            { name: { contains: String(search), mode: "insensitive" } },
            { sku: { contains: String(search), mode: "insensitive" } },
          ]
        : undefined,
    },
    include: { category: true },
    orderBy: { name: "asc" },
  });
  res.json(products);
});

productsRouter.get("/:id", async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: { category: true },
  });
  if (!product) return res.status(404).json({ error: "Producto no encontrado" });
  res.json(product);
});

productsRouter.post("/", async (req, res) => {
  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const product = await prisma.product.create({ data: parsed.data });
  res.status(201).json(product);
});

productsRouter.put("/:id", async (req, res) => {
  const parsed = productSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: parsed.data,
  });
  res.json(product);
});

productsRouter.delete("/:id", async (req, res) => {
  await prisma.product.update({
    where: { id: req.params.id },
    data: { active: false },
  });
  res.status(204).send();
});
