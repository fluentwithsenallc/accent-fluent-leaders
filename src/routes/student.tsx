import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  Bell,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  Car,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  EyeOff,
  FileText,
  Flag,
  Flame,
  Home,
  Library,
  Loader2,
  LogOut,
  Moon,
  Play,
  Plus,
  Settings,
  Smile,
  User,
  Video,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { mergeReferenceContent, playlistItemsFor } from "../lib/content-library";
import {
  appLanguageLocale,
  currentAppLanguage,
  LanguageToggle,
  translateCurrent,
  useTranslate,
} from "../lib/language";
import { hasSupabaseEnv, supabase } from "../lib/supabase";

export const Route = createFileRoute("/student")({
  head: () => ({
    meta: [
      { title: "Student Dashboard - Fluent with Sena" },
      {
        name: "description",
        content: "Fluent with Sena student dashboard.",
      },
    ],
  }),
  component: StudentPortal,
});

type PortalScreen =
  | "dashboard"
  | "week"
  | "progress"
  | "checkins"
  | "milestones"
  | "courses"
  | "library"
  | "recordings"
  | "sessions"
  | "journals"
  | "settings";

type Profile = {
  id: string;
  role: "admin" | "student";
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  whatsapp: string | null;
  timezone: string | null;
  avatar_url: string | null;
};

type Student = {
  id: string;
  industry: string | null;
  current_week: number;
  start_date: string | null;
  end_date: string | null;
  status: string;
  confidence_score: number | null;
};

type DashboardStat = {
  student_id: string;
  current_week: number;
  confidence_score: number | null;
  tier_name: string | null;
  total_sessions: number | null;
  sessions_completed: number | null;
  lessons_completed: number | null;
  hours_learned: number | null;
  next_session_at: string | null;
  pending_checkins: number | null;
};

type CheckIn = {
  id: string;
  student_id: string;
  week_number: number;
  submitted_at: string;
  mood: string | null;
  mood_emoji: string | null;
  confidence_score: number | null;
  win_of_week: string | null;
  biggest_struggle: string | null;
  first_this_week: string | null;
  note_for_next: string | null;
  admin_note: string | null;
  reviewed_at: string | null;
  status: "pending" | "reviewed";
};

type LiveSession = {
  id: string;
  student_id: string;
  week_number: number;
  session_number: number;
  scheduled_at: string;
  duration_minutes: number;
  focus_topic: string | null;
  status: "scheduled" | "live" | "completed" | "cancelled" | "no_show";
  zoom_join_url: string | null;
  zoom_start_url: string | null;
  recording_url: string | null;
  session_notes: string | null;
};

type Recording = {
  id: string;
  session_id: string | null;
  student_id: string;
  title: string;
  recorded_at: string | null;
  duration_seconds: number | null;
  video_url: string | null;
  transcript_text: string | null;
};

type Lesson = {
  id: string;
  unit_id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  duration_seconds: number | null;
  sort_order: number | null;
};

type Unit = {
  id: string;
  course_id: string;
  title: string;
  sort_order: number | null;
  lessons: Lesson[];
};

type Course = {
  id: string;
  title: string;
  category: string | null;
  description: string | null;
  thumbnail_url: string | null;
  avg_lesson_minutes: number | null;
  status: "published" | "draft";
  sort_order: number | null;
  units: Unit[];
};

type LessonProgress = {
  id: string;
  student_id: string;
  lesson_id: string;
  status: "not_started" | "in_progress" | "completed";
  progress_pct: number | null;
  last_watched_at: string | null;
  completed_at: string | null;
};

type ContentItem = {
  id: string;
  title: string;
  author_or_host: string | null;
  media_type: string;
  cefr_level: string | null;
  external_url: string | null;
  description: string | null;
  duration_label: string | null;
  genre_tag: string | null;
  playlist_tag: string | null;
  thumbnail_url: string | null;
  sort_order?: number | null;
};

type Objective = {
  id: string;
  week_number: number;
  week_label: string | null;
  focus_title: string;
  context_for_student: string | null;
  completed?: boolean | null;
  sent_at?: string | null;
};

type ObjectiveItem = {
  id: string;
  objective_id: string;
  item_text: string;
  completed: boolean;
  completed_at: string | null;
};

type JournalEntry = {
  id: string;
  student_id: string;
  entry_type: "phrase_bank" | "question" | "session_note";
  week_number: number | null;
  topic: string | null;
  content: string;
  context_note: string | null;
  created_at: string;
};

type Milestone = {
  id: string;
  student_id: string;
  title: string;
  description: string | null;
  target_week: number | null;
  target_date: string | null;
  completed: boolean;
  completed_at: string | null;
  sort_order: number | null;
};

type StudentGoal = {
  id: string;
  student_id: string;
  fluency_goal: string;
  day_one_question: string | null;
};

type PortalData = {
  profile: Profile;
  student: Student | null;
  stats: DashboardStat | null;
  checkIns: CheckIn[];
  sessions: LiveSession[];
  recordings: Recording[];
  courses: Course[];
  progress: LessonProgress[];
  content: ContentItem[];
  objectives: Objective[];
  objectiveItems: ObjectiveItem[];
  journals: JournalEntry[];
  milestones: Milestone[];
  goal: StudentGoal | null;
};

const AUTH_REQUIRED = "AUTH_REQUIRED";
const STUDENT_REQUIRED = "STUDENT_REQUIRED";

const navItems = [
  { id: "dashboard" as const, label: "Dashboard", icon: Home, group: "My Program" },
  { id: "week" as const, label: "This Week", icon: Check, group: "My Program" },
  { id: "progress" as const, label: "My Progress", icon: Clock3, group: "My Program" },
  { id: "milestones" as const, label: "Milestones", icon: Flag, group: "My Program" },
  { id: "recordings" as const, label: "Recordings", icon: Video, group: "My Program" },
  { id: "sessions" as const, label: "Live Sessions", icon: CalendarDays, group: "My Program" },
  { id: "journals" as const, label: "Journal", icon: FileText, group: "My Program" },
  { id: "courses" as const, label: "Course Library", icon: BookOpen, group: "Explore" },
  { id: "library" as const, label: "Content Library", icon: Library, group: "Explore" },
  { id: "checkins" as const, label: "Weekly Check-In", icon: Bell, group: "Explore" },
  { id: "settings" as const, label: "Settings", icon: Settings, group: "Account" },
];

const timezones = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Mexico_City",
  "America/Bogota",
  "Europe/Madrid",
];

const checkInMoods = [
  { value: "on_fire", emoji: "🔥", label: "On Fire" },
  { value: "lit_up", emoji: "✨", label: "Lit Up" },
  { value: "meh", emoji: "🙂", label: "Steady" },
  { value: "struggling", emoji: "🌧", label: "Struggling" },
] as const;

function fullName(profile?: Profile | null) {
  if (!profile) return translateCurrent("Student", "Estudiante");
  return [profile.first_name, profile.last_name].filter(Boolean).join(" ") || profile.email;
}

function firstName(profile?: Profile | null) {
  return fullName(profile).split(" ")[0] || translateCurrent("friend", "amigo");
}

function initials(profile?: Profile | null) {
  const name = fullName(profile);
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function currentWeekNumber(data: Pick<PortalData, "student" | "stats">) {
  return data.student?.current_week ?? data.stats?.current_week ?? 1;
}

function weekLabel(week: number) {
  return `${translateCurrent("Week", "Semana")} ${week}`;
}

function weekShortLabel(week?: number | null) {
  return week ? `${translateCurrent("Wk", "Sem")} ${week}` : `${translateCurrent("Wk", "Sem")} -`;
}

function sessionLabelNumber(sessionNumber: number) {
  return `${translateCurrent("Session", "Sesion")} ${sessionNumber}`;
}

function weekSessionLabel(weekNumber: number, sessionNumber: number) {
  return `${weekLabel(weekNumber)} · ${sessionLabelNumber(sessionNumber)}`;
}

function studentTierName(data: Pick<PortalData, "stats">) {
  return data.stats?.tier_name ?? translateCurrent("Student Program", "Programa del estudiante");
}

function remainingWeeks(student?: Student | null) {
  if (!student?.end_date) return null;
  const diff = new Date(student.end_date).getTime() - Date.now();
  if (Number.isNaN(diff)) return null;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24 * 7)));
}

function programSubtitle(data: Pick<PortalData, "student" | "stats">) {
  const week = currentWeekNumber(data);
  const remaining = remainingWeeks(data.student);
  if (currentAppLanguage() === "es") {
    return `${studentTierName(data)} · Semana ${week}${
      remaining !== null ? ` · ${remaining} semanas restantes` : ""
    }`;
  }
  return `${studentTierName(data)} · Week ${week}${
    remaining !== null ? ` · ${remaining} weeks remaining` : ""
  }`;
}

function displayProgramName(tierName?: string | null) {
  if (!tierName) return translateCurrent("Student Program", "Programa del estudiante");
  if (/program/i.test(tierName)) {
    return currentAppLanguage() === "es" ? tierName.replace(/program/i, "Programa") : tierName;
  }
  return currentAppLanguage() === "es" ? `Programa ${tierName}` : `${tierName} Program`;
}

function dashboardProgramSubtitle(data: Pick<PortalData, "student" | "stats">) {
  const week = currentWeekNumber(data);
  const remaining = remainingWeeks(data.student);
  const base =
    currentAppLanguage() === "es"
      ? `Semana ${week} · ${displayProgramName(data.stats?.tier_name)}`
      : `Week ${week} · ${displayProgramName(data.stats?.tier_name)}`;
  if (remaining === null) return base;
  return currentAppLanguage() === "es"
    ? `${base} · ${remaining} semanas restantes`
    : `${base} · ${remaining} weeks remaining`;
}

function dashboardLevelMeta(tierName?: string | null) {
  const tier = (tierName ?? "").toLowerCase();
  if (tier.includes("launch")) {
    return { value: "A2", label: translateCurrent("Foundational", "Fundacional") };
  }
  if (tier.includes("build")) {
    return { value: "B1", label: translateCurrent("Intermediate", "Intermedio") };
  }
  if (tier.includes("lead")) {
    return { value: "B2", label: translateCurrent("Advanced", "Avanzado") };
  }
  return { value: tierName ?? "--", label: translateCurrent("In progress", "En progreso") };
}

function studentProgramWeeks(tierName?: string | null) {
  const tier = (tierName ?? "").toLowerCase();
  if (tier.includes("launch")) return 12;
  if (tier.includes("lead")) return 20;
  return 16;
}

