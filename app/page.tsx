"use client";

import { useEffect, useMemo, useState } from "react";

type ContractType = "Web design" | "App development" | "UI/UX design" | "Branding" | "SaaS build" | "Maintenance" | "Consulting" | "Retainer";

type FormState = {
  freelancerName: string;
  clientName: string;
  projectTitle: string;
  scopeOfWork: string;
  deliverables: string;
  timeline: string;
  milestones: string;
  paymentTerms: string;
  depositAmount: string;
  latePaymentTerms: string;
  revisionLimits: string;
  ipOwnershipTerms: string;
  sourceFilesOwnership: string;
  clientResponsibilities: string;
  cancellationTerms: string;
  confidentialityTerms: string;
  supportTerms: string;
  governingLaw: string;
};

type StepId = "type" | "people" | "scope" | "payment" | "timeline" | "ownership" | "revisions" | "cancellation" | "support" | "review";

type Risk = {
  id: string;
  step: StepId;
  field?: keyof FormState;
  title: string;
  detail: string;
  severity: "High" | "Medium";
};

type Step = {
  id: StepId;
  label: string;
  eyebrow: string;
  title: string;
  prompt: string;
  requiredFields: Array<keyof FormState>;
};

const storageKey = "scopeguard-draft-v2";

const contractTypes: Array<{ name: ContractType; summary: string }> = [
  { name: "Web design", summary: "Marketing sites, redesigns, landing pages" },
  { name: "App development", summary: "MVPs, mobile apps, product builds" },
  { name: "UI/UX design", summary: "Flows, prototypes, research, product design" },
  { name: "Branding", summary: "Identity systems, guidelines, launch kits" },
  { name: "SaaS build", summary: "Subscription products and internal tools" },
  { name: "Maintenance", summary: "Updates, fixes, monitoring, retainers" },
  { name: "Consulting", summary: "Strategy, audits, advisory, workshops" },
  { name: "Retainer", summary: "Ongoing monthly support and delivery" },
];

const steps: Step[] = [
  {
    id: "type",
    label: "Contract Type",
    eyebrow: "Start simple",
    title: "What kind of work is this?",
    prompt: "Choose the closest fit. ScopeGuard will keep the language focused on freelance tech work.",
    requiredFields: [],
  },
  {
    id: "people",
    label: "People",
    eyebrow: "Parties",
    title: "Who is this agreement between?",
    prompt: "Name the freelancer, the client, and the project so the draft has a clean foundation.",
    requiredFields: ["freelancerName", "clientName", "projectTitle"],
  },
  {
    id: "scope",
    label: "Scope",
    eyebrow: "Project shape",
    title: "Let’s define the project.",
    prompt: "Plain English scope beats legal fog. Say what is included and what the client should receive.",
    requiredFields: ["scopeOfWork", "deliverables"],
  },
  {
    id: "payment",
    label: "Payment",
    eyebrow: "Money",
    title: "Protect your payment terms.",
    prompt: "Add the fee structure, deposit, invoice timing, and late payment terms.",
    requiredFields: ["paymentTerms", "depositAmount"],
  },
  {
    id: "timeline",
    label: "Timeline",
    eyebrow: "Schedule",
    title: "Set the pace for delivery.",
    prompt: "Clarify milestones and feedback timing so the project does not drift silently.",
    requiredFields: ["timeline", "milestones", "clientResponsibilities"],
  },
  {
    id: "ownership",
    label: "Ownership",
    eyebrow: "Rights",
    title: "Clarify files, code, and IP.",
    prompt: "Say what transfers, when it transfers, and what you keep as reusable know-how.",
    requiredFields: ["ipOwnershipTerms", "sourceFilesOwnership"],
  },
  {
    id: "revisions",
    label: "Revisions",
    eyebrow: "Change control",
    title: "Keep revisions bounded.",
    prompt: "Define included rounds and how new requests become change requests.",
    requiredFields: ["revisionLimits"],
  },
  {
    id: "cancellation",
    label: "Cancellation",
    eyebrow: "Offboarding",
    title: "Make the exit calm.",
    prompt: "Set notice, payment for completed work, and what happens if either side ends the project.",
    requiredFields: ["cancellationTerms"],
  },
  {
    id: "support",
    label: "Support",
    eyebrow: "After launch",
    title: "Draw the support boundary.",
    prompt: "Explain what post-launch help is included, what is extra, and how confidentiality works.",
    requiredFields: ["supportTerms"],
  },
  {
    id: "review",
    label: "Review",
    eyebrow: "Ready check",
    title: "Review before you send.",
    prompt: "Scan missing fields, risks, and the generated clauses before exporting.",
    requiredFields: [],
  },
];

