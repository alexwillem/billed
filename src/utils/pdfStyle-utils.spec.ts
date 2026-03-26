import {
  mockContractInstance,
  mockThemeInstance,
} from "../../__mocks__/contract-info-mock.js";
import MockPDFDocument, {
  getAllMockDataArgs,
  getFirstMockDataArg,
} from "../../__mocks__/PDFDocument-mock.js";
import { headerColumn } from "../config/pdf-style.config.js";
import {
  setInvoiceTheme,
  setMaxColumnWidth,
  stylePayButton,
} from "./pdfStyle-utils.js";
import { projectContractManager } from "./project-contract-manager.js";

vi.mock("../../../utils/project-contract-manager.ts");
vi.mock("../../../utils/profile-utils.ts");

describe("pdfStyle utils", () => {
  vi.clearAllMocks();

  const mockGet = vi.fn();
  let mockProjectContract: any;
  let mockTheme: any;
  let mockDoc: any;

  beforeEach(() => {
    mockDoc = new MockPDFDocument() as unknown as PDFKit.PDFDocument;
    mockTheme = structuredClone(mockThemeInstance);
    mockProjectContract = structuredClone(mockContractInstance);

    vi.mocked(projectContractManager).get = mockGet;
    mockGet.mockReturnValue(mockProjectContract);
  });

  describe("setInvoiceTheme", () => {
    it("should set textColor & backgroundColor for light-theme", () => {
      expect(setInvoiceTheme("light").textColor).toBe("#121212");
      expect(setInvoiceTheme("light").backgroundColor).toBe("#F2F2F2");
    });

    it("should set textColor & backgroundColor for light-theme", () => {
      expect(setInvoiceTheme("dark").textColor).toBe("#F2F2F2");
      expect(setInvoiceTheme("dark").backgroundColor).toBe("#121212");
    });
  });

  describe("stylePayButton", () => {
    const assertButtonRendered = () => {
      const save = getFirstMockDataArg(mockDoc, "save");
      const backgroundColor = getFirstMockDataArg(mockDoc, "fillColor")[0];
      const backgroundOpacity = getFirstMockDataArg(mockDoc, "fillOpacity")[0];
      const backgroundShape = getFirstMockDataArg(mockDoc, "roundedRect")[0];

      const borderColor = getFirstMockDataArg(mockDoc, "strokeColor")[0];
      const borderOpacity = getFirstMockDataArg(mockDoc, "lineWidth")[0];
      const borderShape = getFirstMockDataArg(mockDoc, "roundedRect")[1];

      const textColor = getFirstMockDataArg(mockDoc, "fillColor")[1];
      const textFontSize = getFirstMockDataArg(mockDoc, "fontSize")[1];
      const textFontStyle = getFirstMockDataArg(mockDoc, "font")[0];
      const arrow = getFirstMockDataArg(mockDoc, "text")[0];
      const linkPosition = getFirstMockDataArg(mockDoc, "link")[0];

      return {
        save,
        backgroundColor,
        backgroundOpacity,
        backgroundShape,
        borderColor,
        borderOpacity,
        borderShape,
        textColor,
        textFontSize,
        textFontStyle,
        arrow,
        linkPosition,
      };
    };

    const assertButtonNotRendered = () => {
      const {
        save,
        backgroundColor,
        backgroundOpacity,
        backgroundShape,
        borderColor,
        borderOpacity,
        borderShape,
        textColor,
        textFontSize,
        textFontStyle,
        arrow,
        linkPosition,
      } = assertButtonRendered();

      expect(save.length).toBe(0);
      expect(backgroundColor).toBeUndefined();
      expect(backgroundOpacity).toBeUndefined();
      expect(backgroundShape).toBeUndefined();
      expect(borderColor).toBeUndefined();
      expect(borderOpacity).toBeUndefined();
      expect(borderShape).toBeUndefined();
      expect(textColor).toBeUndefined();
      expect(textFontSize).toBeUndefined();
      expect(textFontStyle).toBeUndefined();
      expect(arrow).toBeUndefined();
      expect(linkPosition).toBeUndefined();
    };

    it("draws a pay-button with the correct colors and link", () => {
      stylePayButton(mockDoc, mockContractInstance.projectDetails, 50, 50);

      const {
        save,
        backgroundColor,
        backgroundOpacity,
        backgroundShape,
        borderColor,
        borderOpacity,
        borderShape,
        textColor,
        textFontSize,
        textFontStyle,
        arrow,
        linkPosition,
      } = assertButtonRendered();

      expect(save.length).toBe(3);
      expect(backgroundColor).toBe("#00a155");
      expect(backgroundOpacity).toBe(0.08);
      expect(backgroundShape).toBe(46);

      expect(borderColor).toBe("#00a155");
      expect(borderOpacity).toBe(1);
      expect(borderShape).toBe(46);

      expect(textColor).toBe("#00a155");
      expect(textFontSize).toBe(10);
      expect(textFontStyle).toBe("regular-font");
      expect(arrow).toBe("→");
      expect(linkPosition).toBe(46);
    });

    it("does nothing when there is no amount (buttonWidth undefined)", () => {
      mockProjectContract.projectDetails.amount = undefined;
      stylePayButton(mockDoc, mockContractInstance.projectDetails, 50, 50);
      assertButtonNotRendered();
    });
  });

  describe("setMaxWidth", () => {
    it("should return keyWidth and valueWidth for a normal key-value pair", () => {
      // Mock projectContractManager to return no payment link
      mockGet.mockReturnValue({
        projectDetails: { paymentLink: "" },
      });

      const result = setMaxColumnWidth(mockDoc, {
        key: "amount: ",
        value: "500",
      });

      const keyStringWidth = mockDoc.widthOfString("test");
      const valueStringWidth = mockDoc.widthOfString("12345");

      expect(result.keyWidth).toBe(keyStringWidth + headerColumn.padding);
      expect(result.valueWidth).toBe(valueStringWidth + headerColumn.padding);
    });

    it("should add extra padding to valueWidth for 'amount: ' key when paymentLink exists", () => {
      mockGet.mockReturnValue({
        projectDetails: { paymentLink: "https://example.com/pay" },
      });

      const result = setMaxColumnWidth(mockDoc, {
        key: "amount: ",
        value: "500",
      });

      const keyStringWidth = mockDoc.widthOfString("amount: ");
      const valueStringWidth = mockDoc.widthOfString("500");

      expect(result.keyWidth).toBe(keyStringWidth + headerColumn.padding);
      expect(result.valueWidth).toBeGreaterThan(
        valueStringWidth + headerColumn.padding,
      );
    });
  });
});
