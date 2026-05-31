import { generateEmployees } from "../src/lib/seed-data.js";
import { prisma } from "../src/lib/prisma.js";

const BATCH_SIZE = 500;

async function main() {
  await prisma.employee.deleteMany({});

  const employees = generateEmployees(10_000);
  let seeded = 0;

  for (let i = 0; i < employees.length; i += BATCH_SIZE) {
    const batch = employees.slice(i, i + BATCH_SIZE);
    await prisma.employee.createMany({ data: batch, skipDuplicates: true });
    seeded += batch.length;
    console.log(`Seeded ${seeded}/10000...`);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
