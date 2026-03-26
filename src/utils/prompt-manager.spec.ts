import { mockContractInstance } from "../../__mocks__/contract-info-mock.js";
import { PromptManager } from "./prompt-manager.js";
import { projectContractManager } from "./project-contract-manager.js";
import { setInvoiceTheme } from "./pdfStyle-utils.js";

vi.mock("@inquirer/prompts", () => ({
  input: vi.fn(),
  number: vi.fn(),
  select: vi.fn(),
  confirm: vi.fn(),
}));

vi.mock("./project-contract-manager.js", () => ({
  projectContractManager: {
    get: vi.fn(),
  },
}));

vi.mock("./pdfStyle-utils.js", () => ({
  setInvoiceTheme: vi.fn(),
}));

vi.mock("./command-utils.js", () => ({
  isAddressPrompts: vi.fn(),
}));

import { input, number, select } from "@inquirer/prompts";
import { isAddressPrompts } from "./command-utils.js";

describe("PromptManager", () => {
  let promptManager: PromptManager;

  beforeEach(() => {
    vi.clearAllMocks();
    promptManager = new PromptManager();

    vi.mocked(projectContractManager).get = vi
      .fn()
      .mockReturnValue(mockContractInstance);
  });

  describe("buildPrompts", () => {
    it("iterates over message group and returns answers for each key", async () => {
      vi.mocked(isAddressPrompts).mockReturnValue(false);
      vi.mocked(input).mockResolvedValue("Test Answer");

      const messageGroup = {
        name: { type: "input", message: "Name:", required: true },
        bank: { type: "input", message: "Bank:", required: true },
      };

      const result = await promptManager.buildPrompts(messageGroup as any);

      expect(result).toEqual({
        name: "Test Answer",
        bank: "Test Answer",
      });
    });

    it("calls buildAddress when isAddressPrompts returns true", async () => {
      vi.mocked(isAddressPrompts).mockImplementation(
        (val) => typeof val === "object" && "street" in val,
      );
      vi.mocked(input).mockResolvedValue("Test address");

      const messageGroup = {
        address: {
          street: { type: "input", message: "Street:" },
          city: { type: "input", message: "City:" },
        },
      };

      const result = await promptManager.buildPrompts(messageGroup as any);

      expect(result.address).toEqual({
        street: "Test address",
        city: "Test address",
      });
    });

    it("calls setInvoiceTheme when answers contain a theme key", async () => {
      vi.mocked(isAddressPrompts).mockReturnValue(false);
      vi.mocked(input).mockResolvedValue("dark");
      vi.mocked(setInvoiceTheme).mockReturnValue({ background: "#000" } as any);

      const messageGroup = {
        theme: { type: "input", message: "Theme:", required: false },
      };

      await promptManager.buildPrompts(messageGroup as any);

      expect(setInvoiceTheme).toHaveBeenCalledWith("dark");
    });

    it("passes itemNumber to runPrompt", async () => {
      vi.mocked(isAddressPrompts).mockReturnValue(false);
      vi.mocked(input).mockResolvedValue("answer");

      const messageGroup = {
        activity: {
          type: "input",
          message: "Activity {{messageUnit}}:",
          required: true,
        },
      };

      await promptManager.buildPrompts(messageGroup as any, 2);

      expect(input).toHaveBeenCalled();
    });
  });

  describe("runPrompt", () => {
    it("calls input() for type 'input'", async () => {
      vi.mocked(input).mockResolvedValue("some input");

      const result = await promptManager.runPrompt({
        type: "input",
        message: "Enter value:",
        required: true,
      } as any);

      expect(input).toHaveBeenCalled();
      expect(result).toBe("some input");
    });

    it("calls number() for type 'number' and returns result", async () => {
      vi.mocked(number).mockResolvedValue(42);

      const result = await promptManager.runPrompt({
        type: "number",
        message: "Enter number:",
        required: true,
      } as any);

      expect(number).toHaveBeenCalled();
      expect(result).toBe(42);
    });

    it("returns 0 when number() resolves undefined", async () => {
      vi.mocked(number).mockResolvedValue(undefined);

      const result = await promptManager.runPrompt({
        type: "number",
        message: "Enter number:",
        required: false,
      } as any);

      expect(result).toBe(0);
    });

    it("calls select() for type 'select' with correct choices", async () => {
      vi.mocked(select).mockResolvedValue("option1");

      const result = await promptManager.runPrompt({
        type: "select",
        message: "Pick one:",
        choices: ["option1", "option2"],
      } as any);

      expect(select).toHaveBeenCalledWith(
        expect.objectContaining({
          choices: [
            { name: "option1", value: "option1" },
            { name: "option2", value: "option2" },
          ],
        }),
      );
      expect(result).toBe("option1");
    });

    it("throws an error for unknown prompt type", async () => {
      await expect(
        promptManager.runPrompt({
          type: "unknown",
          message: "Test:",
        } as any),
      ).rejects.toThrow("Unknown prompt type unknown");
    });

    it("uses default value for input prompt when provided", async () => {
      vi.mocked(input).mockResolvedValue("default value");

      await promptManager.runPrompt({
        type: "input",
        message: "Enter:",
        default: "default value",
        required: false,
      } as any);

      expect(input).toHaveBeenCalledWith(
        expect.objectContaining({ default: "default value" }),
      );
    });
  });

  describe("returnErrorMessages", () => {
    it("returns empty array when all required fields are present", () => {
      vi.mocked(projectContractManager).get = vi
        .fn()
        .mockReturnValue(mockContractInstance);

      const result = promptManager.returnErrorMessages();

      expect(result).toEqual([]);
    });

    it("returns error when userName is missing", () => {
      vi.mocked(projectContractManager).get = vi.fn().mockReturnValue({
        ...mockContractInstance,
        userProfile: { ...mockContractInstance.userProfile, name: "" },
      });

      const result = promptManager.returnErrorMessages();

      expect(result).toContain("define userName");
    });

    it("returns error when userBank is missing", () => {
      vi.mocked(projectContractManager).get = vi.fn().mockReturnValue({
        ...mockContractInstance,
        userProfile: { ...mockContractInstance.userProfile, bank: "" },
      });

      const result = promptManager.returnErrorMessages();

      expect(result).toContain("define userBank");
    });

    it("returns error when userAccountNr is missing", () => {
      vi.mocked(projectContractManager).get = vi.fn().mockReturnValue({
        ...mockContractInstance,
        userProfile: { ...mockContractInstance.userProfile, account: "" },
      });

      const result = promptManager.returnErrorMessages();

      expect(result).toContain("define userAccountNr");
    });

    it("returns error when clientName is missing", () => {
      vi.mocked(projectContractManager).get = vi.fn().mockReturnValue({
        ...mockContractInstance,
        clientProfile: { ...mockContractInstance.clientProfile, name: "" },
      });

      const result = promptManager.returnErrorMessages();

      expect(result).toContain("define clientName");
    });

    it("returns error when invoiceNr is missing", () => {
      vi.mocked(projectContractManager).get = vi.fn().mockReturnValue({
        ...mockContractInstance,
        projectDetails: {
          ...mockContractInstance.projectDetails,
          invoiceNumber: 0,
        },
      });

      const result = promptManager.returnErrorMessages();

      expect(result).toContain("define invoiceNr");
    });

    it("returns multiple errors when multiple required fields are missing", () => {
      vi.mocked(projectContractManager).get = vi.fn().mockReturnValue({
        ...mockContractInstance,
        userProfile: {
          ...mockContractInstance.userProfile,
          name: "",
          bank: "",
        },
      });

      const result = promptManager.returnErrorMessages();

      expect(result).toContain("define userName");
      expect(result).toContain("define userBank");
    });
  });
});