const emptyForm: FormState = {
  freelancerName: "",
  clientName: "",
  projectTitle: "",
  scopeOfWork: "",
  deliverables: "",
  timeline: "",
  milestones: "",
  paymentTerms: "",
  depositAmount: "",
  latePaymentTerms: "",
  revisionLimits: "",
  ipOwnershipTerms: "",
  sourceFilesOwnership: "",
  clientResponsibilities: "",
  cancellationTerms: "",
  confidentialityTerms: "",
  supportTerms: "",
  governingLaw: "",
};

const smartDefaults: FormState = {
  freelancerName: "",
  clientName: "",
  projectTitle: "",
  scopeOfWork: "Freelancer will provide the services described in the approved project brief. Work not listed in this agreement is outside the current scope unless approved in writing.",
  deliverables: "Final approved deliverables, relevant working files, handoff documentation, and one recorded walkthrough.",
  timeline: "The project timeline begins after deposit receipt and Client provides required access, assets, content, and approvals.",
  milestones: "Discovery and requirements, draft direction, production work, review and revisions, final handoff.",
  paymentTerms: "Invoices are due within 10 days of issue. Freelancer may pause work if invoices are overdue or required approvals are delayed.",
  depositAmount: "40% due before kickoff",
  latePaymentTerms: "Late payments may accrue 1.5% per month where permitted by law.",
  revisionLimits: "Two revision rounds are included. Requests beyond included rounds are treated as change requests.",
  ipOwnershipTerms: "Client receives ownership of final approved work after full payment. Freelancer retains pre-existing tools, templates, methods, and know-how.",
  sourceFilesOwnership: "Final source files and code transfer after full payment. Third-party libraries remain governed by their own licenses.",
  clientResponsibilities: "Client will provide feedback within three business days, required access, project materials, and one decision maker for approvals.",
  cancellationTerms: "Either party may terminate with seven days written notice. Client pays for completed work, approved expenses, and non-cancellable commitments through the termination date.",
  confidentialityTerms: "Each party will protect non-public business, product, technical, and customer information shared for the project.",
  supportTerms: "Thirty days of bug-fix support is included after launch for issues caused by the delivered work. New features, content changes, platform updates, and third-party service issues are billed separately.",
  governingLaw: "[Governing law / jurisdiction placeholder]",
};

const sampleForm: FormState = {
  freelancerName: "Jordan Lee Studio",
  clientName: "Northstar Labs",
  projectTitle: "Customer Onboarding Portal",
  scopeOfWork: "Design and build a responsive onboarding portal with account setup, guided checklists, admin content controls, and analytics events for key activation steps.",
  deliverables: "UX flows, high-fidelity UI designs, production Next.js implementation, CMS-backed checklist content, QA notes, deployment handoff, and one recorded walkthrough.",
  timeline: "Eight weeks from kickoff, beginning after deposit receipt and access to required brand/product materials.",
  milestones: "Week 1 discovery and requirements. Week 2 UX flows. Weeks 3-4 visual design. Weeks 5-7 development. Week 8 QA, revisions, and handoff.",
  paymentTerms: "Total fee of $18,000. 40% deposit due before scheduling kickoff, 30% after design approval, and 30% before production handoff. Invoices are due within 10 days.",
  depositAmount: "40% of project fee due before kickoff",
  latePaymentTerms: "Late payments accrue 1.5% per month where permitted by law.",
  revisionLimits: "Two revision rounds are included for design and one QA correction pass is included before handoff.",
  ipOwnershipTerms: "Client receives ownership of final approved work after full payment. Freelancer retains ownership of pre-existing tools, templates, know-how, and reusable methods.",
  sourceFilesOwnership: "Source code and final design files transfer to Client after full payment. Third-party libraries remain governed by their own licenses.",
  clientResponsibilities: "Client will provide timely feedback within three business days, access to systems, brand assets, product copy, and a single decision maker for approvals.",
  cancellationTerms: "Either party may terminate with seven days written notice. Client pays for completed work, approved expenses, and any non-cancellable commitments through the termination date.",
  confidentialityTerms: "Each party will protect non-public business, product, technical, and customer information shared for the project and use it only for project purposes.",
  supportTerms: "Thirty days of bug-fix support is included after launch for issues caused by the delivered work. New features, content changes, platform updates, and third-party service issues are billed separately.",
  governingLaw: "[Governing law / jurisdiction placeholder]",
};

const requiredFields: Array<keyof FormState> = steps.flatMap((step) => step.requiredFields);

