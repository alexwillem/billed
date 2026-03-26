export const mockThemeInstance = {
  textColor: "black",
  backgroundColor: "white",
};

export const mockPdfStyleInstance = {
  theme: mockThemeInstance,
  logoPath: "./src/assets/logo/icon-only.svg",
  note: "test note",
};

export const mockActivityOne = {
  id: 1,
  activity: "activity 1",
  rate: 100,
  hours: 8,
};

export const mockActivityTwo = {
  id: 2,
  activity: "activity 2",
  rate: 50,
  hours: 4,
};

export const mockTotalAmount = {
  itemsAmount: 800,
  vatAmount: 200,
  billedAmount: 1000,
};

export const mockContractInstance = {
  userProfile: {
    name: "Test User",
    email: "account_user@test.com",
    address: {
      street: "Test Street 1",
      city: "User TestCity",
      postal: "1111",
      country: "User TestCountry",
    },
    bank: "bank of america",
    account: "123458888",
    vatRate: 10,
    "vat-number": 123456666,
  },
  clientProfile: {
    name: "Test Client",
    email: "account_client@test.com",
    address: {
      street: "Test Street 2",
      city: "Client TestCity",
      postal: "2222",
      country: "Client TestCountry",
    },
    phoneNumber: "00316123456",
  },
  pdfStyle: {
    theme: {
      textColor: "#121212",
      backgroundColor: "#FFFFFF",
    },
    note: "test note",
    logoPath: "./src/assets/logo/icon-only.svg",
  },
  projectDetails: {
    workItems: [mockActivityOne, mockActivityTwo],
    invoiceNumber: 12345,
    paymentDueDate: "Apr 12, 2026",
    currency: "$",
    amount: "1000",
    paymentLink: "https://payment.link",
  },
};
