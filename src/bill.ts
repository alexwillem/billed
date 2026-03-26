#!/usr/bin/env node

import chalk from "chalk";
import { runPromptGuide } from "./commands/setup/guided-setup/guided-setup.js";
import { runPromptCommands } from "./commands/setup/prompt-setup/prompt-setup.js";
import { invoice } from "./components/invoice.js";
import { CLICommandsENUM, parseCLIArgs } from "./config/commands.config.js";
import { promptManager } from "./utils/prompt-manager.js";
import { setBilledAmountAsFinalHeader } from "./config/profiles.config.js";
import { projectContractManager } from "./utils/project-contract-manager.js";
import { printHelp } from "./utils/help-print-util.js";

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

async function run(): Promise<void> {
  projectContractManager.initializeDirectories();

  const args = process.argv.slice(2);
  const config = parseCLIArgs(args);

  if (args.includes(CLICommandsENUM.INIT_CONFIG)) {
    try {
      await runPromptGuide();
      process.exit(0);
    } catch (err) {
      console.error("Error in --init-config:", err);
      process.exit(1);
    }
  } else {
    await runPromptCommands(config, args);
    if (args.includes(CLICommandsENUM.SUMMARY)) {
      console.log(chalk.cyan.bold("\npdf styling:\n"));
      console.log(projectContractManager.get().pdfStyle);

      console.log(chalk.cyan.bold("\nuser info:\n"));
      console.log(projectContractManager.get().userProfile);

      console.log(chalk.cyan.bold("\nclient info:\n"));
      console.log(projectContractManager.get().clientProfile);

      console.log(chalk.cyan.bold("\nproject info:\n"));
      console.log(projectContractManager.get().projectDetails);
    }
    if (args.includes(CLICommandsENUM.HELP)) {
      printHelp();
      process.exit(0);
    }
    if (args.includes(CLICommandsENUM.CREATE)) {
      if (promptManager.returnErrorMessages().length === 0) {
        setBilledAmountAsFinalHeader();

        await invoice.buildInvoice();
      } else {
        promptManager.errorMessages?.forEach((message) =>
          console.log(chalk.red(message)),
        );
      }
    }
  }
}