function generateContract(type: ContractType, form: FormState) {
  const value = (text: string, fallback: string) => text.trim() || `[${fallback}]`;

  return `SCOPEGUARD CONTRACT DRAFT

Draft better contracts faster. Review with a lawyer when needed.

Important notice: This document is an editable contract draft for discussion and planning. It is not legal advice, does not create an attorney-client relationship, and should be reviewed by a qualified legal professional when needed.

1. Parties
This ${type.toLowerCase()} agreement is between ${value(form.freelancerName, "Freelancer name")} ("Freelancer") and ${value(form.clientName, "Client name")} ("Client").

2. Project Overview
The project is titled "${value(form.projectTitle, "Project title")}". This agreement defines the work, deliverables, timeline, payment terms, ownership terms, responsibilities, and cancellation rules for the project.

3. Scope of Work
${value(form.scopeOfWork, "Scope of work")}

Work not listed here is outside the current scope unless both parties approve it in writing through a change request.

4. Deliverables
${value(form.deliverables, "Deliverables")}

5. Timeline and Milestones
Timeline:
${value(form.timeline, "Timeline")}

Milestones:
${value(form.milestones, "Milestones")}

6. Fees and Payment Terms
${value(form.paymentTerms, "Payment terms")}

Deposit:
${value(form.depositAmount, "Deposit amount")}

Late payment:
${value(form.latePaymentTerms, "Late payment terms")}

7. Revisions and Change Requests
${value(form.revisionLimits, "Revision limits")}

Requests beyond included revision limits, changes to approved work, or new deliverables may require additional fees and timeline changes.

8. Intellectual Property and Ownership
${value(form.ipOwnershipTerms, "IP ownership terms")}

Source files and code:
${value(form.sourceFilesOwnership, "Source files/code ownership")}

Unless stated otherwise, ownership transfers only after Freelancer receives full payment.

9. Client Responsibilities
${value(form.clientResponsibilities, "Client responsibilities")}

10. Confidentiality
${value(form.confidentialityTerms, "Confidentiality terms")}

11. Support and Maintenance
${value(form.supportTerms, "Support/maintenance terms")}

12. Cancellation and Termination
${value(form.cancellationTerms, "Cancellation/termination terms")}

13. Limitation of Liability
To the maximum extent allowed by applicable law, each party's liability should be limited to reasonable, direct damages. Neither party should be responsible for indirect, incidental, special, consequential, or punitive damages, including lost profits. Review this section with a qualified legal professional for the relevant jurisdiction.

14. Governing Law
This agreement is governed by the laws of ${value(form.governingLaw, "Governing law / jurisdiction placeholder")}.

15. Signatures
Freelancer: ${value(form.freelancerName, "Freelancer name")}
Signature: ______________________________
Date: __________________

Client: ${value(form.clientName, "Client name")}
Signature: ______________________________
Date: __________________
`;
}

function getRisks(form: FormState): Risk[] {
  const risks: Risk[] = [];
  const payment = `${form.paymentTerms} ${form.latePaymentTerms}`.toLowerCase();
  const revisions = form.revisionLimits.toLowerCase();
  const responsibilities = form.clientResponsibilities.toLowerCase();
  const support = form.supportTerms.toLowerCase();

  if (!form.depositAmount.trim() && !payment.includes("deposit")) {
    risks.push({ id: "deposit", step: "payment", field: "depositAmount", title: "No deposit added", detail: "Add upfront payment before kickoff to reduce non-payment risk.", severity: "High" });
  }
  if (!form.revisionLimits.trim()) {
    risks.push({ id: "revision-limit", step: "revisions", field: "revisionLimits", title: "No revision limit", detail: "State how many revision rounds are included before extra fees apply.", severity: "High" });
  }
  if (revisions.includes("unlimited")) {
    risks.push({ id: "unlimited-revisions", step: "revisions", field: "revisionLimits", title: "Unlimited revisions detected", detail: "Unlimited revisions can make a fixed-fee project open-ended.", severity: "High" });
  }
  if (!payment.includes("late") && !payment.includes("overdue")) {
    risks.push({ id: "late-payment", step: "payment", field: "latePaymentTerms", title: "No late payment term", detail: "Add due dates and what happens if an invoice is overdue.", severity: "Medium" });
  }
  if (!form.ipOwnershipTerms.trim()) {
    risks.push({ id: "ip", step: "ownership", field: "ipOwnershipTerms", title: "No IP ownership clause", detail: "Clarify who owns final work and when ownership transfers.", severity: "High" });
  }
  if (!form.cancellationTerms.trim()) {
    risks.push({ id: "cancellation", step: "cancellation", field: "cancellationTerms", title: "No cancellation clause", detail: "Explain how either side may end the project and what remains payable.", severity: "High" });
  }
  if (!responsibilities.includes("feedback") && !responsibilities.includes("approval")) {
    risks.push({ id: "feedback", step: "timeline", field: "clientResponsibilities", title: "No client feedback deadline", detail: "Add a feedback window so the timeline does not drift silently.", severity: "Medium" });
  }
  if (!form.supportTerms.trim() || (!support.includes("not include") && !support.includes("billed separately"))) {
    risks.push({ id: "support", step: "support", field: "supportTerms", title: "No support/maintenance boundary", detail: "Define what post-launch support includes, excludes, and how long it lasts.", severity: "Medium" });
  }

  return risks;
}

