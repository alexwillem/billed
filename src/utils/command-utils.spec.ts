import { describe, it, expect } from "vitest";
import {
  findItemIndex,
  buildItems,
  setNewWorkItemID,
  isAddressPrompts,
} from "./command-utils.js";
import { mockContractInstance } from "../../__mocks__/contract-info-mock.js";
import { ProjectDetailsCommands } from "../config/commands.config.js";
import { WorkItem } from "../types/profile-types.js";

export const mkArgs = (...tokens: string[]) => tokens;

describe("findItemIndex", () => {
  it("returns the index of a matching string command", () => {
    const args = ["foo", "--add-item", "bar"];
    const idx = findItemIndex(args, ProjectDetailsCommands.ADD_ITEM);
    expect(idx).toBe(1);
  });

  it("returns the index of a matching WorkItem by numeric id", () => {
    const idx = findItemIndex(
      mockContractInstance.projectDetails.workItems,
      "2",
    );
    expect(idx).toBe(1);
  });

  it("returns -1 when the idx cannot be matched with cmd", () => {
    const idx = findItemIndex(
      mockContractInstance.projectDetails.workItems,
      "3",
    );
    expect(idx).toBe(-1);
  });
});

describe("buildItems", () => {
  it("groups consecutive flags with their values into sub‑arrays", () => {
    const args = mkArgs(
      ProjectDetailsCommands.ADD_ITEM,
      "test description 1",
      ProjectDetailsCommands.HOURS,
      "8",
      ProjectDetailsCommands.RATE,
      "120",
      ProjectDetailsCommands.ADD_ITEM,
      "test description 2",
      ProjectDetailsCommands.HOURS,
      "12",
      ProjectDetailsCommands.RATE,
      "100",
    );

    const groups = buildItems(args);
    expect(groups).toEqual([
      [
        ProjectDetailsCommands.ADD_ITEM,
        "test description 1",
        ProjectDetailsCommands.HOURS,
        "8",
        ProjectDetailsCommands.RATE,
        "120",
      ],
      [
        ProjectDetailsCommands.ADD_ITEM,
        "test description 2",
        ProjectDetailsCommands.HOURS,
        "12",
        ProjectDetailsCommands.RATE,
        "100",
      ],
    ]);
  });

  it("creates a single‑element group when a flag appears alone", () => {
    const args = mkArgs(ProjectDetailsCommands.ADD_ITEM);
    const groups = buildItems(args);

    expect(groups).toEqual([[ProjectDetailsCommands.ADD_ITEM]]);
  });

  it("ignores unrelated arguments (they never reach filterItems)", () => {
    const args = mkArgs("some", "random", "text");
    const groups = buildItems(args);

    expect(groups).toEqual([]);
  });

  it("preserves order of groups exactly as they appear", () => {
    const args = mkArgs(
      ProjectDetailsCommands.RMV_ITEM,
      "5",
      ProjectDetailsCommands.RMV_ITEM,
      "200",
    );

    const groups = buildItems(args);
    expect(groups).toEqual([
      [ProjectDetailsCommands.RMV_ITEM, "5"],
      [ProjectDetailsCommands.RMV_ITEM, "200"],
    ]);
  });
});

describe("setNewWorkItemID", () => {
  it("returns 1 when the list is empty", () => {
    expect(setNewWorkItemID([])).toBe(1);
  });

  it("returns maxId + 1 for a non‑empty list", () => {
    expect(
      setNewWorkItemID(mockContractInstance.projectDetails.workItems),
    ).toBe(3);
  });

  it("handles unsorted ids correctly", () => {
    const newItems: WorkItem[] = [
      { id: 99, activity: "activity 3", rate: 80, hours: 8 },
      { id: 2, activity: "activity 4", rate: 80, hours: 9 },
      { id: 55, activity: "activity 5", rate: 80, hours: 7 },
    ];
    expect(setNewWorkItemID(newItems)).toBe(100);
  });
});

describe("isAddressPrompts", () => {
  interface AddressPromptField {
    name: string;
    // other fields are irrelevant for the type guard
  }
  interface AddressPrompts {
    street: AddressPromptField;
    city: AddressPromptField;
    postal: AddressPromptField;
    country: AddressPromptField;
  }

  const good: AddressPrompts = {
    street: { name: "Street" },
    city: { name: "City" },
    postal: { name: "Postal" },
    country: { name: "Country" },
  };

  it("recognises a valid AddressPrompts object", () => {
    expect(isAddressPrompts(good)).toBe(true);
  });

  it("rejects null / undefined", () => {
    expect(isAddressPrompts(null)).toBe(false);
    expect(isAddressPrompts(undefined)).toBe(false);
  });

  it("rejects objects missing a required key", () => {
    const missingCity = {
      street: { name: "St" },
      // city omitted
      postal: { name: "PC" },
      country: { name: "CT" },
    };
    expect(isAddressPrompts(missingCity)).toBe(false);
  });

  it("rejects when a required field is not an object with a `name` prop", () => {
    const bad = {
      street: { name: "St" },
      city: "NotAnObject",
      postal: { name: "PC" },
      country: { name: "CT" },
    };
    expect(isAddressPrompts(bad)).toBe(false);
  });
});
