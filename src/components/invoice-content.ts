import { contentRow, font, footerRow } from "../config/pdf-style.config.js";
import { WorkItem } from "../types/profile-types.js";
import { setTotalAmount } from "../utils/invoice-calculations.js";
import { setInvoiceTheme } from "../utils/pdfStyle-utils.js";
import { projectContractManager } from "../utils/project-contract-manager.js";

export function buildContent(doc: PDFKit.PDFDocument) {
  const projectDetails = projectContractManager.get().projectDetails;
  const theme =
    projectContractManager.get().pdfStyle?.theme ?? setInvoiceTheme("light");
  const textColor = theme?.textColor;
  const padding = contentRow.primaryPadding;

  if (projectDetails && textColor) {
    const currencyHeader = projectDetails.currency
      ? `(${projectDetails.currency})`
      : "";
    doc
      .font(font.boldStyle)
      .fontSize(font.primarySize)
      .table({
        defaultStyle: {
          border: contentRow.primaryBorder,
          align: { x: "right" },
          borderColor: String(textColor),
        },
      })
      .row([
        {
          text: "DESCRIPTION",
          align: { x: "left" },
          padding: padding,
          textColor: String(textColor),
        },
        {
          text: "HOURS",
          padding: padding,
          textColor: String(textColor),
        },
        {
          text: `PRICE ${currencyHeader}`,
          padding: padding,
          textColor: String(textColor),
        },
        {
          text: `AMOUNT ${currencyHeader}`,
          padding: padding,
          textColor: String(textColor),
        },
      ]);

    const workItems = projectContractManager.get().projectDetails
      ?.workItems as WorkItem[];

    workItems.forEach((item) => {
      const itemAmount = item.hours * item.rate;

      if (typeof item.activity === "string")
        doc
          .fontSize(font.secondarySize)
          .font(font.regularStyle)
          .table({
            defaultStyle: {
              border: contentRow.secondaryBorder,
              align: { x: "right" },
              borderColor: String(textColor),
            },
          })
          .row([
            {
              text: item.activity,
              align: { x: "left" },
              padding: padding,
              textColor: String(textColor),
            },
            {
              text: item.hours.toString(),
              padding: padding,
              textColor: String(textColor),
            },
            {
              text: `${item.rate.toFixed(2)}`,
              padding: padding,
              textColor: String(textColor),
            },
            {
              text: `${itemAmount.toFixed(2)}`,
              padding: padding,
              textColor: String(textColor),
            },
          ]);
    });

    doc
      .fontSize(font.secondarySize)
      .font(font.regularStyle)
      .table({
        defaultStyle: {
          border: footerRow.primaryBorder,
          align: { x: "right" },
          padding: padding,
          borderColor: String(textColor),
        },
      })
      .row([
        {
          text: "SUBTOTAL",
          align: { x: "left" },
          colSpan: 3,
          textColor: String(textColor),
        },
        {
          text: `${setTotalAmount().itemsAmount.toFixed(2)}`,
          textColor: String(textColor),
        },
      ]);

    doc
      .fontSize(font.secondarySize)
      .font(font.regularStyle)
      .table({
        defaultStyle: {
          border: footerRow.secondaryBorder,
          align: { x: "right" },
          padding: footerRow.secondaryPadding,
          borderColor: String(textColor),
        },
      })
      .row([
        {
          text: `TAX ${projectContractManager.get().userProfile?.vatRate ?? 0}%`,
          align: { x: "left" },
          colSpan: 3,
          textColor: String(textColor),
        },
        {
          text: `${setTotalAmount().vatAmount.toFixed(2)}`,
          textColor: String(textColor),
        },
      ]);

    doc
      .fontSize(font.secondarySize)
      .font(font.regularStyle)
      .table({
        defaultStyle: {
          border: false,
          align: { x: "right" },
          padding: padding,
        },
      })
      .row([
        {
          text: "TOTAL",
          align: { x: "left" },
          colSpan: 3,
          textColor: String(textColor),
        },
        {
          text: `${projectDetails.currency ?? ""} ${setTotalAmount().billedAmount.toFixed(2)}`,
          textColor: String(textColor),
        },
      ]);
  }
}
