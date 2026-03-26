import MockPDFDocument, {
  getFirstMockDataArg,
} from "../../__mocks__/PDFDocument-mock.js";
import { mockContractInstance } from "../../__mocks__/contract-info-mock.js";
import { PATHS } from "../config/paths.config.js";
import { contentRow, font } from "../config/pdf-style.config.js";
import { MockRow } from "../../__mocks__/mock-types.js";
import { projectContractManager } from "../utils/project-contract-manager.js";
import { buildContent } from "./invoice-content.js";

const mockGet = vi.fn();
let mockDoc: any;
let content: any;

describe("build content", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockDoc = new MockPDFDocument();

    vi.mocked(projectContractManager).get = mockGet;
    mockGet.mockReturnValue(mockContractInstance);

    buildContent(mockDoc as unknown as PDFKit.PDFDocument);
  });

  describe("styling", () => {
    it("should set fontFamily", () => {
      content = getFirstMockDataArg(mockDoc, "font");
      let isFontFamily = false;

      for (let i = 0; i < content.length; i++) {
        isFontFamily =
          content[i] === PATHS.FONTS.REGULAR || content[i] === PATHS.FONTS.BOLD;
      }

      expect(isFontFamily).toBeTruthy();
    });

    it("should set fontSize", () => {
      content = getFirstMockDataArg(mockDoc, "fontSize");

      expect(content[0]).toEqual(14);
      expect(content[1]).toEqual(10.5);
    });

    it("should apply rowStyles", () => {
      content = getFirstMockDataArg(mockDoc, "row");

      for (let i = 0; i < content.length; i++) {
        content[i].forEach((row: MockRow) => {
          expect(row.textColor).toEqual(font.colorLightTheme);

          if (!!row.padding) {
            expect(row.padding).toEqual(contentRow.primaryPadding);
          }
          if (!!row.align) {
            expect(row.align).toEqual({ x: "left" });
          }
        });
      }
    });
  });

  describe("rows", () => {
    beforeEach(() => {
      content = getFirstMockDataArg(mockDoc, "row");
    });

    it("should add headers", () => {
      const headerContent = content[0];

      expect(headerContent).toEqual([
        expect.objectContaining({ text: "DESCRIPTION" }),
        expect.objectContaining({ text: "HOURS" }),
        expect.objectContaining({ text: "PRICE ($)" }),
        expect.objectContaining({ text: "AMOUNT ($)" }),
      ]);
    });

    it("should add workItems", () => {
      const rows = getFirstMockDataArg(mockDoc, "row");
      const activityOne = rows[1];

      expect(activityOne).toEqual([
        expect.objectContaining({ text: "activity 1" }),
        expect.objectContaining({ text: "8" }),
        expect.objectContaining({ text: "100.00" }),
        expect.objectContaining({ text: "800.00" }),
      ]);

      const activityTwo = rows[2];

      expect(activityTwo).toEqual([
        expect.objectContaining({ text: "activity 2" }),
        expect.objectContaining({ text: "4" }),
        expect.objectContaining({ text: "50.00" }),
        expect.objectContaining({ text: "200.00" }),
      ]);
    });

    it("should add footers", () => {
      const rows = getFirstMockDataArg(mockDoc, "row");
      const subTotal = rows[3];

      expect(subTotal).toEqual([
        expect.objectContaining({
          text: "SUBTOTAL",
          textColor: "#121212",
          colSpan: 3,
        }),
        expect.objectContaining({ text: "1000.00", textColor: "#121212" }),
      ]);

      const taxAmount = rows[4];

      expect(taxAmount).toEqual([
        expect.objectContaining({
          text: "TAX 10%",
          textColor: "#121212",
          colSpan: 3,
        }),
        expect.objectContaining({ text: "100.00", textColor: "#121212" }),
      ]);

      const totalAmount = rows[5];

      expect(totalAmount).toEqual([
        expect.objectContaining({
          text: "TOTAL",
          colSpan: 3,
        }),
        expect.objectContaining({ text: "$ 1100.00", textColor: "#121212" }),
      ]);
    });
  });
});
