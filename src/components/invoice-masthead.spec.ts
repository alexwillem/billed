import fs from "fs";
import { DateTime } from "luxon";
import SVGtoPDF from "svg-to-pdfkit";
import {
  mockContractInstance,
  mockPdfStyleInstance,
} from "../../__mocks__/contract-info-mock.js";
import MockPDFDocument, {
  getAllMockDataArgs,
  getFirstMockDataArg,
} from "../../__mocks__/PDFDocument-mock.js";
import { projectContractManager } from "../utils/project-contract-manager.js";
import { drawMasthead } from "./invoice-masthead.js";

vi.mock("svg-to-pdfkit", () => ({ default: vi.fn() }));
vi.mock("fs", () => ({
  default: {
    readFileSync: vi.fn(),
    existsSync: vi.fn(),
    mkdirSync: vi.fn(),
  },
}));

function firstCall(doc: any, method: string) {
  const arr = getFirstMockDataArg(doc, method);
  return arr?.[0];
}

function contractWithLogo(logoPath: string) {
  const contract = structuredClone(mockContractInstance);
  contract.pdfStyle = structuredClone(mockPdfStyleInstance);
  contract.pdfStyle.logoPath = logoPath;
  return contract;
}

describe("format logo to image", () => {
  const mockGet = vi.fn();
  let mockDoc: any;
  let mockStyle: any;
  let mockProjectContract: any;

  beforeEach(() => {
    mockDoc = new MockPDFDocument() as unknown as PDFKit.PDFDocument;
    mockStyle = structuredClone(mockPdfStyleInstance);
    mockProjectContract = structuredClone(mockContractInstance);

    vi.mocked(projectContractManager).get = mockGet;
    mockGet.mockReturnValue(mockProjectContract);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders header without a logo when logoPath is falsy", async () => {
    const contract = structuredClone(mockContractInstance);
    contract.pdfStyle.logoPath = "";
    mockGet.mockReturnValue(contract);

    await drawMasthead(mockDoc);

    const restoreCalls = getFirstMockDataArg(mockDoc, "restore");

    expect(restoreCalls.length).toBe(0);
    expect(firstCall(mockDoc, "font")).toBe("bold-font");
    expect(firstCall(mockDoc, "fontSize")).toBe(20);
    const textCall = getFirstMockDataArg(mockDoc, "text");
    expect(textCall[0]).toBe("INVOICE");
  });

  it("draws an SVG logo, calls SVGtoPDF and restores state", async () => {
    const svgPath = mockStyle.logoPath;
    const contract = contractWithLogo(svgPath);
    mockGet.mockReturnValue(contract);

    const mockSvgContent = '<svg viewBox="0 0 200 100"></svg>';
    (fs.readFileSync as ReturnType<typeof vi.fn>).mockReturnValue(
      mockSvgContent,
    );
    vi.mocked(SVGtoPDF).mockImplementation(() => {});

    await drawMasthead(mockDoc);

    expect(SVGtoPDF).toHaveBeenCalledTimes(1);
    const callArgs = vi.mocked(SVGtoPDF).mock.calls[0];
    expect(callArgs[0]).toBe(mockDoc);
    expect(typeof callArgs[1]).toBe("string");
    expect(callArgs[4]).toMatchObject({
      width: expect.any(Number),
      height: expect.any(Number),
    });
  });

  it("draws a JPG logo via doc.image()", async () => {
    const jpgPath = "assets/logo.jpg";
    const contract = contractWithLogo(jpgPath);
    mockGet.mockReturnValue(contract);

    await drawMasthead(mockDoc);

    const imageCall = getAllMockDataArgs(mockDoc, "image")[0];

    expect(imageCall.length).toBe(2);
    expect(imageCall[0]).toContain("assets/logo.jpg");

    expect(imageCall[1]).toMatchObject({
      width: 50,
      height: 50,
    });
  });

  it("writes the current date and invoice number", async () => {
    const svgPath = mockStyle.logoPath;
    const contract = contractWithLogo(svgPath);

    mockGet.mockReturnValue(contract);

    const mockSvgContent = '<svg viewBox="0 0 200 100"></svg>';
    (fs.readFileSync as ReturnType<typeof vi.fn>).mockReturnValue(
      mockSvgContent,
    );
    vi.mocked(SVGtoPDF).mockImplementation(() => {});

    await drawMasthead(mockDoc);

    const docFont = {
      title: { style: "bold-font", size: 20 },
      date: { style: "regular-font", size: 10.5 },
      invoice: { style: "regular-font", size: 10.5 },
    };

    const fontStyle = getFirstMockDataArg(mockDoc, "font");
    const fontSize = getFirstMockDataArg(mockDoc, "fontSize");
    const headerText = getFirstMockDataArg(mockDoc, "text");

    expect(headerText).toEqual([
      "INVOICE",
      `${DateTime.now().toLocaleString(DateTime.DATE_MED)}`,
      "#12345",
    ]);

    expect(fontStyle).toEqual([
      docFont.title.style,
      docFont.date.style,
      docFont.invoice.style,
    ]);

    expect(fontSize).toEqual([
      docFont.title.size,
      docFont.date.size,
      docFont.invoice.size,
    ]);
  });

  it("exits with an error for unsupported logo formats", async () => {
    const contract = contractWithLogo("assets/logo.png");
    mockGet.mockReturnValue(contract);

    (fs.readFileSync as ReturnType<typeof vi.fn>).mockReturnValue("");

    const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called");
    });

    await expect(drawMasthead(mockDoc)).rejects.toThrow("process.exit called");
    expect(exitSpy).toHaveBeenCalledWith(1);

    exitSpy.mockRestore();
  });
});
