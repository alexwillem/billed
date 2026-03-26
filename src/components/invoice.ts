import fs from "fs";
import path from "path";
import chalk from "chalk";
import PDFDocument from "pdfkit";
import { PATHS } from "../config/paths.config.js";
import { setInvoiceTheme } from "../utils/pdfStyle-utils.js";
import { projectContractManager } from "../utils/project-contract-manager.js";
import { createLayout } from "./invoice-layout.js";
import { pdfConfig } from "../config/pdf-style.config.js";

export class Invoice {
  public async buildInvoice() {
    const doc = new PDFDocument(pdfConfig);
    const filename = `invoice-${projectContractManager.get().projectDetails?.invoiceNumber}.pdf`;
    const outputPath = path.join(PATHS.OUTPUT_DIR, filename);

    const theme =
      projectContractManager.get().pdfStyle?.theme ?? setInvoiceTheme("light");

    doc.rect(0, 0, doc.page.width, doc.page.height).fill(theme.backgroundColor);
    doc.fillColor(theme.textColor);

    doc.on("pageAdded", () => {
      doc
        .rect(0, 0, doc.page.width, doc.page.height)
        .fill(theme.backgroundColor);
      doc.fillColor(theme.textColor);
    });

    const stream = fs.createWriteStream(outputPath);

    const promise = new Promise((resolve, reject) => {
      stream.on("finish", () => {
        console.log(chalk.greenBright.bold("✓ PDF generated at: "));
        console.log(`${outputPath}`);
        resolve(outputPath);
      });

      stream.on("error", (err) => {
        console.error("❌ Error writing PDF:", err);
        reject(err);
      });

      doc.pipe(stream);
    });

    await createLayout(doc);
    doc.end();

    return promise;
  }
}

export const invoice = new Invoice();
