# billed.dev

Invoicing can be a pain, especially in terms of to context switching. Third-party applications help massively, but can also be expensive and complex.
That's why I built a simple cmd-based invoicing tool that can be created locally, right from terminal!

⚠️ **the current version is built for macOS only.**


<img width="499" height="837" alt="Screenshot 2026-03-21 at 10 43 00" src="https://github.com/user-attachments/assets/5ddb93fe-a216-42ed-bdc7-a2a1a0cd0f4f" />

<img width="499" height="837" alt="Screenshot 2026-03-21 at 10 42 17" src="https://github.com/user-attachments/assets/064f2192-32ce-4e12-8b76-c99df1213495" />

---


### Features

- Generate professional PDF invoices from the command line.
- Customize invoice details, including work items, payment terms, and client information.
- Modern, minimal, and clear design.

---

### Installation
Install the tool globally using npm:

```bash
npm install -g billed
```

---

### Usage
1. Create a new directory and include your logo (.svg or .png).
2. run the `bill` command:

```bash
bill [command] [input]
```

---

### Commands

#### **Initialization and Actions**

| Command          | Description                                      |
|------------------|--------------------------------------------------|
| `--init-config`  | Initialize a new invoice configuration.         |
| `--summary`      | Display a summary of the current invoice.       |
| `--create`       | Generate the invoice PDF.                       |

---

#### **User Profile Commands**

| Command               | Description                                      |
|-----------------------|--------------------------------------------------|
| `--user-name`         | Set the user's name.                             |
| `--user-email`        | Set the user's email.                            |
| `--user-street`       | Set the user's street address.                   |
| `--user-city`         | Set the user's city.                             |
| `--user-postal`       | Set the user's postal code.                      |
| `--user-country`      | Set the user's country.                          |
| `--user-taxId`        | Set the user's tax ID.                           |
| `--user-bank`         | Set the user's bank name.                        |
| `--user-account`      | Set the user's bank account number.              |
| `--user-vat`          | Set the user's VAT rate.                         |
| `--user-phone`        | Set the user's phone number.                     |
| `--user-custom:<key>` | Set a custom user profile field (e.g., `--user-custom:license`). |

---

#### **Client Profile Commands**

| Command                  | Description                                      |
|--------------------------|--------------------------------------------------|
| `--client-name`          | Set the client's name.                           |
| `--client-email`         | Set the client's email.                          |
| `--client-street`        | Set the client's street address.                 |
| `--client-city`          | Set the client's city.                           |
| `--client-postal`        | Set the client's postal code.                    |
| `--client-country`       | Set the client's country.                        |
| `--client-phone`         | Set the client's phone number.                   |
| `--client-custom:<key>`  | Set a custom client profile field (e.g., `--client-custom:department`). |

---

#### **Project Details Commands**

| Command               | Description                                      |
|-----------------------|--------------------------------------------------|
| `--add-item`          | Add a work item to the invoice.                  |
| `--rmv-item`          | Remove a work item from the invoice.             |
| `--items`             | List all work items in the invoice.              |
| `--rate`              | Set the hourly rate for a work item.             |
| `--hours`             | Set the number of hours for a work item.         |
| `--pay-days`          | Set the payment due date.                        |
| `--link`              | Set the payment link.                            |
| `--currency`          | Set the currency for the invoice.                |
| `--invoiceNr`         | Set the invoice number.                          |

---

#### **PDF Style Commands**

| Command               | Description                                      |
|-----------------------|--------------------------------------------------|
| `--logo`              | Set the path to the logo image.                  |
| `--theme`             | Set the theme for the invoice (e.g., light/dark). |

---

### Examples

#### **Initialise a New Invoice Configuration**

```bash
bill --init-config
```

#### **Set User Profile Information**

```bash
bill --user-name "John Doe" --user-email "john@example.com" --user-street "123 Main St"
```

#### **Set Client Profile Information**

```bash
bill --client-name "Jane Smith" --client-email "jane@example.com" --client-street "456 Oak Ave"
```

#### **Add Work Items to the Invoice**

```bash
bill --add-item "Consultation" --rate 100 --hours 2
```

#### **Set Invoice Details**

```bash
bill --invoiceNr "INV-001" --due "2024-12-31" --link "https://example.com/payment" --currency "$" --pay-days 30
```

#### **Custom Fields**

```bash
bill --user-custom:license "ABC123" --client-custom:department "Cardiology"
```

#### **Generate the Invoice**

```bash
bill --create
```

---

### Configuration

You can configure your invoice details using a JSON file created in `your-directory/contracts/project-contract.json`. 
<br>Example:

```json
{
  "userProfile": {
    "name": "John Smith",
    "email": "john.smith@example.com",
    "address": {
      "street": "Mainstreet 1",
      "city": "New York",
      "postal": "10001",
      "country": "United States"
    },
    "bank": "Bank of America",
    "account": "123456789",
    "vatRate": 10,
    "vat-number": 445663
  },
  "clientProfile": {
    "name": "Sandra Stone",
    "email": "sandra_stone@example.com",
    "address": {
      "street": "Lukin Street",
      "city": "London",
      "postal": "E1 0AA",
      "country": "United Kingdom"
    },
    "phoneNumber": "+44 192 688 2222"
  },
  "pdfStyle": {
    "theme": {
      "textColor": "#121212",
      "backgroundColor": "#F2F2F2"
    },
    "logoPath": "/Users/alex_daemen/Documents/web_projects/billed/billed-pdf/src/assets/logo/icon-only.svg"
  },
  "projectDetails": {
    "currency": "$",
    "paymentDueDate": "May 20, 2026",
    "paymentLink": "johnsmith.com",
    "workItems": [
      {
        "id": 1,
        "activity": "Consultation",
        "rate": 80,
        "hours": 2
      },
      {
        "id": 2,
        "activity": "Logo Design",
        "rate": 50,
        "hours": 16
      },
      {
        "id": 3,
        "activity": "Logo print-out & delivery",
        "rate": 20,
        "hours": 1
      }
    ],
    "invoiceNumber": 1234567,
    "amount": "$ 1078.00"
  }
}
```

Save this configuration to a file (e.g., `invoice-config.json`) and use it with the tool.

---

### Prerequisites

- Node.js (v16 or higher)
- npm (or yarn)

---

### License

This project is licensed under the ISC License.
