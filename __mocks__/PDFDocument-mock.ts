import { EventEmitter } from "events";
import { PdfConfig } from "../src/types/pdf-types.js";
import { MockCall, MockRow } from "./mock-types";

export const mockPdfConfig: PdfConfig = {
  size: "A4",
  margins: { top: 50, bottom: 50, left: 50, right: 50 },
  info: {
    Title: "Invoice Test User",
    Author: "Test User",
    Subject: "billed.dev",
  },
};

export function getFirstMockDataArg(
  doc: any,
  method: string,
): string[] | number[] | MockRow[] {
  return doc.calls
    .filter((call: MockCall) => call.method === method)
    .map((call: MockCall) => call.args[0]);
}

export function getAllMockDataArgs(
  doc: any,
  method: string,
): string[][] | number[][] | MockRow[][] {
  return doc.calls
    .filter((call: MockCall) => call.method === method)
    .map((call: MockCall) => call.args);
}

class MockPDFDocument extends EventEmitter {
  public calls: Array<{ method: string; args: any[] }> = [];

  public page = {
    width: 600,
    height: 1000,
    margins: {
      top: 72,
      bottom: 72,
      left: 72,
      right: 72,
    },
  };

  public x = this.page.margins.left;
  public y = this.page.margins.top;

  private _record(method: string, args: any[]) {
    this.calls.push({ method, args });
    return this;
  }

  // Existing PDFKit methods used by invoice‑content
  font(...args: any[]) {
    return this._record("font", args);
  }
  fontSize(...args: any[]) {
    return this._record("fontSize", args);
  }
  registerFont(...args: any[]) {
    return this._record("registerFont", args);
  }
  lineGap(...args: any[]) {
    return this._record("lineGap", args);
  }
  moveDown(...args: any[]) {
    return this._record("moveDown", args);
  }
  link(...args: any[]) {
    return this._record("link", args);
  }
  // Table helper – returns an object that still points back to the doc
  table(...args: any[]) {
    const doc = this; // capture the outer document so the builder can log into it

    // The builder that PDFKit returns
    const builder = {
      /** Record the row data and return the builder for further chaining */
      row(rowData: any) {
        doc.calls.push({ method: "row", args: [rowData] });
        return builder; // ← important: return the builder, not the doc
      },

      /** Record that the table was closed */
      end() {
        doc.calls.push({ method: "end", args: [] });
        return builder; // returning the builder keeps the chain alive (optional)
      },
    };

    // Record the initial call to `table` itself
    this.calls.push({ method: "table", args });
    return builder; // ← this is what `clientTable` receives after the first .row()
  }

  save() {
    return this._record("save", ["saved"]);
  }
  restore() {
    return this._record("restore", []);
  }

  fillColor(color: string) {
    return this._record("fillColor", [color]);
  }

  fillOpacity(opacity: number) {
    return this._record("fillOpacity", [opacity]);
  }

  strokeColor(color: string) {
    return this._record("strokeColor", [color]);
  }
  lineWidth(width: number) {
    return this._record("lineWidth", [width]);
  }

  roundedRect(x: number, y: number, w: number, h: number, r: number) {
    return this._record("roundedRect", [x, y, w, h, r]);
  }

  fill(color: string) {
    return this._record("fill", [color]);
  }

  stroke() {
    return this._record("stroke", []);
  }

  text(txt: string, x?: number, y?: number) {
    return this._record("text", [txt, x, y]);
  }

  // widthOfString is used to compute the button width
  widthOfString(str: string) {
    // Return a deterministic fake width – you can tweak per test
    this.calls.push({ method: "widthOfString", args: [str] });
    return 50; // arbitrary but consistent
  }

  currentLineHeight() {
    const exampleLineHeight = 8;

    return exampleLineHeight;
  }

  rect(x: number, y: number, w: number, h: number) {
    return this._record("rect", [x, y, w, h]);
  }

  pipe(_stream: any) {
    return this;
  }

  end() {
    return this._record("end", []);
  }

  // ---------------------------------------------------------------
  // Graphics‑state & drawing helpers that svg‑to‑pdfkit may call.
  // They just log the call via _record and return the document.
  // ---------------------------------------------------------------
  translate(dx: number, dy: number) {
    return this._record("translate", [dx, dy]);
  }
  rotate(angle: number, options?: any) {
    return this._record("rotate", [angle, options]);
  }
  scale(sx: number, sy?: number) {
    return this._record("scale", [sx, sy]);
  }
  skew(ax: number, ay: number) {
    return this._record("skew", [ax, ay]);
  }
  transform(a: number, b: number, c: number, d: number, e: number, f: number) {
    return this._record("transform", [a, b, c, d, e, f]);
  }
  clip() {
    return this._record("clip", []);
  }
  resetClip() {
    return this._record("resetClip", []);
  }

  /* ---- drawing primitives that SVG paths use ------------------- */
  moveTo(x: number, y: number) {
    return this._record("moveTo", [x, y]);
  }
  lineTo(x: number, y: number) {
    return this._record("lineTo", [x, y]);
  }
  bezierCurveTo(
    cp1x: number,
    cp1y: number,
    cp2x: number,
    cp2y: number,
    x: number,
    y: number,
  ) {
    return this._record("bezierCurveTo", [cp1x, cp1y, cp2x, cp2y, x, y]);
  }
  quadraticCurveTo(cx: number, cy: number, x: number, y: number) {
    return this._record("quadraticCurveTo", [cx, cy, x, y]);
  }
  closePath() {
    return this._record("closePath", []);
  }
  dash(...args: any[]) {
    return this._record("dash", args);
  }
  lineCap(...args: any[]) {
    return this._record("lineCap", args);
  }
  lineJoin(...args: any[]) {
    return this._record("lineJoin", args);
  }
  image(...args: any[]) {
    return this._record("image", args);
  }
}

export default MockPDFDocument;
