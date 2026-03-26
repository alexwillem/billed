import fs from "fs";
import {
  ProjectContractManager,
  projectContractManager,
} from "./project-contract-manager.js";
import { PATHS } from "../config/paths.config.js";
import { INITIAL_PROFILE } from "../config/profiles.config.js";
import { ProfileEnums, ProfileKey } from "../types/profile-types.js";
import { mockContractInstance } from "../../__mocks__/contract-info-mock.js";

// Mock dependencies
vi.mock("../config/paths.config.js", () => ({
  PATHS: {
    PROJECT_CONTRACT: "/test/path/contract.json",
    CONTRACTS_DIR: "/test/path/contracts",
  },
}));

vi.mock("../config/profiles.config.js", () => ({
  INITIAL_PROFILE: {
    projectDetails: {},
    userProfile: {},
    clientProfile: {},
  },
}));

vi.mock("fs", () => ({
  default: {
    existsSync: vi.fn(),
    mkdirSync: vi.fn(),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    accessSync: vi.fn(),
  },
}));

describe("ProjectContractManager", () => {
  let manager: ProjectContractManager;
  const mockFs = fs as typeof fs & {
    existsSync: ReturnType<typeof vi.fn>;
    mkdirSync: ReturnType<typeof vi.fn>;
    readFileSync: ReturnType<typeof vi.fn>;
    writeFileSync: ReturnType<typeof vi.fn>;
    accessSync: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("constructor", () => {
    it("does not create contracts directory if it already exists", () => {
      mockFs.existsSync.mockReturnValue(true);

      new ProjectContractManager();

      expect(mockFs.mkdirSync).not.toHaveBeenCalled();
    });

    it("creates contracts directory if it doesn't exist", () => {
      mockFs.existsSync.mockReturnValue(false);

      new ProjectContractManager();

      expect(mockFs.mkdirSync).toHaveBeenCalledWith(PATHS.CONTRACTS_DIR, {
        recursive: true,
      });
    });

    it("initializes empty contract file with {} if file is empty", () => {
      mockFs.readFileSync.mockReturnValue("");
      mockFs.existsSync.mockReturnValue(true);

      const manager = new ProjectContractManager();

      manager.initializeDirectories();

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        PATHS.PROJECT_CONTRACT,
        "{}",
      );
    });

    it("returns a copy of the contract, not the reference", () => {
      manager = new ProjectContractManager();

      const testContract = {
        projectDetails: {},
        userProfile: {},
        clientProfile: {},
      };

      (manager as any)["#contract"] = testContract;

      const result = manager.get();

      expect(result).toEqual(testContract);
      expect(result).not.toBe(testContract);
    });

    it("returns current contract state", () => {
      manager = new ProjectContractManager();

      manager.update(
        ProfileEnums.PROJECT_DETAILS as ProfileKey,
        mockContractInstance.projectDetails,
      );
      manager.update(
        ProfileEnums.USER_PROFILE as ProfileKey,
        mockContractInstance.userProfile,
      );

      const result = manager.get();

      expect(result.projectDetails).toEqual(
        mockContractInstance.projectDetails,
      );
      expect(result.userProfile).toEqual(mockContractInstance.userProfile);
    });
  });

  describe("functions()", () => {
    beforeEach(() => {
      manager = new ProjectContractManager();
    });
    describe("load()", () => {
      it("loads and parses contract data from file", async () => {
        const mockData = JSON.stringify({
          projectDetails: { activity: "Design" },
          userProfile: { name: "John" },
        });

        mockFs.existsSync.mockReturnValue(true);
        mockFs.readFileSync.mockReturnValue(mockData);

        const result = await manager.load();

        expect(mockFs.readFileSync).toHaveBeenCalledWith(
          PATHS.PROJECT_CONTRACT,
          "utf-8",
        );
        expect(result).toEqual({
          projectDetails: { activity: "Design" },
          userProfile: { name: "John" },
        });
      });

      it("returns INITIAL_PROFILE when file doesn't exist (ENOENT)", async () => {
        const error = new Error("File not found") as NodeJS.ErrnoException;
        error.code = "ENOENT";

        mockFs.existsSync.mockReturnValue(false);
        mockFs.readFileSync.mockImplementation(() => {
          throw error;
        });

        const result = await manager.load();

        expect(result).toEqual(INITIAL_PROFILE);
      });

      it("throws error for non-ENOENT errors", async () => {
        const error = new Error("Permission denied") as NodeJS.ErrnoException;
        error.code = "EACCES";

        mockFs.readFileSync.mockImplementation(() => {
          throw error;
        });

        await expect(manager.load()).rejects.toThrow("Permission denied");
      });

      it("handles JSON parse errors", async () => {
        mockFs.readFileSync.mockReturnValue("invalid json");

        await expect(manager.load()).rejects.toThrow();
      });
    });

    describe("save()", () => {
      it("writes contract data to file with formatting", () => {
        const testContract = {
          projectDetails: {},
          userProfile: {},
          clientProfile: {},
        };

        // Manually set internal state for testing
        (manager as any)["#contract"] = testContract;

        manager.save();

        expect(mockFs.writeFileSync).toHaveBeenCalledWith(
          PATHS.PROJECT_CONTRACT,
          JSON.stringify(testContract, null, 2),
        );
      });
    });
    describe("update()", () => {
      it("merges updates with existing profile", () => {
        manager.update("projectDetails", {
          ...mockContractInstance.projectDetails,
          currency: "$",
        });

        const result = manager.get().projectDetails?.currency;
        expect(result).toBe("$");

        manager.update(ProfileEnums.PROJECT_DETAILS as ProfileKey, {
          ...mockContractInstance.projectDetails,
          currency: "EUR",
        });
        const secondResult = manager.get().projectDetails?.currency;
        expect(secondResult).toBe("EUR");
      });

      it("creates new profile if it doesn't exist", () => {
        manager.update(ProfileEnums.CLIENT_PROFILE as ProfileKey, {
          name: "New Client",
        });

        const result = manager.get();
        expect(result.userProfile).toEqual({});
        expect(result.clientProfile).toEqual({ name: "New Client" });
      });
    });
    describe("replace()", () => {
      it("replaces designated profile elements", () => {
        const projectDetails = {
          currency: "$",
          paymentDueDate: "Apr 23, 2026",
          amount: "$ 24",
          paymentLink: "",
          workItems: [{ id: 1, activity: "asd", rate: 4, hours: 6 }],
          invoiceNumber: 123,
        };
        const newProjectDetails = {
          currency: "$",
          paymentDueDate: "Apr 23, 2026",
          paymentLink: "",
          workItems: [{ id: 1, activity: "asd", rate: 4, hours: 6 }],
          invoiceNumber: 212,
          amount: "$ 24",
        };

        manager.update(
          ProfileEnums.PROJECT_DETAILS as ProfileKey,
          projectDetails,
        );
        manager.update(
          ProfileEnums.USER_PROFILE as ProfileKey,
          mockContractInstance.userProfile,
        );

        expect(manager.get().projectDetails).toEqual(projectDetails);

        manager.replace(
          ProfileEnums.PROJECT_DETAILS as ProfileKey,
          newProjectDetails,
        );

        expect(manager.get().projectDetails).toEqual(newProjectDetails);
        expect(manager.get().userProfile).toEqual(
          mockContractInstance.userProfile,
        );
      });
    });
    describe("hasContract()", () => {
      it("returns true when contract file exists and has data", async () => {
        manager.update(
          ProfileEnums.CLIENT_PROFILE as ProfileKey,
          mockContractInstance.clientProfile,
        );

        manager.get();

        const result = await manager.hasContract();

        expect(mockFs.accessSync).toHaveBeenCalledWith(PATHS.PROJECT_CONTRACT);
        expect(result).toBe(true);
      });

      it("returns false when contract file doesn't exist", async () => {
        const error = new Error("File not found") as NodeJS.ErrnoException;
        error.code = "ENOENT";

        mockFs.accessSync.mockImplementation(() => {
          throw error;
        });

        const result = await manager.hasContract();

        expect(result).toBe(false);
      });
    });
  });

  describe("instance export", () => {
    it("exports singleton instance", () => {
      expect(projectContractManager).toBeInstanceOf(ProjectContractManager);
    });

    it("singleton instance has all methods", () => {
      expect(typeof projectContractManager.load).toBe("function");
      expect(typeof projectContractManager.save).toBe("function");
      expect(typeof projectContractManager.get).toBe("function");
      expect(typeof projectContractManager.update).toBe("function");
      expect(typeof projectContractManager.replace).toBe("function");
      expect(typeof projectContractManager.hasContract).toBe("function");
    });
  });
});
