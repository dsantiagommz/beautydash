import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

export const dashboardRouter = Router();
dashboardRouter.use(requireAuth);

dashboardRouter.get("/summary", async (req, res) => {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [orders, activeOrders, customers, lowStock] = await Promise.all([
    prisma.order.findMany({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.order.count({
      where: { status: { in: ["EN_PREPARACION", "EN_TRANSITO"] } },
    }),
    prisma.customer.count({ where: { active: true } }),
    prisma.product.findMany({
      where: { active: true },
      select: { id: true, name: true, sku: true, stock: true, minStock: true, expiresAt: true },
    }),
  ]);

  const totalSales = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const stockAlerts = lowStock.filter((p) => p.stock <= p.minStock);

  res.json({
    totalSales,
    monthlyOrderCount: orders.length,
    averageOrderValue: orders.length > 0 ? totalSales / orders.length : 0,
    activeOrders,
    activeCustomers: customers,
    stockAlerts: stockAlerts.length,
    stockAlertItems: stockAlerts,
  });
});

const MONTH_LABELS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

dashboardRouter.get("/sales-by-category", async (req, res) => {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth(), label: MONTH_LABELS[d.getMonth()] });
  }

  const rangeStart = new Date(months[0].year, months[0].month, 1);

  const items = await prisma.orderItem.findMany({
    where: { order: { createdAt: { gte: rangeStart } } },
    select: {
      quantity: true,
      unitPrice: true,
      order: { select: { createdAt: true } },
      product: { select: { category: { select: { name: true } } } },
    },
  });

  const categories = await prisma.category.findMany({ select: { name: true } });
  const categoryKey = (name) =>
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "");

  const buckets = Object.fromEntries(
    months.map((m) => [
      `${m.year}-${m.month}`,
      { mes: m.label, ...Object.fromEntries(categories.map((c) => [categoryKey(c.name), 0])) },
    ])
  );

  for (const item of items) {
    const d = item.order.createdAt;
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const bucket = buckets[key];
    if (!bucket) continue;
    const catKey = categoryKey(item.product.category.name);
    bucket[catKey] = (bucket[catKey] || 0) + Number(item.unitPrice) * item.quantity;
  }

  res.json({
    series: categories.map((c) => ({ key: categoryKey(c.name), name: c.name })),
    data: months.map((m) => buckets[`${m.year}-${m.month}`]),
  });
});
