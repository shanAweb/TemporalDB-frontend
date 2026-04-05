"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { connectorsApi, type Connector, type ConnectorType } from "@/lib/api";

interface Props {
  onClose: () => void;
  onSaved: (connector: Connector) => void;
  editing?: Connector | null;
}

type Step = "type" | "credentials" | "config" | "save";

const STEPS: Step[] = ["type", "credentials", "config", "save"];

const CONNECTOR_META: Record<ConnectorType, { label: string; description: string; color: string; icon: React.ReactNode }> = {
  jira: {
    label: "Jira",
    description: "Sync issues, comments & sprints",
    color: "from-[#0052CC] to-[#2684FF]",
    icon: (
      <svg viewBox="0 0 32 32" fill="currentColor" className="h-7 w-7 text-white">
        <path d="M15.993 1.01C8.84 1.01 3.04 6.81 3.04 13.963c0 4.13 1.916 7.817 4.912 10.256L15.993 31l8.04-6.781c2.997-2.44 4.913-6.126 4.913-10.256 0-7.153-5.8-12.953-12.953-12.953zm0 19.905c-3.84 0-6.952-3.112-6.952-6.952s3.112-6.952 6.952-6.952 6.952 3.112 6.952 6.952-3.112 6.952-6.952 6.952zm0-10.92a3.968 3.968 0 1 0 0 7.936 3.968 3.968 0 0 0 0-7.936z" />
      </svg>
    ),
  },
  clickup: {
    label: "ClickUp",
    description: "Sync tasks, lists & comments",
    color: "from-[#7B68EE] to-[#FF79C6]",
    icon: (
      <svg viewBox="0 0 32 32" fill="currentColor" className="h-7 w-7 text-white">
        <path d="M4 20.5l3.5-2.7c1.8 2.4 4.4 3.8 7.1 3.8 2.7 0 5.2-1.4 7.1-3.8l3.5 2.7C22.6 23.7 19.4 25.5 15.6 25.5S8.6 23.7 4 20.5zM15.6 6.5l-8 6.9-3-3.3L15.6 1l11 9.1-3 3.3-8-6.9z" />
      </svg>
    ),
  },
  timedoctor: {
    label: "Time Doctor",
    description: "Sync work logs & time sessions",
    color: "from-[#00B4D8] to-[#0077B6]",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-white">
        <circle cx="16" cy="16" r="12" />
        <polyline points="16 9 16 16 20 20" />
      </svg>
    ),
  },
};

const SCHEDULE_OPTIONS = [
  { value: "0 * * * *", label: "Every hour" },
  { value: "0 */4 * * *", label: "Every 4 hours" },
  { value: "0 */8 * * *", label: "Every 8 hours" },
  { value: "0 0 * * *", label: "Daily (midnight)" },
  { value: "0 9 * * 1-5", label: "Weekdays at 9am" },
];

