# OptiDopa - Levodopa Dose Tracker & Plasma Concentration Simulator

A web application for Parkinson's disease patients to track levodopa doses, visualize plasma concentrations, and monitor symptoms using evidence-based clinical assessment tools.

## Features

### 📊 Dose Tracking
- Google Sheets-like interface for entering doses
- Supports Carbilev (IR) and Sinemet CR medications
- Keyboard navigation and Excel import/export
- Visual concentration curve visualization

### 🧬 Pharmacokinetic Modeling
- One-compartment PK model with first-order absorption
- Population-average parameters based on clinical literature
- Real-time concentration profile calculation
- Automatic detection of therapeutic ranges

### 🏥 Clinical Symptom Tracking
- **WOQ-9 Questionnaire** - Validated wearing-off assessment
- **UPDRS-III Severity Scale** (0-4) for standardized ratings
- Motor, non-motor, and dyskinesia symptom tracking
- Automated scoring and clinical alerts

### 📈 Patient Profile
- Personalized therapeutic ranges
- Symptom severity tracking over time
- Dose response timing patterns
- Motor state documentation (ON/OFF/dyskinesia states)

### 💾 Data Storage Options

#### Option 1: Browser-Only (localStorage)
- No setup required
- Data stored in browser
- Works offline
- ⚠️ Limited to one browser/device

#### Option 2: Cloud Database (Supabase - Recommended)
- **Free tier**: 500MB storage, 2GB bandwidth/month
- Access from any device
- **Automatic backups**
- Secure authentication
- **Stores years of data**
- Export to Excel anytime

## Getting Started

### Quick Start (Local Development)

1. **Clone and Install**
   ```bash
   cd optidopa-web
   npm install
   npm run dev
   ```

2. **Open Browser**
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - Start adding doses!

### Cloud Setup (Recommended for Long-Term Use)

See **[SUPABASE_SETUP.md](SUPABASE_SETUP.md)** for complete instructions.

