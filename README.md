# Business Performance & Revenue Analytics

A frontend dashboard for tracking leads, quotations, deals, orders, and revenue. Built with React 19, TypeScript, Vite, Tailwind CSS 4, Recharts, Lucide React, and date-fns.

The dashboard uses locally generated dummy data and does not require a backend or database. The data includes dates relative to the current date so the date filters can be tested with different periods.

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:5173` to view the dashboard.

To create and preview a production build:

```bash
npm run build
npm run preview
```

## Deployment

The project can be deployed to Vercel without environment variables.

1. Push the project to a Git repository.
2. Import the repository at [Vercel](https://vercel.com/new).
3. Use `npm run build` as the build command and `dist` as the output directory.

The project also includes a `vercel.json` configuration.

## Project Structure

```text
src/
  app/           Main application
  components/    Shared layout, UI, charts and tables
  features/      Leads, quotations, deals, orders and payments
  data/          Dummy data generation and ID indexes
  hooks/         Filters and drill-down state
  lib/           Metrics, date utilities and CSV export
  types/         TypeScript data models
```

## Data Model

Records are connected using IDs rather than display names.

- A lead can have multiple quotations and deals.
- A quotation can be linked to a deal.
- A deal can have multiple orders.
- An order can have multiple payments and invoices.

Payments are associated with individual orders, which are linked to their respective deals.

## Metrics and Date Filters

The dashboard supports Today, Last 7 Days, Last 30 Days, and Custom Date Range. It compares the selected period with the previous period of equal length.

Key calculation rules:

- **Qualified leads:** Leads marked qualified or converted.
- **Converted leads:** Leads linked to at least one deal.
- **Lead conversion rate:** Converted leads divided by total leads.
- **Quote-to-deal conversion:** Accepted quotations divided by quotations created.
- **Collected revenue:** Payments received during the selected period.
- **Outstanding revenue:** Remaining order value as of the selected period's end date.
- **Revenue target:** ₹6,50,000 per month, prorated for the selected date range.

Each record is filtered using its relevant date, along with the selected user and service filters. A zero previous-period value is displayed as "New" rather than calculating a percentage change.

Implementation details for these calculations are in `src/lib/metrics.ts`.

## Interactions

The dashboard includes interactive charts, KPI cards, searchable or filterable data views, and record-level drill-downs. You can navigate from a lead to its quotations and deals, then inspect related orders and payments.

The CSV export includes a KPI summary and the filtered lead, quotation, deal, order, and payment records.