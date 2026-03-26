import { mockContractInstance } from "../../__mocks__/contract-info-mock.js";
import {
  createProfile,
  filterHeaders,
  formatHeaderInfo,
} from "./profile-utils.js";
import { projectContractManager } from "./project-contract-manager.js";
import { promptManager } from "./prompt-manager.js";
import rawPrompts from "../config/prompt-config.json" with { type: "json" };
import { setDate } from "../config/profiles.config.js";
import {
  Address,
  Profile,
  ProfileEnums,
  ProfileKey,
  ProjectDetails,
} from "../types/profile-types.js";
import MockPDFDocument from "../../__mocks__/PDFDocument-mock.js";
import { HeaderEntries } from "../types/pdf-types.js";

vi.mock("../../../utils/prompt-manager");
vi.mock("../config/profiles.config");
vi.mock("../utils/prompt-manager", () => ({
  promptManager: {
    prompts: {
      projectDetails: {
        workItem: [
          { name: "activity", message: "Activity:" },
          { name: "rate", message: "Rate:" },
          { name: "hours", message: "Hours:" },
        ],
      },
    },
    buildPrompts: vi.fn(),
  },
}));

describe("for projectDetails", () => {
  let mockDoc: any;
  let projectDetailsPrompt: any;
  let userProfilePrompt: any;
  let pdfStylePrompts: any;
  let mockProjectContract: any;
  const mockGet = vi.fn();
  const mockUpdate = vi.fn();

  describe("createProfile", () => {
    beforeEach(() => {
      vi.clearAllMocks();

      projectDetailsPrompt = rawPrompts.projectDetails;
      userProfilePrompt = rawPrompts.userProfile;
      pdfStylePrompts = rawPrompts.pdfStyle;

      mockDoc = new MockPDFDocument() as unknown as PDFKit.PDFDocument;
      mockProjectContract = structuredClone(mockContractInstance);

      vi.mocked(projectContractManager).get = mockGet;
      mockGet.mockReturnValue(mockProjectContract);

      vi.mocked(promptManager.buildPrompts).mockResolvedValue(
        projectDetailsPrompt,
      );

      vi.mocked(setDate).mockReturnValue("01-01-1999");

      vi.mocked(projectContractManager).update = mockUpdate;

      createProfile(
        projectDetailsPrompt,
        ProfileEnums.PROJECT_DETAILS as ProfileKey,
      );
      createProfile(userProfilePrompt, ProfileEnums.USER_PROFILE as ProfileKey);
      createProfile(pdfStylePrompts, ProfileEnums.PDF_STYLE as ProfileKey);
    });

    it("should build prompts", async () => {
      expect(promptManager.buildPrompts).toHaveBeenCalledWith({
        currency: projectDetailsPrompt.currency,
        invoiceNumber: projectDetailsPrompt.invoiceNumber,
        paymentDueDate: projectDetailsPrompt.paymentDueDate,
        paymentLink: projectDetailsPrompt.paymentLink,
      });

      expect(promptManager.buildPrompts).toHaveBeenCalledWith({
        account: userProfilePrompt.account,
        address: userProfilePrompt.address,
        bank: userProfilePrompt.bank,
        email: userProfilePrompt.email,
        name: userProfilePrompt.name,
        vatRate: userProfilePrompt.vatRate,
      });
      expect(promptManager.buildPrompts).toHaveBeenCalledWith({
        logoPath: pdfStylePrompts.logoPath,
        theme: pdfStylePrompts.theme,
      });
    });
    it("should update projectManager", () => {
      expect(projectContractManager.update).toHaveBeenCalledWith(
        ProfileEnums.PROJECT_DETAILS,
        {
          activity: projectDetailsPrompt.activity,
          currency: projectDetailsPrompt.currency,
          hours: projectDetailsPrompt.hours,
          invoiceNumber: projectDetailsPrompt.invoiceNumber,
          paymentDueDate: "01-01-1999",
          paymentLink: projectDetailsPrompt.paymentLink,
          rate: projectDetailsPrompt.rate,
        },
      );
    });
  });

  describe("formatHeaderInfo", () => {
    let mockDoc: any;

    beforeEach(() => {
      mockDoc = {
        widthOfString: vi.fn((str) => str.length),
      };
    });

    it("returns empty rows when headerInfo is undefined", () => {
      const result = formatHeaderInfo(
        mockDoc,
        undefined,
        ProfileEnums.USER_PROFILE,
      );
      expect(result.rows).toEqual([]);
      expect(result.maxKeyWidth).toBe(0);
      expect(result.maxValueWidth).toBe(0);
    });

    it("formats USER_PROFILE correctly and excludes email, address, vatRate", () => {
      const result = formatHeaderInfo(
        mockDoc,
        mockContractInstance.userProfile,
        ProfileEnums.USER_PROFILE,
      );

      // Should include name, account, bank, logo but exclude email, address, vatRate
      expect(result.rows.some(([key]) => key.includes("name"))).toBe(true);
      expect(result.rows.some(([key]) => key.includes("account"))).toBe(true);
      expect(result.rows.some(([key]) => key.includes("bank"))).toBe(true);
      expect(result.rows.some(([key]) => key.includes("email"))).toBe(false);
      expect(result.rows.some(([key]) => key.includes("address"))).toBe(false);
      expect(result.rows.some(([key]) => key.includes("vatRate"))).toBe(false);
    });

    it("formats PROJECT_DETAILS correctly and excludes workItems, currency, invoiceNumber, paymentLink", () => {
      const result = formatHeaderInfo(
        mockDoc,
        mockContractInstance.projectDetails,
        ProfileEnums.PROJECT_DETAILS,
      );

      // Should include activity, rate, hours, paymentDueDate
      expect(result.rows.some(([key]) => key.includes("due date"))).toBe(true);
      expect(result.rows.some(([key]) => key.includes("workItems"))).toBe(
        false,
      );
      expect(result.rows.some(([key]) => key.includes("currency"))).toBe(false);
      expect(result.rows.some(([key]) => key.includes("invoiceNumber"))).toBe(
        false,
      );
      expect(result.rows.some(([key]) => key.includes("paymentLink"))).toBe(
        false,
      );
    });

    it('transforms paymentDueDate to "due date: "', () => {
      const result = formatHeaderInfo(
        mockDoc,
        mockContractInstance.projectDetails,
        ProfileEnums.PROJECT_DETAILS,
      );

      expect(result.rows.some(([key]) => key === "due date: ")).toBe(true);
    });

    it('transforms phoneNumber to "phone: "', () => {
      const result = formatHeaderInfo(
        mockDoc,
        mockContractInstance.clientProfile,
        ProfileEnums.USER_PROFILE,
      );

      expect(result.rows.some(([key]) => key === "phone: ")).toBe(true);
    });

    it("moves account field to the end of entries", () => {
      const result = formatHeaderInfo(
        mockDoc,
        mockContractInstance.userProfile,
        ProfileEnums.USER_PROFILE,
      );

      // Account should be the last entry in rows
      const accountRowIndex = result.rows.findIndex(([key]) =>
        key.includes("account"),
      );
      expect(accountRowIndex).toBe(result.rows.length - 1);
    });

    it("formats ADDRESS type by joining address properties with commas", () => {
      const result = formatHeaderInfo(
        mockDoc,
        mockContractInstance.userProfile.address,
        ProfileEnums.ADDRESS,
      );

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0][0]).toBe("address: ");
      expect(result.rows[0][1]).toContain(
        "Test Street 1, User TestCity, 1111, User TestCountry",
      );
    });

    it("handles empty string values correctly", () => {
      const headerInfo: Profile = {
        name: "",
        account: "123456789",
        vatRate: 10,
      };

      const result = formatHeaderInfo(
        mockDoc,
        headerInfo,
        ProfileEnums.USER_PROFILE,
      );

      // Empty name should be excluded, account should be included
      expect(result.rows.some(([key]) => key.includes("name"))).toBe(false);
      expect(result.rows.some(([key]) => key.includes("account"))).toBe(true);
    });

    it("calculates maxKeyWidth and maxValueWidth correctly", () => {
      const result = formatHeaderInfo(
        mockDoc,
        mockContractInstance.userProfile,
        ProfileEnums.USER_PROFILE,
      );

      expect(result.maxKeyWidth).toBeGreaterThan(0);
      expect(result.maxValueWidth).toBeGreaterThan(0);
    });
  });

  describe("setAddress (indirectly via formatHeaderInfo)", () => {
    it("joins address properties with commas and spaces", () => {
      const result = formatHeaderInfo(
        mockDoc,
        mockContractInstance.userProfile.address,
        ProfileEnums.ADDRESS,
      );

      expect(result.rows[0][1]).toContain(", ");
    });

    it("skips empty address properties", () => {
      const headerInfo: Address = {
        street: "123 Main St",
        city: "New York",
        postal: "10001",
        country: "USA",
      };

      const result = formatHeaderInfo(
        mockDoc,
        headerInfo,
        ProfileEnums.ADDRESS,
      );

      expect(result.rows[0][1]).not.toContain(", ,");
    });
  });

  describe("filterHeaders (indirectly via formatHeaderInfo)", () => {
    it("excludes specified keys for USER_PROFILE", () => {
      const headerInfo = {
        name: "John Doe",
        email: "john@example.com",
        vatRate: 20,
      };

      const result = formatHeaderInfo(
        mockDoc,
        headerInfo,
        ProfileEnums.USER_PROFILE,
      );

      expect(result.rows.some(([key]) => key.includes("email"))).toBe(false);
      expect(result.rows.some(([key]) => key.includes("vatRate"))).toBe(false);
    });

    it("excludes specified keys for PROJECT_DETAILS", () => {
      const headerInfo: ProjectDetails = {
        workItems: [
          {
            id: 1,
            activity: "Design",
            rate: 100,
            hours: 5,
          },
        ],
        currency: "USD",
        amount: "$1000",
        invoiceNumber: 12345,
      };

      const result = formatHeaderInfo(
        mockDoc,
        headerInfo,
        ProfileEnums.PROJECT_DETAILS,
      );

      expect(result.rows.some(([key]) => key.includes("currency"))).toBe(false);
      expect(result.rows.some(([key]) => key.includes("invoiceNumber"))).toBe(
        false,
      );
    });
  });

  // Add this block to your existing test file, ideally after the "filterHeaders (indirectly via formatHeaderInfo)" section

  describe("filterHeaders and excludeKeys helpers", () => {
    describe("excludeKeys", () => {
      it("removes specified UserProfile keys from the headers array", () => {
        const headers: HeaderEntries = [
          ["name", mockContractInstance.userProfile.name],
          ["email", mockContractInstance.userProfile.email],
          ["address", mockContractInstance.userProfile.address],
        ];
        const filteredHeaders = filterHeaders(headers, "userProfile");

        expect(filteredHeaders).toStrictEqual([["name", "Test User"]]);
      });

      it("removes specified ClientProfile keys from the headers array", () => {
        const headers: HeaderEntries = [
          ["workItems", mockContractInstance.projectDetails.workItems],
          ["currency", mockContractInstance.projectDetails.currency],
          ["invoiceNumber", mockContractInstance.projectDetails.invoiceNumber],
          [
            "paymentDueDate",
            mockContractInstance.projectDetails.paymentDueDate,
          ],
          ["amount", mockContractInstance.projectDetails.amount],
          ["paymentLink", mockContractInstance.projectDetails.paymentLink],
        ];
        const filteredHeaders = filterHeaders(headers, "projectDetails");

        expect(filteredHeaders).toStrictEqual([
          ["paymentDueDate", "Apr 12, 2026"],
          ["amount", "1000"],
        ]);
      });

      it("removes default keys from the headers array", () => {
        const headers: HeaderEntries = [
          ["name", mockContractInstance.clientProfile.name],
          ["email", mockContractInstance.clientProfile.email],
          ["address", mockContractInstance.clientProfile.address],
        ];
        const filteredHeaders = filterHeaders(headers, "clientProfile");

        expect(filteredHeaders).toStrictEqual([
          ["name", "Test Client"],
          ["email", "account_client@test.com"],
        ]);
      });
    });
  });
});
