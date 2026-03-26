import {
  backgroundColor,
  brandingColor,
  font,
  headerColumn,
} from "../config/pdf-style.config.js";
import { widthType } from "../types/pdf-types.js";
import { ProjectDetails } from "../types/profile-types.js";
import { projectContractManager } from "./project-contract-manager.js";

export function setInvoiceTheme(theme: string): {
  textColor: string;
  backgroundColor: string;
} {
  return theme === "dark"
    ? {
        textColor: font.colorDarkTheme,
        backgroundColor: backgroundColor.darkTheme,
      }
    : {
        textColor: font.colorLightTheme,
        backgroundColor: backgroundColor.lightTheme,
      };
}

export function stylePayButton(
  doc: PDFKit.PDFDocument,
  projectDetails: ProjectDetails,
  linkHeight: number,
  xPosition: number,
): void {
  const pdfTheme = projectContractManager.get().pdfStyle?.theme;
  const textColor =
    pdfTheme?.backgroundColor === backgroundColor.darkTheme
      ? brandingColor.darkTheme
      : brandingColor.lightTheme;

  const buttonText = "→";
  const paymentSummary = projectContractManager.get().projectDetails?.amount;
  const buttonWidth = paymentSummary
    ? doc.fontSize(11).widthOfString(paymentSummary)
    : undefined;
  const buttonHeight = 18;
  const paddingX = 10;
  const paddingY = 2;

  if (buttonWidth) {
    // Subtle fill
    doc
      .save()
      .fillColor(textColor)
      .fillOpacity(0.08)
      .roundedRect(
        xPosition - 4,
        linkHeight - paddingY,
        buttonWidth + paddingX * 2,
        buttonHeight,
        4,
      )
      .fill()
      .restore();

    // Border
    doc
      .save()
      .strokeColor(textColor)
      .lineWidth(1)
      .roundedRect(
        xPosition - 4,
        linkHeight - paddingY,
        buttonWidth + paddingX * 2,
        buttonHeight,
        4,
      )
      .stroke()
      .restore();

    // Text with color
    doc
      .save()
      .fillColor(textColor)
      .fontSize(10)
      .font("regular-font")
      .text(buttonText, xPosition + buttonWidth + 5, linkHeight + 1)
      .restore();

    // Clickable area
    doc.link(
      xPosition - 4,
      linkHeight - paddingY,
      buttonWidth + paddingX * 2,
      buttonHeight,
      projectDetails.paymentLink!,
    );
  }
}

export function setMaxColumnWidth(
  doc: any,
  { key, value }: widthType,
): widthType {
  const keyWidth = doc.widthOfString(String(key)) + headerColumn.padding;
  let valueWidth = doc.widthOfString(String(value)) + headerColumn.padding;

  const hasPaymentLink =
    !!projectContractManager.get().projectDetails?.paymentLink;

  valueWidth =
    key === "amount: " && hasPaymentLink
      ? valueWidth + headerColumn.padding * 2
      : valueWidth;

  return { keyWidth: keyWidth, valueWidth: valueWidth };
}
