// prisma.config.ts
import { defineConfig, env } from "prisma/config";
import { config } from "dotenv"; // Load .env before defining the config

config(); // Call config() to load the variables

export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
    },
    engine: "classic",
    datasource: {
        url: env("DATABASE_URL"),
    },
});