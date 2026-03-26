import { input, number, select } from "@inquirer/prompts";
import Handlebars from "handlebars";
import rawPrompts from "../config/prompt-config.json" with { type: "json" };
import { Profile } from "../types/profile-types.js";
import {
  AddressPrompts,
  ProjectPrompts,
  Prompt,
} from "../types/prompt-types.js";
import { setInvoiceTheme } from "./pdfStyle-utils.js";
import { projectContractManager } from "./project-contract-manager.js";
import { isAddressPrompts } from "./command-utils.js";

export class PromptManager {
  public prompts = rawPrompts;
  public errorMessages: string[] = [];

  public async buildPrompts(
    messageGroup: ProjectPrompts,
    itemNumber?: number,
  ): Promise<Record<string, any>> {
    const answers: Record<string, any> = {};

    for (const [key, prompt] of Object.entries(messageGroup)) {
      if (isAddressPrompts(prompt)) {
        answers[key] = await this.buildAddress(prompt);
      } else {
        answers[key] = await this.runPrompt(prompt, itemNumber);
      }
    }

    if ("theme" in answers && typeof answers.theme === "string") {
      answers.theme = setInvoiceTheme(answers.theme);
    }

    return answers as Profile;
  }

  private async buildAddress(
    prompts: AddressPrompts,
  ): Promise<Record<string, string | number | boolean>> {
    const address: Record<string, string | number | boolean> = {};

    for (const [field, prompt] of Object.entries(prompts)) {
      address[field] = await this.runPrompt(prompt);
    }

    return address;
  }

  public async runPrompt(
    message: Prompt,
    itemNumber?: number,
  ): Promise<string | number | boolean> {
    const msg = this.setMessage(message, itemNumber);

    switch (message.type) {
      case "input":
        return await input({
          message: msg,
          default: message.default?.toString(),
          validate: (val) => this.runValidation(val, message),
        });

      case "number":
        const defaultValue =
          typeof message.default === "number" ? message.default : undefined;
        const result = await number({
          message: msg,
          default: defaultValue,
          validate: (val) => this.runValidation(val, message),
        });

        return result ?? 0;

      case "select":
        return await select({
          message: msg,
          choices: message.choices!.map((choice) => ({
            name: choice,
            value: choice,
          })),
        });

      case "confirm":
        return await confirm(msg);

      default:
        throw new Error(`Unknown prompt type ${message.type}`);
    }
  }

  private runValidation(value: string | number | undefined, message: Prompt) {
    //TODO: improve this & check required prompts!

    const stringVal = value?.toString();
    if (!message.required && stringVal?.trim() === "") return true;

    if (
      (!stringVal && message.required) ||
      (stringVal &&
        message.pattern &&
        !new RegExp(message.pattern).test(stringVal))
    ) {
      return message.validateError ?? "Invalid input";
    }

    return true;
  }

  private setMessage(message: Prompt, itemNumber: number | undefined): string {
    const template = Handlebars.compile(message.message);

    const context = {
      messageUnit: itemNumber != null ? itemNumber + 1 : undefined,
      currency: projectContractManager.get().projectDetails?.currency,
    };

    return template(context);
  }

  public returnErrorMessages(): string[] {
    const userProfile = projectContractManager.get().userProfile;
    const clientProfile = projectContractManager.get().clientProfile;
    const projectDetails = projectContractManager.get().projectDetails;

    const requiredContent = {
      userName: !!userProfile?.name,
      userBank: !!userProfile?.bank,
      userAccountNr: !!userProfile?.account,
      clientName: !!clientProfile?.name,
      invoiceNr: !!projectDetails?.invoiceNumber,
    };

    for (const [key, value] of Object.entries(requiredContent)) {
      if (!value) {
        this.errorMessages?.push(`define ${key}`);
      }
    }

    return this.errorMessages;
  }
}
export const promptManager = new PromptManager();
