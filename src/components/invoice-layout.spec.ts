import {
  mockContractInstance,
  mockThemeInstance,
} from "../../__mocks__/contract-info-mock.js";
import MockPDFDocument, {
  getAllMockDataArgs,
  getFirstMockDataArg,
} from "../../__mocks__/PDFDocument-mock.js";
import { projectContractManager } from "../utils/project-contract-manager.js";
import * as buildHeaders from "./invoice-headers.js";
import { createLayout } from "./invoice-layout.js";
import * as buildContent from "./invoice-content.js";
import * as drawMasthead from "./invoice-masthead.js";

vi.mock("../../../utils/project-contract-manager.ts");

describe("build layout", () => {
  const mockGet = vi.fn();
  let mockDoc: any;
  let mockTheme: any;
  let mockContract: any;
  let drawHeaderLayoutSpy: any;
  let buildHeadersSpy: any;
  let buildContentSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockDoc = new MockPDFDocument() as unknown as PDFKit.PDFDocument;
    mockTheme = structuredClone(mockThemeInstance);
    mockContract = structuredClone(mockContractInstance);

    vi.mocked(projectContractManager).get = mockGet;
    drawHeaderLayoutSpy = vi
      .spyOn(drawMasthead, "drawMasthead")
      .mockImplementation(async () => {});
    buildHeadersSpy = vi
      .spyOn(buildHeaders, "buildHeaders")
      .mockImplementation(() => {});
    buildContentSpy = vi
      .spyOn(buildContent, "buildContent")
      .mockImplementation(() => {});

    mockGet.mockReturnValue(mockContract);

    createLayout(mockDoc);
  });

  it("should draw headers", async () => {
    expect(drawHeaderLayoutSpy).toHaveBeenCalledTimes(1);
  });

  it("should build header & content", async () => {
    expect(buildHeadersSpy).toHaveBeenCalledTimes(1);
    expect(buildContentSpy).toHaveBeenCalledTimes(1);
  });

  it("should set moveDowns", async () => {
    const moveDowns = getFirstMockDataArg(mockDoc, "moveDown");

    expect(moveDowns).toEqual([4, 3]);
  });

  describe("note & footer", () => {
    let font: any;
    let fontSize: any;
    let text: any;
    let link: any;
    let fillColor: any;

    beforeEach(() => {
      font = getFirstMockDataArg(mockDoc, "font");
      fontSize = getFirstMockDataArg(mockDoc, "fontSize");
      text = getFirstMockDataArg(mockDoc, "text");
      link = getAllMockDataArgs(mockDoc, "link");
      fillColor = getFirstMockDataArg(mockDoc, "fillColor");

      console.log("font: ", font);
    });

    it("should define note", async () => {
      expect(font[0]).toEqual("regular-font");
      expect(fontSize[0]).toEqual(10.5);
      expect(text[0]).toEqual("test note");
      expect(fillColor[0]).toEqual("#121212");
    });

    it("should define footer", async () => {
      expect(font[1]).toEqual("regular-font");
      expect(font[2]).toEqual("bold-font");
      expect(fontSize[1]).toEqual(7);
      expect(text[1]).toEqual("Simply ");
      expect(text[2]).toEqual(">billed");
      expect(fillColor[1]).toEqual("#008043");
      expect(fillColor[2]).toEqual("black");
      expect(link[0]).toEqual([275, 940, 50, 8, "https://billed.dev/"]);
    });
  });
});
