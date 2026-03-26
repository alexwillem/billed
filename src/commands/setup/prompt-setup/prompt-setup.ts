import { setDate } from "../../../config/profiles.config.js";
import {
  ClientProfile,
  isProfileKey,
  PdfStyle,
  ProfileEnums,
  ProfileKey,
  ProjectContract,
  ProjectDetails,
  UserProfile,
} from "../../../types/profile-types.js";
import { setInvoiceTheme } from "../../../utils/pdfStyle-utils.js";
import { projectContractManager } from "../../../utils/project-contract-manager.js";
import { configureWorkItemsCMD } from "./work-items-command.js";

export async function runPromptCommands(
  config: ProjectContract,
  args: string[],
) {
  const profileKeys = Object.keys(config).filter(isProfileKey);

  await projectContractManager.load();

  for (const profile of profileKeys) {
    const cmdProfile = config[profile];

    switch (profile as ProfileKey) {
      case ProfileEnums.PDF_STYLE:
        setPdfStyle(cmdProfile);
        break;
      case ProfileEnums.PROJECT_DETAILS:
        setProjectDetails(cmdProfile, args);
        break;
      default:
        projectContractManager.update(profile, { ...cmdProfile });
    }
  }

  projectContractManager.save();
}

function setPdfStyle(
  cmdProfile:
    | UserProfile
    | ClientProfile
    | PdfStyle
    | ProjectDetails
    | undefined,
) {
  const currentPdfStyle = projectContractManager.get().pdfStyle;
  const pdfStyle = cmdProfile as PdfStyle;

  const processedTheme = setInvoiceTheme(String(pdfStyle.theme) ?? "light");

  projectContractManager.update(ProfileEnums.PDF_STYLE as ProfileKey, {
    theme: processedTheme,
    logoPath: pdfStyle.logoPath ?? currentPdfStyle?.logoPath,
    note: pdfStyle.note ?? currentPdfStyle?.note,
  });
}

function setProjectDetails(
  cmdProfile:
    | UserProfile
    | ClientProfile
    | PdfStyle
    | ProjectDetails
    | undefined,
  args: string[],
) {
  const projectDetails = cmdProfile as ProjectDetails;

  const currentProjectDetails = projectContractManager.get().projectDetails;
  const workItems = configureWorkItemsCMD(args);

  const dueDate = setDate(args);

  projectContractManager.update(ProfileEnums.PROJECT_DETAILS as ProfileKey, {
    ...currentProjectDetails,
    invoiceNumber:
      projectDetails.invoiceNumber ?? currentProjectDetails?.invoiceNumber,
    paymentLink:
      projectDetails.paymentLink ?? currentProjectDetails?.paymentLink,
    workItems: workItems?.content,
    paymentDueDate: dueDate ?? currentProjectDetails?.paymentDueDate,
    amount: `$ ${workItems?.billedAmount.toFixed(2)}`,
  });
}
