import fs from "fs";
import SVGtoPDF from "svg-to-pdfkit";
import { DOMParser } from "@xmldom/xmldom";
import path from "path";
import { projectContractManager } from "../utils/project-contract-manager.js";
import { DateTime } from "luxon";

export async function drawMasthead(doc: PDFKit.PDFDocument): Promise<void> {
  const topY = 50;
  const maxLogoHeight = 50;
  const leftMargin = doc.page.margins.left;
  const pageWidth =
    doc.page.width - doc.page.margins.left - doc.page.margins.right;

  const col1Width = pageWidth * 0.4;
  const col2Width = pageWidth * 0.6;

  let viewBoxWidth = undefined;
  let viewBoxHeight = undefined;
  let logoHeight = maxLogoHeight;

  const userLogo = projectContractManager.get().pdfStyle?.logoPath;

  if (userLogo && userLogo.trim() !== "") {
    //logoPath must be full path, e.g.: /Users/alex/personal-projects/billed/billed-icon-only.svg
    const logoPath = path.resolve(process.cwd(), userLogo);
    const svgContent = fs.readFileSync(logoPath, "utf8");

    const isSvg = logoPath.endsWith(".svg");
    let viewBox = undefined;

    if (isSvg) {
      const docSvg = new DOMParser().parseFromString(
        svgContent,
        "application/xml",
      );

      viewBox = docSvg.documentElement?.getAttribute("viewBox");
    }

    if (viewBox) {
      const parts = viewBox.split(" ").map(Number);
      if (parts.length === 4) {
        viewBoxWidth = parts[2];
        viewBoxHeight = parts[3];
      }
    }

    if (!viewBoxWidth || !viewBoxHeight) {
      viewBoxWidth = 100;
      viewBoxHeight = 100;
    }

    const ratio = viewBoxWidth / viewBoxHeight;

    let logoWidth = logoHeight * ratio;

    if (viewBoxWidth && viewBoxHeight) {
      const ratio = viewBoxWidth / viewBoxHeight;
      if (ratio > 1) {
        // wide SVG
        logoWidth = Math.min(col1Width, maxLogoHeight * ratio);
        logoHeight = maxLogoHeight;
      } else {
        // tall SVG
        logoWidth = maxLogoHeight * ratio;
        logoHeight = maxLogoHeight;
      }
    }

    if (isSvg) {
      const sanitizedSvg = svgContent
        .replace(/height="[^"]*"/, "")
        .replace(/width="[^"]*"/, "");

      SVGtoPDF(doc, sanitizedSvg, leftMargin, topY, {
        width: logoWidth,
        height: logoHeight,
      });
    } else if (logoPath.endsWith(".jpg")) {
      doc.image(`${logoPath}`, { width: logoWidth, height: logoHeight });
    } else {
      console.error(`❌ Unsupported logo format: ${userLogo}`);
      process.exit(1);
    }
  }

  doc
    .font("bold-font")
    .fontSize(20)
    .text("INVOICE", leftMargin + col1Width, topY + (logoHeight - topY) / 2, {
      width: col2Width,
      align: "right",
    });

  doc.moveDown(0.5);

  doc
    .fontSize(10.5)
    .font("regular-font")
    .lineGap(8)
    .text(`${DateTime.now().toLocaleString(DateTime.DATE_MED)}`, {
      align: "right",
    });
  doc
    .fontSize(10.5)
    .font("regular-font")
    .text(`#${projectContractManager.get().projectDetails?.invoiceNumber}`, {
      align: "right",
    });
  doc.x = leftMargin;
  doc.y = topY + logoHeight + 20;

  doc.save();
}
