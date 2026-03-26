import { font, headerRow, paymentButton } from "../config/pdf-style.config.js";
import { HEADERS } from "../config/profiles.config.js";
import { ProfileEnums } from "../types/profile-types.js";
import { setInvoiceTheme, stylePayButton } from "../utils/pdfStyle-utils.js";
import { formatHeaderInfo } from "../utils/profile-utils.js";
import { projectContractManager } from "../utils/project-contract-manager.js";

export function buildHeaders(doc: PDFKit.PDFDocument) {
  const contentStartingPosition = { x: doc.x, y: doc.y };
  let contentNewPosition = 0;

  const theme =
    projectContractManager.get().pdfStyle?.theme ?? setInvoiceTheme("dark");
  const client = projectContractManager.get().clientProfile;
  const projectDetails = projectContractManager.get().projectDetails;

  const userInfo = formatHeaderInfo(
    doc,
    projectContractManager.get().userProfile,
    ProfileEnums.USER_PROFILE,
  );

  const projectDetailsInfo = formatHeaderInfo(
    doc,
    projectDetails,
    ProfileEnums.PROJECT_DETAILS,
  );
  const maxPayableWidth = {
    keyWidth:
      userInfo.maxKeyWidth > projectDetailsInfo.maxKeyWidth
        ? userInfo.maxKeyWidth
        : projectDetailsInfo.maxKeyWidth,
    valueWidth:
      userInfo.maxValueWidth > projectDetailsInfo.maxValueWidth
        ? userInfo.maxValueWidth
        : projectDetailsInfo.maxValueWidth,
  };

  const clientInfo = formatHeaderInfo(doc, client, ProfileEnums.CLIENT_PROFILE);
  const addressInfo = formatHeaderInfo(
    doc,
    client?.address,
    ProfileEnums.ADDRESS,
  );
  const maxClientKeyWidth =
    addressInfo.maxKeyWidth > clientInfo.maxKeyWidth
      ? addressInfo.maxKeyWidth
      : clientInfo.maxKeyWidth;

  const clientRows = [...clientInfo.rows, ...addressInfo.rows];
  const payableRows = [...userInfo.rows, ...projectDetailsInfo.rows];

  const clientTable = doc
    .fontSize(font.secondarySize)
    .lineGap(8)
    .table({
      defaultStyle: {
        padding: headerRow.primaryPadding,
        border: headerRow.primaryBorder,
        textColor: String(theme.textColor),
      },
      columnStyles: [maxClientKeyWidth, clientInfo.maxValueWidth],
      position: { x: contentStartingPosition.x, y: contentStartingPosition.y },
      maxWidth: doc.page.width / 2,
    })
    .row([
      {
        text: HEADERS.CLIENT_DETAILS,
        colSpan: 2,
        font: { src: font.boldStyle, size: font.primarySize },
      },
    ]);

  clientRows.forEach(([key, value]) => {
    clientTable.row([
      {
        text: key,
        border: headerRow.secondaryBorder,
        padding: headerRow.secondaryPadding,
      },
      {
        text: value,
        border: headerRow.secondaryBorder,
        padding: headerRow.secondaryPadding,
      },
    ]);
  });

  clientTable.end();

  contentNewPosition = doc.y;

  const payableTable = doc
    .fontSize(font.secondarySize)
    .lineGap(8)
    .table({
      defaultStyle: {
        padding: headerRow.primaryPadding,
        border: headerRow.primaryBorder,
        textColor: String(theme.textColor),
      },
      columnStyles: [maxPayableWidth.keyWidth, maxPayableWidth.valueWidth],
      position: {
        x:
          doc.page.width -
          doc.page.margins.right -
          (maxPayableWidth.keyWidth + maxPayableWidth.valueWidth),
        y: contentStartingPosition.y,
      },
      maxWidth: doc.page.width / 2,
    })
    .row([
      {
        text: HEADERS.USER_DETAILS,
        colSpan: 2,
        font: { src: font.boldStyle, size: font.primarySize },
      },
    ]);

  payableRows.forEach(([key, value]) => {
    payableTable.row([
      {
        text: key,
        border: headerRow.secondaryBorder,
        padding: headerRow.secondaryPadding,
      },
      {
        text: value,
        border: headerRow.secondaryBorder,
        padding: headerRow.secondaryPadding,
      },
    ]);
  });

  payableTable.end();

  const buttonY = doc.y - headerRow.rowHeight;
  const buttonX =
    doc.page.width -
    doc.page.margins.right -
    maxPayableWidth.valueWidth +
    paymentButton.paddingX;

  if (projectDetails && projectDetails.paymentLink) {
    stylePayButton(doc, projectDetails, buttonY, buttonX);
  }

  doc.x = contentStartingPosition.x;
  doc.moveDown(4);
}
