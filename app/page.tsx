"use client";

import { useMemo, useState } from "react";

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
  revisionLimits: string;
  ipOwnershipTerms: string;
  sourceFilesOwnership: string;
  clientResponsibilities: string;
  cancellationTerms: string;
  confidentialityTerms: string;
  supportTerms: string;
};

type Risk = {
  title: string;
  detail: string;
  severity: "High" | "Medium";
};

const contractTypes: ContractType[] = ["Web design", "App development", "UI/UX design", "Branding", "SaaS build", "Maintenance", "Consulting", "Retainer"];

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
  revisionLimits: "",
  ipOwnershipTerms: "",
  sourceFilesOwnership: "",
  clientResponsibilities: "",
  cancellationTerms: "",
  confidentialityTerms: "",
  supportTerms: "",
};

const sampleForm: FormState = {
  freelancerName: "Jordan Lee Studio",
  clientName: "Northstar Labs",
  projectTitle: "Customer Onboarding Portal",
  scopeOfWork: "Design and build a responsive onboarding portal with account setup, guided checklists, admin content controls, and analytics events for key activation steps.",
  deliverables: "UX flows, high-fidelity UI designs, production Next.js implementation, CMS-backed checklist content, QA notes, deployment handoff, and one recorded walkthrough.",
  timeline: "Eight weeks from kickoff, beginning after deposit receipt and access to required brand/product materials.",
  milestones: "Week 1 discovery and requirements. Week 2 UX flows. Weeks 3-4 visual design. Weeks 5-7 development. Week 8 QA, revisions, and handoff.",
  paymentTerms: "Total fee of $18,000. 40% deposit due before scheduling kickoff, 30% after design approval, and 30% before production handoff. Invoices are due within 10 days. Late payments accrue 1.5% per month where permitted by law.",
  depositAmount: "40% of project fee due before kickoff",
  revisionLimits: "Two revision rounds are included for design and one QA correction pass is included before handoff.",
  ipOwnershipTerms: "Client receives ownership of final approved work after full payment. Freelancer retains ownership of pre-existing tools, templates, know-how, and reusable methods.",
  sourceFilesOwnership: "Source code and final design files transfer to Client after full payment. Third-party libraries remain governed by their own licenses.",
  clientResponsibilities: "Client will provide timely feedback within three business days, access to systems, brand assets, product copy, and a single decision maker for approvals.",
  cancellationTerms: "Either party may terminate with seven days written notice. Client pays for completed work, approved expenses, and any non-cancellable commitments through the termination date.",
  confidentialityTerms: "Each party will protect non-public business, product, technical, and customer information shared for the project and use it only for project purposes.",
  supportTerms: "Thirty days of bug-fix support is included after launch for issues caused by the delivered work. New features, content changes, platform updates, and third-party service issues are billed separately.",
};

