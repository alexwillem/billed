import { describe, it, expect, vi, beforeEach } from "vitest";
import * as inquirerPrompts from "@inquirer/prompts";
import { setTotalAmount } from "../../../utils/invoice-calculations.js";
import { projectContractManager } from "../../../utils/project-contract-manager.js";
import { promptManager } from "../../../utils/prompt-manager.js";
import { configureWorkItemsGuided } from "./guided-setup.js";
import { ProjectDetails } from "../../../types/profile-types.js";

vi.mock("@inquirer/prompts");
vi.mock("../../../utils/prompt-manager");
vi.mock("../../../utils/project-contract-manager");
vi.mock("../../../utils/invoice-calculations");

// Mock console.log
global.console = {
  ...console,
  log: vi.fn(),
};

vi.mock("../../../utils/project-contract-manager", () => ({
  projectContractManager: {
    get: vi.fn().mockReturnValue({
      userProfile: { name: "Test User" },
      clientProfile: { name: "Test Client" },
      projectDetails: {
        paymentDueDate: "2023-12-31",
        paymentLink: "http://example.com/payment",
        currency: "$",
      },
    }),
    update: vi.fn(),
  },
}));

vi.mock("../../../utils/prompt-manager", () => ({
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

const mockSelect = vi.fn();
vi.mocked(inquirerPrompts).select = mockSelect;

describe("configure guided setup", () => {
  const projectDetailsPrompts = promptManager.prompts.projectDetails;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(promptManager.buildPrompts).mockResolvedValue({
      activity: "Test Activity",
      rate: 50,
      hours: 2,
    });
    vi.mocked(setTotalAmount).mockReturnValue({
      billedAmount: 150,
      itemsAmount: 150,
      vatAmount: 20,
    });
  });

  it("should add a work item and continue to summary", async () => {
    mockSelect.mockResolvedValueOnce("add");
    mockSelect.mockResolvedValueOnce("add");

    mockSelect.mockResolvedValueOnce("continue");

    await configureWorkItemsGuided(projectDetailsPrompts);

    expect(promptManager.buildPrompts).toHaveBeenCalledTimes(3);

    const lastCall = vi.mocked(projectContractManager.update).mock.calls[
      vi.mocked(projectContractManager.update).mock.calls.length - 1
    ];

    expect(lastCall[0]).toBe("projectDetails");
    expect(lastCall[1]).toEqual(
      expect.objectContaining({
        amount: "150.00",
        workItems: [
          {
            id: 1,
            activity: "Test Activity",
            rate: 50,
            hours: 2,
          },
          {
            id: 2,
            activity: "Test Activity",
            rate: 50,
            hours: 2,
          },
          {
            id: 3,
            activity: "Test Activity",
            rate: 50,
            hours: 2,
          },
        ],
      }),
    );
  });

  it("should remove the last work item if user selects 'remove'", async () => {
    mockSelect.mockResolvedValueOnce("add");
    mockSelect.mockResolvedValueOnce("remove");
    mockSelect.mockResolvedValueOnce("continue");

    await configureWorkItemsGuided(projectDetailsPrompts);

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("Last item removed."),
    );

    const lastCall = vi.mocked(projectContractManager.update).mock.calls[
      vi.mocked(projectContractManager.update).mock.calls.length - 1
    ];

    expect(lastCall[0]).toBe("projectDetails");
    expect(lastCall[1]).toEqual(
      expect.objectContaining({
        amount: "150.00",
        workItems: [
          {
            activity: "Test Activity",
            hours: 2,
            id: 1,
            rate: 50,
          },
          { activity: "Test Activity", hours: 2, id: 2, rate: 50 },
        ],
      }),
    );
  });

  it("should not allow removing the last item if only one exists", async () => {
    // First iteration: adds first item, user selects "continue"
    mockSelect.mockResolvedValueOnce("continue"); // Continue after first item

    await configureWorkItemsGuided(projectDetailsPrompts);

    // Verify that the select was called with disabled remove option
    expect(mockSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        choices: expect.arrayContaining([
          expect.objectContaining({
            name: "✗ Remove last item",
            value: "remove",
            disabled: true,
          }),
        ]),
      }),
    );

    // Check final state
    const lastCall = vi.mocked(projectContractManager.update).mock.calls[
      vi.mocked(projectContractManager.update).mock.calls.length - 1
    ];

    expect(lastCall[0]).toBe("projectDetails");
    expect(lastCall[1]).toEqual(
      expect.objectContaining({
        workItems: [
          {
            id: 1,
            activity: "Test Activity",
            rate: 50,
            hours: 2,
          },
        ],
      }),
    );
  });

  it("should continue adding items until user selects continue", async () => {
    // Add 3 items then continue
    mockSelect.mockResolvedValueOnce("add"); // After 1st item
    mockSelect.mockResolvedValueOnce("add"); // After 2nd item
    mockSelect.mockResolvedValueOnce("add"); // After 3rd item
    mockSelect.mockResolvedValueOnce("continue"); // After 4th item

    await configureWorkItemsGuided(projectDetailsPrompts);

    expect(promptManager.buildPrompts).toHaveBeenCalledTimes(4);

    const lastCall = vi.mocked(projectContractManager.update).mock.calls[
      vi.mocked(projectContractManager.update).mock.calls.length - 1
    ];

    expect((lastCall[1] as ProjectDetails).workItems).toHaveLength(4);
  });

  it("should display summary after each iteration", async () => {
    mockSelect.mockResolvedValueOnce("continue");

    await configureWorkItemsGuided(projectDetailsPrompts);

    // Check that summary is displayed
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("📊 Invoice Basics"),
    );
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("Test Client"),
    );
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("Total hours: 2h"),
    );
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("Total amount: $150"),
    );
  });
});
