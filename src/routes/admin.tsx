import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  Car,
  Check,
  ChevronLeft,
  ChevronRight,
  Circle,
  ClipboardCheck,
  Clock3,
  FileText,
  Flame,
  Library,
  Loader2,
  LogIn,
  Mail,
  Moon,
  Pencil,
  Play,
  Plus,
  Search,
  Settings,
  ShieldAlert,
  Smile,
  Sparkles,
  Star,
  Sun,
  Trash2,
  UserRound,
  UsersRound,
  Video,
} from "lucide-react";
import { useMemo, useRef, useState, type ReactNode } from "react";
import { hasSupabaseEnv, supabase } from "../lib/supabase";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard - Fluent with Sena" },
      {
        name: "description",
        content: "Fluent with Sena admin dashboard connected to Supabase.",
      },
    ],
  }),
  component: AdminDashboard,
});

type Profile = {
  id: string;
  role: "admin" | "student";
  first_name: string | null;
  last_name: string | null;
  email: string;
  whatsapp: string | null;
  phone: string | null;
  timezone: string | null;
};

type Student = {
  id: string;
  tier_id: string | null;
  industry: string | null;
  current_week: number;
  start_date: string | null;
  end_date: string | null;
  status: "active" | "paused" | "completed" | "cancelled";
  confidence_score: number | null;
  application_id: string | null;
  notes: string | null;
};

type ProgramTier = {
  id: string;
  name: string;
  duration_weeks: number;
  sessions_per_week: number;
  price_usd: number | null;
};

type Application = {
  id: string;
  full_name: string;
  email: string;
  linkedin_url: string | null;
  current_role: string | null;
  industry: string | null;
  english_level: string | null;
  primary_goal: string | null;
  motivation: string | null;
  preferred_start: string | null;
  weekly_hours: string | null;
  referral_source: string | null;
  additional_notes: string | null;
  status: "pending" | "reviewed" | "accepted" | "rejected";
  created_at: string;
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
  zoom_meeting_id: string | null;
  zoom_join_url: string | null;
  zoom_start_url: string | null;
  zoom_password: string | null;
  zoom_uuid: string | null;
  recording_url: string | null;
  session_notes: string | null;
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
  status: "pending" | "reviewed";
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
  student_id: string;
  fluency_goal: string;
  day_one_question: string | null;
};

type Course = {
  id: string;
  title: string;
  category: string | null;
  description: string | null;
  avg_lesson_minutes: number | null;
  status: "published" | "draft";
};

type ContentItem = {
  id: string;
  title: string;
  author_or_host: string | null;
  media_type: string;
  cefr_level: string | null;
  external_url: string | null;
  genre_tag: string | null;
  playlist_tag?: string | null;
  duration_label?: string | null;
  description?: string | null;
  thumbnail_url?: string | null;
  is_active: boolean;
  sort_order?: number | null;
};

type Objective = {
  id: string;
  student_id: string;
  week_number: number;
  week_label: string | null;
  focus_area: number;
  focus_title: string;
  context_for_student: string | null;
  sent_at: string | null;
};

type DashboardStat = {
  student_id: string;
  current_week: number;
  confidence_score: number | null;
  status: string;
  tier_name: string | null;
  duration_weeks: number | null;
  total_sessions: number | null;
  sessions_completed: number | null;
  lessons_completed: number | null;
  hours_learned: number | null;
  next_session_at: string | null;
  pending_checkins: number | null;
};

type AdminData = {
  profiles: Profile[];
  students: Student[];
  tiers: ProgramTier[];
  applications: Application[];
  sessions: LiveSession[];
  checkIns: CheckIn[];
  journals: JournalEntry[];
  milestones: Milestone[];
  goals: StudentGoal[];
  courses: Course[];
  content: ContentItem[];
  objectives: Objective[];
  stats: DashboardStat[];
};

type ZoomMeetingAction =
  | {
      action: "create";
      topic: string;
      startTime: string;
      duration: number;
      timezone: string;
    }
  | {
      action: "update";
      meetingId: string;
      topic: string;
      startTime: string;
      duration: number;
      timezone: string;
    }
  | {
      action: "delete";
      meetingId: string;
    };

type ZoomMeetingResult = {
  ok?: boolean;
  meetingId?: string | null;
  uuid?: string | null;
  joinUrl?: string | null;
  startUrl?: string | null;
  chatJoinUrl?: string | null;
  password?: string | null;
};

type CreateStudentInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  timezone: string;
  phone: string;
  whatsapp: string;
  tierId: string;
  industry: string;
  currentWeek: number;
  startDate: string;
  applicationId: string;
  notes: string;
};

type StudentRow = Student & {
  profile?: Profile;
  tier?: ProgramTier;
  stat?: DashboardStat;
  goal?: StudentGoal;
};

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3, group: "Overview" },
  { id: "students", label: "Students", icon: UsersRound, group: "Overview" },
  { id: "checkins", label: "Check-in Inbox", icon: Mail, group: "Overview" },
  { id: "sessions", label: "Live Sessions", icon: Video, group: "Program" },
  { id: "journals", label: "Student Journals", icon: FileText, group: "Program" },
  { id: "milestones", label: "Milestones", icon: Star, group: "Program" },
  { id: "courses", label: "Course Library", icon: Play, group: "Program" },
  { id: "library", label: "Content Library", icon: Library, group: "Program" },
  { id: "objectives", label: "Objectives Builder", icon: ClipboardCheck, group: "Program" },
  { id: "settings", label: "Settings", icon: Settings, group: "Account" },
] as const;

const timezoneOptions = [
  { label: "Eastern Time - New York", value: "America/New_York" },
  { label: "Central Time - Chicago", value: "America/Chicago" },
  { label: "Mountain Time - Denver", value: "America/Denver" },
  { label: "Pacific Time - Los Angeles", value: "America/Los_Angeles" },
  { label: "Mexico City", value: "America/Mexico_City" },
  { label: "Bogota / Lima / Quito", value: "America/Bogota" },
  { label: "Santo Domingo", value: "America/Santo_Domingo" },
  { label: "Buenos Aires", value: "America/Argentina/Buenos_Aires" },
  { label: "Madrid", value: "Europe/Madrid" },
  { label: "London", value: "Europe/London" },
  { label: "Cairo", value: "Africa/Cairo" },
  { label: "UTC", value: "UTC" },
];

type ScreenId = (typeof navItems)[number]["id"];

async function fetchTable<T>(
  table: string,
  select = "*",
  order?: { column: string; ascending?: boolean },
) {
  if (!supabase) throw new Error("Supabase environment variables are missing.");
  let query = supabase.from(table).select(select);
  if (order) query = query.order(order.column, { ascending: order.ascending ?? true });
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as T[];
}

async function invokeZoomMeeting(data: ZoomMeetingAction) {
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data: result, error } = await supabase.functions.invoke<ZoomMeetingResult>(
    "zoom-meetings",
    { body: data },
  );
  if (error) throw error;
  return result ?? {};
}

async function createStudentAccount(data: CreateStudentInput) {
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data: result, error } = await supabase.functions.invoke<{ id: string; email: string }>(
    "admin-students",
    { body: data },
  );
  if (error) throw error;
  return result;
}

async function fetchAdminData(): Promise<AdminData> {
  if (!supabase) throw new Error("Supabase environment variables are missing.");

  const [
    profiles,
    students,
    tiers,
    applications,
    sessions,
    checkIns,
    journals,
    milestones,
    goals,
    courses,
    content,
    objectives,
    stats,
  ] = await Promise.all([
    fetchTable<Profile>("profiles"),
    fetchTable<Student>("students", "*", { column: "created_at", ascending: false }),
    fetchTable<ProgramTier>("program_tiers"),
    fetchTable<Application>("applications", "*", { column: "created_at", ascending: false }),
    fetchTable<LiveSession>("live_sessions", "*", { column: "scheduled_at", ascending: true }),
    fetchTable<CheckIn>("check_ins", "*", { column: "submitted_at", ascending: false }),
    fetchTable<JournalEntry>("journal_entries", "*", { column: "created_at", ascending: false }),
    fetchTable<Milestone>("milestones", "*", { column: "sort_order", ascending: true }),
    fetchTable<StudentGoal>("student_goals"),
    fetchTable<Course>("courses", "*", { column: "sort_order", ascending: true }),
    fetchTable<ContentItem>("content_items", "*", { column: "sort_order", ascending: true }),
    fetchTable<Objective>("objectives", "*", { column: "week_number", ascending: false }),
    fetchTable<DashboardStat>("student_dashboard_stats"),
  ]);

  return {
    profiles,
    students,
    tiers,
    applications,
    sessions,
    checkIns,
    journals,
    milestones,
    goals,
    courses,
    content,
    objectives,
    stats,
  };
}

function nameFor(profile?: Profile, fallback = "Student") {
  if (!profile) return fallback;
  return [profile.first_name, profile.last_name].filter(Boolean).join(" ") || profile.email;
}

function initialsFor(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function formatDate(value?: string | null) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(value),
  );
}

function formatTime(value?: string | null) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(
    new Date(value),
  );
}

function moodLabel(checkIn: CheckIn) {
  return (
    checkIn.mood_emoji || (checkIn.mood === "struggling" ? "!" : checkIn.mood === "meh" ? "-" : "+")
  );
}

function AdminDashboard() {
  const [screen, setScreen] = useState<ScreenId>("dashboard");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const query = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: fetchAdminData,
    enabled: hasSupabaseEnv,
    refetchInterval: 60_000,
  });

  const data = query.data;

  const students = useMemo<StudentRow[]>(() => {
    if (!data) return [];
    return data.students.map((student) => ({
      ...student,
      profile: data.profiles.find((profile) => profile.id === student.id),
      tier: data.tiers.find((tier) => tier.id === student.tier_id),
      stat: data.stats.find((stat) => stat.student_id === student.id),
      goal: data.goals.find((goal) => goal.student_id === student.id),
    }));
  }, [data]);

  const selectedStudent =
    students.find((student) => student.id === selectedStudentId) ?? students[0];
  const visibleStudents = students.filter((student) => {
    const haystack = `${nameFor(student.profile)} ${student.profile?.email ?? ""} ${
      student.industry ?? ""
    }`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  });
  const pendingCheckIns = data?.checkIns.filter((item) => item.status === "pending") ?? [];
  const activeStudents = students.filter((student) => student.status === "active");
  const now = new Date();
  const weekEnd = new Date(now);
  weekEnd.setDate(now.getDate() + (7 - now.getDay()));
  const sessionsThisWeek =
    data?.sessions.filter((session) => {
      const date = new Date(session.scheduled_at);
      return date >= now && date <= weekEnd;
    }) ?? [];
  const completedThisWeek = sessionsThisWeek.filter(
    (session) => session.status === "completed",
  ).length;
  const avgConfidence =
    activeStudents.length > 0
      ? activeStudents.reduce((sum, student) => sum + Number(student.confidence_score ?? 0), 0) /
        activeStudents.length
      : 0;

  if (!hasSupabaseEnv) {
    return (
      <AdminShell
        screen={screen}
        setScreen={setScreen}
        pendingCount={0}
        theme={theme}
        setTheme={setTheme}
      >
        <EmptyGate
          icon={ShieldAlert}
          title="Supabase env is missing"
          body="Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local, then restart the dev server."
        />
      </AdminShell>
    );
  }

  if (query.isLoading) {
    return (
      <AdminShell
        screen={screen}
        setScreen={setScreen}
        pendingCount={0}
        theme={theme}
        setTheme={setTheme}
      >
        <div className="flex min-h-[70vh] items-center justify-center text-sena-muted">
          <Loader2 className="mr-3 h-5 w-5 animate-spin text-sena-gold" />
          Loading Supabase dashboard...
        </div>
      </AdminShell>
    );
  }

  if (query.error || !data) {
    return (
      <AdminShell
        screen={screen}
        setScreen={setScreen}
        pendingCount={0}
        theme={theme}
        setTheme={setTheme}
      >
        <EmptyGate
          icon={LogIn}
          title="Could not read admin data"
          body={
            query.error instanceof Error
              ? `${query.error.message}. If RLS is active, sign in as an admin user before viewing this page.`
              : "If RLS is active, sign in as an admin user before viewing this page."
          }
        />
      </AdminShell>
    );
  }

  return (
    <AdminShell
      screen={screen}
      setScreen={setScreen}
      pendingCount={pendingCheckIns.length}
      theme={theme}
      setTheme={setTheme}
    >
      {screen === "dashboard" && (
        <DashboardScreen
          activeStudents={activeStudents}
          completedThisWeek={completedThisWeek}
          sessionsThisWeek={sessionsThisWeek}
          pendingCheckIns={pendingCheckIns}
          avgConfidence={avgConfidence}
          students={activeStudents.slice(0, 6)}
          sessions={data.sessions.slice(0, 7)}
          checkIns={data.checkIns.slice(0, 6)}
          milestones={data.milestones.slice(0, 6)}
          setScreen={setScreen}
        />
      )}

      {screen === "students" && (
        <StudentsScreen
          students={visibleStudents}
          allStudents={students}
          profiles={data.profiles}
          tiers={data.tiers}
          applications={data.applications}
          search={search}
          setSearch={setSearch}
          onSelect={(id) => {
            setSelectedStudentId(id);
            setScreen("journals");
          }}
        />
      )}

      {screen === "checkins" && (
        <CheckInsScreen checkIns={data.checkIns} students={students} setScreen={setScreen} />
      )}

      {screen === "sessions" && <SessionsScreen sessions={data.sessions} students={students} />}

      {screen === "journals" && (
        <JournalsScreen
          journals={data.journals}
          students={students}
          selectedStudent={selectedStudent}
        />
      )}

      {screen === "milestones" && (
        <MilestonesScreen
          milestones={data.milestones}
          students={students}
          selectedStudent={selectedStudent}
          setSelectedStudentId={setSelectedStudentId}
        />
      )}

      {screen === "courses" && <CoursesScreen courses={data.courses} />}

      {screen === "library" && <ContentLibraryScreen content={data.content} />}

      {screen === "objectives" && (
        <ObjectivesScreen
          objectives={data.objectives}
          students={students}
          selectedStudent={selectedStudent}
        />
      )}

      {screen === "settings" && <SettingsScreen applications={data.applications} />}
    </AdminShell>
  );
}

