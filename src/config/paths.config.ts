import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PACKAGE_ROOT = path.resolve(__dirname, "..");

export const PATHS = {
  DATA_DIR: path.join(process.cwd(), "data"),
  CONTRACTS_DIR: path.join(process.cwd(), "data", "contracts"),
  OUTPUT_DIR: path.join(process.cwd(), "output", "invoices"),
  PROJECT_CONTRACT: path.join(
    process.cwd(),
    "data",
    "contracts",
    "project-contract.json",
  ),

  FONTS: {
    BOLD: path.join(
      PACKAGE_ROOT,
      "src",
      "assets",
      "fonts",
      "OTF",
      "Commit-Mono",
      "CommitMono-700-Regular.otf",
    ),
    REGULAR: path.join(
      PACKAGE_ROOT,
      "src",
      "assets",
      "fonts",
      "OTF",
      "Commit-Mono",
      "CommitMono-400-Regular.otf",
    ),
  },
} as const;
