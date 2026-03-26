import { CLICommandsENUM } from "./config/commands.config.js";

vi.mock("./commands/setup/guided-setup/guided-setup.js", () => ({
  runPromptGuide: vi.fn(),
}));

vi.mock("./commands/setup/prompt-setup/prompt-setup.js", () => ({
  runPromptCommands: vi.fn(),
}));

vi.mock("./components/invoice.js", () => ({
  invoice: {
    buildInvoice: vi.fn(),
  },
}));

vi.mock("./config/commands.config.js", () => ({
  CLICommandsENUM: {
    INIT_CONFIG: "--init-config",
    SUMMARY: "--summary",
    HELP: "--help",
    CREATE: "--create",
  },
  parseCLIArgs: vi.fn().mockReturnValue({}),
}));

vi.mock("./config/paths.config.js", () => ({
  initializeDirectories: vi.fn(),
}));

vi.mock("./config/profiles.config.js", () => ({
  setBilledAmountAsFinalHeader: vi.fn(),
}));

vi.mock("./utils/prompt-manager.js", () => ({
  promptManager: {
    returnErrorMessages: vi.fn().mockReturnValue([]),
    errorMessages: [],
  },
}));

vi.mock("./utils/project-contract-manager.js", () => ({
  projectContractManager: {
    get: vi.fn().mockReturnValue({
      pdfStyle: {},
      userProfile: {},
      clientProfile: {},
      projectDetails: {},
    }),
  },
}));

vi.mock("./utils/help-print-util.js", () => ({
  printHelp: vi.fn(),
}));

import { runPromptGuide } from "./commands/setup/guided-setup/guided-setup.js";
import { runPromptCommands } from "./commands/setup/prompt-setup/prompt-setup.js";
import { invoice } from "./components/invoice.js";
import { initializeDirectories } from "./config/paths.config.js";
import { promptManager } from "./utils/prompt-manager.js";
import { setBilledAmountAsFinalHeader } from "./config/profiles.config.js";
import { printHelp } from "./utils/help-print-util.js";
import { projectContractManager } from "./utils/project-contract-manager.js";

const mockExit = vi
  .spyOn(process, "exit")
  .mockImplementation((_code?: number) => undefined as never);

const mockConsoleLog = vi.spyOn(console, "log").mockImplementation(() => {});
const mockConsoleError = vi
  .spyOn(console, "error")
  .mockImplementation(() => {});

async function run(): Promise<void> {
  const { initializeDirectories } = await import("./config/paths.config.js");
  const { parseCLIArgs } = await import("./config/commands.config.js");
  const { runPromptGuide } =
    await import("./commands/setup/guided-setup/guided-setup.js");
  const { runPromptCommands } =
    await import("./commands/setup/prompt-setup/prompt-setup.js");
  const { invoice } = await import("./components/invoice.js");
  const { promptManager } = await import("./utils/prompt-manager.js");
  const { setBilledAmountAsFinalHeader } =
    await import("./config/profiles.config.js");
  const { projectContractManager } =
    await import("./utils/project-contract-manager.js");
  const { printHelp } = await import("./utils/help-print-util.js");
  const chalk = (await import("chalk")).default;

  initializeDirectories();

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

describe("bill.ts — run()", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.argv = ["node", "bill.js"];
  });

  describe("initializeDirectories", () => {
    it("always calls initializeDirectories on run", async () => {
      await run();
      expect(initializeDirectories).toHaveBeenCalledOnce();
    });
  });

  describe("--init-config", () => {
    it("calls runPromptGuide and exits with 0", async () => {
      process.argv = ["node", "bill.js", "--init-config"];
      vi.mocked(runPromptGuide).mockResolvedValue(undefined);

      await run();

      expect(runPromptGuide).toHaveBeenCalledOnce();
      expect(mockExit).toHaveBeenCalledWith(0);
    });

    it("logs error and exits with 1 when runPromptGuide throws", async () => {
      process.argv = ["node", "bill.js", "--init-config"];
      vi.mocked(runPromptGuide).mockRejectedValue(new Error("setup failed"));

      await run();

      expect(mockConsoleError).toHaveBeenCalledWith(
        "Error in --init-config:",
        expect.any(Error),
      );
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it("does not call runPromptCommands when --init-config is present", async () => {
      process.argv = ["node", "bill.js", "--init-config"];
      vi.mocked(runPromptGuide).mockResolvedValue(undefined);

      await run();

      expect(runPromptCommands).not.toHaveBeenCalled();
    });
  });

  describe("--summary", () => {
    it("logs all profile sections", async () => {
      process.argv = ["node", "bill.js", "--summary"];

      await run();

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining("pdf styling"),
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining("user info"),
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining("client info"),
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining("project info"),
      );
    });

    it("calls projectContractManager.get() for each section", async () => {
      process.argv = ["node", "bill.js", "--summary"];

      await run();

      expect(projectContractManager.get).toHaveBeenCalledTimes(4);
    });
  });

  describe("--help", () => {
    it("calls printHelp and exits with 0", async () => {
      process.argv = ["node", "bill.js", "--help"];

      await run();

      expect(printHelp).toHaveBeenCalledOnce();
      expect(mockExit).toHaveBeenCalledWith(0);
    });

    it("does not call buildInvoice when --help is present", async () => {
      process.argv = ["node", "bill.js", "--help"];

      await run();

      expect(invoice.buildInvoice).not.toHaveBeenCalled();
    });
  });

  describe("--create", () => {
    it("calls setBilledAmountAsFinalHeader and buildInvoice when no errors", async () => {
      process.argv = ["node", "bill.js", "--create"];
      vi.mocked(promptManager.returnErrorMessages).mockReturnValue([]);

      await run();

      expect(setBilledAmountAsFinalHeader).toHaveBeenCalledOnce();
      expect(invoice.buildInvoice).toHaveBeenCalledOnce();
    });

    it("logs error messages and does not build invoice when errors exist", async () => {
      process.argv = ["node", "bill.js", "--create"];
      vi.mocked(promptManager.returnErrorMessages).mockReturnValue([
        "define userName",
        "define invoiceNr",
      ]);
      vi.mocked(promptManager).errorMessages = [
        "define userName",
        "define invoiceNr",
      ];

      await run();

      expect(invoice.buildInvoice).not.toHaveBeenCalled();
      expect(setBilledAmountAsFinalHeader).not.toHaveBeenCalled();
      expect(mockConsoleLog).toHaveBeenCalledTimes(2);
    });
  });

  describe("no matching command", () => {
    it("calls runPromptCommands with config and args", async () => {
      process.argv = ["node", "bill.js", "--user-name", "John"];

      await run();

      expect(runPromptCommands).toHaveBeenCalledOnce();
    });

    it("does not call runPromptGuide", async () => {
      process.argv = ["node", "bill.js", "--user-name", "John"];

      await run();

      expect(runPromptGuide).not.toHaveBeenCalled();
    });
  });
});
