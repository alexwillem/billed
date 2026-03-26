export interface Address {
  street: string;
  city: string;
  postal: string;
  country: string;
}

export interface Theme {
  textColor: PDFKit.Mixins.ColorValue;
  backgroundColor: PDFKit.Mixins.ColorValue;
}

export interface WorkItem {
  id: number;
  activity: string;
  rate: number | string;
  hours: number;
}

export function isWorkItem(
  type: WorkItem | WorkItem[] | undefined,
): type is WorkItem {
  return (
    (<WorkItem>type).activity !== undefined &&
    (<WorkItem>type).rate !== undefined &&
    (<WorkItem>type).hours !== undefined
  );
}

// ===== INDIVIDUAL PROFILE TYPES =====

export interface UserProfile {
  name: string;
  email?: string;
  address?: Address;
  taxId?: string;
  bank?: string;
  account?: string;
  vatRate: number;
}

export interface ClientProfile {
  name: string;
  email: string;
  address?: Address;
  phoneNumber?: string;
}

export interface PdfStyle {
  logoPath: string;
  theme: Theme;
  note?: string;
}

export interface ProjectDetails {
  invoiceNumber: number;
  currency: string;
  workItems: WorkItem | WorkItem[];
  paymentDueDate?: string;
  paymentLink?: string;
  amount: string;
}

// ===== PROFILES CONTAINER =====

export interface Profiles {
  userProfile: UserProfile;
  clientProfile: ClientProfile;
  pdfStyle: PdfStyle;
  projectDetails: ProjectDetails;
}
export type ProjectContract = Partial<Profiles>;

// ===== UTILITY TYPES =====

export type ProfileKey = keyof Profiles;
export type Profile = Profiles[ProfileKey];
export function isProfileKey(key: string): key is ProfileKey {
  return [
    "userProfile",
    "clientProfile",
    "pdfStyle",
    "projectDetails",
  ].includes(key);
}
export interface PdfTheme {
  textColor: PDFKit.Mixins.ColorValue;
  backgroundColor: PDFKit.Mixins.ColorValue;
}

export const ProfileEnums = {
  USER_PROFILE: "userProfile",
  CLIENT_PROFILE: "clientProfile",
  PROJECT_DETAILS: "projectDetails",
  PDF_STYLE: "pdfStyle",
  ADDRESS: "address",
};
