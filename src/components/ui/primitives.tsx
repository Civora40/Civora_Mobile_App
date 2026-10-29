import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
  ArrowUpRight,
  ChevronRight,
  FileCheck2,
  FolderKanban,
  Plus,
  ShieldCheck,
  Zap,
} from "lucide-react-native";
import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

import { SyncStateBadge } from "@/components/feedback/sync-state-badge";
import { WEEKLY_SUBMITTAL_VOLUME } from "@/constants/contract-catalog";
import { useCivoraTheme } from "@/providers/theme-provider";
import {
  CivoraNotification,
  CivoraReport,
  EngineeringTask,
  FieldSubmissionDraft,
  FieldSubmissionRecord,
  MilestoneItem,
  ProjectDocument,
  ProjectStatus,
  ProjectSummary,
} from "@/types/contracts";

/**
 * Adaptive Civora Brand Logo
 * Automatically switches between `brand_logo.png` (Light mode) and `brand_logo_white.png` (Dark mode).
 */
export function CivoraBrandHeaderLogo({
  size = "md",
  forceDark,
}: {
  size?: "sm" | "md" | "lg";
  forceDark?: boolean;
}) {
  const { isDark } = useCivoraTheme();
  const useWhiteLogo = forceDark ?? isDark;

  const dimensions =
    size === "lg"
      ? { width: 166, height: 44 }
      : size === "sm"
        ? { width: 106, height: 28 }
        : { width: 136, height: 36 };

  return (
    <Image
      source={
        useWhiteLogo
          ? require("../../../assets/brand/brand_logo_white.png")
          : require("../../../assets/brand/brand_logo.png")
      }
      style={dimensions}
      contentFit="contain"
      accessibilityLabel="Civora Official Logo"
    />
  );
}

/**
 * Circular Progress Ring inspired by Reference Image 4 ("Your Weekly Progress" card)
 */
export function CircularProgressRing({
  percent,
  centerLabel,
  subLabel,
  size = 76,
}: {
  percent: number;
  centerLabel: string;
  subLabel: string;
  size?: number;
}) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, percent));
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  return (
    <View
      style={{ width: size, height: size }}
      className="items-center justify-center"
    >
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.22)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#4FAAA7"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View className="absolute items-center justify-center">
        <Text className="text-sm font-extrabold text-white">{centerLabel}</Text>
        <Text className="text-[9px] font-medium text-slate-200">{subLabel}</Text>
      </View>
    </View>
  );
}

/**
 * Hero Weekly Progress Card combining Reference Image 4's layout with Civora's Midnight/Teal brand palette
 */
export function HeroWeeklyProgressCard({
  eyebrow,
  title,
  subtitle,
  percent,
  ringCenterLabel,
  ringSubLabel,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  percent: number;
  ringCenterLabel: string;
  ringSubLabel: string;
}) {
  return (
    <View className="flex-row items-center justify-between rounded-3xl border border-civora-teal/30 bg-civora-midnight p-5 shadow-sm dark:bg-civora-steel">
      <View className="flex-1 pr-4">
        <View className="flex-row items-center gap-1.5">
          <View className="h-5 w-5 items-center justify-center rounded-full bg-civora-teal/20">
            <Zap size={12} color="#4FAAA7" />
          </View>
          <Text className="text-xs font-semibold text-civora-teal">
            {eyebrow}
          </Text>
        </View>
        <Text className="mt-2 text-xl font-extrabold leading-6 text-white">
          {title}
        </Text>
        <Text className="mt-1 text-xs text-slate-300">{subtitle}</Text>
      </View>

      <CircularProgressRing
        percent={percent}
        centerLabel={ringCenterLabel}
        subLabel={ringSubLabel}
      />
    </View>
  );
}

/**
 * Bento 2-Column KPI Stat Card inspired by Reference Image 4 + Civora Web Dashboard KPI Cards
 */
