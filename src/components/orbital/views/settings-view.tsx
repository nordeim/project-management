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

/* v1.9 (measured): field controls — inputs 37.5px (pad 9/14), selects
   36px (pad 8/12); the inset dark leg runs 0.22 alpha (a hairline lighter
   than the generic 0.24 well pair). */
const FIELD =
  "w-full rounded-[10px] border-0 bg-orb-well px-[14px] py-[9px] text-[13px] shadow-[inset_-3px_-3px_6px_rgba(255,250,244,0.68),inset_3px_3px_6px_rgba(160,143,126,0.22)]";
const FIELD_SELECT =
  "w-full rounded-[10px] border-0 bg-orb-well px-[12px] text-[13px] shadow-[inset_-3px_-3px_6px_rgba(255,250,244,0.68),inset_3px_3px_6px_rgba(160,143,126,0.22)]";
/* v1.8 (measured): field labels are 12px/600 #6E6E6E with 0.48px
   tracking; helper text 11px/400 #9A9A9A. */
const FIELD_LABEL = "text-[12px] font-semibold tracking-[0.04em] text-orb-muted";
const FIELD_HINT = "text-[11px] font-normal text-[#9A9A9A]";
const FIELD_SUB_LABEL = "text-[11px] font-medium text-[#9A9A9A]";
/* v1.8 (measured): section headings (Workspace / Working Hours / AI
   Assistant) are 13px/600 #3A3A3A with 0.52px tracking. */
const SECTION_HEADING = "text-[13px] font-semibold tracking-[0.04em] text-orb-heading";

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
      <div className="mt-5 grid grid-cols-1 items-start gap-4 md:grid-cols-[1fr_1fr]">
        {/* Left column: Workspace + Working Hours */}
        <div className="space-y-4">
          <section className="orb-panel p-[22px_24px]" aria-label="Workspace">
            <h2 className={SECTION_HEADING}>Workspace</h2>

            <div className="mt-[17px] space-y-2">
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

          <section className="orb-panel p-[22px_24px]" aria-label="Working hours">
            <h2 className={SECTION_HEADING}>Working Hours</h2>

            <div className="mt-[17px]">
              {/* Reference (v1.6, measured; v1.9 rhythm): the "Active Window"
                  sub-header (12px/600 ls 0.48px, Title Case) sits 2px above
                  the description line, which sits 8px above the grid; each
                  Start/End label sits 13px above its 36px select. */}
              <p className="text-[12px] font-semibold tracking-[0.04em] text-orb-muted">Active Window</p>
              <p className={`mt-[2px] ${FIELD_HINT}`}>AI will only send pings during these hours</p>
              <div className="mt-[8px] grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="work-start" className={FIELD_SUB_LABEL}>
                    Start
                  </Label>
                  <div className="mt-[5px]">
                  <Select value={workStart} onValueChange={setWorkStart}>
                    <SelectTrigger id="work-start" size="sm" className={FIELD_SELECT}>
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
                <div>
                  <Label htmlFor="work-end" className={FIELD_SUB_LABEL}>
                    End
                  </Label>
                  <div className="mt-[5px]">
                  <Select value={workEnd} onValueChange={setWorkEnd}>
                    <SelectTrigger id="work-end" size="sm" className={FIELD_SELECT}>
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
            </div>
          </section>
        </div>

        {/* Right column: AI Assistant */}
        <section className="orb-panel p-[22px_24px]" aria-label="AI assistant">
          <h2 className={SECTION_HEADING}>AI Assistant</h2>

          {/* v1.9 (measured rhythm): heading → 17px → label; label → 2px →
              hint; hint → 16px → select; select → 10px → next label. */}
          <div className="mt-[17px]">
            <div>
              <Label className={FIELD_LABEL}>Ping Frequency</Label>
              <p className={`mt-[2px] ${FIELD_HINT}`}>How often the AI checks in with team members</p>
              <div className="mt-[8px]">
              <Select value={pingFrequency} onValueChange={(v) => setPingFrequency(v as Frequency)}>
                <SelectTrigger size="sm" className={FIELD_SELECT}>
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
            </div>

            {/* v2.0 (measured): the AI Tone block sits 18px below the
                "Once daily" select (the card is 242px in the live). */}
            <div className="mt-[18px]">
              <Label className={FIELD_LABEL}>AI Tone</Label>
              <div className="mt-[8px]">
              <Select value={aiTone} onValueChange={(v) => setAiTone(v as Tone)}>
                <SelectTrigger size="sm" className={FIELD_SELECT}>
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
          </div>
        </section>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button type="button" className="orb-pill-outline orb-pill-compact" disabled={saving} onClick={() => void save()}>
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
    <div className="w-full px-3 pt-6 md:px-7 lg:px-0 lg:pt-0">
      <header>
        <h1 className="text-[28px] font-normal leading-[1.2] tracking-[-0.01em] text-orb-heading">Settings</h1>
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
