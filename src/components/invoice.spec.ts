import {
  mockContractInstance,
  mockThemeInstance,
} from "../../__mocks__/contract-info-mock.js";
import MockPDFDocument, {
  getFirstMockDataArg,
} from "../../__mocks__/PDFDocument-mock.js";
import { projectContractManager } from "../utils/project-contract-manager.js";
import { invoice } from "./invoice.js";
import { createLayout } from "./invoice-layout.js";
import PDFKit from "pdfkit";

vi.mock("pdfkit", () => ({ default: vi.fn() }));
vi.mock("./invoice-layout.js", () => ({ createLayout: vi.fn() }));
vi.mock("fs", async (importOriginal) => {
  const actual = await importOriginal<typeof import("fs")>();
  return {
    default: {
      ...actual,
      createWriteStream: vi.fn(() => {
        const listeners: Record<string, Function> = {};
        const stream = {
          on: vi.fn((event: string, cb: Function) => {
            listeners[event] = cb;
            if (event === "finish") setTimeout(() => cb(), 0);
            return stream;
          }),
        };
        return stream;
      }),
    },
  };
});

describe("build invoice", () => {
  const mockGet = vi.fn();
  let mockDoc: any;
  let mockContract: any;
  let mockTheme: any;

  beforeEach(async () => {
    mockContract = structuredClone(mockContractInstance);
    mockTheme = structuredClone(mockThemeInstance);

    mockDoc = new MockPDFDocument() as unknown as PDFKit.PDFDocument;
    vi.mocked(PDFKit).mockImplementation(function () {
      return mockDoc;
    });

    vi.mocked(projectContractManager).get = mockGet;
    mockGet.mockReturnValue(mockContract);
    vi.mocked(createLayout).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("theming", () => {
    it("fills the background color from the theme", async () => {
      await invoice.buildInvoice();
      const fills = getFirstMockDataArg(mockDoc, "fill");
      expect(fills[0]).toBe("#FFFFFF");
    });

    it("fills the text color from the theme", async () => {
      await invoice.buildInvoice();
      const fillColors = getFirstMockDataArg(mockDoc, "fillColor");
      expect(fillColors[0]).toBe("#121212");
    });
  });

  describe("file output", () => {
    it("creates the write stream with the correct filename", async () => {
      const fs = await import("fs");
      await invoice.buildInvoice();

      const invoiceNumber = mockContract.projectDetails?.invoiceNumber;
      expect(fs.default.createWriteStream).toHaveBeenCalledWith(
        expect.stringContaining(`invoice-${invoiceNumber}.pdf`),
      );
    });

    it("resolves with the output path", async () => {
      const invoiceNumber = mockContract.projectDetails?.invoiceNumber;
      const result = await invoice.buildInvoice();

      expect(result).toContain(`invoice-${invoiceNumber}.pdf`);
    });

    it("rejects when the stream emits an error", async () => {
      const fs = await import("fs");
      const mockError = new Error("disk full");

      vi.mocked(fs.default.createWriteStream).mockReturnValueOnce({
        on: vi.fn((event: string, cb: Function) => {
          if (event === "error") setTimeout(() => cb(mockError), 0);
          return { on: vi.fn() };
        }),
      } as any);

      await expect(invoice.buildInvoice()).rejects.toThrow("disk full");
    });
  });

  describe("layout", () => {
    it("calls createLayout with the pdf document", async () => {
      await invoice.buildInvoice();
      expect(createLayout).toHaveBeenCalledWith(mockDoc);
    });

    it("calls doc.end() after createLayout completes", async () => {
      let createLayoutDone = false;
      vi.mocked(createLayout).mockImplementationOnce(async () => {
        createLayoutDone = true;
      });

      const endSpy = vi.spyOn(mockDoc, "end");
      await invoice.buildInvoice();

      expect(createLayoutDone).toBe(true);
      expect(endSpy).toHaveBeenCalled();
    });
  });
});