const groups: Array<{
  label: string;
  title: string;
  fields: Array<{ key: keyof FormState; label: string; placeholder: string; short?: boolean }>;
}> = [
  {
    label: "Basics",
    title: "Name the people and project",
    fields: [
      { key: "freelancerName", label: "Freelancer name", placeholder: "Your legal or studio name", short: true },
      { key: "clientName", label: "Client name", placeholder: "Client company or individual", short: true },
      { key: "projectTitle", label: "Project title", placeholder: "Website redesign, app MVP, design sprint..." },
    ],
  },
  {
    label: "Scope",
    title: "Describe the work clearly",
    fields: [
      { key: "scopeOfWork", label: "Scope of work", placeholder: "What you will do, and any boundaries..." },
      { key: "deliverables", label: "Deliverables", placeholder: "Design files, source code, prototypes, documentation..." },
      { key: "timeline", label: "Timeline", placeholder: "Overall schedule and what starts the clock..." },
      { key: "milestones", label: "Milestones", placeholder: "Discovery, design, build, QA, launch..." },
    ],
  },
  {
    label: "Payment",
    title: "Make money terms unambiguous",
    fields: [
      { key: "paymentTerms", label: "Payment terms", placeholder: "Total fee, billing schedule, invoice due dates, late fees..." },
      { key: "depositAmount", label: "Deposit amount", placeholder: "Example: 40% due before kickoff", short: true },
      { key: "revisionLimits", label: "Revision limits", placeholder: "Example: two design rounds and one QA correction pass" },
    ],
  },
  {
    label: "Ownership",
    title: "Clarify files, code, and rights",
    fields: [
      { key: "ipOwnershipTerms", label: "IP ownership terms", placeholder: "Who owns final work after payment? What do you retain?" },
      { key: "sourceFilesOwnership", label: "Source files/code ownership", placeholder: "Design files, repos, build files, third-party libraries..." },
      { key: "clientResponsibilities", label: "Client responsibilities", placeholder: "Feedback deadline, assets, access, approvals..." },
    ],
  },
  {
    label: "Boundaries",
    title: "Set support and exit terms",
    fields: [
      { key: "cancellationTerms", label: "Cancellation/termination terms", placeholder: "Notice period, payment for completed work, expenses..." },
      { key: "confidentialityTerms", label: "Confidentiality terms", placeholder: "How both sides handle private information..." },
      { key: "supportTerms", label: "Support/maintenance terms", placeholder: "What support is included, for how long, and what is extra..." },
    ],
  },
];

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

7. Revisions and Change Requests
${value(form.revisionLimits, "Revision limits")}

Requests beyond the included revision limits, changes to approved work, or new deliverables may require additional fees and timeline changes.

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
This agreement is governed by the laws of [Governing law / jurisdiction placeholder].

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
  const payment = form.paymentTerms.toLowerCase();
  const revisions = form.revisionLimits.toLowerCase();
  const responsibilities = form.clientResponsibilities.toLowerCase();
  const support = form.supportTerms.toLowerCase();

  if (!form.depositAmount.trim() && !payment.includes("deposit")) risks.push({ title: "No deposit added", detail: "Add upfront payment before kickoff to reduce non-payment risk.", severity: "High" });
  if (!form.revisionLimits.trim()) risks.push({ title: "No revision limit", detail: "State how many revision rounds are included before extra fees apply.", severity: "High" });
  if (revisions.includes("unlimited")) risks.push({ title: "Unlimited revisions detected", detail: "Unlimited revisions can make a fixed-fee project open-ended.", severity: "High" });
  if (!payment.includes("late") && !payment.includes("overdue")) risks.push({ title: "No late payment term", detail: "Add due dates and what happens if an invoice is overdue.", severity: "Medium" });
  if (!form.ipOwnershipTerms.trim()) risks.push({ title: "No IP ownership clause", detail: "Clarify who owns final work and when ownership transfers.", severity: "High" });
  if (!form.cancellationTerms.trim()) risks.push({ title: "No cancellation clause", detail: "Explain how either side may end the project and what remains payable.", severity: "High" });
  if (!responsibilities.includes("feedback") && !responsibilities.includes("approval")) risks.push({ title: "No client feedback deadline", detail: "Add a feedback window so the timeline does not drift silently.", severity: "Medium" });
  if (!form.supportTerms.trim() || (!support.includes("not include") && !support.includes("billed separately"))) risks.push({ title: "No support/maintenance boundary", detail: "Define what post-launch support includes, excludes, and how long it lasts.", severity: "Medium" });

  return risks;
}