**Quick summary:**
1. Create free account at [supabase.com](https://supabase.com)
2. Run the SQL schema from `SUPABASE_SETUP.md`
3. Copy `.env.example` to `.env.local` and add your credentials
4. (Optional) Set up Google OAuth - see **[GOOGLE_OAUTH_SETUP.md](GOOGLE_OAUTH_SETUP.md)**
5. Deploy to [vercel.com](https://vercel.com) (free)

**Authentication Options:**
- **Email/Password**: Built-in secure authentication via Supabase Auth
- **Google Sign-In**: One-click OAuth authentication (requires additional setup)

## Supported Medications

- **Carbilev 25/100mg** - Immediate Release (IR)
  - Full dose: 100mg levodopa
  - Half dose: 50mg levodopa

- **Sinemet CR 50/200mg** - Controlled Release (CR)
  - Full dose: 200mg levodopa
  - Half dose: 100mg levodopa

## Usage

### Adding Doses

1. Click the **"Add Dose"** button
2. Edit the date and time
3. Select medication (Carbilev or Sinemet CR)
4. Choose dose amount (Full or Half)
5. The chart updates automatically!

### Understanding the Chart

The chart shows your plasma levodopa concentration over a 28-hour period:

- **Green zone** (1000-1600 ng/mL): Optimal therapeutic range
- **Yellow zone** (800-1000 ng/mL): Sub-optimal but still effective
- **Red zone** (>1600 ng/mL): Dyskinesia risk zone
- **Gray dashed lines**: When you take each dose
- **Blue line**: Your plasma concentration profile

### Statistics Panel

- **Peak**: Highest concentration reached
- **Trough**: Lowest concentration (ideally stays above 800 ng/mL)
- **In Range**: Percentage of time in optimal therapeutic window
- **Risk Zone**: Percentage of time above dyskinesia threshold
- **Daily Dose**: Total levodopa for the day

## Pharmacokinetic Model

### Scientific Basis

Based on peer-reviewed clinical literature:

| Parameter | IR (Carbilev) | CR (Sinemet) | Source |
|-----------|---------------|--------------|--------|
| Half-life | 1.5 hours | 1.5 hours | Population PK studies |
| Absorption rate (k_a) | 1.86 h⁻¹ | 0.5 h⁻¹ | Clinical trials |
| Bioavailability (F) | 100% (reference) | 75% (relative to IR) | FDA data |
| Time to peak (T_max) | 0.8 hours | 1.75 hours | Pharmacokinetic studies |
| Volume of distribution | 90 L | 90 L | Population PK |

### Therapeutic Thresholds

- **Minimum Effective**: 800 ng/mL - Below this, motor symptoms may return
- **Optimal Range**: 1000-1600 ng/mL - Best balance of efficacy and safety
- **Dyskinesia Threshold**: >1600 ng/mL - Increased risk of involuntary movements

### Mathematical Model

One-compartment model with first-order absorption and elimination:

```
C(t) = (F × Dose × k_a) / (Vd × (k_a - k_e)) × [e^(-k_e×t) - e^(-k_a×t)]
```

For multiple doses, the principle of superposition is applied.

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Charts**: Recharts
- **Data Export**: xlsx (Excel files)
- **Database**: Supabase (PostgreSQL) or localStorage fallback
- **Authentication**: Supabase Auth
- **Deployment**: Vercel

## Project Structure

```
optidopa-web/
├── app/
│   ├── layout.tsx          # App layout with AuthProvider
│   ├── page.tsx            # Main application page
│   └── globals.css         # Global styles
├── components/
│   ├── AuthProvider.tsx    # Authentication context
│   ├── AuthModal.tsx       # Login/signup UI
│   ├── DoseTable.tsx       # Spreadsheet-like dose table
│   ├── ConcentrationChart.tsx  # PK curve visualization
│   ├── StatsPanel.tsx      # Statistics display
│   ├── PatientProfilePanel.tsx # Symptom tracking UI
│   └── SymptomSeverityScale.tsx # 0-4 rating component
├── lib/
│   ├── pharmacokinetics.ts # PK calculations & types
│   ├── xlsxUtils.ts        # Excel import/export
│   ├── supabase.ts         # Supabase client setup
│   ├── database.types.ts   # Database TypeScript types
│   └── dataService.ts      # Data layer (localStorage + Supabase)
└── SUPABASE_SETUP.md       # Complete setup guide
```

## Building for Production

```bash
npm run build
npm start
```

## Important Disclaimer

⚠️ **This model is for educational purposes only.**

This application uses population-average pharmacokinetic parameters from clinical studies. Individual responses to levodopa vary significantly due to:

- Gastric emptying variability
- Food interactions (especially protein)
- Disease progression
- Genetic polymorphisms
- Gut microbiome composition
- Co-medications

**Always consult your healthcare provider before making any changes to your medication schedule.**

## References

### Pharmacokinetic Studies

1. Population pharmacokinetics of levodopa in Parkinson's disease patients
2. Levodopa half-life and elimination kinetics (1.5-1.9 hours)
3. Volume of distribution studies (42.9-131 L, mean ~90 L)
4. Absorption rate constants from clinical trials
5. Bioavailability studies for IR vs CR formulations
6. Therapeutic window determination from motor response studies

### Clinical Guidelines

- Minimum effective concentration: 800-1000 ng/mL
- Optimal therapeutic range: 1000-1600 ng/mL
- Dyskinesia correlation with peak-dose levels >1600 ng/mL

## License

MIT. See [LICENSE](LICENSE).

## Contributing

Feel free to fork and modify for your own needs. If you find bugs or have suggestions, please open an issue.

## Support

For questions about the app, please check the code comments or open an issue.

For medical questions, **always consult your healthcare provider**.

---

**Made with ❤️ for Parkinson's patients and caregivers**
