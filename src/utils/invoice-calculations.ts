import { ProfileEnums, ProfileKey, WorkItem } from "../types/profile-types.js";
import { projectContractManager } from "./project-contract-manager.js";

export function setTotalAmount(): {
  itemsAmount: number;
  vatAmount: number;
  billedAmount: number;
} {
  let totalVatAmount = 0;
  let totalAmount = 0;
  const taxRate = projectContractManager.get().userProfile?.vatRate ?? 0;
  const projectDetails = projectContractManager.get().projectDetails;
  const workItems = (projectDetails?.workItems as WorkItem[]) ?? [];

  for (const item of workItems) {
    totalAmount += item.hours * Number(item.rate);
  }

  totalVatAmount = taxRate > 0 ? totalAmount * (taxRate / 100) : 0;
  projectContractManager.update(ProfileEnums.PROJECT_DETAILS as ProfileKey, {
    ...projectDetails,
    amount: `${projectDetails?.currency ?? ""} ${totalAmount}`,
  });

  return {
    itemsAmount: totalAmount,
    vatAmount: totalVatAmount,
    billedAmount: totalAmount + totalVatAmount,
  };
}
