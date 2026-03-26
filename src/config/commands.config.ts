import { Profiles } from "../types/profile-types.js";

export const ProjectDetailsCommands = {
  ADD_ITEM: "--add-item",
  RMV_ITEM: "--rmv-item",
  ITEMS: "--items",
  RATE: "--rate",
  HOURS: "--hours",
  DUE: "--due",
  PAYMENT_LINK: "--link",
  CURRENCY: "--currency",
} as const;

export const ProfileCommands = {
  USER_NAME: "--user-name",
  USER_EMAIL: "--user-email",
  USER_STREET: "--user-street",
  USER_CITY: "--user-city",
  USER_POSTAL: "--user-postal",
  USER_COUNTRY: "--user-country",
  CLIENT_NAME: "--client-name",
  CLIENT_EMAIL: "--client-mail",
  CLIENT_STREET: "--client-street",
  CLIENT_CITY: "--client-city",
  CLIENT_POSTAL: "--client-postal",
  CLIENT_COUNTRY: "--client-country",
} as const;

export const ActionCommands = {
  INIT_CONFIG: "--init-config",
  SUMMARY: "--summary",
  CREATE: "--create",
  HELP: "--help",
} as const;

export const CLICommandsENUM = {
  ...ProfileCommands,
  ...ProjectDetailsCommands,
  ...ActionCommands,
} as const;

export const importantUserCommands = ["name", "bank", "account"];
export const requiredProjectCommands = [
  "invoiceNumber",
  "paymentLink",
  "paymentDueDate",
];

const CLI_TO_DATA_MAP = {
  "--user-name": ["userProfile", "name"],
  "--user-email": ["userProfile", "email"],
  "--user-taxId": ["userProfile", "taxId"],
  "--user-bank": ["userProfile", "bank"],
  "--user-account": ["userProfile", "account"],
  "--user-vat": ["userProfile", "vatRate"],
  "--user-phone": ["userProfile", "phone"],
  "--user-street": ["userProfile", "address", "street"],
  "--user-city": ["userProfile", "address", "city"],
  "--user-postal": ["userProfile", "address", "postal"],
  "--user-country": ["userProfile", "address", "country"],

  "--client-name": ["clientProfile", "name"],
  "--client-email": ["clientProfile", "email"],
  "--client-street": ["clientProfile", "address", "street"],
  "--client-city": ["clientProfile", "address", "city"],
  "--client-postal": ["clientProfile", "address", "postal"],
  "--client-country": ["clientProfile", "address", "country"],
  "--client-phone": ["clientProfile", "phone"],

  "--logo": ["pdfStyle", "logoPath"],
  "--theme": ["pdfStyle", "theme"],
  "--note": ["pdfStyle", "note"],

  "--items": ["projectDetails", "workItems"],
  "--add-item": ["projectDetails", "workItems", "activity"],
  "--rmv-item": ["projectDetails", "workItems", "id"],
  "--rate": ["projectDetails", "workItems", "rate"],
  "--hours": ["projectDetails", "workItems", "hours"],
  "--pay-days": ["projectDetails", "paymentDueDate"],
  "--link": ["projectDetails", "paymentLink"],
  "--invoice-nr": ["projectDetails", "invoiceNumber"],
  "--currency": ["projectDetails", "currency"],
} as const;

export const isWorkItemCLICommand = createEnumChecker(ProjectDetailsCommands);
export const isProfileCLICommand = createEnumChecker(ProfileCommands);
export const isActionCLICommand = createEnumChecker(ActionCommands);
export const isCLICommand = createEnumChecker(CLICommandsENUM);

function createEnumChecker<T extends Record<string, string>>(enumObj: T) {
  const values = new Set(Object.values(enumObj));

  return function isInEnum(arg: string): arg is T[keyof T] {
    return values.has(arg);
  };
}

export function parseCLIArgs(args: string[]): Partial<Profiles> {
  const config: Partial<Profiles> = {};

  if (
    args.includes(ProjectDetailsCommands.RMV_ITEM) &&
    args.includes(ProjectDetailsCommands.ADD_ITEM)
  ) {
    throw new Error("run '--add-item' and '--rmv-item' as separate commands");
  }

  args.forEach((arg, index) => {
    if (arg.startsWith("--")) {
      const value = args[index + 1];
      const isNum = /^\d+$/.test(value);
      const convertedValue = isNum ? Number(value) : value;

      if (arg.startsWith("--user-custom:")) {
        const customKey = arg.replace("--user-custom:", "");
        setNestedValue(config, ["userProfile", customKey], convertedValue);
      } else if (arg.startsWith("--client-custom:")) {
        const customKey = arg.replace("--client-custom:", "");
        setNestedValue(config, ["clientProfile", customKey], convertedValue);
      } else {
        const path = CLI_TO_DATA_MAP[arg as keyof typeof CLI_TO_DATA_MAP];

        if (path) {
          setNestedValue(config, [...path], convertedValue);
        }
      }
    }
  });

  return config;
}

function setNestedValue(obj: any, path: string[], value: string | number) {
  const last = path.pop()!;
  const target = path.reduce((o, key) => {
    if (!o[key]) o[key] = {} as Partial<Profiles>;
    return o[key];
  }, obj);
  return (target[last] = value);
}
