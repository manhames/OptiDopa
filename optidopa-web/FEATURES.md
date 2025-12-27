# OptiDopa Web App - Google Sheets Features

## ✨ New Features Implemented

### 1. 📊 Google Sheets-like Table Interface

The dose schedule table has been completely redesigned to look and feel like Google Sheets:

#### Visual Design
- **Grid layout** with visible cell borders (classic spreadsheet look)
- **Frozen header row** that stays visible while scrolling
- **Row numbers** column (#1, #2, #3...)
- **Column headers** with resize handles
- **Alternating row hover** effects
- **Cell focus indicators** (blue border when selected)
- **Professional styling** matching Google Sheets aesthetics

#### Interactive Features
- **Column resizing**: Drag the right edge of column headers to resize
- **Cell editing**: Double-click or press Enter to edit
- **Keyboard navigation**:
  - **Arrow keys**: Navigate between cells
  - **Tab**: Move to next cell (Shift+Tab for previous)
  - **Enter**: Edit current cell
  - **Escape**: Cancel editing
- **Visual feedback**: Cells highlight when focused or being edited

### 2. 📥📤 Excel/Google Sheets Import & Export

#### Export to Excel
- **One-click export** to `.xlsx` file
- **Automatic formatting** with proper column widths
- **Sheet name**: "Levodopa Doses"
- **File naming**: `levodopa_doses_YYYY-MM-DD.xlsx`
- **All data included**: Date, Time, Medication, Dose, Amount, Type

#### Import from Excel
- **File upload** via Import button
- **Supports** `.xlsx` and `.xls` formats
- **Smart parsing**:
  - Handles Excel date serials
  - Parses multiple time formats
  - Case-insensitive dose matching
  - Auto-calculates doseMg and formulation
- **Preview modal** before importing:
  - Shows first 5 doses
  - Lists all validation errors
  - Displays warnings
  - Requires confirmation before replacing data

#### Import Validation
- ✅ Required fields: Date, Time, Medication, Dose
- ✅ Valid medications: "Carbilev" or "Sinemet CR"
- ✅ Valid doses: "Full" or "Half" (case-insensitive)
- ✅ Skips empty rows automatically
- ✅ Shows specific error messages for each issue

### 3. ⌨️ Copy & Paste Functionality

#### Copy (Ctrl+C / Cmd+C)
- **Copies all doses** to clipboard as tab-separated values (TSV)
- **Works with Excel and Google Sheets** - just paste directly!
- **Format**: Tab-separated with headers
- **Automatic**: No selection needed, copies entire table

#### Paste (Ctrl+V / Cmd+V)
- **Paste from Excel/Google Sheets** directly into the app
- **Multi-row support**: Paste many doses at once
- **Smart parsing**: Validates and transforms data automatically
- **Confirmation dialog**: Shows how many doses will be pasted
- **Error handling**: Clear messages if data is invalid
- **Safety**: Requires confirmation before replacing data

### 4. 📱 Responsive Design

- **Mobile-friendly** button layout
- **Flexible table width** adapts to screen size
- **Scrollable** on smaller screens
- **Touch-friendly** controls

## 🎯 How to Use

### Exporting Your Schedule
1. Click the **"Export"** button (purple, with download icon)
2. File automatically downloads as `levodopa_doses_YYYY-MM-DD.xlsx`
3. Open in Excel or Google Sheets

### Importing a Schedule
1. Create an Excel file with columns:
   - **Date**: YYYY-MM-DD format
   - **Time**: HH:MM format (24-hour)
   - **Medication**: "Carbilev" or "Sinemet CR"
   - **Dose**: "Full" or "Half"
2. Click the **"Import"** button (green, with upload icon)
3. Select your `.xlsx` file
4. Review the preview modal
5. Click **"Import X Dose(s)"** to confirm

### Using Keyboard Navigation
1. **Click any cell** to focus it (blue border appears)
2. **Press arrow keys** to move between cells
3. **Press Enter** to edit the focused cell
4. **Type your changes** and press Enter to save
5. **Press Escape** to cancel editing

### Copying & Pasting
1. **To copy**: Press Ctrl+C (or Cmd+C on Mac) - all doses are copied
2. **To paste from Excel**:
   - Copy cells from Excel/Sheets (Ctrl+C)
   - Click into the OptiDopa table
   - Press Ctrl+V (or Cmd+V)
   - Confirm in the dialog

### Resizing Columns
1. **Hover over** the right edge of a column header
2. **Cursor changes** to resize cursor
3. **Click and drag** to adjust width
4. **Release** to set new width

## 📋 Excel File Format

When you export or create a file to import, use this format:

| Date       | Time  | Medication  | Dose | Amount (mg) | Type |
|------------|-------|-------------|------|-------------|------|
| 2025-12-27 | 07:00 | Carbilev    | Full | 100         | IR   |
| 2025-12-27 | 11:00 | Carbilev    | Full | 100         | IR   |
| 2025-12-27 | 15:00 | Carbilev    | Full | 100         | IR   |
| 2025-12-27 | 19:00 | Carbilev    | Half | 50          | IR   |
| 2025-12-27 | 23:00 | Sinemet CR  | Full | 200         | CR   |

**Note**: The "Amount (mg)" and "Type" columns are auto-calculated, so you only need to fill in Date, Time, Medication, and Dose.

## 🛠️ Technical Details

### Technologies Used
- **xlsx** library for Excel file handling
- **Custom SpreadsheetCell** component for cell editing
- **CSS Grid** layout for table structure
- **React hooks** for state management
- **TypeScript** for type safety
- **date-fns** for date parsing

### File Structure
- `lib/xlsxUtils.ts` - Excel import/export functions
- `components/SpreadsheetCell.tsx` - Individual cell component
- `components/DoseTable.tsx` - Main spreadsheet grid
- `components/ImportPreviewModal.tsx` - Import confirmation dialog
- `app/page.tsx` - Main app with import/export buttons

### Performance
- Handles **50+ doses** smoothly
- **Real-time validation** during import
- **Optimized rendering** with React memo
- **Minimal bundle size** increase (~100KB gzipped for xlsx)

## 🔒 Data Safety

- **Import requires confirmation** - never auto-replaces data
- **Preview before import** - see exactly what will be added
- **Validation warnings** - know about any issues before confirming
- **Export anytime** - save your data as backup

## 💡 Tips & Tricks

1. **Quick Entry**: Paste your weekly schedule from Excel in seconds
2. **Keyboard Shortcuts**: Navigate like a pro with arrow keys and Tab
3. **Column Width**: Resize columns to see more/less detail
4. **Export Regularly**: Keep backups of your dose schedules
5. **Copy to Share**: Copy data to share with your doctor or caregiver

## 🎨 Visual Improvements

Before:
- Simple HTML table with form inputs
- No keyboard navigation
- Manual file creation for export
- No paste support

After:
- Professional spreadsheet grid
- Full keyboard control
- One-click Excel export
- Copy/paste from Excel/Sheets
- Column resizing
- Row numbers
- Google Sheets-like styling

## 🚀 Future Enhancements (Potential)

- Multi-cell selection
- Right-click context menus
- Undo/redo functionality
- Cell formulas
- Save column widths in localStorage
- Direct Google Sheets API integration (cloud sync)

---

Enjoy your Google Sheets-like experience! 📊✨
