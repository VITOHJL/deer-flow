"use client";

import {
  BotIcon,
  MessageSquareIcon,
  Settings2Icon,
  Trash2Icon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteAgent, useUpdateAgent } from "@/core/agents";
import type { Agent } from "@/core/agents";
import { useI18n } from "@/core/i18n/hooks";
import { useSkills } from "@/core/skills/hooks";
import type { Skill } from "@/core/skills/type";
import { cn } from "@/lib/utils";

interface AgentCardProps {
  agent: Agent;
}

type SkillMode = "inherit" | "none" | "custom";

export function AgentCard({ agent }: AgentCardProps) {
  const { t } = useI18n();
  const router = useRouter();
  const deleteAgent = useDeleteAgent();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [skillsOpen, setSkillsOpen] = useState(false);

  function handleChat() {
    router.push(`/workspace/agents/${agent.name}/chats/new`);
  }

  async function handleDelete() {
    try {
      await deleteAgent.mutateAsync(agent.name);
      toast.success(t.agents.deleteSuccess);
      setDeleteOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <>
      <Card className="group flex flex-col transition-shadow hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                <BotIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <CardTitle className="truncate text-base">
                  {agent.name}
                </CardTitle>
                {agent.model && (
                  <Badge variant="secondary" className="mt-0.5 text-xs">
                    {agent.model}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {agent.description && (
            <CardDescription className="mt-2 line-clamp-2 text-sm">
              {agent.description}
            </CardDescription>
          )}
        </CardHeader>

        {((agent.tool_groups?.length ?? 0) + (agent.skills?.length ?? 0) > 0 ||
          agent.skills === null) && (
          <CardContent className="pt-0 pb-3">
            <div className="flex flex-wrap gap-1">
              {agent.tool_groups?.map((group) => (
                <Badge
                  key={`tg:${group}`}
                  variant="outline"
                  className="text-xs"
                >
                  {group}
                </Badge>
              ))}
              {agent.skills === null && (
                <Badge variant="secondary" className="text-xs">
                  {t.agents.inheritAllSkills}
                </Badge>
              )}
              {agent.skills?.map((skill) => (
                <Badge
                  key={`sk:${skill}`}
                  variant="secondary"
                  className="text-xs"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        )}

        <CardFooter className="mt-auto flex items-center justify-between gap-2 pt-3">
          <Button size="sm" className="flex-1" onClick={handleChat}>
            <MessageSquareIcon className="mr-1.5 h-3.5 w-3.5" />
            {t.agents.chat}
          </Button>
          <div className="flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 shrink-0"
              onClick={() => setSkillsOpen(true)}
              title={t.agents.configureSkills}
            >
              <Settings2Icon className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="text-destructive hover:text-destructive h-8 w-8 shrink-0"
              onClick={() => setDeleteOpen(true)}
              title={t.agents.delete}
            >
              <Trash2Icon className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Delete Confirm */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.agents.delete}</DialogTitle>
            <DialogDescription>{t.agents.deleteConfirm}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={deleteAgent.isPending}
            >
              {t.common.cancel}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteAgent.isPending}
            >
              {deleteAgent.isPending ? t.common.loading : t.common.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AgentSkillsDialog
        agent={agent}
        open={skillsOpen}
        onOpenChange={setSkillsOpen}
      />
    </>
  );
}

function getInitialSkillMode(agent: Agent): SkillMode {
  if (agent.skills === null) return "inherit";
  if (agent.skills.length === 0) return "none";
  return "custom";
}

function AgentSkillsDialog({
  agent,
  open,
  onOpenChange,
}: {
  agent: Agent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useI18n();
  const { skills, isLoading } = useSkills();
  const updateAgent = useUpdateAgent();
  const [mode, setMode] = useState<SkillMode>(() => getInitialSkillMode(agent));
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    () => agent.skills ?? [],
  );

  const sortedSkills = useMemo(
    () => [...skills].sort((a, b) => a.name.localeCompare(b.name)),
    [skills],
  );

  function resetFromAgent() {
    setMode(getInitialSkillMode(agent));
    setSelectedSkills(agent.skills ?? []);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      resetFromAgent();
    }
    onOpenChange(nextOpen);
  }

  function toggleSkill(skillName: string) {
    setMode("custom");
    setSelectedSkills((current) =>
      current.includes(skillName)
        ? current.filter((name) => name !== skillName)
        : [...current, skillName],
    );
  }

  async function handleSave() {
    try {
      const nextSkills =
        mode === "inherit" ? null : mode === "none" ? [] : selectedSkills;
      await updateAgent.mutateAsync({
        name: agent.name,
        request: { skills: nextSkills },
      });
      toast.success(t.agents.saveSkillsSuccess);
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t.agents.configureSkills}</DialogTitle>
          <DialogDescription>
            {t.agents.configureSkillsDescription.replace("{name}", agent.name)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-3">
            <SkillModeButton
              active={mode === "inherit"}
              label={t.agents.inheritAllSkills}
              onClick={() => setMode("inherit")}
            />
            <SkillModeButton
              active={mode === "custom"}
              label={t.agents.customSkills}
              onClick={() => setMode("custom")}
            />
            <SkillModeButton
              active={mode === "none"}
              label={t.agents.noSkills}
              onClick={() => setMode("none")}
            />
          </div>

          <div className="max-h-80 overflow-y-auto rounded-md border">
            {isLoading ? (
              <div className="text-muted-foreground flex h-24 items-center justify-center text-sm">
                {t.common.loading}
              </div>
            ) : sortedSkills.length === 0 ? (
              <div className="text-muted-foreground flex h-24 items-center justify-center text-sm">
                {t.agents.noSkillsAvailable}
              </div>
            ) : (
              <div className="divide-y">
                {sortedSkills.map((skill) => (
                  <SkillRow
                    key={skill.name}
                    skill={skill}
                    checked={
                      mode === "inherit" ||
                      (mode === "custom" && selectedSkills.includes(skill.name))
                    }
                    disabled={mode !== "custom"}
                    onToggle={() => toggleSkill(skill.name)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updateAgent.isPending}
          >
            {t.common.cancel}
          </Button>
          <Button onClick={handleSave} disabled={updateAgent.isPending}>
            {updateAgent.isPending ? t.common.loading : t.common.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SkillModeButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant={active ? "secondary" : "outline"}
      className="justify-center"
      onClick={onClick}
    >
      {label}
    </Button>
  );
}

function SkillRow({
  skill,
  checked,
  disabled,
  onToggle,
}: {
  skill: Skill;
  checked: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  const { t } = useI18n();
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 px-3 py-2.5",
        disabled && "cursor-default opacity-60",
      )}
    >
      <input
        type="checkbox"
        className="mt-1 h-4 w-4"
        checked={checked}
        disabled={disabled}
        onChange={onToggle}
      />
      <span className="min-w-0 flex-1 space-y-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">{skill.name}</span>
          <Badge variant="outline" className="text-[10px]">
            {skill.category}
          </Badge>
          {!skill.enabled && (
            <Badge variant="secondary" className="text-[10px]">
              {t.agents.globallyDisabled}
            </Badge>
          )}
        </span>
        {skill.description && (
          <span className="text-muted-foreground line-clamp-2 block text-xs">
            {skill.description}
          </span>
        )}
      </span>
    </label>
  );
}
