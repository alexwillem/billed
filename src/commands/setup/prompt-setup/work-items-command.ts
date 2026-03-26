import chalk from "chalk";
import {
  ProjectDetailsCommands,
  parseCLIArgs,
} from "../../../config/commands.config.js";
import {
  ProjectDetails,
  WorkItem,
  isWorkItem,
} from "../../../types/profile-types.js";
import {
  buildItems,
  findItemIndex,
  setNewWorkItemID,
} from "../../../utils/command-utils.js";
import { projectContractManager } from "../../../utils/project-contract-manager.js";
import { CLICommandsENUM } from "../../../config/commands.config.js";
import { setTotalAmount } from "../../../utils/invoice-calculations.js";

export function configureWorkItemsCMD(
  args: string[],
): { content: WorkItem[]; billedAmount: number } | undefined {
  const items = buildItems(args);
  const projectDetails =
    projectContractManager.get().projectDetails ?? ({} as ProjectDetails);
  const currentWorkItems = (projectDetails.workItems as WorkItem[]) ?? [];

  if (args.includes(CLICommandsENUM.ITEMS)) {
    console.log(chalk.cyan.bold("\n📊 Items\n"));
    console.log(projectDetails.workItems);
  }

  if (args.includes(ProjectDetailsCommands.RMV_ITEM)) {
    console.log(chalk.cyan.bold("\n📊 Item removed:\n"));
  }
  refactorItems(currentWorkItems, items, projectDetails);

  return {
    content: currentWorkItems,
    billedAmount: setTotalAmount().billedAmount,
  };
}

function refactorItems(
  currentItems: WorkItem[],
  newItems: string[][],
  projectDetails: ProjectDetails,
) {
  for (const item of newItems) {
    if (item[0] === ProjectDetailsCommands.ADD_ITEM) {
      const profileCmd = parseCLIArgs(item);
      const workItem = profileCmd.projectDetails?.workItems;

      if (isWorkItem(workItem)) {
        if (typeof workItem.rate === "string") {
          const refactorRateWithDot = workItem.rate.replace(/,/g, ".").trim();
          workItem.rate = refactorRateWithDot;
        }

        currentItems?.push({
          id: setNewWorkItemID(currentItems),
          activity: workItem.activity,
          rate: Number(workItem.rate),
          hours: workItem.hours,
        });

        projectDetails.workItems = currentItems;
      }
    }

    if (item[0] === ProjectDetailsCommands.RMV_ITEM) {
      const itemIndex = findItemIndex(projectDetails.workItems, item[1]);

      if (!!currentItems[itemIndex]) {
        console.log(currentItems[itemIndex]);
        currentItems?.splice(itemIndex, 1);
      } else {
        console.log(`Item ${item[1]} doesn't exist`);
      }
    }
  }
}
