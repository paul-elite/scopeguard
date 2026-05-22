"use client";

import { useEffect, useMemo, useState } from "react";

type ContractType = "Web design" | "App development" | "UI/UX design" | "Branding" | "SaaS build" | "Maintenance" | "Consulting" | "Retainer";

type FormState = {
  freelancerName: string;
  clientName: string;
  projectTitle: string;
  scopeOfWork: string;
  exclusions: string;
  deliverables: string;
  timeline: string;
  milestones: string;
  paymentTerms: string;
  depositAmount: string;
  latePaymentTerms: string;
  revisionLimits: string;
  changeRequestTerms: string;
  ipOwnershipTerms: string;
  sourceFilesOwnership: string;
  clientResponsibilities: string;
  cancellationTerms: string;
  confidentialityTerms: string;
  supportTerms: string;
  governingLaw: string;
};

type StepId = "type" | "parties" | "scope" | "payment" | "timeline" | "ownership" | "revisions" | "cancellation" | "support";

type Step = {
  id: StepId;
  short: string;
  label: string;
  title: string;
  description: string;
  requiredFields: Array<keyof FormState>;
};

type Insight = {
  id: string;
  step: StepId;
  field?: keyof FormState;
  label: string;
  detail: string;
  recommendation: string;
  severity: "critical" | "watch";
};

const storageKey = "scopeguard-workspace-v3";

const contractTypes: Array<{ name: ContractType; summary: string }> = [
  { name: "Web design", summary: "Marketing sites, redesigns, landing pages" },
  { name: "App development", summary: "MVPs, mobile apps, product builds" },
  { name: "UI/UX design", summary: "Research, flows, prototypes, interface design" },
  { name: "Branding", summary: "Identity systems, launch kits, guidelines" },
  { name: "SaaS build", summary: "Subscription products and internal platforms" },
  { name: "Maintenance", summary: "Updates, fixes, monitoring, support" },
  { name: "Consulting", summary: "Strategy, audits, workshops, advisory" },
  { name: "Retainer", summary: "Ongoing monthly delivery and support" },
];

const steps: Step[] = [
  {
    id: "type",
    short: "Type",
    label: "Contract Type",
    title: "Classify the engagement",
    description: "Pick the closest freelance tech contract type. This keeps the draft language focused.",
    requiredFields: [],
  },
  {
    id: "parties",
    short: "Parties",
    label: "Parties",
    title: "Identify the parties",
    description: "Set the people, companies, and project name used throughout the agreement.",
    requiredFields: ["freelancerName", "clientName", "projectTitle"],
  },
  {
    id: "scope",
    short: "Scope",
    label: "Scope",
    title: "Define the work",
    description: "Describe what is included, what is delivered, and what is intentionally excluded.",
    requiredFields: ["scopeOfWork", "deliverables"],
  },
  {
    id: "payment",
    short: "Payment",
    label: "Payment",
    title: "Protect payment terms",
    description: "Clarify fee structure, deposit, invoice timing, and late payment language.",
    requiredFields: ["paymentTerms", "depositAmount"],
  },
  {
    id: "timeline",
    short: "Timeline",
    label: "Timeline",
    title: "Set delivery rhythm",
    description: "Define milestones, expected timing, approvals, and client feedback responsibilities.",
    requiredFields: ["timeline", "milestones", "clientResponsibilities"],
  },
  {
    id: "ownership",
    short: "Ownership",
    label: "Ownership",
    title: "Clarify IP and source files",
    description: "Say what transfers, when it transfers, and what remains reusable by the freelancer.",
    requiredFields: ["ipOwnershipTerms", "sourceFilesOwnership"],
  },
  {
    id: "revisions",
    short: "Revisions",
    label: "Revisions",
    title: "Bound revisions and changes",
    description: "Set revision limits and the process for additional requests.",
    requiredFields: ["revisionLimits"],
  },
  {
    id: "cancellation",
    short: "Cancel",
    label: "Cancellation",
    title: "Make termination clear",
    description: "Define notice, payment for completed work, expenses, and offboarding.",
    requiredFields: ["cancellationTerms"],
  },
  {
    id: "support",
    short: "Support",
    label: "Support",
    title: "Set post-launch boundaries",
    description: "Explain included support, exclusions, confidentiality, and governing law placeholder.",
    requiredFields: ["supportTerms"],
  },
];

const emptyForm: FormState = {
  freelancerName: "",
  clientName: "",
  projectTitle: "Untitled freelance agreement",
  scopeOfWork: "",
  exclusions: "",
  deliverables: "",
  timeline: "",
  milestones: "",
  paymentTerms: "",
  depositAmount: "",
  latePaymentTerms: "",
  revisionLimits: "",
  changeRequestTerms: "",
  ipOwnershipTerms: "",
  sourceFilesOwnership: "",
  clientResponsibilities: "",
  cancellationTerms: "",
  confidentialityTerms: "",
  supportTerms: "",
  governingLaw: "[Governing law / jurisdiction placeholder]",
};