function StepIndicator({ current }: { current: Step }) {
  const labels = ["Type", "Credentials", "Config", "Save"];
  const currentIdx = STEPS.indexOf(current);
  return (
    <div className="flex items-center gap-2 mb-6">
      {labels.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-all ${
            i < currentIdx ? "bg-accent-2 text-white" :
            i === currentIdx ? "bg-gradient-to-br from-accent-1 to-accent-2 text-white" :
            "bg-surface-light text-text-muted"
          }`}>
            {i < currentIdx ? (
              <svg viewBox="0 0 12 12" fill="currentColor" className="h-3 w-3"><path d="M10 3L5 8.5 2 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"/></svg>
            ) : i + 1}
          </div>
          <span className={`text-xs font-medium hidden sm:block ${i === currentIdx ? "text-text-primary" : "text-text-muted"}`}>
            {label}
          </span>
          {i < labels.length - 1 && <div className={`h-px w-6 ${i < currentIdx ? "bg-accent-2" : "bg-border"}`} />}
        </div>
      ))}
    </div>
  );
}

export default function ConnectorFormModal({ onClose, onSaved, editing }: Props) {
  const [step, setStep] = useState<Step>(editing ? "credentials" : "type");
  const [selectedType, setSelectedType] = useState<ConnectorType | null>(
    editing?.connector_type ?? null
  );
  const [name, setName] = useState(editing?.name ?? "");
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [config, setConfig] = useState<Record<string, string>>({});
  const [schedule, setSchedule] = useState(editing?.sync_schedule ?? "0 * * * *");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const type = selectedType;

  const credentialFields: Record<ConnectorType, { key: string; label: string; placeholder: string; secret?: boolean }[]> = {
    jira: [
      { key: "base_url", label: "Base URL", placeholder: "https://yourorg.atlassian.net" },
      { key: "email", label: "Email", placeholder: "you@company.com" },
      { key: "api_token", label: "API Token", placeholder: "Your Jira API token", secret: true },
    ],
    clickup: [
      { key: "api_token", label: "API Token", placeholder: "pk_••••••••••••", secret: true },
    ],
    timedoctor: [
      { key: "email", label: "Email", placeholder: "you@company.com" },
      { key: "password", label: "Password", placeholder: "Your Time Doctor password", secret: true },
      { key: "company_id", label: "Company ID", placeholder: "Your company ID from Time Doctor" },
    ],
  };

  const configFields: Record<ConnectorType, { key: string; label: string; placeholder: string; description?: string }[]> = {
    jira: [
      { key: "project_keys", label: "Project Keys", placeholder: "ENG, OPS (comma-separated, blank = all)", description: "Leave blank to sync all projects" },
    ],
    clickup: [
      { key: "team_id", label: "Team ID", placeholder: "Your ClickUp workspace/team ID" },
      { key: "space_ids", label: "Space IDs", placeholder: "Optional, comma-separated", description: "Leave blank to sync all spaces" },
    ],
    timedoctor: [
      { key: "days_back", label: "Days to Sync", placeholder: "7", description: "Number of days back to fetch on first sync" },
    ],
  };

  const canProceedCredentials = () => {
    if (!name.trim()) return false;
    if (!type) return false;
    if (editing) return true; // credentials optional on edit
    return credentialFields[type].every((f) => credentials[f.key]?.trim());
  };

  const handleSave = async () => {
    if (!type) return;
    setSaving(true);
    setError(null);
    try {
      // Parse config values
      const parsedConfig: Record<string, unknown> = {};
      if (type === "jira" && config.project_keys) {
        parsedConfig.project_keys = config.project_keys.split(",").map((s) => s.trim()).filter(Boolean);
      }
      if (type === "clickup") {
        if (config.team_id) parsedConfig.team_id = config.team_id.trim();
        if (config.space_ids) parsedConfig.space_ids = config.space_ids.split(",").map((s) => s.trim()).filter(Boolean);
      }
      if (type === "timedoctor" && config.days_back) {
        parsedConfig.days_back = parseInt(config.days_back) || 7;
      }

      let saved: Connector;
      if (editing) {
        const body: Record<string, unknown> = { name, config: parsedConfig, sync_schedule: schedule };
        if (Object.keys(credentials).length > 0) body.credentials = credentials;
        saved = await connectorsApi.update(editing.id, body);
      } else {
        saved = await connectorsApi.create({
          name,
          connector_type: type,
          credentials,
          config: parsedConfig,
          sync_schedule: schedule,
        });
      }
      onSaved(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save connector");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-lg rounded-2xl border border-border bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold text-text-primary">
            {editing ? "Edit Connector" : "Add Connector"}
          </h2>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-light hover:text-text-secondary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5">
          <StepIndicator current={step} />

          <AnimatePresence mode="wait">
            {/* Step 1: Choose type */}
            {step === "type" && (
              <motion.div key="type" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.15 }}>
                <p className="mb-4 text-sm text-text-muted">Choose the external tool to connect</p>
                <div className="space-y-3">
                  {(Object.entries(CONNECTOR_META) as [ConnectorType, typeof CONNECTOR_META[ConnectorType]][]).map(([t, meta]) => (
                    <button
                      key={t}
                      onClick={() => setSelectedType(t)}
                      className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all duration-150 ${
                        selectedType === t
                          ? "border-accent-1/50 bg-accent-1/5"
                          : "border-border bg-surface/50 hover:border-border-light hover:bg-surface-light"
                      }`}
                    >
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${meta.color}`}>
                        {meta.icon}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-text-primary">{meta.label}</div>
                        <div className="text-xs text-text-muted">{meta.description}</div>
                      </div>
                      {selectedType === t && (
                        <div className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-2">
                          <svg viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" className="h-3 w-3">
                            <polyline points="2 6 5 9 10 3" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Credentials */}
            {step === "credentials" && type && (
              <motion.div key="creds" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.15 }}>
                <p className="mb-4 text-sm text-text-muted">Enter your {CONNECTOR_META[type].label} credentials</p>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-text-secondary">Connector Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={`e.g. ${CONNECTOR_META[type].label} Production`}
                      className="h-9 w-full rounded-lg border border-border bg-surface/60 px-3 text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors focus:border-accent-1/50"
                    />
                  </div>
                  {credentialFields[type].map((field) => (
                    <div key={field.key}>
                      <label className="mb-1.5 block text-xs font-medium text-text-secondary">{field.label}</label>
                      <input
                        type={field.secret ? "password" : "text"}
                        value={credentials[field.key] ?? ""}
                        onChange={(e) => setCredentials((prev) => ({ ...prev, [field.key]: e.target.value }))}
                        placeholder={editing && field.secret ? "•••••••• (unchanged)" : field.placeholder}
                        className="h-9 w-full rounded-lg border border-border bg-surface/60 px-3 text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors focus:border-accent-1/50"
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 3: Config */}
            {step === "config" && type && (
              <motion.div key="config" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.15 }}>
                <p className="mb-4 text-sm text-text-muted">Configure what to sync</p>
                <div className="space-y-4">
                  {configFields[type].map((field) => (
                    <div key={field.key}>
                      <label className="mb-1 block text-xs font-medium text-text-secondary">{field.label}</label>
                      {field.description && <p className="mb-1.5 text-[11px] text-text-muted">{field.description}</p>}
                      <input
                        type="text"
                        value={config[field.key] ?? ""}
                        onChange={(e) => setConfig((prev) => ({ ...prev, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                        className="h-9 w-full rounded-lg border border-border bg-surface/60 px-3 text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors focus:border-accent-1/50"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-text-secondary">Sync Schedule</label>
                    <select
                      value={schedule}
                      onChange={(e) => setSchedule(e.target.value)}
                      className="h-9 w-full rounded-lg border border-border bg-surface/60 px-3 text-sm text-text-secondary outline-none transition-colors focus:border-accent-1/50 cursor-pointer"
                    >
                      {SCHEDULE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Save */}
            {step === "save" && type && (
              <motion.div key="save" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.15 }}>
                <div className="rounded-xl border border-border bg-surface/50 p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${CONNECTOR_META[type].color}`}>
                      {CONNECTOR_META[type].icon}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-text-primary">{name}</div>
                      <div className="text-xs text-text-muted">{CONNECTOR_META[type].label}</div>
                    </div>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-text-muted">Schedule</span>
                      <span className="text-text-secondary">{SCHEDULE_OPTIONS.find(o => o.value === schedule)?.label ?? schedule}</span>
                    </div>
                  </div>
                </div>
                {error && (
                  <div className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-xs text-red-400">
                    {error}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-6 py-4">
          <button
            onClick={() => {
              const idx = STEPS.indexOf(step);
              if (idx > 0) setStep(STEPS[idx - 1]);
              else onClose();
            }}
            className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-surface-light hover:text-text-secondary"
          >
            {step === STEPS[0] ? "Cancel" : "Back"}
          </button>

          {step !== "save" ? (
            <button
              onClick={() => {
                const idx = STEPS.indexOf(step);
                setStep(STEPS[idx + 1]);
              }}
              disabled={step === "type" ? !selectedType : step === "credentials" ? !canProceedCredentials() : false}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent-1 to-accent-2 px-5 py-2 text-sm font-semibold text-white shadow-lg transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent-1 to-accent-2 px-5 py-2 text-sm font-semibold text-white shadow-lg transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {saving ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
                  </svg>
                  Saving…
                </>
              ) : (editing ? "Save Changes" : "Create Connector")}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