function progressPercent(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function milestoneMetaLine(milestone: Milestone) {
  const parts: string[] = [];
  if (milestone.target_week) {
    parts.push(`${translateCurrent("Week", "Semana")} ${milestone.target_week}`);
  }
  if (milestone.target_date) parts.push(formatMonthDay(milestone.target_date));
  return parts.join(" - ") || translateCurrent("Upcoming milestone", "Proximo hito");
}

function formatMonthDay(value?: string | null) {
  if (!value) return translateCurrent("Today", "Hoy");
  return new Intl.DateTimeFormat(appLanguageLocale(), {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function formatMonthDayUpper(value?: string | null) {
  return formatMonthDay(value).toUpperCase();
}

function formatConfidenceValue(value?: number | null) {
  if (typeof value !== "number") return "--";
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function dashboardObjectiveMeta(text: string, completed: boolean) {
  void completed;
  const normalized = text.toLowerCase();
  if (normalized.includes("listen") || normalized.includes("podcast")) return "12 min";
  if (normalized.includes("practice")) return "10 min";
  if (normalized.includes("narrat")) {
    return translateCurrent("During your shifts", "Durante tus turnos");
  }
  if (normalized.includes("watch") || normalized.includes("video")) return "6 min";
  return translateCurrent("This week", "Esta semana");
}

function pickDashboardItemsByTitle(
  items: ContentItem[],
  mediaType: string,
  preferredTitles: string[],
  limit: number,
) {
  const typed = items
    .filter((item) => item.media_type === mediaType)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const byTitle = new Map(typed.map((item) => [item.title.toLowerCase(), item]));
  const seen = new Set<string>();
  const ordered: ContentItem[] = [];

  for (const title of preferredTitles) {
    const match = byTitle.get(title.toLowerCase());
    if (!match || seen.has(match.id)) continue;
    ordered.push(match);
    seen.add(match.id);
  }

  for (const item of typed) {
    if (ordered.length >= limit) break;
    if (seen.has(item.id)) continue;
    ordered.push(item);
    seen.add(item.id);
  }

  return ordered.slice(0, limit);
}

function greetingForNow() {
  const hour = new Date().getHours();
  if (hour < 12) return translateCurrent("Good morning", "Buenos dias");
  if (hour < 18) return translateCurrent("Good afternoon", "Buenas tardes");
  return translateCurrent("Good evening", "Buenas noches");
}

function formatDate(value?: string | null) {
  if (!value) return translateCurrent("Not scheduled", "Sin programar");
  return new Intl.DateTimeFormat(appLanguageLocale(), {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateTime(value?: string | null, timezone = "America/New_York") {
  if (!value) return translateCurrent("Not scheduled", "Sin programar");
  return new Intl.DateTimeFormat(appLanguageLocale(), {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: timezone,
    timeZoneName: "short",
  }).format(new Date(value));
}

function formatDuration(seconds?: number | null, minutes?: number | null) {
  if (minutes) return `${minutes} min`;
  if (!seconds) return translateCurrent("Session replay", "Repeticion de sesion");
  const totalMinutes = Math.max(1, Math.round(seconds / 60));
  return totalMinutes >= 60
    ? `${Math.floor(totalMinutes / 60)} ${translateCurrent("hr", "h")} ${
        totalMinutes % 60 ? `${totalMinutes % 60} min` : ""
      }`
    : `${totalMinutes} min`;
}

function getCountdown(value?: string | null) {
  if (!value) return "";
  const diff = new Date(value).getTime() - Date.now();
  if (diff <= 0) return translateCurrent("Starting soon", "Empieza pronto");
  const hours = Math.floor(diff / 36e5);
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  if (days > 0) {
    return currentAppLanguage() === "es"
      ? `${days} dia${days === 1 ? "" : "s"}, ${remainingHours} hora${remainingHours === 1 ? "" : "s"}`
      : `${days} day${days === 1 ? "" : "s"}, ${remainingHours} hour${remainingHours === 1 ? "" : "s"}`;
  }
  const nextHours = Math.max(1, hours);
  return currentAppLanguage() === "es"
    ? `${nextHours} hora${nextHours === 1 ? "" : "s"}`
    : `${nextHours} hour${nextHours === 1 ? "" : "s"}`;
}

function studentNavGroupLabel(group: "My Program" | "Explore" | "Account") {
  if (group === "My Program") return translateCurrent("My Program", "Mi programa");
  if (group === "Explore") return translateCurrent("Explore", "Explorar");
  return translateCurrent("Account", "Cuenta");
}

function studentNavItemLabel(screen: PortalScreen) {
  if (screen === "dashboard") return translateCurrent("Dashboard", "Panel");
  if (screen === "week") return translateCurrent("This Week", "Esta semana");
  if (screen === "progress") return translateCurrent("My Progress", "Mi progreso");
  if (screen === "milestones") return translateCurrent("Milestones", "Hitos");
  if (screen === "recordings") return translateCurrent("Recordings", "Grabaciones");
  if (screen === "sessions") return translateCurrent("Live Sessions", "Sesiones en vivo");
  if (screen === "journals") return translateCurrent("Journal", "Diario");
  if (screen === "courses") return translateCurrent("Course Library", "Biblioteca de cursos");
  if (screen === "library") {
    return translateCurrent("Content Library", "Biblioteca de contenido");
  }
  if (screen === "checkins") return translateCurrent("Weekly Check-In", "Check-in semanal");
  return translateCurrent("Settings", "Configuracion");
}

function lessonsFor(course: Course) {
  return course.units
    .flatMap((unit) => unit.lessons.map((lesson) => ({ ...lesson, unitTitle: unit.title })))
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}

function courseProgress(course: Course, progress: LessonProgress[]) {
  const lessons = lessonsFor(course);
  if (!lessons.length) return 0;
  const byLesson = new Map(progress.map((item) => [item.lesson_id, item]));
  const total = lessons.reduce(
    (sum, lesson) => sum + (byLesson.get(lesson.id)?.progress_pct ?? 0),
    0,
  );
  return Math.round(total / lessons.length);
}

function objectiveItemsFor(objectiveId: string, items: ObjectiveItem[]) {
  return items
    .filter((item) => item.objective_id === objectiveId)
    .sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1));
}

function milestoneIsComplete(milestone: Milestone, student?: Student | null) {
  if (milestone.completed) return true;
  if (milestone.target_week && student) return student.current_week > milestone.target_week;
  if (milestone.target_date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(milestone.target_date);
    target.setHours(0, 0, 0, 0);
    return target < today;
  }
  return false;
}

function moodMeta(value?: string | null) {
  return checkInMoods.find((item) => item.value === value) ?? null;
}

function moodLabel(value: (typeof checkInMoods)[number]["value"]) {
  if (value === "on_fire") return translateCurrent("On Fire", "A tope");
  if (value === "lit_up") return translateCurrent("Lit Up", "Con energia");
  if (value === "meh") return translateCurrent("Steady", "Estable");
  return translateCurrent("Struggling", "Con dificultad");
}

function formatMediaType(value: string) {
  if (value === "show") return translateCurrent("Show", "Serie");
  if (value === "movie") return translateCurrent("Movie", "Pelicula");
  if (value === "music") return translateCurrent("Music", "Musica");
  if (value === "podcast") return translateCurrent("Podcast", "Podcast");
  if (value === "book") return translateCurrent("Book", "Libro");
  if (value === "reading_source") return translateCurrent("Reading source", "Fuente de lectura");
  if (value === "playlist") return translateCurrent("Playlist", "Lista");
  return value.replaceAll("_", " ");
}

async function fetchPortalData(): Promise<PortalData> {
  if (!supabase) throw new Error("Student dashboard is not ready yet.");
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw new Error(AUTH_REQUIRED);
  const userId = authData.user?.id;
  if (!userId) throw new Error(AUTH_REQUIRED);

  const profileQuery = supabase.from("profiles").select("*").eq("id", userId).single();
  const studentQuery = supabase.from("students").select("*").eq("id", userId).maybeSingle();
  const statsQuery = supabase
    .from("student_dashboard_stats")
    .select("*")
    .eq("student_id", userId)
    .maybeSingle();
  const checkInsQuery = supabase
    .from("check_ins")
    .select("*")
    .eq("student_id", userId)
    .order("week_number", { ascending: false })
    .order("submitted_at", { ascending: false });
  const sessionsQuery = supabase
    .from("live_sessions")
    .select("*")
    .eq("student_id", userId)
    .order("scheduled_at", { ascending: true });
  const recordingsQuery = supabase
    .from("recordings")
    .select("*")
    .eq("student_id", userId)
    .order("recorded_at", { ascending: false });
  const coursesQuery = supabase
    .from("courses")
    .select("*, units(*, lessons(*))")
    .eq("status", "published")
    .order("sort_order", { ascending: true });
  const progressQuery = supabase
    .from("student_lesson_progress")
    .select("*")
    .eq("student_id", userId);
  const contentQuery = supabase
    .from("content_items")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  const objectivesQuery = supabase
    .from("objectives")
    .select("*")
    .eq("student_id", userId)
    .order("week_number", { ascending: false });
  const objectiveItemsQuery = supabase.from("objective_items").select("*").order("sort_order");
  const journalsQuery = supabase
    .from("journal_entries")
    .select("*")
    .eq("student_id", userId)
    .order("week_number", { ascending: true })
    .order("created_at", { ascending: false });
  const milestonesQuery = supabase
    .from("milestones")
    .select("*")
    .eq("student_id", userId)
    .order("sort_order", { ascending: true })
    .order("target_week", { ascending: true });
  const goalQuery = supabase.from("student_goals").select("*").eq("student_id", userId).maybeSingle();

  const [
    profile,
    student,
    stats,
    checkIns,
    sessions,
    recordings,
    courses,
    progress,
    content,
    objectives,
    objectiveItems,
    journals,
    milestones,
    goal,
  ] = await Promise.all([
    profileQuery,
    studentQuery,
    statsQuery,
    checkInsQuery,
    sessionsQuery,
    recordingsQuery,
    coursesQuery,
    progressQuery,
    contentQuery,
    objectivesQuery,
    objectiveItemsQuery,
    journalsQuery,
    milestonesQuery,
    goalQuery,
  ]);

  if (profile.error) throw profile.error;
  if ((profile.data as Profile | null)?.role !== "student") {
    throw new Error(STUDENT_REQUIRED);
  }
  if (student.error) throw student.error;
  if (stats.error) throw stats.error;
  if (checkIns.error) throw checkIns.error;
  if (sessions.error) throw sessions.error;
  if (recordings.error) throw recordings.error;
  if (courses.error) throw courses.error;
  if (progress.error) throw progress.error;
  if (content.error) throw content.error;
  if (objectives.error) throw objectives.error;
  if (objectiveItems.error) throw objectiveItems.error;
  if (journals.error) throw journals.error;
  if (milestones.error) throw milestones.error;
  if (goal.error) throw goal.error;

  return {
    profile: profile.data as Profile,
    student: student.data as Student | null,
    stats: stats.data as DashboardStat | null,
    checkIns: (checkIns.data ?? []) as CheckIn[],
    sessions: (sessions.data ?? []) as LiveSession[],
    recordings: (recordings.data ?? []) as Recording[],
    courses: ((courses.data ?? []) as Course[]).map((course) => ({
      ...course,
      units: (course.units ?? []).map((unit) => ({
        ...unit,
        lessons: unit.lessons ?? [],
      })),
    })),
    progress: (progress.data ?? []) as LessonProgress[],
    content: (content.data ?? []) as ContentItem[],
    objectives: (objectives.data ?? []) as Objective[],
    objectiveItems: (objectiveItems.data ?? []) as ObjectiveItem[],
    journals: (journals.data ?? []) as JournalEntry[],
    milestones: (milestones.data ?? []) as Milestone[],
    goal: (goal.data as StudentGoal | null) ?? null,
  };
}

function StudentPortal() {
  const tr = useTranslate();
  const navigate = useNavigate();
  const [screen, setScreen] = useState<PortalScreen>("dashboard");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const query = useQuery({
    queryKey: ["student-portal"],
    queryFn: fetchPortalData,
    enabled: hasSupabaseEnv,
  });

  useEffect(() => {
    if (!(query.error instanceof Error)) return;
    if (query.error.message === AUTH_REQUIRED) {
      navigate({ to: "/signin" });
    }
    if (query.error.message === STUDENT_REQUIRED) {
      navigate({ to: "/admin" });
    }
  }, [navigate, query.error]);

  async function handleSignOut() {
    await supabase?.auth.signOut();
    await navigate({ to: "/signin" });
  }

  if (!hasSupabaseEnv) {
    return (
      <PortalMessage
        title={tr("Student dashboard is not ready yet", "El panel del estudiante aun no esta listo")}
        body={tr("Please contact Sena for access.", "Contacta a Sena para obtener acceso.")}
      />
    );
  }

  if (query.isLoading) {
    return (
      <PortalMessage
        title={tr("Loading your dashboard", "Cargando tu panel")}
        body={tr(
          "Getting your lessons, sessions, and recordings.",
          "Estamos cargando tus lecciones, sesiones y grabaciones.",
        )}
        loading
      />
    );
  }

  if (query.error instanceof Error) {
    const message =
      query.error.message === AUTH_REQUIRED
        ? tr(
            "Please sign in before opening your dashboard.",
            "Inicia sesion antes de abrir tu panel.",
          )
        : query.error.message === STUDENT_REQUIRED
          ? tr(
              "This dashboard is only available to student accounts.",
              "Este panel solo esta disponible para cuentas de estudiantes.",
            )
          : query.error.message;
    return (
      <PortalMessage
        title={tr("We could not open your dashboard", "No pudimos abrir tu panel")}
        body={message}
      />
    );
  }

  const data = query.data;
  if (!data) return null;
  const currentWeek = currentWeekNumber(data);
  const currentObjective = data.objectives.find((objective) => objective.week_number === currentWeek);
  const currentObjectiveItems = currentObjective
    ? objectiveItemsFor(currentObjective.id, data.objectiveItems)
    : [];
  const incompleteObjectiveCount = currentObjectiveItems.filter((item) => !item.completed).length;
  const navBadges: Partial<Record<PortalScreen, string>> = incompleteObjectiveCount
    ? { week: String(incompleteObjectiveCount) }
    : {};
  const navGroups = ["My Program", "Explore", "Account"] as const;

  function handleNav(next: PortalScreen) {
    setScreen(next);
    setSelectedCourse(null);
  }

  function renderContent() {
    if (screen === "courses" && selectedCourse) {
      return (
        <CourseDetailScreen
          data={data}
          course={selectedCourse}
          onBack={() => setSelectedCourse(null)}
        />
      );
    }
    if (screen === "week") return <ThisWeekScreen data={data} setScreen={handleNav} />;
    if (screen === "progress")
      return <ProgressScreen data={data} setScreen={handleNav} />;
    if (screen === "checkins") return <WeeklyCheckInScreen data={data} />;
    if (screen === "milestones") return <MilestonesScreen data={data} />;
    if (screen === "courses")
      return <CourseLibraryScreen data={data} onCourseClick={setSelectedCourse} />;
    if (screen === "library") return <ContentLibraryScreen data={data} />;
    if (screen === "recordings") return <RecordingsScreen data={data} />;
    if (screen === "sessions") return <LiveSessionsScreen data={data} />;
    if (screen === "journals") return <StudentJournalsScreen data={data} setScreen={handleNav} />;
    if (screen === "settings") return <SettingsScreen data={data} />;
    return <DashboardScreenV2 data={data} setScreen={handleNav} />;
  }

  return (
    <main className="student-dashboard">
      <aside className="student-sidebar">
        <div className="student-logo">
          <div className="student-logo-text">Fluent with Sena</div>
          <div className="student-logo-sub">{tr("Student Portal", "Portal del estudiante")}</div>
        </div>
        <div className="student-sidebar-user">
          <div className="student-sidebar-avatar">{initials(data.profile)}</div>
          <div>
            <div className="student-sidebar-name">{firstName(data.profile)}</div>
            <div className="student-sidebar-meta">
              {studentTierName(data)} · {tr("Week", "Semana")} {currentWeek}
            </div>
          </div>
        </div>
        <nav className="student-nav">
          {navGroups.map((group) => (
            <div key={group} className="student-nav-group">
              <div className="student-nav-group-label">{studentNavGroupLabel(group)}</div>
              {navItems
                .filter((item) => item.group === group)
                .map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNav(item.id)}
                      className={`student-nav-item ${screen === item.id ? "active" : ""}`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{studentNavItemLabel(item.id)}</span>
                      {navBadges[item.id] && (
                        <strong className="student-nav-badge">{navBadges[item.id]}</strong>
                      )}
                    </button>
                  );
                })}
            </div>
          ))}
        </nav>
        <div className="student-sidebar-foot">
          <button type="button" onClick={handleSignOut} className="student-nav-item">
            <LogOut className="h-4 w-4" />
            <span>{tr("Sign out", "Cerrar sesion")}</span>
          </button>
        </div>
      </aside>
      {renderContent()}
    </main>
  );
}

function PortalMessage({
  title,
  body,
  loading = false,
}: {
  title: string;
  body: string;
  loading?: boolean;
}) {
  const tr = useTranslate();
  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f6f3] px-6 font-sans">
      <div className="max-w-md rounded-lg border border-black/8 bg-white p-7 text-center shadow-sm">
        {loading && <Loader2 className="mx-auto mb-4 h-5 w-5 animate-spin text-[#c9a84c]" />}
        <h1 className="text-xl font-bold text-[#1a1a1a]">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-black/55">{body}</p>
        {!loading && (
          <Link
            to="/signin"
            className="mt-6 inline-flex rounded-md bg-[#1a3a5c] px-4 py-2 text-sm font-bold text-white"
          >
            {tr("Sign in", "Iniciar sesion")}
          </Link>
        )}
      </div>
    </main>
  );
}

function TopBar({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="student-topbar">
      <div className="student-topbar-copy">
        <h1>{title}</h1>
        {subtitle ? <p className="student-topbar-sub">{subtitle}</p> : null}
      </div>
      <div className="student-topbar-right">
        <LanguageToggle dark />
        {actions}
      </div>
    </header>
  );
}

function DashboardScreen({
  data,
  setScreen,
  onCourseClick,
}: {
  data: PortalData;
  setScreen: (screen: PortalScreen) => void;
  onCourseClick: (course: Course) => void;
}) {
  const timezone = data.profile.timezone ?? "America/New_York";
  const upcoming = data.sessions.find(
    (session) =>
      ["scheduled", "live"].includes(session.status) &&
      new Date(session.scheduled_at) >= new Date(),
  );
  const completedSessions = data.sessions.filter((session) => session.status === "completed");
  const continueCourse =
    data.courses.find((course) => {
      const pct = courseProgress(course, data.progress);
      return pct > 0 && pct < 100;
    }) ?? data.courses[0];
  const currentWeek = data.student?.current_week ?? data.stats?.current_week ?? 1;
  const currentObjective =
    data.objectives.find((objective) => objective.week_number === currentWeek) ?? null;
  const currentObjectiveItems = currentObjective
    ? objectiveItemsFor(currentObjective.id, data.objectiveItems)
    : [];
  const archivedObjectives = data.objectives.filter(
    (objective) => objective.week_number !== currentWeek,
  );
  const latestCheckIn = data.checkIns[0] ?? null;
  const previousCheckIn = data.checkIns[1] ?? null;
  const currentWeekCheckIn =
    data.checkIns.find((checkIn) => checkIn.week_number === currentWeek) ?? null;
  const upcomingMilestones = data.milestones
    .filter((milestone) => !milestoneIsComplete(milestone, data.student))
    .slice(0, 3);
  const completedMilestones = data.milestones.filter((milestone) =>
    milestoneIsComplete(milestone, data.student),
  ).length;
  const recentRecordings = buildRecordings(data).slice(0, 5);
  const latestConfidence = latestCheckIn?.confidence_score ?? data.stats?.confidence_score ?? null;
  const previousConfidence = previousCheckIn?.confidence_score ?? null;
  const confidenceDelta =
    typeof latestConfidence === "number" && typeof previousConfidence === "number"
      ? latestConfidence - previousConfidence
      : null;
  const weekSessions = data.sessions.filter(
    (session) => session.week_number === currentWeek && session.status !== "cancelled",
  );
  const weekSessionsCompleted = weekSessions.filter((session) => session.status === "completed");
  const stats = [
    {
      label: "Sessions this week",
      value: `${weekSessionsCompleted.length}/${weekSessions.length || 0}`,
      sub: weekSessions.length
        ? `${Math.max(0, weekSessions.length - weekSessionsCompleted.length)} remaining`
        : "No sessions scheduled",
    },
    {
      label: "Confidence rating",
      value: latestConfidence ?? "—",
      sub:
        confidenceDelta === null
          ? "Waiting for more check-ins"
          : `${confidenceDelta >= 0 ? "+" : ""}${confidenceDelta} from last week`,
      tone: "gold",
    },
    {
      label: "Sessions total",
      value: data.stats?.sessions_completed ?? completedSessions.length,
      sub: data.student?.start_date ? `Since ${formatDate(data.student.start_date)}` : "In program",
    },
    {
      label: "Current tier",
      value: data.stats?.tier_name ?? "Student",
      sub: data.student?.status ? data.student.status.replace(/_/g, " ") : "Active program",
      tone: "gold",
    },
  ];

  return (
    <section className="student-main">
      <TopBar
        title={`Good ${greetingForNow()}, ${firstName(data.profile)}.`}
        subtitle={programSubtitle(data)}
        actions={
          <>
            <button type="button" className="student-outline-btn" onClick={() => setScreen("checkins")}>
              Weekly check-in
            </button>
            <button type="button" className="student-gold-btn" onClick={() => setScreen("progress")}>
              This week's objectives
            </button>
          </>
        }
      />
      <div className="student-content">
        <div className="student-stats">
          {stats.map((item) => (
            <div key={item.label} className={`student-stat-card${item.tone === "gold" ? " gold" : ""}`}>
              <div className="student-stat-label">
                <span>{item.label}</span>
              </div>
              <strong>{item.value}</strong>
              <div className="student-stat-sub">{item.sub}</div>
            </div>
          ))}
        </div>

        <div className="student-grid">
          <div className="student-column">
            <SectionLabel>Continue Learning</SectionLabel>
            {continueCourse ? (
              <button
                type="button"
                onClick={() => onCourseClick(continueCourse)}
                className="student-feature-card"
              >
                <img
                  src={
                    continueCourse.thumbnail_url ??
                    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&q=70"
                  }
                  alt=""
                />
                <div>
                  <h3>{continueCourse.title}</h3>
                  <p>
                    {continueCourse.description ??
                      continueCourse.category ??
                      "Continue your assigned course."}
                  </p>
                  <ProgressBar value={courseProgress(continueCourse, data.progress)} />
                </div>
              </button>
            ) : (
              <EmptyState text="Your course library will appear here after Sena publishes courses." />
            )}

            <PanelHeader
              title="Recording History"
              action="View All"
              onAction={() => setScreen("recordings")}
            />
            <div className="student-list-card">
              {recentRecordings.length ? (
                recentRecordings.map((recording) => (
                  <RecordingRow key={recording.id} recording={recording} />
                ))
              ) : (
                <EmptyState text="Your recordings will appear here after sessions are processed." />
              )}
            </div>
          </div>

          <aside className="student-side-column">
            <section className="student-panel padded">
              <SectionLabel>Upcoming Live Session</SectionLabel>
              {upcoming ? (
                <>
                  <h3 className="student-panel-title">
                    {upcoming.focus_topic ?? "Next Live Session with Sena"}
                  </h3>
                  <div className="student-session-meta-block">
                    <span>Scheduled at</span>
                    <strong>{formatDateTime(upcoming.scheduled_at, timezone)}</strong>
                  </div>
                  <div className="student-session-meta-block">
                    <span>Week / Session</span>
                    <strong>
                      Week {upcoming.week_number} · Session {upcoming.session_number}
                    </strong>
                  </div>
                  {upcoming.zoom_join_url && (
                    <a
                      className="student-gold-btn"
                      href={upcoming.zoom_join_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Join Zoom
                    </a>
                  )}
                  <div className="student-countdown">
                    <span>Session starts in</span>
                    <strong>{getCountdown(upcoming.scheduled_at)}</strong>
                  </div>
                </>
              ) : (
                <EmptyState text="No upcoming session is scheduled yet." />
              )}
            </section>

            <section className="student-panel padded">
              <SectionLabel>This Week</SectionLabel>
              <h3 className="student-panel-title">
                {currentObjective?.focus_title ?? "Your weekly focus"}
              </h3>
              <p className="student-muted">
                {currentObjective?.context_for_student ??
                  "Sena will add your next objectives here."}
              </p>
              {!!currentObjectiveItems.length && (
                <div className="student-objective-list">
                  {currentObjectiveItems.map((item) => (
                    <div
                      key={item.id}
                      className={`student-objective-item ${item.completed ? "done" : ""}`}
                    >
                      <span>{item.completed ? <Check className="h-3.5 w-3.5" /> : null}</span>
                      <small>{item.item_text}</small>
                    </div>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={() => setScreen("progress")}
                className="student-outline-btn"
              >
                Open progress
              </button>
            </section>

            <section className="student-panel padded">
              <SectionLabel>Weekly Check-In</SectionLabel>
              <h3 className="student-panel-title">
                {currentWeekCheckIn ? `Week ${currentWeek} update submitted` : "Share your week"}
              </h3>
              <p className="student-muted">
                {currentWeekCheckIn?.win_of_week ??
                  "Log your win, challenge, confidence, and next-session note so Sena can coach from your real week."}
              </p>
              {currentWeekCheckIn && (
                <div className="student-meta-line">
                  <span>{currentWeekCheckIn.mood_emoji ?? moodMeta(currentWeekCheckIn.mood)?.emoji ?? "•"}</span>
                  <small>
                    Confidence {currentWeekCheckIn.confidence_score ?? "N/A"}/10 ·{" "}
                    {currentWeekCheckIn.status}
                  </small>
                </div>
              )}
              {currentWeekCheckIn?.admin_note && (
                <div className="student-note-card">
                  <strong>Sena's note</strong>
                  <p>{currentWeekCheckIn.admin_note}</p>
                </div>
              )}
              <button
                type="button"
                onClick={() => setScreen("checkins")}
                className="student-gold-btn student-panel-cta-gap"
              >
                {currentWeekCheckIn ? "Update check-in" : "Submit check-in"}
              </button>
            </section>

            <section className="student-panel padded">
              <SectionLabel>Milestones</SectionLabel>
              <h3 className="student-panel-title">
                {data.goal?.fluency_goal ?? "Your fluency goal will appear here"}
              </h3>
              <p className="student-muted">
                {data.milestones.length
                  ? `${completedMilestones} of ${data.milestones.length} milestones complete so far.`
                  : "Sena will map your key speaking milestones here."}
              </p>
              {!!data.milestones.length && (
                <>
                  <ProgressBar value={(completedMilestones / data.milestones.length) * 100} />
                  <div className="student-mini-list">
                    {(upcomingMilestones.length ? upcomingMilestones : data.milestones.slice(0, 3)).map(
                      (milestone) => (
                        <div key={milestone.id} className="student-archive-row">
                          <span>{milestone.title}</span>
                          <small>
                            {milestone.target_week
                              ? `Week ${milestone.target_week}`
                              : formatDate(milestone.target_date)}
                          </small>
                        </div>
                      ),
                    )}
                  </div>
                </>
              )}
              <button
                type="button"
                onClick={() => setScreen("milestones")}
                className="student-outline-btn student-panel-cta-gap"
              >
                View milestones
              </button>
            </section>

            <section className="student-panel padded">
              <SectionLabel>Objectives Archive</SectionLabel>
              <div className="student-mini-list">
                {archivedObjectives.length ? (
                  archivedObjectives.slice(0, 6).map((objective) => (
                    <div key={objective.id} className="student-archive-row">
                      <span>{objective.focus_title}</span>
                      <small>{objective.week_label ?? `Week ${objective.week_number}`}</small>
                    </div>
                  ))
                ) : (
                  <EmptyState text="Past weekly objectives will be stored here." />
                )}
              </div>
            </section>

            <section className="student-panel padded">
              <SectionLabel>English You Enjoy</SectionLabel>
              <div className="student-mini-list">
                {data.content.slice(0, 4).map((item) => (
                  <a key={item.id} href={item.external_url ?? "#"} target="_blank" rel="noreferrer">
                    <span>{item.title}</span>
                    <small>{item.genre_tag ?? formatMediaType(item.media_type)}</small>
                  </a>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setScreen("library")}
                className="student-outline-btn"
              >
                Open library
              </button>
            </section>
          </aside>
        </div>
      </div>
    </section>
  );
}

function ObjectiveItemToggleButton({
  item,
  student,
  meta,
  variant,
}: {
  item: ObjectiveItem;
  student: Student | null;
  meta: string;
  variant: "dashboard" | "week";
}) {
  const queryClient = useQueryClient();
  const [optimisticCompleted, setOptimisticCompleted] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const mutation = useMutation({
    mutationFn: async (nextCompleted: boolean) => {
      if (!supabase || !student) throw new Error("Your objectives are not ready yet.");
      const { error } = await supabase
        .from("objective_items")
        .update({
          completed: nextCompleted,
          completed_at: nextCompleted ? new Date().toISOString() : null,
        })
        .eq("id", item.id);
      if (error) throw error;
    },
    onMutate: (nextCompleted) => {
      setErrorMessage(null);
      setOptimisticCompleted(nextCompleted);
    },
    onError: (error: Error) => {
      setOptimisticCompleted(null);
      setErrorMessage(
        /policy|permission|row-level security/i.test(error.message)
          ? "This checklist save is blocked until the objective-items student update policy is applied."
          : error.message,
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["student-portal"] });
    },
  });
  const effectiveCompleted = optimisticCompleted ?? item.completed;

  const isWeek = variant === "week";
  const rowClass = isWeek ? "student-week-item" : "student-dashboard-focus-row";
  const checkClass = isWeek ? "student-week-check" : "student-dashboard-focus-check";
  const copyClass = isWeek ? "student-week-item-main" : "student-dashboard-focus-copy";

  useEffect(() => {
    if (optimisticCompleted !== null && item.completed === optimisticCompleted) {
      setOptimisticCompleted(null);
    }
  }, [item.completed, optimisticCompleted]);

  return (
    <div className={`student-objective-toggle ${variant}`}>
      <button
        type="button"
        onClick={() => mutation.mutate(!effectiveCompleted)}
        disabled={mutation.isPending}
        aria-pressed={effectiveCompleted}
        className={`${rowClass}${mutation.isPending ? " pending" : ""}`}
      >
        {isWeek ? (
          <>
            <div className={copyClass}>
              <span className={`${checkClass}${effectiveCompleted ? " done" : ""}`}>
                {mutation.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : effectiveCompleted ? (
                  <Check className="h-3.5 w-3.5" />
                ) : null}
              </span>
              <strong>{item.item_text}</strong>
            </div>
            <small>{meta}</small>
          </>
        ) : (
          <>
            <span className={`${checkClass}${effectiveCompleted ? " done" : ""}`}>
              {mutation.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : effectiveCompleted ? (
                <Check className="h-3.5 w-3.5" />
              ) : null}
            </span>
            <div className={copyClass}>
              <strong>{item.item_text}</strong>
              <small>{meta}</small>
            </div>
          </>
        )}
      </button>
      {errorMessage ? <p className="student-inline-error">{errorMessage}</p> : null}
    </div>
  );
}

function DashboardScreenV2({
  data,
  setScreen,
}: {
  data: PortalData;
  setScreen: (screen: PortalScreen) => void;
}) {
  const tr = useTranslate();
  const completedSessions = data.sessions.filter((session) => session.status === "completed");
  const currentWeek = data.student?.current_week ?? data.stats?.current_week ?? 1;
  const timezone = data.profile.timezone ?? "America/New_York";
  const currentObjective =
    data.objectives.find((objective) => objective.week_number === currentWeek) ?? null;
  const currentObjectiveItems = (
    currentObjective ? objectiveItemsFor(currentObjective.id, data.objectiveItems) : []
  ).slice(0, 4);
  const latestCheckIn = data.checkIns[0] ?? null;
  const previousCheckIn = data.checkIns[1] ?? null;
  const currentWeekCheckIn =
    data.checkIns.find((checkIn) => checkIn.week_number === currentWeek) ?? null;
  const latestConfidence = latestCheckIn?.confidence_score ?? data.stats?.confidence_score ?? null;
  const previousConfidence = previousCheckIn?.confidence_score ?? null;
  const confidenceDelta =
    typeof latestConfidence === "number" && typeof previousConfidence === "number"
      ? latestConfidence - previousConfidence
      : null;
  const weekSessions = data.sessions.filter(
    (session) => session.week_number === currentWeek && session.status !== "cancelled",
  );
  const weekSessionsCompleted = weekSessions.filter((session) => session.status === "completed");
  const sessionsRemaining = Math.max(0, weekSessions.length - weekSessionsCompleted.length);
  const levelMeta = dashboardLevelMeta(data.stats?.tier_name);
  const coachCheckIn = currentWeekCheckIn?.admin_note
    ? currentWeekCheckIn
    : data.checkIns.find((checkIn) => !!checkIn.admin_note) ?? null;
  const coachNote =
    currentWeekCheckIn?.admin_note ??
    coachCheckIn?.admin_note ??
    currentObjective?.context_for_student ??
    tr(
      "Sena will leave your weekly coaching note here after reviewing your progress.",
      "Sena dejara aqui su nota semanal despues de revisar tu progreso.",
    );
  const coachNoteLabel = coachCheckIn?.admin_note
    ? `SENA - ${formatMonthDayUpper(coachCheckIn.reviewed_at ?? coachCheckIn.submitted_at)}`
    : tr("SENA - THIS WEEK", "SENA - ESTA SEMANA");
  const dashboardRecordings = useMemo(() => buildRecordings(data), [data, tr]);
  const latestRecording = dashboardRecordings[0] ?? null;
  const upcomingSession = useMemo(
    () =>
      [...data.sessions]
        .filter((session) => ["scheduled", "live"].includes(session.status))
        .sort(
          (a, b) =>
            new Date(a.scheduled_at || 0).getTime() - new Date(b.scheduled_at || 0).getTime(),
        )[0] ?? null,
    [data.sessions],
  );
  const libraryContent = useMemo(() => mergeReferenceContent(data.content), [data.content]);
  const dashboardShows = useMemo(
    () =>
      pickDashboardItemsByTitle(
        libraryContent,
        "show",
        ["Ted Lasso", "The Office", "Friends", "Emily in Paris", "Stranger Things"],
        5,
      ),
    [libraryContent],
  );
  const dashboardMusic = useMemo(
    () =>
      pickDashboardItemsByTitle(
        libraryContent,
        "music",
        ["folklore", "Happier Than Ever", "Divide", "30", "24K Magic"],
        5,
      ),
    [libraryContent],
  );

  return (
    <section className="student-main">
      <TopBar
        title={`${greetingForNow()}, ${firstName(data.profile)}.`}
        subtitle={dashboardProgramSubtitle(data)}
        actions={
          <>
            <button
              type="button"
              className="student-outline-btn"
              onClick={() => setScreen("checkins")}
            >
              {tr("Weekly check-in", "Check-in semanal")} -&gt;
            </button>
            <button
              type="button"
              className="student-gold-btn"
              onClick={() => setScreen("week")}
            >
              {tr("This week's objectives", "Objetivos de esta semana")}
            </button>
          </>
        }
      />
      <div className="student-content">
        <div className="student-stats student-dashboard-stats">
          <article className="student-stat-card student-dashboard-stat-card">
            <div className="student-stat-label">
              <span>{tr("Sessions this week", "Sesiones esta semana")}</span>
            </div>
            <div className="student-dashboard-stat-main">
              <strong>{weekSessionsCompleted.length}</strong>
              <small>/ {weekSessions.length || 0}</small>
            </div>
            <div className="student-stat-sub">
              {weekSessions.length
                ? `${sessionsRemaining} ${tr("remaining", "restantes")}`
                : tr("No sessions scheduled", "No hay sesiones programadas")}
            </div>
          </article>

          <article className="student-stat-card student-dashboard-stat-card gold">
            <div className="student-stat-label">
              <span>{tr("Confidence rating", "Nivel de confianza")}</span>
            </div>
            <div className="student-dashboard-stat-main">
              <strong>{formatConfidenceValue(latestConfidence)}</strong>
            </div>
            <div className="student-stat-sub">
              {confidenceDelta === null
                ? tr("Waiting for more check-ins", "Esperando mas check-ins")
                : `${confidenceDelta >= 0 ? "+" : ""}${formatConfidenceValue(confidenceDelta)} ${tr("from last week", "desde la semana pasada")}`}
            </div>
          </article>

          <article className="student-stat-card student-dashboard-stat-card">
            <div className="student-stat-label">
              <span>{tr("Sessions total", "Sesiones totales")}</span>
            </div>
            <div className="student-dashboard-stat-main">
              <strong>{data.stats?.sessions_completed ?? completedSessions.length}</strong>
            </div>
            <div className="student-stat-sub">
              {data.student?.start_date
                ? `${tr("Since", "Desde")} ${formatMonthDay(data.student.start_date)}`
                : tr("In program", "En el programa")}
            </div>
          </article>

          <article className="student-stat-card student-dashboard-stat-card gold">
            <div className="student-stat-label">
              <span>{tr("Current level", "Nivel actual")}</span>
            </div>
            <div className="student-dashboard-stat-main">
              <strong>{levelMeta.value}</strong>
            </div>
            <div className="student-stat-sub">{levelMeta.label}</div>
          </article>
        </div>

        <div className="student-dashboard-panels">
          <section className="student-panel padded student-dashboard-panel">
            <div className="student-dashboard-panel-head">
              <h3>{tr("This week's focus", "Enfoque de esta semana")}</h3>
              <button
                type="button"
                className="student-dashboard-link"
                onClick={() => setScreen("week")}
              >
                {tr("View all", "Ver todo")} -&gt;
              </button>
            </div>
            {currentObjectiveItems.length ? (
              <div className="student-dashboard-focus-list">
                {currentObjectiveItems.map((item) => (
                  <ObjectiveItemToggleButton
                    key={item.id}
                    item={item}
                    student={data.student}
                    meta={dashboardObjectiveMeta(item.item_text, item.completed)}
                    variant="dashboard"
                  />
                ))}
              </div>
            ) : (
              <div className="student-dashboard-focus-empty">
                <p className="student-muted">
                  {currentObjective?.context_for_student ??
                    tr(
                      "Sena will add your weekly focus and checklist here.",
                      "Sena agregara aqui tu enfoque semanal y tu lista de tareas.",
                    )}
                </p>
              </div>
            )}
          </section>

          <section className="student-panel padded student-dashboard-panel">
            <div className="student-dashboard-panel-head">
              <h3>{tr("Note from Sena", "Nota de Sena")}</h3>
            </div>
            <div className="student-dashboard-note-box">
              <div className="student-dashboard-note-kicker">{coachNoteLabel}</div>
              <p>{coachNote}</p>
            </div>
          </section>
        </div>

        <div className="student-dashboard-utility-grid">
          <section className="student-panel padded student-dashboard-utility-card">
            <div className="student-dashboard-panel-head">
              <h3>{tr("Most recent recording", "Grabacion mas reciente")}</h3>
              <button
                type="button"
                className="student-dashboard-link"
                onClick={() => setScreen("recordings")}
              >
                {tr("Recording history", "Historial de grabaciones")} - {tr("view all", "ver todo")}
              </button>
            </div>

            {latestRecording ? (
              <div className="student-dashboard-recording-card">
                <div className="student-dashboard-utility-kicker">{latestRecording.sourceLabel}</div>
                <h4>{latestRecording.title}</h4>
                <div className="student-dashboard-recording-meta">
                  <span>
                    {formatDate(latestRecording.date)} · {latestRecording.duration}
                  </span>
                  {latestRecording.sessionLabel ? (
                    <span className="student-recording-chip">{latestRecording.sessionLabel}</span>
                  ) : null}
                  {latestRecording.notesLabel ? (
                    <span className="student-recording-chip">{latestRecording.notesLabel}</span>
                  ) : null}
                </div>
                <p>
                  {latestRecording.transcript
                    ? previewRecordingNotes(latestRecording.transcript)
                    : latestRecording.detail ??
                      tr(
                        "Replay the most recent session and revisit the main speaking notes.",
                        "Vuelve a ver la sesion mas reciente y repasa las notas principales.",
                      )}
                </p>
                <div className="student-dashboard-recording-actions">
                  <button
                    type="button"
                    className="student-outline-btn"
                    onClick={() => setScreen("recordings")}
                  >
                    {tr("Open recording history", "Abrir historial de grabaciones")}
                  </button>
                  {latestRecording.url ? (
                    <a
                      href={latestRecording.url}
                      target="_blank"
                      rel="noreferrer"
                      className="student-blue-btn"
                    >
                      {tr("Watch recording", "Ver grabacion")}
                    </a>
                  ) : (
                    <span className="student-status pending">
                      {tr("Processing", "Procesando")}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <EmptyState
                text={tr(
                  "Your first recording will appear here after Zoom finishes processing a completed session.",
                  "Tu primera grabacion aparecera aqui cuando Zoom termine de procesar una sesion completada.",
                )}
              />
            )}
          </section>

          <section className="student-panel padded student-dashboard-utility-card">
            <div className="student-dashboard-panel-head">
              <h3>{tr("Upcoming live session", "Proxima sesion en vivo")}</h3>
              <button
                type="button"
                className="student-dashboard-link"
                onClick={() => setScreen("sessions")}
              >
                {tr("View full schedule", "Ver horario completo")}
              </button>
            </div>

            {upcomingSession ? (
              <div className="student-dashboard-upcoming-card">
                <div className="student-dashboard-upcoming-top">
                  <div className="student-dashboard-utility-kicker">
                    {tr("Next live session", "Siguiente sesion en vivo")}
                  </div>
                  <span className={`student-status ${upcomingSession.status}`}>
                    {upcomingSession.status === "live"
                      ? tr("Live now", "En vivo ahora")
                      : tr("Scheduled", "Programada")}
                  </span>
                </div>
                <h4>
                  {upcomingSession.focus_topic ??
                    tr("Live session with Sena", "Sesion en vivo con Sena")}
                </h4>
                <div className="student-dashboard-upcoming-block">
                  <span>{tr("When", "Cuando")}</span>
                  <strong>{formatDateTime(upcomingSession.scheduled_at, timezone)}</strong>
                </div>
                <div className="student-dashboard-upcoming-block">
                  <span>{tr("Week / Session", "Semana / Sesion")}</span>
                  <strong>
                    {weekSessionLabel(upcomingSession.week_number, upcomingSession.session_number)}
                  </strong>
                </div>
                <div className="student-dashboard-upcoming-block">
                  <span>{tr("Countdown", "Cuenta regresiva")}</span>
                  <strong>{getCountdown(upcomingSession.scheduled_at)}</strong>
                </div>
                <div className="student-dashboard-recording-actions">
                  <button
                    type="button"
                    className="student-outline-btn"
                    onClick={() => setScreen("sessions")}
                  >
                    {tr("Open live sessions", "Abrir sesiones en vivo")}
                  </button>
                  {upcomingSession.zoom_join_url ? (
                    <a
                      href={upcomingSession.zoom_join_url}
                      target="_blank"
                      rel="noreferrer"
                      className="student-gold-btn"
                    >
                      {tr("Join Zoom", "Entrar a Zoom")}
                    </a>
                  ) : null}
                </div>
              </div>
            ) : (
              <EmptyState
                text={tr(
                  "No upcoming live session is scheduled yet.",
                  "Aun no hay una sesion en vivo programada.",
                )}
              />
            )}
          </section>
        </div>

        <section className="student-panel padded student-dashboard-library-panel">
          <div className="student-dashboard-panel-head">
            <h3>{tr("Library picks for you", "Recomendaciones para ti")}</h3>
            <button
              type="button"
              className="student-dashboard-link"
              onClick={() => setScreen("library")}
            >
              {tr("Full library", "Biblioteca completa")} -&gt;
            </button>
          </div>

          <div className="student-dashboard-library-block">
            <div className="student-dashboard-kicker">{tr("WATCH", "VER")}</div>
            {dashboardShows.length ? (
              <div className="student-dashboard-poster-row">
                {dashboardShows.map((item) => (
                  <a
                    key={item.id}
                    href={studentContentHref(item)}
                    target="_blank"
                    rel="noreferrer"
                    className="student-dashboard-poster-card"
                  >
                    <img src={studentContentImage(item, "poster")} alt={item.title} />
                  </a>
                ))}
              </div>
            ) : (
              <EmptyState
                text={tr(
                  "Watch picks will appear here once Sena curates your library.",
                  "Las recomendaciones para ver apareceran aqui cuando Sena organice tu biblioteca.",
                )}
              />
            )}
          </div>

          <div className="student-dashboard-library-block">
            <div className="student-dashboard-kicker">{tr("SING", "CANTAR")}</div>
            {dashboardMusic.length ? (
              <div className="student-dashboard-music-row">
                {dashboardMusic.map((item) => (
                  <a
                    key={item.id}
                    href={studentContentHref(item)}
                    target="_blank"
                    rel="noreferrer"
                    className="student-dashboard-album-card"
                  >
                    <div className="student-dashboard-album-cover">
                      <img src={studentContentImage(item, "square")} alt={item.title} />
                    </div>
                    <span>{item.title}</span>
                    <small>{item.author_or_host ?? tr("Music", "Musica")}</small>
                  </a>
                ))}
              </div>
            ) : (
              <EmptyState
                text={tr(
                  "Music picks will appear here once Sena curates your library.",
                  "Las recomendaciones de musica apareceran aqui cuando Sena organice tu biblioteca.",
                )}
              />
            )}
          </div>
        </section>
      </div>
    </section>
  );
}

function ThisWeekScreen({
  data,
  setScreen,
}: {
  data: PortalData;
  setScreen: (screen: PortalScreen) => void;
}) {
  const tr = useTranslate();
  const currentWeek = currentWeekNumber(data);
  const weekObjectives = data.objectives.filter((objective) => objective.week_number === currentWeek);
  const phraseEntry =
    data.journals.find(
      (entry) => entry.entry_type === "phrase_bank" && entry.week_number === currentWeek,
    ) ??
    data.journals.find((entry) => entry.entry_type === "phrase_bank") ??
    null;
  const phraseLines = phraseEntry ? studentPhraseLines(phraseEntry.content).slice(0, 5) : [];
  const currentWeekCheckIn =
    data.checkIns.find((checkIn) => checkIn.week_number === currentWeek) ?? data.checkIns[0] ?? null;
  const noticeBody =
    currentWeekCheckIn?.admin_note ??
    currentWeekCheckIn?.biggest_struggle ??
    weekObjectives[0]?.context_for_student ??
    tr(
      "Pay attention to the phrases that still feel slow or too translated, then bring those examples to your next session.",
      "Presta atencion a las frases que todavia se sienten lentas o demasiado traducidas y trae esos ejemplos a tu proxima sesion.",
    );
  const nextSessionLine =
    currentWeekCheckIn?.note_for_next ??
    tr(
      "Any questions, surprises, or things you want to talk about",
      "Cualquier pregunta, sorpresa o tema del que quieras hablar",
    );
  const weekSubtitle =
    weekObjectives[0]?.week_label ?? `${tr("Week", "Semana")} ${currentWeek}`;
  const archivedObjectives = [...data.objectives]
    .filter((objective) => objective.week_number !== currentWeek)
    .sort((a, b) => b.week_number - a.week_number || a.focus_area - b.focus_area);

  return (
    <section className="student-main">
      <TopBar title={tr("This week's objectives", "Objetivos de esta semana")} subtitle={weekSubtitle} />
      <div className="student-content">
        <div className="student-week-shell">
          {weekObjectives.length ? (
            weekObjectives.map((objective, index) => {
              const items = objectiveItemsFor(objective.id, data.objectiveItems);
              const showPhraseBox = index === 0 && phraseLines.length > 0;
              return (
                <section key={objective.id} className="student-panel padded student-week-card">
                  <div className="student-week-card-kicker">
                    {tr("Focus Area", "Area de enfoque")} {String(index + 1).padStart(2, "0")}
                  </div>
                  <h2 className="student-week-card-title">{objective.focus_title}</h2>
                  <p className="student-week-card-context">
                    {objective.context_for_student ??
                      tr(
                        "Sena will add the focus context for this week here.",
                        "Sena agregara aqui el contexto de enfoque para esta semana.",
                      )}
                  </p>

                  <div className="student-week-items">
                    {items.length ? (
                      items.map((item) => (
                        <ObjectiveItemToggleButton
                          key={item.id}
                          item={item}
                          student={data.student}
                          meta={dashboardObjectiveMeta(item.item_text, item.completed)}
                          variant="week"
                        />
                      ))
                    ) : (
                      <EmptyState
                        text={tr(
                          "Checklist items will appear here once Sena adds them.",
                          "Los elementos de la lista apareceran aqui cuando Sena los agregue.",
                        )}
                      />
                    )}
                  </div>

                  {showPhraseBox && (
                    <div className="student-week-phrase-box">
                      {phraseLines.map((line) => (
                        <div key={line}>{line}</div>
                      ))}
                    </div>
                  )}
                </section>
              );
            })
          ) : (
            <section className="student-panel padded student-week-card">
              <h2 className="student-week-card-title">
                {tr("This week will appear here soon", "Esta semana aparecera aqui pronto")}
              </h2>
              <p className="student-week-card-context">
                {tr(
                  "Sena will add your weekly focus areas, practice checklist, and notes here.",
                  "Sena agregara aqui tus areas de enfoque semanales, lista de practica y notas.",
                )}
              </p>
            </section>
          )}

          <section className="student-panel padded student-week-callout">
            <div className="student-week-callout-kicker">
              {tr("One thing to notice", "Una cosa para notar")}
            </div>
            <h3>{tr("What to listen for this week", "Que escuchar esta semana")}</h3>
            <p>{noticeBody}</p>
          </section>

          <section className="student-panel padded student-week-next">
            <div className="student-week-callout-kicker">
              {tr("For our next session", "Para nuestra proxima sesion")}
            </div>
            <div className="student-week-item student-week-item-single">
              <div className="student-week-item-main">
                <span className="student-week-check" />
                <strong>{nextSessionLine}</strong>
              </div>
            </div>
          </section>

          <section className="student-panel padded student-week-archive">
            <div className="student-dashboard-panel-head">
              <h3>{tr("Past archive", "Archivo anterior")}</h3>
            </div>
            {archivedObjectives.length ? (
              <div className="student-week-archive-list">
                {archivedObjectives.map((objective) => (
                    <article key={objective.id} className="student-week-archive-row">
                      <div className="student-week-archive-meta">
                        <span>{objective.week_label ?? weekLabel(objective.week_number)}</span>
                        <small>
                          {tr("Focus area", "Area de enfoque")} {objective.focus_area}
                        </small>
                    </div>
                    <strong>{objective.focus_title}</strong>
                    <p>
                      {objective.context_for_student ??
                        tr(
                          "This weekly focus was previously assigned in your journey.",
                          "Este enfoque semanal ya fue asignado anteriormente en tu recorrido.",
                        )}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState
                text={tr(
                  "Past weekly objectives will appear here as your archive builds.",
                  "Los objetivos semanales anteriores apareceran aqui a medida que crezca tu archivo.",
                )}
              />
            )}
          </section>
        </div>
      </div>
    </section>
  );
}

function LegacyProgressScreen({
  data,
  setScreen,
  onCourseClick,
}: {
  data: PortalData;
  setScreen: (screen: PortalScreen) => void;
  onCourseClick: (course: Course) => void;
}) {
  const currentWeek = currentWeekNumber(data);
  const tierName = data.stats?.tier_name;
  const programWeeks = studentProgramWeeks(tierName);
  const completedWeeks = Math.min(currentWeek, programWeeks);
  const programName = displayProgramName(tierName);
  const currentObjective =
    data.objectives.find((objective) => objective.week_number === currentWeek) ?? null;
  const currentObjectiveItems = currentObjective
    ? objectiveItemsFor(currentObjective.id, data.objectiveItems)
    : [];
  const latestCheckIn = data.checkIns[0] ?? null;
  const latestConfidence = latestCheckIn?.confidence_score ?? data.stats?.confidence_score ?? 0;
  const completedLessons = data.progress.filter((item) => item.status === "completed").length;
  const completedSessions = data.sessions.filter((session) => session.status === "completed").length;
  const completedMilestones = data.milestones.filter((milestone) =>
    milestoneIsComplete(milestone, data.student),
  ).length;
  const totalProgress = data.courses.length
    ? Math.round(
        data.courses.reduce((sum, course) => sum + courseProgress(course, data.progress), 0) /
          data.courses.length,
      )
    : 0;
  const confidenceHistory = useMemo(
    () =>
      [...data.checkIns]
        .filter((item) => typeof item.confidence_score === "number")
        .sort((a, b) => a.week_number - b.week_number)
        .slice(-6),
    [data.checkIns],
  );
  const questionEntries = data.journals
    .filter((entry) => entry.entry_type === "question")
    .slice(0, 4);

  return (
    <section className="student-main">
      <TopBar title="My Progress" subtitle={programSubtitle(data)} />
      <div className="student-content">
        <div className="student-stats student-stats-wide">
          <div className="student-stat-card">
            <div className="student-stat-label">
              <BookOpen className="h-4 w-4 text-[#c9a84c]" />
              <span>Course Progress</span>
            </div>
            <strong>{totalProgress}%</strong>
          </div>
          <div className="student-stat-card">
            <div className="student-stat-label">
              <Check className="h-4 w-4 text-[#c9a84c]" />
              <span>Lessons Completed</span>
            </div>
            <strong>{completedLessons}</strong>
          </div>
          <div className="student-stat-card">
            <div className="student-stat-label">
              <Video className="h-4 w-4 text-[#1a3a5c]" />
              <span>Sessions Attended</span>
            </div>
            <strong>{completedSessions}</strong>
          </div>
          <div className="student-stat-card">
            <div className="student-stat-label">
              <Bell className="h-4 w-4 text-[#1a3a5c]" />
              <span>Confidence Score</span>
            </div>
            <strong>{latestConfidence || "—"}</strong>
          </div>
        </div>

        <div className="student-grid">
          <div className="student-column">
            <section className="student-panel padded">
              <SectionLabel>Current Objective</SectionLabel>
              <h3 className="student-panel-title">
                {currentObjective?.focus_title ?? "Your current focus will show here"}
              </h3>
              <p className="student-muted">
                {currentObjective?.context_for_student ??
                  "Sena will add a week-by-week objective to guide your progress."}
              </p>
              {!!currentObjectiveItems.length && (
                <div className="student-objective-list">
                  {currentObjectiveItems.map((item) => (
                    <div
                      key={item.id}
                      className={`student-objective-item ${item.completed ? "done" : ""}`}
                    >
                      <span>{item.completed ? <Check className="h-3.5 w-3.5" /> : null}</span>
                      <small>{item.item_text}</small>
                    </div>
                  ))}
                </div>
              )}
              {!currentObjectiveItems.length && (
                <EmptyState text="Objective checklist items will appear here once Sena adds them." />
              )}
            </section>

            <div className="student-list-card">
              <PanelHeader
                title="Course Progress"
                action="Open Courses"
                onAction={() => setScreen("courses")}
              />
              {data.courses.length ? (
                data.courses.map((course) => (
                  <button
                    key={course.id}
                    type="button"
                    onClick={() => onCourseClick(course)}
                    className="student-progress-row"
                  >
                    <div>
                      <strong>{course.title}</strong>
                      <span>{course.category ?? "Professional English course"}</span>
                    </div>
                    <div className="student-progress-row-side">
                      <ProgressBar value={courseProgress(course, data.progress)} />
                      <small>{courseProgress(course, data.progress)}%</small>
                    </div>
                  </button>
                ))
              ) : (
                <EmptyState text="Courses will appear here once Sena publishes your library." />
              )}
            </div>
          </div>

          <aside className="student-side-column">
            <section className="student-panel padded">
              <SectionLabel>Milestone Progress</SectionLabel>
              <h3 className="student-panel-title">
                {data.milestones.length
                  ? `${completedMilestones}/${data.milestones.length} milestones complete`
                  : "No milestones yet"}
              </h3>
              <p className="student-muted">
                {data.goal?.fluency_goal ??
                  "Your long-term fluency goal will anchor the milestone journey here."}
              </p>
              {!!data.milestones.length && (
                <ProgressBar value={(completedMilestones / data.milestones.length) * 100} />
              )}
              <button
                type="button"
                onClick={() => setScreen("milestones")}
                className="student-outline-btn student-panel-cta-gap"
              >
                View milestones
              </button>
            </section>

            <section className="student-panel padded">
              <SectionLabel>Confidence Trend</SectionLabel>
              <div className="student-score-list">
                {confidenceHistory.length ? (
                  confidenceHistory.map((item) => (
                    <div key={item.id} className="student-score-row">
                      <span>Week {item.week_number}</span>
                      <div className="student-score-bar">
                        <span style={{ width: `${Number(item.confidence_score ?? 0) * 10}%` }} />
                      </div>
                      <strong>{item.confidence_score}/10</strong>
                    </div>
                  ))
                ) : (
                  <EmptyState text="Confidence history will appear after your weekly check-ins." />
                )}
              </div>
            </section>

            <section className="student-panel padded">
              <SectionLabel>Latest Weekly Win</SectionLabel>
              <h3 className="student-panel-title">
                {latestCheckIn?.win_of_week ?? "No weekly win submitted yet"}
              </h3>
              <p className="student-muted">
                {latestCheckIn?.note_for_next ??
                  "Your latest win and note for next session will show up here after check-ins."}
              </p>
              <button
                type="button"
                onClick={() => setScreen("checkins")}
                className="student-outline-btn"
              >
                Open check-in
              </button>
            </section>

            <section className="student-panel padded">
              <SectionLabel>Questions to Practice</SectionLabel>
              <div className="student-mini-list">
                {questionEntries.length ? (
                  questionEntries.map((entry) => (
                    <div key={entry.id} className="student-archive-row">
                      <span>{entry.topic || "Question"}</span>
                      <small>{entry.week_number ? `Week ${entry.week_number}` : "Journal"}</small>
                    </div>
                  ))
                ) : (
                  <EmptyState text="Questions from your journal will appear here." />
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </section>
  );
}

function ProgressScreen({
  data,
  setScreen,
}: {
  data: PortalData;
  setScreen: (screen: PortalScreen) => void;
}) {
  const tr = useTranslate();
  const currentWeek = currentWeekNumber(data);
  const tierName = data.stats?.tier_name;
  const programWeeks = studentProgramWeeks(tierName);
  const completedWeeks = Math.min(currentWeek, programWeeks);
  const programName = displayProgramName(tierName);
  const currentObjective =
    data.objectives.find((objective) => objective.week_number === currentWeek) ?? null;
  const currentObjectiveItems = currentObjective
    ? objectiveItemsFor(currentObjective.id, data.objectiveItems)
    : [];
  const latestCheckIn = data.checkIns[0] ?? null;
  const latestConfidence = latestCheckIn?.confidence_score ?? data.stats?.confidence_score ?? 0;
  const completedLessons = data.progress.filter((item) => item.status === "completed").length;
  const completedSessions = data.sessions.filter((session) => session.status === "completed").length;
  const completedMilestones = data.milestones.filter((milestone) =>
    milestoneIsComplete(milestone, data.student),
  ).length;
  const totalProgress = data.courses.length
    ? Math.round(
        data.courses.reduce((sum, course) => sum + courseProgress(course, data.progress), 0) /
          data.courses.length,
      )
    : 0;
  const objectiveCompletion = currentObjectiveItems.length
    ? currentObjectiveItems.filter((item) => item.completed).length / currentObjectiveItems.length
    : 0;
  const scheduledSessions = Math.max(4, completedWeeks * 4);
  const sessionDenominator = Math.max(scheduledSessions, completedSessions || scheduledSessions);
  const sessionAttendance = progressPercent(
    sessionDenominator ? (completedSessions / sessionDenominator) * 100 : 0,
  );
  const rewardsUnlocked = Math.floor(completedMilestones / 3);
  const rewardsLabel = rewardsUnlocked
    ? currentAppLanguage() === "es"
      ? `${rewardsUnlocked} recompensa${rewardsUnlocked === 1 ? "" : "s"} desbloqueada${rewardsUnlocked === 1 ? "" : "s"}`
      : `${rewardsUnlocked} reward unlocked${rewardsUnlocked === 1 ? "" : "s"}`
    : tr("No rewards unlocked yet", "Aun no hay recompensas desbloqueadas");
  const skillProgress = [
    {
      label: tr("Speaking speed", "Velocidad al hablar"),
      value: progressPercent(20 + completedSessions * 3),
      tone: "blue" as const,
    },
    {
      label: tr("Confidence", "Confianza"),
      value: progressPercent(Number(latestConfidence ?? 0) * 10),
      tone: "gold" as const,
    },
    {
      label: tr("Vocabulary range", "Rango de vocabulario"),
      value: progressPercent(10 + completedLessons * 3 + totalProgress * 0.1),
      tone: "blue" as const,
    },
    {
      label: tr("Natural rhythm", "Ritmo natural"),
      value: progressPercent(8 + completedSessions * 4),
      tone: "blue" as const,
    },
    {
      label: tr("Work situations", "Situaciones de trabajo"),
      value: progressPercent(25 + completedMilestones * 10 + objectiveCompletion * 10),
      tone: "gold" as const,
    },
  ];
  const confidenceHistory = useMemo(() => {
    const latestByWeek = new Map<number, CheckIn>();

    for (const checkIn of data.checkIns) {
      if (typeof checkIn.confidence_score !== "number") continue;

      const existing = latestByWeek.get(checkIn.week_number);
      if (!existing) {
        latestByWeek.set(checkIn.week_number, checkIn);
        continue;
      }

      const existingStamp = Date.parse(existing.submitted_at || "") || 0;
      const nextStamp = Date.parse(checkIn.submitted_at || "") || 0;

      if (nextStamp >= existingStamp) {
        latestByWeek.set(checkIn.week_number, checkIn);
      }
    }

    return [...latestByWeek.values()]
      .sort((a, b) => a.week_number - b.week_number)
      .slice(-8);
  }, [data.checkIns]);
  const chartPoints = confidenceHistory.length
    ? confidenceHistory
    : latestConfidence
      ? [
          {
            id: "current-confidence",
            week_number: currentWeek,
            confidence_score: latestConfidence,
          } as CheckIn,
        ]
      : [];
  const confidenceAverage = chartPoints.length
    ? chartPoints.reduce((sum, item) => sum + Number(item.confidence_score ?? 0), 0) /
      chartPoints.length
    : 0;
  const confidenceDelta =
    chartPoints.length > 1
      ? Number(chartPoints[chartPoints.length - 1]?.confidence_score ?? 0) -
        Number(chartPoints[0]?.confidence_score ?? 0)
      : 0;
  const visibleMilestones = [...data.milestones]
    .sort((a, b) => {
      const orderDiff = (a.sort_order ?? 999) - (b.sort_order ?? 999);
      if (orderDiff !== 0) return orderDiff;
      const weekDiff = (a.target_week ?? 999) - (b.target_week ?? 999);
      if (weekDiff !== 0) return weekDiff;
      return String(a.target_date ?? "").localeCompare(String(b.target_date ?? ""));
    })
    .slice(0, 4);
  const chartRangeLabel = chartPoints.length
    ? chartPoints[0]?.week_number === chartPoints[chartPoints.length - 1]?.week_number
      ? `${tr("Week", "Semana")} ${chartPoints[0]?.week_number} ${tr("of", "de")} ${programWeeks}`
      : `${tr("Weeks", "Semanas")} ${chartPoints[0]?.week_number} - ${
          chartPoints[chartPoints.length - 1]?.week_number
        } ${tr("of", "de")} ${programWeeks}`
    : `${tr("Week", "Semana")} ${completedWeeks} ${tr("of", "de")} ${programWeeks}`;
  const deltaLabel =
    chartPoints.length > 1
      ? `${confidenceDelta >= 0 ? "↑" : "↓"} ${confidenceDelta >= 0 ? "+" : "-"}${Math.abs(confidenceDelta).toFixed(1)} ${tr("since week", "desde la semana")} ${chartPoints[0]?.week_number}`
      : tr("First confidence score logged", "Primera puntuacion de confianza registrada");
  const starsEarned = formatConfidenceValue(latestConfidence);
  const nextStarMilestone =
    chartPoints.length > 1
      ? `${confidenceDelta >= 0 ? "+" : ""}${formatConfidenceValue(confidenceDelta)} since week ${chartPoints[0]?.week_number}`
      : "Latest self-rating";

  return (
    <section className="student-main">
      <TopBar
        title={tr("My Progress", "Mi progreso")}
        subtitle={`${programName} · ${tr("Week", "Semana")} ${completedWeeks} ${tr("of", "de")} ${programWeeks}`}
      />
      <div className="student-content">
        <div className="student-progress-screen">
          <div className="student-progress-stats-grid">
            <div className="student-panel student-progress-stat-card">
              <div className="student-progress-stat-label">
                {tr("Program Complete", "Programa completado")}
              </div>
              <div className="student-progress-stat-value">
                <strong>{Math.floor((completedWeeks / programWeeks) * 100)}</strong>
                <small>%</small>
              </div>
              <div className="student-progress-stat-sub">
                {completedWeeks} {tr("of", "de")} {programWeeks} {tr("weeks", "semanas")}
              </div>
            </div>

            <div className="student-panel student-progress-stat-card">
              <div className="student-progress-stat-label">
                {tr("Sessions Attended", "Sesiones asistidas")}
              </div>
              <div className="student-progress-stat-value">
                <strong>{completedSessions}</strong>
                <small>/{sessionDenominator}</small>
              </div>
              <div className="student-progress-stat-sub">
                {sessionAttendance}% {tr("attendance", "asistencia")}
              </div>
            </div>

            <div
              className="student-panel student-progress-stat-card gold student-progress-stat-card-hidden"
              aria-hidden="true"
            >
              <div className="student-progress-stat-label">{tr("Confidence", "Confianza")}</div>
              <div className="student-progress-stat-value gold">
                <strong>★ {starsEarned}</strong>
              </div>
              <div className="student-progress-stat-sub">
                {tr("Next milestone at", "Siguiente hito en")} {nextStarMilestone}
              </div>
            </div>

            <div className="student-panel student-progress-stat-card gold">
              <div className="student-progress-stat-label">{tr("Confidence", "Confianza")}</div>
              <div className="student-progress-stat-value gold">
                <strong>{formatConfidenceValue(latestConfidence)}</strong>
                <small>/10</small>
              </div>
              <div className="student-progress-stat-sub">
                {chartPoints.length > 1
                  ? `${confidenceDelta >= 0 ? "+" : ""}${formatConfidenceValue(confidenceDelta)} ${tr("since week", "desde la semana")} ${chartPoints[0]?.week_number}`
                  : tr("Latest self-rating", "Autoevaluacion mas reciente")}
              </div>
            </div>

            <div className="student-panel student-progress-stat-card">
              <div className="student-progress-stat-label">
                {tr("Milestones Hit", "Hitos alcanzados")}
              </div>
              <div className="student-progress-stat-value">
                <strong>{completedMilestones}</strong>
              </div>
              <div className="student-progress-stat-sub">{rewardsLabel}</div>
            </div>
          </div>

          <div className="student-progress-main-grid">
            <section className="student-panel padded student-progress-card student-progress-skills-card">
              <div className="student-progress-card-head">
                <h2>{tr("Skill progression", "Progreso de habilidades")}</h2>
              </div>
              <div className="student-progress-lines">
                {skillProgress.map((item) => (
                  <div key={item.label} className="student-progress-line">
                    <div className="student-progress-line-label">{item.label}</div>
                    <div className="student-progress-line-track">
                      <div
                        className={`student-progress-line-fill ${item.tone}`}
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                    <div className="student-progress-line-value">{item.value}%</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="student-panel padded student-progress-card student-progress-milestones-card">
              <div className="student-progress-card-head">
                <h2>{tr("My milestones", "Mis hitos")}</h2>
                <button
                  type="button"
                  onClick={() => setScreen("milestones")}
                  className="student-progress-link"
                >
                  {tr("View all", "Ver todo")} →
                </button>
              </div>
              <div className="student-progress-milestone-list">
                {visibleMilestones.length ? (
                  visibleMilestones.map((milestone) => {
                    const done = milestoneIsComplete(milestone, data.student);
                    return (
                      <div key={milestone.id} className="student-progress-milestone-row">
                        <span
                          className={`student-progress-milestone-dot${done ? " done" : ""}`}
                        />
                        <div className="student-progress-milestone-copy">
                          <strong>{milestone.title}</strong>
                          <small>{milestoneMetaLine(milestone)}</small>
                        </div>
                        <span
                          className={`student-progress-milestone-status ${done ? "done" : "upcoming"}`}
                        >
                          {done ? tr("Done", "Completado") : tr("Upcoming", "Proximo")}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <EmptyState
                    text={tr(
                      "Milestones will appear here once Sena maps your journey.",
                      "Los hitos apareceran aqui cuando Sena trace tu recorrido.",
                    )}
                  />
                )}
              </div>
            </section>
          </div>

          <section className="student-panel padded student-progress-card student-progress-chart-card">
            <div className="student-progress-card-head student-progress-chart-head">
              <h2>{tr("Confidence over time", "Confianza a lo largo del tiempo")}</h2>
              <span>{chartRangeLabel}</span>
            </div>
            <div className="student-progress-chart-wrap">
              <StudentConfidenceTimeline
                points={chartPoints}
                currentWeek={completedWeeks}
                totalWeeks={programWeeks}
              />
            </div>
            <div className="student-progress-chart-footer">
              <span
                className={`student-progress-delta-pill${confidenceDelta >= 0 ? " positive" : " negative"}`}
              >
                {deltaLabel}
              </span>
              <span className="student-progress-average">
                {tr("Program avg", "Promedio del programa")}: {confidenceAverage.toFixed(1)}
              </span>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}

function StudentConfidenceTimeline({
  points,
  currentWeek,
  totalWeeks,
}: {
  points: Pick<CheckIn, "id" | "week_number" | "confidence_score">[];
  currentWeek: number;
  totalWeeks: number;
}) {
  const windowSize = Math.min(8, Math.max(1, totalWeeks));
  const displayEnd = Math.min(totalWeeks, Math.max(windowSize, currentWeek));
  const displayStart = Math.max(1, displayEnd - windowSize + 1);
  const visiblePoints = points
    .filter((point) => point.week_number >= displayStart && point.week_number <= displayEnd)
    .sort((a, b) => a.week_number - b.week_number);
  const width = 1180;
  const height = 188;
  const left = 28;
  const right = 18;
  const top = 18;
  const bottom = 38;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const visibleSpan = Math.max(1, displayEnd - displayStart);
  const weekToX = (week: number) => left + ((week - displayStart) / visibleSpan) * plotWidth;
  const scoreToY = (score: number) =>
    top + (1 - Math.max(0, Math.min(10, score)) / 10) * plotHeight;
  const coords = visiblePoints.map((point) => ({
    week: point.week_number,
    score: Number(point.confidence_score ?? 0),
    x: weekToX(point.week_number),
    y: scoreToY(Number(point.confidence_score ?? 0)),
  }));
  const linePath = coords.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;

    const previous = coords[index - 1];
    if (!previous) return path;

    const controlX = (previous.x + point.x) / 2;
    return `${path} C ${controlX} ${previous.y}, ${controlX} ${point.y}, ${point.x} ${point.y}`;
  }, "");
  const areaPath = coords.length
    ? `${linePath} L ${coords[coords.length - 1]?.x} ${height - bottom} L ${coords[0]?.x} ${height - bottom} Z`
    : "";
  const futurePath = coords.length && coords[coords.length - 1]?.week < displayEnd
    ? `M ${coords[coords.length - 1]?.x} ${coords[coords.length - 1]?.y} L ${weekToX(displayEnd)} ${coords[coords.length - 1]?.y}`
    : "";
  const labels = Array.from({ length: windowSize }, (_, index) => displayStart + index);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="student-progress-chart-svg"
      role="img"
      aria-label={translateCurrent("Confidence over time chart", "Grafico de confianza a lo largo del tiempo")}
    >
      <defs>
        <linearGradient id="student-progress-confidence-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c9a84c" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#c9a84c" stopOpacity="0" />
        </linearGradient>
      </defs>

      {[10, 8, 6, 4].map((tick) => {
        const y = scoreToY(tick);
        return (
          <g key={tick}>
            <text x="0" y={y + 4} className="student-progress-chart-tick">
              {tick}
            </text>
            <line
              x1={left}
              x2={width - right}
              y1={y}
              y2={y}
              className="student-progress-chart-grid"
            />
          </g>
        );
      })}

      {areaPath ? <path d={areaPath} fill="url(#student-progress-confidence-fill)" /> : null}
      {linePath ? <path d={linePath} className="student-progress-chart-line" /> : null}
      {futurePath ? <path d={futurePath} className="student-progress-chart-future" /> : null}

      {coords.map((point, index) => {
        const isLatest = index === coords.length - 1;
        const showScore = coords.length <= 4 || index === 0 || isLatest;
        const scoreOffset = coords.length <= 3 || index % 2 === 0 ? -12 : 18;

        return (
          <g key={`${point.week}-${point.x}`}>
            {isLatest ? (
              <circle
                cx={point.x}
                cy={point.y}
                r="10"
                className="student-progress-chart-dot-halo"
              />
            ) : null}
            <circle
              cx={point.x}
              cy={point.y}
              r={isLatest ? "5.5" : "4.5"}
              className={`student-progress-chart-dot${isLatest ? " latest" : ""}`}
            />
            {showScore ? (
              <text
                x={point.x}
                y={point.y + scoreOffset}
                textAnchor="middle"
                className={`student-progress-chart-score${isLatest ? " latest" : ""}`}
              >
                {point.score.toFixed(1)}
              </text>
            ) : null}
          </g>
        );
      })}

      {labels.map((week) => (
        <text
          key={week}
          x={weekToX(week)}
          y={height - 6}
          textAnchor="middle"
          className={`student-progress-chart-label${week > currentWeek ? " future" : ""}`}
        >
          {`${translateCurrent("Wk", "Sem")} ${week}`}
        </text>
      ))}
    </svg>
  );
}

function WeeklyCheckInScreen({ data }: { data: PortalData }) {
  const tr = useTranslate();
  const queryClient = useQueryClient();
  const currentWeek = data.student?.current_week ?? data.stats?.current_week ?? 1;
  const currentWeekCheckIn =
    data.checkIns.find((checkIn) => checkIn.week_number === currentWeek) ?? null;
  const [form, setForm] = useState({
    mood: currentWeekCheckIn?.mood ?? checkInMoods[1].value,
    confidence: String(currentWeekCheckIn?.confidence_score ?? 7),
    win_of_week: currentWeekCheckIn?.win_of_week ?? "",
    biggest_struggle: currentWeekCheckIn?.biggest_struggle ?? "",
    first_this_week: currentWeekCheckIn?.first_this_week ?? "",
    note_for_next: currentWeekCheckIn?.note_for_next ?? "",
  });

  useEffect(() => {
    setForm({
      mood: currentWeekCheckIn?.mood ?? checkInMoods[1].value,
      confidence: String(currentWeekCheckIn?.confidence_score ?? 7),
      win_of_week: currentWeekCheckIn?.win_of_week ?? "",
      biggest_struggle: currentWeekCheckIn?.biggest_struggle ?? "",
      first_this_week: currentWeekCheckIn?.first_this_week ?? "",
      note_for_next: currentWeekCheckIn?.note_for_next ?? "",
    });
  }, [currentWeekCheckIn?.id, currentWeek]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!supabase || !data.student) throw new Error("Your weekly check-in is not ready yet.");
      const payload = {
        student_id: data.student.id,
        week_number: currentWeek,
        mood: form.mood,
        mood_emoji: moodMeta(form.mood)?.emoji ?? null,
        confidence_score: Number(form.confidence),
        win_of_week: form.win_of_week.trim() || null,
        biggest_struggle: form.biggest_struggle.trim() || null,
        first_this_week: form.first_this_week.trim() || null,
        note_for_next: form.note_for_next.trim() || null,
        submitted_at: new Date().toISOString(),
        reviewed_at: null,
        status: "pending" as const,
      };

      if (currentWeekCheckIn?.id) {
        const { error } = await supabase
          .from("check_ins")
          .update(payload)
          .eq("id", currentWeekCheckIn.id);
        if (error) throw error;
        return;
      }

      const { error } = await supabase.from("check_ins").insert(payload);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["student-portal"] });
    },
  });

  if (!data.student) {
    return (
      <section className="student-main">
        <TopBar
          title={tr("Weekly Check-In", "Check-in semanal")}
          subtitle={`${weekLabel(currentWeek)} · ${tr("Takes about 3 minutes", "Toma unos 3 minutos")}`}
        />
        <div className="student-content">
          <EmptyState
            text={tr(
              "Your weekly check-in will unlock after your enrollment is connected.",
              "Tu check-in semanal se desbloqueara cuando tu inscripcion este conectada.",
            )}
          />
        </div>
      </section>
    );
  }

  return (
    <section className="student-main">
      <TopBar
        title={tr("Weekly Check-In", "Check-in semanal")}
        subtitle={`${weekLabel(currentWeek)} · ${tr("Takes about 3 minutes", "Toma unos 3 minutos")}`}
      />
      <div className="student-content">
        <div className="student-checkin-layout">
          <form
            className="student-settings-card"
            onSubmit={(event) => {
              event.preventDefault();
              mutation.mutate();
            }}
          >
            <SectionLabel>{weekLabel(currentWeek)}</SectionLabel>
            <h2>{tr("Share your real week", "Comparte tu semana real")}</h2>
            <p className="student-muted">
              {tr(
                "Log the win, struggle, and confidence level Sena should coach around next.",
                "Registra tu logro, tu desafio y el nivel de confianza que Sena debe trabajar despues.",
              )}
            </p>

            <div className="student-mood-grid">
              {checkInMoods.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, mood: item.value }))}
                  className={`student-mood-btn ${form.mood === item.value ? "active" : ""}`}
                >
                  <strong>{item.emoji}</strong>
                  <span>{moodLabel(item.value)}</span>
                </button>
              ))}
            </div>

            <label className="student-field">
              <span>{tr("Confidence score", "Nivel de confianza")}: {form.confidence}/10</span>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={form.confidence}
                onChange={(event) =>
                  setForm((current) => ({ ...current, confidence: event.target.value }))
                }
              />
            </label>

            <label className="student-field">
              <span>{tr("Win of the week", "Logro de la semana")}</span>
              <textarea
                rows={4}
                value={form.win_of_week}
                onChange={(event) =>
                  setForm((current) => ({ ...current, win_of_week: event.target.value }))
                }
                placeholder={tr(
                  "What went well in English this week?",
                  "Que salio bien en ingles esta semana?",
                )}
                required
              />
            </label>

            <label className="student-field">
              <span>{tr("Biggest struggle", "Mayor dificultad")}</span>
              <textarea
                rows={4}
                value={form.biggest_struggle}
                onChange={(event) =>
                  setForm((current) => ({ ...current, biggest_struggle: event.target.value }))
                }
                placeholder={tr(
                  "Where did you hesitate, avoid, or get stuck?",
                  "En que momento dudaste, evitaste o te atascaste?",
                )}
                required
              />
            </label>

            <label className="student-field">
              <span>{tr("A first this week", "Algo nuevo esta semana")}</span>
              <textarea
                rows={4}
                value={form.first_this_week}
                onChange={(event) =>
                  setForm((current) => ({ ...current, first_this_week: event.target.value }))
                }
                placeholder={tr(
                  "A first call, first presentation, first small win...",
                  "Primera llamada, primera presentacion, primer pequeno logro...",
                )}
              />
            </label>

            <label className="student-field">
              <span>{tr("Note for next session", "Nota para la proxima sesion")}</span>
              <textarea
                rows={4}
                value={form.note_for_next}
                onChange={(event) =>
                  setForm((current) => ({ ...current, note_for_next: event.target.value }))
                }
                placeholder={tr(
                  "What should Sena help you practice next?",
                  "En que deberia ayudarte Sena a practicar despues?",
                )}
              />
            </label>

            {currentWeekCheckIn?.admin_note && (
              <div className="student-note-card">
                <strong>{tr("Sena's latest note", "Ultima nota de Sena")}</strong>
                <p>{currentWeekCheckIn.admin_note}</p>
              </div>
            )}

            {mutation.error instanceof Error && <p className="student-error">{mutation.error.message}</p>}
            {mutation.isSuccess && (
              <p className="student-success">
                {tr(
                  "Your weekly check-in is saved and ready for Sena to review.",
                  "Tu check-in semanal esta guardado y listo para que Sena lo revise.",
                )}
              </p>
            )}

            <button
              type="submit"
              className="student-gold-btn student-panel-cta-gap"
              disabled={mutation.isPending}
            >
              {mutation.isPending
                ? tr("Saving...", "Guardando...")
                : currentWeekCheckIn
                  ? tr("Update weekly check-in", "Actualizar check-in semanal")
                  : tr("Submit weekly check-in", "Enviar check-in semanal")}
            </button>
          </form>

          <section className="student-panel padded">
            <SectionLabel>{tr("Check-In History", "Historial de check-ins")}</SectionLabel>
            <h3 className="student-panel-title">
              {tr("Your recent weekly updates", "Tus actualizaciones semanales recientes")}
            </h3>
            <div className="student-checkin-history">
              {data.checkIns.length ? (
                data.checkIns.map((checkIn) => (
                  <article key={checkIn.id} className="student-checkin-history-row">
                    <div>
                      <strong>{weekLabel(checkIn.week_number)}</strong>
                      <span>
                        {formatDate(checkIn.submitted_at)} · {checkIn.mood_emoji ?? moodMeta(checkIn.mood)?.emoji ?? "•"}{" "}
                        {checkIn.confidence_score ?? tr("N/A", "N/D")}/10
                      </span>
                    </div>
                    <StatusBadge status={checkIn.status} />
                    {checkIn.win_of_week && <p>{checkIn.win_of_week}</p>}
                    {checkIn.admin_note && (
                      <div className="student-note-card">
                        <strong>{tr("Sena's response", "Respuesta de Sena")}</strong>
                        <p>{checkIn.admin_note}</p>
                      </div>
                    )}
                  </article>
                ))
              ) : (
                <EmptyState
                  text={tr(
                    "Your check-in history will appear here after your first submission.",
                    "Tu historial de check-ins aparecera aqui despues de tu primer envio.",
                  )}
                />
              )}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}

function MilestonesScreen({ data }: { data: PortalData }) {
  const tr = useTranslate();
  const rows = [...data.milestones].sort(
    (a, b) =>
      (a.sort_order ?? 0) - (b.sort_order ?? 0) ||
      (a.target_week ?? Number.MAX_SAFE_INTEGER) - (b.target_week ?? Number.MAX_SAFE_INTEGER),
  );
  const completed = rows.filter((milestone) => milestoneIsComplete(milestone, data.student)).length;
  const progressPct = rows.length ? Math.round((completed / rows.length) * 100) : 0;

  return (
    <section className="student-main">
      <TopBar
        title={tr("Milestones", "Hitos")}
        subtitle={tr(
          "Your journey, marked in moments that matter",
          "Tu recorrido, marcado por momentos que importan",
        )}
      />
      <div className="student-content">
        <section className="milestone-journey student-milestone-journey">
          <div className="student-milestone-intro">
            <div className="student-milestone-kicker">
              {tr("Special Finish Line", "Meta final especial")}
            </div>
            <h2>{tr("Your Special Finish Line", "Tu meta final especial")}</h2>
            <p className="student-milestone-goal">
              {data.goal?.fluency_goal ??
                tr(
                  "Sena will set your special finish-line goal here.",
                  "Sena definira aqui tu meta final especial.",
                )}
            </p>
            <p className="student-milestone-question">
              {data.goal?.day_one_question ??
                tr(
                  "This special finish line captures the bigger transformation you are working toward, not just this week's tasks.",
                  "Esta meta final especial refleja la transformacion mas grande en la que estas trabajando, no solo las tareas de esta semana.",
                )}
            </p>
            <div className="student-milestone-summary">
              <span>
                {rows.length
                  ? currentAppLanguage() === "es"
                    ? `${completed} de ${rows.length} hito${rows.length === 1 ? "" : "s"} completado${rows.length === 1 ? "" : "s"}`
                    : `${completed} of ${rows.length} milestone${rows.length === 1 ? "" : "s"} complete`
                  : tr(
                      "Your milestone map will appear here soon.",
                      "Tu mapa de hitos aparecera aqui pronto.",
                    )}
              </span>
              <span>
                {data.student
                  ? tr("Current week", "Semana actual") + ` ${data.student.current_week}`
                  : tr("Journey starting", "El recorrido esta comenzando")}
              </span>
            </div>
            {!!rows.length && (
              <div className="student-milestone-progress">
                <span>{tr("Journey progress", "Progreso del recorrido")}</span>
                <div className="student-milestone-progress-track">
                  <div style={{ width: `${progressPct}%` }} />
                </div>
                <strong>{progressPct}%</strong>
              </div>
            )}
          </div>

          <div className="relative mx-auto mt-10 max-w-3xl">
            {!!rows.length && <div className="milestone-gold-line" />}
            {rows.length ? (
              <>
                {rows.map((milestone, index) => (
                  <StudentMilestoneTimelineCard
                    key={milestone.id}
                    milestone={milestone}
                    student={data.student}
                    side={index % 2 === 0 ? "left" : "right"}
                  />
                ))}
                <StudentMilestoneFinishLineCard goal={data.goal} pct={progressPct} />
              </>
            ) : (
              <div className="student-empty-card student-milestone-empty">
                {tr(
                  "Your milestone journey will appear here after Sena maps the bigger speaking goals.",
                  "Tu recorrido de hitos aparecera aqui cuando Sena trace los objetivos grandes de speaking.",
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}

function StudentMilestoneTimelineCard({
  milestone,
  student,
  side,
}: {
  milestone: Milestone;
  student: Student | null;
  side: "left" | "right";
}) {
  const complete = milestoneIsComplete(milestone, student);

  return (
    <div className={`milestone-timeline-row ${side}`}>
      <article className={`milestone-card ${complete ? "done" : ""}`}>
        <div className="student-milestone-card-kicker">
          {milestone.target_week
            ? `${translateCurrent("After week", "Despues de la semana")} ${milestone.target_week}`
            : translateCurrent("Milestone", "Hito")}{" "}
          · {milestone.target_date ? formatDate(milestone.target_date) : translateCurrent("Flexible timing", "Tiempo flexible")}
        </div>
        <h3 className="student-milestone-card-title">{milestone.title}</h3>
        <p className="student-milestone-card-body">
          {milestone.description ??
            translateCurrent(
              "Sena will add more detail for this milestone.",
              "Sena agregara mas detalle para este hito.",
            )}
        </p>
        <div className={`student-milestone-state ${complete ? "done" : ""}`}>
          {complete ? <Check className="h-3 w-3" /> : <Clock3 className="h-3 w-3" />}
          <span>
            {complete
              ? translateCurrent("Auto achieved", "Logrado automaticamente")
              : translateCurrent("In progress", "En progreso")}
          </span>
        </div>
      </article>
      <span className={`milestone-node ${complete ? "done" : ""}`} />
      <span className="milestone-spacer" />
    </div>
  );
}

function StudentMilestoneFinishLineCard({
  goal,
  pct,
}: {
  goal: PortalData["goal"];
  pct: number;
}) {
  const complete = pct >= 100;

  return (
    <div className="milestone-timeline-row finish right">
      <article className={`milestone-card finish ${complete ? "done" : ""}`}>
        <div className="milestone-finish-stars" aria-hidden="true">
          <span>*</span>
          <span>*</span>
          <span>*</span>
        </div>
        <div className="student-milestone-card-kicker">
          {translateCurrent("Special finish line", "Meta final especial")}
        </div>
        <h3 className="student-milestone-card-title">
          {translateCurrent("Your Special Finish Line", "Tu meta final especial")}
        </h3>
        <p className="student-milestone-card-body">
          {goal?.fluency_goal ??
            translateCurrent(
              "Sena will add your special finish-line goal here to define the final destination.",
              "Sena agregara aqui tu meta final especial para definir el destino final.",
            )}
        </p>
        <div className={`student-milestone-state ${complete ? "done" : ""}`}>
          <Check className="h-3 w-3" />
          <span>
            {complete
              ? translateCurrent("Reached", "Alcanzada")
              : translateCurrent("Final stretch", "Tramo final")}
          </span>
        </div>
      </article>
      <span className={`milestone-node finish ${complete ? "done" : ""}`} />
      <span className="milestone-spacer" />
    </div>
  );
}

function ContentLibraryScreen({ data }: { data: PortalData }) {
  const tr = useTranslate();
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);
  const libraryContent = useMemo(() => mergeReferenceContent(data.content), [data.content]);
  const byType = (type: string) =>
    libraryContent
      .filter((item) => item.media_type === type)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const shows = byType("show");
  const movies = byType("movie");
  const music = byType("music");
  const podcasts = byType("podcast");
  const books = byType("book");
  const readingSources = byType("reading_source");
  const playlists = byType("playlist");
  const activePlaylist = playlists.find((item) => item.id === activePlaylistId) ?? null;
  const activePlaylistItems = activePlaylist
    ? playlistItemsFor(activePlaylist, libraryContent)
    : [];

  return (
    <section className="student-main">
      <TopBar
        title={tr("Content Library", "Biblioteca de contenido")}
        subtitle={tr(
          "Find what you actually enjoy - every card opens the original source",
          "Encuentra lo que realmente disfrutas: cada tarjeta abre la fuente original",
        )}
      />
      <div className="admin-content-library">
        <div className="cl-wrap">
          <div className="cl-nav">
            <div className="cl-nav-title">
              Fluent with Sena <span>{tr("Library", "Biblioteca")}</span>
            </div>
            <div className="cl-dot" />
          </div>
          <div className="cl-main">
            <div className="cl-hero">
              <h1>{tr("English You Enjoy", "Ingles que disfrutas")}</h1>
              <p>
                {tr(
                  "Keep what you love and incorporate it into your daily routine - your commute, chores, or evenings. English you enjoy never feels like homework.",
                  "Conserva lo que amas e incorporalo a tu rutina diaria: tu trayecto, tus tareas o tus noches. El ingles que disfrutas nunca se siente como tarea.",
                )}
              </p>
            </div>
            <div className="cl-sections">
              <StudentContentSection
                title={tr("Watch - Shows", "Ver - Series")}
                isEmpty={!shows.length}
                emptyText={tr("No shows added yet.", "Aun no hay series agregadas.")}
              >
                <StudentContentShelf label={tr("Watch shows", "Ver series")}>
                  {shows.map((item) => (
                    <StudentLibraryPosterCard
                      key={item.id}
                      item={item}
                      fallbackKind={tr("TV Show", "Serie")}
                    />
                  ))}
                </StudentContentShelf>
              </StudentContentSection>
              <StudentContentSection
                title={tr("Watch - Movies", "Ver - Peliculas")}
                isEmpty={!movies.length}
                emptyText={tr("No movies added yet.", "Aun no hay peliculas agregadas.")}
              >
                <StudentContentShelf label={tr("Watch movies", "Ver peliculas")}>
                  {movies.map((item) => (
                    <StudentLibraryPosterCard
                      key={item.id}
                      item={item}
                      fallbackKind={tr("Movie", "Pelicula")}
                    />
                  ))}
                </StudentContentShelf>
              </StudentContentSection>
              <StudentContentSection
                title={tr("Sing", "Cantar")}
                isEmpty={!music.length}
                emptyText={tr("No music added yet.", "Aun no hay musica agregada.")}
              >
                <StudentContentShelf label={tr("Music", "Musica")}>
                  {music.map((item) => (
                    <StudentLibrarySquareCard key={item.id} item={item} />
                  ))}
                </StudentContentShelf>
              </StudentContentSection>
              <StudentContentSection
                title={tr("Listen - Podcasts", "Escuchar - Podcasts")}
                isEmpty={!podcasts.length}
                emptyText={tr("No podcasts added yet.", "Aun no hay podcasts agregados.")}
              >
                <div className="cl-pod-grid">
                  {podcasts.map((item) => (
                    <StudentLibraryPodcastCard key={item.id} item={item} />
                  ))}
                </div>
              </StudentContentSection>
              <StudentContentSection
                title={tr("Read", "Leer")}
                isEmpty={!books.length && !readingSources.length}
                emptyText={tr(
                  "No reading content added yet.",
                  "Aun no se agrego contenido de lectura.",
                )}
              >
                {!!books.length && (
                  <>
                    <div className="cl-mini-head">{tr("Books", "Libros")}</div>
                    <div className="cl-book-grid">
                      {books.map((item) => (
                        <StudentLibraryBookCard key={item.id} item={item} />
                      ))}
                    </div>
                  </>
                )}
                {!!readingSources.length && (
                  <>
                    <div className="cl-mini-head cl-mini-head-spaced">
                      {tr("Reading Sources", "Fuentes de lectura")}
                    </div>
                    <div className="cl-src-grid">
                      {readingSources.map((item) => (
                        <StudentLibrarySourceCard key={item.id} item={item} />
                      ))}
                    </div>
                  </>
                )}
              </StudentContentSection>
              <StudentContentSection
                title={tr(
                  "Playlists For What You're Working On",
                  "Listas para lo que estas trabajando",
                )}
                isEmpty={!playlists.length}
                emptyText={tr("No playlists added yet.", "Aun no hay listas agregadas.")}
              >
                <div className="cl-pl-grid">
                  {playlists.map((item) => (
                    <StudentLibraryPlaylistCard
                      key={item.id}
                      item={item}
                      active={item.id === activePlaylistId}
                      onOpen={() =>
                        setActivePlaylistId((current) => (current === item.id ? null : item.id))
                      }
                    />
                  ))}
                </div>
                {activePlaylist && (
                  <div className="cl-playlist-detail">
                    <div className="cl-playlist-detail-head">
                      <div>
                        <span>{tr("Curated playlist", "Lista curada")}</span>
                        <h3>{activePlaylist.title}</h3>
                        <p>{activePlaylist.description}</p>
                      </div>
                      <button
                        type="button"
                        className="student-outline-btn"
                        onClick={() => setActivePlaylistId(null)}
                      >
                        {tr("Close", "Cerrar")}
                      </button>
                    </div>
                    {activePlaylistItems.length ? (
                      <div className="cl-playlist-items">
                        {activePlaylistItems.map((item) => (
                          <a
                            key={item.id}
                            href={studentContentHref(item)}
                            target="_blank"
                            rel="noreferrer"
                            className="cl-playlist-item"
                          >
                            <span>{item.duration_label ?? formatMediaType(item.media_type)}</span>
                            <strong>{item.title}</strong>
                            <small>
                              {item.author_or_host ??
                                item.genre_tag ??
                                item.cefr_level ??
                                tr("Open", "Abrir")}
                            </small>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <div className="cl-empty">
                        {tr(
                          "No content is tagged for this playlist yet. Sena can add matching items as your focus changes.",
                          "Todavia no hay contenido etiquetado para esta lista. Sena puede agregar elementos a medida que cambie tu enfoque.",
                        )}
                      </div>
                    )}
                  </div>
                )}
              </StudentContentSection>
            </div>
            <div className="cl-footer">
              <p>
                {tr(
                  "All content links to its original source. Click any card to start watching, listening, or reading.",
                  "Todo el contenido enlaza a su fuente original. Haz clic en cualquier tarjeta para empezar a ver, escuchar o leer.",
                )}
              </p>
              <p>{tr("Property of Fluent with Sena LLC. All Rights Reserved.", "Propiedad de Fluent with Sena LLC. Todos los derechos reservados.")}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StudentContentSection({
  title,
  isEmpty,
  emptyText,
  children,
}: {
  title: string;
  isEmpty: boolean;
  emptyText: string;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="cl-sec-head">{title}</div>
      {isEmpty ? <div className="cl-empty">{emptyText}</div> : children}
    </section>
  );
}

function StudentContentShelf({ label, children }: { label: string; children: ReactNode }) {
  const shelfRef = useRef<HTMLDivElement | null>(null);

  const scrollShelf = (direction: "left" | "right") => {
    const shelf = shelfRef.current;
    if (!shelf) return;
    const distance = Math.max(240, shelf.clientWidth * 0.78);
    shelf.scrollBy({
      left: direction === "left" ? -distance : distance,
      behavior: "smooth",
    });
  };

  return (
    <div className="cl-shelf">
      <button
        type="button"
        className="cl-shelf-btn cl-shelf-btn-left"
        onClick={() => scrollShelf("left")}
        aria-label={translateCurrent("Scroll", "Desplazar") + ` ${label} ${translateCurrent("left", "a la izquierda")}`}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <div className="cl-scroll" ref={shelfRef}>
        {children}
      </div>
      <button
        type="button"
        className="cl-shelf-btn cl-shelf-btn-right"
        onClick={() => scrollShelf("right")}
        aria-label={translateCurrent("Scroll", "Desplazar") + ` ${label} ${translateCurrent("right", "a la derecha")}`}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function studentContentHref(item: ContentItem) {
  return item.external_url || "#";
}

function studentContentImage(item: ContentItem, shape: "poster" | "square" | "book") {
  if (item.thumbnail_url) return item.thumbnail_url;
  if (shape === "poster") {
    return "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=360&q=80";
  }
  if (shape === "book") {
    return "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=360&q=80";
  }
  return "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=360&q=80";
}

function studentPlaylistNode(tag?: string | null) {
  const className = "h-7 w-7";
  if (tag === "car") return <Car className={className} />;
  if (tag === "work") return <BriefcaseBusiness className={className} />;
  if (tag === "moon") return <Moon className={className} />;
  if (tag === "laugh") return <Smile className={className} />;
  if (tag === "fire") return <Flame className={className} />;
  return tag ?? ">";
}

function StudentLibraryPosterCard({
  item,
  fallbackKind,
}: {
  item: ContentItem;
  fallbackKind: string;
}) {
  return (
    <div className="cl-card-shell">
      <a href={studentContentHref(item)} target="_blank" rel="noreferrer" className="cl-card-v">
        <div className="cl-img">
          <img src={studentContentImage(item, "poster")} alt={item.title} />
        </div>
        <div className="cl-level">{item.cefr_level ?? translateCurrent("All", "Todos")}</div>
        <div className="cl-card-title">{item.title}</div>
        <div className="cl-card-sub">{item.author_or_host ?? fallbackKind}</div>
      </a>
    </div>
  );
}

function StudentLibrarySquareCard({ item }: { item: ContentItem }) {
  return (
    <div className="cl-card-shell">
      <a href={studentContentHref(item)} target="_blank" rel="noreferrer" className="cl-card-sq">
        <div className="cl-img-sq">
          <img src={studentContentImage(item, "square")} alt={item.title} />
        </div>
        <div className="cl-card-title">{item.title}</div>
        <div className="cl-card-sub">{item.author_or_host ?? translateCurrent("Music", "Musica")}</div>
      </a>
    </div>
  );
}

function StudentLibraryPodcastCard({ item }: { item: ContentItem }) {
  return (
    <div className="cl-card-shell">
      <a href={studentContentHref(item)} target="_blank" rel="noreferrer" className="cl-pod-card">
        <div className="cl-pod-dur">{item.duration_label ?? translateCurrent("LISTEN", "ESCUCHAR")}</div>
        <div className="cl-wave">
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="cl-pod-title">{item.title}</div>
        <div className="cl-pod-desc">
          {item.description ?? translateCurrent("Podcast immersion resource.", "Recurso de inmersion en podcast.")}
        </div>
        <span className="cl-pod-tag">{item.genre_tag ?? translateCurrent("Audio", "Audio")}</span>
      </a>
    </div>
  );
}

function StudentLibraryBookCard({ item }: { item: ContentItem }) {
  return (
    <div className="cl-card-shell">
      <a href={studentContentHref(item)} target="_blank" rel="noreferrer" className="cl-book-card">
        <div className="cl-book-cover">
          <img src={studentContentImage(item, "book")} alt={item.title} />
        </div>
        <div className="cl-level">{item.cefr_level ?? translateCurrent("All", "Todos")}</div>
        <div className="cl-book-title">{item.title}</div>
        <div className="cl-card-sub">{item.author_or_host ?? translateCurrent("Book", "Libro")}</div>
      </a>
    </div>
  );
}

function StudentLibrarySourceCard({ item }: { item: ContentItem }) {
  return (
    <div className="cl-card-shell">
      <a href={studentContentHref(item)} target="_blank" rel="noreferrer" className="cl-src-card">
        <div className="cl-src-label">{item.author_or_host ?? translateCurrent("Source", "Fuente")}</div>
        <div className="cl-src-title">{item.title}</div>
        <div className="cl-src-desc">
          {item.description ??
            item.genre_tag ??
            translateCurrent("Reading immersion.", "Inmersion de lectura.")}
        </div>
      </a>
    </div>
  );
}

function StudentLibraryPlaylistCard({
  item,
  active,
  onOpen,
}: {
  item: ContentItem;
  active: boolean;
  onOpen: () => void;
}) {
  return (
    <div className="cl-card-shell">
      <button type="button" className={`cl-pl-card${active ? " active" : ""}`} onClick={onOpen}>
        <div className="cl-pl-icon">{studentPlaylistNode(item.genre_tag)}</div>
        <div className="cl-pl-title">{item.title}</div>
        <div className="cl-pl-desc">
          {item.description ??
            translateCurrent(
              "Curated resources for focused practice.",
              "Recursos curados para una practica enfocada.",
            )}
        </div>
        <div className="cl-pl-count">
          {item.duration_label ?? translateCurrent("Open playlist ->", "Abrir lista ->")}
        </div>
      </button>
    </div>
  );
}

function CourseLibraryScreen({
  data,
  onCourseClick,
}: {
  data: PortalData;
  onCourseClick: (course: Course) => void;
}) {
  const tr = useTranslate();
  const [filter, setFilter] = useState("all");
  const filtered = data.courses.filter((course) => {
    const pct = courseProgress(course, data.progress);
    if (filter === "completed") return pct === 100;
    if (filter === "in_progress") return pct > 0 && pct < 100;
    return true;
  });

  return (
    <section className="student-main">
      <TopBar
        title={tr("Course Library", "Biblioteca de cursos")}
        subtitle={tr(
          "Courses and lessons assigned to your journey",
          "Cursos y lecciones asignados a tu recorrido",
        )}
      />
      <div className="student-content">
        <FilterTabs
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: tr("All Courses", "Todos los cursos") },
            { value: "in_progress", label: tr("In Progress", "En progreso") },
            { value: "completed", label: tr("Completed", "Completados") },
          ]}
        />
        <div className="student-course-grid">
          {filtered.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              progress={courseProgress(course, data.progress)}
              onClick={() => onCourseClick(course)}
            />
          ))}
        </div>
        {!filtered.length && (
          <EmptyState
            text={tr(
              "No courses match this filter yet.",
              "Todavia no hay cursos que coincidan con este filtro.",
            )}
          />
        )}
      </div>
    </section>
  );
}

function CourseDetailScreen({
  data,
  course,
  onBack,
}: {
  data: PortalData;
  course: Course;
  onBack: () => void;
}) {
  const queryClient = useQueryClient();
  const lessons = lessonsFor(course);
  const byLesson = new Map(data.progress.map((item) => [item.lesson_id, item]));
  const mutation = useMutation({
    mutationFn: async (lesson: Lesson) => {
      if (!supabase || !data.student) throw new Error("Your enrollment is not ready yet.");
      const existing = byLesson.get(lesson.id);
      const nextStatus = existing?.status === "completed" ? "in_progress" : "completed";
      const { error } = await supabase.from("student_lesson_progress").upsert(
        {
          student_id: data.student.id,
          lesson_id: lesson.id,
          status: nextStatus,
          progress_pct: nextStatus === "completed" ? 100 : 50,
          last_watched_at: new Date().toISOString(),
          completed_at: nextStatus === "completed" ? new Date().toISOString() : null,
        },
        { onConflict: "student_id,lesson_id" },
      );
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["student-portal"] }),
  });

  return (
    <section className="student-main">
      <TopBar
        title={course.title}
        subtitle={`${course.category ?? tr("Course", "Curso")} · ${courseProgress(course, data.progress)}% ${tr("complete", "completado")}`}
      />
      <div className="student-content">
        <button type="button" onClick={onBack} className="student-back-btn">
          <ChevronLeft className="h-4 w-4" />
          {tr("Back to courses", "Volver a los cursos")}
        </button>
        <div className="student-course-detail">
          <div className="student-course-hero">
            <img
              src={
                course.thumbnail_url ??
                "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&q=70"
              }
              alt=""
            />
            <div>
              <span>{course.category ?? tr("Course", "Curso")}</span>
              <h2>{course.title}</h2>
              <p>
                {course.description ??
                  tr(
                    "Personalized professional English practice.",
                    "Practica personalizada de ingles profesional.",
                  )}
              </p>
              <ProgressBar value={courseProgress(course, data.progress)} />
            </div>
          </div>
          <div className="student-lessons">
            <h3>{tr("Lessons", "Lecciones")}</h3>
            {lessons.map((lesson) => {
              const progress = byLesson.get(lesson.id);
              const done = progress?.status === "completed";
              return (
                <button
                  type="button"
                  key={lesson.id}
                  onClick={() => mutation.mutate(lesson)}
                  className={`student-lesson-row ${done ? "done" : ""}`}
                >
                  <span className="student-check">
                    {done ? <Check className="h-3.5 w-3.5" /> : (lesson.sort_order ?? 1)}
                  </span>
                  <span>
                    <strong>{lesson.title}</strong>
                    <small>{lesson.description ?? lesson.unitTitle}</small>
                  </span>
                </button>
              );
            })}
            {!lessons.length && (
              <EmptyState text={tr("Lessons will appear here soon.", "Las lecciones apareceran aqui pronto.")} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function RecordingsScreen({ data }: { data: PortalData }) {
  const tr = useTranslate();
  const [expanded, setExpanded] = useState<string | null>(null);
  const recordings = useMemo(() => buildRecordings(data), [data, tr]);
  const latestRecording = recordings[0] ?? null;
  const totalMinutes = recordings.reduce((sum, recording) => sum + recording.durationMinutes, 0);
  const notesCount = recordings.filter((recording) => !!recording.transcript).length;
  return (
    <section className="student-main">
      <TopBar
        title={tr("Recording History", "Historial de grabaciones")}
        subtitle={tr(
          "Review past sessions and revisit key moments anytime",
          "Revisa sesiones pasadas y vuelve a momentos clave en cualquier momento",
        )}
      />
      <div className="student-content">
        <section className="student-recordings-hero">
          <div className="student-recordings-identity">
            <div className="student-recordings-avatar">{initials(data.profile)}</div>
            <div>
              <SectionLabel>{tr("Private Replay Archive", "Archivo privado de repeticiones")}</SectionLabel>
              <h2>{fullName(data.profile)}</h2>
              <p>
                {tr(
                  "Review past speaking sessions, replay key moments, and revisit your transcripts or session notes in one organized place.",
                  "Revisa sesiones de speaking pasadas, vuelve a momentos clave y repasa tus transcripciones o notas de sesion en un solo lugar organizado.",
                )}
              </p>
            </div>
          </div>
          <div className="student-recordings-stats">
            <div className="student-recordings-stat">
              <span>{tr("Saved recordings", "Grabaciones guardadas")}</span>
              <strong>{recordings.length}</strong>
              <small>{tr("Ready to watch", "Listas para ver")}</small>
            </div>
            <div className="student-recordings-stat">
              <span>{tr("Total replay time", "Tiempo total de repeticiones")}</span>
              <strong>{formatRecordingTotal(totalMinutes)}</strong>
              <small>{tr("Across your archive", "En todo tu archivo")}</small>
            </div>
            <div className="student-recordings-stat">
              <span>{tr("Notes available", "Notas disponibles")}</span>
              <strong>{notesCount}</strong>
              <small>{tr("Transcripts or session notes", "Transcripciones o notas de sesion")}</small>
            </div>
          </div>
        </section>

        {latestRecording && (
          <section className="student-recordings-feature">
            <div className="student-recordings-feature-main">
              <SectionLabel>{tr("Latest Recording", "Grabacion mas reciente")}</SectionLabel>
              <h3>{latestRecording.title}</h3>
              <div className="student-recordings-feature-meta">
                {latestRecording.sessionLabel && <span>{latestRecording.sessionLabel}</span>}
                <span>{formatDate(latestRecording.date)}</span>
                <span>{latestRecording.duration}</span>
              </div>
                <p>
                  {latestRecording.detail ??
                    tr(
                      "Come back here anytime to repeat vocabulary, review corrections, and hear your speaking progress.",
                      "Vuelve aqui cuando quieras para repetir vocabulario, revisar correcciones y escuchar tu progreso al hablar.",
                    )}
                </p>
              <div className="student-recordings-feature-actions">
                {latestRecording.url ? (
                  <a
                    href={latestRecording.url}
                    target="_blank"
                    rel="noreferrer"
                    className="student-blue-btn"
                  >
                    {tr("Watch Recording", "Ver grabacion")}
                  </a>
                ) : (
                  <span className="student-status pending">{tr("Processing", "Procesando")}</span>
                )}
              </div>
            </div>
            <div className="student-recordings-feature-side">
              <span className="student-recordings-feature-badge">
                {latestRecording.sourceLabel}
              </span>
              {latestRecording.transcript ? (
                <div className="student-note-card">
                  <strong>{latestRecording.notesLabel}</strong>
                  <p>{previewRecordingNotes(latestRecording.transcript)}</p>
                </div>
              ) : (
                <div className="student-note-card">
                  <strong>{tr("Replay tip", "Consejo para la repeticion")}</strong>
                  <p>
                    {tr(
                      "Rewatch this session and pause after your answers to practice a stronger version out loud.",
                      "Vuelve a ver esta sesion y haz pausas despues de tus respuestas para practicar una version mas solida en voz alta.",
                    )}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        <section className="student-recordings-section">
          <div className="student-recordings-section-head">
            <div>
              <SectionLabel>{tr("All Replays", "Todas las repeticiones")}</SectionLabel>
              <h3>{tr("Recording history", "Historial de grabaciones")}</h3>
            </div>
            <p>
              {recordings.length
                ? currentAppLanguage() === "es"
                  ? `${recordings.length} repeticion${recordings.length === 1 ? "" : "es"} disponible${recordings.length === 1 ? "" : "s"}`
                  : `${recordings.length} replay${recordings.length === 1 ? "" : "s"} available`
                : tr(
                    "Your replay history will appear here after Zoom finishes processing sessions.",
                    "Tu historial de repeticiones aparecera aqui cuando Zoom termine de procesar las sesiones.",
                  )}
            </p>
          </div>
          <div className="student-recordings-stack">
            {recordings.map((recording) => (
              <RecordingHistoryCard
                key={recording.id}
                recording={recording}
                expanded={expanded === recording.id}
                onToggle={() => setExpanded(expanded === recording.id ? null : recording.id)}
              />
            ))}
            {!recordings.length && (
              <div className="student-empty-card">
                {tr(
                  "Recordings will appear after Zoom finishes processing them.",
                  "Las grabaciones apareceran cuando Zoom termine de procesarlas.",
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}

function LiveSessionsScreen({ data }: { data: PortalData }) {
  const tr = useTranslate();
  const [filter, setFilter] = useState("all");
  const timezone = data.profile.timezone ?? "America/New_York";
  const sessions = data.sessions.filter((session) => {
    if (filter === "upcoming") return ["scheduled", "live"].includes(session.status);
    if (filter === "completed") return session.status === "completed";
    return true;
  });
  const upcoming = data.sessions.find((session) => ["scheduled", "live"].includes(session.status));

  return (
    <section className="student-main">
      <TopBar
        title={tr("Live Sessions", "Sesiones en vivo")}
        subtitle={tr(
          "Your schedule, links, and completed replays",
          "Tu horario, enlaces y repeticiones completadas",
        )}
      />
      <div className="student-content">
        <FilterTabs
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: tr("All Sessions", "Todas las sesiones") },
            { value: "upcoming", label: tr("Upcoming", "Proximas") },
            { value: "completed", label: tr("Completed", "Completadas") },
          ]}
        />
        {upcoming && (
          <section className="student-upcoming">
            <div>
              <SectionLabel>{tr("Upcoming Live Session", "Proxima sesion en vivo")}</SectionLabel>
              <h2>
                {upcoming.focus_topic ?? tr("Next Live Session with Sena", "Proxima sesion en vivo con Sena")}
              </h2>
              <div className="student-session-meta-grid">
                <div>
                  <span>{tr("Scheduled at", "Programada para")}</span>
                  <strong>{formatDateTime(upcoming.scheduled_at, timezone)}</strong>
                </div>
                <div>
                  <span>{tr("Week / Session", "Semana / Sesion")}</span>
                  <strong>{weekSessionLabel(upcoming.week_number, upcoming.session_number)}</strong>
                </div>
              </div>
              {upcoming.zoom_join_url && (
                <a
                  href={upcoming.zoom_join_url}
                  target="_blank"
                  rel="noreferrer"
                  className="student-gold-btn"
                >
                  {tr("Join Zoom", "Entrar a Zoom")}
                </a>
              )}
            </div>
            <div>
              <span>{tr("Session starts in", "La sesion empieza en")}</span>
              <strong>{getCountdown(upcoming.scheduled_at)}</strong>
            </div>
          </section>
        )}
        <div className="student-list-card">
          {sessions.map((session) => (
            <SessionRow key={session.id} session={session} timezone={timezone} />
          ))}
          {!sessions.length && (
            <EmptyState
              text={tr("No sessions match this filter.", "No hay sesiones que coincidan con este filtro.")}
            />
          )}
        </div>
      </div>
    </section>
  );
}

function studentJournalTypeLabel(type: JournalEntry["entry_type"]) {
  if (type === "phrase_bank") return translateCurrent("Phrase Bank", "Banco de frases");
  if (type === "question") return translateCurrent("Questions", "Preguntas");
  return translateCurrent("Session Notes", "Notas de sesion");
}

function studentJournalAddLabel(type: JournalEntry["entry_type"]) {
  if (type === "phrase_bank") return translateCurrent("Add Phrase", "Agregar frase");
  if (type === "question") return translateCurrent("Add Question", "Agregar pregunta");
  return translateCurrent("Add Session Note", "Agregar nota de sesion");
}

function studentJournalWeekColor(week?: number | null) {
  const colors = ["#c9a84c", "#5ba3d4", "#d4875b", "#8ccf9b", "#c58adf", "#f2d06b"];
  if (!week) return colors[0];
  return colors[(week - 1) % colors.length];
}

function studentPhraseLines(content?: string | null) {
  return (content ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function escapeStudentRichText(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatStudentRichInline(text: string) {
  return escapeStudentRichText(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

function studentRichTextHtml(content?: string | null) {
  const trimmed = (content ?? "").trim();
  if (!trimmed) return "";

  return trimmed
    .split(/\r?\n\s*\r?\n/)
    .map((block) => {
      const lines = block
        .split(/\r?\n/)
        .map((line) => line.trimEnd())
        .filter((line) => line.trim().length > 0);

      if (!lines.length) return "";

      const isList = lines.every((line) => /^[-*•]\s+/.test(line.trim()));
      if (isList) {
        return `<ul>${lines
          .map((line) =>
            `<li>${formatStudentRichInline(line.trim().replace(/^[-*•]\s+/, ""))}</li>`,
          )
          .join("")}</ul>`;
      }

      return `<p>${lines.map((line) => formatStudentRichInline(line.trim())).join("<br />")}</p>`;
    })
    .join("");
}

function StudentRichText({
  content,
  className = "student-journal-rich-block",
}: {
  content?: string | null;
  className?: string;
}) {
  const html = studentRichTextHtml(content);
  if (!html) return null;
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

function StudentJournalsScreen({
  data,
  setScreen,
}: {
  data: PortalData;
  setScreen: (screen: PortalScreen) => void;
}) {
  const tr = useTranslate();
  void setScreen;
  const [addingType, setAddingType] = useState<JournalEntry["entry_type"] | null>(null);
  const currentWeek = currentWeekNumber(data);
  const phraseRows = useMemo(
    () =>
      [...data.journals]
        .filter((entry) => entry.entry_type === "phrase_bank")
        .sort(
          (a, b) =>
            (a.week_number ?? Number.MAX_SAFE_INTEGER) -
              (b.week_number ?? Number.MAX_SAFE_INTEGER) ||
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        )
        .flatMap((entry) => {
          const phrases = studentPhraseLines(entry.content);
          if (!phrases.length) {
            return [
              {
                id: `${entry.id}-empty`,
                weekLabel: weekShortLabel(entry.week_number),
                word: entry.topic ?? tr("Phrase", "Frase"),
                phrase: tr("No phrase added yet.", "Todavia no se agrego ninguna frase."),
              },
            ];
          }

          return phrases.map((phrase, index) => ({
            id: `${entry.id}-${index}`,
            weekLabel: weekShortLabel(entry.week_number),
            word: entry.topic ?? `${tr("Phrase", "Frase")} ${index + 1}`,
            phrase,
          }));
        }),
    [data.journals, tr],
  );
  const allSessionNotes = useMemo(() => {
    const clientNotes = data.journals
      .filter((entry) => entry.entry_type === "session_note" && entry.content.trim())
      .map((entry) => ({
        id: `journal-${entry.id}`,
        title: entry.topic?.trim() || tr("Session note", "Nota de sesion"),
        content: entry.content,
        contextNote: entry.context_note,
        date: entry.created_at,
        weekLabel: entry.week_number ? weekShortLabel(entry.week_number) : tr("Journal", "Diario"),
        sourceLabel: tr("Client note", "Nota del cliente"),
      }));

    const coachNotes = data.sessions
      .filter((session) => session.session_notes?.trim())
      .map((session) => ({
        id: `session-${session.id}`,
        title: session.focus_topic ?? sessionLabelNumber(session.session_number),
        content: session.session_notes ?? "",
        contextNote: session.recording_url
          ? tr("Replay available in Recording History.", "Repeticion disponible en el historial de grabaciones.")
          : null,
        date: session.scheduled_at,
        weekLabel: weekShortLabel(session.week_number),
        sourceLabel: tr("Coach note", "Nota de Sena"),
      }));

    return [...coachNotes, ...clientNotes].sort(
      (a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime(),
    );
  }, [data.journals, data.sessions, tr]);
  const sessionNotes = allSessionNotes.slice(0, 6);
  const questionEntries = useMemo(
    () =>
      [...data.journals]
        .filter((entry) => entry.entry_type === "question")
        .sort(
          (a, b) =>
            (b.week_number ?? 0) - (a.week_number ?? 0) ||
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        .slice(0, 6),
    [data.journals],
  );
  const sessionNotesCount = allSessionNotes.length;

  return (
    <section className="student-main">
      <TopBar
        title={tr("Journal", "Diario")}
        subtitle={tr(
          "Phrase bank, session notes, and questions for Sena",
          "Banco de frases, notas de sesion y preguntas para Sena",
        )}
      />
      <div className="student-content">
        <div className="student-journal-board">
          <section className="student-panel padded student-journal-table-panel">
            <div className="student-journal-panel-head">
                <h2>{tr("Phrase bank", "Banco de frases")}</h2>
            </div>

            <div className="student-journal-table">
              <div className="student-journal-table-head">
                <span>{tr("Week", "Semana")}</span>
                <span>{tr("Word", "Palabra")}</span>
                <span>{tr("Phrase", "Frase")}</span>
              </div>

              {phraseRows.length ? (
                phraseRows.map((row) => (
                  <div key={row.id} className="student-journal-table-row">
                    <span className="student-journal-week-cell">{row.weekLabel}</span>
                    <strong>{row.word}</strong>
                    <em>{row.phrase}</em>
                  </div>
                ))
              ) : (
                <div className="student-journal-table-row placeholder">
                  <span className="student-journal-week-cell">{weekShortLabel(currentWeek)}</span>
                  <strong>{tr("Add new...", "Agregar nuevo...")}</strong>
                  <em>
                    {tr(
                      "Phrase bank entries will appear here once Sena or you add them.",
                      "Las entradas del banco de frases apareceran aqui cuando Sena o tu las agreguen.",
                    )}
                  </em>
                </div>
              )}
            </div>
          </section>

          <div className="student-journal-bottom-grid">
            <section className="student-panel padded student-journal-list-panel">
              <div className="student-journal-panel-head">
                <h2>{tr("Session notes", "Notas de sesion")}</h2>
              </div>

              <div className="student-journal-session-list">
                {sessionNotes.length ? (
                  sessionNotes.map((note) => (
                    <article key={note.id} className="student-journal-session-card">
                      <div className="student-journal-session-head">
                        <div>
                          <div className="student-journal-session-meta">
                            <span className="student-journal-source">{note.sourceLabel}</span>
                            <small>{`${note.weekLabel} · ${formatDate(note.date)}`}</small>
                          </div>
                          <strong>{note.title}</strong>
                        </div>
                      </div>
                      <StudentRichText content={note.content} />
                      {note.contextNote ? (
                        <div className="student-journal-session-note">
                          <span>{tr("Note", "Nota")}</span>
                          <StudentRichText content={note.contextNote} />
                        </div>
                      ) : null}
                    </article>
                  ))
                ) : (
                  <div className="student-journal-question-empty">
                    {tr(
                      "Session notes from you and Sena will appear here, with line breaks and simple formatting preserved.",
                      "Las notas de sesion tuyas y de Sena apareceran aqui, conservando los saltos de linea y el formato simple.",
                    )}
                  </div>
                )}
              </div>

              <div className="student-journal-question-actions">
                <button
                  type="button"
                  onClick={() => setAddingType("session_note")}
                  disabled={!data.student}
                  className="student-outline-btn"
                >
                  + {tr("Add session note", "Agregar nota de sesion")}
                </button>
                {sessionNotesCount ? (
                  <span className="student-journal-meta-note">
                    {currentAppLanguage() === "es"
                      ? `${sessionNotesCount} nota${sessionNotesCount === 1 ? "" : "s"} de sesion guardada${sessionNotesCount === 1 ? "" : "s"}`
                      : `${sessionNotesCount} session note${sessionNotesCount === 1 ? "" : "s"} saved`}
                  </span>
                ) : null}
              </div>
            </section>

            <section className="student-panel padded student-journal-question-panel">
              <div className="student-journal-panel-head">
                <h2>{tr("Questions for Sena", "Preguntas para Sena")}</h2>
              </div>

              {questionEntries.length ? (
                <div className="student-journal-question-list">
                  {questionEntries.map((entry) => (
                    <article key={entry.id} className="student-journal-question-card">
                      <div className="student-journal-question-head">
                        <strong>{entry.topic || tr("Question", "Pregunta")}</strong>
                        <small>
                          {entry.week_number ? weekShortLabel(entry.week_number) : tr("Journal", "Diario")}
                        </small>
                      </div>
                      <StudentRichText content={entry.content} />
                    </article>
                  ))}
                </div>
              ) : (
                <div className="student-journal-question-empty">
                  {tr(
                    "No questions yet this week. Something come up? Add it here.",
                    "Aun no hay preguntas esta semana. Si surge algo, agregalo aqui.",
                  )}
                </div>
              )}

              <div className="student-journal-question-actions">
                <button
                  type="button"
                  onClick={() => setAddingType("question")}
                  disabled={!data.student}
                  className="student-outline-btn"
                >
                  + {tr("Add question", "Agregar pregunta")}
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>

      {addingType && data.student && (
        <StudentJournalDialog
          data={data}
          entryType={addingType}
          weekNumber={currentWeek}
          onClose={() => setAddingType(null)}
        />
      )}
    </section>
  );
}

function StudentJournalCard({
  entry,
  type,
}: {
  entry: JournalEntry;
  type: JournalEntry["entry_type"];
}) {
  const tr = useTranslate();
  const phrases = studentPhraseLines(entry.content);
  return (
    <article className="student-journal-card">
      <div className="student-journal-card-head">
        <span>
          {type === "phrase_bank"
            ? tr("Vocabulary Word", "Palabra de vocabulario")
            : type === "question"
              ? tr("Question", "Pregunta")
              : tr("Note", "Nota")}
        </span>
        <small>{formatDate(entry.created_at)}</small>
      </div>
      <h3>{entry.topic || tr("Untitled", "Sin titulo")}</h3>
      {type === "phrase_bank" ? (
        <ol>
          {phrases.map((phrase, index) => (
            <li key={`${phrase}-${index}`}>{phrase}</li>
          ))}
          {!phrases.length && <li>{tr("No phrases yet.", "Aun no hay frases.")}</li>}
        </ol>
      ) : (
        <StudentRichText content={entry.content} className="student-journal-rich-block" />
      )}
      {entry.context_note && (
        <div className="student-journal-note">
          <span>{tr("Notes", "Notas")}</span>
          <StudentRichText content={entry.context_note} className="student-journal-rich-block" />
        </div>
      )}
    </article>
  );
}

function StudentJournalDialog({
  data,
  entryType,
  weekNumber,
  onClose,
}: {
  data: PortalData;
  entryType: JournalEntry["entry_type"];
  weekNumber: number;
  onClose: () => void;
}) {
  const tr = useTranslate();
  const queryClient = useQueryClient();
  const [topic, setTopic] = useState("");
  const [content, setContent] = useState("");
  const [phrases, setPhrases] = useState([""]);
  const [contextNote, setContextNote] = useState("");
  const mutation = useMutation({
    mutationFn: async () => {
      if (!supabase || !data.student) {
        throw new Error(
          tr("Your journal is not ready yet.", "Tu diario todavia no esta listo."),
        );
      }
      const finalContent =
        entryType === "phrase_bank"
          ? phrases
              .map((phrase) => phrase.trim())
              .filter(Boolean)
              .join("\n")
          : content.trim();
      const { error } = await supabase.from("journal_entries").insert({
        student_id: data.student.id,
        entry_type: entryType,
        week_number: weekNumber,
        topic: topic.trim() || null,
        content: finalContent,
        context_note: contextNote.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["student-portal"] });
      onClose();
    },
  });
  const topicLabel =
    entryType === "phrase_bank"
      ? tr("Vocabulary Word", "Palabra de vocabulario")
      : entryType === "question"
        ? tr("Question", "Pregunta")
        : tr("Session note title", "Titulo de la nota de sesion");

  return (
    <div className="student-modal-backdrop" role="presentation">
      <div className="student-modal" role="dialog" aria-modal="true">
        <div className="student-modal-head">
          <div>
            <h2>{studentJournalAddLabel(entryType)}</h2>
            <p>{weekLabel(weekNumber)}</p>
          </div>
          <button type="button" onClick={onClose} className="student-outline-btn">
            {tr("Close", "Cerrar")}
          </button>
        </div>
        <form
          className="student-journal-form"
          onSubmit={(event) => {
            event.preventDefault();
            mutation.mutate();
          }}
        >
          <label className="student-field">
            <span>{topicLabel}</span>
            <input value={topic} onChange={(event) => setTopic(event.target.value)} required />
          </label>

          {entryType === "phrase_bank" ? (
            <div className="student-journal-phrase-fields">
              {phrases.map((phrase, index) => (
                <label key={index} className="student-field">
                  <span>
                    {tr("Phrase", "Frase")} #{index + 1}
                  </span>
                  <input
                    value={phrase}
                    onChange={(event) =>
                      setPhrases((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index ? event.target.value : item,
                        ),
                      )
                    }
                  />
                </label>
              ))}
              <button
                type="button"
                onClick={() => setPhrases((current) => [...current, ""])}
                className="student-outline-btn"
              >
                <Plus className="h-3.5 w-3.5" />
                {tr("Add Phrase", "Agregar frase")}
              </button>
            </div>
          ) : (
            <label className="student-field">
              <span>
                {entryType === "question"
                  ? tr("Notes for extra context", "Notas para contexto extra")
                  : tr("Rich-text notes", "Notas con formato")}
              </span>
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                rows={7}
                required
                placeholder={tr(
                  "Use new lines, bullets, **bold**, and *italic* notes.",
                  "Usa nuevas lineas, listas, notas en **negrita** y *cursiva*.",
                )}
              />
            </label>
          )}

          {entryType !== "question" && (
            <label className="student-field">
              <span>{tr("Notes", "Notas")}</span>
              <textarea
                value={contextNote}
                onChange={(event) => setContextNote(event.target.value)}
                rows={4}
              />
            </label>
          )}

          {mutation.error instanceof Error && (
            <p className="student-error">{mutation.error.message}</p>
          )}
          <button type="submit" disabled={mutation.isPending} className="student-gold-btn">
            {mutation.isPending ? tr("Saving...", "Guardando...") : tr("Save", "Guardar")}
          </button>
        </form>
      </div>
    </div>
  );
}

function SettingsScreen({ data }: { data: PortalData }) {
  const tr = useTranslate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    first_name: data.profile.first_name ?? "",
    last_name: data.profile.last_name ?? "",
    email: data.profile.email,
    phone: data.profile.phone ?? "",
    whatsapp: data.profile.whatsapp ?? "",
    timezone: data.profile.timezone ?? "America/New_York",
  });
  const [password, setPassword] = useState({
    currentPassword: "",
    newPassword: "",
    confirm: "",
  });
  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirm: false,
  });

  const profileMutation = useMutation({
    mutationFn: async () => {
      if (!supabase) throw new Error("Student dashboard is not ready yet.");
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: form.first_name,
          last_name: form.last_name,
          phone: form.phone,
          whatsapp: form.whatsapp,
          timezone: form.timezone,
        })
        .eq("id", data.profile.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["student-portal"] }),
  });

  const passwordMutation = useMutation({
    mutationFn: async () => {
      if (!supabase) throw new Error("Student dashboard is not ready yet.");
      if (!password.currentPassword.trim()) {
        throw new Error("Enter your current password, or use the reset link below.");
      }
      if (password.newPassword.length < 8) throw new Error("Use at least 8 characters.");
      if (password.newPassword !== password.confirm) throw new Error("Passwords do not match.");

      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: data.profile.email,
        password: password.currentPassword,
      });
      if (verifyError) {
        throw new Error("Current password is incorrect. Use the reset link if you don't remember it.");
      }

      const { error } = await supabase.auth.updateUser({ password: password.newPassword });
      if (error) throw error;
    },
    onSuccess: () =>
      setPassword({
        currentPassword: "",
        newPassword: "",
        confirm: "",
      }),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async () => {
      if (!supabase) throw new Error("Student dashboard is not ready yet.");

      const redirectTo =
        typeof window !== "undefined" ? `${window.location.origin}/set-password` : undefined;
      const { error } = await supabase.auth.resetPasswordForEmail(data.profile.email, {
        redirectTo,
      });
      if (error) throw error;
    },
  });

  return (
    <section className="student-main">
      <TopBar
        title={tr("Settings", "Configuracion")}
        subtitle={tr("Your account and program details", "Los detalles de tu cuenta y programa")}
      />
      <div className="student-content narrow">
        <form
          className="student-settings-card"
          onSubmit={(event) => {
            event.preventDefault();
            profileMutation.mutate();
          }}
        >
          <h2>
            <User className="h-4 w-4" />
            {tr("Profile Information", "Informacion del perfil")}
          </h2>
          <div className="student-form-grid">
            <StudentInput
              label={tr("First Name", "Nombre")}
              value={form.first_name}
              onChange={(value) => setForm({ ...form, first_name: value })}
            />
            <StudentInput
              label={tr("Last Name", "Apellido")}
              value={form.last_name}
              onChange={(value) => setForm({ ...form, last_name: value })}
            />
          </div>
          <StudentInput
            label={tr("Email Address", "Correo electronico")}
            value={form.email}
            disabled
            onChange={() => undefined}
          />
          <div className="student-form-grid">
            <StudentInput
              label={tr("Phone Number", "Numero de telefono")}
              value={form.phone}
              onChange={(value) => setForm({ ...form, phone: value })}
            />
            <StudentInput
              label={tr("WhatsApp", "WhatsApp")}
              value={form.whatsapp}
              onChange={(value) => setForm({ ...form, whatsapp: value })}
            />
          </div>
          <div className="student-form-grid">
            <label className="student-field">
                <span>{tr("Time Zone", "Zona horaria")}</span>
              <select
                value={form.timezone}
                onChange={(event) => setForm({ ...form, timezone: event.target.value })}
              >
                {timezones.map((timezone) => (
                  <option key={timezone} value={timezone}>
                    {timezone}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {profileMutation.error instanceof Error && (
            <p className="student-error">{profileMutation.error.message}</p>
          )}
          {profileMutation.isSuccess && (
            <p className="student-success">{tr("Profile saved.", "Perfil guardado.")}</p>
          )}
          <button type="submit" className="student-blue-btn" disabled={profileMutation.isPending}>
            {profileMutation.isPending
              ? tr("Saving...", "Guardando...")
              : tr("Save Changes", "Guardar cambios")}
          </button>
        </form>

        <form
          className="student-settings-card"
          onSubmit={(event) => {
            event.preventDefault();
            passwordMutation.mutate();
          }}
        >
          <h2>
            <Settings className="h-4 w-4" />
            {tr("Account Security", "Seguridad de la cuenta")}
          </h2>
          <p className="student-muted">
            {tr(
              "For security, saved passwords cannot be displayed after they are created. Use the Show buttons while typing below, or email yourself a reset link if you forgot your current password.",
              "Por seguridad, las contrasenas guardadas no pueden mostrarse despues de ser creadas. Usa los botones Mostrar mientras escribes o enviate un enlace de restablecimiento si olvidaste tu contrasena actual.",
            )}
          </p>
          <div className="student-password-stack">
            <StudentPasswordInput
              label={tr("Current Password", "Contrasena actual")}
              visible={showPassword.currentPassword}
              onToggle={() =>
                setShowPassword((current) => ({
                  ...current,
                  currentPassword: !current.currentPassword,
                }))
              }
              value={password.currentPassword}
              onChange={(value) => setPassword({ ...password, currentPassword: value })}
            />
            <StudentPasswordInput
              label={tr("New Password", "Nueva contrasena")}
              visible={showPassword.newPassword}
              onToggle={() =>
                setShowPassword((current) => ({
                  ...current,
                  newPassword: !current.newPassword,
                }))
              }
              value={password.newPassword}
              onChange={(value) => setPassword({ ...password, newPassword: value })}
            />
            <StudentPasswordInput
              label={tr("Confirm New Password", "Confirmar nueva contrasena")}
              visible={showPassword.confirm}
              onToggle={() =>
                setShowPassword((current) => ({
                  ...current,
                  confirm: !current.confirm,
                }))
              }
              value={password.confirm}
              onChange={(value) => setPassword({ ...password, confirm: value })}
            />
          </div>
          {passwordMutation.error instanceof Error && (
            <p className="student-error">{passwordMutation.error.message}</p>
          )}
          {passwordMutation.isSuccess && (
            <p className="student-success">{tr("Password updated.", "Contrasena actualizada.")}</p>
          )}
          {resetPasswordMutation.error instanceof Error && (
            <p className="student-error">{resetPasswordMutation.error.message}</p>
          )}
          {resetPasswordMutation.isSuccess && (
            <p className="student-success">
              {tr(
                "Reset link sent. Open the email to choose a new password.",
                "Enlace de restablecimiento enviado. Abre el correo para elegir una nueva contrasena.",
              )}
            </p>
          )}
          <div className="student-settings-actions">
            <button type="submit" className="student-blue-btn" disabled={passwordMutation.isPending}>
              {passwordMutation.isPending
                ? tr("Updating...", "Actualizando...")
                : tr("Update Password", "Actualizar contrasena")}
            </button>
            <button
              type="button"
              className="student-outline-btn"
              disabled={resetPasswordMutation.isPending}
              onClick={() => resetPasswordMutation.mutate()}
            >
              {resetPasswordMutation.isPending
                ? tr("Sending reset link...", "Enviando enlace...")
                : tr("Email reset link", "Enviar enlace por correo")}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

function StudentPasswordInput({
  label,
  value,
  onChange,
  visible,
  onToggle,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggle: () => void;
}) {
  const tr = useTranslate();
  return (
    <label className="student-field student-password-field">
      <span>{label}</span>
      <div className="student-password-control">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <button type="button" className="student-password-toggle" onClick={onToggle}>
          {visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {visible ? tr("Hide", "Ocultar") : tr("Show", "Mostrar")}
        </button>
      </div>
    </label>
  );
}

function StudentInput({
  label,
  value,
  onChange,
  type = "text",
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <label className="student-field">
      <span>{label}</span>
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function CourseCard({
  course,
  progress,
  onClick,
}: {
  course: Course;
  progress: number;
  onClick: () => void;
}) {
  const tr = useTranslate();
  return (
    <button type="button" onClick={onClick} className="student-course-card">
      <div className="student-course-image">
        <img
          src={
            course.thumbnail_url ??
            "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=70"
          }
          alt=""
        />
        <span>{course.category ?? tr("Course", "Curso")}</span>
        <strong>{progress > 0 ? tr("Continue", "Continuar") : tr("Start", "Comenzar")}</strong>
      </div>
      <div className="student-course-body">
        <h3>{course.title}</h3>
        <p>
          {course.description ??
            tr(
              "Professional English practice for your goals.",
              "Practica de ingles profesional para tus objetivos.",
            )}
        </p>
        <ProgressBar value={progress} />
        <small>{progress}%</small>
      </div>
    </button>
  );
}

function buildRecordings(data: PortalData) {
  const sessionById = new Map(data.sessions.map((session) => [session.id, session]));
  const seenSessionIds = new Set<string>();
  const seenUrls = new Set<string>();
  const merged: Array<{
    id: string;
    title: string;
    date: string;
    duration: string;
    durationMinutes: number;
    url: string | null;
    transcript: string | null;
    notesLabel: string | null;
    sourceLabel: string;
    sessionLabel: string | null;
    detail: string | null;
  }> = [];

  for (const recording of data.recordings) {
    const linkedSession = recording.session_id ? sessionById.get(recording.session_id) : null;
    const url = recording.video_url ?? linkedSession?.recording_url ?? null;
    if (recording.session_id) seenSessionIds.add(recording.session_id);
    if (url) seenUrls.add(url);
    merged.push({
      id: `recording-${recording.id}`,
      title:
        recording.title ||
        linkedSession?.focus_topic ||
        (linkedSession
          ? sessionReplayTitle(linkedSession)
          : translateCurrent("Session replay", "Repeticion de sesion")),
      date: recording.recorded_at ?? linkedSession?.scheduled_at ?? "",
      duration: formatDuration(recording.duration_seconds, linkedSession?.duration_minutes ?? null),
      durationMinutes: recordingMinutes(
        recording.duration_seconds,
        linkedSession?.duration_minutes ?? null,
      ),
      url,
      transcript: recording.transcript_text ?? linkedSession?.session_notes ?? null,
      notesLabel: recording.transcript_text
        ? translateCurrent("Transcript", "Transcripcion")
        : linkedSession?.session_notes
          ? translateCurrent("Session notes", "Notas de sesion")
          : null,
      sourceLabel: linkedSession
        ? translateCurrent("Session replay", "Repeticion de sesion")
        : translateCurrent("Recording", "Grabacion"),
      sessionLabel: linkedSession ? sessionReplayLabel(linkedSession) : null,
      detail:
        linkedSession?.focus_topic && linkedSession.focus_topic !== recording.title
          ? linkedSession.focus_topic
          : null,
    });
  }

  for (const session of data.sessions) {
    if (!session.recording_url) continue;
    if (seenSessionIds.has(session.id) || seenUrls.has(session.recording_url)) continue;
    merged.push({
      id: `session-${session.id}`,
      title: session.focus_topic ?? sessionReplayTitle(session),
      date: session.scheduled_at,
      duration: formatDuration(null, session.duration_minutes),
      durationMinutes: recordingMinutes(null, session.duration_minutes),
      url: session.recording_url,
      transcript: session.session_notes,
      notesLabel: session.session_notes ? translateCurrent("Session notes", "Notas de sesion") : null,
      sourceLabel: translateCurrent("Session replay", "Repeticion de sesion"),
      sessionLabel: sessionReplayLabel(session),
      detail: session.focus_topic ? sessionReplayTitle(session) : null,
    });
  }

  return merged.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
}

function RecordingRow({
  recording,
  expanded,
  onToggle,
}: {
  recording: ReturnType<typeof buildRecordings>[number];
  expanded?: boolean;
  onToggle?: () => void;
}) {
  const tr = useTranslate();
  return (
    <div className={`student-recording-row ${expanded ? "open" : ""}`}>
      <button
        type="button"
        onClick={onToggle}
        className="student-play-btn"
        aria-label={tr("Open recording details", "Abrir detalles de la grabacion")}
      >
        <Play className="h-3 w-3 fill-current" />
      </button>
      <div>
        <strong>{recording.title}</strong>
        <span>
          {formatDate(recording.date)} · {recording.duration}
        </span>
      </div>
      {recording.url ? (
        <a href={recording.url} target="_blank" rel="noreferrer" className="student-outline-btn">
          {tr("Watch Recording", "Ver grabacion")}
        </a>
      ) : (
        <span className="student-muted">{tr("Processing", "Procesando")}</span>
      )}
    </div>
  );
}

function RecordingHistoryCard({
  recording,
  expanded,
  onToggle,
}: {
  recording: ReturnType<typeof buildRecordings>[number];
  expanded?: boolean;
  onToggle?: () => void;
}) {
  const tr = useTranslate();
  return (
    <article className={`student-recording-card ${expanded ? "expanded" : ""}`}>
      <div className="student-recording-card-main">
        <div className="student-recording-card-icon">
          <Video className="h-4 w-4" />
        </div>
        <div className="student-recording-card-body">
          <div className="student-recording-card-top">
            <span className="student-recording-source">{recording.sourceLabel}</span>
            {recording.sessionLabel && (
              <span className="student-recording-chip">{recording.sessionLabel}</span>
            )}
            {recording.notesLabel && (
              <span className="student-recording-chip">{recording.notesLabel}</span>
            )}
          </div>
          <h3>{recording.title}</h3>
          <div className="student-recording-card-meta">
            <span>
              <CalendarDays className="h-3.5 w-3.5" />
              {formatDate(recording.date)}
            </span>
            <span>
              <Clock3 className="h-3.5 w-3.5" />
              {recording.duration}
            </span>
          </div>
          {recording.detail && <p>{recording.detail}</p>}
        </div>
        <div className="student-recording-card-actions">
          {recording.notesLabel && (
            <button type="button" onClick={onToggle} className="student-outline-btn">
              {expanded
                ? `${tr("Hide", "Ocultar")} ${recording.notesLabel.toLowerCase()}`
                : `${tr("View", "Ver")} ${recording.notesLabel.toLowerCase()}`}
            </button>
          )}
          {recording.url ? (
            <a href={recording.url} target="_blank" rel="noreferrer" className="student-blue-btn">
              {tr("Watch Recording", "Ver grabacion")}
            </a>
          ) : (
            <span className="student-status pending">{tr("Processing", "Procesando")}</span>
          )}
        </div>
      </div>
      {expanded && recording.transcript && (
        <div className="student-recording-notes">
          <div className="student-recording-notes-head">
            <strong>{recording.notesLabel ?? tr("Session notes", "Notas de sesion")}</strong>
            <span>{formatDate(recording.date)}</span>
          </div>
          <pre className="student-transcript student-recording-transcript">
            {recording.transcript}
          </pre>
        </div>
      )}
    </article>
  );
}

function recordingMinutes(seconds?: number | null, minutes?: number | null) {
  if (minutes) return minutes;
  if (!seconds) return 0;
  return Math.max(1, Math.round(seconds / 60));
}

function formatRecordingTotal(totalMinutes: number) {
  if (!totalMinutes) return `0 ${translateCurrent("min", "min")}`;
  if (totalMinutes < 60) return `${totalMinutes} ${translateCurrent("min", "min")}`;
  const hours = totalMinutes / 60;
  return `${hours % 1 === 0 ? hours.toFixed(0) : hours.toFixed(1)} ${translateCurrent("hrs", "h")}`;
}

function sessionReplayTitle(session: LiveSession) {
  return weekSessionLabel(session.week_number, session.session_number);
}

function sessionReplayLabel(session: LiveSession) {
  return sessionLabelNumber(session.session_number);
}

function previewRecordingNotes(value: string) {
  const compact = value.replace(/\s+/g, " ").trim();
  if (compact.length <= 180) return compact;
  return `${compact.slice(0, 177).trim()}...`;
}

function SessionRow({ session, timezone }: { session: LiveSession; timezone: string }) {
  const tr = useTranslate();
  return (
    <div className="student-session-row">
      <div>
        <strong>
          {session.focus_topic ?? weekSessionLabel(session.week_number, session.session_number)}
        </strong>
        <div className="student-session-row-meta">
          <span>
            <small>{tr("Scheduled at", "Programada para")}</small>
            {formatDateTime(session.scheduled_at, timezone)}
          </span>
          <span>
            <small>{tr("Week / Session", "Semana / Sesion")}</small>
            {weekSessionLabel(session.week_number, session.session_number)}
          </span>
        </div>
      </div>
      <div className="student-session-actions">
        <StatusBadge status={session.status} />
        {session.zoom_join_url && ["scheduled", "live"].includes(session.status) && (
          <a
            href={session.zoom_join_url}
            target="_blank"
            rel="noreferrer"
            className="student-outline-btn"
          >
            {tr("Join Zoom", "Entrar a Zoom")}
          </a>
        )}
        {session.recording_url && (
          <a
            href={session.recording_url}
            target="_blank"
            rel="noreferrer"
            className="student-outline-btn"
          >
            {tr("Watch", "Ver")}
          </a>
        )}
      </div>
    </div>
  );
}

function FilterTabs({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="student-filter-tabs">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={value === option.value ? "active" : ""}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function PanelHeader({
  title,
  action,
  onAction,
}: {
  title: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <div className="student-panel-header">
      <h2>{title}</h2>
      <button type="button" onClick={onAction}>
        {action}
      </button>
    </div>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return <div className="student-section-label">{children}</div>;
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="student-progress">
      <span style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  let label = status.replace(/_/g, " ");
  if (status === "pending") label = translateCurrent("Pending", "Pendiente");
  else if (status === "reviewed") label = translateCurrent("Reviewed", "Revisado");
  else if (status === "scheduled") label = translateCurrent("Scheduled", "Programada");
  else if (status === "live") label = translateCurrent("Live", "En vivo");
  else if (status === "completed") label = translateCurrent("Completed", "Completada");
  else if (status === "cancelled") label = translateCurrent("Cancelled", "Cancelada");
  else if (status === "no_show") label = translateCurrent("No show", "Ausencia");
  return <span className={`student-status ${status}`}>{label}</span>;
}

function EmptyState({ text }: { text: string }) {
  return <div className="student-empty">{text}</div>;
}
