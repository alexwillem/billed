import { Column, Font, PdfConfig, Row } from "../types/pdf-types.js";
import { projectContractManager } from "../utils/project-contract-manager.js";
import { PATHS } from "./paths.config.js";

export const pdfConfig: PdfConfig = {
  size: "A4",
  margins: { top: 50, bottom: 50, left: 50, right: 50 },
  info: {
    Title: `Invoice ${projectContractManager.get().userProfile?.name}`,
    Author: `${projectContractManager.get().userProfile?.email}`,
    Subject: "billed.dev",
  },
};

export const headerColumn: Column = {
  keyWidth: 70,
  valueWidth: 160,
  padding: 8,
};

export const headerRow: Row = {
  primaryPadding: [3, 0, 0, 3],
  secondaryPadding: [7, 0, -7, 3],
  rowHeight: 13,
  primaryBorder: [0, 0, 0, 0],
  secondaryBorder: [0, 0, 0, 0],
};

export const contentRow: Row = {
  primaryPadding: [14, 0, 10, 0],
  secondaryPadding: [0, 0, 0, 0],
  rowHeight: 0,
  primaryBorder: [0, 0, 2, 0],
  secondaryBorder: [0, 0, 1, 0],
};

export const footerRow: Row = {
  primaryPadding: [7, 0, 7, 0],
  secondaryPadding: [7, 0, 7, 0],
  rowHeight: 0,
  primaryBorder: [2, 0, 0, 0],
  secondaryBorder: [0, 0, 2, 0],
};

export const font: Font = {
  regularStyle: PATHS.FONTS.REGULAR,
  boldStyle: PATHS.FONTS.BOLD,
  primarySize: 14,
  secondarySize: 10.5,
  footerSize: 7,
  colorDarkTheme: "#F2F2F2",
  colorLightTheme: "#121212",
};

export const backgroundColor = {
  darkTheme: "#121212",
  lightTheme: "#F2F2F2",
};

export const brandingColor = {
  darkTheme: "#00eb7d",
  lightTheme: "#00a155",
  lightThemeFooter: "#008043",
};

export const paymentButton = {
  paddingX: 2,
};
