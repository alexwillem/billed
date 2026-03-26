import {
  parseCLIArgs,
  isWorkItemCLICommand,
  isProfileCLICommand,
} from "./commands.config.js";

describe("CLI argument parser", () => {
  it("parses a simple user name flag", () => {
    const result = parseCLIArgs(["--user-name", "Alice"]);
    expect(result).toEqual({ userProfile: { name: "Alice" } });
  });

  it("converts numeric strings to numbers", () => {
    const result = parseCLIArgs(["--rate", "150", "--hours", "8"]);
    expect(result).toEqual({
      projectDetails: {
        workItems: { rate: 150, hours: 8 },
      },
    });
  });

  it("rejects simultaneous add‑item and rmv‑item", () => {
    expect(() => parseCLIArgs(["--add-item", "X", "--rmv-item", "1"])).toThrow(
      "run '--add-item' and '--rmv-item' as separate commands",
    );
  });

  describe("enum checkers", () => {
    it("recognises a valid work‑item command", () => {
      expect(isWorkItemCLICommand("--add-item")).toBe(true);
      expect(isWorkItemCLICommand("--logo")).toBe(false);
    });

    it("recognises a valid profile command", () => {
      expect(isProfileCLICommand("--user-email")).toBe(true);
      expect(isProfileCLICommand("--rate")).toBe(false);
    });
  });
});
