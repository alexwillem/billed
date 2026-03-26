import {
  mockActivityOne,
  mockActivityTwo,
  mockContractInstance,
  mockTotalAmount,
} from "../../../../__mocks__/contract-info-mock.js";
import { parseCLIArgs } from "../../../config/commands.config.js";
import {
  buildItems,
  findItemIndex,
  setNewWorkItemID,
} from "../../../utils/command-utils.js";
import { setTotalAmount } from "../../../utils/invoice-calculations.js";
import { projectContractManager } from "../../../utils/project-contract-manager.js";
import { configureWorkItemsCMD } from "./work-items-command.js";

vi.mock("../../../utils/project-contract-manager.ts");
vi.mock("../../../utils/invoice-calculations.ts");
vi.mock("../../../utils/command-utils.ts");

// Mock console.log
global.console = {
  ...console,
  log: vi.fn(),
};

const mockGet = vi.fn();
let mockArgs: any;
let activityOne: any;
let activityTwo: any;
let mockProfile: any;
let totalAmount: any;

describe("Configure Work Item commands", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    activityOne = structuredClone(mockActivityOne);
    activityTwo = structuredClone(mockActivityTwo);

    mockProfile = structuredClone(mockContractInstance);
    totalAmount = structuredClone(mockTotalAmount);

    vi.mocked(projectContractManager).get = mockGet;

    mockGet.mockReturnValue(mockProfile);

    vi.mocked(parseCLIArgs);
    vi.mocked(setTotalAmount).mockReturnValue(mockTotalAmount);
  });

  it("should log items", () => {
    mockArgs = ["--items"];
    vi.mocked(buildItems).mockReturnValue([mockArgs]);

    configureWorkItemsCMD(mockArgs);

    expect(mockGet).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("📊 Items"),
    );
    expect(console.log).toHaveBeenCalledWith(
      mockProfile.projectDetails.workItems,
    );
  });

  describe("remove items", () => {
    it("should remove items if id is available", () => {
      mockArgs = ["--rmv-item", "1"];
      vi.mocked(buildItems).mockReturnValue([mockArgs]);
      vi.mocked(findItemIndex).mockReturnValue(0);

      const result = configureWorkItemsCMD(mockArgs);

      expect(mockGet).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("📊 Item removed"),
      );
      expect(console.log).toHaveBeenCalledWith(mockActivityOne);
      expect(result).toEqual({
        content: [mockActivityTwo],
        billedAmount: mockTotalAmount.billedAmount,
      });
    });

    it("should return error log if id is unavailable", () => {
      mockArgs = ["--rmv-item", "3"];
      vi.mocked(buildItems).mockReturnValue([mockArgs]);
      vi.mocked(findItemIndex).mockReturnValue(-1);

      const result = configureWorkItemsCMD(mockArgs);

      expect(mockGet).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("Item 3 doesn't exist"),
      );
      expect(console.log).not.toHaveBeenCalledWith(mockActivityOne);

      expect(result).toEqual({
        content: [mockActivityOne, mockActivityTwo],
        billedAmount: mockTotalAmount.billedAmount,
      });
    });
  });

  describe("return content", () => {
    let finalContent: any;
    beforeEach(() => {
      finalContent = [
        {
          activity: "activity 1",
          hours: 8,
          id: 1,
          rate: 100,
        },
        {
          activity: "activity 2",
          hours: 4,
          id: 2,
          rate: 50,
        },
        {
          activity: "activity 3",
          hours: 2,
          id: 3,
          rate: 25.5,
        },
      ];
    });
    it("should return item content & payment summary amount", () => {
      mockArgs = ["--add-item", "activity 3", "--rate", "25.5", "--hours", "2"];

      vi.mocked(buildItems).mockReturnValue([mockArgs]);
      vi.mocked(findItemIndex).mockReturnValue(0);
      vi.mocked(setNewWorkItemID).mockReturnValue(3);

      const result = configureWorkItemsCMD(mockArgs);

      expect(mockGet).toHaveBeenCalled();
      expect(console.log).not.toHaveBeenCalledWith(
        expect.stringContaining("📊 Invoice Summary"),
      );

      expect(result).toEqual({
        content: finalContent,
        billedAmount: mockTotalAmount.billedAmount,
      });
    });

    it("should replace comma with dot in workItem.rate and convert it to a number", () => {
      mockArgs = ["--add-item", "activity 3", "--rate", "25,5", "--hours", "2"];

      vi.mocked(buildItems).mockReturnValue([mockArgs]);
      vi.mocked(findItemIndex).mockReturnValue(0);
      vi.mocked(setNewWorkItemID).mockReturnValue(3);

      const result = configureWorkItemsCMD(mockArgs);

      expect(result).toEqual({
        content: finalContent,
        billedAmount: mockTotalAmount.billedAmount,
      });
    });
  });
});
