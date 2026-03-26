// run-prompt-commands.spec.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  ProfileEnums,
  PdfStyle,
  ProjectDetails,
} from "../../../types/profile-types.js";
import { setInvoiceTheme } from "../../../utils/pdfStyle-utils.js";
import { projectContractManager } from "../../../utils/project-contract-manager.js";
import { runPromptCommands } from "./prompt-setup.js";
import { configureWorkItemsCMD } from "./work-items-command.js";
import { DateTime, Settings } from "luxon";

// Mock shared dependencies
vi.mock("./work-items-command");
vi.mock("../../../utils/pdfStyle-utils");

// Mock the projectContractManager
const mockLoad = vi.fn();
const mockGet = vi.fn();
const mockUpdate = vi.fn();
const mockSave = vi.fn();

vi.mocked(projectContractManager).load = mockLoad;
vi.mocked(projectContractManager).get = mockGet;
vi.mocked(projectContractManager).update = mockUpdate;
vi.mocked(projectContractManager).save = mockSave;

// Mock configureWorkItemsCMD
vi.mocked(configureWorkItemsCMD).mockReturnValue({
  content: [{ id: 1, activity: "Test Activity", rate: 50, hours: 2 }],
  billedAmount: 100,
});

// Mock setInvoiceTheme
vi.mocked(setInvoiceTheme).mockReturnValue({
  textColor: "light",
  backgroundColor: "dark",
});

describe("runPromptCommands", () => {
  const mockConfig = {
    [ProfileEnums.PDF_STYLE]: {
      theme: {
        textColor: "light",
        backgroundColor: "dark",
      },
      note: "test note",
      logoPath: "/path/to/logo.png",
    } as PdfStyle,
    [ProfileEnums.PROJECT_DETAILS]: {
      amount: "$ 100.00",
      currency: "$",
      invoiceNumber: 123456,
      paymentDueDate: "2023-12-31",
      paymentLink: "http://example.com/payment",
      workItems: [
        {
          activity: "Test Activity",
          hours: 2,
          id: 1,
          rate: 50,
        },
      ],
    } as ProjectDetails,
  };

  const mockArgs = ["--add", "Test Activity", "--rate", "50", "--hours", "2"];

  beforeEach(() => {
    vi.clearAllMocks();
    const expectedNow = DateTime.local(2026, 1, 1, 0, 0);
    Settings.now = () => expectedNow.toMillis();
    mockGet.mockReturnValue({
      pdfStyle: {
        theme: {
          textColor: "light",
          backgroundColor: "dark",
        },
        note: "test note",
        logoPath: "/path/to/old-logo.png",
      },
      projectDetails: {
        invoiceNumber: 123456,
        paymentDueDate: "",
        paymentLink: "http://example.com/old-payment",
        workItems: [],
        amount: "$ 0.00",
      },
    });
  });

  it("should update PDF style", async () => {
    await runPromptCommands(mockConfig, []);

    expect(mockLoad).toHaveBeenCalled();
    expect(mockGet).toHaveBeenCalled();
    expect(mockUpdate).toHaveBeenCalledWith(
      ProfileEnums.PDF_STYLE,
      expect.objectContaining({
        theme: {
          textColor: "light",
          backgroundColor: "dark",
        },
        note: "test note",
        logoPath: "/path/to/logo.png",
      }),
    );
    expect(mockSave).toHaveBeenCalled();
  });

  it("should update project details", async () => {
    await runPromptCommands(mockConfig, mockArgs);

    expect(mockLoad).toHaveBeenCalled();
    expect(mockGet).toHaveBeenCalled();
    expect(configureWorkItemsCMD).toHaveBeenCalledWith(mockArgs);
    expect(mockUpdate).toHaveBeenCalledWith(
      ProfileEnums.PROJECT_DETAILS,
      expect.objectContaining({
        invoiceNumber: 123456,
        paymentDueDate: "Jan 31, 2026",
        paymentLink: "http://example.com/payment",
        workItems: [{ id: 1, activity: "Test Activity", rate: 50, hours: 2 }],
        amount: "$ 100.00",
      }),
    );
    expect(mockSave).toHaveBeenCalled();
  });

  it("should update default profile", async () => {
    const mockDefaultConfig = {
      [ProfileEnums.USER_PROFILE]: {
        name: "Test User",
      },
    };

    await runPromptCommands(mockDefaultConfig, []);

    expect(mockLoad).toHaveBeenCalled();
    expect(mockUpdate).toHaveBeenCalledWith(
      ProfileEnums.USER_PROFILE,
      expect.objectContaining({
        name: "Test User",
      }),
    );
    expect(mockSave).toHaveBeenCalled();
  });
});
