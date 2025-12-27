# OptiDopa Web App

Modern web application for levodopa dose tracking and plasma concentration visualization.

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Features

✅ Excel-like dose input table
✅ Real-time pharmacokinetic calculations
✅ Interactive concentration charts
✅ Therapeutic window visualization
✅ Statistics dashboard
✅ CSV export
✅ Dark mode
✅ Fully responsive

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Recharts
- date-fns

## Project Structure

```
├── app/
│   ├── page.tsx         # Main app
│   ├── layout.tsx       # Root layout
│   └── globals.css      # Styles
├── components/
│   ├── DoseTable.tsx    # Dose input table
│   ├── ConcentrationChart.tsx  # Recharts plot
│   └── StatsPanel.tsx   # Statistics
└── lib/
    └── pharmacokinetics.ts  # PK calculations
```

## Usage

1. Click "Add Dose" to add medication times
2. Edit date, time, medication, and dose amount
3. Chart updates automatically with plasma concentration profile
4. View statistics: peak, trough, time in range
5. Export data to CSV

## Pharmacokinetic Model

Based on clinical literature:
- **Model**: One-compartment with first-order absorption
- **Half-life**: 1.5 hours
- **Therapeutic range**: 1000-1600 ng/mL

See parent README for full scientific details.
