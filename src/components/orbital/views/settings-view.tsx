"use client";

// Settings: workspace name, working hours window, and AI assistant
// behaviour (ping frequency, tone). The form is a child component that
// mounts fresh with the loaded settings (no sync effect needed).

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
      <section className="orb-card mt-6 p-6" aria-label="Workspace">
        <h2 className="text-[15px] font-semibold text-orb-heading">Workspace</h2>

        <div className="mt-5 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="workspace-name" className="orb-label">
              Workspace Name
            </Label>
            <Input
              id="workspace-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Team"
              maxLength={100}
              className="h-11 rounded-2xl border-black/[0.08] bg-orb-inset/60"
            />
          </div>

          <div className="space-y-2">
            <p className="orb-label">Working Hours</p>
            <p className="text-[13px] text-orb-muted">Active Window — the AI will only send pings during these hours</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="work-start" className="text-[12.5px] text-orb-muted">
                  Start
                </Label>
                <Select value={workStart} onValueChange={setWorkStart}>
                  <SelectTrigger id="work-start" className="h-11 rounded-2xl border-black/[0.08] bg-orb-inset/60">
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
                <Label htmlFor="work-end" className="text-[12.5px] text-orb-muted">
                  End
                </Label>
                <Select value={workEnd} onValueChange={setWorkEnd}>
                  <SelectTrigger id="work-end" className="h-11 rounded-2xl border-black/[0.08] bg-orb-inset/60">
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

      <section className="orb-card mt-4 p-6" aria-label="AI assistant">
        <h2 className="text-[15px] font-semibold text-orb-heading">AI Assistant</h2>

        <div className="mt-5 space-y-5">
          <div className="space-y-2">
            <p className="orb-label">Ping Frequency</p>
            <p className="text-[13px] text-orb-muted">How often the AI checks in with team members</p>
            <Select value={pingFrequency} onValueChange={setPingFrequency}>
              <SelectTrigger className="h-11 w-full rounded-2xl border-black/[0.08] bg-orb-inset/60 sm:w-64">
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
            <p className="orb-label">AI Tone</p>
            <Select value={aiTone} onValueChange={setAiTone}>
              <SelectTrigger className="h-11 w-full rounded-2xl border-black/[0.08] bg-orb-inset/60 sm:w-64">
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

      <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
        <Button type="button" className="orb-pill" disabled={saving} onClick={() => void save()}>
          <Save size={14} aria-hidden="true" />
          {saving ? "Saving…" : "Save Settings"}
        </Button>
      </div>
    </>
  );
}

export function SettingsView() {
  const settings = useOrbital((s) => s.settings);
  const signOut = useOrbital((s) => s.signOut);

  return (
    <div className="mx-auto max-w-2xl">
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

      <div className="mt-2">
        <Button
          type="button"
          variant="ghost"
          className="h-10 rounded-full text-[13px] font-medium text-orb-muted hover:bg-black/[0.04] hover:text-orb-heading"
          onClick={() => void signOut()}
        >
          Sign out
        </Button>
      </div>
    </div>
  );
}
