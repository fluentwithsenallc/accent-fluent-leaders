import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  Clock3,
  FileText,
  Home,
  Loader2,
  LogOut,
  Play,
  Plus,
  Settings,
  User,
  Video,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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

type PortalScreen = "dashboard" | "courses" | "recordings" | "sessions" | "journals" | "settings";

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
};

type Objective = {
  id: string;
  week_number: number;
  week_label: string | null;
  focus_title: string;
  context_for_student: string | null;
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

type PortalData = {
  profile: Profile;
  student: Student | null;
  stats: DashboardStat | null;
  sessions: LiveSession[];
  recordings: Recording[];
  courses: Course[];
  progress: LessonProgress[];
  content: ContentItem[];
  objectives: Objective[];
  journals: JournalEntry[];
};

const AUTH_REQUIRED = "AUTH_REQUIRED";
const STUDENT_REQUIRED = "STUDENT_REQUIRED";

const navItems = [
  { id: "dashboard" as const, label: "Dashboard", icon: Home },
  { id: "courses" as const, label: "Course Library", icon: BookOpen },
  { id: "recordings" as const, label: "Recordings", icon: Video },
  { id: "sessions" as const, label: "Live Sessions", icon: CalendarDays },
  { id: "journals" as const, label: "Client Journals", icon: FileText },
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

function fullName(profile?: Profile | null) {
  if (!profile) return "Student";
  return [profile.first_name, profile.last_name].filter(Boolean).join(" ") || profile.email;
}

function firstName(profile?: Profile | null) {
  return fullName(profile).split(" ")[0] || "there";
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

function formatDate(value?: string | null) {
  if (!value) return "Not scheduled";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateTime(value?: string | null, timezone = "America/New_York") {
  if (!value) return "Not scheduled";
  return new Intl.DateTimeFormat("en", {
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
  if (!seconds) return "Session replay";
  const totalMinutes = Math.max(1, Math.round(seconds / 60));
  return totalMinutes >= 60
    ? `${Math.floor(totalMinutes / 60)} hr ${totalMinutes % 60 ? `${totalMinutes % 60} min` : ""}`
    : `${totalMinutes} min`;
}

function getCountdown(value?: string | null) {
  if (!value) return "";
  const diff = new Date(value).getTime() - Date.now();
  if (diff <= 0) return "Starting soon";
  const hours = Math.floor(diff / 36e5);
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  if (days > 0) return `${days} day${days === 1 ? "" : "s"}, ${remainingHours} hours`;
  return `${Math.max(1, hours)} hour${hours === 1 ? "" : "s"}`;
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
  const journalsQuery = supabase
    .from("journal_entries")
    .select("*")
    .eq("student_id", userId)
    .order("week_number", { ascending: true })
    .order("created_at", { ascending: false });

  const [
    profile,
    student,
    stats,
    sessions,
    recordings,
    courses,
    progress,
    content,
    objectives,
    journals,
  ] = await Promise.all([
    profileQuery,
    studentQuery,
    statsQuery,
    sessionsQuery,
    recordingsQuery,
    coursesQuery,
    progressQuery,
    contentQuery,
    objectivesQuery,
    journalsQuery,
  ]);

  if (profile.error) throw profile.error;
  if ((profile.data as Profile | null)?.role !== "student") {
    throw new Error(STUDENT_REQUIRED);
  }
  if (student.error) throw student.error;
  if (stats.error) throw stats.error;
  if (sessions.error) throw sessions.error;
  if (recordings.error) throw recordings.error;
  if (courses.error) throw courses.error;
  if (progress.error) throw progress.error;
  if (content.error) throw content.error;
  if (objectives.error) throw objectives.error;
  if (journals.error) throw journals.error;

  return {
    profile: profile.data as Profile,
    student: student.data as Student | null,
    stats: stats.data as DashboardStat | null,
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
    journals: (journals.data ?? []) as JournalEntry[],
  };
}

function StudentPortal() {
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
        title="Student dashboard is not ready yet"
        body="Please contact Sena for access."
      />
    );
  }

  if (query.isLoading) {
    return (
      <PortalMessage
        title="Loading your dashboard"
        body="Getting your lessons, sessions, and recordings."
        loading
      />
    );
  }

  if (query.error instanceof Error) {
    const message =
      query.error.message === AUTH_REQUIRED
        ? "Please sign in before opening your dashboard."
        : query.error.message === STUDENT_REQUIRED
          ? "This dashboard is only available to student accounts."
          : query.error.message;
    return <PortalMessage title="We could not open your dashboard" body={message} />;
  }

  const data = query.data;
  if (!data) return null;

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
    if (screen === "courses")
      return <CourseLibraryScreen data={data} onCourseClick={setSelectedCourse} />;
    if (screen === "recordings") return <RecordingsScreen data={data} />;
    if (screen === "sessions") return <LiveSessionsScreen data={data} />;
    if (screen === "journals") return <StudentJournalsScreen data={data} />;
    if (screen === "settings") return <SettingsScreen data={data} />;
    return <DashboardScreen data={data} setScreen={handleNav} onCourseClick={setSelectedCourse} />;
  }

  return (
    <main className="student-dashboard">
      <aside className="student-sidebar">
        <div className="student-logo">
          <span>Fluent</span>
          <strong>with Sena</strong>
        </div>
        <nav className="student-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item.id)}
                className={`student-nav-item ${screen === item.id ? "active" : ""}`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="student-sidebar-foot">
          <button
            type="button"
            onClick={() => handleNav("settings")}
            className={`student-nav-item ${screen === "settings" ? "active" : ""}`}
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </button>
          <button type="button" onClick={handleSignOut} className="student-nav-item">
            <LogOut className="h-4 w-4" />
            <span>Sign out</span>
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
            Sign in
          </Link>
        )}
      </div>
    </main>
  );
}

function TopBar({ title, profile }: { title: string; profile: Profile }) {
  return (
    <header className="student-topbar">
      <h1>{title}</h1>
      <div className="student-userbar">
        <div className="student-user">
          <div className="student-avatar">{initials(profile)}</div>
          <span>{fullName(profile)}</span>
          <ChevronDown className="h-3.5 w-3.5 text-black/40" />
        </div>
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
  const latestObjective = data.objectives[0];
  const recentRecordings = buildRecordings(data).slice(0, 5);
  const stats = [
    {
      icon: BookOpen,
      label: "Lessons Completed",
      value:
        data.stats?.lessons_completed ??
        data.progress.filter((item) => item.status === "completed").length,
      tone: "gold",
    },
    {
      icon: Video,
      label: "Live Sessions Attended",
      value: data.stats?.sessions_completed ?? completedSessions.length,
      tone: "blue",
    },
    {
      icon: Clock3,
      label: "Hours Learned",
      value: Number(data.stats?.hours_learned ?? 0)
        .toFixed(1)
        .replace(".0", ""),
      tone: "gold",
    },
  ];

  return (
    <section className="student-main">
      <TopBar title="Dashboard" profile={data.profile} />
      <div className="student-content">
        <div className="student-welcome">
          <div>
            <h2>Welcome back, {firstName(data.profile)}</h2>
            <p>
              {formatDate(new Date().toISOString())} - Week{" "}
              {data.student?.current_week ?? data.stats?.current_week ?? 1}
            </p>
          </div>
          {data.student?.status && <StatusBadge status={data.student.status} />}
        </div>

        <div className="student-stats">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="student-stat-card">
                <div className="student-stat-label">
                  <Icon
                    className={`h-4 w-4 ${item.tone === "gold" ? "text-[#c9a84c]" : "text-[#1a3a5c]"}`}
                  />
                  <span>{item.label}</span>
                </div>
                <strong>{item.value}</strong>
              </div>
            );
          })}
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
                {latestObjective?.focus_title ?? "Your weekly focus"}
              </h3>
              <p className="student-muted">
                {latestObjective?.context_for_student ?? "Sena will add your next objectives here."}
              </p>
            </section>

            <section className="student-panel padded">
              <SectionLabel>English You Enjoy</SectionLabel>
              <div className="student-mini-list">
                {data.content.slice(0, 4).map((item) => (
                  <a key={item.id} href={item.external_url ?? "#"} target="_blank" rel="noreferrer">
                    <span>{item.title}</span>
                    <small>{item.genre_tag ?? item.media_type}</small>
                  </a>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </section>
  );
}

function CourseLibraryScreen({
  data,
  onCourseClick,
}: {
  data: PortalData;
  onCourseClick: (course: Course) => void;
}) {
  const [filter, setFilter] = useState("All Courses");
  const filtered = data.courses.filter((course) => {
    const pct = courseProgress(course, data.progress);
    if (filter === "Completed") return pct === 100;
    if (filter === "In Progress") return pct > 0 && pct < 100;
    return true;
  });

  return (
    <section className="student-main">
      <TopBar title="Course Library" profile={data.profile} />
      <div className="student-content">
        <FilterTabs
          value={filter}
          onChange={setFilter}
          options={["All Courses", "In Progress", "Completed"]}
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
        {!filtered.length && <EmptyState text="No courses match this filter yet." />}
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
      <TopBar title="Course Library" profile={data.profile} />
      <div className="student-content">
        <button type="button" onClick={onBack} className="student-back-btn">
          <ChevronLeft className="h-4 w-4" />
          Back to courses
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
              <span>{course.category ?? "Course"}</span>
              <h2>{course.title}</h2>
              <p>{course.description ?? "Personalized professional English practice."}</p>
              <ProgressBar value={courseProgress(course, data.progress)} />
            </div>
          </div>
          <div className="student-lessons">
            <h3>Lessons</h3>
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
            {!lessons.length && <EmptyState text="Lessons will appear here soon." />}
          </div>
        </div>
      </div>
    </section>
  );
}

function RecordingsScreen({ data }: { data: PortalData }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const recordings = buildRecordings(data);
  return (
    <section className="student-main">
      <TopBar title="Recording History" profile={data.profile} />
      <div className="student-content">
        <div className="student-list-card">
          {recordings.map((recording) => (
            <div key={recording.id}>
              <RecordingRow
                recording={recording}
                expanded={expanded === recording.id}
                onToggle={() => setExpanded(expanded === recording.id ? null : recording.id)}
              />
              {expanded === recording.id && recording.transcript && (
                <pre className="student-transcript">{recording.transcript}</pre>
              )}
            </div>
          ))}
          {!recordings.length && (
            <EmptyState text="Recordings will appear after Zoom finishes processing them." />
          )}
        </div>
      </div>
    </section>
  );
}

function LiveSessionsScreen({ data }: { data: PortalData }) {
  const [filter, setFilter] = useState("All Sessions");
  const timezone = data.profile.timezone ?? "America/New_York";
  const sessions = data.sessions.filter((session) => {
    if (filter === "Upcoming") return ["scheduled", "live"].includes(session.status);
    if (filter === "Completed") return session.status === "completed";
    return true;
  });
  const upcoming = data.sessions.find((session) => ["scheduled", "live"].includes(session.status));

  return (
    <section className="student-main">
      <TopBar title="Live Sessions" profile={data.profile} />
      <div className="student-content">
        <FilterTabs
          value={filter}
          onChange={setFilter}
          options={["All Sessions", "Upcoming", "Completed"]}
        />
        {upcoming && (
          <section className="student-upcoming">
            <div>
              <SectionLabel>Upcoming Live Session</SectionLabel>
              <h2>{upcoming.focus_topic ?? "Next Live Session with Sena"}</h2>
              <div className="student-session-meta-grid">
                <div>
                  <span>Scheduled at</span>
                  <strong>{formatDateTime(upcoming.scheduled_at, timezone)}</strong>
                </div>
                <div>
                  <span>Week / Session</span>
                  <strong>
                    Week {upcoming.week_number} · Session {upcoming.session_number}
                  </strong>
                </div>
              </div>
              {upcoming.zoom_join_url && (
                <a
                  href={upcoming.zoom_join_url}
                  target="_blank"
                  rel="noreferrer"
                  className="student-gold-btn"
                >
                  Join Zoom
                </a>
              )}
            </div>
            <div>
              <span>Session starts in</span>
              <strong>{getCountdown(upcoming.scheduled_at)}</strong>
            </div>
          </section>
        )}
        <div className="student-list-card">
          {sessions.map((session) => (
            <SessionRow key={session.id} session={session} timezone={timezone} />
          ))}
          {!sessions.length && <EmptyState text="No sessions match this filter." />}
        </div>
      </div>
    </section>
  );
}

function studentJournalTypeLabel(type: JournalEntry["entry_type"]) {
  if (type === "phrase_bank") return "Phrase Bank";
  if (type === "question") return "Questions";
  return "Session Notes";
}

function studentJournalAddLabel(type: JournalEntry["entry_type"]) {
  if (type === "phrase_bank") return "Add Phrase";
  if (type === "question") return "Add Question";
  return "Add Session Note";
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

function StudentJournalsScreen({ data }: { data: PortalData }) {
  const [type, setType] = useState<JournalEntry["entry_type"]>("phrase_bank");
  const allWeeks = Array.from(
    new Set(
      data.journals.map((entry) => entry.week_number).filter((week): week is number => !!week),
    ),
  ).sort((a, b) => a - b);
  const [selectedWeek, setSelectedWeek] = useState<number | "all">(allWeeks[0] ?? "all");
  const [adding, setAdding] = useState(false);
  const filtered = data.journals.filter((entry) => entry.entry_type === type);
  const visible =
    selectedWeek === "all"
      ? filtered
      : filtered.filter((entry) => entry.week_number === selectedWeek);
  const grouped = visible.reduce<Record<string, JournalEntry[]>>((acc, entry) => {
    const key = String(entry.week_number ?? "Unassigned");
    acc[key] = [...(acc[key] ?? []), entry];
    return acc;
  }, {});
  const activeWeek = selectedWeek === "all" ? allWeeks[0] : selectedWeek;

  return (
    <section className="student-main">
      <TopBar title="Client Journals" profile={data.profile} />
      <div className="student-content">
        <section className="student-journal-shell">
          <div className="student-journal-head">
            <div>
              <SectionLabel>Personal workspace</SectionLabel>
              <h2>{studentJournalTypeLabel(type)}</h2>
              <p>Review what Sena added and add your own words, questions, and weekly notes.</p>
            </div>
            <button
              type="button"
              onClick={() => setAdding(true)}
              disabled={!activeWeek || !data.student}
              className="student-gold-btn"
            >
              <Plus className="h-3.5 w-3.5" />
              {studentJournalAddLabel(type)}
            </button>
          </div>

          <div className="student-journal-tabs">
            {(["phrase_bank", "question", "session_note"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setType(item)}
                className={type === item ? "active" : ""}
              >
                {studentJournalTypeLabel(item)}
              </button>
            ))}
          </div>

          <div className="student-week-tabs">
            {allWeeks.map((week) => (
              <button
                key={week}
                type="button"
                onClick={() => setSelectedWeek(week)}
                className={selectedWeek === week ? "active" : ""}
              >
                <span style={{ background: studentJournalWeekColor(week) }} />
                Week {week}
              </button>
            ))}
          </div>

          {Object.entries(grouped).map(([week, entries]) => (
            <section key={week} className="student-journal-week">
              <div className="student-journal-week-title">
                <span style={{ background: studentJournalWeekColor(Number(week)) }} />
                <h3>{week === "Unassigned" ? "Unassigned" : `Week ${week}`}</h3>
              </div>
              <div className="student-journal-grid">
                {entries.map((entry) => (
                  <StudentJournalCard key={entry.id} entry={entry} type={type} />
                ))}
              </div>
            </section>
          ))}

          {!visible.length && (
            <div className="student-empty-card">
              {allWeeks.length
                ? `No ${studentJournalTypeLabel(type).toLowerCase()} for this week yet.`
                : "Your weekly journal spaces will appear after Sena creates your first week."}
            </div>
          )}
        </section>
      </div>
      {adding && data.student && activeWeek && (
        <StudentJournalDialog
          data={data}
          entryType={type}
          weekNumber={activeWeek}
          onClose={() => setAdding(false)}
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
  const phrases = studentPhraseLines(entry.content);
  return (
    <article className="student-journal-card">
      <div className="student-journal-card-head">
        <span>
          {type === "phrase_bank" ? "Vocabulary Word" : type === "question" ? "Question" : "Note"}
        </span>
        <small>{formatDate(entry.created_at)}</small>
      </div>
      <h3>{entry.topic || "Untitled"}</h3>
      {type === "phrase_bank" ? (
        <ol>
          {phrases.map((phrase, index) => (
            <li key={`${phrase}-${index}`}>{phrase}</li>
          ))}
          {!phrases.length && <li>No phrases yet.</li>}
        </ol>
      ) : (
        <p className="student-journal-rich">{entry.content}</p>
      )}
      {entry.context_note && (
        <div className="student-journal-note">
          <span>Notes</span>
          <p>{entry.context_note}</p>
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
  const queryClient = useQueryClient();
  const [topic, setTopic] = useState("");
  const [content, setContent] = useState("");
  const [phrases, setPhrases] = useState([""]);
  const [contextNote, setContextNote] = useState("");
  const mutation = useMutation({
    mutationFn: async () => {
      if (!supabase || !data.student) throw new Error("Your journal is not ready yet.");
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
      ? "Vocabulary Word"
      : entryType === "question"
        ? "Question"
        : "Session note title";

  return (
    <div className="student-modal-backdrop" role="presentation">
      <div className="student-modal" role="dialog" aria-modal="true">
        <div className="student-modal-head">
          <div>
            <h2>{studentJournalAddLabel(entryType)}</h2>
            <p>Week {weekNumber}</p>
          </div>
          <button type="button" onClick={onClose} className="student-outline-btn">
            Close
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
                  <span>Phrase #{index + 1}</span>
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
                Add Phrase
              </button>
            </div>
          ) : (
            <label className="student-field">
              <span>
                {entryType === "question" ? "Notes for extra context" : "Rich-text notes"}
              </span>
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                rows={7}
                required
                placeholder="Use new lines, bullets, **bold**, and *italic* notes."
              />
            </label>
          )}

          {entryType !== "question" && (
            <label className="student-field">
              <span>Notes</span>
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
            {mutation.isPending ? "Saving..." : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
}

function SettingsScreen({ data }: { data: PortalData }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    first_name: data.profile.first_name ?? "",
    last_name: data.profile.last_name ?? "",
    email: data.profile.email,
    phone: data.profile.phone ?? "",
    timezone: data.profile.timezone ?? "America/New_York",
  });
  const [password, setPassword] = useState({ newPassword: "", confirm: "" });

  const profileMutation = useMutation({
    mutationFn: async () => {
      if (!supabase) throw new Error("Student dashboard is not ready yet.");
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: form.first_name,
          last_name: form.last_name,
          phone: form.phone,
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
      if (password.newPassword.length < 8) throw new Error("Use at least 8 characters.");
      if (password.newPassword !== password.confirm) throw new Error("Passwords do not match.");
      const { error } = await supabase.auth.updateUser({ password: password.newPassword });
      if (error) throw error;
    },
    onSuccess: () => setPassword({ newPassword: "", confirm: "" }),
  });

  return (
    <section className="student-main">
      <TopBar title="Settings" profile={data.profile} />
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
            Profile Information
          </h2>
          <div className="student-form-grid">
            <StudentInput
              label="First Name"
              value={form.first_name}
              onChange={(value) => setForm({ ...form, first_name: value })}
            />
            <StudentInput
              label="Last Name"
              value={form.last_name}
              onChange={(value) => setForm({ ...form, last_name: value })}
            />
          </div>
          <StudentInput
            label="Email Address"
            value={form.email}
            disabled
            onChange={() => undefined}
          />
          <div className="student-form-grid">
            <StudentInput
              label="Phone Number"
              value={form.phone}
              onChange={(value) => setForm({ ...form, phone: value })}
            />
            <label className="student-field">
              <span>Time Zone</span>
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
          {profileMutation.isSuccess && <p className="student-success">Profile saved.</p>}
          <button type="submit" className="student-blue-btn" disabled={profileMutation.isPending}>
            {profileMutation.isPending ? "Saving..." : "Save Changes"}
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
            Account Security
          </h2>
          <div className="student-form-grid">
            <StudentInput
              label="New Password"
              type="password"
              value={password.newPassword}
              onChange={(value) => setPassword({ ...password, newPassword: value })}
            />
            <StudentInput
              label="Confirm New Password"
              type="password"
              value={password.confirm}
              onChange={(value) => setPassword({ ...password, confirm: value })}
            />
          </div>
          {passwordMutation.error instanceof Error && (
            <p className="student-error">{passwordMutation.error.message}</p>
          )}
          {passwordMutation.isSuccess && <p className="student-success">Password updated.</p>}
          <button type="submit" className="student-blue-btn" disabled={passwordMutation.isPending}>
            {passwordMutation.isPending ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </section>
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
        <span>{course.category ?? "Course"}</span>
        <strong>{progress > 0 ? "Continue" : "Start"}</strong>
      </div>
      <div className="student-course-body">
        <h3>{course.title}</h3>
        <p>{course.description ?? "Professional English practice for your goals."}</p>
        <ProgressBar value={progress} />
        <small>{progress}%</small>
      </div>
    </button>
  );
}

function buildRecordings(data: PortalData) {
  const standalone = data.recordings.map((recording) => ({
    id: `recording-${recording.id}`,
    title: recording.title,
    date: recording.recorded_at ?? "",
    duration: formatDuration(recording.duration_seconds),
    url: recording.video_url,
    transcript: recording.transcript_text,
  }));
  const fromSessions = data.sessions
    .filter((session) => session.recording_url)
    .map((session) => ({
      id: `session-${session.id}`,
      title: session.focus_topic ?? `Week ${session.week_number} Session ${session.session_number}`,
      date: session.scheduled_at,
      duration: formatDuration(null, session.duration_minutes),
      url: session.recording_url,
      transcript: session.session_notes,
    }));
  return [...standalone, ...fromSessions].sort(
    (a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime(),
  );
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
  return (
    <div className={`student-recording-row ${expanded ? "open" : ""}`}>
      <button
        type="button"
        onClick={onToggle}
        className="student-play-btn"
        aria-label="Open recording details"
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
          Watch Recording
        </a>
      ) : (
        <span className="student-muted">Processing</span>
      )}
    </div>
  );
}

function SessionRow({ session, timezone }: { session: LiveSession; timezone: string }) {
  return (
    <div className="student-session-row">
      <div>
        <strong>
          {session.focus_topic ?? `Week ${session.week_number} Session ${session.session_number}`}
        </strong>
        <div className="student-session-row-meta">
          <span>
            <small>Scheduled at</small>
            {formatDateTime(session.scheduled_at, timezone)}
          </span>
          <span>
            <small>Week / Session</small>
            Week {session.week_number} · Session {session.session_number}
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
            Join Zoom
          </a>
        )}
        {session.recording_url && (
          <a
            href={session.recording_url}
            target="_blank"
            rel="noreferrer"
            className="student-outline-btn"
          >
            Watch
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
  options: string[];
}) {
  return (
    <div className="student-filter-tabs">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={value === option ? "active" : ""}
        >
          {option}
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
  const normalized = status.replace(/_/g, " ");
  return <span className={`student-status ${status}`}>{normalized}</span>;
}

function EmptyState({ text }: { text: string }) {
  return <div className="student-empty">{text}</div>;
}