const smartDefaults: FormState = {
  freelancerName: "",
  clientName: "",
  projectTitle: "Untitled freelance agreement",
  scopeOfWork: "Freelancer will provide the services described in the approved project brief. Work not listed in this agreement is outside the current scope unless approved in writing.",
  exclusions: "Unless added by written change request, the scope excludes new features, copywriting, third-party subscription fees, platform policy changes, and work outside the approved deliverables.",
  deliverables: "Final approved deliverables, relevant working files, handoff documentation, and one recorded walkthrough.",
  timeline: "The project timeline begins after deposit receipt and after Client provides required access, assets, content, and approvals.",
  milestones: "Discovery and requirements, draft direction, production work, review and revisions, final handoff.",
  paymentTerms: "Invoices are due within 10 days of issue. Freelancer may pause work if invoices are overdue or required approvals are delayed.",
  depositAmount: "40% due before kickoff",
  latePaymentTerms: "Late payments may accrue 1.5% per month where permitted by law.",
  revisionLimits: "Two revision rounds are included. Requests beyond included rounds are treated as change requests.",
  changeRequestTerms: "Change requests must be approved in writing and may require additional fees and timeline adjustments.",
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
  exclusions: "The project excludes net-new product strategy, paid acquisition setup, third-party subscription costs, and post-launch feature requests unless approved as change requests.",
  deliverables: "UX flows, high-fidelity UI designs, production Next.js implementation, CMS-backed checklist content, QA notes, deployment handoff, and one recorded walkthrough.",
  timeline: "Eight weeks from kickoff, beginning after deposit receipt and access to required brand/product materials.",
  milestones: "Week 1 discovery and requirements. Week 2 UX flows. Weeks 3-4 visual design. Weeks 5-7 development. Week 8 QA, revisions, and handoff.",
  paymentTerms: "Total fee of $18,000. 40% deposit due before scheduling kickoff, 30% after design approval, and 30% before production handoff. Invoices are due within 10 days.",
  depositAmount: "40% of project fee due before kickoff",
  latePaymentTerms: "Late payments accrue 1.5% per month where permitted by law.",
  revisionLimits: "Two revision rounds are included for design and one QA correction pass is included before handoff.",
  changeRequestTerms: "Additional requests, new features, or changes to approved work require written approval and may affect fee and timeline.",
  ipOwnershipTerms: "Client receives ownership of final approved work after full payment. Freelancer retains ownership of pre-existing tools, templates, know-how, and reusable methods.",
  sourceFilesOwnership: "Source code and final design files transfer to Client after full payment. Third-party libraries remain governed by their own licenses.",
  clientResponsibilities: "Client will provide timely feedback within three business days, access to systems, brand assets, product copy, and a single decision maker for approvals.",
  cancellationTerms: "Either party may terminate with seven days written notice. Client pays for completed work, approved expenses, and any non-cancellable commitments through the termination date.",
  confidentialityTerms: "Each party will protect non-public business, product, technical, and customer information shared for the project and use it only for project purposes.",
  supportTerms: "Thirty days of bug-fix support is included after launch for issues caused by the delivered work. New features, content changes, platform updates, and third-party service issues are billed separately.",
  governingLaw: "[Governing law / jurisdiction placeholder]",
};

function generateContract(type: ContractType, form: FormState) {
  const value = (text: string, fallback: string) => text.trim() || `[${fallback}]`;

  return `SCOPEGUARD CONTRACT DRAFT

Draft only. Not legal advice. Review with a qualified legal professional when needed.

1. Parties
This ${type.toLowerCase()} agreement is between ${value(form.freelancerName, "Freelancer name")} ("Freelancer") and ${value(form.clientName, "Client name")} ("Client").

2. Project Overview
The project is titled "${value(form.projectTitle, "Project title")}". This agreement defines the work, deliverables, timeline, payment terms, ownership terms, responsibilities, and cancellation rules for the project.

3. Scope of Work
${value(form.scopeOfWork, "Scope of work")}

Out of scope:
${value(form.exclusions, "Out-of-scope items")}

4. Deliverables
${value(form.deliverables, "Deliverables")}

5. Timeline and Milestones
Timeline:
${value(form.timeline, "Timeline")}

Milestones:
${value(form.milestones, "Milestones")}

Client responsibilities:
${value(form.clientResponsibilities, "Client responsibilities")}

6. Fees and Payment Terms
${value(form.paymentTerms, "Payment terms")}

Deposit:
${value(form.depositAmount, "Deposit amount")}

Late payment:
${value(form.latePaymentTerms, "Late payment terms")}

7. Revisions and Change Requests
${value(form.revisionLimits, "Revision limits")}

Change requests:
${value(form.changeRequestTerms, "Change request terms")}

8. Intellectual Property and Ownership
${value(form.ipOwnershipTerms, "IP ownership terms")}

Source files and code:
${value(form.sourceFilesOwnership, "Source files/code ownership")}

Unless stated otherwise, ownership transfers only after Freelancer receives full payment.

9. Confidentiality
${value(form.confidentialityTerms, "Confidentiality terms")}

10. Support and Maintenance
${value(form.supportTerms, "Support/maintenance terms")}

11. Cancellation and Termination
${value(form.cancellationTerms, "Cancellation/termination terms")}

12. Limitation of Liability
To the maximum extent allowed by applicable law, each party's liability should be limited to reasonable, direct damages. Neither party should be responsible for indirect, incidental, special, consequential, or punitive damages, including lost profits. Review this section with a qualified legal professional for the relevant jurisdiction.

13. Governing Law
This agreement is governed by the laws of ${value(form.governingLaw, "Governing law / jurisdiction placeholder")}.

14. Signatures
Freelancer: ${value(form.freelancerName, "Freelancer name")}
Signature: ______________________________
Date: __________________

Client: ${value(form.clientName, "Client name")}
Signature: ______________________________
Date: __________________
`;
}

