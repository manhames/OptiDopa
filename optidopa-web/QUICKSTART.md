# 🚀 Quick Start Guide

## Start the App

```bash
cd optidopa-web
npm run dev
```

Then open: **http://localhost:3000**

## How to Use

### 1️⃣ Add Your Doses

Click **"Add Dose"** button in the top right

### 2️⃣ Edit the Table

- **Date**: Click to select date
- **Time**: Click to select time (24-hour format)
- **Medication**: Choose Carbilev (IR) or Sinemet CR
- **Dose**: Choose Full or Half
- **Delete**: Click trash icon to remove

### 3️⃣ Watch the Magic

The chart updates **instantly** as you edit!

### 4️⃣ Understand the Chart

**Color Zones:**
- 🟢 **Green** (1000-1600 ng/mL): Optimal - you want to stay here!
- 🟡 **Yellow** (800-1000 ng/mL): Sub-optimal but still working
- 🔴 **Red** (>1600 ng/mL): Dyskinesia risk - try to avoid

**What to Look For:**
- ✅ Blue line stays in green zone most of the time
- ✅ Trough (lowest point) stays above 800 ng/mL
- ✅ Peak doesn't go too high into red zone
- ✅ Smooth curve without big valleys

### 5️⃣ Check Your Stats

Top panel shows:
- **Peak**: Highest concentration
- **Trough**: Lowest concentration
- **In Range**: % time in optimal zone (aim for >70%)
- **Risk Zone**: % time above dyskinesia threshold (keep low!)
- **Daily Dose**: Total mg of levodopa

### 6️⃣ Export Data

Click **"Export CSV"** button to download your concentration data

## Example Schedule

The app comes with a sample schedule:
- 7:00 AM - Carbilev Full (100mg IR)
- 11:00 AM - Carbilev Full (100mg IR)
- 3:00 PM - Carbilev Full (100mg IR)
- 7:00 PM - Carbilev Half (50mg IR)
- 11:00 PM - Sinemet CR Full (200mg CR) ← "Night anchor"

This creates a nice plateau effect!

## Tips

💡 **Night Anchor**: Taking CR at bedtime helps prevent early-morning "OFF" periods

💡 **Spacing**: IR doses every 4 hours work well for most people

💡 **Food**: Remember this model doesn't account for food effects - CR absorption increases 50% with food!

💡 **Experiment**: Try different timing strategies to find what keeps you in the green zone longest

## Troubleshooting

**Chart not updating?**
- Make sure you've added at least one dose
- Check that dates/times are valid

**Want to start over?**
- Delete all doses and add new ones
- Or refresh the page to reset to sample data

## Need Help?

Check the main README.md in the parent folder for full documentation and scientific details.

---

**Remember**: This is a simulation tool. Always discuss medication changes with your doctor! 👨‍⚕️