export function BentoStatCard({
  label,
  value,
  unit,
  trendText,
  accent = "teal",
  onPress,
}: {
  label: string;
  value: string;
  unit?: string;
  trendText?: string;
  accent?: "teal" | "blue" | "midnight";
  onPress?: () => void;
}) {
  const iconBg =
    accent === "teal"
      ? "bg-civora-teal/15"
      : accent === "blue"
        ? "bg-civora-blue/15"
        : "bg-civora-midnight/10 dark:bg-white/10";

  const iconColor =
    accent === "teal"
      ? "#4FAAA7"
      : accent === "blue"
        ? "#3B68DE"
        : "#001237";

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="min-w-[46%] flex-1 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs active:opacity-85 dark:border-slate-800 dark:bg-civora-steel"
    >
      <View className="flex-row items-start justify-between">
        <Text className="flex-1 pr-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
          {label}
        </Text>
        <View
          className={`h-8 w-8 items-center justify-center rounded-full ${iconBg}`}
        >
          {accent === "teal" ? (
            <ShieldCheck size={15} color={iconColor} />
          ) : accent === "blue" ? (
            <FileCheck2 size={15} color={iconColor} />
          ) : (
            <FolderKanban size={15} color="#4FAAA7" />
          )}
        </View>
      </View>

      <View className="mt-3 flex-row items-baseline gap-1">
        <Text className="text-2xl font-extrabold text-civora-midnight dark:text-white">
          {value}
        </Text>
        {unit ? (
          <Text className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {unit}
          </Text>
        ) : null}
      </View>

      {trendText ? (
        <View className="mt-1.5 flex-row items-center gap-1">
          <ArrowUpRight size={12} color="#16A34A" />
          <Text className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            {trendText}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

/**
 * Interactive Horizontal Week Schedule Strip inspired by Reference Image 4 ("August 2025 / October 2026" pill selector)
 */
export function WeekCalendarStrip({
  monthLabel = "October 2026 — Site Cadence",
}: {
  monthLabel?: string;
}) {
  const [selectedIndex, setSelectedIndex] = useState(3); // Wednesday 28

  return (
    <View className="rounded-2xl border border-slate-200/90 bg-white p-4 dark:border-slate-800 dark:bg-civora-steel">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-sm font-extrabold text-civora-midnight dark:text-white">
          {monthLabel}
        </Text>
        <View className="rounded-full bg-civora-teal/15 px-2.5 py-0.5">
          <Text className="text-[10px] font-bold text-civora-teal">
            Week 43
          </Text>
        </View>
      </View>

      <View className="flex-row justify-between">
        {WEEKLY_SUBMITTAL_VOLUME.map((item, idx) => {
          const isSelected = selectedIndex === idx;
          return (
            <Pressable
              key={item.day}
              accessibilityRole="button"
              onPress={() => setSelectedIndex(idx)}
              className={`items-center rounded-full px-2.5 py-2 ${
                isSelected
                  ? "bg-civora-teal"
                  : "bg-transparent"
              }`}
            >
              <Text
                className={`text-[11px] font-semibold ${
                  isSelected
                    ? "text-civora-midnight"
                    : "text-slate-400 dark:text-slate-400"
                }`}
              >
                {item.shortDay}
              </Text>
              <Text
                className={`mt-1 text-xs font-extrabold ${
                  isSelected
                    ? "text-civora-midnight"
                    : "text-civora-midnight dark:text-white"
                }`}
              >
                {item.dateNum}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/**
 * Submittal Volume & Ingestion Bar Chart combining Reference Image 4 ("Statistic" vertical bar chart)
 * and Civora Web Dashboard's `WEEK_BARS` chart!
 */
export function SubmittalVolumeBarChart() {
  const [activeIdx, setActiveIdx] = useState(3); // Wednesday

  return (
    <View className="rounded-2xl border border-slate-200/90 bg-white p-4 dark:border-slate-800 dark:bg-civora-steel">
      <View className="flex-row items-baseline justify-between">
        <View>
          <Text className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Submittal & Ingestion Volume
          </Text>
          <View className="mt-1 flex-row items-baseline gap-1.5">
            <Text className="text-2xl font-extrabold text-civora-midnight dark:text-white">
              4,790
            </Text>
            <Text className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              +8% vs last week
            </Text>
          </View>
        </View>
        <Text className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
          Target: <Text className="font-bold text-civora-teal">600/day</Text>
        </Text>
      </View>

      <View className="mt-5 flex-row items-end justify-between h-36 px-1">
        {WEEKLY_SUBMITTAL_VOLUME.map((bar, idx) => {
          const isSelected = activeIdx === idx;
          return (
            <Pressable
              key={bar.day}
              accessibilityRole="button"
              onPress={() => setActiveIdx(idx)}
              className="flex-1 items-center justify-end h-full px-1"
            >
              <Text
                className={`mb-1 text-[10px] font-bold ${
                  isSelected
                    ? "text-civora-midnight dark:text-civora-teal"
                    : "text-slate-400"
                }`}
              >
                {bar.percent}%
              </Text>
              <View className="w-4 flex-1 justify-end overflow-hidden rounded-full bg-slate-100 dark:bg-civora-midnight">
                <View
                  style={{ height: `${bar.percent}%` }}
                  className={`w-full rounded-full ${
                    isSelected
                      ? "bg-civora-teal"
                      : "bg-civora-blue/40 dark:bg-civora-blue/50"
                  }`}
                />
              </View>
              <Text
                className={`mt-2 text-[11px] ${
                  isSelected
                    ? "font-extrabold text-civora-midnight dark:text-white"
                    : "font-medium text-slate-400"
                }`}
              >
                {bar.day}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onActionPress,
}: {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onActionPress?: () => void;
}) {
  return (
    <View className="mb-2.5 flex-row items-center justify-between gap-2">
      <View className="flex-1">
        <Text className="text-base font-extrabold text-civora-midnight dark:text-white">
          {title}
        </Text>
        {subtitle ? (
          <Text className="mt-0.5 text-xs text-slate-500 dark:text-slate-300">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {actionLabel && onActionPress ? (
        <Pressable
          accessibilityRole="button"
          onPress={onActionPress}
          className="min-h-[34px] flex-row items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-1.5 dark:border-civora-teal/50 dark:bg-civora-midnight"
        >
          <Text className="text-xs font-bold text-civora-midnight dark:text-civora-teal">
            {actionLabel}
          </Text>
          <ChevronRight size={13} color="#4FAAA7" />
        </Pressable>
      ) : null}
    </View>
  );
}

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const styles: Record<
    ProjectStatus,
    { bg: string; text: string; label: string }
  > = {
    active: {
      bg: "bg-emerald-50 border-emerald-200 dark:bg-emerald-500/20 dark:border-emerald-500/50",
      text: "text-emerald-700 dark:text-emerald-300",
      label: "Active Build",
    },
    planning: {
      bg: "bg-sky-50 border-sky-200 dark:bg-sky-500/20 dark:border-sky-500/50",
      text: "text-sky-700 dark:text-sky-300",
      label: "Planning",
    },
    on_hold: {
      bg: "bg-amber-50 border-amber-200 dark:bg-amber-500/20 dark:border-amber-500/50",
      text: "text-amber-700 dark:text-amber-300",
      label: "On Hold",
    },
    completed: {
      bg: "bg-teal-50 border-teal-200 dark:bg-civora-teal/20 dark:border-civora-teal/50",
      text: "text-teal-700 dark:text-civora-teal",
      label: "Completed",
    },
  };
  const cfg = styles[status];
  return (
    <View className={`rounded-full border px-2.5 py-0.5 ${cfg.bg}`}>
      <Text className={`text-[10px] font-bold uppercase ${cfg.text}`}>
        {cfg.label}
      </Text>
    </View>
  );
}

export function ProjectCard({
  project,
  onPress,
}: {
  project: ProjectSummary;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open project ${project.name}`}
      onPress={onPress}
      className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs active:opacity-85 dark:border-slate-800 dark:bg-civora-steel"
    >
      <View className="flex-row items-center justify-between gap-2">
        <Text className="text-xs font-extrabold uppercase tracking-wider text-civora-teal">
          {project.code}
        </Text>
        <ProjectStatusBadge status={project.status} />
      </View>

      <Text className="mt-1.5 text-base font-extrabold text-civora-midnight dark:text-white">
        {project.name}
      </Text>
      <Text className="mt-0.5 text-xs text-slate-500 dark:text-slate-300">
        {project.location}
        {project.phaseLabel ? ` · ${project.phaseLabel}` : ""}
      </Text>

      <View className="mt-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-xs font-medium text-slate-600 dark:text-slate-300">
            Verified Physical Progress
          </Text>
          <Text className="text-xs font-extrabold text-civora-teal">
            {project.completionPercent}%
          </Text>
        </View>
        <View className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-civora-midnight">
          <View
            style={{
              width: `${Math.min(100, Math.max(0, project.completionPercent))}%`,
            }}
            className="h-full rounded-full bg-civora-teal"
          />
        </View>
      </View>
    </Pressable>
  );
}

export function MilestoneRow({ milestone }: { milestone: MilestoneItem }) {
  const statusLabels: Record<MilestoneItem["status"], string> = {
    completed: "Completed",
    in_progress: "In Progress",
    upcoming: "Upcoming",
    delayed: "Delayed",
  };

  return (
    <View className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-700 dark:bg-civora-midnight">
      <View className="flex-row items-center justify-between gap-2">
        <Text className="flex-1 text-sm font-bold text-civora-midnight dark:text-white">
          {milestone.title}
        </Text>
        <Text className="text-xs font-extrabold text-civora-teal">
          {milestone.progressPercent}%
        </Text>
      </View>
      <Text className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Target: {milestone.dueDateIso} · Status: {statusLabels[milestone.status]}
      </Text>
    </View>
  );
}

export function TaskCard({
  task,
  onPress,
}: {
  task: EngineeringTask;
  onPress?: () => void;
}) {
  const priorityColors: Record<EngineeringTask["priority"], string> = {
    critical:
      "bg-red-50 border-red-200 dark:bg-red-500/20 dark:border-red-500/40",
    high: "bg-amber-50 border-amber-200 dark:bg-amber-500/20 dark:border-amber-500/40",
    medium:
      "bg-sky-50 border-sky-200 dark:bg-sky-500/20 dark:border-sky-500/40",
    low: "bg-slate-100 border-slate-200 dark:bg-slate-700 dark:border-slate-600",
  };

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="flex-row items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3.5 active:opacity-85 dark:border-slate-700 dark:bg-civora-midnight"
    >
      <View className="flex-1 pr-3">
        <View className="flex-row items-center gap-2">
          <View
            className={`rounded-full border px-2 py-0.5 ${priorityColors[task.priority]}`}
          >
            <Text className="text-[10px] font-bold uppercase text-civora-midnight dark:text-white">
              {task.priority}
            </Text>
          </View>
          <Text className="text-[11px] font-bold uppercase text-civora-teal">
            {task.status.replace("_", " ")}
          </Text>
        </View>
        <Text className="mt-1.5 text-sm font-bold text-civora-midnight dark:text-white">
          {task.title}
        </Text>
        <Text className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          Due: {task.dueAtIso.slice(0, 10)} · {task.assignedToName ?? "Assigned"}
        </Text>
      </View>

      <View className="h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white dark:border-slate-700 dark:bg-civora-steel">
        <Plus size={16} color="#4FAAA7" />
      </View>
    </Pressable>
  );
}

export function SubmissionCard({
  draft,
  record,
  onPress,
}: {
  draft?: FieldSubmissionDraft;
  record?: FieldSubmissionRecord;
  onPress?: () => void;
}) {
  if (draft) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 active:opacity-85 dark:border-slate-700 dark:bg-civora-midnight"
      >
        <Text className="text-sm font-bold text-civora-midnight dark:text-white">
          {draft.title}
        </Text>
        <Text className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          Project: {draft.projectId} · Category: {draft.category}
        </Text>
        <View className="mt-2">
          <SyncStateBadge state={draft.syncState} />
        </View>
      </Pressable>
    );
  }

  if (record) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        className="flex-row items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3.5 active:opacity-85 dark:border-slate-700 dark:bg-civora-midnight"
      >
        <View className="flex-1 pr-3">
          <View className="flex-row items-center gap-2">
            <Text className="text-xs font-extrabold text-civora-blue dark:text-civora-teal">
              {record.clientSubmissionId}
            </Text>
            <Text className="text-[11px] font-bold uppercase text-emerald-600 dark:text-emerald-300">
              {record.status} · v{record.serverVersion}
            </Text>
          </View>
          <Text className="mt-1 text-sm font-bold text-civora-midnight dark:text-white">
            {record.title}
          </Text>
          <Text
            className="mt-0.5 text-xs text-slate-500 dark:text-slate-300"
            numberOfLines={2}
          >
            {record.notes}
          </Text>
        </View>
        <View className="h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white dark:border-slate-700 dark:bg-civora-steel">
          <ChevronRight size={16} color="#4FAAA7" />
        </View>
      </Pressable>
    );
  }

  return null;
}

export function ReportCard({
  report,
  onPress,
}: {
  report: CivoraReport;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="rounded-2xl border border-slate-200 bg-slate-50 p-4 active:opacity-85 dark:border-slate-700 dark:bg-civora-midnight"
    >
      <View className="flex-row items-center justify-between">
        <View className="rounded-full bg-emerald-100 px-2.5 py-0.5 dark:bg-emerald-500/20">
          <Text className="text-[10px] font-bold uppercase text-emerald-800 dark:text-emerald-300">
            {report.visibilityStatus} · v{report.version}
          </Text>
        </View>
        <Text className="text-xs text-slate-500 dark:text-slate-400">
          {report.periodLabel ?? report.projectId}
        </Text>
      </View>
      <Text className="mt-2 text-sm font-bold text-civora-midnight dark:text-white">
        {report.title}
      </Text>
      <Text
        className="mt-1 text-xs text-slate-600 dark:text-slate-300"
        numberOfLines={2}
      >
        {report.summary}
      </Text>
    </Pressable>
  );
}

export function DocumentRow({
  doc,
  onPress,
}: {
  doc: ProjectDocument;
  onPress?: () => void;
}) {
  const sizeMb = (doc.sizeBytes / (1024 * 1024)).toFixed(2);
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 active:opacity-85 dark:border-slate-700 dark:bg-civora-midnight"
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-xs font-bold uppercase text-civora-teal">
          {doc.category.replace("_", " ")} · {doc.versionLabel}
        </Text>
        <Text className="text-xs text-slate-500 dark:text-slate-400">
          {sizeMb} MB
        </Text>
      </View>
      <Text className="mt-1 text-sm font-bold text-civora-midnight dark:text-white">
        {doc.title}
      </Text>
    </Pressable>
  );
}

export function NotificationRow({
  notification,
  onPress,
}: {
  notification: CivoraNotification;
  onPress?: () => void;
}) {
  const router = useRouter();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        onPress?.();
        router.push(notification.deepLinkPath as never);
      }}
      className={`rounded-xl border p-3.5 ${
        notification.read
          ? "border-slate-200 bg-white/70 dark:border-slate-800 dark:bg-civora-midnight/70"
          : "border-civora-teal/60 bg-white dark:bg-civora-midnight"
      }`}
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-xs font-bold uppercase text-civora-teal">
          {notification.category.replace("_", " ")}
        </Text>
        {!notification.read ? (
          <View className="rounded-full bg-civora-blue px-2 py-0.5">
            <Text className="text-[10px] font-bold text-white">NEW</Text>
          </View>
        ) : null}
      </View>
      <Text className="mt-1 text-sm font-bold text-civora-midnight dark:text-white">
        {notification.title}
      </Text>
      <Text className="mt-1 text-xs text-slate-600 dark:text-slate-300">
        {notification.body}
      </Text>
    </Pressable>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <View className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-5 dark:border-slate-700 dark:bg-civora-midnight/50">
      <Text className="text-center text-sm font-bold text-civora-midnight dark:text-slate-200">
        {title}
      </Text>
      <Text className="mt-1 text-center text-xs text-slate-500 dark:text-slate-400">
        {description}
      </Text>
    </View>
  );
}
