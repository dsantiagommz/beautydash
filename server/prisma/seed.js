import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const categories = ["Cuidado Capilar", "Colorimetría", "Herramientas", "Barbería"];
  const categoryMap = {};
  for (const name of categories) {
    const category = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    categoryMap[name] = category.id;
  }

  const products = [
    { sku: "KRT-1001", name: "Keratina Pro 1L", category: "Cuidado Capilar", stock: 42, minStock: 15, price: 38.5 },
    { sku: "TNT-0714", name: "Tinte 7.1 Rubio Cenizo", category: "Colorimetría", stock: 3, minStock: 20, price: 12.0 },
    { sku: "DCL-0500", name: "Polvo Decolorante 500g", category: "Colorimetría", stock: 0, minStock: 10, price: 22.0 },
    { sku: "SHM-5000", name: "Shampoo Reconstructor 5L", category: "Cuidado Capilar", stock: 8, minStock: 15, price: 54.0 },
    { sku: "TJR-2200", name: "Tijera Profesional 6\"", category: "Herramientas", stock: 26, minStock: 5, price: 89.9 },
    { sku: "MAQ-3301", name: "Máquina de Corte Barbería", category: "Barbería", stock: 14, minStock: 4, price: 145.0 },
    { sku: "ACO-0090", name: "Acondicionador Hidratante 1L", category: "Cuidado Capilar", stock: 55, minStock: 20, price: 16.75 },
    { sku: "TNT-0602", name: "Tinte 6.0 Rubio Oscuro", category: "Colorimetría", stock: 31, minStock: 20, price: 12.0 },
    { sku: "CPA-1150", name: "Capa Corte Impermeable", category: "Barbería", stock: 19, minStock: 8, price: 21.3 },
    { sku: "SER-4420", name: "Sérum Anticaída 100ml", category: "Cuidado Capilar", stock: 12, minStock: 15, price: 29.9 },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: {
        sku: p.sku,
        name: p.name,
        categoryId: categoryMap[p.category],
        stock: p.stock,
        minStock: p.minStock,
        price: p.price,
      },
    });
  }

  const customers = [
    { name: "Studio Belleza Real", contact: "Marcela Ríos", city: "Bogotá" },
    { name: "Salón Aurora", contact: "Juliana Pérez", city: "Medellín" },
    { name: "Glow Beauty Bar", contact: "Camila Torres", city: "Cali" },
    { name: "Barbería Norte", contact: "Andrés Gómez", city: "Bogotá" },
    { name: "Casa del Cabello", contact: "Laura Méndez", city: "Barranquilla" },
    { name: "Élite Hair Studio", contact: "Diego Salazar", city: "Medellín", active: false },
  ];

  for (const c of customers) {
    const existing = await prisma.customer.findFirst({ where: { name: c.name } });
    if (!existing) {
      await prisma.customer.create({ data: c });
    }
  }

  const adminEmail = "dsantiagommz@gmail.com";
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash("changeme123", 10);
    await prisma.user.create({
      data: {
        name: "David Santiago",
        email: adminEmail,
        passwordHash,
        role: "ADMIN",
      },
    });
    console.log(`Usuario admin creado: ${adminEmail} / changeme123 (cámbiala después de iniciar sesión)`);
  }

  const demoEmail = "socio@beautysupplypro.com";
  const existingDemo = await prisma.user.findUnique({ where: { email: demoEmail } });
  if (!existingDemo) {
    const passwordHash = await bcrypt.hash("Demo2026!", 10);
    await prisma.user.create({
      data: {
        name: "Cuenta Demo",
        email: demoEmail,
        passwordHash,
        role: "ADMIN",
      },
    });
    console.log(`Usuario demo creado: ${demoEmail} / Demo2026!`);
  }

  console.log("Seed completado.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
