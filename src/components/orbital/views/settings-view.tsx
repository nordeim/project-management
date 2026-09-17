"use client";

// Settings: two-column layout matching the reference — Workspace + Working
// Hours cards on the left, AI Assistant on the right, white inputs with a
// subtle inner shadow, Title Case labels, save bar below.

import { useState } from "react";
import { Save } from "lucide-react";
import { useOrbital } from "@/components/orbital/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import type { WorkspaceSettingsDTO } from "@/lib/orbital";

type Frequency = WorkspaceSettingsDTO["pingFrequency"];
type Tone = WorkspaceSettingsDTO["aiTone"];

const FREQUENCY_OPTIONS: Array<{ value: Frequency; label: string }> = [
  { value: "once_daily", label: "Once daily" },
  { value: "twice_daily", label: "Twice daily" },
  { value: "weekly", label: "Weekly" },
];

const TONE_OPTIONS: Array<{ value: Tone; label: string }> = [
  { value: "friendly", label: "Friendly & casual" },
  { value: "professional", label: "Professional" },
  { value: "concise", label: "Concise" },
];

const FIELD =
  "h-11 rounded-[10px] border-0 bg-orb-well shadow-[inset_-3px_-3px_6px_rgba(255,250,244,0.68),inset_3px_3px_6px_rgba(160,143,126,0.24)]";
const FIELD_LABEL = "text-[13px] font-medium text-orb-body";

function hourOptions(): string[] {
  return Array.from({ length: 25 }, (_, i) => `${String(i).padStart(2, "0")}:00`);
}

function SettingsForm({ initial }: { initial: WorkspaceSettingsDTO }) {
  const saveSettings = useOrbital((s) => s.saveSettings);

  const [name, setName] = useState(initial.name);
  const [workStart, setWorkStart] = useState(initial.workStart);
  const [workEnd, setWorkEnd] = useState(initial.workEnd);
  const [pingFrequency, setPingFrequency] = useState<Frequency>(initial.pingFrequency);
  const [aiTone, setAiTone] = useState<Tone>(initial.aiTone);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (saving) return;
    setSaving(true);
    const done = await saveSettings({ name, workStart, workEnd, pingFrequency, aiTone });
    setSaving(false);
    if (done) {
      toast({ title: "Settings saved", description: "Your workspace preferences are up to date." });
    }
  }

  return (
    <>
      <div className="mt-6 grid grid-cols-1 items-start gap-4 lg:grid-cols-[1fr_1fr]">
        {/* Left column: Workspace + Working Hours */}
        <div className="space-y-4">
          <section className="orb-card p-6" aria-label="Workspace">
            <h2 className="text-[15px] font-semibold text-orb-heading">Workspace</h2>

            <div className="mt-5 space-y-2">
              <Label htmlFor="workspace-name" className={FIELD_LABEL}>
                Workspace Name
              </Label>
              <Input
                id="workspace-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Team"
                maxLength={100}
                className={FIELD}
              />
            </div>
          </section>

          <section className="orb-card p-6" aria-label="Working hours">
            <h2 className="text-[15px] font-semibold text-orb-heading">Working Hours</h2>

            <div className="mt-5 space-y-4">
              <p className="text-[13px] leading-relaxed text-orb-muted">AI will only send pings during these hours</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="work-start" className={FIELD_LABEL}>
                    Start
                  </Label>
                  <Select value={workStart} onValueChange={setWorkStart}>
                    <SelectTrigger id="work-start" className={FIELD}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {hourOptions().map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="work-end" className={FIELD_LABEL}>
                    End
                  </Label>
                  <Select value={workEnd} onValueChange={setWorkEnd}>
                    <SelectTrigger id="work-end" className={FIELD}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {hourOptions().map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right column: AI Assistant */}
        <section className="orb-card p-6" aria-label="AI assistant">
          <h2 className="text-[15px] font-semibold text-orb-heading">AI Assistant</h2>

          <div className="mt-5 space-y-5">
            <div className="space-y-2">
              <Label className={FIELD_LABEL}>Ping Frequency</Label>
              <p className="text-[13px] leading-relaxed text-orb-muted">How often the AI checks in with team members</p>
              <Select value={pingFrequency} onValueChange={(v) => setPingFrequency(v as Frequency)}>
                <SelectTrigger className={`${FIELD} w-full`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {FREQUENCY_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className={FIELD_LABEL}>AI Tone</Label>
              <Select value={aiTone} onValueChange={(v) => setAiTone(v as Tone)}>
                <SelectTrigger className={`${FIELD} w-full`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {TONE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button type="button" className="orb-pill-outline" disabled={saving} onClick={() => void save()}>
          <Save size={14} aria-hidden="true" />
          {saving ? "Saving…" : "Save Settings"}
        </Button>
      </div>
    </>
  );
}

export function SettingsView() {
  const settings = useOrbital((s) => s.settings);

  return (
    <div className="mx-auto w-full max-w-[1100px]">
      <header>
        <h1 className="text-[28px] font-normal tracking-tight text-orb-heading">Settings</h1>
        <p className="mt-1 text-[14px] text-orb-muted">Configure your AI assistant and workspace</p>
      </header>

      {settings ? (
        <SettingsForm key={`${settings.name}|${settings.workStart}|${settings.workEnd}|${settings.pingFrequency}|${settings.aiTone}`} initial={settings} />
      ) : (
        <p className="mt-10 text-center text-[14px] text-orb-muted" role="status">
          Loading settings…
        </p>
      )}
    </div>
  );
}
