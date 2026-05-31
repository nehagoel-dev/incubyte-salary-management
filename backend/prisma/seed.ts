import { PrismaClient } from "@prisma/client";
import { generateEmployees } from "../src/lib/seed-data.js";

const prisma = new PrismaClient();

async function main() {
  const employees = generateEmployees(10_000);
  for (const emp of employees) {
    await prisma.employee.upsert({
      where: { email: emp.email },
      update: {},
      create: emp,
    });
  }
  console.log(`Seeded ${employees.length} employees.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
