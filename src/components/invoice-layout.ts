import { buildContent } from "./invoice-content.js";
import { drawMasthead } from "./invoice-masthead.js";
import { buildHeaders } from "./invoice-headers.js";
import {
  backgroundColor,
  brandingColor,
  font,
} from "../config/pdf-style.config.js";
import { projectContractManager } from "../utils/project-contract-manager.js";

export async function createLayout(doc: PDFKit.PDFDocument) {
  let x: number;
  const pdfTheme = projectContractManager.get().pdfStyle;
  const textColor =
    pdfTheme?.theme.backgroundColor === backgroundColor.darkTheme
      ? brandingColor.darkTheme
      : brandingColor.lightThemeFooter;
  doc.registerFont("regular-font", font.regularStyle);
  doc.registerFont("bold-font", font.boldStyle);
  await drawMasthead(doc);

  doc.moveDown(4);

  buildHeaders(doc);
  buildContent(doc);

  doc.moveDown(3);

  if (pdfTheme?.note) {
    const noteWidth = doc.widthOfString(pdfTheme.note);
    x = (doc.page.width - noteWidth) / 2;

    doc
      .font("regular-font")
      .fontSize(font.secondarySize)
      .text(pdfTheme.note, x)
      .fillColor(pdfTheme.theme.textColor);
  }

  // Footer
  const companyLogo = ">billed";
  const text = `Simply ${companyLogo}`;

  const width = doc.widthOfString(text);
  const height = doc.currentLineHeight();

  x = (doc.page.width - width) / 2;
  const y = doc.page.height - 60;

  doc
    .font("regular-font")
    .fontSize(font.footerSize)
    .text("Simply ", x, y, { continued: true })
    .font("bold-font")
    .fillColor(textColor)
    .text(companyLogo)
    .fillColor("black");

  doc.link(x, y, width, height, "https://billed.dev/");
}