function fieldRisk(risks: Risk[], field: keyof FormState) {
  return risks.find((risk) => risk.field === field);
}

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-dvh bg-[#f5f4ef] text-[#17231f]">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-64 bg-[linear-gradient(180deg,#ffffff_0%,rgba(255,255,255,0)_100%)]" />
      <div className="relative mx-auto max-w-7xl px-4 py-5 md:px-8">{children}</div>
    </main>
  );
}

function Header({ completion, onSample }: { completion: number; onSample: () => void }) {
  return (
    <header className="rounded-[28px] border border-[#e2ded4] bg-[#fffdfa]/85 p-4 shadow-[0_24px_80px_rgba(31,45,39,0.08)] backdrop-blur md:p-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-[#133b34] text-sm font-black text-white shadow-sm">SG</div>
          <div>
            <p className="text-lg font-black tracking-tight">ScopeGuard</p>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7a8179]">Freelance tech contracts</p>
          </div>
        </div>

        <div className="max-w-2xl">
          <h1 className="text-2xl font-black tracking-[-0.02em] text-[#102f2a] md:text-4xl">Draft better contracts faster.</h1>
          <p className="mt-2 text-sm leading-6 text-[#66706a] md:text-base">
            A guided contract drafting workspace for designers, developers, no-code builders, product consultants, and small agencies.
          </p>
        </div>

        <div className="flex flex-col gap-3 rounded-3xl bg-[#f4f1ea] p-3 lg:w-72">
          <div className="flex items-center justify-between text-sm font-bold">
            <span>Readiness</span>
            <span className="text-[#133b34]">{completion}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#ddd7cb]">
            <div className="h-full rounded-full bg-[#133b34]" style={{ width: `${completion}%` }} />
          </div>
          <button type="button" onClick={onSample} className="rounded-2xl border border-[#d6d0c4] bg-white px-4 py-2.5 text-sm font-bold text-[#24342f] transition hover:border-[#b9b0a2]">
            Load sample
          </button>
        </div>
      </div>
    </header>
  );
}

function ProgressSummary({ completion, savedAt, riskCount }: { completion: number; savedAt: string; riskCount: number }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <div className="rounded-3xl border border-[#e3ded4] bg-white p-4">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#879088]">Completion</p>
        <p className="mt-2 text-2xl font-black">{completion}%</p>
      </div>
      <div className="rounded-3xl border border-[#e3ded4] bg-white p-4">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#879088]">Open risks</p>
        <p className="mt-2 text-2xl font-black">{riskCount}</p>
      </div>
      <div className="rounded-3xl border border-[#e3ded4] bg-white p-4">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#879088]">Draft status</p>
        <p className="mt-2 text-sm font-bold text-[#48534e]">{savedAt || "Not saved yet"}</p>
      </div>
    </div>
  );
}

