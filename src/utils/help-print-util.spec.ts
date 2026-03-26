import { printHelp } from "./help-print-util.js";

describe("printHelp", () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it("calls console.log at least once", () => {
    printHelp();
    expect(consoleLogSpy).toHaveBeenCalled();
  });

  it("outputs the brand name", () => {
    printHelp();
    const output = consoleLogSpy.mock.calls.flat().join(" ");
    expect(output).toContain("billed");
  });

  it("outputs all section headers", () => {
    printHelp();
    const output = consoleLogSpy.mock.calls.flat().join(" ");

    expect(output).toContain("USAGE");
    expect(output).toContain("ACTION COMMANDS");
    expect(output).toContain("USER PROFILE COMMANDS");
    expect(output).toContain("CLIENT PROFILE COMMANDS");
    expect(output).toContain("PROJECT DETAILS COMMANDS");
    expect(output).toContain("PDF STYLE COMMANDS");
    expect(output).toContain("EXAMPLES");
  });

  it("outputs all action commands", () => {
    printHelp();
    const output = consoleLogSpy.mock.calls.flat().join(" ");

    expect(output).toContain("--init-config");
    expect(output).toContain("--summary");
    expect(output).toContain("--create");
    expect(output).toContain("--help");
  });

  it("outputs all user profile commands", () => {
    printHelp();
    const output = consoleLogSpy.mock.calls.flat().join(" ");

    expect(output).toContain("--user-name");
    expect(output).toContain("--user-email");
    expect(output).toContain("--user-street");
    expect(output).toContain("--user-city");
    expect(output).toContain("--user-postal");
    expect(output).toContain("--user-country");
    expect(output).toContain("--user-bank");
    expect(output).toContain("--user-account");
    expect(output).toContain("--user-vat");
    expect(output).toContain("--user-phone");
    expect(output).toContain("--user-taxId");
    expect(output).toContain("--user-custom:");
  });

  it("outputs all client profile commands", () => {
    printHelp();
    const output = consoleLogSpy.mock.calls.flat().join(" ");

    expect(output).toContain("--client-name");
    expect(output).toContain("--client-email");
    expect(output).toContain("--client-street");
    expect(output).toContain("--client-city");
    expect(output).toContain("--client-postal");
    expect(output).toContain("--client-country");
    expect(output).toContain("--client-phone");
    expect(output).toContain("--client-custom:");
  });

  it("outputs all project detail commands", () => {
    printHelp();
    const output = consoleLogSpy.mock.calls.flat().join(" ");

    expect(output).toContain("--add-item");
    expect(output).toContain("--rmv-item");
    expect(output).toContain("--items");
    expect(output).toContain("--rate");
    expect(output).toContain("--hours");
    expect(output).toContain("--invoiceNr");
    expect(output).toContain("--currency");
    expect(output).toContain("--pay-days");
    expect(output).toContain("--link");
  });

  it("outputs all pdf style commands", () => {
    printHelp();
    const output = consoleLogSpy.mock.calls.flat().join(" ");

    expect(output).toContain("--logo");
    expect(output).toContain("--theme");
  });

  it("outputs the macOS warning", () => {
    printHelp();
    const output = consoleLogSpy.mock.calls.flat().join(" ");
    expect(output).toContain("macOS");
  });

  it("outputs example commands", () => {
    printHelp();
    const output = consoleLogSpy.mock.calls.flat().join(" ");

    expect(output).toContain("--init-config");
    expect(output).toContain("--user-custom:license");
    expect(output).toContain("--client-custom:department");
  });

  it("does not throw", () => {
    expect(() => printHelp()).not.toThrow();
  });
});