function getInsights(form: FormState): Insight[] {
  const insights: Insight[] = [];
  const payment = `${form.paymentTerms} ${form.latePaymentTerms}`.toLowerCase();
  const revisions = `${form.revisionLimits} ${form.changeRequestTerms}`.toLowerCase();
  const support = form.supportTerms.toLowerCase();
  const scope = `${form.scopeOfWork} ${form.exclusions}`.toLowerCase();
  const responsibilities = form.clientResponsibilities.toLowerCase();

  if (!form.depositAmount.trim() && !payment.includes("deposit")) {
    insights.push({ id: "deposit", step: "payment", field: "depositAmount", label: "Weak payment structure", detail: "No deposit is defined.", recommendation: "Add an upfront payment before kickoff.", severity: "critical" });
  }
  if (!payment.includes("late") && !payment.includes("overdue")) {
    insights.push({ id: "late", step: "payment", field: "latePaymentTerms", label: "Late payment recommendation", detail: "The draft does not say what happens when invoices are overdue.", recommendation: "Add a late payment term where permitted by law.", severity: "watch" });
  }
  if (!form.revisionLimits.trim() || revisions.includes("unlimited")) {
    insights.push({ id: "revisions", step: "revisions", field: "revisionLimits", label: "Undefined revision limits", detail: revisions.includes("unlimited") ? "Unlimited revisions can turn a fixed-fee project open-ended." : "Revision rounds are not bounded.", recommendation: "Define included rounds and route extras through change requests.", severity: "critical" });
  }
  if (!form.ipOwnershipTerms.trim()) {
    insights.push({ id: "ownership", step: "ownership", field: "ipOwnershipTerms", label: "Missing ownership transfer", detail: "The draft does not say who owns the final work or when ownership transfers.", recommendation: "Transfer final work after full payment and reserve pre-existing tools.", severity: "critical" });
  }
  if (!scope.includes("outside") && !form.exclusions.trim()) {
    insights.push({ id: "scope-creep", step: "scope", field: "exclusions", label: "Scope creep warning", detail: "No explicit exclusions are listed.", recommendation: "Add what is out of scope so the client understands boundaries.", severity: "watch" });
  }
  if (!responsibilities.includes("feedback") && !responsibilities.includes("approval")) {
    insights.push({ id: "feedback", step: "timeline", field: "clientResponsibilities", label: "Missing feedback deadline", detail: "The timeline depends on client response, but no feedback window is defined.", recommendation: "Add a client feedback window and decision-maker requirement.", severity: "watch" });
  }
  if (!form.cancellationTerms.trim()) {
    insights.push({ id: "cancel", step: "cancellation", field: "cancellationTerms", label: "Missing cancellation clause", detail: "The draft does not explain how either side exits the project.", recommendation: "Add notice, completed-work payment, and expense handling.", severity: "critical" });
  }
  if (!support.includes("not include") && !support.includes("billed separately")) {
    insights.push({ id: "support", step: "support", field: "supportTerms", label: "Support boundary unclear", detail: "Post-launch support may be interpreted too broadly.", recommendation: "Separate included support from new features, content changes, and third-party issues.", severity: "watch" });
  }

  return insights;
}

function fieldInsight(insights: Insight[], field: keyof FormState) {
  return insights.find((insight) => insight.field === field);
}

function classNames(...values: Array<string | false | undefined>) {
  return values.filter(Boolean).join(" ");
}

function Icon({ name }: { name: "plus" | "file" | "template" | "help" | "settings" | "export" | "preview" | "save" }) {
  const common = "h-4 w-4";
  if (name === "plus") return <span className={common}>+</span>;
  if (name === "file") return <span className={common}>□</span>;
  if (name === "template") return <span className={common}>▣</span>;
  if (name === "help") return <span className={common}>?</span>;
  if (name === "settings") return <span className={common}>⌘</span>;
  if (name === "export") return <span className={common}>↗</span>;
  if (name === "preview") return <span className={common}>◐</span>;
  return <span className={common}>✓</span>;
}

