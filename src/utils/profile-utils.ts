import { configureWorkItemsGuided } from "../commands/setup/guided-setup/guided-setup.js";
import { setDate } from "../config/profiles.config.js";
import { HeaderEntries, TransformedRows } from "../types/pdf-types.js";
import {
  Address,
  Profile,
  ProfileEnums,
  ProfileKey,
} from "../types/profile-types.js";
import {
  ProjectDetailsPrompts,
  ProjectPrompts,
} from "../types/prompt-types.js";
import { setMaxColumnWidth } from "./pdfStyle-utils.js";
import { projectContractManager } from "./project-contract-manager.js";
import { promptManager } from "./prompt-manager.js";

export async function createProfile(
  promptProfile: ProjectPrompts,
  profileDescription: ProfileKey,
) {
  if (profileDescription === ProfileEnums.PROJECT_DETAILS) {
    const projectDetails = promptProfile as ProjectDetailsPrompts;
    const generalDetails = {
      invoiceNumber: projectDetails.invoiceNumber,
      currency: projectDetails.currency,
      paymentDueDate: projectDetails.paymentDueDate,
      paymentLink: projectDetails.paymentLink,
    };
    const itemDetails = {
      activity: projectDetails.activity,
      rate: projectDetails.rate,
      hours: projectDetails.hours,
    };

    const detailsPromptResults = await promptManager.buildPrompts(
      generalDetails as ProjectDetailsPrompts,
    );

    const updatedProjectDetails = {
      ...detailsPromptResults,
      paymentDueDate: setDate(detailsPromptResults.paymentDueDate),
    };

    projectContractManager.update(profileDescription, updatedProjectDetails);

    await configureWorkItemsGuided(itemDetails as ProjectDetailsPrompts);
    return;
  }
  let profile = await promptManager.buildPrompts(promptProfile);

  projectContractManager.update(profileDescription, profile);
}

export function formatHeaderInfo(
  doc: PDFKit.PDFDocument,
  headerInfo: Profile | Address | undefined,
  type: string,
): TransformedRows {
  const rows: Array<[string, string]> = [];

  if (!headerInfo) {
    return { rows: [], maxKeyWidth: 0, maxValueWidth: 0 };
  }

  let entries: HeaderEntries = Object.entries(headerInfo) as HeaderEntries;

  const accountIndex = entries.findIndex((value) => value[0] === "account");
  if (accountIndex !== -1) {
    entries.push(entries.splice(accountIndex, 1)[0]);
  }

  if (type === ProfileEnums.ADDRESS) {
    const addressDetails = setAddress(entries);
    if (addressDetails.length > 0) {
      rows.push(["address: ", addressDetails.join("")]);
    }
  } else {
    entries = filterHeaders(entries, type) ?? entries;
  }

  const transformedRows = buildRows(doc, rows, entries, type);

  return transformedRows;
}

function buildRows(
  doc: PDFKit.PDFDocument,
  rows: Array<[string, string]>,
  entries: HeaderEntries,
  type: string,
): TransformedRows {
  let maxKeyWidth = 0;
  let maxValueWidth = 0;

  let keyWidth = 0;
  let valueWidth = 0;

  for (const [key, value] of entries) {
    if (value && type !== ProfileEnums.ADDRESS) {
      let transformedKey = `${key}: `;

      if (key === "paymentDueDate") {
        transformedKey = "due date: ";
      } else if (key === "phoneNumber") {
        transformedKey = "phone: ";
      }

      rows.push([transformedKey, String(value)]);

      keyWidth =
        setMaxColumnWidth(doc, {
          key: transformedKey,
          value: value,
        }).keyWidth ?? 0;

      valueWidth =
        setMaxColumnWidth(doc, {
          key: transformedKey,
          value: value,
        }).valueWidth ?? 0;

      if (keyWidth > maxKeyWidth) {
        maxKeyWidth = keyWidth;
      }

      if (valueWidth > maxValueWidth) {
        maxValueWidth = valueWidth;
      }
    }
    if (type === ProfileEnums.ADDRESS) {
      keyWidth =
        setMaxColumnWidth(doc, {
          key: `${ProfileEnums.ADDRESS}: `,
          value: 0,
        }).keyWidth ?? 0;

      if (keyWidth > maxKeyWidth) {
        maxKeyWidth = keyWidth;
      }
    }
  }

  return { rows, maxKeyWidth: maxKeyWidth, maxValueWidth: maxValueWidth };
}

function setAddress(entries: HeaderEntries): string[] {
  let addressDetails = [];

  for (let i = 0; i < entries.length; i++) {
    const addressProperties = entries[i];
    const addressResults = addressProperties[1];

    const transformedResults =
      i === entries.length - 1 ? `${addressResults}` : `${addressResults}, `;

    if (transformedResults.trim() !== "," && transformedResults.trim() !== "") {
      addressDetails.push(transformedResults);
    }
  }

  return addressDetails;
}

export function filterHeaders(
  headers: HeaderEntries,
  type: string,
): HeaderEntries {
  switch (type) {
    case ProfileEnums.USER_PROFILE:
      return excludeKeys(headers, ["email", "address", "vatRate"]);
    case ProfileEnums.PROJECT_DETAILS:
      return excludeKeys(headers, [
        "workItems",
        "currency",
        "invoiceNumber",
        "paymentLink",
      ]);
    default:
      return excludeKeys(headers, ["address"]);
  }
}

export function excludeKeys(
  headers: HeaderEntries,
  keys: string[],
): HeaderEntries {
  const keysToExclude = new Set(keys);
  const filteredDetails = headers.filter(([key]) => !keysToExclude.has(key));

  return filteredDetails;
}