function StepTabs({
  activeStep,
  maxUnlockedStep,
  onStepChange,
}: {
  activeStep: number;
  maxUnlockedStep: number;
  onStepChange: (step: number) => void;
}) {
  return (
    <nav className="rounded-[28px] border border-[#e2ded4] bg-white p-2 shadow-sm">
      <div className="flex gap-2 overflow-x-auto">
        {steps.map((step, index) => {
          const locked = index > maxUnlockedStep;
          return (
            <button
              type="button"
              key={step.id}
              disabled={locked}
              onClick={() => onStepChange(index)}
              className={`min-w-fit rounded-2xl px-4 py-3 text-sm font-bold transition ${
                activeStep === index
                  ? "bg-[#133b34] text-white shadow-sm"
                  : locked
                    ? "bg-[#f6f3ec] text-[#b6aea2]"
                    : "text-[#59645f] hover:bg-[#f4f1ea]"
              }`}
            >
              <span className="mr-2 text-xs opacity-70">{String(index + 1).padStart(2, "0")}</span>
              {step.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function ContractTypeSelector({ value, onChange }: { value: ContractType; onChange: (type: ContractType) => void }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {contractTypes.map((type) => (
        <button
          type="button"
          key={type.name}
          onClick={() => onChange(type.name)}
          className={`rounded-3xl border p-5 text-left transition ${
            value === type.name
              ? "border-[#133b34] bg-[#eef5ef] shadow-[0_16px_40px_rgba(19,59,52,0.12)]"
              : "border-[#e2ded4] bg-white hover:border-[#c9c0b1]"
          }`}
        >
          <span className="text-base font-black text-[#152b26]">{type.name}</span>
          <span className="mt-2 block text-sm leading-6 text-[#6c756f]">{type.summary}</span>
        </button>
      ))}
    </div>
  );
}

function FormField({
  label,
  value,
  placeholder,
  helper,
  risk,
  onChange,
  short = false,
}: {
  label: string;
  value: string;
  placeholder: string;
  helper?: string;
  risk?: Risk;
  onChange: (value: string) => void;
  short?: boolean;
}) {
  const inputClass = `w-full rounded-2xl border bg-[#fffdfa] px-4 py-3 text-sm text-[#17231f] outline-none transition placeholder:text-[#a9a196] focus:border-[#133b34] focus:ring-4 focus:ring-[#dce8df] ${
    risk ? "border-[#e4a28c]" : "border-[#ddd7cb]"
  }`;

  return (
    <label className="block">
      <span className="flex items-center justify-between gap-3">
        <span className="text-sm font-black text-[#17231f]">{label}</span>
        {risk ? <span className="rounded-full bg-[#fff0e9] px-2.5 py-1 text-xs font-black text-[#aa4325]">{risk.severity}</span> : null}
      </span>
      {short ? (
        <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={`${inputClass} mt-2`} />
      ) : (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={`${inputClass} mt-2 min-h-32 resize-y leading-6`} />
      )}
      {risk ? <p className="mt-2 text-sm leading-5 text-[#9b3b20]">{risk.detail}</p> : helper ? <p className="mt-2 text-sm leading-5 text-[#747d77]">{helper}</p> : null}
    </label>
  );
}

function DisclosureSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="group rounded-3xl border border-[#e2ded4] bg-[#faf8f2] p-4">
      <summary className="cursor-pointer list-none text-sm font-black text-[#22332e]">
        <span className="inline-flex w-full items-center justify-between gap-4">
          {title}
          <span className="rounded-full bg-white px-3 py-1 text-xs text-[#6c756f] group-open:hidden">Open</span>
          <span className="hidden rounded-full bg-white px-3 py-1 text-xs text-[#6c756f] group-open:inline">Close</span>
        </span>
      </summary>
      <div className="mt-4">{children}</div>
    </details>
  );
}

function StepFormCard({
  step,
  children,
  onDefault,
}: {
  step: Step;
  children: React.ReactNode;
  onDefault?: () => void;
}) {
  return (
    <section className="rounded-[32px] border border-[#e2ded4] bg-white p-5 shadow-[0_24px_80px_rgba(31,45,39,0.08)] md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-[#a24d33]">{step.eyebrow}</p>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.02em] text-[#102f2a] md:text-4xl">{step.title}</h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[#65706a]">{step.prompt}</p>
        </div>
        {onDefault ? (
          <button type="button" onClick={onDefault} className="rounded-2xl border border-[#d6d0c4] bg-[#fffdfa] px-4 py-2.5 text-sm font-bold text-[#24342f] hover:border-[#b9b0a2]">
            Use smart defaults
          </button>
        ) : null}
      </div>
      <div className="mt-8 grid gap-5">{children}</div>
    </section>
  );
}

function RiskReviewPanel({ risks, step }: { risks: Risk[]; step: Step }) {
  const contextualRisks = step.id === "review" ? risks : risks.filter((risk) => risk.step === step.id);

  return (
    <aside className="rounded-[32px] border border-[#e2ded4] bg-[#fffdfa] p-5 shadow-sm lg:sticky lg:top-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-[#879088]">Risk Review</p>
          <h3 className="mt-2 text-xl font-black text-[#102f2a]">{step.id === "review" ? "Full draft scan" : step.label}</h3>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-black ${contextualRisks.length ? "bg-[#fff0e9] text-[#a33c21]" : "bg-[#eaf4ee] text-[#133b34]"}`}>
          {contextualRisks.length} open
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {contextualRisks.length ? (
          contextualRisks.slice(0, step.id === "review" ? 8 : 3).map((risk) => (
            <div key={risk.id} className="rounded-3xl border border-[#f0d0c2] bg-[#fff8f4] p-4">
              <p className="text-sm font-black text-[#79311e]">{risk.title}</p>
              <p className="mt-2 text-sm leading-6 text-[#78584e]">{risk.detail}</p>
            </div>
          ))
        ) : (
          <div className="rounded-3xl border border-[#d8e8dc] bg-[#f2faf4] p-4">
            <p className="text-sm font-black text-[#133b34]">Looks clear for this step</p>
            <p className="mt-2 text-sm leading-6 text-[#566963]">Keep going. You can review the whole draft at the end.</p>
          </div>
        )}
      </div>
    </aside>
  );
}

function GeneratedDraftPanel({
  draft,
  setDraft,
  onRegenerate,
  onCopy,
  copied,
}: {
  draft: string;
  setDraft: (draft: string) => void;
  onRegenerate: () => void;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <section className="rounded-[32px] border border-[#d9d4ca] bg-[#fffdfa] p-5 md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-[#a24d33]">Generated Draft</p>
          <h3 className="mt-2 text-2xl font-black text-[#102f2a]">Editable contract</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onRegenerate} className="rounded-2xl border border-[#d6d0c4] bg-white px-4 py-2.5 text-sm font-bold">Regenerate</button>
          <button type="button" onClick={onCopy} className="rounded-2xl border border-[#d6d0c4] bg-white px-4 py-2.5 text-sm font-bold">{copied ? "Copied" : "Copy"}</button>
          <button type="button" onClick={() => window.print()} className="rounded-2xl bg-[#133b34] px-4 py-2.5 text-sm font-bold text-white">Export PDF</button>
        </div>
      </div>
      <textarea className="print-contract mt-5 min-h-[560px] w-full resize-y rounded-3xl border border-[#ddd7cb] bg-white p-5 font-mono text-sm leading-6 text-[#17231f] outline-none focus:border-[#133b34] focus:ring-4 focus:ring-[#dce8df]" value={draft} onChange={(event) => setDraft(event.target.value)} />
    </section>
  );
}

function ReviewSummary({
  form,
  risks,
  completion,
  contractType,
}: {
  form: FormState;
  risks: Risk[];
  completion: number;
  contractType: ContractType;
}) {
  const missing = requiredFields.filter((field) => !form[field].trim());

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-3xl border border-[#e2ded4] bg-[#faf8f2] p-5">
        <p className="text-sm font-black text-[#879088]">Contract</p>
        <p className="mt-2 text-xl font-black">{contractType}</p>
        <p className="mt-2 text-sm leading-6 text-[#67736c]">{form.projectTitle || "Project title missing"}</p>
      </div>
      <div className="rounded-3xl border border-[#e2ded4] bg-[#faf8f2] p-5">
        <p className="text-sm font-black text-[#879088]">Required fields</p>
        <p className="mt-2 text-xl font-black">{missing.length ? `${missing.length} missing` : "Complete"}</p>
        <p className="mt-2 text-sm leading-6 text-[#67736c]">Completion is {completion}%.</p>
      </div>
      <div className="rounded-3xl border border-[#e2ded4] bg-[#faf8f2] p-5">
        <p className="text-sm font-black text-[#879088]">Risk scan</p>
        <p className="mt-2 text-xl font-black">{risks.length ? `${risks.length} open` : "No common gaps"}</p>
        <p className="mt-2 text-sm leading-6 text-[#67736c]">Review with a qualified legal professional when needed.</p>
      </div>
    </div>
  );
}

export default function ScopeGuard() {
  const [contractType, setContractType] = useState<ContractType>("Web design");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [activeStep, setActiveStep] = useState(0);
  const [draft, setDraft] = useState(() => generateContract("Web design", emptyForm));
  const [savedAt, setSavedAt] = useState("");
  const [copied, setCopied] = useState(false);

  const risks = useMemo(() => getRisks(form), [form]);
  const completion = Math.round((requiredFields.filter((field) => form[field].trim()).length / requiredFields.length) * 100);
  const basicsComplete = Boolean(contractType && form.freelancerName.trim() && form.clientName.trim() && form.projectTitle.trim());
  const maxUnlockedStep = basicsComplete ? steps.length - 1 : Math.min(1, activeStep + 1);
  const step = steps[activeStep];
  const generatedDraft = useMemo(() => generateContract(contractType, form), [contractType, form]);

  useEffect(() => {
    window.setTimeout(() => {
      const saved = window.localStorage.getItem(storageKey);

      if (!saved) return;

      try {
        const parsed = JSON.parse(saved) as {
          contractType?: ContractType;
          form?: Partial<FormState>;
          draft?: string;
          savedAt?: string;
          activeStep?: number;
        };

        if (parsed.contractType) setContractType(parsed.contractType);
        if (parsed.form) setForm({ ...emptyForm, ...parsed.form });
        if (parsed.draft) setDraft(parsed.draft);
        if (parsed.savedAt) setSavedAt(parsed.savedAt);
        if (typeof parsed.activeStep === "number") setActiveStep(Math.min(Math.max(parsed.activeStep, 0), steps.length - 1));
      } catch {
        window.localStorage.removeItem(storageKey);
      }
    }, 0);
  }, []);

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setCopied(false);
  };

  const applyDefaults = (fields: Array<keyof FormState>) => {
    setForm((current) => {
      const next = { ...current };
      fields.forEach((field) => {
        if (!next[field].trim()) next[field] = smartDefaults[field];
      });
      return next;
    });
  };

  const saveDraft = () => {
    const time = new Date().toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
    window.localStorage.setItem(storageKey, JSON.stringify({ contractType, form, draft, savedAt: time, activeStep }));
    setSavedAt(time);
  };

  const loadSample = () => {
    setContractType("SaaS build");
    setForm(sampleForm);
    setDraft(generateContract("SaaS build", sampleForm));
    setSavedAt("");
    setActiveStep(9);
  };

  const copyDraft = async () => {
    await navigator.clipboard.writeText(draft);
    setCopied(true);
  };

  const changeStep = (nextStep: number) => {
    const safeStep = Math.min(Math.max(nextStep, 0), maxUnlockedStep);
    if (steps[safeStep]?.id === "review") {
      setDraft(generatedDraft);
    }
    setActiveStep(safeStep);
  };

  const goNext = () => changeStep(activeStep + 1);
  const goBack = () => setActiveStep((current) => Math.max(current - 1, 0));

  return (
    <AppShell>
      <div className="space-y-5">
        <Header completion={completion} onSample={loadSample} />
        <StepTabs activeStep={activeStep} maxUnlockedStep={maxUnlockedStep} onStepChange={changeStep} />
        <ProgressSummary completion={completion} savedAt={savedAt} riskCount={risks.length} />

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5">
            {step.id === "type" ? (
              <StepFormCard step={step}>
                <ContractTypeSelector value={contractType} onChange={setContractType} />
              </StepFormCard>
            ) : null}

            {step.id === "people" ? (
              <StepFormCard step={step}>
                <div className="grid gap-5 md:grid-cols-2">
                  <FormField label="Freelancer name" value={form.freelancerName} placeholder="Your legal or studio name" short onChange={(value) => updateField("freelancerName", value)} />
                  <FormField label="Client name" value={form.clientName} placeholder="Client company or individual" short onChange={(value) => updateField("clientName", value)} />
                </div>
                <FormField label="Project title" value={form.projectTitle} placeholder="Customer onboarding portal, website redesign, app MVP..." short onChange={(value) => updateField("projectTitle", value)} />
              </StepFormCard>
            ) : null}

            {step.id === "scope" ? (
              <StepFormCard step={step} onDefault={() => applyDefaults(["scopeOfWork", "deliverables"])}>
                <FormField label="Scope of work" value={form.scopeOfWork} placeholder="What work is included? What is clearly outside this draft?" helper="Write this like a project brief, not a legal memo." onChange={(value) => updateField("scopeOfWork", value)} />
                <FormField label="Deliverables" value={form.deliverables} placeholder="Design files, code, prototypes, documentation, handoff..." onChange={(value) => updateField("deliverables", value)} />
              </StepFormCard>
            ) : null}

            {step.id === "payment" ? (
              <StepFormCard step={step} onDefault={() => applyDefaults(["paymentTerms", "depositAmount", "latePaymentTerms"])}>
                <FormField label="Payment terms" value={form.paymentTerms} placeholder="Total fee, invoice schedule, due dates..." risk={fieldRisk(risks, "paymentTerms")} onChange={(value) => updateField("paymentTerms", value)} />
                <div className="grid gap-5 md:grid-cols-2">
                  <FormField label="Deposit amount" value={form.depositAmount} placeholder="40% due before kickoff" short risk={fieldRisk(risks, "depositAmount")} onChange={(value) => updateField("depositAmount", value)} />
                  <FormField label="Late payment terms" value={form.latePaymentTerms} placeholder="Overdue invoices may accrue..." short risk={fieldRisk(risks, "latePaymentTerms")} onChange={(value) => updateField("latePaymentTerms", value)} />
                </div>
              </StepFormCard>
            ) : null}

            {step.id === "timeline" ? (
              <StepFormCard step={step} onDefault={() => applyDefaults(["timeline", "milestones", "clientResponsibilities"])}>
                <FormField label="Timeline" value={form.timeline} placeholder="How long will the project take, and what starts the clock?" onChange={(value) => updateField("timeline", value)} />
                <FormField label="Milestones" value={form.milestones} placeholder="Discovery, design, build, QA, launch..." onChange={(value) => updateField("milestones", value)} />
                <FormField label="Client responsibilities" value={form.clientResponsibilities} placeholder="Feedback deadline, assets, access, approvals, decision maker..." risk={fieldRisk(risks, "clientResponsibilities")} onChange={(value) => updateField("clientResponsibilities", value)} />
              </StepFormCard>
            ) : null}

            {step.id === "ownership" ? (
              <StepFormCard step={step} onDefault={() => applyDefaults(["ipOwnershipTerms", "sourceFilesOwnership"])}>
                <FormField label="IP ownership terms" value={form.ipOwnershipTerms} placeholder="Who owns final work after payment? What do you retain?" risk={fieldRisk(risks, "ipOwnershipTerms")} onChange={(value) => updateField("ipOwnershipTerms", value)} />
                <DisclosureSection title="Source files and code">
                  <FormField label="Source files/code ownership" value={form.sourceFilesOwnership} placeholder="Repos, design files, build files, third-party libraries..." onChange={(value) => updateField("sourceFilesOwnership", value)} />
                </DisclosureSection>
              </StepFormCard>
            ) : null}

            {step.id === "revisions" ? (
              <StepFormCard step={step} onDefault={() => applyDefaults(["revisionLimits"])}>
                <FormField label="Revision limits" value={form.revisionLimits} placeholder="Two revision rounds are included..." risk={fieldRisk(risks, "revisionLimits")} onChange={(value) => updateField("revisionLimits", value)} />
              </StepFormCard>
            ) : null}

            {step.id === "cancellation" ? (
              <StepFormCard step={step} onDefault={() => applyDefaults(["cancellationTerms"])}>
                <FormField label="Cancellation/termination terms" value={form.cancellationTerms} placeholder="Notice period, payment for completed work, expenses..." risk={fieldRisk(risks, "cancellationTerms")} onChange={(value) => updateField("cancellationTerms", value)} />
              </StepFormCard>
            ) : null}

            {step.id === "support" ? (
              <StepFormCard step={step} onDefault={() => applyDefaults(["supportTerms", "confidentialityTerms", "governingLaw"])}>
                <FormField label="Support/maintenance terms" value={form.supportTerms} placeholder="What support is included, for how long, and what is extra?" risk={fieldRisk(risks, "supportTerms")} onChange={(value) => updateField("supportTerms", value)} />
                <DisclosureSection title="Advanced clauses">
                  <div className="grid gap-5">
                    <FormField label="Confidentiality terms" value={form.confidentialityTerms} placeholder="How both sides handle private information..." onChange={(value) => updateField("confidentialityTerms", value)} />
                    <FormField label="Governing law placeholder" value={form.governingLaw} placeholder="[Governing law / jurisdiction placeholder]" short onChange={(value) => updateField("governingLaw", value)} />
                  </div>
                </DisclosureSection>
              </StepFormCard>
            ) : null}

            {step.id === "review" ? (
              <StepFormCard step={step}>
                <ReviewSummary form={form} risks={risks} completion={completion} contractType={contractType} />
                <GeneratedDraftPanel draft={draft} setDraft={setDraft} onRegenerate={() => setDraft(generatedDraft)} onCopy={copyDraft} copied={copied} />
              </StepFormCard>
            ) : null}

            {!basicsComplete && activeStep > 1 ? (
              <section className="rounded-[32px] border border-[#e2ded4] bg-white p-8 text-center">
                <h2 className="text-2xl font-black text-[#102f2a]">Start with the basics</h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#65706a]">
                  Add the people and project title first. Then the rest of the contract flow opens up.
                </p>
              </section>
            ) : null}

            <div className="flex flex-col gap-3 rounded-[28px] border border-[#e2ded4] bg-white p-3 md:flex-row md:items-center md:justify-between">
              <p className="px-2 text-sm font-semibold text-[#66706a]">Draft only. Not legal advice. Review with a qualified legal professional when needed.</p>
              <div className="flex gap-2">
                <button type="button" onClick={goBack} disabled={activeStep === 0} className="rounded-2xl px-4 py-2.5 text-sm font-bold text-[#48534e] disabled:opacity-40">
                  Back
                </button>
                <button type="button" onClick={saveDraft} className="rounded-2xl border border-[#d6d0c4] bg-white px-4 py-2.5 text-sm font-bold text-[#24342f]">
                  Save
                </button>
                <button type="button" onClick={goNext} disabled={activeStep >= maxUnlockedStep && activeStep !== steps.length - 1} className="rounded-2xl bg-[#133b34] px-5 py-2.5 text-sm font-bold text-white disabled:bg-[#b8c1bc]">
                  {activeStep === steps.length - 1 ? "Done" : "Next"}
                </button>
              </div>
            </div>
          </div>

          <RiskReviewPanel risks={risks} step={step} />
        </div>
      </div>
    </AppShell>
  );
}
