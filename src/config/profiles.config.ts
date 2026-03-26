import { DateTime } from "luxon";
import {
  ProfileEnums,
  ProfileKey,
  ProjectContract,
  ProjectDetails,
} from "../types/profile-types.js";
import { projectContractManager } from "../utils/project-contract-manager.js";

export const INITIAL_PROFILE = {
  userProfile: {},
  clientProfile: {},
  pdfStyle: {},
  projectDetails: {},
} as ProjectContract;

export const HEADERS = {
  USER_DETAILS: "PAYMENT",
  CLIENT_DETAILS: "CLIENT",
};

export function setDate(args: string | string[]): string {
  const dateCmdValue = Array.isArray(args)
    ? args?.findIndex((arg) => arg === "--pay-days") + 1
    : Number(args);

  const daysLeft: number =
    dateCmdValue > 0 ? Number(args[dateCmdValue] ?? args) : 30;
  const newDate = DateTime.local().plus({ days: daysLeft });

  return newDate.toLocaleString(DateTime.DATE_MED);
}

export function setBilledAmountAsFinalHeader() {
  const projectDetails = projectContractManager.get().projectDetails;

  if (projectDetails) {
    const billedAmountIndex = Object.keys(projectDetails).indexOf("amount");
    const isFinalKey =
      billedAmountIndex + 1 === Object.keys(projectDetails).length;

    if (!isFinalKey) {
      const entries = Object.entries(projectDetails);
      const billedAmountValue =
        Object.entries(projectDetails)[billedAmountIndex];

      entries.splice(billedAmountIndex, 1);
      entries.push(billedAmountValue);

      projectContractManager.replace(
        ProfileEnums.PROJECT_DETAILS as ProfileKey,
        Object.fromEntries(entries) as ProjectDetails,
      );

      projectContractManager.save();
    }
  }
}