function Sidebar({ onNew, onSample }: { onNew: () => void; onSample: () => void }) {
  return (
    <aside className="flex h-full w-full flex-col border-r border-[#ded8cc] bg-[#f5f2eb] px-3 py-3">
      <div className="flex items-center gap-2 px-2 py-2">
        <div className="grid size-8 place-items-center rounded-lg bg-[#123c35] text-xs font-black text-white">SG</div>
        <div>
          <p className="text-sm font-black text-[#17231f]">ScopeGuard</p>
          <p className="text-[11px] font-semibold text-[#7a756d]">Contract workspace</p>
        </div>
      </div>

      <div className="mt-4 space-y-1">
        <SidebarButton icon="plus" label="New Contract" active onClick={onNew} />
        <SidebarButton icon="file" label="Drafts" />
        <SidebarButton icon="template" label="Templates" onClick={onSample} />
      </div>

      <div className="mt-6">
        <p className="px-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#928c82]">Recently opened</p>
        <div className="mt-2 space-y-1">
          <RecentItem title="Customer Onboarding Portal" meta="SaaS build" />
          <RecentItem title="Website Redesign" meta="Web design" muted />
          <RecentItem title="Monthly Support Retainer" meta="Retainer" muted />
        </div>
      </div>

      <div className="mt-auto space-y-1 border-t border-[#ded8cc] pt-3">
        <SidebarButton icon="help" label="Help" />
        <SidebarButton icon="settings" label="Settings" />
        <div className="mt-3 flex items-center gap-2 rounded-xl px-2 py-2">
          <div className="grid size-8 place-items-center rounded-full bg-[#e7dfd1] text-xs font-black text-[#123c35]">JL</div>
          <div className="min-w-0">
            <p className="truncate text-xs font-black text-[#17231f]">Jordan</p>
            <p className="truncate text-[11px] text-[#7a756d]">Freelancer</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function SidebarButton({ icon, label, active, onClick }: { icon: "plus" | "file" | "template" | "help" | "settings"; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames(
        "flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left text-sm font-semibold transition",
        active ? "bg-white text-[#123c35] shadow-[0_1px_0_rgba(25,36,31,0.05)]" : "text-[#5f625c] hover:bg-[#ede8de] hover:text-[#17231f]",
      )}
    >
      <Icon name={icon} />
      {label}
    </button>
  );
}

function RecentItem({ title, meta, muted }: { title: string; meta: string; muted?: boolean }) {
  return (
    <button type="button" className={classNames("w-full rounded-xl px-2 py-2 text-left transition hover:bg-[#ede8de]", muted && "opacity-60")}>
      <p className="truncate text-xs font-bold text-[#2a3530]">{title}</p>
      <p className="mt-0.5 truncate text-[11px] text-[#817a70]">{meta}</p>
    </button>
  );
}

function WorkspaceBar({
  title,
  savedState,
  panelMode,
  onTitleChange,
  onSave,
  onExport,
  onPreview,
}: {
  title: string;
  savedState: string;
  panelMode: "intel" | "preview";
  onTitleChange: (value: string) => void;
  onSave: () => void;
  onExport: () => void;
  onPreview: () => void;
}) {
  return (
    <header className="flex min-h-14 items-center justify-between gap-3 border-b border-[#ded8cc] bg-[#fbfaf6] px-4">
      <div className="flex min-w-0 items-center gap-2">
        <div className="rounded-lg border border-[#ded8cc] bg-white px-2 py-1 text-[11px] font-bold text-[#716c64]">Draft</div>
        <input
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          className="min-w-0 max-w-[420px] bg-transparent text-sm font-black text-[#17231f] outline-none"
          aria-label="Contract title"
        />
        <span className="hidden rounded-full bg-[#f0ece3] px-2 py-1 text-[11px] font-bold text-[#767168] md:inline">{savedState}</span>
      </div>

      <div className="flex items-center gap-1.5">
        <UtilityButton label="Save draft" icon="save" onClick={onSave} shortcut="⌘S" />
        <UtilityButton label="Export" icon="export" onClick={onExport} />
        <UtilityButton label={panelMode === "preview" ? "Intelligence" : "Preview"} icon="preview" onClick={onPreview} />
        <button type="button" className="grid size-8 place-items-center rounded-lg text-[#68635b] transition hover:bg-[#f0ece3]" aria-label="Theme and settings">
          <Icon name="settings" />
        </button>
      </div>
    </header>
  );
}

function UtilityButton({ label, icon, onClick, shortcut }: { label: string; icon: "save" | "export" | "preview"; onClick: () => void; shortcut?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={shortcut ? `${label} (${shortcut})` : label}
      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#ded8cc] bg-white px-2.5 text-xs font-bold text-[#2b3631] transition hover:border-[#c4bba9] hover:bg-[#f7f4ee]"
    >
      <Icon name={icon} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function WorkflowTabs({
  activeStep,
  maxStep,
  onChange,
}: {
  activeStep: number;
  maxStep: number;
  onChange: (step: number) => void;
}) {
  return (
    <nav className="border-b border-[#ded8cc] bg-[#fbfaf6] px-4 py-2">
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-[#ded8cc] bg-[#f2eee6] p-1">
        {steps.map((step, index) => {
          const locked = index > maxStep;
          return (
            <button
              key={step.id}
              type="button"
              disabled={locked}
              onClick={() => onChange(index)}
              className={classNames(
                "min-w-fit rounded-lg px-3 py-1.5 text-xs font-black transition",
                activeStep === index && "bg-white text-[#123c35] shadow-[0_1px_0_rgba(25,36,31,0.05)]",
                activeStep !== index && !locked && "text-[#625e57] hover:bg-[#e9e3d8]",
                locked && "text-[#b1aa9f]",
              )}
            >
              {String(index + 1).padStart(2, "0")} {step.short}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function SectionFrame({
  step,
  children,
  onDefault,
}: {
  step: Step;
  children: React.ReactNode;
  onDefault?: () => void;
}) {
  return (
    <section className="mx-auto w-full max-w-4xl">
      <div className="mb-4 flex items-start justify-between gap-4 border-b border-[#e5ded1] pb-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#8a8378]">{step.label}</p>
          <h1 className="mt-1 text-2xl font-black tracking-[-0.015em] text-[#17231f]">{step.title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#696f68]">{step.description}</p>
        </div>
        {onDefault ? (
          <button type="button" onClick={onDefault} className="rounded-lg border border-[#d8d0c2] bg-white px-3 py-2 text-xs font-bold text-[#2b3631] transition hover:border-[#beb4a3]">
            Insert defaults
          </button>
        ) : null}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  placeholder,
  onChange,
  insight,
  helper,
  rows = 4,
  compact,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  insight?: Insight;
  helper?: string;
  rows?: number;
  compact?: boolean;
}) {
  return (
    <label className="block rounded-xl border border-[#e1dace] bg-[#fffdfa] p-3 transition-within focus-within:border-[#123c35] focus-within:ring-2 focus-within:ring-[#dce7df]">
      <span className="flex items-center justify-between gap-3">
        <span className="text-xs font-black uppercase tracking-[0.08em] text-[#4f5b54]">{label}</span>
        <span className="group relative grid size-5 place-items-center rounded-full border border-[#d9d1c3] text-[11px] font-black text-[#81796f]">
          ?
          <span className="pointer-events-none absolute right-0 top-6 z-20 hidden w-56 rounded-lg border border-[#ded8cc] bg-white p-2 text-left text-xs font-medium leading-5 text-[#5f625c] shadow-lg group-hover:block">
            {helper || "Use plain English. Specific terms are easier to review and enforce."}
          </span>
        </span>
      </span>
      {compact ? (
        <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-2 w-full bg-transparent text-sm font-medium text-[#17231f] outline-none placeholder:text-[#aaa398]" />
      ) : (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={rows} className="mt-2 w-full resize-y bg-transparent text-sm leading-6 text-[#17231f] outline-none placeholder:text-[#aaa398]" />
      )}
      {insight ? <p className="mt-2 border-t border-[#f0dfd6] pt-2 text-xs font-semibold leading-5 text-[#9b3f24]">{insight.recommendation}</p> : null}
    </label>
  );
}

function CollapsibleSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <details className="group rounded-xl border border-[#ded8cc] bg-[#f8f5ef] p-3">
      <summary className="cursor-pointer list-none">
        <span className="flex items-center justify-between gap-4">
          <span>
            <span className="block text-sm font-black text-[#24342f]">{title}</span>
            <span className="mt-0.5 block text-xs leading-5 text-[#747168]">{description}</span>
          </span>
          <span className="rounded-lg border border-[#ded8cc] bg-white px-2 py-1 text-[11px] font-bold text-[#625e57] group-open:hidden">Show</span>
          <span className="hidden rounded-lg border border-[#ded8cc] bg-white px-2 py-1 text-[11px] font-bold text-[#625e57] group-open:inline">Hide</span>
        </span>
      </summary>
      <div className="mt-3">{children}</div>
    </details>
  );
}

function SegmentedControl({
  value,
  options,
  onChange,
}: {
  value: string;
  options: Array<{ label: string; value: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <div className="inline-flex rounded-xl border border-[#ded8cc] bg-[#f2eee6] p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={classNames("rounded-lg px-3 py-1.5 text-xs font-black transition", value === option.value ? "bg-white text-[#123c35]" : "text-[#625e57] hover:bg-[#e9e3d8]")}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function ContractTypeSelector({ value, onChange }: { value: ContractType; onChange: (value: ContractType) => void }) {
  return (
    <div className="grid gap-2 md:grid-cols-2">
      {contractTypes.map((type) => (
        <button
          type="button"
          key={type.name}
          onClick={() => onChange(type.name)}
          className={classNames(
            "rounded-xl border p-3 text-left transition",
            value === type.name ? "border-[#123c35] bg-[#edf5ee]" : "border-[#ded8cc] bg-[#fffdfa] hover:border-[#c2b8a7]",
          )}
        >
          <span className="block text-sm font-black text-[#17231f]">{type.name}</span>
          <span className="mt-1 block text-xs leading-5 text-[#747168]">{type.summary}</span>
        </button>
      ))}
    </div>
  );
}

function IntelligencePanel({
  mode,
  step,
  insights,
  draft,
  onRegenerate,
}: {
  mode: "intel" | "preview";
  step: Step;
  insights: Insight[];
  draft: string;
  onRegenerate: () => void;
}) {
  const contextual = insights.filter((insight) => insight.step === step.id);
  const visibleInsights = step.id === "support" ? insights : contextual;

  if (mode === "preview") {
    return (
      <aside className="h-full border-l border-[#ded8cc] bg-[#fbfaf6]">
        <PanelHeader title="Preview" eyebrow="Generated draft" action="Refresh" onAction={onRegenerate} />
        <div className="h-[calc(100dvh-106px)] overflow-auto p-4">
          <pre className="whitespace-pre-wrap rounded-xl border border-[#ded8cc] bg-white p-4 text-xs leading-5 text-[#263530]">{draft}</pre>
        </div>
      </aside>
    );
  }

  return (
    <aside className="h-full border-l border-[#ded8cc] bg-[#fbfaf6]">
      <PanelHeader title="Intelligence" eyebrow={step.label} />
      <div className="h-[calc(100dvh-106px)] overflow-auto p-4">
        <div className="space-y-3">
          {visibleInsights.length ? (
            visibleInsights.map((insight) => (
              <div key={insight.id} className="rounded-xl border border-[#ead1c5] bg-[#fff8f4] p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-black text-[#71321f]">{insight.label}</p>
                  <span className="rounded-md bg-white px-2 py-1 text-[11px] font-black text-[#9d3e22]">{insight.severity === "critical" ? "Fix" : "Watch"}</span>
                </div>
                <p className="mt-2 text-xs leading-5 text-[#73584d]">{insight.detail}</p>
                <p className="mt-2 text-xs font-bold leading-5 text-[#9d3e22]">{insight.recommendation}</p>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-[#d8e5d9] bg-[#f2faf4] p-3">
              <p className="text-sm font-black text-[#123c35]">No issues in this section</p>
              <p className="mt-2 text-xs leading-5 text-[#5f6b64]">The active section has the core drafting details ScopeGuard expects.</p>
            </div>
          )}

          <CollapsibleSection title="Suggested legal wording" description="Draft phrasing you can adapt, not legal advice.">
            <p className="text-xs leading-5 text-[#5f625c]">
              Work outside the approved scope requires written approval and may affect fees, milestones, and delivery dates.
            </p>
          </CollapsibleSection>
        </div>
      </div>
    </aside>
  );
}

function PanelHeader({ eyebrow, title, action, onAction }: { eyebrow: string; title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="flex h-[50px] items-center justify-between border-b border-[#ded8cc] px-4">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#8c857b]">{eyebrow}</p>
        <h2 className="text-sm font-black text-[#17231f]">{title}</h2>
      </div>
      {action && onAction ? (
        <button type="button" onClick={onAction} className="rounded-lg border border-[#ded8cc] bg-white px-2 py-1 text-[11px] font-bold text-[#2b3631]">
          {action}
        </button>
      ) : null}
    </div>
  );
}

function BottomActionBar({
  savedState,
  activeStep,
  maxStep,
  onBack,
  onNext,
  onSave,
}: {
  savedState: string;
  activeStep: number;
  maxStep: number;
  onBack: () => void;
  onNext: () => void;
  onSave: () => void;
}) {
  return (
    <div className="sticky bottom-0 z-20 border-t border-[#ded8cc] bg-[#fbfaf6]/95 px-4 py-2 backdrop-blur">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <p className="text-xs text-[#68635b]">
          <span className="font-bold">{savedState}</span> · Draft only. Not legal advice. Review with a qualified legal professional when needed.
        </p>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onBack} disabled={activeStep === 0} className="rounded-lg px-3 py-2 text-xs font-bold text-[#5f625c] transition hover:bg-[#f0ece3] disabled:opacity-40">
            Back
          </button>
          <button type="button" onClick={onSave} className="rounded-lg border border-[#d6d0c4] bg-white px-3 py-2 text-xs font-bold text-[#2b3631] transition hover:border-[#beb4a3]">
            Save
          </button>
          <button type="button" onClick={onNext} disabled={activeStep >= maxStep} className="rounded-lg bg-[#123c35] px-4 py-2 text-xs font-black text-white transition hover:bg-[#0d312b] disabled:bg-[#aab4ae]">
            Next section
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ScopeGuard() {
  const [contractType, setContractType] = useState<ContractType>("Web design");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [activeStep, setActiveStep] = useState(0);
  const [panelMode, setPanelMode] = useState<"intel" | "preview">("intel");
  const [paymentMode, setPaymentMode] = useState("fixed");
  const [savedState, setSavedState] = useState("Saved");
  const [draft, setDraft] = useState(() => generateContract("Web design", emptyForm));

  const currentStep = steps[activeStep];
  const insights = useMemo(() => getInsights(form), [form]);
  const generatedDraft = useMemo(() => generateContract(contractType, form), [contractType, form]);
  const basicsComplete = Boolean(form.freelancerName.trim() && form.clientName.trim() && form.projectTitle.trim());
  const maxStep = basicsComplete ? steps.length - 1 : Math.min(1, activeStep + 1);

  useEffect(() => {
    window.setTimeout(() => {
      const saved = window.localStorage.getItem(storageKey);
      if (!saved) return;
      try {
        const parsed = JSON.parse(saved) as Partial<{
          contractType: ContractType;
          form: Partial<FormState>;
          activeStep: number;
          paymentMode: string;
        }>;
        if (parsed.contractType) setContractType(parsed.contractType);
        if (parsed.form) setForm({ ...emptyForm, ...parsed.form });
        if (typeof parsed.activeStep === "number") setActiveStep(Math.min(Math.max(parsed.activeStep, 0), steps.length - 1));
        if (parsed.paymentMode) setPaymentMode(parsed.paymentMode);
      } catch {
        window.localStorage.removeItem(storageKey);
      }
    }, 0);
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      window.localStorage.setItem(storageKey, JSON.stringify({ contractType, form, activeStep, paymentMode }));
      setSavedState("Autosaved");
    }, 700);
    return () => window.clearTimeout(timeout);
  }, [contractType, form, activeStep, paymentMode]);

  const updateField = (field: keyof FormState, value: string) => {
    setSavedState("Unsaved changes");
    setForm((current) => ({ ...current, [field]: value }));
  };

  const applyDefaults = (fields: Array<keyof FormState>) => {
    setSavedState("Unsaved changes");
    setForm((current) => {
      const next = { ...current };
      fields.forEach((field) => {
        if (!next[field].trim()) next[field] = smartDefaults[field];
      });
      return next;
    });
  };

  const saveDraft = () => {
    window.localStorage.setItem(storageKey, JSON.stringify({ contractType, form, activeStep, paymentMode }));
    setSavedState("Saved");
  };

  const resetContract = () => {
    setSavedState("Unsaved changes");
    setContractType("Web design");
    setForm(emptyForm);
    setActiveStep(0);
    setPanelMode("intel");
  };

  const loadSample = () => {
    setSavedState("Unsaved changes");
    setContractType("SaaS build");
    setForm(sampleForm);
    setActiveStep(2);
  };

  const changeStep = (step: number) => {
    const next = Math.min(Math.max(step, 0), maxStep);
    setSavedState("Unsaved changes");
    setActiveStep(next);
    setPanelMode("intel");
  };

  const updateContractType = (value: ContractType) => {
    setSavedState("Unsaved changes");
    setContractType(value);
  };

  const updatePaymentMode = (value: string) => {
    setSavedState("Unsaved changes");
    setPaymentMode(value);
  };

  const showPreview = () => {
    setDraft(generatedDraft);
    setPanelMode((mode) => (mode === "preview" ? "intel" : "preview"));
  };

  const exportDraft = () => {
    setDraft(generatedDraft);
    window.setTimeout(() => window.print(), 0);
  };

  return (
    <main className="h-dvh overflow-hidden bg-[#f4f0e8] text-[#17231f]">
      <div className="grid h-full grid-cols-1 md:grid-cols-[236px_minmax(0,1fr)]">
        <Sidebar onNew={resetContract} onSample={loadSample} />
        <div className="grid min-h-0 grid-rows-[auto_auto_minmax(0,1fr)]">
          <WorkspaceBar
            title={form.projectTitle}
            savedState={savedState}
            panelMode={panelMode}
            onTitleChange={(value) => updateField("projectTitle", value)}
            onSave={saveDraft}
            onExport={exportDraft}
            onPreview={showPreview}
          />
          <WorkflowTabs activeStep={activeStep} maxStep={maxStep} onChange={changeStep} />

          <div className="grid min-h-0 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="min-h-0 overflow-auto bg-[#fbfaf6]">
              <div className="px-4 py-5 md:px-8 md:py-7">
                {currentStep.id === "type" ? (
                  <SectionFrame step={currentStep}>
                    <ContractTypeSelector value={contractType} onChange={updateContractType} />
                  </SectionFrame>
                ) : null}

                {currentStep.id === "parties" ? (
                  <SectionFrame step={currentStep}>
                    <div className="grid gap-3 md:grid-cols-2">
                      <Field compact label="Freelancer name" value={form.freelancerName} placeholder="Your legal or studio name" onChange={(value) => updateField("freelancerName", value)} />
                      <Field compact label="Client name" value={form.clientName} placeholder="Client company or individual" onChange={(value) => updateField("clientName", value)} />
                    </div>
                    <Field compact label="Contract title" value={form.projectTitle} placeholder="Customer onboarding portal" onChange={(value) => updateField("projectTitle", value)} />
                  </SectionFrame>
                ) : null}

                {currentStep.id === "scope" ? (
                  <SectionFrame step={currentStep} onDefault={() => applyDefaults(["scopeOfWork", "deliverables", "exclusions"])}>
                    <Field label="Scope of work" value={form.scopeOfWork} placeholder="Describe the work included in the engagement..." helper="Be concrete about features, screens, systems, and responsibilities." onChange={(value) => updateField("scopeOfWork", value)} />
                    <Field label="Deliverables" value={form.deliverables} placeholder="What should the client receive?" onChange={(value) => updateField("deliverables", value)} />
                    <CollapsibleSection title="Out-of-scope boundaries" description="Use this to reduce scope creep before it starts.">
                      <Field label="Exclusions" value={form.exclusions} placeholder="List work that is not included unless approved later..." insight={fieldInsight(insights, "exclusions")} rows={3} onChange={(value) => updateField("exclusions", value)} />
                    </CollapsibleSection>
                  </SectionFrame>
                ) : null}

                {currentStep.id === "payment" ? (
                  <SectionFrame step={currentStep} onDefault={() => applyDefaults(["paymentTerms", "depositAmount", "latePaymentTerms"])}>
                    <SegmentedControl
                      value={paymentMode}
                      onChange={updatePaymentMode}
                      options={[
                        { label: "Fixed fee", value: "fixed" },
                        { label: "Milestone", value: "milestone" },
                        { label: "Retainer", value: "retainer" },
                      ]}
                    />
                    <Field label="Payment terms" value={form.paymentTerms} placeholder="Total fee, invoice schedule, due dates..." onChange={(value) => updateField("paymentTerms", value)} />
                    <div className="grid gap-3 md:grid-cols-2">
                      <Field compact label="Deposit" value={form.depositAmount} placeholder="40% due before kickoff" insight={fieldInsight(insights, "depositAmount")} onChange={(value) => updateField("depositAmount", value)} />
                      <Field compact label="Late payment" value={form.latePaymentTerms} placeholder="Overdue invoices may accrue..." insight={fieldInsight(insights, "latePaymentTerms")} onChange={(value) => updateField("latePaymentTerms", value)} />
                    </div>
                  </SectionFrame>
                ) : null}

                {currentStep.id === "timeline" ? (
                  <SectionFrame step={currentStep} onDefault={() => applyDefaults(["timeline", "milestones", "clientResponsibilities"])}>
                    <Field label="Timeline" value={form.timeline} placeholder="How long will the work take, and what starts the clock?" onChange={(value) => updateField("timeline", value)} />
                    <Field label="Milestones" value={form.milestones} placeholder="Discovery, design, build, QA, handoff..." onChange={(value) => updateField("milestones", value)} />
                    <Field label="Client responsibilities" value={form.clientResponsibilities} placeholder="Feedback deadline, access, approvals, decision maker..." insight={fieldInsight(insights, "clientResponsibilities")} onChange={(value) => updateField("clientResponsibilities", value)} />
                  </SectionFrame>
                ) : null}

                {currentStep.id === "ownership" ? (
                  <SectionFrame step={currentStep} onDefault={() => applyDefaults(["ipOwnershipTerms", "sourceFilesOwnership"])}>
                    <Field label="IP ownership" value={form.ipOwnershipTerms} placeholder="Who owns final work and when does ownership transfer?" insight={fieldInsight(insights, "ipOwnershipTerms")} onChange={(value) => updateField("ipOwnershipTerms", value)} />
                    <Field label="Source files and code" value={form.sourceFilesOwnership} placeholder="Repos, design files, third-party libraries, build files..." onChange={(value) => updateField("sourceFilesOwnership", value)} />
                  </SectionFrame>
                ) : null}

                {currentStep.id === "revisions" ? (
                  <SectionFrame step={currentStep} onDefault={() => applyDefaults(["revisionLimits", "changeRequestTerms"])}>
                    <Field label="Revision limits" value={form.revisionLimits} placeholder="Two revision rounds are included..." insight={fieldInsight(insights, "revisionLimits")} onChange={(value) => updateField("revisionLimits", value)} />
                    <CollapsibleSection title="Change request process" description="Define how extra work gets approved.">
                      <Field label="Change request terms" value={form.changeRequestTerms} placeholder="Additional requests require written approval..." rows={3} onChange={(value) => updateField("changeRequestTerms", value)} />
                    </CollapsibleSection>
                  </SectionFrame>
                ) : null}

                {currentStep.id === "cancellation" ? (
                  <SectionFrame step={currentStep} onDefault={() => applyDefaults(["cancellationTerms"])}>
                    <Field label="Cancellation and termination" value={form.cancellationTerms} placeholder="Notice period, completed work payment, non-cancellable expenses..." insight={fieldInsight(insights, "cancellationTerms")} onChange={(value) => updateField("cancellationTerms", value)} />
                  </SectionFrame>
                ) : null}

                {currentStep.id === "support" ? (
                  <SectionFrame step={currentStep} onDefault={() => applyDefaults(["supportTerms", "confidentialityTerms", "governingLaw"])}>
                    <Field label="Support and maintenance" value={form.supportTerms} placeholder="What support is included, for how long, and what is extra?" insight={fieldInsight(insights, "supportTerms")} onChange={(value) => updateField("supportTerms", value)} />
                    <CollapsibleSection title="Legal placeholders" description="Keep these visible but out of the main drafting path.">
                      <div className="space-y-3">
                        <Field label="Confidentiality" value={form.confidentialityTerms} placeholder="How both sides handle private information..." rows={3} onChange={(value) => updateField("confidentialityTerms", value)} />
                        <Field compact label="Governing law" value={form.governingLaw} placeholder="[Governing law / jurisdiction placeholder]" onChange={(value) => updateField("governingLaw", value)} />
                      </div>
                    </CollapsibleSection>
                  </SectionFrame>
                ) : null}
              </div>

              <BottomActionBar
                savedState={savedState}
                activeStep={activeStep}
                maxStep={maxStep}
                onBack={() => changeStep(activeStep - 1)}
                onNext={() => changeStep(activeStep + 1)}
                onSave={saveDraft}
              />
            </div>

            <IntelligencePanel mode={panelMode} step={currentStep} insights={insights} draft={draft || generatedDraft} onRegenerate={() => setDraft(generatedDraft)} />
          </div>
        </div>
      </div>

      <textarea className="print-contract hidden" readOnly value={draft || generatedDraft} />
    </main>
  );
}
