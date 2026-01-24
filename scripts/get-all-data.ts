import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting Database Export...\n");

  const data: Record<string, any> = {};

  // List of all models in schema.prisma
  const models = [
    "user",
    "oAuthAccount",
    "skill",
    "company",
    "job",
    "swipe",
    "match",
    "message",
    "recommendationProfile",
    "apiKey",
    "bookmark",
    "application",
    "payment",
  ];

  for (const model of models) {
    try {
      process.stdout.write(`📥 Fetching ${model}... `);
      // @ts-ignore - dynamic access to prisma models
      const records = await prisma[model].findMany();
      data[model] = records;
      console.log(`✅ ${records.length} records`);
    } catch (error) {
      console.log(
        `❌ Error: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  const outputPath = path.join(process.cwd(), "db_export.json");

  try {
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    console.log(`\n✨ Export complete!`);
    console.log(`📂 Data saved to: ${outputPath}`);

    // Also print a summary table
    console.log("\nSummary:");
    console.table(
      models.map((m) => ({
        Table: m,
        Records: data[m]?.length ?? 0,
      })),
    );
  } catch (error) {
    console.error("\n❌ Failed to write export file:", error);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
