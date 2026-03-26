import { confirm, select } from "@inquirer/prompts";
import chalk from "chalk";
import ora from "ora";
import { invoice } from "../../../components/invoice.js";
import {
  ProfileEnums,
  ProfileKey,
  ProjectDetails,
} from "../../../types/profile-types.js";
import { ProjectDetailsPrompts } from "../../../types/prompt-types.js";
import { createProfile } from "../../../utils/profile-utils.js";
import { projectContractManager } from "../../../utils/project-contract-manager.js";
import { promptManager } from "../../../utils/prompt-manager.js";
import { setTotalAmount } from "../../../utils/invoice-calculations.js";

const prompts = promptManager.prompts;

// Main interactive flow
export async function runPromptGuide() {
  // Banner
  console.log(
    chalk.greenBright.bold("\nBilled"),
    chalk.greenBright("- The terminal's invoice generator\n"),
  );

  try {
    await projectContractManager.load();

    const hasContract: boolean = await projectContractManager.hasContract();

    if (hasContract) {
      const useExisting = await select({
        message: "Business profile:",
        choices: [
          { name: "✓ Use current profile", value: true },
          { name: "✎ Edit profile", value: false },
        ],
      });

      if (!useExisting) {
        console.log(chalk.magentaBright.bold("\n📋 User Information\n"));

        await createProfile(prompts.pdfStyle, "pdfStyle");
        await createProfile(prompts.userProfile, "userProfile");
      }
    } else {
      console.log(chalk.yellow("⚠️  No business profile found."));
      const shouldCreate = await confirm({
        message: "Would you like to create one now?",
        default: true,
      });

      if (shouldCreate) {
        console.log(chalk.magentaBright.bold("\n📋 User Information\n"));

        await createProfile(prompts.pdfStyle, "pdfStyle");
        await createProfile(prompts.userProfile, "userProfile");
      } else {
        console.log(
          chalk.red("❌ Business profile required. Run: bill --init-config"),
        );
        process.exit(1);
      }
    }

    console.log(
      chalk.green(
        `✓ Using profile: ${projectContractManager.get().userProfile?.name}\n`,
      ),
    );

    console.log(chalk.magentaBright.bold("\n📋 Client Information\n"));
    await createProfile(prompts.clientProfile, "clientProfile");

    console.log(chalk.magentaBright.bold("\n📋 Project Information\n"));
    await createProfile(prompts.projectDetails, "projectDetails");

    projectContractManager.save();

    const confirmCreate = await confirm({
      message: "Generate PDF invoice?",
      default: true,
    });

    if (!confirmCreate) {
      console.log(chalk.yellow("Invoice generation cancelled."));
      process.exit(0);
    }

    const spinner = ora("Generating invoice PDF...").start();
    await invoice.buildInvoice();
    spinner.succeed(chalk.greenBright("\nInvoicing completed! 🎉"));
  } catch (error: any) {
    console.error(chalk.red("\n❌ Error:"), error.message);
    process.exit(1);
  }
}

export async function configureWorkItemsGuided(
  projectDetailsPrompts: ProjectDetailsPrompts,
) {
  const descriptions: {
    [x: string]: any;
  }[] = [];

  let addMore = true;
  while (addMore) {
    const description: {
      [x: string]: any;
    } = await promptManager.buildPrompts(
      projectDetailsPrompts,
      descriptions.length,
    );

    descriptions.push({ id: descriptions.length + 1, ...description });

    const action = await select({
      message: "What next?",
      choices: [
        { name: "+ Add another item", value: "add" },
        {
          name: "✗ Remove last item",
          value: "remove",
          disabled: descriptions.length === 1,
        },
        { name: "→ Continue to summary", value: "continue" },
      ],
    });

    if (action === "remove") {
      descriptions.pop();
      console.log(chalk.yellow("Last item removed."));
    } else if (action === "continue") {
      addMore = false;
    }

    const projectDetails = {
      workItems: descriptions,
      amount: setTotalAmount().billedAmount.toFixed(2),
    } as ProjectDetails;

    projectContractManager.update(
      ProfileEnums.PROJECT_DETAILS as ProfileKey,
      projectDetails,
    );

    returnSummaryPrompt(descriptions);
  }
}

async function returnSummaryPrompt(descriptions: { [x: string]: any }[]) {
  const currencySymbol =
    projectContractManager.get().projectDetails?.currency ?? "$";
  const totalHours = descriptions.reduce((sum, desc) => sum + desc.hours, 0);

  console.log(chalk.magentaBright.bold("\n📊 Invoice Basics\n"));
  console.log(
    chalk.white(`From: ${projectContractManager.get().userProfile?.name}`),
  );
  console.log(
    chalk.white(`To: ${projectContractManager.get().clientProfile?.name}`),
  );
  console.log(
    chalk.white(
      `Payment due date: ${projectContractManager.get().projectDetails?.paymentDueDate}`,
    ),
  );
  console.log(chalk.white(`\nWork performed:`));
  descriptions.forEach((desc, i) => {
    console.log(
      chalk.gray(
        `  ${i + 1}. ${desc.activity}  (${currencySymbol}${desc.rate}) (${desc.hours}h)`,
      ),
    );
  });
  console.log(chalk.green(`\nTotal hours: ${totalHours}h`));
  console.log(
    chalk.green(
      `Total amount: ${currencySymbol}${setTotalAmount().itemsAmount}\n`,
    ),
  );
}