function AdminShell({
  children,
  screen,
  setScreen,
  pendingCount,
  theme,
  setTheme,
}: {
  children: React.ReactNode;
  screen: ScreenId;
  setScreen: (screen: ScreenId) => void;
  pendingCount: number;
  theme: "dark" | "light";
  setTheme: (theme: "dark" | "light") => void;
}) {
  let lastGroup = "";
  return (
    <main className={`admin-app ${theme === "light" ? "admin-light" : ""}`}>
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <div className="text-[15px] font-semibold text-white">Fluent with Sena</div>
          <div className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-white/30">
            Admin Portal
          </div>
        </div>
        <div className="admin-user">
          <div className="admin-avatar">S</div>
          <div>
            <div className="text-[13px] font-medium">Sena</div>
            <div className="text-[10px] tracking-[0.04em] text-sena-gold">Coach · Admin</div>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const showGroup = item.group !== lastGroup;
            lastGroup = item.group;
            return (
              <div key={item.id}>
                {showGroup && <div className="admin-nav-group">{item.group}</div>}
                <button
                  type="button"
                  onClick={() => setScreen(item.id)}
                  className={`admin-nav-item ${screen === item.id ? "active" : ""}`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  {item.id === "checkins" && pendingCount > 0 && (
                    <span className="ml-auto rounded-full bg-sena-gold px-2 py-0.5 text-[9px] font-bold text-[#060c14]">
                      {pendingCount}
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </nav>

        <div className="border-t border-white/5 p-3">
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="admin-nav-item mb-2"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
          <a href="/" className="admin-nav-item text-white/35">
            <ChevronRight className="h-4 w-4" />
            View student portal
          </a>
        </div>
      </aside>
      <section className="admin-main">{children}</section>
    </main>
  );
}

function Topbar({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="admin-topbar">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-xs text-white/35">{subtitle}</p>
      </div>
      {action && <div className="flex items-center gap-3">{action}</div>}
    </header>
  );
}

function DashboardScreen({
  activeStudents,
  completedThisWeek,
  sessionsThisWeek,
  pendingCheckIns,
  avgConfidence,
  students,
  sessions,
  checkIns,
  milestones,
  setScreen,
}: {
  activeStudents: StudentRow[];
  completedThisWeek: number;
  sessionsThisWeek: LiveSession[];
  pendingCheckIns: CheckIn[];
  avgConfidence: number;
  students: StudentRow[];
  sessions: LiveSession[];
  checkIns: CheckIn[];
  milestones: Milestone[];
  setScreen: (screen: ScreenId) => void;
}) {
  return (
    <>
      <Topbar
        title="Good morning, Sena."
        subtitle={`${formatDate(new Date().toISOString())} · ${activeStudents.length} active students`}
        action={
          <>
            <button className="admin-outline-btn" onClick={() => setScreen("checkins")}>
              Check-in inbox{" "}
              {pendingCheckIns.length > 0 && <strong>{pendingCheckIns.length}</strong>}
            </button>
            <button className="admin-gold-btn" onClick={() => setScreen("sessions")}>
              New session
            </button>
          </>
        }
      />
      <div className="admin-content">
        <div className="admin-stat-grid">
          <StatCard
            label="Active Students"
            value={activeStudents.length}
            sub="Currently enrolled"
            icon={UsersRound}
          />
          <StatCard
            label="Sessions This Week"
            value={`${completedThisWeek} / ${sessionsThisWeek.length}`}
            sub={`${Math.max(sessionsThisWeek.length - completedThisWeek, 0)} remaining`}
            icon={Video}
            tone="blue"
          />
          <StatCard
            label="Check-ins Pending"
            value={pendingCheckIns.length}
            sub="Waiting for review"
            icon={Mail}
            tone="gold"
          />
          <StatCard
            label="Avg. Confidence"
            value={avgConfidence ? avgConfidence.toFixed(1) : "0.0"}
            sub="Latest check-in values"
            icon={Sparkles}
            tone="green"
          />
        </div>

        <div className="admin-two-col">
          <Panel title="Active Students" link="View all" onLink={() => setScreen("students")}>
            {students.length ? (
              students.map((student) => <StudentListRow key={student.id} student={student} />)
            ) : (
              <EmptyRows text="No active students yet." />
            )}
          </Panel>
          <Panel
            title="Upcoming Sessions"
            link="View calendar"
            onLink={() => setScreen("sessions")}
          >
            {sessions.length ? (
              sessions.map((session) => (
                <SessionListRow key={session.id} session={session} students={students} />
              ))
            ) : (
              <EmptyRows text="No sessions scheduled." />
            )}
          </Panel>
        </div>

        <div className="admin-two-col">
          <Panel title="Check-in Inbox" link="Review all" onLink={() => setScreen("checkins")}>
            {checkIns.length ? (
              checkIns.map((checkIn) => (
                <CheckInListRow key={checkIn.id} checkIn={checkIn} students={students} compact />
              ))
            ) : (
              <EmptyRows text="No check-ins yet." />
            )}
          </Panel>
          <Panel
            title="Recent Milestones"
            link="Open journey"
            onLink={() => setScreen("milestones")}
          >
            {milestones.length ? (
              milestones.map((milestone) => (
                <MilestoneListRow key={milestone.id} milestone={milestone} students={students} />
              ))
            ) : (
              <EmptyRows text="No milestones created." />
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  tone = "white",
}: {
  label: string;
  value: string | number;
  sub: string;
  icon: typeof UsersRound;
  tone?: "white" | "gold" | "blue" | "green";
}) {
  const color =
    tone === "gold"
      ? "text-sena-gold"
      : tone === "blue"
        ? "text-sena-blue"
        : tone === "green"
          ? "text-sena-green"
          : "text-white";
  return (
    <article className="admin-card relative overflow-hidden p-5">
      <Icon className="absolute right-4 top-4 h-5 w-5 text-white/15" />
      <div className="text-[11px] uppercase tracking-[0.08em] text-white/35">{label}</div>
      <div className={`mt-2 text-3xl font-semibold tracking-tight ${color}`}>{value}</div>
      <div className="mt-1 text-[11px] text-white/30">{sub}</div>
    </article>
  );
}

function Panel({
  title,
  link,
  onLink,
  children,
}: {
  title: string;
  link?: string;
  onLink?: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="admin-card p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">{title}</h2>
        {link && (
          <button
            type="button"
            onClick={onLink}
            className="text-[11px] text-sena-gold hover:text-[#e2c97e]"
          >
            {link} →
          </button>
        )}
      </div>
      {children}
    </section>
  );
}

type AdminFormField = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "number" | "date" | "datetime-local" | "select";
  options?: { label: string; value: string }[];
  required?: boolean;
};

function valueForInput(value: unknown, type?: AdminFormField["type"]) {
  if (value == null) return "";
  if (type === "datetime-local" && typeof value === "string") {
    return value.slice(0, 16);
  }
  return String(value);
}

function valueForSupabase(value: string, type?: AdminFormField["type"]) {
  if (value === "") return null;
  if (type === "number") return Number(value);
  if (type === "datetime-local") return new Date(value).toISOString();
  return value;
}

function RecordDialog({
  title,
  table,
  fields,
  initialValues = {},
  rowId,
  onClose,
}: {
  title: string;
  table: string;
  fields: AdminFormField[];
  initialValues?: Record<string, unknown>;
  rowId?: string;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      fields.map((field) => [field.name, valueForInput(initialValues[field.name], field.type)]),
    ),
  );

  const mutation = useMutation({
    mutationFn: async () => {
      if (!supabase) throw new Error("Supabase is not configured.");
      const payload = Object.fromEntries(
        fields.map((field) => [field.name, valueForSupabase(values[field.name] ?? "", field.type)]),
      );
      const result = rowId
        ? await supabase.from(table).update(payload).eq("id", rowId)
        : await supabase.from(table).insert(payload);
      if (result.error) throw result.error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
      onClose();
    },
  });

  return (
    <div className="admin-modal-backdrop" role="presentation">
      <div className="admin-modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="flex items-start justify-between gap-4 border-b border-white/7 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold">{title}</h2>
            <p className="mt-1 text-xs leading-5 text-white/38">
              {rowId ? "Edit this record in Supabase." : "Create a new record in Supabase."}
            </p>
          </div>
          <button type="button" onClick={onClose} className="admin-outline-btn">
            Close
          </button>
        </div>

        <form
          className="space-y-4 p-5"
          onSubmit={(event) => {
            event.preventDefault();
            mutation.mutate();
          }}
        >
          {fields.map((field) => (
            <label key={field.name} className="block">
              <span className="admin-field-label">{field.label}</span>
              {field.type === "textarea" ? (
                <textarea
                  value={values[field.name] ?? ""}
                  onChange={(event) =>
                    setValues((current) => ({ ...current, [field.name]: event.target.value }))
                  }
                  required={field.required}
                  rows={4}
                  className="admin-textarea"
                />
              ) : field.type === "select" ? (
                <select
                  value={values[field.name] ?? ""}
                  onChange={(event) =>
                    setValues((current) => ({ ...current, [field.name]: event.target.value }))
                  }
                  required={field.required}
                  className="admin-select"
                >
                  <option value="">Select...</option>
                  {(field.options ?? []).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  value={values[field.name] ?? ""}
                  onChange={(event) =>
                    setValues((current) => ({ ...current, [field.name]: event.target.value }))
                  }
                  required={field.required}
                  type={field.type ?? "text"}
                  className="admin-input"
                />
              )}
            </label>
          ))}

          {mutation.error instanceof Error && (
            <div className="rounded-lg border border-red-300/20 bg-red-400/7 px-4 py-3 text-sm text-red-200">
              {mutation.error.message}
            </div>
          )}

          <button type="submit" disabled={mutation.isPending} className="admin-gold-btn w-full">
            {mutation.isPending ? "Saving..." : rowId ? "Save changes" : "Create"}
          </button>
        </form>
      </div>
    </div>
  );
}

function DeleteButton({
  table,
  id,
  label = "Delete",
}: {
  table: string;
  id: string;
  label?: string;
}) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async () => {
      if (!supabase) throw new Error("Supabase is not configured.");
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] }),
  });

  return (
    <button
      type="button"
      disabled={mutation.isPending}
      onClick={(event) => {
        event.stopPropagation();
        if (window.confirm(`Delete this ${label.toLowerCase()}?`)) mutation.mutate();
      }}
      className="admin-danger-btn"
      title={label}
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}

function EditButton({ onClick, label = "Edit" }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className="admin-icon-btn"
      title={label}
    >
      <Pencil className="h-3.5 w-3.5" />
    </button>
  );
}

