import { Address } from "cluster";
import { ClientProfile, ProjectDetails, UserProfile } from "./profile-types.js";

// ===== STYLING =====

export interface PdfConfig {
  size: string;
  margins: PDFMargin;
  info: PDFInfo;
}

interface PDFMargin {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

interface PDFInfo {
  Title: string;
  Author: string;
  Subject: string;
}

export interface Row {
  primaryPadding: PDFKit.Mixins.Sides<PDFKit.Mixins.Wideness>;
  secondaryPadding: PDFKit.Mixins.Sides<PDFKit.Mixins.Wideness>;
  primaryBorder: PDFKit.Mixins.PartialSides<PDFKit.Mixins.Wideness>;
  secondaryBorder: PDFKit.Mixins.PartialSides<PDFKit.Mixins.Wideness>;
  rowHeight: number;
}

export interface TransformedRows {
  rows: Array<[string, string]>;
  maxKeyWidth: number;
  maxValueWidth: number;
}

export interface Column {
  keyWidth: number;
  valueWidth: number;
  padding: number;
}

export interface Font {
  regularStyle: string;
  boldStyle: string;
  primarySize: number;
  secondarySize: number;
  footerSize: number;
  colorLightTheme: string;
  colorDarkTheme: string;
}

// ===== HEADER CONTENT =====

type AllowedHeaderKeys =
  | keyof ClientProfile
  | keyof ProjectDetails
  | keyof UserProfile
  | keyof Address;

export type HeaderEntries = [AllowedHeaderKeys, any][];

export interface widthType {
  key?: string;
  value?: string | number;
  keyWidth?: number;
  valueWidth?: number;
}
