import chalk from "chalk";

const BRAND = chalk.greenBright.bold;
const HEADER = chalk.white.bold;
const CMD = chalk.green;
const DIM = chalk.gray;
const WHITE = chalk.white;

function section(title: string): void {
  console.log("");
  console.log(HEADER(title));
  console.log(DIM("─".repeat(60)));
}

function row(cmd: string, desc: string): void {
  console.log(`  ${CMD(cmd.padEnd(32))} ${WHITE(desc)}`);
}

export function printHelp(): void {
  console.log("");
  console.log(
    BRAND("Billed") +
      DIM(" — visit https://www.billed.dev for more information"),
  );

  section("USAGE");
  console.log(`  ${WHITE("bill")} ${DIM("[command] [value]")}`);

  section("ACTION COMMANDS");
  row("--init-config", "Initialise a new invoice configuration");
  row("--summary", "Display a summary of the current invoice");
  row("--create", "Generate the invoice PDF");
  row("--help", "Show this help message");

  section("USER PROFILE COMMANDS");
  row("--user-name <value>", "Your (full) name");
  row("--user-email <value>", "Your email");
  row("--user-street <value>", "Your street");
  row("--user-city <value>", "Your city");
  row("--user-postal <value>", "Your postal code");
  row("--user-country <value>", "Your country");
  row("--user-bank <value>", "Your bank name");
  row("--user-account <value>", "Your bank account number");
  row("--user-vat <value>", "Your VAT rate");
  row("--user-phone <value>", "Your phone number");
  row("--user-taxId <value>", "Your tax ID");
  row("--user-custom:<key>", "Custom field  e.g. --user-custom:license");

  section("CLIENT PROFILE COMMANDS");
  row("--client-name <value>", "Client's (full) name");
  row("--client-email <value>", "Client's email");
  row("--client-street <value>", "Client's street");
  row("--client-city <value>", "Client's city");
  row("--client-postal <value>", "Client's postal code");
  row("--client-country <value>", "Client's country");
  row("--client-phone <value>", "Client's phone number");
  row("--client-custom:<key>", "Custom field  e.g. --client-custom:department");

  section("PROJECT DETAILS COMMANDS");
  row("--add-item <name>", "Add a work item to the invoice");
  row("--rmv-item <id>", "Remove a work item by ID");
  row("--items", "List all current work items");
  row("--rate <value>", "Set hourly rate for a work item");
  row("--hours <value>", "Set hours for a work item");
  row("--invoiceNr <value>", "Set the invoice number");
  row("--currency <value>", "Set the currency symbol");
  row("--pay-days <value>", "Set payment due date (days from now)");
  row("--link <value>", "Set the payment link");

  section("PDF STYLE COMMANDS");
  row("--logo <path>", "Path to your logo image");
  row("--theme <value>", "Invoice theme  light | dark");

  section("EXAMPLES");
  console.log(`  ${DIM("# Full invoice in one line")}`);
  console.log(
    `  ${CMD("bill")} --user-name ${WHITE('"John Doe"')} --client-name ${WHITE('"Jane Smith"')} \\`,
  );
  console.log(
    `       --add-item ${WHITE('"Consultation"')} --rate ${WHITE("100")} --hours ${WHITE("2")} \\`,
  );
  console.log(
    `       --invoiceNr ${WHITE('"INV-001"')} --currency ${WHITE('"$"')} --create`,
  );
  console.log("");
  console.log(`  ${DIM("# Guided setup")}`);
  console.log(`  ${CMD("bill")} --init-config`);
  console.log("");
  console.log(`  ${DIM("# Custom fields")}`);
  console.log(
    `  ${CMD("bill")} --user-custom:license ${WHITE('"ABC123"')} --client-custom:department ${WHITE('"Cardiology"')}`,
  );

  console.log("");
  console.log(DIM("  ⚠  Current version is built for macOS only."));
  console.log("");
}
