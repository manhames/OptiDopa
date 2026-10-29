'use client';

import { PK_PARAMS } from '@/lib/pharmacokinetics';
import { MessageSquareWarning } from 'lucide-react';

const REPO = 'https://github.com/manhames/OptiDopa';

function disputeUrl() {
  const title = encodeURIComponent('Dispute: plotting / pharmacokinetic method');
  const body = encodeURIComponent(
`**What part of the calculation do you think is wrong?**
(e.g. half-life, absorption rate, bioavailability, volume of distribution, thresholds, baseline, superposition)

**What should it be instead, and why?**

**Source** (paper, guideline, label, clinical experience):

**Example doses that show the problem** (optional, paste rows from the table):
`);
  return `${REPO}/issues/new?title=${title}&body=${body}&labels=dispute`;
}

export function DisputeButton({ className = '' }: { className?: string }) {
  return (
    <a
      href={disputeUrl()}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-700 dark:bg-gray-800 dark:text-red-300 dark:hover:bg-red-900/30 ${className}`}
      title="Open a GitHub issue to dispute the plotting method"
    >
      <MessageSquareWarning size={16} />
      Dispute the method
    </a>
  );
}

export default function HowItWorks({ baseline }: { baseline: number }) {
  const p = PK_PARAMS;
  const ke = p.k_e.toFixed(3);
  return (
    <details className="mt-8 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
      <summary className="cursor-pointer text-2xl font-semibold text-gray-900 dark:text-white">
        How the curve is calculated
      </summary>

      <div className="mt-4 space-y-5 text-sm text-gray-700 dark:text-gray-300">
        <p>
          Every dose is modelled as a <strong>one-compartment pharmacokinetic model with first-order absorption
          and first-order elimination</strong>. The plasma concentration contributed by a single dose at time{' '}
          <em>t</em> hours after taking it is:
        </p>
        <pre className="overflow-x-auto rounded bg-gray-100 p-3 text-xs text-gray-900 dark:bg-gray-900 dark:text-gray-100">
{`C(t) = (F × Dose × k_a) / (Vd × (k_a − k_e)) × (e^(−k_e·t) − e^(−k_a·t))`}
        </pre>
        <p>
          Dose is in mg of levodopa, concentration comes out in ng/mL. With several doses the contributions are
          simply <strong>added together (superposition)</strong>: the curve you see is the sum of one curve per
          dose, sampled every 5 minutes, plus the baseline you set with the slider.
        </p>

        <div>
          <p className="mb-2 font-semibold text-gray-900 dark:text-white">Parameters used</p>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="border-b border-gray-300 dark:border-gray-600">
                <tr>
                  <th className="py-1 pr-4">Parameter</th>
                  <th className="py-1 pr-4">Immediate release (IR)</th>
                  <th className="py-1 pr-4">Controlled release (CR)</th>
                  <th className="py-1">Meaning</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr><td className="py-1 pr-4">Half-life (t½)</td><td className="py-1 pr-4">{p.t_half} h</td><td className="py-1 pr-4">{p.t_half} h</td><td className="py-1">Time for plasma level to halve</td></tr>
                <tr><td className="py-1 pr-4">Elimination rate (k_e)</td><td className="py-1 pr-4">{ke} h⁻¹</td><td className="py-1 pr-4">{ke} h⁻¹</td><td className="py-1">ln(2) / t½</td></tr>
                <tr><td className="py-1 pr-4">Absorption rate (k_a)</td><td className="py-1 pr-4">{p.IR.k_a} h⁻¹</td><td className="py-1 pr-4">{p.CR.k_a} h⁻¹</td><td className="py-1">How fast the dose enters the blood</td></tr>
                <tr><td className="py-1 pr-4">Bioavailability (F)</td><td className="py-1 pr-4">{p.IR.F * 100}%</td><td className="py-1 pr-4">{p.CR.F * 100}%</td><td className="py-1">Fraction absorbed, relative to IR</td></tr>
                <tr><td className="py-1 pr-4">Time to peak (T_max)</td><td className="py-1 pr-4">{p.IR.T_max} h</td><td className="py-1 pr-4">{p.CR.T_max} h</td><td className="py-1">Implied by k_a and k_e</td></tr>
                <tr><td className="py-1 pr-4">Volume of distribution (Vd)</td><td className="py-1 pr-4">{p.Vd} L</td><td className="py-1 pr-4">{p.Vd} L</td><td className="py-1">Apparent volume the drug spreads into</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <p className="mb-2 font-semibold text-gray-900 dark:text-white">Thresholds drawn on the chart</p>
          <ul className="list-disc space-y-1 pl-5">
            <li><strong>{p.C_min} ng/mL</strong>: minimum effective level. Below this, symptoms tend to return.</li>
            <li><strong>{p.C_target_low}–{p.C_target_high} ng/mL</strong>: target range used for the &quot;in range&quot; statistic.</li>
            <li><strong>&gt;{p.C_dyskinesia} ng/mL</strong>: dyskinesia risk zone.</li>
            <li>If you entered your own observed ranges in the Patient Profile panel, those override the defaults for the statistics.</li>
          </ul>
        </div>

        <div>
          <p className="mb-2 font-semibold text-gray-900 dark:text-white">Baseline slider</p>
          <p>
            The model starts every day from zero, which is not true for most people. The baseline slider adds a
            constant <strong>{baseline} ng/mL</strong> to the whole curve as a rough stand-in for residual levodopa
            from earlier doses, long-acting medication, or endogenous dopamine. It is an estimate you set, not
            something the model computes. Move it until the curve matches how you actually feel across the day.
          </p>
        </div>

        <div>
          <p className="mb-2 font-semibold text-gray-900 dark:text-white">What this model ignores</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Food, especially protein, which delays and reduces absorption.</li>
            <li>Gastric emptying, which varies a lot from dose to dose and day to day.</li>
            <li>Carbidopa, entacapone, or other co-medications that change elimination.</li>
            <li>Disease progression and individual genetics. The parameters are population averages.</li>
            <li>The lag between plasma level and clinical effect. Plasma level is not the same as how you feel.</li>
          </ul>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
          <p className="flex-1">
            Think a parameter, threshold, or the method itself is wrong? Open a dispute. Every disputed parameter
            is tracked publicly so others can weigh in.
          </p>
          <DisputeButton />
          <a
            href={`${REPO}/blob/master/optidopa-web/lib/pharmacokinetics.ts`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm underline"
          >
            Read the source
          </a>
        </div>
      </div>
    </details>
  );
}