export default function ScopeGuard() {
  const [contractType, setContractType] = useState<ContractType>("Web design");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState(() => generateContract("Web design", emptyForm));
  const [savedAt, setSavedAt] = useState("");
  const [copied, setCopied] = useState(false);

  const generatedDraft = useMemo(() => generateContract(contractType, form), [contractType, form]);
  const risks = useMemo(() => getRisks(form), [form]);
  const completion = Math.round((Object.values(form).filter(Boolean).length / Object.keys(form).length) * 100);
  const currentGroup = groups[step];

  const update = (key: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setCopied(false);
  };

  const loadSample = () => {
    setContractType("SaaS build");
    setForm(sampleForm);
    setDraft(generateContract("SaaS build", sampleForm));
    setStep(0);
  };

  const saveDraft = () => {
    const time = new Date().toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
    localStorage.setItem("scopeguard-draft-v1", JSON.stringify({ contractType, form, draft, savedAt: time }));
    setSavedAt(time);
  };

  const copyDraft = async () => {
    await navigator.clipboard.writeText(draft);
    setCopied(true);
  };

  return (
    <main className="min-h-dvh bg-[#f5f7f4] text-[#172126]">
      <section className="border-b border-[#d7e2df] bg-[#fbfcf8]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 md:px-8 lg:grid-cols-[1fr_420px]">
          <div>
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-md bg-[#184b49] text-sm font-black text-white">SG</div>
              <div>
                <p className="text-lg font-black">ScopeGuard</p>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6a7d82]">Freelance tech contracts</p>
              </div>
            </div>
            <p className="mt-10 text-sm font-bold uppercase tracking-[0.16em] text-[#ba4934]">Plain English first</p>
            <h1 className="mt-3 max-w-4xl text-4xl font-black leading-tight text-[#102f2e] md:text-6xl">Draft better contracts faster.</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#40595f]">
              ScopeGuard turns a project brief into an editable tech freelance contract draft with risk flags for scope, payment, revisions, ownership, cancellation, and support. Review with a lawyer when needed.
            </p>
          </div>

          <div className="grid content-start gap-3 rounded-lg border border-[#cbd8df] bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-[#315a62]">Draft readiness</p>
              <p className="text-sm font-black text-[#184b49]">{completion}%</p>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#e4ece9]">
              <div className="h-full bg-[#df6b4f]" style={{ width: `${completion}%` }} />
            </div>
            <button type="button" onClick={loadSample} className="rounded-md border border-[#b9c9cf] bg-white px-4 py-3 text-sm font-bold hover:bg-[#f3f8f7]">Load sample data</button>
            <p className="text-xs leading-5 text-[#6a7d82]">Draft only. Not legal advice. Review with a qualified legal professional when needed.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:px-8 xl:grid-cols-[330px_minmax(0,1fr)_330px]">
        <aside className="space-y-5">
          <div className="rounded-lg border border-[#d7e2df] bg-white p-4">
            <h2 className="font-black">Contract type</h2>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {contractTypes.map((type) => (
                <button key={type} type="button" onClick={() => setContractType(type)} className={`rounded-md border px-3 py-3 text-left text-sm font-semibold ${contractType === type ? "border-[#184b49] bg-[#e8f3f1] text-[#103c3a]" : "border-[#d7e2df] bg-white text-[#40595f]"}`}>
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-[#d7e2df] bg-white p-4">
            <h2 className="font-black">Questionnaire</h2>
            <div className="mt-4 space-y-2">
              {groups.map((group, index) => (
                <button key={group.label} type="button" onClick={() => setStep(index)} className={`flex w-full justify-between rounded-md px-3 py-2 text-sm font-semibold ${step === index ? "bg-[#184b49] text-white" : "bg-[#f5f7f4] text-[#40595f]"}`}>
                  <span>{group.label}</span>
                  <span>{index + 1}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className="space-y-6">
          <section className="rounded-lg border border-[#d7e2df] bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#ba4934]">{currentGroup.label}</p>
                <h2 className="mt-2 text-2xl font-black text-[#102f2e]">{currentGroup.title}</h2>
              </div>
              <div className="flex gap-2">
                <button type="button" disabled={step === 0} onClick={() => setStep((value) => value - 1)} className="rounded-md px-4 py-2 text-sm font-bold text-[#315a62] disabled:opacity-40">Back</button>
                <button type="button" disabled={step === groups.length - 1} onClick={() => setStep((value) => value + 1)} className="rounded-md border border-[#b9c9cf] px-4 py-2 text-sm font-bold disabled:opacity-40">Next</button>
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              {currentGroup.fields.map((field) => (
                <label key={field.key} className="block">
                  <span className="mb-1.5 block text-sm font-semibold">{field.label}</span>
                  {field.short ? (
                    <input value={form[field.key]} onChange={(event) => update(field.key, event.target.value)} placeholder={field.placeholder} className="w-full rounded-md border border-[#cbd8df] bg-white px-3 py-2 text-sm outline-none focus:border-[#246b69] focus:ring-2 focus:ring-[#d5ece8]" />
                  ) : (
                    <textarea value={form[field.key]} onChange={(event) => update(field.key, event.target.value)} placeholder={field.placeholder} className="min-h-28 w-full resize-y rounded-md border border-[#cbd8df] bg-white px-3 py-2 text-sm leading-6 outline-none focus:border-[#246b69] focus:ring-2 focus:ring-[#d5ece8]" />
                  )}
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-[#d7e2df] bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#ba4934]">Generated contract editor</p>
                <h2 className="mt-2 text-2xl font-black text-[#102f2e]">Editable draft</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setDraft(generatedDraft)} className="rounded-md border border-[#b9c9cf] px-4 py-2 text-sm font-bold">Regenerate</button>
                <button type="button" onClick={copyDraft} className="rounded-md border border-[#b9c9cf] px-4 py-2 text-sm font-bold">{copied ? "Copied" : "Copy text"}</button>
                <button type="button" onClick={() => window.print()} className="rounded-md border border-[#b9c9cf] px-4 py-2 text-sm font-bold">Export PDF</button>
                <button type="button" onClick={saveDraft} className="rounded-md bg-[#184b49] px-4 py-2 text-sm font-bold text-white">Save locally</button>
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-[#5d7278]">Edit anything directly before copying or exporting. Saved drafts stay in this browser only.{savedAt ? ` Last saved ${savedAt}.` : ""}</p>
            <textarea className="print-contract mt-5 min-h-[640px] w-full resize-y rounded-md border border-[#cbd8df] bg-[#fbfcf8] p-4 font-mono text-sm leading-6 outline-none focus:border-[#246b69] focus:ring-2 focus:ring-[#d5ece8]" value={draft} onChange={(event) => setDraft(event.target.value)} />
          </section>
        </div>

        <aside className="space-y-5">
          <section className="rounded-lg border border-[#d7e2df] bg-white p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-black">Risk Review</h2>
                <p className="mt-1 text-sm leading-6 text-[#5d7278]">Common gaps before you send the draft.</p>
              </div>
              <span className={`rounded-md px-2.5 py-1 text-xs font-black ${risks.length ? "bg-[#ffe8df] text-[#9b321f]" : "bg-[#e8f3f1] text-[#184b49]"}`}>{risks.length} open</span>
            </div>
            <div className="mt-4 space-y-3">
              {risks.length ? risks.map((risk) => (
                <div key={risk.title} className="rounded-md border border-[#ecd2c8] bg-[#fff8f4] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-black text-[#63291d]">{risk.title}</h3>
                    <span className="rounded bg-white px-2 py-1 text-xs font-bold text-[#9b321f]">{risk.severity}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#6c5148]">{risk.detail}</p>
                </div>
              )) : (
                <div className="rounded-md border border-[#cce2dc] bg-[#f1faf7] p-4">
                  <h3 className="text-sm font-black text-[#184b49]">No common gaps detected</h3>
                  <p className="mt-2 text-sm leading-6 text-[#42646a]">Still review the draft for your project, local law, and risk tolerance.</p>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-lg border border-[#d7e2df] bg-[#102f2e] p-4 text-white">
            <h2 className="font-black">Export and share</h2>
            <p className="mt-2 text-sm leading-6 text-[#d5ece8]">Copy, print to PDF, or save locally. ScopeGuard drafts are starting points, not legal guarantees.</p>
          </section>
        </aside>
      </section>
    </main>
  );
}
