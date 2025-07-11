import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // 👇 Ignore generated files and others
  {
    ignores: [
      "**/node_modules/**",
      "src/generated/**",      // ✅ ignore generated prisma files
      "**/*.config.js",        // optional, if you don't want to lint config files
      "**/*.d.ts",             // optional, to ignore type declaration files
      "src/app/api/webhooks/route.ts",
      "src/app/dashboard/IDE/page.tsx",
      "src/app/dashboard/IDE/IDE.tsx",
      "src/app/dashboard/page.tsx",
      "src/app/[site]/route.ts",
    ],
  },
];

export default eslintConfig;
