import { mockThemeInstance } from "../../__mocks__/contract-info-mock";
import MockPDFDocument, {
  getFirstMockDataArg,
} from "../../__mocks__/PDFDocument-mock.js";
import { mockContractInstance } from "../../__mocks__/contract-info-mock.js";
import { projectContractManager } from "../utils/project-contract-manager.js";
import { buildHeaders } from "./invoice-headers.js";
import { font, headerRow } from "../config/pdf-style.config.js";
import * as pdfStyleUtils from "../utils/pdfStyle-utils.js";

vi.mock("../../../utils/project-contract-manager.ts");
vi.mock("../../../utils/profile-utils.ts");
vi.mock("../utils/profile-utils.js", () => ({
  formatHeaderInfo: vi.fn(),
}));

import { formatHeaderInfo } from "../utils/profile-utils.js";
import { PATHS } from "../config/paths.config.js";

describe("build headers", () => {
  const mockGet = vi.fn();

  let mockDoc: any;
  let mockTheme: any;
  let mockProjectContract: any;
  let content: any;
  let stylePayButtonSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockDoc = new MockPDFDocument() as unknown as PDFKit.PDFDocument;
    mockTheme = structuredClone(mockThemeInstance);
    mockProjectContract = structuredClone(mockContractInstance);

    vi.mocked(projectContractManager).get = mockGet;
    stylePayButtonSpy = vi
      .spyOn(pdfStyleUtils, "stylePayButton")
      .mockImplementation(() => {});

    mockGet.mockReturnValue(mockProjectContract);

    // ORDER MATTERS
    // Call 1: userInfo
    (formatHeaderInfo as any).mockReturnValueOnce({
      rows: [["name:", "Test User"]],
      maxKeyWidth: 100,
      maxValueWidth: 200,
    });

    // Call 2: projectDetailsInfo
    (formatHeaderInfo as any).mockReturnValueOnce({
      rows: [
        ["project:", "Test Project"],
        ["amount", "$1000"],
      ],
      maxKeyWidth: 80,
      maxValueWidth: 150,
    });

    // Call 3: clientInfo
    (formatHeaderInfo as any).mockReturnValueOnce({
      rows: [["client:", "ACME Corp"]],
      maxKeyWidth: 90,
      maxValueWidth: 180,
    });

    // Call 4: addressInfo
    (formatHeaderInfo as any).mockReturnValueOnce({
      rows: [["address:", "123 Main St"]],
      maxKeyWidth: 70,
      maxValueWidth: 160,
    });

    buildHeaders(mockDoc);
    content = getFirstMockDataArg(mockDoc, "row");
  });

  afterEach(() => {
    vi.restoreAllMocks(); // Restore spies after each test
  });

  describe("set tables", () => {
    it("sets the client Table", () => {
      expect(mockGet).toHaveBeenCalled();

      content = getFirstMockDataArg(mockDoc, "table");

      const clientTableConfig = content[0];

      expect(clientTableConfig).toEqual({
        columnStyles: [90, 180],
        defaultStyle: {
          border: headerRow.primaryBorder,
          padding: headerRow.primaryPadding,
          textColor: font.colorLightTheme,
        },
        maxWidth: 300,
        position: {
          x: 72,
          y: 72,
        },
      });
    });

    it("sets the client Table", () => {
      expect(mockGet).toHaveBeenCalled();

      content = getFirstMockDataArg(mockDoc, "table");

      const clientTableConfig = content[0];

      expect(clientTableConfig).toEqual({
        columnStyles: [90, 180],
        defaultStyle: {
          border: headerRow.primaryBorder,
          padding: headerRow.primaryPadding,
          textColor: font.colorLightTheme,
        },
        maxWidth: 300,
        position: {
          x: 72,
          y: 72,
        },
      });

      expect(getFirstMockDataArg(mockDoc, "end")).toBeTruthy();
    });

    it("sets the Payable Table", () => {
      expect(mockGet).toHaveBeenCalled();

      content = getFirstMockDataArg(mockDoc, "table");

      const clientTableConfig = content[1];

      expect(clientTableConfig).toEqual({
        columnStyles: [100, 200],
        defaultStyle: {
          border: headerRow.primaryBorder,
          padding: headerRow.primaryPadding,
          textColor: font.colorLightTheme,
        },
        maxWidth: 300,
        position: {
          x: 228,
          y: 72,
        },
      });

      expect(getFirstMockDataArg(mockDoc, "end")).toBeTruthy();
    });

    it("should move doc down by 6", () => {
      content = getFirstMockDataArg(mockDoc, "moveDown");
      expect(content).toEqual([4]);
    });
  });

  describe("set rows", () => {
    describe("client table", () => {
      let infoProps: any;

      beforeEach(() => {
        infoProps = [
          { header: "CLIENT" },
          { description: "client:", text: "ACME Corp" },
          { description: "address:", text: "123 Main St" },
          { header: "PAYMENT" },
          { description: "name:", text: "Test User" },
          { description: "project:", text: "Test Project" },
        ];

        content = getFirstMockDataArg(mockDoc, "row");
      });

      it("set table content", () => {
        expect(mockGet).toHaveBeenCalled();

        for (let i = 0; i < 6; i++) {
          const clientContent = content[i];

          if (i === 0 || i === 3) {
            expect(clientContent).toEqual([
              {
                colSpan: 2,
                font: {
                  size: 14,
                  src: PATHS.FONTS.BOLD,
                },
                text: infoProps[i].header,
              },
            ]);
          } else {
            expect(clientContent).toEqual([
              {
                text: infoProps[i].description,
                border: headerRow.secondaryBorder,
                padding: headerRow.secondaryPadding,
              },
              {
                text: infoProps[i].text,
                border: headerRow.secondaryBorder,
                padding: headerRow.secondaryPadding,
              },
            ]);
          }
        }
      });
    });
  });

  describe("set button", () => {
    it("should call stylePayButton with correct arguments", () => {
      expect(mockGet).toHaveBeenCalled();

      expect(stylePayButtonSpy).toHaveBeenCalledTimes(1);

      expect(stylePayButtonSpy).toHaveBeenCalledWith(
        mockDoc,
        expect.objectContaining(mockProjectContract.projectDetails),
        expect.any(Number),
        expect.any(Number),
      );
    });

    it("should calculate button position correctly", () => {
      const callArgs = stylePayButtonSpy.mock.calls[0];
      const [doc, projectDetails, buttonY, buttonX] = callArgs;

      expect(doc).toBe(mockDoc);
      expect(typeof buttonY).toBe("number");
      expect(typeof buttonX).toBe("number");
      expect(buttonY).toBeGreaterThan(0);
      expect(buttonX).toBeGreaterThan(0);
    });
  });
});
