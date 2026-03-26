import { ProjectDetailsCommands } from "../config/commands.config.js";
import { UserProfile, WorkItem } from "../types/profile-types.js";
import { AddressPrompts } from "../types/prompt-types.js";

export function findItemIndex(
  args: string[] | WorkItem | WorkItem[] | undefined,
  cmd: string,
): number {
  if (Array.isArray(args)) {
    return args.findIndex((arg) =>
      typeof arg === "string" ? arg === cmd : arg.id === Number(cmd),
    );
  }
  return -1;
}

export function buildItems(args: string[]): string[][] {
  const workItemArgs = filterItems(args);
  const groupedArgs: string[][] = [];
  let currentGroup: string[] = [];

  for (const arg of workItemArgs) {
    if (
      arg === ProjectDetailsCommands.ADD_ITEM ||
      arg === ProjectDetailsCommands.RMV_ITEM
    ) {
      if (currentGroup.length > 0) {
        groupedArgs.push(currentGroup);
      }
      currentGroup = [arg];
    } else {
      currentGroup.push(arg);
    }
  }

  if (currentGroup.length > 0) {
    groupedArgs.push(currentGroup);
  }

  return groupedArgs;
}

function filterItems(args: string[]): string[] {
  const filteredArgs: string[] = [];
  const workItemFlags = [
    ProjectDetailsCommands.ADD_ITEM,
    ProjectDetailsCommands.RMV_ITEM,
    ProjectDetailsCommands.HOURS,
    ProjectDetailsCommands.RATE,
  ];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (workItemFlags.some((workItemArg) => arg === workItemArg)) {
      filteredArgs.push(arg);
      const argValPosition = i + 1;

      if (arg.startsWith("--") && argValPosition < args.length) {
        filteredArgs.push(args[argValPosition]);
        i++;
      }
    }
  }
  return filteredArgs;
}

export function setNewWorkItemID(workItems: WorkItem[]): number {
  const maxId =
    workItems.length > 0 ? Math.max(...workItems.map((item) => item.id)) : 0;

  return maxId + 1;
}

export function isAddressPrompts(prompts: unknown): prompts is AddressPrompts {
  if (!prompts || typeof prompts !== "object") return false;

  const obj = prompts as Record<string, unknown>;
  const requiredKeys = ["street", "city", "postal", "country"];

  return requiredKeys.every((key) => {
    const value = obj[key];
    return value && typeof value === "object" && "name" in value;
  });
}