function StudentsScreen({
  students,
  allStudents,
  profiles,
  tiers,
  applications,
  search,
  setSearch,
  onSelect,
}: {
  students: StudentRow[];
  allStudents: StudentRow[];
  profiles: Profile[];
  tiers: ProgramTier[];
  applications: Application[];
  search: string;
  setSearch: (value: string) => void;
  onSelect: (id: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentRow | null>(null);

  return (
    <>
      <Topbar
        title="Students"
        subtitle="Enrollment, tiers, confidence, and program status"
        action={
          <>
            <label className="admin-search">
              <Search className="h-4 w-4 text-white/30" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search students"
              />
            </label>
            <button type="button" onClick={() => setAdding(true)} className="admin-gold-btn">
              <Plus className="mr-1.5 inline h-3.5 w-3.5" />
              Add student
            </button>
          </>
        }
      />
      <div className="admin-content">
        <div className="admin-grid-table">
          <div className="admin-table-head grid-cols-[1.4fr_.8fr_.7fr_.7fr_.7fr_.5fr]">
            <span>Student</span>
            <span>Tier</span>
            <span>Week</span>
            <span>Confidence</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          {students.map((student) => {
            const name = nameFor(student.profile);
            return (
              <div
                key={student.id}
                onClick={() => onSelect(student.id)}
                className="admin-table-row grid-cols-[1.4fr_.8fr_.7fr_.7fr_.7fr_.5fr]"
                role="button"
                tabIndex={0}
              >
                <span className="flex items-center gap-3 text-left">
                  <Avatar name={name} />
                  <span>
                    <span className="block text-sm font-medium">{name}</span>
                    <span className="block text-xs text-white/32">{student.profile?.email}</span>
                  </span>
                </span>
                <span>{student.tier?.name ?? "No tier"}</span>
                <span>Week {student.current_week}</span>
                <span className="text-sena-gold">{student.confidence_score ?? "—"}</span>
                <StatusPill status={student.status} />
                <span className="flex items-center gap-2">
                  <EditButton onClick={() => setEditingStudent(student)} />
                  <DeleteButton table="students" id={student.id} label="Student enrollment" />
                </span>
              </div>
            );
          })}
          {!students.length && <EmptyRows text="No students matched your search." />}
        </div>
      </div>
      {adding && (
        <AddStudentAccountDialog
          tiers={tiers}
          applications={applications}
          onClose={() => setAdding(false)}
        />
      )}
      {editingStudent && (
        <RecordDialog
          title="Edit student"
          table="students"
          rowId={editingStudent.id}
          initialValues={editingStudent}
          onClose={() => setEditingStudent(null)}
          fields={[
            {
              name: "tier_id",
              label: "Program tier",
              type: "select",
              options: tiers.map((tier) => ({ label: tier.name, value: tier.id })),
            },
            { name: "industry", label: "Industry" },
            { name: "current_week", label: "Current week", type: "number" },
            {
              name: "status",
              label: "Status",
              type: "select",
              options: ["active", "paused", "completed", "cancelled"].map((value) => ({
                label: value,
                value,
              })),
            },
            { name: "confidence_score", label: "Confidence score", type: "number" },
            { name: "start_date", label: "Start date", type: "date" },
            { name: "end_date", label: "End date", type: "date" },
            { name: "notes", label: "Admin notes", type: "textarea" },
          ]}
        />
      )}
    </>
  );
}

function AddStudentDialog({
  profiles,
  students,
  tiers,
  applications,
  onClose,
}: {
  profiles: Profile[];
  students: StudentRow[];
  tiers: ProgramTier[];
  applications: Application[];
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const existingIds = new Set(students.map((student) => student.id));
  const availableProfiles = profiles.filter(
    (profile) => profile.role === "student" && !existingIds.has(profile.id),
  );
  const acceptedApplications = applications.filter(
    (application) => application.status === "accepted",
  );
  const [profileId, setProfileId] = useState(availableProfiles[0]?.id ?? "");
  const [tierId, setTierId] = useState(tiers[0]?.id ?? "");
  const [industry, setIndustry] = useState("");
  const [currentWeek, setCurrentWeek] = useState("1");
  const [startDate, setStartDate] = useState("");
  const [applicationId, setApplicationId] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      if (!supabase) throw new Error("Supabase is not configured.");
      if (!profileId) throw new Error("Choose an existing student profile first.");

      const tier = tiers.find((item) => item.id === tierId);
      const start = startDate ? new Date(`${startDate}T00:00:00`) : null;
      const end =
        start && tier
          ? new Date(start.getTime() + tier.duration_weeks * 7 * 24 * 60 * 60 * 1000)
              .toISOString()
              .slice(0, 10)
          : null;

      const { error } = await supabase.from("students").insert({
        id: profileId,
        tier_id: tierId || null,
        industry: industry || null,
        current_week: Number(currentWeek) || 1,
        start_date: startDate || null,
        end_date: end,
        status: "active",
        application_id: applicationId || null,
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
      onClose();
    },
  });

  return (
    <div className="admin-modal-backdrop" role="presentation">
      <div className="admin-modal" role="dialog" aria-modal="true" aria-label="Add student">
        <div className="flex items-start justify-between gap-4 border-b border-white/7 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold">Add student</h2>
            <p className="mt-1 text-xs leading-5 text-white/38">
              Enroll an existing Supabase Auth user/profile into a coaching program.
            </p>
          </div>
          <button type="button" onClick={onClose} className="admin-outline-btn">
            Close
          </button>
        </div>

        <form
          className="space-y-4 p-5"
          onSubmit={(event) => {
            event.preventDefault();
            mutation.mutate();
          }}
        >
          {availableProfiles.length ? (
            <>
              <label className="block">
                <span className="admin-field-label">Student profile</span>
                <select
                  value={profileId}
                  onChange={(event) => setProfileId(event.target.value)}
                  className="admin-select"
                  required
                >
                  {availableProfiles.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {nameFor(profile)} · {profile.email}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="admin-field-label">Program tier</span>
                  <select
                    value={tierId}
                    onChange={(event) => setTierId(event.target.value)}
                    className="admin-select"
                  >
                    {tiers.map((tier) => (
                      <option key={tier.id} value={tier.id}>
                        {tier.name} · {tier.duration_weeks} weeks
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="admin-field-label">Current week</span>
                  <input
                    value={currentWeek}
                    onChange={(event) => setCurrentWeek(event.target.value)}
                    type="number"
                    min="1"
                    className="admin-input"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="admin-field-label">Industry</span>
                  <input
                    value={industry}
                    onChange={(event) => setIndustry(event.target.value)}
                    className="admin-input"
                    placeholder="Healthcare, hospitality..."
                  />
                </label>

                <label className="block">
                  <span className="admin-field-label">Start date</span>
                  <input
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                    type="date"
                    className="admin-input"
                  />
                </label>
              </div>

              <label className="block">
                <span className="admin-field-label">Accepted application</span>
                <select
                  value={applicationId}
                  onChange={(event) => setApplicationId(event.target.value)}
                  className="admin-select"
                >
                  <option value="">No application link</option>
                  {acceptedApplications.map((application) => (
                    <option key={application.id} value={application.id}>
                      {application.full_name} · {application.email}
                    </option>
                  ))}
                </select>
              </label>

              {mutation.error instanceof Error && (
                <div className="rounded-lg border border-red-300/20 bg-red-400/7 px-4 py-3 text-sm text-red-200">
                  {mutation.error.message}
                </div>
              )}

              <button type="submit" disabled={mutation.isPending} className="admin-gold-btn w-full">
                {mutation.isPending ? "Adding student..." : "Add student"}
              </button>
            </>
          ) : (
            <div className="rounded-lg border border-sena-gold/20 bg-sena-gold/7 p-4 text-sm leading-6 text-white/65">
              No available student profiles found. Create the user first in Supabase Authentication,
              then make sure their profile role is student. After that, this dialog can enroll them.
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

function AddStudentAccountDialog({
  tiers,
  applications,
  onClose,
}: {
  tiers: ProgramTier[];
  applications: Application[];
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const acceptedApplications = applications.filter(
    (application) => application.status === "accepted",
  );
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [timezone, setTimezone] = useState("America/New_York");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [tierId, setTierId] = useState(tiers[0]?.id ?? "");
  const [industry, setIndustry] = useState("");
  const [currentWeek, setCurrentWeek] = useState("1");
  const [startDate, setStartDate] = useState("");
  const [applicationId, setApplicationId] = useState("");
  const [notes, setNotes] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      await createStudentAccount({
        firstName,
        lastName,
        email,
        password,
        timezone,
        phone,
        whatsapp,
        tierId,
        industry,
        currentWeek: Number(currentWeek) || 1,
        startDate,
        applicationId,
        notes,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
      onClose();
    },
  });

  return (
    <div className="admin-modal-backdrop" role="presentation">
      <div className="admin-modal" role="dialog" aria-modal="true" aria-label="Add student">
        <div className="flex items-start justify-between gap-4 border-b border-white/7 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold">Add student</h2>
            <p className="mt-1 text-xs leading-5 text-white/38">
              Create a student login and enroll them into a coaching program.
            </p>
          </div>
          <button type="button" onClick={onClose} className="admin-outline-btn">
            Close
          </button>
        </div>

        <form
          className="space-y-4 p-5"
          onSubmit={(event) => {
            event.preventDefault();
            mutation.mutate();
          }}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="block">
              <span className="admin-field-label">First name</span>
              <input
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                className="admin-input"
                required
              />
            </label>
            <label className="block">
              <span className="admin-field-label">Last name</span>
              <input
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                className="admin-input"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="block">
              <span className="admin-field-label">Email</span>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                className="admin-input"
                required
              />
            </label>
            <label className="block">
              <span className="admin-field-label">Temporary password</span>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                minLength={8}
                className="admin-input"
                required
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <label className="block">
              <span className="admin-field-label">Timezone</span>
              <select
                value={timezone}
                onChange={(event) => setTimezone(event.target.value)}
                className="admin-select"
              >
                {timezoneOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="admin-field-label">Phone</span>
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="admin-input"
              />
            </label>
            <label className="block">
              <span className="admin-field-label">WhatsApp</span>
              <input
                value={whatsapp}
                onChange={(event) => setWhatsapp(event.target.value)}
                className="admin-input"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="block">
              <span className="admin-field-label">Program tier</span>
              <select
                value={tierId}
                onChange={(event) => setTierId(event.target.value)}
                className="admin-select"
              >
                <option value="">No tier yet</option>
                {tiers.map((tier) => (
                  <option key={tier.id} value={tier.id}>
                    {tier.name} - {tier.duration_weeks} weeks
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="admin-field-label">Current week</span>
              <input
                value={currentWeek}
                onChange={(event) => setCurrentWeek(event.target.value)}
                type="number"
                min="1"
                className="admin-input"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="block">
              <span className="admin-field-label">Industry</span>
              <input
                value={industry}
                onChange={(event) => setIndustry(event.target.value)}
                className="admin-input"
                placeholder="Healthcare, hospitality..."
              />
            </label>

            <label className="block">
              <span className="admin-field-label">Start date</span>
              <input
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                type="date"
                className="admin-input"
              />
            </label>
          </div>

          <label className="block">
            <span className="admin-field-label">Application</span>
            <select
              value={applicationId}
              onChange={(event) => {
                const nextId = event.target.value;
                const application = acceptedApplications.find((item) => item.id === nextId);
                setApplicationId(nextId);
                if (application) {
                  const parts = application.full_name.trim().split(/\s+/);
                  setEmail((current) => current || application.email);
                  setFirstName((current) => current || parts[0] || "");
                  setLastName((current) => current || parts.slice(1).join(" "));
                  setIndustry((current) => current || application.industry || "");
                }
              }}
              className="admin-select"
            >
              <option value="">No application link</option>
              {acceptedApplications.map((application) => (
                <option key={application.id} value={application.id}>
                  {application.full_name} - {application.email}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="admin-field-label">Admin notes</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="admin-textarea"
              rows={3}
            />
          </label>

          {mutation.error instanceof Error && (
            <div className="rounded-lg border border-red-300/20 bg-red-400/7 px-4 py-3 text-sm text-red-200">
              {mutation.error.message}
            </div>
          )}

          <button type="submit" disabled={mutation.isPending} className="admin-gold-btn w-full">
            {mutation.isPending ? "Creating student..." : "Create student"}
          </button>
        </form>
      </div>
    </div>
  );
}

function CheckInsScreen({
  checkIns,
  students,
  setScreen,
}: {
  checkIns: CheckIn[];
  students: StudentRow[];
  setScreen: (screen: ScreenId) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [editingCheckIn, setEditingCheckIn] = useState<CheckIn | null>(null);
  const pending = checkIns.filter((item) => item.status === "pending");
  const reviewed = checkIns.filter((item) => item.status === "reviewed");
  const checkInFields: AdminFormField[] = [
    {
      name: "student_id",
      label: "Student",
      type: "select",
      required: true,
      options: students.map((student) => ({ label: nameFor(student.profile), value: student.id })),
    },
    { name: "week_number", label: "Week number", type: "number", required: true },
    { name: "mood", label: "Mood" },
    { name: "mood_emoji", label: "Mood emoji" },
    { name: "confidence_score", label: "Confidence score", type: "number" },
    { name: "win_of_week", label: "Win of the week", type: "textarea" },
    { name: "biggest_struggle", label: "Biggest struggle", type: "textarea" },
    { name: "first_this_week", label: "First this week", type: "textarea" },
    { name: "note_for_next", label: "Note for next", type: "textarea" },
    { name: "admin_note", label: "Admin note", type: "textarea" },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: ["pending", "reviewed"].map((value) => ({ label: value, value })),
    },
  ];
  return (
    <>
      <Topbar
        title="Check-in Inbox"
        subtitle={`${pending.length} pending · ${reviewed.length} reviewed`}
        action={
          <button type="button" onClick={() => setAdding(true)} className="admin-gold-btn">
            <Plus className="mr-1.5 inline h-3.5 w-3.5" />
            Add check-in
          </button>
        }
      />
      <div className="admin-content">
        <div className="admin-two-col">
          <Panel title="Needs Review">
            {pending.length ? (
              pending.map((checkIn) => (
                <CheckInReviewCard
                  key={checkIn.id}
                  checkIn={checkIn}
                  students={students}
                  onEdit={() => setEditingCheckIn(checkIn)}
                />
              ))
            ) : (
              <EmptyRows text="No pending check-ins." />
            )}
          </Panel>
          <Panel title="Reviewed">
            {reviewed.slice(0, 8).map((checkIn) => (
              <div key={checkIn.id} className="flex items-center gap-2">
                <div className="min-w-0 flex-1">
                  <CheckInListRow checkIn={checkIn} students={students} />
                </div>
                <EditButton onClick={() => setEditingCheckIn(checkIn)} />
                <DeleteButton table="check_ins" id={checkIn.id} label="Check-in" />
              </div>
            ))}
            {!reviewed.length && <EmptyRows text="No reviewed check-ins yet." />}
            <button className="admin-outline-btn mt-4" onClick={() => setScreen("journals")}>
              Open student journals
            </button>
          </Panel>
        </div>
      </div>
      {adding && (
        <RecordDialog
          title="Add check-in"
          table="check_ins"
          fields={checkInFields}
          initialValues={{ status: "pending", week_number: 1 }}
          onClose={() => setAdding(false)}
        />
      )}
      {editingCheckIn && (
        <RecordDialog
          title="Edit check-in"
          table="check_ins"
          rowId={editingCheckIn.id}
          fields={checkInFields}
          initialValues={editingCheckIn}
          onClose={() => setEditingCheckIn(null)}
        />
      )}
    </>
  );
}

function CheckInReviewCard({
  checkIn,
  students,
  onEdit,
}: {
  checkIn: CheckIn;
  students: StudentRow[];
  onEdit: () => void;
}) {
  const queryClient = useQueryClient();
  const [adminNote, setAdminNote] = useState(checkIn.admin_note ?? "");
  const student = students.find((item) => item.id === checkIn.student_id);
  const mutation = useMutation({
    mutationFn: async () => {
      if (!supabase) throw new Error("Supabase is not configured.");
      const { error } = await supabase
        .from("check_ins")
        .update({
          status: "reviewed",
          admin_note: adminNote,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", checkIn.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] }),
  });

  return (
    <article className="mb-4 rounded-lg border border-white/7 bg-white/[0.025] p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold">{nameFor(student?.profile)}</div>
          <div className="mt-1 text-xs text-white/35">
            Week {checkIn.week_number} · {formatDate(checkIn.submitted_at)} · Confidence{" "}
            <span className="text-sena-gold">{checkIn.confidence_score ?? "—"}</span>
          </div>
        </div>
        <div className="text-2xl">{moodLabel(checkIn)}</div>
      </div>
      <AlertBox label="Win of the week" text={checkIn.win_of_week ?? "No win submitted."} />
      <AlertBox
        label="Biggest struggle"
        text={checkIn.biggest_struggle ?? "No struggle submitted."}
        tone="red"
      />
      <AlertBox
        label="Note for next session"
        text={checkIn.note_for_next ?? "No note submitted."}
        tone="blue"
      />
      <label className="mt-3 block">
        <span className="admin-field-label">Admin response</span>
        <textarea
          value={adminNote}
          onChange={(event) => setAdminNote(event.target.value)}
          className="admin-textarea"
          rows={3}
          placeholder="Write a short response or coaching note..."
        />
      </label>
      <button
        type="button"
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        className="admin-gold-btn mt-3"
      >
        {mutation.isPending ? "Saving..." : "Mark reviewed"}
      </button>
      <div className="mt-3 flex justify-end gap-2">
        <EditButton onClick={onEdit} />
        <DeleteButton table="check_ins" id={checkIn.id} label="Check-in" />
      </div>
      {mutation.error instanceof Error && (
        <p className="mt-2 text-xs text-red-300">{mutation.error.message}</p>
      )}
    </article>
  );
}

function SessionsScreen({
  sessions,
  students,
}: {
  sessions: LiveSession[];
  students: StudentRow[];
}) {
  const [adding, setAdding] = useState(false);
  const [editingSession, setEditingSession] = useState<LiveSession | null>(null);
  const sessionFields: AdminFormField[] = [
    {
      name: "student_id",
      label: "Student",
      type: "select",
      required: true,
      options: students.map((student) => ({ label: nameFor(student.profile), value: student.id })),
    },
    { name: "week_number", label: "Week number", type: "number", required: true },
    { name: "session_number", label: "Session number", type: "number", required: true },
    { name: "scheduled_at", label: "Scheduled at", type: "datetime-local", required: true },
    { name: "duration_minutes", label: "Duration minutes", type: "number" },
    { name: "focus_topic", label: "Focus topic" },
    {
      name: "timezone",
      label: "Zoom timezone",
      type: "select",
      options: timezoneOptions,
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: ["scheduled", "live", "completed", "cancelled", "no_show"].map((value) => ({
        label: value,
        value,
      })),
    },
    { name: "recording_url", label: "Recording URL" },
    { name: "session_notes", label: "Session notes", type: "textarea" },
  ];

  return (
    <>
      <Topbar
        title="Live Sessions"
        subtitle="Zoom sessions, recordings, and coaching notes"
        action={
          <button type="button" onClick={() => setAdding(true)} className="admin-gold-btn">
            <Plus className="mr-1.5 inline h-3.5 w-3.5" />
            New session
          </button>
        }
      />
      <div className="admin-content">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {sessions.map((session) => {
            const student = students.find((item) => item.id === session.student_id);
            return (
              <article key={session.id} className="admin-card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-sm font-semibold">
                      {session.focus_topic || "Live coaching session"}
                    </h2>
                    <p className="mt-1 text-xs text-white/35">{nameFor(student?.profile)}</p>
                  </div>
                  <StatusPill status={session.status} />
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <KeyValue
                    label="Scheduled"
                    value={`${formatDate(session.scheduled_at)} · ${formatTime(session.scheduled_at)}`}
                  />
                  <KeyValue
                    label="Week / Session"
                    value={`Week ${session.week_number} · Session ${session.session_number}`}
                  />
                  <KeyValue label="Duration" value={`${session.duration_minutes} minutes`} />
                  <KeyValue
                    label="Zoom"
                    value={session.zoom_join_url ? "Meeting connected" : "No Zoom meeting yet"}
                  />
                </div>
                {session.zoom_join_url && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <a
                      href={session.zoom_join_url}
                      target="_blank"
                      rel="noreferrer"
                      className="admin-outline-btn"
                    >
                      Join Zoom
                    </a>
                    {session.zoom_start_url && (
                      <a
                        href={session.zoom_start_url}
                        target="_blank"
                        rel="noreferrer"
                        className="admin-outline-btn"
                      >
                        Start Zoom
                      </a>
                    )}
                  </div>
                )}
                {session.session_notes && (
                  <AlertBox label="Session notes" text={session.session_notes} tone="blue" />
                )}
                <div className="mt-4 flex justify-end gap-2">
                  <EditButton onClick={() => setEditingSession(session)} />
                  <SessionDeleteButton session={session} />
                </div>
              </article>
            );
          })}
          {!sessions.length && <EmptyRows text="No sessions scheduled yet." />}
        </div>
      </div>
      {adding && (
        <SessionDialog
          title="Add session"
          fields={sessionFields}
          initialValues={{ duration_minutes: 60, status: "scheduled" }}
          students={students}
          onClose={() => setAdding(false)}
        />
      )}
      {editingSession && (
        <SessionDialog
          title="Edit session"
          rowId={editingSession.id}
          fields={sessionFields}
          initialValues={editingSession}
          students={students}
          onClose={() => setEditingSession(null)}
        />
      )}
    </>
  );
}

function SessionDialog({
  title,
  fields,
  initialValues = {},
  rowId,
  students,
  onClose,
}: {
  title: string;
  fields: AdminFormField[];
  initialValues?: Record<string, unknown>;
  rowId?: string;
  students: StudentRow[];
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      fields.map((field) => [
        field.name,
        field.name === "timezone"
          ? "America/New_York"
          : valueForInput(initialValues[field.name], field.type),
      ]),
    ),
  );

  const mutation = useMutation({
    mutationFn: async () => {
      if (!supabase) throw new Error("Supabase is not configured.");
      const student = students.find((item) => item.id === values.student_id);
      const scheduledAt = valueForSupabase(values.scheduled_at ?? "", "datetime-local") as string;
      const duration = Number(values.duration_minutes || 60);
      const focusTopic = values.focus_topic || "Live coaching session";
      const topic = `${focusTopic} - ${nameFor(student?.profile)} - Week ${values.week_number || 1}`;
      let meeting = {
        meetingId: String(initialValues.zoom_meeting_id ?? ""),
        uuid: (initialValues.zoom_uuid as string | null | undefined) ?? null,
        joinUrl: (initialValues.zoom_join_url as string | null | undefined) ?? null,
        startUrl: (initialValues.zoom_start_url as string | null | undefined) ?? null,
        password: (initialValues.zoom_password as string | null | undefined) ?? null,
      };

      if (meeting.meetingId) {
        await invokeZoomMeeting({
          action: "update",
          meetingId: meeting.meetingId,
          topic,
          startTime: scheduledAt,
          duration,
          timezone: values.timezone || "America/New_York",
        });
      } else {
        const createdMeeting = await invokeZoomMeeting({
          action: "create",
          topic,
          startTime: scheduledAt,
          duration,
          timezone: values.timezone || "America/New_York",
        });
        meeting = {
          meetingId: createdMeeting.meetingId ?? "",
          uuid: createdMeeting.uuid ?? null,
          joinUrl: createdMeeting.joinUrl ?? null,
          startUrl: createdMeeting.startUrl ?? null,
          password: createdMeeting.password ?? null,
        };
      }

      const payload = Object.fromEntries(
        fields
          .filter((field) => field.name !== "timezone")
          .map((field) => [field.name, valueForSupabase(values[field.name] ?? "", field.type)]),
      );

      const result = rowId
        ? await supabase
            .from("live_sessions")
            .update({
              ...payload,
              zoom_meeting_id: meeting.meetingId,
              zoom_uuid: meeting.uuid,
              zoom_join_url: meeting.joinUrl,
              zoom_start_url: meeting.startUrl,
              zoom_password: meeting.password,
            })
            .eq("id", rowId)
        : await supabase.from("live_sessions").insert({
            ...payload,
            zoom_meeting_id: meeting.meetingId,
            zoom_uuid: meeting.uuid,
            zoom_join_url: meeting.joinUrl,
            zoom_start_url: meeting.startUrl,
            zoom_password: meeting.password,
          });
      if (result.error) throw result.error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
      onClose();
    },
  });

  return (
    <div className="admin-modal-backdrop" role="presentation">
      <div className="admin-modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="flex items-start justify-between gap-4 border-b border-white/7 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold">{title}</h2>
            <p className="mt-1 text-xs leading-5 text-white/38">
              This saves the session and syncs the matching Zoom meeting.
            </p>
          </div>
          <button type="button" onClick={onClose} className="admin-outline-btn">
            Close
          </button>
        </div>

        <form
          className="space-y-4 p-5"
          onSubmit={(event) => {
            event.preventDefault();
            mutation.mutate();
          }}
        >
          {fields.map((field) => (
            <label key={field.name} className="block">
              <span className="admin-field-label">{field.label}</span>
              {field.type === "textarea" ? (
                <textarea
                  value={values[field.name] ?? ""}
                  onChange={(event) =>
                    setValues((current) => ({ ...current, [field.name]: event.target.value }))
                  }
                  required={field.required}
                  rows={4}
                  className="admin-textarea"
                />
              ) : field.type === "select" ? (
                <select
                  value={values[field.name] ?? ""}
                  onChange={(event) =>
                    setValues((current) => ({ ...current, [field.name]: event.target.value }))
                  }
                  required={field.required}
                  className="admin-select"
                >
                  <option value="">Select...</option>
                  {(field.options ?? []).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  value={values[field.name] ?? ""}
                  onChange={(event) =>
                    setValues((current) => ({ ...current, [field.name]: event.target.value }))
                  }
                  required={field.required}
                  type={field.type ?? "text"}
                  className="admin-input"
                />
              )}
            </label>
          ))}

          {mutation.error instanceof Error && (
            <div className="rounded-lg border border-red-300/20 bg-red-400/7 px-4 py-3 text-sm text-red-200">
              {mutation.error.message}
            </div>
          )}

          <button type="submit" disabled={mutation.isPending} className="admin-gold-btn w-full">
            {mutation.isPending
              ? "Syncing Zoom..."
              : rowId
                ? "Save and sync Zoom"
                : "Create Zoom session"}
          </button>
        </form>
      </div>
    </div>
  );
}

function SessionDeleteButton({ session }: { session: LiveSession }) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async () => {
      if (!supabase) throw new Error("Supabase is not configured.");
      if (session.zoom_meeting_id) {
        await invokeZoomMeeting({ action: "delete", meetingId: session.zoom_meeting_id });
      }
      const { error } = await supabase.from("live_sessions").delete().eq("id", session.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] }),
  });

  return (
    <button
      type="button"
      disabled={mutation.isPending}
      onClick={(event) => {
        event.stopPropagation();
        if (window.confirm("Delete this session and its Zoom meeting?")) mutation.mutate();
      }}
      className="admin-danger-btn"
      title={mutation.error instanceof Error ? mutation.error.message : "Delete session"}
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}

function JournalsScreen({
  journals,
  students,
  selectedStudent,
}: {
  journals: JournalEntry[];
  students: StudentRow[];
  selectedStudent?: StudentRow;
}) {
  const [type, setType] = useState<JournalEntry["entry_type"]>("phrase_bank");
  const [adding, setAdding] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const filtered = journals.filter(
    (entry) =>
      entry.entry_type === type && (!selectedStudent || entry.student_id === selectedStudent.id),
  );
  const journalFields: AdminFormField[] = [
    {
      name: "student_id",
      label: "Student",
      type: "select",
      required: true,
      options: students.map((student) => ({ label: nameFor(student.profile), value: student.id })),
    },
    {
      name: "entry_type",
      label: "Entry type",
      type: "select",
      required: true,
      options: ["phrase_bank", "question", "session_note"].map((value) => ({
        label: value,
        value,
      })),
    },
    { name: "week_number", label: "Week number", type: "number" },
    { name: "topic", label: "Topic" },
    { name: "content", label: "Content", type: "textarea", required: true },
    { name: "context_note", label: "Context note", type: "textarea" },
  ];

  return (
    <>
      <Topbar
        title="Student Journals"
        subtitle={
          selectedStudent ? nameFor(selectedStudent.profile) : `${students.length} students`
        }
        action={
          <>
            <div className="flex rounded-lg border border-white/8 bg-white/[0.025] p-1">
              {(["phrase_bank", "question", "session_note"] as const).map((item) => (
                <button
                  key={item}
                  onClick={() => setType(item)}
                  className={`rounded-md px-3 py-1.5 text-xs ${type === item ? "bg-sena-gold text-[#060c14]" : "text-white/45"}`}
                >
                  {item.replace("_", " ")}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setAdding(true)} className="admin-gold-btn">
              <Plus className="mr-1.5 inline h-3.5 w-3.5" />
              Add entry
            </button>
          </>
        }
      />
      <div className="admin-content">
        <Panel title="Entries">
          {filtered.map((entry) => (
            <article key={entry.id} className="border-b border-white/5 py-4 last:border-0">
              <div className="flex items-center justify-between gap-4">
                <div className="text-sm font-semibold">
                  {entry.topic || `Week ${entry.week_number ?? "—"}`}
                </div>
                <div className="text-xs text-white/30">{formatDate(entry.created_at)}</div>
              </div>
              <p className="mt-2 text-sm leading-7 text-white/65">{entry.content}</p>
              {entry.context_note && (
                <p className="mt-2 text-xs text-sena-gold/80">{entry.context_note}</p>
              )}
              <div className="mt-3 flex justify-end gap-2">
                <EditButton onClick={() => setEditingEntry(entry)} />
                <DeleteButton table="journal_entries" id={entry.id} label="Journal entry" />
              </div>
            </article>
          ))}
          {!filtered.length && <EmptyRows text="No journal entries for this filter." />}
        </Panel>
      </div>
      {adding && (
        <RecordDialog
          title="Add journal entry"
          table="journal_entries"
          fields={journalFields}
          initialValues={{ student_id: selectedStudent?.id, entry_type: type }}
          onClose={() => setAdding(false)}
        />
      )}
      {editingEntry && (
        <RecordDialog
          title="Edit journal entry"
          table="journal_entries"
          rowId={editingEntry.id}
          fields={journalFields}
          initialValues={editingEntry}
          onClose={() => setEditingEntry(null)}
        />
      )}
    </>
  );
}

function MilestonesScreen({
  milestones,
  students,
  selectedStudent,
  setSelectedStudentId,
}: {
  milestones: Milestone[];
  students: StudentRow[];
  selectedStudent?: StudentRow;
  setSelectedStudentId: (id: string) => void;
}) {
  const currentStudent = selectedStudent ?? students[0];
  const [adding, setAdding] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const rows = milestones.filter((item) => item.student_id === currentStudent?.id);
  const done = rows.filter((item) => item.completed).length;
  const pct = rows.length ? Math.round((done / rows.length) * 100) : 0;
  const milestoneFields: AdminFormField[] = [
    {
      name: "student_id",
      label: "Student",
      type: "select",
      required: true,
      options: students.map((student) => ({ label: nameFor(student.profile), value: student.id })),
    },
    { name: "title", label: "Title", required: true },
    { name: "description", label: "Description", type: "textarea" },
    { name: "target_week", label: "Target week", type: "number" },
    { name: "target_date", label: "Target date", type: "date" },
    { name: "sort_order", label: "Sort order", type: "number" },
  ];

  return (
    <>
      <Topbar
        title="Milestones"
        subtitle="Student fluency journey · click cards to mark complete"
        action={
          <>
            <select
              className="admin-select"
              value={currentStudent?.id ?? ""}
              onChange={(event) => setSelectedStudentId(event.target.value)}
            >
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {nameFor(student.profile)}
                </option>
              ))}
            </select>
            <button type="button" onClick={() => setAdding(true)} className="admin-gold-btn">
              <Plus className="mr-1.5 inline h-3.5 w-3.5" />
              New milestone
            </button>
          </>
        }
      />
      <div className="admin-content">
        <section className="milestone-journey">
          <div className="text-center">
            <div className="inline-flex rounded-full border border-sena-gold/35 bg-sena-gold/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-sena-gold">
              Fluency Milestones
            </div>
            <h2 className="mt-4 text-3xl font-bold">
              {currentStudent ? nameFor(currentStudent.profile) : "No student"}
            </h2>
            <p className="mt-2 text-sm text-sena-gold">
              {currentStudent?.goal?.fluency_goal ?? "No fluency goal set."}
            </p>
            <div className="mx-auto mt-6 flex max-w-sm items-center gap-3 rounded-full border border-white/8 bg-white/5 px-5 py-3">
              <span className="text-xs text-white/50">Journey progress</span>
              <div className="h-1 flex-1 rounded-full bg-white/8">
                <div className="h-full rounded-full bg-sena-gold" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs font-semibold text-sena-gold">{pct}%</span>
            </div>
          </div>

          <div className="relative mx-auto mt-10 max-w-3xl">
            <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-sena-gold/25 to-transparent md:block" />
            {rows.map((milestone, index) => (
              <MilestoneTimelineCard
                key={milestone.id}
                milestone={milestone}
                side={index % 2 === 0 ? "left" : "right"}
                onEdit={() => setEditingMilestone(milestone)}
              />
            ))}
            {!rows.length && <EmptyRows text="No milestones for this student." />}
          </div>
        </section>
      </div>
      {adding && (
        <RecordDialog
          title="Add milestone"
          table="milestones"
          fields={milestoneFields}
          initialValues={{ student_id: currentStudent?.id, sort_order: rows.length + 1 }}
          onClose={() => setAdding(false)}
        />
      )}
      {editingMilestone && (
        <RecordDialog
          title="Edit milestone"
          table="milestones"
          rowId={editingMilestone.id}
          fields={milestoneFields}
          initialValues={editingMilestone}
          onClose={() => setEditingMilestone(null)}
        />
      )}
    </>
  );
}

function MilestoneTimelineCard({
  milestone,
  side,
  onEdit,
}: {
  milestone: Milestone;
  side: "left" | "right";
  onEdit: () => void;
}) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async () => {
      if (!supabase) throw new Error("Supabase is not configured.");
      const completed = !milestone.completed;
      const { error } = await supabase
        .from("milestones")
        .update({ completed, completed_at: completed ? new Date().toISOString() : null })
        .eq("id", milestone.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] }),
  });

  return (
    <div
      onClick={() => mutation.mutate()}
      className={`relative mb-5 grid w-full grid-cols-1 items-start gap-5 text-left md:grid-cols-[1fr_48px_1fr] ${
        side === "right" ? "md:[&_.milestone-card]:col-start-3" : ""
      }`}
      role="button"
      tabIndex={0}
    >
      <article className={`milestone-card ${milestone.completed ? "done" : ""}`}>
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sena-gold">
          {milestone.target_week ? `Week ${milestone.target_week}` : "Milestone"} ·{" "}
          {formatDate(milestone.target_date)}
        </div>
        <h3 className="mt-2 text-sm font-bold">{milestone.title}</h3>
        <p className="mt-2 text-xs leading-6 text-white/62">
          {milestone.description ?? "No description added."}
        </p>
        {milestone.completed && (
          <div className="mt-3 inline-flex items-center gap-1.5 border-t border-sena-gold/15 pt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-sena-gold">
            <Check className="h-3 w-3" />
            Achieved
          </div>
        )}
        <div className="mt-3 flex justify-end gap-2">
          <EditButton onClick={onEdit} />
          <DeleteButton table="milestones" id={milestone.id} label="Milestone" />
        </div>
      </article>
      <span className={`milestone-node ${milestone.completed ? "done" : ""}`} />
      <span className="hidden md:block" />
    </div>
  );
}

function CoursesScreen({ courses }: { courses: Course[] }) {
  const [adding, setAdding] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const courseFields: AdminFormField[] = [
    { name: "title", label: "Title", required: true },
    { name: "category", label: "Category" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "avg_lesson_minutes", label: "Average lesson minutes", type: "number" },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: ["published", "draft"].map((value) => ({ label: value, value })),
    },
    { name: "sort_order", label: "Sort order", type: "number" },
  ];

  return (
    <>
      <Topbar
        title="Course Library"
        subtitle="Courses and lessons available to students"
        action={
          <button type="button" onClick={() => setAdding(true)} className="admin-gold-btn">
            <Plus className="mr-1.5 inline h-3.5 w-3.5" />
            Add course
          </button>
        }
      />
      <div className="admin-content">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <article key={course.id} className="admin-card p-5">
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sena-gold">
                {course.category ?? "Course"}
              </div>
              <h2 className="mt-3 text-base font-semibold">{course.title}</h2>
              <p className="mt-2 min-h-12 text-sm leading-6 text-white/55">
                {course.description ?? "No description yet."}
              </p>
              <div className="mt-4 flex items-center justify-between text-xs text-white/35">
                <span>
                  {course.avg_lesson_minutes ? `${course.avg_lesson_minutes} min avg` : "No length"}
                </span>
                <StatusPill status={course.status} />
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <EditButton onClick={() => setEditingCourse(course)} />
                <DeleteButton table="courses" id={course.id} label="Course" />
              </div>
            </article>
          ))}
          {!courses.length && <EmptyRows text="No courses seeded yet." />}
        </div>
      </div>
      {adding && (
        <RecordDialog
          title="Add course"
          table="courses"
          fields={courseFields}
          initialValues={{ status: "draft", sort_order: courses.length + 1 }}
          onClose={() => setAdding(false)}
        />
      )}
      {editingCourse && (
        <RecordDialog
          title="Edit course"
          table="courses"
          rowId={editingCourse.id}
          fields={courseFields}
          initialValues={editingCourse}
          onClose={() => setEditingCourse(null)}
        />
      )}
    </>
  );
}

const referenceContentItems: ContentItem[] = [
  {
    id: "ref-show-friends",
    title: "Friends",
    author_or_host: "TV Show",
    media_type: "show",
    cefr_level: "A2-B1",
    external_url: "https://www.netflix.com/title/70153404",
    genre_tag: "TV Show",
    thumbnail_url: "https://image.tmdb.org/t/p/w300/f496cm9enuEsZkSPzCwnTESEK5s.jpg",
    is_active: true,
    sort_order: 1,
  },
  {
    id: "ref-show-office",
    title: "The Office",
    author_or_host: "TV Show",
    media_type: "show",
    cefr_level: "B1-B2",
    external_url: "https://www.peacocktv.com/stream-tv/the-office",
    genre_tag: "TV Show",
    thumbnail_url: "https://image.tmdb.org/t/p/w300/7DJKHzAi83BmQrWLrYYOqcoKfhR.jpg",
    is_active: true,
    sort_order: 2,
  },
  {
    id: "ref-show-modern-family",
    title: "Modern Family",
    author_or_host: "TV Show",
    media_type: "show",
    cefr_level: "B1-B2",
    external_url: "https://www.hulu.com/series/modern-family",
    genre_tag: "TV Show",
    thumbnail_url: "https://image.tmdb.org/t/p/w500/k5Qg5rgPoKdh3yTJJrLtyoyYGwC.jpg",
    is_active: true,
    sort_order: 3,
  },
  {
    id: "ref-show-ted-lasso",
    title: "Ted Lasso",
    author_or_host: "TV Show",
    media_type: "show",
    cefr_level: "B2",
    external_url: "https://tv.apple.com/us/show/ted-lasso",
    genre_tag: "TV Show",
    thumbnail_url: "https://image.tmdb.org/t/p/w300/5fhZdwP1DVJ0FyVH6vrFdHwpXIn.jpg",
    is_active: true,
    sort_order: 4,
  },
  {
    id: "ref-show-brooklyn",
    title: "Brooklyn Nine-Nine",
    author_or_host: "TV Show",
    media_type: "show",
    cefr_level: "B1-B2",
    external_url: "https://www.peacocktv.com/stream-tv/brooklyn-nine-nine",
    genre_tag: "TV Show",
    thumbnail_url: "https://image.tmdb.org/t/p/w300/hgRMSOt7a1b8qyQR68vUixJPang.jpg",
    is_active: true,
    sort_order: 5,
  },
  {
    id: "ref-show-emily",
    title: "Emily in Paris",
    author_or_host: "TV Show",
    media_type: "show",
    cefr_level: "B1",
    external_url: "https://www.netflix.com/title/81037371",
    genre_tag: "TV Show",
    thumbnail_url: "https://image.tmdb.org/t/p/w500/c0bkO416OU7YGdOFktk45H8REgL.jpg",
    is_active: true,
    sort_order: 6,
  },
  {
    id: "ref-show-stranger",
    title: "Stranger Things",
    author_or_host: "TV Show",
    media_type: "show",
    cefr_level: "B2",
    external_url: "https://www.netflix.com/title/80057281",
    genre_tag: "TV Show",
    thumbnail_url: "https://image.tmdb.org/t/p/w300/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
    is_active: true,
    sort_order: 7,
  },
  {
    id: "ref-show-crown",
    title: "The Crown",
    author_or_host: "TV Show",
    media_type: "show",
    cefr_level: "C1",
    external_url: "https://www.netflix.com/title/80025678",
    genre_tag: "TV Show",
    thumbnail_url: "https://image.tmdb.org/t/p/w300/1M876KPjulVwppEpldhdc8V4o68.jpg",
    is_active: true,
    sort_order: 8,
  },
  {
    id: "ref-movie-forrest",
    title: "Forrest Gump",
    author_or_host: "Movie",
    media_type: "movie",
    cefr_level: "B1",
    external_url: "https://www.amazon.com/dp/B00F9G0BHY",
    genre_tag: "Movie",
    thumbnail_url: "https://image.tmdb.org/t/p/w300/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
    is_active: true,
    sort_order: 1,
  },
  {
    id: "ref-movie-happyness",
    title: "Pursuit of Happyness",
    author_or_host: "Movie",
    media_type: "movie",
    cefr_level: "B1-B2",
    external_url: "https://www.netflix.com/title/70044605",
    genre_tag: "Movie",
    thumbnail_url: "https://image.tmdb.org/t/p/w500/lBYOKAMcxIvuk9s9hMuecB9dPBV.jpg",
    is_active: true,
    sort_order: 2,
  },
  {
    id: "ref-movie-prada",
    title: "The Devil Wears Prada",
    author_or_host: "Movie",
    media_type: "movie",
    cefr_level: "B2",
    external_url: "https://www.disneyplus.com/movies/the-devil-wears-prada",
    genre_tag: "Movie",
    thumbnail_url: "https://image.tmdb.org/t/p/w500/8912AsVuS7Sj915apArUFbv6F9L.jpg",
    is_active: true,
    sort_order: 3,
  },
  {
    id: "ref-movie-inside-out",
    title: "Inside Out",
    author_or_host: "Movie",
    media_type: "movie",
    cefr_level: "A2-B1",
    external_url: "https://www.disneyplus.com/movies/inside-out",
    genre_tag: "Movie",
    thumbnail_url: "https://image.tmdb.org/t/p/w500/2H1TmgdfNtsKlU9jKdeNyYL5y8T.jpg",
    is_active: true,
    sort_order: 4,
  },
  {
    id: "ref-movie-lala",
    title: "La La Land",
    author_or_host: "Movie",
    media_type: "movie",
    cefr_level: "B1-B2",
    external_url: "https://www.amazon.com/dp/B01N4BLSXG",
    genre_tag: "Movie",
    thumbnail_url: "https://image.tmdb.org/t/p/w300/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg",
    is_active: true,
    sort_order: 5,
  },
  {
    id: "ref-movie-little-women",
    title: "Little Women",
    author_or_host: "Movie",
    media_type: "movie",
    cefr_level: "B2",
    external_url: "https://www.netflix.com/title/81058497",
    genre_tag: "Movie",
    thumbnail_url: "https://image.tmdb.org/t/p/w500/yn5ihODtZ7ofn8pDYfxCmxh8AXI.jpg",
    is_active: true,
    sort_order: 6,
  },
  {
    id: "ref-movie-social",
    title: "The Social Network",
    author_or_host: "Movie",
    media_type: "movie",
    cefr_level: "C1",
    external_url: "https://www.netflix.com/title/70132721",
    genre_tag: "Movie",
    thumbnail_url: "https://image.tmdb.org/t/p/w300/n0ybibhJtQ5icDqTp8eRytcIHJx.jpg",
    is_active: true,
    sort_order: 7,
  },
  {
    id: "ref-movie-speech",
    title: "The King's Speech",
    author_or_host: "Movie",
    media_type: "movie",
    cefr_level: "C1",
    external_url: "https://www.amazon.com/dp/B004OJN6LQ",
    genre_tag: "Movie",
    thumbnail_url: "https://image.tmdb.org/t/p/w500/pVNKXVQFukBaCz6ML7GH3kiPlQP.jpg",
    is_active: true,
    sort_order: 8,
  },
  {
    id: "ref-music-folklore",
    title: "folklore",
    author_or_host: "Taylor Swift",
    media_type: "music",
    cefr_level: null,
    external_url: "https://open.spotify.com/album/2fenSS68JI1h4Fo296JfGr",
    genre_tag: "Music",
    thumbnail_url: "https://i.scdn.co/image/ab67616d00001e0295f754318336a07e85ec59bc",
    is_active: true,
    sort_order: 1,
  },
  {
    id: "ref-music-divide",
    title: "Divide",
    author_or_host: "Ed Sheeran",
    media_type: "music",
    cefr_level: null,
    external_url: "https://open.spotify.com/album/3T4tUhGYeRNVUGevb0wThu",
    genre_tag: "Music",
    thumbnail_url: "https://i.scdn.co/image/ab67616d0000b273ba5db46f4b838ef6027e6f96",
    is_active: true,
    sort_order: 2,
  },
  {
    id: "ref-music-billie",
    title: "Happier Than Ever",
    author_or_host: "Billie Eilish",
    media_type: "music",
    cefr_level: null,
    external_url: "https://open.spotify.com/album/0JGOiO34nwfUdDrD612dOp",
    genre_tag: "Music",
    thumbnail_url: "https://i.scdn.co/image/ab67616d00001e022a038d3bf875d23e4aeaa84e",
    is_active: true,
    sort_order: 3,
  },
  {
    id: "ref-music-bruno",
    title: "24K Magic",
    author_or_host: "Bruno Mars",
    media_type: "music",
    cefr_level: null,
    external_url: "https://open.spotify.com/album/1FSLW1L51BEFMEoPwOHuRh",
    genre_tag: "Music",
    thumbnail_url: "https://i.scdn.co/image/ab67616d00001e02232711f7d66a1e19e89e28c5",
    is_active: true,
    sort_order: 4,
  },
  {
    id: "ref-music-30",
    title: "30",
    author_or_host: "Adele",
    media_type: "music",
    cefr_level: null,
    external_url: "https://open.spotify.com/album/21jF5jlMtzo1y3pFQMK5aH",
    genre_tag: "Music",
    thumbnail_url: "https://i.scdn.co/image/ab67616d00001e02c6b577e4c4a6d326354a89f7",
    is_active: true,
    sort_order: 5,
  },
  {
    id: "ref-music-coldplay",
    title: "A Head Full of Dreams",
    author_or_host: "Coldplay",
    media_type: "music",
    cefr_level: null,
    external_url: "https://open.spotify.com/album/0RHX9XECH8IHGzaOyWFBgH",
    genre_tag: "Music",
    thumbnail_url: "https://i.scdn.co/image/ab67616d00001e028ff7c3580d429c8212b9a3b6",
    is_active: true,
    sort_order: 6,
  },
  {
    id: "ref-music-sara",
    title: "Amidst the Chaos",
    author_or_host: "Sara Bareilles",
    media_type: "music",
    cefr_level: null,
    external_url: "https://open.spotify.com/album/3CaATQi8ynqhKahWt8KGJC",
    genre_tag: "Music",
    thumbnail_url: "https://i.scdn.co/image/ab67616d00001e0286164971ea2526a56f6cfe27",
    is_active: true,
    sort_order: 7,
  },
  {
    id: "ref-pod-daily",
    title: "The Daily",
    author_or_host: "NYT",
    media_type: "podcast",
    cefr_level: "B2",
    external_url: "https://open.spotify.com/show/3IM0lmZxpFAY7CwMuv9H4g",
    genre_tag: "News",
    duration_label: "25 MIN",
    description: "A 25-minute news story, every weekday. Conversational, current, very American.",
    is_active: true,
    sort_order: 1,
  },
  {
    id: "ref-pod-built",
    title: "How I Built This",
    author_or_host: "NPR",
    media_type: "podcast",
    cefr_level: "B2",
    external_url: "https://open.spotify.com/show/6E709HRH7XaiZrMfgtNCun",
    genre_tag: "Business",
    duration_label: "45 MIN",
    description:
      "Founders tell the real story of building their company. Business English in the wild.",
    is_active: true,
    sort_order: 2,
  },
  {
    id: "ref-pod-ted",
    title: "TED Talks Daily",
    author_or_host: "TED",
    media_type: "podcast",
    cefr_level: "B1-B2",
    external_url: "https://open.spotify.com/show/1VXcH8QHkjRcTCEd88U3ti",
    genre_tag: "Ideas",
    duration_label: "15 MIN",
    description: "One powerful idea, clearly explained. Every accent, every topic.",
    is_active: true,
    sort_order: 3,
  },
  {
    id: "ref-pod-tal",
    title: "This American Life",
    author_or_host: "NPR",
    media_type: "podcast",
    cefr_level: "C1",
    external_url: "https://open.spotify.com/show/2mTUnDkuKUkhiueKcVWoP0",
    genre_tag: "Storytelling",
    duration_label: "60 MIN",
    description: "Real stories of American life, told as radio essays. The gold standard.",
    is_active: true,
    sort_order: 4,
  },
  {
    id: "ref-pod-all-ears",
    title: "All Ears English",
    author_or_host: "All Ears",
    media_type: "podcast",
    cefr_level: "B1-B2",
    external_url: "https://open.spotify.com/show/0VBEKEVFtXCl5HtXJXbcRd",
    genre_tag: "ESL",
    duration_label: "20 MIN",
    description: "Two American hosts. Conversational, warm, built specifically for learners.",
    is_active: true,
    sort_order: 5,
  },
  {
    id: "ref-pod-bbc",
    title: "6 Minute English",
    author_or_host: "BBC",
    media_type: "podcast",
    cefr_level: "A2-B1",
    external_url: "https://open.spotify.com/show/71Ppau7Cc8hBiRFR4N0vaM",
    genre_tag: "BBC",
    duration_label: "6 MIN",
    description: "BBC. One topic, six minutes. Perfect for any commute.",
    is_active: true,
    sort_order: 6,
  },
  {
    id: "ref-pod-luke",
    title: "Luke's English Podcast",
    author_or_host: "Luke Thompson",
    media_type: "podcast",
    cefr_level: "B2-C1",
    external_url: "https://open.spotify.com/show/0FqOBOi3WKynJOBZkiOjhT",
    genre_tag: "ESL",
    duration_label: "40 MIN",
    description:
      "British comedian + qualified teacher. Hours of natural-paced English for learners.",
    is_active: true,
    sort_order: 7,
  },
  {
    id: "ref-pod-espresso",
    title: "Espresso English",
    author_or_host: "Espresso English",
    media_type: "podcast",
    cefr_level: "A2-B1",
    external_url: "https://open.spotify.com/show/0z9Qul3kqXEYrCBEHMpFP6",
    genre_tag: "ESL",
    duration_label: "10 MIN",
    description: "Bite-sized American English lessons. Practical, clear, perfect for busy days.",
    is_active: true,
    sort_order: 8,
  },
  {
    id: "ref-book-mango",
    title: "The House on Mango Street",
    author_or_host: "Sandra Cisneros",
    media_type: "book",
    cefr_level: "B1",
    external_url: "https://www.amazon.com/dp/0679734775",
    genre_tag: "Book",
    thumbnail_url: "https://covers.openlibrary.org/b/isbn/0679734775-M.jpg",
    is_active: true,
    sort_order: 1,
  },
  {
    id: "ref-book-alchemist",
    title: "The Alchemist",
    author_or_host: "Paulo Coelho",
    media_type: "book",
    cefr_level: "B1",
    external_url: "https://www.amazon.com/dp/0061122416",
    genre_tag: "Book",
    thumbnail_url: "https://covers.openlibrary.org/b/isbn/0061122416-M.jpg",
    is_active: true,
    sort_order: 2,
  },
  {
    id: "ref-book-morrie",
    title: "Tuesdays with Morrie",
    author_or_host: "Mitch Albom",
    media_type: "book",
    cefr_level: "B1",
    external_url: "https://www.amazon.com/dp/076790592X",
    genre_tag: "Book",
    thumbnail_url: "https://covers.openlibrary.org/b/isbn/076790592X-M.jpg",
    is_active: true,
    sort_order: 3,
  },
  {
    id: "ref-book-curious",
    title: "The Curious Incident",
    author_or_host: "Mark Haddon",
    media_type: "book",
    cefr_level: "B1-B2",
    external_url: "https://www.amazon.com/dp/1400032717",
    genre_tag: "Book",
    thumbnail_url: "https://covers.openlibrary.org/b/isbn/1400032717-M.jpg",
    is_active: true,
    sort_order: 4,
  },
  {
    id: "ref-book-stars",
    title: "The Fault in Our Stars",
    author_or_host: "John Green",
    media_type: "book",
    cefr_level: "B1-B2",
    external_url: "https://www.amazon.com/dp/014242417X",
    genre_tag: "Book",
    thumbnail_url: "https://covers.openlibrary.org/b/isbn/014242417X-M.jpg",
    is_active: true,
    sort_order: 5,
  },
  {
    id: "ref-book-atomic",
    title: "Atomic Habits",
    author_or_host: "James Clear",
    media_type: "book",
    cefr_level: "B2",
    external_url: "https://www.amazon.com/dp/0735211299",
    genre_tag: "Book",
    thumbnail_url: "https://covers.openlibrary.org/b/isbn/0735211299-M.jpg",
    is_active: true,
    sort_order: 6,
  },
  {
    id: "ref-book-educated",
    title: "Educated",
    author_or_host: "Tara Westover",
    media_type: "book",
    cefr_level: "C1",
    external_url: "https://www.amazon.com/dp/0399590501",
    genre_tag: "Book",
    thumbnail_url: "https://covers.openlibrary.org/b/isbn/0399590501-M.jpg",
    is_active: true,
    sort_order: 7,
  },
  {
    id: "ref-src-news",
    title: "Same news, 3 reading levels",
    author_or_host: "News in Levels",
    media_type: "reading_source",
    cefr_level: null,
    external_url: "https://www.newsinlevels.com",
    genre_tag: "News in Levels",
    description: "Read any story at your level, then level up.",
    is_active: true,
    sort_order: 1,
  },
  {
    id: "ref-src-bbc",
    title: "Daily English lessons",
    author_or_host: "BBC Learning English",
    media_type: "reading_source",
    cefr_level: null,
    external_url: "https://www.bbc.co.uk/learningenglish",
    genre_tag: "BBC Learning English",
    description: "Free, structured, updated constantly. All levels.",
    is_active: true,
    sort_order: 2,
  },
  {
    id: "ref-src-atlantic",
    title: "Long-form journalism",
    author_or_host: "The Atlantic",
    media_type: "reading_source",
    cefr_level: "C1+",
    external_url: "https://www.theatlantic.com",
    genre_tag: "The Atlantic",
    description: "In-depth essays on culture and ideas. Best for C1+.",
    is_active: true,
    sort_order: 3,
  },
  {
    id: "ref-src-npr",
    title: "Text + audio immersion",
    author_or_host: "NPR",
    media_type: "reading_source",
    cefr_level: null,
    external_url: "https://www.npr.org",
    genre_tag: "NPR",
    description: "Read the article and listen to it. Full immersion.",
    is_active: true,
    sort_order: 4,
  },
  {
    id: "ref-src-medium",
    title: "Modern essays",
    author_or_host: "Medium",
    media_type: "reading_source",
    cefr_level: null,
    external_url: "https://www.medium.com",
    genre_tag: "Medium",
    description: "Endless modern writing on every topic.",
    is_active: true,
    sort_order: 5,
  },
  {
    id: "ref-play-commute",
    title: "For your commute",
    author_or_host: "Playlist",
    media_type: "playlist",
    cefr_level: null,
    external_url: "#",
    genre_tag: "car",
    description:
      "Short-form content, 5-30 min. Podcasts, music, and news for the in-between moments.",
    duration_label: "6 picks ->",
    is_active: true,
    sort_order: 1,
  },
  {
    id: "ref-play-career",
    title: "For your career",
    author_or_host: "Playlist",
    media_type: "playlist",
    cefr_level: null,
    external_url: "#",
    genre_tag: "work",
    description:
      "Business books, founder podcasts, industry news. Vocabulary you'll actually use at work.",
    duration_label: "6 picks ->",
    is_active: true,
    sort_order: 2,
  },
  {
    id: "ref-play-unwind",
    title: "To unwind in English",
    author_or_host: "Playlist",
    media_type: "playlist",
    cefr_level: null,
    external_url: "#",
    genre_tag: "moon",
    description:
      "Slow shows, gentle podcasts. For when your brain is tired but still wants exposure.",
    duration_label: "6 picks ->",
    is_active: true,
    sort_order: 3,
  },
  {
    id: "ref-play-laugh",
    title: "To laugh in English",
    author_or_host: "Playlist",
    media_type: "playlist",
    cefr_level: null,
    external_url: "#",
    genre_tag: "laugh",
    description:
      "Comedy shows and funny podcasts. Humor is one of the fastest ways to feel at home.",
    duration_label: "5 picks ->",
    is_active: true,
    sort_order: 4,
  },
  {
    id: "ref-play-bold",
    title: "Bold conversations",
    author_or_host: "Playlist",
    media_type: "playlist",
    cefr_level: null,
    external_url: "#",
    genre_tag: "fire",
    description: "Faster, denser, harder. For when you're ready to stretch.",
    duration_label: "6 picks ->",
    is_active: true,
    sort_order: 5,
  },
];

function mergeReferenceContent(content: ContentItem[]) {
  const seen = new Set(
    referenceContentItems.map((item) => `${item.media_type}:${item.title}`.toLowerCase()),
  );
  return [
    ...referenceContentItems,
    ...content.filter((item) => !seen.has(`${item.media_type}:${item.title}`.toLowerCase())),
  ];
}

function ContentLibraryScreen({ content }: { content: ContentItem[] }) {
  const [adding, setAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const libraryContent = mergeReferenceContent(content);
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
  const contentFields: AdminFormField[] = [
    { name: "title", label: "Title", required: true },
    { name: "author_or_host", label: "Author or host" },
    {
      name: "media_type",
      label: "Media type",
      type: "select",
      required: true,
      options: ["show", "movie", "music", "podcast", "book", "reading_source", "playlist"].map(
        (value) => ({ label: value, value }),
      ),
    },
    {
      name: "cefr_level",
      label: "CEFR level",
      type: "select",
      options: ["A1", "A2", "B1", "B2", "C1", "C2", "A2_B1", "B1_B2"].map((value) => ({
        label: value,
        value,
      })),
    },
    { name: "external_url", label: "External URL" },
    { name: "genre_tag", label: "Genre tag" },
    { name: "playlist_tag", label: "Playlist tag" },
    { name: "duration_label", label: "Duration label" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "thumbnail_url", label: "Thumbnail URL" },
    { name: "sort_order", label: "Sort order", type: "number" },
  ];

  return (
    <>
      <Topbar
        title="Content Library"
        subtitle="Student-facing library - click any card to open its source"
        action={
          <button type="button" onClick={() => setAdding(true)} className="admin-gold-btn">
            <Plus className="mr-1.5 inline h-3.5 w-3.5" />
            Add content
          </button>
        }
      />
      <div className="admin-content">
        <div className="cl-wrap">
          <div className="cl-nav">
            <div className="cl-nav-title">
              Fluent with Sena <span>Library</span>
            </div>
            <div className="cl-dot" />
          </div>
          <div className="cl-main">
            <div className="cl-hero">
              <h1>English You Enjoy</h1>
              <p>
                Keep what you love and incorporate it into your daily routine - your commute,
                chores, or evenings. English you enjoy never feels like homework.
              </p>
            </div>
            <div className="cl-sections">
              <ContentSection
                title="Watch - Shows"
                isEmpty={!shows.length}
                emptyText="No shows added yet."
              >
                <ContentShelf label="Watch shows">
                  {shows.map((item) => (
                    <LibraryPosterCard
                      key={item.id}
                      item={item}
                      fallbackKind="TV Show"
                      onEdit={() => setEditingItem(item)}
                    />
                  ))}
                </ContentShelf>
              </ContentSection>
              <ContentSection
                title="Watch - Movies"
                isEmpty={!movies.length}
                emptyText="No movies added yet."
              >
                <ContentShelf label="Watch movies">
                  {movies.map((item) => (
                    <LibraryPosterCard
                      key={item.id}
                      item={item}
                      fallbackKind="Movie"
                      onEdit={() => setEditingItem(item)}
                    />
                  ))}
                </ContentShelf>
              </ContentSection>
              <ContentSection title="Sing" isEmpty={!music.length} emptyText="No music added yet.">
                <ContentShelf label="Music">
                  {music.map((item) => (
                    <LibrarySquareCard
                      key={item.id}
                      item={item}
                      onEdit={() => setEditingItem(item)}
                    />
                  ))}
                </ContentShelf>
              </ContentSection>
              <ContentSection
                title="Listen - Podcasts"
                isEmpty={!podcasts.length}
                emptyText="No podcasts added yet."
              >
                <div className="cl-pod-grid">
                  {podcasts.map((item) => (
                    <LibraryPodcastCard
                      key={item.id}
                      item={item}
                      onEdit={() => setEditingItem(item)}
                    />
                  ))}
                </div>
              </ContentSection>
              <ContentSection
                title="Read"
                isEmpty={!books.length && !readingSources.length}
                emptyText="No reading content added yet."
              >
                {!!books.length && (
                  <>
                    <div className="cl-mini-head">Books</div>
                    <div className="cl-book-grid">
                      {books.map((item) => (
                        <LibraryBookCard
                          key={item.id}
                          item={item}
                          onEdit={() => setEditingItem(item)}
                        />
                      ))}
                    </div>
                  </>
                )}
                {!!readingSources.length && (
                  <>
                    <div className="cl-mini-head cl-mini-head-spaced">Reading Sources</div>
                    <div className="cl-src-grid">
                      {readingSources.map((item) => (
                        <LibrarySourceCard
                          key={item.id}
                          item={item}
                          onEdit={() => setEditingItem(item)}
                        />
                      ))}
                    </div>
                  </>
                )}
              </ContentSection>
              <ContentSection
                title="Playlists For What You're Working On"
                isEmpty={!playlists.length}
                emptyText="No playlists added yet."
              >
                <div className="cl-pl-grid">
                  {playlists.map((item) => (
                    <LibraryPlaylistCard
                      key={item.id}
                      item={item}
                      onEdit={() => setEditingItem(item)}
                    />
                  ))}
                </div>
              </ContentSection>
            </div>
            <div className="cl-footer">
              <p>
                All content links to its original source. Click any card to start watching,
                listening, or reading.
              </p>
              <p>Property of Fluent with Sena LLC. All Rights Reserved.</p>
            </div>
          </div>
        </div>
        <div className="admin-grid-table" style={{ display: "none" }}>
          <div className="admin-table-head grid-cols-[1.4fr_.7fr_.6fr_.8fr_.5fr_.5fr]">
            <span>Title</span>
            <span>Type</span>
            <span>Level</span>
            <span>Genre</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          {content.map((item) => (
            <div
              key={item.id}
              className="admin-table-row grid-cols-[1.4fr_.7fr_.6fr_.8fr_.5fr_.5fr]"
            >
              <span>
                <span className="block text-sm font-medium">{item.title}</span>
                <span className="block text-xs text-white/32">
                  {item.author_or_host ?? "No author"}
                </span>
              </span>
              <span>{item.media_type}</span>
              <span>{item.cefr_level ?? "—"}</span>
              <span>{item.genre_tag ?? "—"}</span>
              <StatusPill status={item.is_active ? "active" : "draft"} />
              <span className="flex items-center gap-2">
                <EditButton onClick={() => setEditingItem(item)} />
                <DeleteButton table="content_items" id={item.id} label="Content item" />
              </span>
            </div>
          ))}
        </div>
      </div>
      {adding && (
        <RecordDialog
          title="Add content item"
          table="content_items"
          fields={contentFields}
          initialValues={{ media_type: "podcast", sort_order: content.length + 1 }}
          onClose={() => setAdding(false)}
        />
      )}
      {editingItem && (
        <RecordDialog
          title="Edit content item"
          table="content_items"
          rowId={editingItem.id}
          fields={contentFields}
          initialValues={editingItem}
          onClose={() => setEditingItem(null)}
        />
      )}
    </>
  );
}

function ContentSection({
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

function ContentShelf({ label, children }: { label: string; children: ReactNode }) {
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
        aria-label={`Scroll ${label} left`}
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
        aria-label={`Scroll ${label} right`}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function contentHref(item: ContentItem) {
  return item.external_url || "#";
}

function contentImage(item: ContentItem, shape: "poster" | "square" | "book") {
  if (item.thumbnail_url) return item.thumbnail_url;
  if (shape === "poster") {
    return "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=360&q=80";
  }
  if (shape === "book") {
    return "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=360&q=80";
  }
  return "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=360&q=80";
}

function isReferenceContent(item: ContentItem) {
  return item.id.startsWith("ref-");
}

function contentCardShellClass(item: ContentItem) {
  return `cl-card-shell${isReferenceContent(item) ? "" : " is-editable"}`;
}

function CardAdminActions({ item, onEdit }: { item: ContentItem; onEdit: () => void }) {
  if (isReferenceContent(item)) return null;

  return (
    <div className="cl-admin-actions">
      <EditButton onClick={onEdit} label="Update item" />
      <DeleteButton table="content_items" id={item.id} label="Content item" />
    </div>
  );
}

function LibraryPosterCard({
  item,
  fallbackKind,
  onEdit,
}: {
  item: ContentItem;
  fallbackKind: string;
  onEdit: () => void;
}) {
  return (
    <div className={contentCardShellClass(item)}>
      <a href={contentHref(item)} target="_blank" rel="noreferrer" className="cl-card-v">
        <div className="cl-img">
          <img src={contentImage(item, "poster")} alt={item.title} />
        </div>
        <div className="cl-level">{item.cefr_level ?? "All"}</div>
        <div className="cl-card-title">{item.title}</div>
        <div className="cl-card-sub">{item.author_or_host ?? fallbackKind}</div>
      </a>
      <CardAdminActions item={item} onEdit={onEdit} />
    </div>
  );
}

function LibrarySquareCard({ item, onEdit }: { item: ContentItem; onEdit: () => void }) {
  return (
    <div className={contentCardShellClass(item)}>
      <a href={contentHref(item)} target="_blank" rel="noreferrer" className="cl-card-sq">
        <div className="cl-img-sq">
          <img src={contentImage(item, "square")} alt={item.title} />
        </div>
        <div className="cl-card-title">{item.title}</div>
        <div className="cl-card-sub">{item.author_or_host ?? "Music"}</div>
      </a>
      <CardAdminActions item={item} onEdit={onEdit} />
    </div>
  );
}

function LibraryPodcastCard({ item, onEdit }: { item: ContentItem; onEdit: () => void }) {
  return (
    <div className={contentCardShellClass(item)}>
      <a href={contentHref(item)} target="_blank" rel="noreferrer" className="cl-pod-card">
        <div className="cl-pod-dur">{item.duration_label ?? "LISTEN"}</div>
        <div className="cl-wave">
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="cl-pod-title">{item.title}</div>
        <div className="cl-pod-desc">{item.description ?? "Podcast immersion resource."}</div>
        <span className="cl-pod-tag">{item.genre_tag ?? "Audio"}</span>
      </a>
      <CardAdminActions item={item} onEdit={onEdit} />
    </div>
  );
}

function LibraryBookCard({ item, onEdit }: { item: ContentItem; onEdit: () => void }) {
  return (
    <div className={contentCardShellClass(item)}>
      <a href={contentHref(item)} target="_blank" rel="noreferrer" className="cl-book-card">
        <div className="cl-book-cover">
          <img src={contentImage(item, "book")} alt={item.title} />
        </div>
        <div className="cl-level">{item.cefr_level ?? "All"}</div>
        <div className="cl-book-title">{item.title}</div>
        <div className="cl-card-sub">{item.author_or_host ?? "Book"}</div>
      </a>
      <CardAdminActions item={item} onEdit={onEdit} />
    </div>
  );
}

function LibrarySourceCard({ item, onEdit }: { item: ContentItem; onEdit: () => void }) {
  return (
    <div className={contentCardShellClass(item)}>
      <a href={contentHref(item)} target="_blank" rel="noreferrer" className="cl-src-card">
        <div className="cl-src-label">{item.author_or_host ?? "Source"}</div>
        <div className="cl-src-title">{item.title}</div>
        <div className="cl-src-desc">
          {item.description ?? item.genre_tag ?? "Reading immersion."}
        </div>
      </a>
      <CardAdminActions item={item} onEdit={onEdit} />
    </div>
  );
}

function playlistIcon(tag?: string | null) {
  if (tag === "car") return "🚗";
  if (tag === "work") return "💼";
  if (tag === "moon") return "🌙";
  if (tag === "laugh") return "😂";
  if (tag === "fire") return "🔥";
  return tag ?? ">";
}

function playlistNode(tag?: string | null) {
  const className = "h-7 w-7";
  if (tag === "car") return <Car className={className} />;
  if (tag === "work") return <BriefcaseBusiness className={className} />;
  if (tag === "moon") return <Moon className={className} />;
  if (tag === "laugh") return <Smile className={className} />;
  if (tag === "fire") return <Flame className={className} />;
  return tag ?? ">";
}

function LibraryPlaylistCard({ item, onEdit }: { item: ContentItem; onEdit: () => void }) {
  return (
    <div className={contentCardShellClass(item)}>
      <a href={contentHref(item)} target="_blank" rel="noreferrer" className="cl-pl-card">
        <div className="cl-pl-icon">{playlistNode(item.genre_tag)}</div>
        <div className="cl-pl-title">{item.title}</div>
        <div className="cl-pl-desc">
          {item.description ?? "Curated resources for focused practice."}
        </div>
        <div className="cl-pl-count">{item.duration_label ?? "Open playlist ->"}</div>
      </a>
      <CardAdminActions item={item} onEdit={onEdit} />
    </div>
  );
}

function ObjectivesScreen({
  objectives,
  students,
  selectedStudent,
}: {
  objectives: Objective[];
  students: StudentRow[];
  selectedStudent?: StudentRow;
}) {
  const [adding, setAdding] = useState(false);
  const [editingObjective, setEditingObjective] = useState<Objective | null>(null);
  const filtered = selectedStudent
    ? objectives.filter((objective) => objective.student_id === selectedStudent.id)
    : objectives;
  const objectiveFields: AdminFormField[] = [
    {
      name: "student_id",
      label: "Student",
      type: "select",
      required: true,
      options: students.map((student) => ({ label: nameFor(student.profile), value: student.id })),
    },
    { name: "week_number", label: "Week number", type: "number", required: true },
    { name: "week_label", label: "Week label" },
    { name: "focus_area", label: "Focus area", type: "number" },
    { name: "focus_title", label: "Focus title", required: true },
    { name: "context_for_student", label: "Context for student", type: "textarea" },
    { name: "check_in_context", label: "Check-in context", type: "textarea" },
    { name: "sent_at", label: "Sent at", type: "datetime-local" },
  ];
  return (
    <>
      <Topbar
        title="Objectives Builder"
        subtitle={
          selectedStudent
            ? `${nameFor(selectedStudent.profile)} · weekly focus areas`
            : `${students.length} students`
        }
        action={
          <button type="button" onClick={() => setAdding(true)} className="admin-gold-btn">
            <Plus className="mr-1.5 inline h-3.5 w-3.5" />
            Add objective
          </button>
        }
      />
      <div className="admin-content">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {filtered.map((objective) => {
            const student = students.find((item) => item.id === objective.student_id);
            return (
              <article key={objective.id} className="admin-card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs text-sena-gold">Focus area {objective.focus_area}</div>
                    <h2 className="mt-1 text-base font-semibold">{objective.focus_title}</h2>
                    <p className="mt-1 text-xs text-white/35">
                      {nameFor(student?.profile)} ·{" "}
                      {objective.week_label ?? `Week ${objective.week_number}`}
                    </p>
                  </div>
                  <StatusPill status={objective.sent_at ? "sent" : "draft"} />
                </div>
                <p className="mt-4 text-sm leading-7 text-white/62">
                  {objective.context_for_student ?? "No student context written yet."}
                </p>
                <div className="mt-4 flex justify-end gap-2">
                  <EditButton onClick={() => setEditingObjective(objective)} />
                  <DeleteButton table="objectives" id={objective.id} label="Objective" />
                </div>
              </article>
            );
          })}
          {!filtered.length && <EmptyRows text="No objectives created yet." />}
        </div>
      </div>
      {adding && (
        <RecordDialog
          title="Add objective"
          table="objectives"
          fields={objectiveFields}
          initialValues={{
            student_id: selectedStudent?.id,
            week_number: selectedStudent?.current_week ?? 1,
            focus_area: 1,
          }}
          onClose={() => setAdding(false)}
        />
      )}
      {editingObjective && (
        <RecordDialog
          title="Edit objective"
          table="objectives"
          rowId={editingObjective.id}
          fields={objectiveFields}
          initialValues={editingObjective}
          onClose={() => setEditingObjective(null)}
        />
      )}
    </>
  );
}

function SettingsScreen({ applications }: { applications: Application[] }) {
  const [adding, setAdding] = useState(false);
  const applicationFields: AdminFormField[] = [
    { name: "full_name", label: "Full name", required: true },
    { name: "email", label: "Email", required: true },
    { name: "linkedin_url", label: "LinkedIn URL" },
    { name: "current_role", label: "Current role" },
    { name: "industry", label: "Industry" },
    {
      name: "english_level",
      label: "English level",
      type: "select",
      options: ["beginner", "intermediate", "advanced"].map((value) => ({ label: value, value })),
    },
    { name: "primary_goal", label: "Primary goal" },
    { name: "motivation", label: "Motivation", type: "textarea" },
    {
      name: "preferred_start",
      label: "Preferred start",
      type: "select",
      options: ["within_30_days", "1_3_months", "3_plus_months", "not_sure"].map((value) => ({
        label: value,
        value,
      })),
    },
    {
      name: "weekly_hours",
      label: "Weekly hours",
      type: "select",
      options: ["3_4", "4_5", "5_plus"].map((value) => ({ label: value, value })),
    },
    { name: "referral_source", label: "Referral source" },
    { name: "additional_notes", label: "Additional notes", type: "textarea" },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: ["pending", "reviewed", "accepted", "rejected"].map((value) => ({
        label: value,
        value,
      })),
    },
  ];
  return (
    <>
      <Topbar
        title="Settings"
        subtitle="Applications and admin operating defaults"
        action={
          <button type="button" onClick={() => setAdding(true)} className="admin-gold-btn">
            <Plus className="mr-1.5 inline h-3.5 w-3.5" />
            Add application
          </button>
        }
      />
      <div className="admin-content">
        <Panel title="Applications">
          {applications.map((application) => (
            <ApplicationRow
              key={application.id}
              application={application}
              fields={applicationFields}
            />
          ))}
          {!applications.length && <EmptyRows text="No applications submitted yet." />}
        </Panel>
      </div>
      {adding && (
        <RecordDialog
          title="Add application"
          table="applications"
          fields={applicationFields}
          initialValues={{ status: "pending" }}
          onClose={() => setAdding(false)}
        />
      )}
    </>
  );
}

function ApplicationRow({
  application,
  fields,
}: {
  application: Application;
  fields: AdminFormField[];
}) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const mutation = useMutation({
    mutationFn: async (status: Application["status"]) => {
      if (!supabase) throw new Error("Supabase is not configured.");
      const { error } = await supabase
        .from("applications")
        .update({ status, reviewed_at: new Date().toISOString() })
        .eq("id", application.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] }),
  });

  return (
    <article className="border-b border-white/5 py-4 last:border-0">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold">{application.full_name}</h3>
          <p className="mt-1 text-xs text-white/35">
            {application.email} · {application.current_role ?? "No role"} ·{" "}
            {formatDate(application.created_at)}
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/58">
            {application.motivation ?? "No motivation submitted."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusPill status={application.status} />
          <button className="admin-outline-btn" onClick={() => mutation.mutate("reviewed")}>
            Reviewed
          </button>
          <button className="admin-gold-btn" onClick={() => mutation.mutate("accepted")}>
            Accept
          </button>
          <EditButton onClick={() => setEditing(true)} />
          <DeleteButton table="applications" id={application.id} label="Application" />
        </div>
      </div>
      {mutation.error instanceof Error && (
        <p className="mt-2 text-xs text-red-300">{mutation.error.message}</p>
      )}
      {editing && (
        <RecordDialog
          title="Edit application"
          table="applications"
          rowId={application.id}
          fields={fields}
          initialValues={application}
          onClose={() => setEditing(false)}
        />
      )}
    </article>
  );
}

function StudentListRow({ student }: { student: StudentRow }) {
  const name = nameFor(student.profile);
  return (
    <div className="admin-list-row">
      <Avatar name={name} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-medium">{name}</div>
        <div className="truncate text-[10px] text-white/30">
          {student.tier?.name ?? "No tier"} · Week {student.current_week} ·{" "}
          {student.industry ?? "No industry"}
        </div>
      </div>
      <div className="w-10 text-right text-xs font-semibold text-sena-gold">
        {student.confidence_score ?? "—"}
      </div>
      <StatusPill status={student.status} />
    </div>
  );
}

function SessionListRow({ session, students }: { session: LiveSession; students: StudentRow[] }) {
  const student = students.find((item) => item.id === session.student_id);
  return (
    <div className="admin-list-row">
      <div className="w-20 text-xs font-semibold text-sena-gold">
        {formatTime(session.scheduled_at)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px]">{nameFor(student?.profile)}</div>
        <div className="truncate text-[10px] text-white/30">
          Week {session.week_number} · {session.focus_topic ?? "Coaching"}
        </div>
      </div>
      <StatusPill status={session.status} />
    </div>
  );
}

function CheckInListRow({
  checkIn,
  students,
  compact,
}: {
  checkIn: CheckIn;
  students: StudentRow[];
  compact?: boolean;
}) {
  const student = students.find((item) => item.id === checkIn.student_id);
  return (
    <div className="admin-list-row items-start">
      <div
        className={`mt-1 h-2 w-2 rounded-full ${checkIn.status === "pending" ? "bg-sena-gold" : "bg-white/15"}`}
      />
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-medium">{nameFor(student?.profile)}</div>
        <div className="mt-1 line-clamp-2 text-xs leading-5 text-white/40">
          {compact
            ? checkIn.biggest_struggle || checkIn.win_of_week
            : checkIn.note_for_next || checkIn.win_of_week}
        </div>
      </div>
      <div className="text-right text-[10px] text-white/25">{formatDate(checkIn.submitted_at)}</div>
    </div>
  );
}

function MilestoneListRow({
  milestone,
  students,
}: {
  milestone: Milestone;
  students: StudentRow[];
}) {
  const student = students.find((item) => item.id === milestone.student_id);
  return (
    <div className="admin-list-row">
      <div className="grid h-8 w-8 place-items-center rounded-md border border-sena-gold/25 bg-sena-gold/10 text-sena-gold">
        <Star className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px]">{milestone.title}</div>
        <div className="truncate text-[10px] text-white/30">{nameFor(student?.profile)}</div>
      </div>
      <div className="text-[10px] text-white/25">{formatDate(milestone.target_date)}</div>
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  return (
    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#162d4a] to-[#2d6aad] text-[11px] font-bold text-sena-blue">
      {initialsFor(name) || "S"}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const cls =
    normalized.includes("active") ||
    normalized.includes("published") ||
    normalized.includes("accepted")
      ? "bg-sena-green/15 text-sena-green border-sena-green/25"
      : normalized.includes("pending") || normalized.includes("scheduled")
        ? "bg-sena-gold/12 text-sena-gold border-sena-gold/25"
        : normalized.includes("live") || normalized.includes("sent")
          ? "bg-sena-blue/12 text-sena-blue border-sena-blue/25"
          : "bg-white/7 text-white/45 border-white/10";
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-medium capitalize ${cls}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

function KeyValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-white/5 py-1.5 last:border-0">
      <span className="text-white/35">{label}</span>
      <span className="text-right font-medium text-white/78">{value}</span>
    </div>
  );
}

function AlertBox({
  label,
  text,
  tone = "gold",
}: {
  label: string;
  text: string;
  tone?: "gold" | "blue" | "red";
}) {
  const cls =
    tone === "blue"
      ? "border-sena-blue/20 bg-sena-blue/7 text-sena-blue"
      : tone === "red"
        ? "border-red-400/20 bg-red-400/7 text-red-300"
        : "border-sena-gold/20 bg-sena-gold/7 text-sena-gold";
  return (
    <div className={`mt-3 rounded-lg border p-3 ${cls}`}>
      <div className="text-[10px] font-semibold uppercase tracking-[0.1em]">{label}</div>
      <div className="mt-1 text-[13px] leading-6 text-white/70">{text}</div>
    </div>
  );
}

function EmptyRows({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-white/10 p-6 text-center text-sm text-white/35">
      {text}
    </div>
  );
}

function EmptyGate({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof ShieldAlert;
  title: string;
  body: string;
}) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center p-8">
      <div className="max-w-lg rounded-xl border border-white/8 bg-[#0e1825] p-8 text-center">
        <Icon className="mx-auto h-10 w-10 text-sena-gold" />
        <h1 className="mt-4 text-xl font-semibold">{title}</h1>
        <p className="mt-3 text-sm leading-7 text-white/50">{body}</p>
      </div>
    </div>
  );
}
