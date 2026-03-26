export type TransformKey = "NaN" | "uppercase" | "number";
export type PromptType = "input" | "number" | "confirm" | "select";

export interface Prompt {
  type: string;
  name: string;
  message: string;
  choices?: string[];
  transform?: string;
  pattern?: string;
  validateError?: string;
  required?: boolean;
  default?: string | number;
}

export interface ClientProfilePrompts {
  name: Prompt;
  address?: AddressPrompts;
  email?: Prompt;
  phoneNumber?: Prompt;
}

export interface AddressPrompts {
  street: Prompt;
  city: Prompt;
  postal: Prompt;
  country: Prompt;
}

export interface UserProfilePrompts extends ClientProfilePrompts {
  taxId: Prompt;
  account: Prompt;
  vatRate: Prompt;
}

export interface ProjectDetailsPrompts {
  invoiceNumber: Prompt;
  currency: Prompt;
  paymentDueDate: Prompt;
  paymentLink: Prompt;
  activity: Prompt;
  rate: Prompt;
  hours: Prompt;
}

export interface PdfStylePrompts {
  theme: Prompt;
  logoPath: Prompt;
}

export type ProjectPrompts =
  | PdfStylePrompts
  | UserProfilePrompts
  | ClientProfilePrompts
  | ProjectDetailsPrompts;
