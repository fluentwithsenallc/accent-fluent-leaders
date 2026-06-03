import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
  Eye,
  Library,
  Loader2,
  LogIn,
  LogOut,
  Mail,
  Moon,
  Pencil,
  Play,
  Plus,
  Search,
  ShieldAlert,
  Smile,
  Sun,
  Trash2,
  UserCog,
  UserRound,
  UsersRound,
  Video,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  LanguageToggle,
  appLanguageLocale,
  translateCurrent,
  useTranslate,
} from "../lib/language";
import { hasSupabaseEnv, supabase } from "../lib/supabase";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard - Fluent with Sena" },
      {
        name: "description",
        content: "Fluent with Sena admin dashboard.",
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
  description: string | null;
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
  recording_expires_at: string | null;
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
  id: string;
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
  completed?: boolean | null;
  completed_at?: string | null;
  sent_at: string | null;
};

type ObjectiveItem = {
  id: string;
  objective_id: string;
  item_text: string;
  completed: boolean;
  completed_at: string | null;
  sort_order: number | null;
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
  objectiveItems: ObjectiveItem[];
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
    }
  | {
      action: "recordings";
      meetingId: string;
    };

type ZoomMeetingResult = {
  ok?: boolean;
  error?: string;
  meetingId?: string | null;
  uuid?: string | null;
  joinUrl?: string | null;
  startUrl?: string | null;
  chatJoinUrl?: string | null;
  password?: string | null;
  shareUrl?: string | null;
  playUrl?: string | null;
  downloadUrl?: string | null;
  recordingType?: string | null;
  fileType?: string | null;
};

type CreateStudentInput = {
  firstName: string;
  lastName: string;
  email: string;
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

function adminNavItems(tr: (english: string, spanish?: string) => string) {
  return [
    { id: "dashboard", label: tr("Dashboard", "Panel"), icon: BarChart3, group: tr("Overview", "Resumen") },
    { id: "students", label: tr("Students", "Estudiantes"), icon: UsersRound, group: tr("Overview", "Resumen") },
    { id: "checkins", label: tr("Check-in Inbox", "Bandeja de check-ins"), icon: Mail, group: tr("Overview", "Resumen") },
    { id: "applications", label: tr("Applications", "Solicitudes"), icon: BriefcaseBusiness, group: tr("Overview", "Resumen") },
    { id: "sessions", label: tr("Live Sessions", "Sesiones en vivo"), icon: Video, group: tr("Program", "Programa") },
    { id: "journals", label: tr("Student Journals", "Diarios de estudiantes"), icon: FileText, group: tr("Program", "Programa") },
    { id: "milestones", label: tr("Milestones", "Hitos"), icon: Check, group: tr("Program", "Programa") },
    { id: "courses", label: tr("Course Library", "Biblioteca de cursos"), icon: Play, group: tr("Program", "Programa") },
    { id: "library", label: tr("Content Library", "Biblioteca de contenido"), icon: Library, group: tr("Program", "Programa") },
    { id: "objectives", label: tr("Objectives Builder", "Constructor de objetivos"), icon: ClipboardCheck, group: tr("Program", "Programa") },
    { id: "settings", label: tr("Settings", "Configuracion"), icon: UserCog, group: tr("Account", "Cuenta") },
  ] as const;
}

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

type AdminTranslator = (english: string, spanish?: string) => string;

const ADMIN_UI_COPY: Record<string, string> = {
  "Dashboard": "Panel",
  "Students": "Estudiantes",
  "Check-in Inbox": "Bandeja de check-ins",
  "Applications": "Solicitudes",
  "Live Sessions": "Sesiones en vivo",
  "Student Journals": "Diarios de estudiantes",
  "Milestones": "Hitos",
  "Course Library": "Biblioteca de cursos",
  "Content Library": "Biblioteca de contenido",
  "Objectives Builder": "Constructor de objetivos",
  "Settings": "Configuracion",
  "Overview": "Resumen",
  "Program": "Programa",
  "Account": "Cuenta",
  "View all": "Ver todo",
  "Review all": "Revisar todo",
  "Open journey": "Abrir recorrido",
  "View calendar": "Ver calendario",
  "Workspace connection is missing": "Falta la conexion del espacio de trabajo",
  "Could not read admin data": "No se pudieron cargar los datos del panel",
  "Loading dashboard...": "Cargando panel...",
  "Good morning, Sena.": "Buenos dias, Sena.",
  "active students": "estudiantes activos",
  "Active Students": "Estudiantes activos",
  "Currently enrolled": "Actualmente inscritos",
  "Sessions This Week": "Sesiones esta semana",
  "remaining": "restantes",
  "Check-ins Pending": "Check-ins pendientes",
  "Waiting for review": "Esperando revision",
  "Avg. Confidence": "Confianza promedio",
  "Latest check-in values": "Valores mas recientes",
  "Upcoming Sessions": "Proximas sesiones",
  "Recent Milestones": "Hitos recientes",
  "No active students yet.": "Todavia no hay estudiantes activos.",
  "No sessions scheduled.": "No hay sesiones programadas.",
  "No check-ins yet.": "Todavia no hay check-ins.",
  "No milestones created.": "No se han creado hitos.",
  "Admin Portal": "Portal administrativo",
  "Coach / Admin": "Coach / Admin",
  "Light mode": "Modo claro",
  "Dark mode": "Modo oscuro",
  "Logging out...": "Cerrando sesion...",
  "Log out": "Cerrar sesion",
  "Edit this item.": "Edita este elemento.",
  "Create a new item.": "Crea un nuevo elemento.",
  "Close": "Cerrar",
  "Select...": "Selecciona...",
  "Paste an image URL or upload a file below": "Pega una URL de imagen o sube un archivo abajo",
  "Saving...": "Guardando...",
  "Save changes": "Guardar cambios",
  "Create": "Crear",
  "Delete this": "Eliminar este",
  "Delete": "Eliminar",
  "Edit": "Editar",
  "Update item": "Actualizar elemento",
  "Content item": "Elemento de contenido",
  "No tier": "Sin nivel",
  "No industry": "Sin industria",
  "Program avg:": "Promedio del programa:",
  "Week": "Semana",
  "Coaching": "Coaching",
  "Live coaching session": "Sesion de coaching en vivo",
  "Scheduled": "Programada",
  "Watch recording": "Ver grabacion",
  "Notes": "Notas",
  "Edit session": "Editar sesion",
  "Checking Zoom...": "Revisando Zoom...",
  "Sync recording": "Sincronizar grabacion",
  "This saves the session and syncs the matching Zoom meeting. The recording link will appear after Zoom finishes processing it.": "Esto guarda la sesion y sincroniza la reunion de Zoom correspondiente. El enlace de grabacion aparecera cuando Zoom termine de procesarla.",
  "Syncing Zoom...": "Sincronizando Zoom...",
  "Save and sync Zoom": "Guardar y sincronizar Zoom",
  "Create Zoom session": "Crear sesion de Zoom",
  "Delete this session and its Zoom meeting?": "Eliminar esta sesion y su reunion de Zoom?",
  "Delete session": "Eliminar sesion",
  "Phrase Bank": "Banco de frases",
  "Questions": "Preguntas",
  "Session Notes": "Notas de sesion",
  "Add Phrase": "Agregar frase",
  "Add Question": "Agregar pregunta",
  "Add Session Note": "Agregar nota de sesion",
  "Student profile": "Perfil del estudiante",
  "View check-ins": "Ver check-ins",
  "Write note": "Escribir nota",
  "Started": "Inicio",
  "Industry": "Industria",
  "Confidence": "Confianza",
  "Sessions/week": "Sesiones/semana",
  "WhatsApp": "WhatsApp",
  "Not set": "No definido",
  "Progress": "Progreso",
  "Sessions": "Sesiones",
  "Fluency level": "Nivel de fluidez",
  "In progress": "En progreso",
  "Objectives done": "Objetivos completados",
  "Confidence over time": "Confianza con el tiempo",
  "No check-in trend yet": "Aun no hay tendencia de check-ins",
  "Latest Check-in": "Ultimo check-in",
  "Win of the week": "Logro de la semana",
  "Biggest struggle": "Mayor dificultad",
  "No win written yet.": "Aun no hay un logro escrito.",
  "No struggle written yet.": "Aun no hay una dificultad escrita.",
  "Mood": "Estado de animo",
  "N/A": "N/D",
  "No check-ins submitted yet.": "Todavia no se han enviado check-ins.",
  "Note for next session": "Nota para la proxima sesion",
  "E.g. Work on phone listening drills - they freeze when they miss a word...": "Ej.: Trabajar escucha por telefono - se bloquean cuando no entienden una palabra...",
  "Save note": "Guardar nota",
  "Mark objective incomplete": "Marcar objetivo como incompleto",
  "Mark objective complete": "Marcar objetivo como completo",
  "This Week's Objectives": "Objetivos de esta semana",
  "Edit objectives": "Editar objetivos",
  "No objectives assigned for this student yet.": "Aun no se han asignado objetivos a este estudiante.",
  "Objectives Archive": "Archivo de objetivos",
  "Past weeks are stored here and do not appear as this week's dashboard focus.": "Las semanas pasadas se guardan aqui y no aparecen como el enfoque del panel de esta semana.",
  "Open builder": "Abrir constructor",
  "Past objectives will appear here.": "Los objetivos pasados apareceran aqui.",
  "Change student progress": "Cambiar progreso del estudiante",
  "Current week": "Semana actual",
  "Confidence score": "Puntaje de confianza",
  "Start date": "Fecha de inicio",
  "End date": "Fecha de fin",
  "Status": "Estado",
  "Admin notes": "Notas del admin",
  "No check-ins submitted this week.": "No se enviaron check-ins esta semana.",
  "No check-in selected.": "No hay check-in seleccionado.",
  "Needs Review": "Necesita revision",
  "Reviewed": "Revisado",
  "No pending check-ins.": "No hay check-ins pendientes.",
  "No reviewed check-ins yet.": "Aun no hay check-ins revisados.",
  "Add check-in": "Agregar check-in",
  "Edit check-in": "Editar check-in",
  "Export CSV": "Exportar CSV",
  "Add student": "Agregar estudiante",
  "Search students": "Buscar estudiantes",
  "View": "Ver",
  "Student enrollment": "Inscripcion del estudiante",
  "No win submitted.": "No se envio ningun logro.",
  "No struggle submitted.": "No se envio ninguna dificultad.",
  "No note submitted.": "No se envio ninguna nota.",
  "Write a short response or coaching note...": "Escribe una respuesta corta o una nota de coaching...",
  "Mood not set": "Estado de animo no definido",
  "A first this week": "Una primera vez esta semana",
  "No first submitted.": "No se envio ninguna primera vez.",
  "Write Sena's note for the next session...": "Escribe la nota de Sena para la proxima sesion...",
  "Save note - mark as reviewed": "Guardar nota y marcar como revisado",
  "Open student journals": "Abrir diarios de estudiantes",
  "Admin response": "Respuesta del admin",
  "Mark reviewed": "Marcar como revisado",
  "Application": "Solicitud",
  "Accepted application": "Solicitud aceptada",
  "No application link": "Sin enlace de solicitud",
  "No accepted applications yet": "Aun no hay solicitudes aceptadas",
  "Adding student...": "Agregando estudiante...",
  "Sending invite...": "Enviando invitacion...",
  "Send dashboard invite": "Enviar invitacion al panel",
  "Dashboard invite created": "Invitacion al panel creada",
  "Done": "Listo",
  "Fluency goal": "Meta de fluidez",
  "This creates the gold goal shown at the top of the milestone journey.": "Esto crea la meta dorada que se muestra al inicio del recorrido de hitos.",
  "Example: Lead client calls confidently without translating first.": "Ejemplo: Liderar llamadas con clientes con confianza sin traducir primero.",
  "Day one question": "Pregunta del dia uno",
  "Optional intake question or starting reflection.": "Pregunta inicial o reflexion de inicio opcional.",
  "Save fluency goal": "Guardar meta de fluidez",
  "Student": "Estudiante",
  "Week number": "Numero de semana",
  "Mood emoji": "Emoji de estado de animo",
  "First this week": "Primera vez esta semana",
  "Note for next": "Nota para la siguiente",
  "Admin note": "Nota del admin",
  "Session number": "Numero de sesion",
  "Scheduled at": "Programada para",
  "Duration minutes": "Duracion en minutos",
  "Focus topic": "Tema de enfoque",
  "Zoom timezone": "Zona horaria de Zoom",
  "No sessions scheduled yet.": "Aun no hay sesiones programadas.",
  "No upcoming sessions in the next week.": "No hay proximas sesiones en la siguiente semana.",
  "Add session": "Agregar sesion",
  "Sync calendar": "Sincronizar calendario",
  "Apple Calendar": "Calendario de Apple",
  "Schedule session": "Programar sesion",
  "Upcoming - Rest of Week": "Proximas - Resto de la semana",
  "Through next week only": "Solo hasta la proxima semana",
  "Literal calendar view for coaching sessions": "Vista de calendario para sesiones de coaching",
  "Previous month": "Mes anterior",
  "Today": "Hoy",
  "Next month": "Mes siguiente",
  "more": "mas",
  "Join session": "Unirse a la sesion",
  "Join Zoom": "Unirse a Zoom",
  "Live now": "En vivo ahora",
  "Time": "Hora",
  "Duration": "Duracion",
  "Focus": "Enfoque",
  "Session": "Sesion",
  "of": "de",
  "this week": "esta semana",
  "Start Zoom": "Iniciar Zoom",
  "Questions for Sena": "Preguntas para Sena",
  "Phrase banks, questions for Sena, and session notes": "Bancos de frases, preguntas para Sena y notas de sesion",
  "Entries": "Entradas",
  "No journal entries for this filter.": "No hay entradas del diario para este filtro.",
  "Add journal entry": "Agregar entrada al diario",
  "Edit journal entry": "Editar entrada del diario",
  "Entry type": "Tipo de entrada",
  "Topic": "Tema",
  "Content": "Contenido",
  "Context note": "Nota de contexto",
  "Use new lines, bullets, **bold**, and *italic* notes.": "Usa nuevas lineas, viñetas, **negrita** y notas en *cursiva*.",
  "Title": "Titulo",
  "Description": "Descripcion",
  "Target week": "Semana objetivo",
  "Target date": "Fecha objetivo",
  "Sort order": "Orden",
  "Student fluency journey · milestones complete automatically as weeks pass": "Recorrido de fluidez del estudiante · los hitos se completan automaticamente a medida que pasan las semanas",
  "No milestones for this student.": "No hay hitos para este estudiante.",
  "Add milestone": "Agregar hito",
  "Edit milestone": "Editar hito",
  "No description added.": "No se agrego descripcion.",
  "Auto achieved": "Logro automatico",
  "Milestone": "Hito",
  "This milestone is already complete by week/date. Click to save it as manually done.": "Este hito ya esta completo por semana/fecha. Haz clic para guardarlo como completado manualmente.",
  "Undo done": "Deshacer completado",
  "Save as done": "Guardar como completado",
  "Mark done": "Marcar como completado",
  "Category": "Categoria",
  "Average lesson minutes": "Promedio de minutos por leccion",
  "Courses and lessons available to students": "Cursos y lecciones disponibles para los estudiantes",
  "No courses seeded yet.": "Aun no hay cursos cargados.",
  "Add course": "Agregar curso",
  "Edit course": "Editar curso",
  "Author or host": "Autor o anfitrion",
  "Media type": "Tipo de medio",
  "CEFR level": "Nivel CEFR",
  "External URL": "URL externa",
  "Genre tag": "Etiqueta de genero",
  "Playlist tag": "Etiqueta de lista",
  "Duration label": "Etiqueta de duracion",
  "Thumbnail": "Miniatura",
  "Student-facing library - click any card to open its source": "Biblioteca para estudiantes - haz clic en cualquier tarjeta para abrir su fuente",
  "Watch - Shows": "Ver - Series",
  "Watch - Movies": "Ver - Peliculas",
  "Sing": "Cantar",
  "Listen - Podcasts": "Escuchar - Podcasts",
  "Read": "Leer",
  "Playlists For What You're Working On": "Listas para lo que estas trabajando",
  "No shows added yet.": "Aun no se agregaron series.",
  "No movies added yet.": "Aun no se agregaron peliculas.",
  "No music added yet.": "Aun no se agrego musica.",
  "No podcasts added yet.": "Aun no se agregaron podcasts.",
  "No reading content added yet.": "Aun no se agrego contenido de lectura.",
  "No playlists added yet.": "Aun no se agregaron listas.",
  "Add content item": "Agregar elemento de contenido",
  "Edit content item": "Editar elemento de contenido",
  "Objective": "Objetivo",
  "Week label": "Etiqueta de semana",
  "Focus area": "Area de enfoque",
  "Focus title": "Titulo del enfoque",
  "Context for student": "Contexto para el estudiante",
  "Check-in context": "Contexto del check-in",
  "Sent at": "Enviado en",
  "No objectives created yet.": "Aun no se han creado objetivos.",
  "Add objective": "Agregar objetivo",
  "Edit objective": "Editar objetivo",
  "Write and assign weekly objectives to students": "Escribe y asigna objetivos semanales a los estudiantes",
  "Full name": "Nombre completo",
  "Email": "Correo electronico",
  "LinkedIn URL": "URL de LinkedIn",
  "Current role": "Cargo actual",
  "English level": "Nivel de ingles",
  "Primary goal": "Objetivo principal",
  "Motivation": "Motivacion",
  "Preferred start": "Inicio preferido",
  "Weekly hours": "Horas semanales",
  "Referral source": "Fuente de referencia",
  "Additional notes": "Notas adicionales",
  "Review coaching applications and mark next steps": "Revisa las solicitudes de coaching y marca los siguientes pasos",
  "No applications submitted yet.": "Aun no se han enviado solicitudes.",
  "Add application": "Agregar solicitud",
  "First name": "Nombre",
  "Last name": "Apellido",
  "Timezone": "Zona horaria",
  "Phone": "Telefono",
  "Tier name": "Nombre del nivel",
  "Duration weeks": "Duracion en semanas",
  "Sessions per week": "Sesiones por semana",
  "Price": "Precio",
  "Admin details": "Datos del admin",
  "Program tiers": "Niveles del programa",
  "Admin name, contact details, and dashboard preferences": "Nombre del admin, datos de contacto y preferencias del panel",
  "No admin details found yet.": "Aun no hay datos del admin.",
  "No program tiers yet. Add one to show it in client dropdowns.": "Aun no hay niveles del programa. Agrega uno para mostrarlo en los menus del cliente.",
  "Edit admin details": "Editar datos del admin",
  "Add program tier": "Agregar nivel del programa",
  "Edit program tier": "Editar nivel del programa",
  "View full application": "Ver solicitud completa",
  "Open playlist ->": "Abrir lista ->",
  "Scroll": "Desplazar",
  "left": "izquierda",
  "right": "derecha",
  "active": "activo",
  "paused": "pausado",
  "completed": "completado",
  "cancelled": "cancelado",
  "pending": "pendiente",
  "reviewed": "revisado",
  "scheduled": "programada",
  "live": "en vivo",
  "no show": "ausencia",
  "published": "publicado",
  "draft": "borrador",
  "accepted": "aceptada",
  "rejected": "rechazada",
  "sent": "enviado",
  "beginner": "principiante",
  "intermediate": "intermedio",
  "advanced": "avanzado",
  "Weeks": "Semanas",
  "Tomorrow": "Manana",
  "Week of": "Semana del",
  "Not provided": "No proporcionado",
  "No role": "Sin cargo",
  "No motivation submitted.": "No se envio ninguna motivacion.",
  "No student": "Sin estudiante",
  "No fluency goal set.": "No se definio una meta de fluidez.",
  "Fluency Milestones": "Hitos de fluidez",
  "Edit fluency goal": "Editar meta de fluidez",
  "Create fluency goal": "Crear meta de fluidez",
  "Journey progress": "Progreso del recorrido",
  "After week": "Despues de la semana",
  "Finish line": "Meta final",
  "True Fluency Goal": "Meta real de fluidez",
  "Add the student's fluency goal to define the finish line.": "Agrega la meta de fluidez del estudiante para definir la meta final.",
  "Reached": "Alcanzado",
  "Final destination": "Destino final",
  "New milestone": "Nuevo hito",
  "Course": "Curso",
  "No description yet.": "Aun no hay descripcion.",
  "No length": "Sin duracion",
  "min avg": "min promedio",
  "Add content": "Agregar contenido",
  "Library": "Biblioteca",
  "English You Enjoy": "Ingles que disfrutas",
  "Keep what you love and incorporate it into your daily routine - your commute, chores, or evenings. English you enjoy never feels like homework.": "Conserva lo que amas e incorporalo a tu rutina diaria: tu trayecto, tus tareas o tus noches. El ingles que disfrutas nunca se siente como tarea.",
  "Books": "Libros",
  "Reading Sources": "Fuentes de lectura",
  "Curated playlist": "Lista curada",
  "Open": "Abrir",
  "No content is tagged for this playlist yet. Add items with the same playlist tag to build it.": "Aun no hay contenido etiquetado para esta lista. Agrega elementos con la misma etiqueta de lista para construirla.",
  "All content links to its original source. Click any card to start watching, listening, or reading.": "Todo el contenido enlaza a su fuente original. Haz clic en cualquier tarjeta para empezar a ver, escuchar o leer.",
  "Type": "Tipo",
  "Level": "Nivel",
  "Genre": "Genero",
  "Actions": "Acciones",
  "No author": "Sin autor",
  "TV Show": "Serie",
  "Movie": "Pelicula",
  "Music": "Musica",
  "Audio": "Audio",
  "Book": "Libro",
  "Source": "Fuente",
  "Reading immersion.": "Inmersion de lectura.",
  "Podcast immersion resource.": "Recurso de inmersion con podcast.",
  "All": "Todos",
  "weekly focus areas": "areas de enfoque semanales",
  "No student context written yet.": "Aun no hay contexto escrito para el estudiante.",
  "Save & send to student": "Guardar y enviar al estudiante",
  "Student & week": "Estudiante y semana",
  "Context from last check-in": "Contexto del ultimo check-in",
  "Phone Call Fluency": "Fluidez en llamadas",
  "Objectives": "Objetivos",
  "Remove objective": "Eliminar objetivo",
  "+ Add objective": "+ Agregar objetivo",
  "Remove focus area": "Eliminar area de enfoque",
  "+ Add focus area": "+ Agregar area de enfoque",
  "One thing to notice": "Una cosa para notar",
  "Unable to save objectives.": "No se pudieron guardar los objetivos.",
  "Saved to database.": "Guardado en la base de datos.",
  "Use the latest check-in to choose one specific real-world speaking problem for this week.": "Usa el ultimo check-in para elegir un problema especifico de habla en el mundo real para esta semana.",
  "Struggle": "Dificultad",
  "Win": "Logro",
  "Question": "Pregunta",
  "Phrase Set": "Grupo de frases",
  "Add context": "Agregar contexto",
  "Add phrase set for Week": "Agregar grupo de frases para la semana",
  "unanswered": "sin responder",
  "Asked": "Preguntado",
  "Answered in session": "Respondida en sesion",
  "Unanswered": "Sin responder",
  "View answer": "Ver respuesta",
  "Answer": "Responder",
  "What we worked on": "Lo que trabajamos",
  "What to follow up next session": "Lo que se debe retomar en la proxima sesion",
  "Add the notes from this session.": "Agrega las notas de esta sesion.",
  "Add next-session follow-up notes.": "Agrega notas de seguimiento para la proxima sesion.",
  "Vocabulary Word": "Palabra de vocabulario",
  "Note": "Nota",
  "Untitled": "Sin titulo",
  "Answer / Notes": "Respuesta / Notas",
  "Session note title": "Titulo de la nota de sesion",
  "Organize the client journal by week. Phrase entries can include as many phrases as needed.": "Organiza el diario del cliente por semana. Las entradas de frases pueden incluir tantas frases como sea necesario.",
  "Client": "Cliente",
  "Week # / Color for title": "Semana # / Color del titulo",
  "Phrases": "Frases",
  "Phrase #": "Frase #",
  "Rich-text notes": "Notas con formato enriquecido",
  "Moved back to pending.": "Se movio de nuevo a pendiente.",
  "Marked as reviewed.": "Marcada como revisada.",
  "Marked as eligible for a consult call. No dashboard access was created.": "Marcada como apta para una llamada de consulta. No se creo acceso al panel.",
  "Marked as not a fit. Send the graceful decline email manually.": "Marcada como no adecuada. Envia manualmente el correo de rechazo amable.",
  "Consult fit": "Apta para consulta",
  "Accept for consult": "Aceptar para consulta",
  "Declined": "Rechazada",
  "Decline": "Rechazar",
  "Application details": "Detalles de la solicitud",
  "Submitted": "Enviada",
  "LinkedIn": "LinkedIn",
  "Edit details": "Editar datos",
  "Name": "Nombre",
  "Add tier": "Agregar nivel",
  "Add entry": "Agregar entrada",
  "No students matched your search.": "No hay estudiantes que coincidan con tu busqueda.",
  "No Zoom meeting is connected yet.": "Aun no hay una reunion de Zoom conectada.",
  "show": "serie",
  "movie": "pelicula",
  "music": "musica",
  "podcast": "podcast",
  "book": "libro",
  "reading source": "fuente de lectura",
  "playlist": "lista",
  "phrase bank": "banco de frases",
  "question": "pregunta",
  "session note": "nota de sesion",
};

function normalizeAdminUiText(text: string) {
  return text
    .replace(/Â·/g, "·")
    .replace(/â†’/g, "->")
    .replace(/â€”/g, "-");
}

function adminUiText(tr: AdminTranslator, text: string) {
  const normalized = normalizeAdminUiText(text);
  const spanish = ADMIN_UI_COPY[normalized];
  return spanish ? tr(normalized, spanish) : normalized;
}

function translateAdminStatic(text: string) {
  const normalized = normalizeAdminUiText(text);
  const spanish = ADMIN_UI_COPY[normalized];
  return spanish ? translateCurrent(normalized, spanish) : normalized;
}

type ScreenId = (typeof navItems)[number]["id"] | "studentDetail";

const AUTH_REQUIRED = "AUTH_REQUIRED";
const ADMIN_REQUIRED = "ADMIN_REQUIRED";

async function functionErrorMessage(error: unknown) {
  const context = (error as { context?: unknown })?.context;
  if (context instanceof Response) {
    const text = await context.clone().text();
    if (text) {
      try {
        const body = JSON.parse(text) as { error?: string; message?: string };
        return body.error ?? body.message ?? text;
      } catch {
        return text;
      }
    }
  }

  return error instanceof Error ? error.message : "Request failed.";
}

async function fetchTable<T>(
  table: string,
  select = "*",
  order?: { column: string; ascending?: boolean },
) {
  if (!supabase) throw new Error("The workspace is not connected yet.");
  let query = supabase.from(table).select(select);
  if (order) query = query.order(order.column, { ascending: order.ascending ?? true });
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as T[];
}

async function invokeZoomMeeting(data: ZoomMeetingAction) {
  if (!supabase) throw new Error("The workspace is not connected yet.");
  const { data: result, error } = await supabase.functions.invoke<ZoomMeetingResult>(
    "zoom-meetings",
    { body: data },
  );
  if (error) throw new Error(await functionErrorMessage(error));
  if (result?.error) throw new Error(result.error);
  return result ?? {};
}

async function createStudentAccount(data: CreateStudentInput) {
  if (!supabase) throw new Error("The workspace is not connected yet.");
  const { data: result, error } = await supabase.functions.invoke<{
    id: string;
    email: string;
    inviteSent?: boolean;
  }>("admin-students", { body: data });
  if (error) throw error;
  return result;
}

async function fetchAdminData(): Promise<AdminData> {
  if (!supabase) throw new Error("The workspace is not connected yet.");

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    throw new Error(AUTH_REQUIRED);
  }

  const { data: currentProfile, error: currentProfileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .single();

  if (currentProfileError || currentProfile?.role !== "admin") {
    throw new Error(ADMIN_REQUIRED);
  }

  const { error: statusRefreshError } = await supabase.rpc("refresh_live_session_statuses");
  if (
    statusRefreshError &&
    !statusRefreshError.message.toLowerCase().includes("could not find the function")
  ) {
    throw statusRefreshError;
  }

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
    objectiveItems,
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
    fetchTable<ObjectiveItem>("objective_items", "*", { column: "sort_order", ascending: true }),
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
    objectiveItems,
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
  if (!value) return translateAdminStatic("Not set");
  return new Intl.DateTimeFormat(appLanguageLocale(), {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatTime(value?: string | null) {
  if (!value) return translateAdminStatic("Not set");
  return new Intl.DateTimeFormat(appLanguageLocale(), {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatRelativeSessionTime(value?: string | null) {
  if (!value) return translateAdminStatic("Not set");
  const date = new Date(value);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  const label = sameDay(date, today)
    ? translateAdminStatic("Today")
    : sameDay(date, tomorrow)
      ? translateAdminStatic("Tomorrow")
      : formatDate(value);
  return `${label}, ${formatTime(value)}`;
}

function formatCompactSessionTime(value?: string | null) {
  if (!value) return translateAdminStatic("Not set");
  const date = new Date(value);
  const day = new Intl.DateTimeFormat(appLanguageLocale(), { weekday: "short" }).format(date);
  const time = new Intl.DateTimeFormat(appLanguageLocale(), { hour: "numeric", hour12: true })
    .format(date)
    .replace(/\s/g, "");
  return `${day} ${time}`;
}

function dateKey(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function addMinutes(value: string, minutes: number) {
  const date = new Date(value);
  date.setMinutes(date.getMinutes() + minutes);
  return date;
}

function formatWeekRange(value?: string | null) {
  const anchor = value ? new Date(value) : new Date();
  const monday = new Date(anchor);
  const day = monday.getDay() || 7;
  monday.setDate(monday.getDate() - day + 1);
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  const month = new Intl.DateTimeFormat(appLanguageLocale(), { month: "short" }).format(monday);
  const fridayMonth = new Intl.DateTimeFormat(appLanguageLocale(), { month: "short" }).format(
    friday,
  );
  const end =
    monday.getMonth() === friday.getMonth()
      ? `${friday.getDate()}`
      : `${fridayMonth} ${friday.getDate()}`;
  return `${translateAdminStatic("Week of")} ${month} ${monday.getDate()}-${end}, ${friday.getFullYear()}`;
}

function formatIcsDate(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}

function escapeIcsText(value?: string | null) {
  return (value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

function buildSessionsIcs(sessions: LiveSession[], students: StudentRow[]) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Fluent with Sena//Admin Sessions//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Fluent with Sena Sessions",
    "X-WR-CALDESC:Admin coaching sessions calendar",
  ];

  sessions
    .filter((session) => session.status !== "cancelled" && session.status !== "no_show")
    .forEach((session) => {
      const student = students.find((item) => item.id === session.student_id);
      const studentName = nameFor(student?.profile);
      const title = `${studentName} - ${session.focus_topic || "Live coaching session"}`;
      const description = [
        `Student: ${studentName}`,
        `Week ${session.week_number}, Session ${session.session_number}`,
        session.session_notes ? `Notes: ${session.session_notes}` : "",
        session.zoom_join_url ? `Join Zoom: ${session.zoom_join_url}` : "",
      ]
        .filter(Boolean)
        .join("\n");
      lines.push(
        "BEGIN:VEVENT",
        `UID:${session.id}@fluentwithsena.com`,
        `DTSTAMP:${formatIcsDate(new Date())}`,
        `DTSTART:${formatIcsDate(session.scheduled_at)}`,
        `DTEND:${formatIcsDate(addMinutes(session.scheduled_at, session.duration_minutes || 60))}`,
        `SUMMARY:${escapeIcsText(title)}`,
        `DESCRIPTION:${escapeIcsText(description)}`,
        session.zoom_join_url ? `URL:${session.zoom_join_url}` : "",
        "END:VEVENT",
      );
    });

  lines.push("END:VCALENDAR");
  return lines.filter(Boolean).join("\r\n");
}

function downloadSessionsIcs(sessions: LiveSession[], students: StudentRow[]) {
  const ics = buildSessionsIcs(sessions, students);
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "fluent-with-sena-sessions.ics";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function studentProgramLabel(student: StudentRow) {
  return student.tier?.name ?? "Program";
}

function studentDurationWeeks(student: StudentRow) {
  return student.stat?.duration_weeks ?? 16;
}

function studentSessionsPerWeek(student: StudentRow) {
  return student.stat?.sessions_per_week ?? 4;
}

function studentTotalSessions(student: StudentRow) {
  return (
    student.stat?.total_sessions ?? studentDurationWeeks(student) * studentSessionsPerWeek(student)
  );
}

function studentCompletedSessions(student: StudentRow) {
  return student.stat?.sessions_completed ?? 0;
}

function studentRosterStatus(student: StudentRow) {
  const pending = Number(student.stat?.pending_checkins ?? 0);
  if (student.status !== "active") return student.status;
  if (pending > 1) return "overdue";
  if (pending === 1) return "check-in due";
  return "active";
}

function moodLabel(checkIn: CheckIn) {
  return (
    checkIn.mood_emoji || (checkIn.mood === "struggling" ? "!" : checkIn.mood === "meh" ? "-" : "+")
  );
}

function AdminDashboard() {
  const navigate = useNavigate();
  const tr = useTranslate();
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

  useEffect(() => {
    if (!(query.error instanceof Error)) return;
    if (query.error.message === AUTH_REQUIRED) {
      navigate({ to: "/signin" });
    }
    if (query.error.message === ADMIN_REQUIRED) {
      navigate({ to: "/student" });
    }
  }, [navigate, query.error]);

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
  const adminProfile = data?.profiles.find((profile) => profile.role === "admin");

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
          title={tr("Workspace connection is missing", "Falta la conexion del espacio de trabajo")}
          body={tr(
            "The dashboard is not connected yet. Ask the site administrator to finish setup.",
            "El panel todavia no esta conectado. Pidele al administrador del sitio que termine la configuracion.",
          )}
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
          {tr("Loading dashboard...", "Cargando panel...")}
        </div>
      </AdminShell>
    );
  }

  if (query.error || !data) {
    const message =
      query.error instanceof Error && query.error.message === ADMIN_REQUIRED
        ? tr(
            "This dashboard is only available to admin users.",
            "Este panel solo esta disponible para usuarios administradores.",
          )
        : query.error instanceof Error && query.error.message === AUTH_REQUIRED
          ? tr(
              "Please sign in before viewing this page.",
              "Inicia sesion antes de ver esta pagina.",
            )
          : query.error instanceof Error
            ? `${query.error.message}. ${tr(
                "Sign in as an admin user before viewing this page.",
                "Inicia sesion como administrador antes de ver esta pagina.",
              )}`
            : tr(
                "Sign in as an admin user before viewing this page.",
                "Inicia sesion como administrador antes de ver esta pagina.",
              );
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
          title={tr("Could not read admin data", "No se pudieron cargar los datos del panel")}
          body={message}
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
          onSelectStudent={(id) => {
            setSelectedStudentId(id);
            setScreen("studentDetail");
          }}
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
            setScreen("studentDetail");
          }}
        />
      )}

      {screen === "studentDetail" && selectedStudent && (
        <StudentDetailScreen
          student={selectedStudent}
          sessions={data.sessions.filter((session) => session.student_id === selectedStudent.id)}
          checkIns={data.checkIns.filter((checkIn) => checkIn.student_id === selectedStudent.id)}
          milestones={data.milestones.filter(
            (milestone) => milestone.student_id === selectedStudent.id,
          )}
          objectives={data.objectives.filter(
            (objective) => objective.student_id === selectedStudent.id,
          )}
          objectiveItems={data.objectiveItems}
          application={data.applications.find(
            (application) => application.id === selectedStudent.application_id,
          )}
          onBack={() => setScreen("students")}
          onViewCheckIns={() => setScreen("checkins")}
          onEditObjectives={() => setScreen("objectives")}
          onManageMilestones={() => setScreen("milestones")}
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
          setSelectedStudentId={setSelectedStudentId}
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
        <ObjectivesBuilderScreen
          objectives={data.objectives}
          objectiveItems={data.objectiveItems}
          checkIns={data.checkIns}
          students={students}
          selectedStudent={selectedStudent}
        />
      )}

      {screen === "applications" && <ApplicationsScreen applications={data.applications} />}

      {screen === "settings" && <SettingsScreen adminProfile={adminProfile} tiers={data.tiers} />}
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
  const navigate = useNavigate();
  const tr = useTranslate();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const navItems = adminNavItems(tr);
  let lastGroup = "";

  async function handleLogout() {
    setIsSigningOut(true);

    try {
      await supabase?.auth.signOut();
    } finally {
      navigate({ to: "/signin" });
    }
  }

  return (
    <main className={`admin-app ${theme === "light" ? "admin-light" : ""}`}>
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <div className="text-[15px] font-semibold text-white">Fluent with Sena</div>
          <div className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-white/30">
            {tr("Admin Portal", "Portal administrativo")}
          </div>
        </div>
        <div className="admin-user">
          <div className="admin-avatar">S</div>
          <div>
            <div className="text-[13px] font-medium">Sena</div>
            <div className="text-[10px] tracking-[0.04em] text-sena-gold">
              {tr("Coach / Admin", "Coach / Admin")}
            </div>
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
                  className={`admin-nav-item ${
                    screen === item.id || (screen === "studentDetail" && item.id === "students")
                      ? "active"
                      : ""
                  }`}
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
          <div className="mb-3">
            <LanguageToggle dark />
          </div>
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="admin-nav-item mb-2"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {theme === "dark"
              ? tr("Light mode", "Modo claro")
              : tr("Dark mode", "Modo oscuro")}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isSigningOut}
            className="admin-nav-item admin-logout-item mt-2 disabled:cursor-wait disabled:opacity-60"
          >
            {isSigningOut ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            {isSigningOut
              ? tr("Logging out...", "Cerrando sesion...")
              : tr("Log out", "Cerrar sesion")}
          </button>
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
  const tr = useTranslate();
  return (
    <header className="admin-topbar">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">{adminUiText(tr, title)}</h1>
        <p className="mt-1 text-xs text-white/35">{adminUiText(tr, subtitle)}</p>
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
  onSelectStudent,
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
  onSelectStudent: (id: string) => void;
}) {
  const tr = useTranslate();

  return (
    <>
      <Topbar
        title={tr("Good morning, Sena.", "Buenos dias, Sena.")}
        subtitle={`${formatDate(new Date().toISOString())} · ${activeStudents.length} active students`}
        action={
          <>
            <button className="admin-outline-btn" onClick={() => setScreen("checkins")}>
              {tr("Check-in inbox", "Bandeja de check-ins")}{" "}
              {pendingCheckIns.length > 0 && <strong>{pendingCheckIns.length}</strong>}
            </button>
            <button className="admin-gold-btn" onClick={() => setScreen("sessions")}>
              {tr("New session", "Nueva sesion")}
            </button>
          </>
        }
      />
      <div className="admin-content">
        <div className="admin-stat-grid">
          <StatCard
            label={tr("Active Students", "Estudiantes activos")}
            value={activeStudents.length}
            sub={tr("Currently enrolled", "Actualmente inscritos")}
            icon={UsersRound}
          />
          <StatCard
            label={tr("Sessions This Week", "Sesiones esta semana")}
            value={`${completedThisWeek} / ${sessionsThisWeek.length}`}
            sub={`${Math.max(sessionsThisWeek.length - completedThisWeek, 0)} ${tr(
              "remaining",
              "restantes",
            )}`}
            icon={Video}
            tone="blue"
          />
          <StatCard
            label={tr("Check-ins Pending", "Check-ins pendientes")}
            value={pendingCheckIns.length}
            sub={tr("Waiting for review", "Esperando revision")}
            icon={Mail}
            tone="gold"
          />
          <StatCard
            label={tr("Avg. Confidence", "Confianza promedio")}
            value={avgConfidence ? avgConfidence.toFixed(1) : "0.0"}
            sub={tr("Latest check-in values", "Valores mas recientes")}
            icon={BarChart3}
            tone="green"
          />
        </div>

        <div className="admin-two-col">
          <Panel
            title={tr("Active Students", "Estudiantes activos")}
            link={tr("View all", "Ver todo")}
            onLink={() => setScreen("students")}
          >
            {students.length ? (
              students.map((student) => (
                <StudentListRow
                  key={student.id}
                  student={student}
                  onSelect={() => onSelectStudent(student.id)}
                />
              ))
            ) : (
              <EmptyRows
                text={tr("No active students yet.", "Todavia no hay estudiantes activos.")}
              />
            )}
          </Panel>
          <Panel
            title={tr("Upcoming Sessions", "Proximas sesiones")}
            link={tr("View calendar", "Ver calendario")}
            onLink={() => setScreen("sessions")}
          >
            {sessions.length ? (
              sessions.map((session) => (
                <SessionListRow key={session.id} session={session} students={students} />
              ))
            ) : (
              <EmptyRows text={tr("No sessions scheduled.", "No hay sesiones programadas.")} />
            )}
          </Panel>
        </div>

        <div className="admin-two-col">
          <Panel
            title={tr("Check-in Inbox", "Bandeja de check-ins")}
            link={tr("Review all", "Revisar todo")}
            onLink={() => setScreen("checkins")}
          >
            {checkIns.length ? (
              checkIns.map((checkIn) => (
                <CheckInListRow key={checkIn.id} checkIn={checkIn} students={students} compact />
              ))
            ) : (
              <EmptyRows text={tr("No check-ins yet.", "Todavia no hay check-ins.")} />
            )}
          </Panel>
          <Panel
            title={tr("Recent Milestones", "Hitos recientes")}
            link={tr("Open journey", "Abrir recorrido")}
            onLink={() => setScreen("milestones")}
          >
            {milestones.length ? (
              milestones.map((milestone) => (
                <MilestoneListRow key={milestone.id} milestone={milestone} students={students} />
              ))
            ) : (
              <EmptyRows text={tr("No milestones created.", "No se han creado hitos.")} />
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
  const tr = useTranslate();
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
      <div className="text-[11px] uppercase tracking-[0.08em] text-white/35">
        {adminUiText(tr, label)}
      </div>
      <div className={`mt-2 text-3xl font-semibold tracking-tight ${color}`}>{value}</div>
      <div className="mt-1 text-[11px] text-white/30">{adminUiText(tr, sub)}</div>
    </article>
  );
}

function Panel({
  title,
  link,
  onLink,
  action,
  children,
}: {
  title: string;
  link?: string;
  onLink?: () => void;
  action?: ReactNode;
  children: React.ReactNode;
}) {
  const tr = useTranslate();
  return (
    <section className="admin-card p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">{adminUiText(tr, title)}</h2>
        {action ??
          (link && (
            <button type="button" onClick={onLink} className="admin-panel-link">
              {link} →
            </button>
          ))}
      </div>
      {children}
    </section>
  );
}

type AdminFormField = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "number" | "date" | "datetime-local" | "select" | "file";
  options?: { label: string; value: string }[];
  required?: boolean;
  accept?: string;
  storageBucket?: string;
  storageFolder?: string;
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

function safeUploadName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uploadAdminFile(field: AdminFormField, file: File) {
  if (!supabase) throw new Error("The workspace is not connected yet.");
  const bucket = field.storageBucket ?? "content-library";
  const folder = field.storageFolder ?? "uploads";
  const uniqueId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const filename = safeUploadName(file.name) || "upload";
  const path = `${folder}/${uniqueId}-${filename}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (error) throw error;
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
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
  const tr = useTranslate();
  const queryClient = useQueryClient();
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      fields.map((field) => [field.name, valueForInput(initialValues[field.name], field.type)]),
    ),
  );
  const [files, setFiles] = useState<Record<string, File | null>>({});

  const mutation = useMutation({
    mutationFn: async () => {
      if (!supabase) throw new Error("The workspace is not connected yet.");
      const payload = Object.fromEntries(
        fields.map((field) => [field.name, valueForSupabase(values[field.name] ?? "", field.type)]),
      );
      for (const field of fields) {
        const file = files[field.name];
        if (field.type === "file" && file) {
          payload[field.name] = await uploadAdminFile(field, file);
        }
      }
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
            <h2 className="text-base font-semibold">{adminUiText(tr, title)}</h2>
            <p className="mt-1 text-xs leading-5 text-white/38">
              {adminUiText(tr, rowId ? "Edit this item." : "Create a new item.")}
            </p>
          </div>
          <button type="button" onClick={onClose} className="admin-outline-btn">
            {adminUiText(tr, "Close")}
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
              <span className="admin-field-label">{adminUiText(tr, field.label)}</span>
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
                  <option value="">{adminUiText(tr, "Select...")}</option>
                  {(field.options ?? []).map((option) => (
                    <option key={option.value} value={option.value}>
                      {adminUiText(tr, option.label)}
                    </option>
                  ))}
                </select>
              ) : field.type === "file" ? (
                <div className="space-y-3">
                  <input
                    value={values[field.name] ?? ""}
                    onChange={(event) =>
                      setValues((current) => ({ ...current, [field.name]: event.target.value }))
                    }
                    required={field.required && !files[field.name]}
                    type="url"
                    placeholder={adminUiText(tr, "Paste an image URL or upload a file below")}
                    className="admin-input"
                  />
                  <input
                    type="file"
                    accept={field.accept}
                    onChange={(event) =>
                      setFiles((current) => ({
                        ...current,
                        [field.name]: event.target.files?.[0] ?? null,
                      }))
                    }
                    className="admin-file-input"
                  />
                  {values[field.name] && (
                    <img
                      src={values[field.name]}
                      alt=""
                      className="admin-upload-preview"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  )}
                </div>
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
              ? adminUiText(tr, "Saving...")
              : rowId
                ? adminUiText(tr, "Save changes")
                : adminUiText(tr, "Create")}
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
  const tr = useTranslate();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async () => {
      if (!supabase) throw new Error("The workspace is not connected yet.");
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
        if (
          window.confirm(
            `${adminUiText(tr, "Delete this")} ${adminUiText(tr, label).toLowerCase()}?`,
          )
        ) {
          mutation.mutate();
        }
      }}
      className="admin-danger-btn"
      title={adminUiText(tr, label)}
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}

function EditButton({ onClick, label = "Edit" }: { onClick: () => void; label?: string }) {
  const tr = useTranslate();
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className="admin-icon-btn"
      title={adminUiText(tr, label)}
    >
      <Pencil className="h-3.5 w-3.5" />
    </button>
  );
}

function clampPct(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function StudentDetailScreen({
  student,
  sessions,
  checkIns,
  milestones,
  objectives,
  objectiveItems,
  application,
  onBack,
  onViewCheckIns,
  onEditObjectives,
  onManageMilestones,
}: {
  student: StudentRow;
  sessions: LiveSession[];
  checkIns: CheckIn[];
  milestones: Milestone[];
  objectives: Objective[];
  objectiveItems: ObjectiveItem[];
  application?: Application;
  onBack: () => void;
  onViewCheckIns: () => void;
  onEditObjectives: () => void;
  onManageMilestones: () => void;
}) {
  const tr = useTranslate();
  const queryClient = useQueryClient();
  const noteRef = useRef<HTMLTextAreaElement | null>(null);
  const [editingStudent, setEditingStudent] = useState(false);
  const name = nameFor(student.profile);
  const durationWeeks = studentDurationWeeks(student);
  const sessionsPerWeek = studentSessionsPerWeek(student);
  const totalSessions = studentTotalSessions(student);
  const sessionsCompleted =
    student.stat?.sessions_completed ??
    sessions.filter((session) => session.status === "completed").length;
  const programPct = clampPct((student.current_week / Math.max(durationWeeks, 1)) * 100);
  const sessionPct = clampPct((sessionsCompleted / Math.max(totalSessions, 1)) * 100);
  const rowsForObjectives = objectives.filter(
    (objective) => objective.week_number === student.current_week,
  );
  const currentObjectives = rowsForObjectives;
  const currentObjectiveIds = new Set(currentObjectives.map((objective) => objective.id));
  const currentItems = objectiveItems.filter((item) => currentObjectiveIds.has(item.objective_id));
  const archivedObjectives = objectives
    .filter((objective) => objective.week_number !== student.current_week)
    .sort((a, b) => b.week_number - a.week_number || a.focus_area - b.focus_area);
  const completedObjectiveItems = currentItems.filter((item) => item.completed).length;
  const objectivePct = currentItems.length
    ? clampPct((completedObjectiveItems / currentItems.length) * 100)
    : objectives.length
      ? clampPct(
          (objectives.filter((objective) => objective.completed).length / objectives.length) * 100,
        )
      : 0;
  const completedMilestones = milestones.filter((milestone) => milestone.completed).length;
  const latestCheckIn = checkIns[0];
  const chartPoints = checkIns
    .filter((checkIn) => typeof checkIn.confidence_score === "number")
    .slice(0, 6)
    .reverse();
  const confidenceNow =
    student.confidence_score ??
    latestCheckIn?.confidence_score ??
    student.stat?.confidence_score ??
    null;
  const confidenceStart = chartPoints[0]?.confidence_score ?? confidenceNow ?? 0;
  const confidenceDelta =
    confidenceNow != null && confidenceStart != null ? confidenceNow - confidenceStart : null;
  const programAverage = chartPoints.length
    ? chartPoints.reduce((sum, point) => sum + Number(point.confidence_score ?? 0), 0) /
      chartPoints.length
    : confidenceNow;
  const toggleObjectiveMutation = useMutation({
    mutationFn: async (item: ObjectiveItem) => {
      if (!supabase) throw new Error("The workspace is not connected yet.");
      const completed = !item.completed;
      const { error } = await supabase
        .from("objective_items")
        .update({ completed, completed_at: completed ? new Date().toISOString() : null })
        .eq("id", item.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
  });
  const toggleObjectiveMutationFallback = useMutation({
    mutationFn: async (objective: Objective) => {
      if (!supabase) throw new Error("The workspace is not connected yet.");
      const completed = !objective.completed;
      const { error } = await supabase
        .from("objectives")
        .update({ completed, completed_at: completed ? new Date().toISOString() : null })
        .eq("id", objective.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
  });

  return (
    <>
      <Topbar
        title="Student profile"
        subtitle={`${name} · ${studentProgramLabel(student)} · ${adminUiText(tr, "Week")} ${student.current_week}`}
        action={
          <>
            <button type="button" onClick={onViewCheckIns} className="admin-outline-btn">
              {adminUiText(tr, "View check-ins")}
            </button>
            <button
              type="button"
              onClick={() => noteRef.current?.focus()}
              className="admin-gold-btn"
            >
              {adminUiText(tr, "Write note")}
            </button>
          </>
        }
      />
      <div className="admin-content">
        <div className="admin-detail-head">
          <div className="admin-detail-title-line">
            <button type="button" onClick={onBack} className="admin-detail-back">
              <ChevronLeft className="h-4 w-4" />
              {adminUiText(tr, "Students")}
            </button>
            <span className="admin-detail-slash">/</span>
            <h1 className="admin-detail-name">{name}</h1>
          </div>
          <div className="admin-detail-subline">
            <p>
              {studentProgramLabel(student)} · {adminUiText(tr, "Week")} {student.current_week} ·{" "}
              {adminUiText(tr, "Started")}{" "}
              {formatDate(student.start_date)}
            </p>
          </div>
        </div>

        <div className="admin-detail-chips">
          <StudentDetailChip
            label="Program"
            value={`${studentProgramLabel(student)} · ${durationWeeks} weeks`}
          />
          <StudentDetailChip
            label="Week"
            value={`${student.current_week} ${adminUiText(tr, "of")} ${durationWeeks}`}
          />
          <StudentDetailChip label="Industry" value={student.industry ?? "Not set"} />
          <StudentDetailChip
            label="Confidence"
            value={confidenceNow != null ? `${confidenceNow.toFixed(1)} / 10` : "Not set"}
          />
          <StudentDetailChip label="Sessions/week" value={`${sessionsPerWeek} × 60 min`} />
          <StudentDetailChip label="WhatsApp" value={student.profile?.whatsapp ?? "Not set"} />
        </div>

        <div className="admin-two-col">
          <section className="admin-card p-5">
            <h2 className="mb-4 text-sm font-semibold">{adminUiText(tr, "Progress")}</h2>
            <ProgressLine label="Program" value={programPct} tone="blue" />
            <ProgressLine
              label="Sessions"
              value={sessionPct}
              detail={`${sessionsCompleted}/${totalSessions}`}
              tone="gold"
            />
            <ProgressLine
              label="Fluency level"
              value={clampPct((confidenceNow ?? 0) * 10)}
              detail={application?.english_level?.replace("_", "-").toUpperCase() ?? "In progress"}
              tone="green"
            />
            <ProgressLine label="Objectives done" value={objectivePct} tone="gold" />
            {!!milestones.length && (
              <ProgressLine
                label="Milestones"
                value={clampPct((completedMilestones / milestones.length) * 100)}
                detail={`${completedMilestones}/${milestones.length}`}
                tone="green"
              />
            )}
          </section>

          <section className="admin-card p-5">
            <LatestCheckInPanel latestCheckIn={latestCheckIn} />
          </section>
        </div>

        <div className="admin-two-col">
          <section className="admin-card p-5">
            <div className="mb-2 flex items-center justify-between gap-4">
              <h2 className="text-sm font-semibold">{adminUiText(tr, "Confidence over time")}</h2>
              <span className="text-xs text-white/30">
                {adminUiText(tr, "Weeks")} {chartPoints[0]?.week_number ?? student.current_week} -{" "}
                {chartPoints.at(-1)?.week_number ?? student.current_week}
              </span>
            </div>
            <ConfidenceChart points={chartPoints} fallbackValue={confidenceNow} />
            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="text-sena-green">
                {confidenceDelta != null
                  ? `${confidenceDelta >= 0 ? "↑ +" : "↓ "}${Math.abs(confidenceDelta).toFixed(1)} ${tr("since week 1", "desde la semana 1")}`
                  : adminUiText(tr, "No check-in trend yet")}
              </span>
              <span className="text-white/32">
                {adminUiText(tr, "Program avg:")}{" "}
                {programAverage != null ? programAverage.toFixed(1) : adminUiText(tr, "N/A")}
              </span>
            </div>
          </section>

          <NextSessionNote noteRef={noteRef} student={student} latestCheckIn={latestCheckIn} />
        </div>

        <section className="admin-card p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-sm font-semibold">{adminUiText(tr, "This Week's Objectives")}</h2>
            <button type="button" onClick={onEditObjectives} className="admin-panel-link">
              {adminUiText(tr, "Edit objectives")} {"->"}
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {currentItems.map((item) => (
              <ObjectiveDetailItem
                key={item.id}
                item={item}
                isSaving={toggleObjectiveMutation.isPending}
                onEdit={onEditObjectives}
                onToggle={() => toggleObjectiveMutation.mutate(item)}
              />
            ))}
            {!currentItems.length &&
              currentObjectives.map((objective) => (
                <ObjectiveDetailFallback
                  key={objective.id}
                  objective={objective}
                  isSaving={toggleObjectiveMutationFallback.isPending}
                  onEdit={onEditObjectives}
                  onToggle={() => toggleObjectiveMutationFallback.mutate(objective)}
                />
              ))}
          </div>
          {!currentItems.length && !currentObjectives.length && (
            <EmptyRows text="No objectives assigned for this student yet." />
          )}
          {toggleObjectiveMutation.error instanceof Error && (
            <p className="mt-3 text-xs text-red-200">{toggleObjectiveMutation.error.message}</p>
          )}
          {toggleObjectiveMutationFallback.error instanceof Error && (
            <p className="mt-3 text-xs text-red-200">
              {toggleObjectiveMutationFallback.error.message}
            </p>
          )}
        </section>

        <section className="admin-card p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold">{adminUiText(tr, "Objectives Archive")}</h2>
              <p className="mt-1 text-xs text-white/35">
                {adminUiText(
                  tr,
                  "Past weeks are stored here and do not appear as this week's dashboard focus.",
                )}
              </p>
            </div>
            <button type="button" onClick={onEditObjectives} className="admin-panel-link">
              {adminUiText(tr, "Open builder")} {"->"}
            </button>
          </div>
          <div className="objective-archive-list">
            {archivedObjectives.map((objective) => (
              <div key={objective.id} className="objective-archive-row">
                <div>
                  <span>
                    {objective.week_label ??
                      `${adminUiText(tr, "Week")} ${objective.week_number}`}
                  </span>
                  <strong>{objective.focus_title}</strong>
                </div>
                <small>
                  {adminUiText(tr, "Focus")} {objective.focus_area}
                </small>
              </div>
            ))}
          </div>
          {!archivedObjectives.length && <EmptyRows text="Past objectives will appear here." />}
        </section>
      </div>
      {editingStudent && (
        <RecordDialog
          title="Change student progress"
          table="students"
          rowId={student.id}
          initialValues={student}
          onClose={() => setEditingStudent(false)}
          fields={[
            { name: "current_week", label: "Current week", type: "number" },
            { name: "confidence_score", label: "Confidence score", type: "number" },
            { name: "industry", label: "Industry" },
            { name: "start_date", label: "Start date", type: "date" },
            { name: "end_date", label: "End date", type: "date" },
            {
              name: "status",
              label: "Status",
              type: "select",
              options: ["active", "paused", "completed", "cancelled"].map((value) => ({
                label: value,
                value,
              })),
            },
            { name: "notes", label: "Admin notes", type: "textarea" },
          ]}
        />
      )}
    </>
  );
}

function StudentDetailChip({ label, value }: { label: string; value: string }) {
  const tr = useTranslate();
  return (
    <div className="admin-detail-chip">
      <div className="admin-detail-chip-label">{adminUiText(tr, label)}</div>
      <div className="admin-detail-chip-value">{adminUiText(tr, value)}</div>
    </div>
  );
}

function ProgressLine({
  label,
  value,
  detail,
  tone = "blue",
}: {
  label: string;
  value: number;
  detail?: string;
  tone?: "blue" | "gold" | "green";
}) {
  const tr = useTranslate();
  return (
    <div className="admin-progress-line">
      <div className="admin-progress-label">{adminUiText(tr, label)}</div>
      <div className="admin-progress-track">
        <div className={`admin-progress-fill ${tone}`} style={{ width: `${value}%` }} />
      </div>
      <div className="admin-progress-value">
        {detail ? adminUiText(tr, detail) : `${value}%`}
      </div>
    </div>
  );
}

function ConfidenceChart({
  points,
  fallbackValue,
}: {
  points: CheckIn[];
  fallbackValue: number | null;
}) {
  const rows = points.length
    ? points
    : fallbackValue != null
      ? [{ id: "current", week_number: 1, confidence_score: fallbackValue } as CheckIn]
      : [];
  const width = 420;
  const height = 150;
  const left = 32;
  const right = 16;
  const top = 14;
  const bottom = 28;
  const plotW = width - left - right;
  const plotH = height - top - bottom;
  const coords = rows.map((point, index) => {
    const x = left + (rows.length === 1 ? plotW / 2 : (index / (rows.length - 1)) * plotW);
    const score = Number(point.confidence_score ?? 0);
    const y = top + (1 - Math.max(0, Math.min(10, score)) / 10) * plotH;
    return { x, y, score, week: point.week_number };
  });
  const path = coords
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="admin-confidence-chart" role="img">
      {[10, 8, 6, 4].map((tick) => {
        const y = top + (1 - tick / 10) * plotH;
        return (
          <g key={tick}>
            <text x="0" y={y + 4} className="admin-chart-tick">
              {tick}
            </text>
            <line x1={left} x2={width - right} y1={y} y2={y} className="admin-chart-grid" />
          </g>
        );
      })}
      {path && <path d={path} className="admin-chart-line" />}
      {coords.map((point) => (
        <g key={`${point.week}-${point.x}`}>
          <circle cx={point.x} cy={point.y} r="4" className="admin-chart-dot" />
          <text x={point.x} y={height - 6} textAnchor="middle" className="admin-chart-label">
            Wk {point.week}
          </text>
          <text x={point.x} y={point.y - 10} textAnchor="middle" className="admin-chart-score">
            {point.score.toFixed(1)}
          </text>
        </g>
      ))}
    </svg>
  );
}

function LatestCheckInPanel({ latestCheckIn }: { latestCheckIn?: CheckIn }) {
  const tr = useTranslate();
  return (
    <>
      <h2 className="mb-4 text-sm font-semibold">{adminUiText(tr, "Latest Check-in")}</h2>
      {latestCheckIn ? (
        <>
          <AdminAlertBox
            label="Win of the week"
            text={latestCheckIn.win_of_week || "No win written yet."}
          />
          <AdminAlertBox
            label="Biggest struggle"
            text={latestCheckIn.biggest_struggle || "No struggle written yet."}
            tone="red"
          />
          <div className="mt-3 flex flex-wrap justify-between gap-2 text-[11px] text-white/32">
            <span>
              {adminUiText(tr, "Mood")}: {latestCheckIn.mood_emoji ?? moodLabel(latestCheckIn)}{" "}
              {latestCheckIn.mood ?? adminUiText(tr, "Not set")}
            </span>
            <span>
              {adminUiText(tr, "Confidence")}:{" "}
              {latestCheckIn.confidence_score ?? adminUiText(tr, "N/A")}/10
            </span>
            <span>
              {formatDate(latestCheckIn.submitted_at)}, {formatTime(latestCheckIn.submitted_at)}
            </span>
          </div>
        </>
      ) : (
        <EmptyRows text="No check-ins submitted yet." />
      )}
    </>
  );
}

function AdminAlertBox({
  label,
  text,
  tone = "gold",
}: {
  label: string;
  text: string;
  tone?: "gold" | "red" | "blue";
}) {
  const tr = useTranslate();
  return (
    <div className={`admin-alert-box ${tone}`}>
      <div className="admin-alert-label">{adminUiText(tr, label)}</div>
      <div className="admin-alert-text">"{adminUiText(tr, text)}"</div>
    </div>
  );
}

function NextSessionNote({
  student,
  latestCheckIn,
  noteRef,
}: {
  student: StudentRow;
  latestCheckIn?: CheckIn;
  noteRef: React.RefObject<HTMLTextAreaElement | null>;
}) {
  const tr = useTranslate();
  const queryClient = useQueryClient();
  const [note, setNote] = useState(latestCheckIn?.admin_note ?? student.notes ?? "");

  useEffect(() => {
    setNote(latestCheckIn?.admin_note ?? student.notes ?? "");
  }, [latestCheckIn?.admin_note, student.id, student.notes]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!supabase) throw new Error("The workspace is not connected yet.");
      const target = latestCheckIn
        ? supabase
            .from("check_ins")
            .update({ admin_note: note || null })
            .eq("id", latestCheckIn.id)
        : supabase
            .from("students")
            .update({ notes: note || null })
            .eq("id", student.id);
      const { error } = await target;
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] }),
  });

  return (
    <section className="admin-card p-5">
      <h2 className="mb-4 text-sm font-semibold">
        {adminUiText(tr, "Note for next session")}
      </h2>
      <textarea
        ref={noteRef}
        value={note}
        onChange={(event) => setNote(event.target.value)}
        className="admin-textarea"
        rows={3}
        placeholder={adminUiText(
          tr,
          "E.g. Work on phone listening drills - they freeze when they miss a word...",
        )}
      />
      {mutation.error instanceof Error && (
        <p className="mt-2 text-xs text-red-200">{mutation.error.message}</p>
      )}
      <button
        type="button"
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        className="admin-gold-btn mt-3 w-full"
      >
        {mutation.isPending ? adminUiText(tr, "Saving...") : adminUiText(tr, "Save note")}
      </button>
    </section>
  );
}

function ObjectiveDetailItem({
  item,
  isSaving,
  onEdit,
  onToggle,
}: {
  item: ObjectiveItem;
  isSaving: boolean;
  onEdit: () => void;
  onToggle: () => void;
}) {
  const tr = useTranslate();
  return (
    <button type="button" onClick={onEdit} className="admin-objective-card text-left">
      <span
        role="checkbox"
        aria-checked={item.completed}
        aria-label={adminUiText(
          tr,
          item.completed ? "Mark objective incomplete" : "Mark objective complete",
        )}
        tabIndex={0}
        className={`admin-objective-check ${item.completed ? "done" : ""}`}
        onClick={(event) => {
          event.stopPropagation();
          if (!isSaving) onToggle();
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            event.stopPropagation();
            if (!isSaving) onToggle();
          }
        }}
      >
        {isSaving ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : item.completed ? (
          <Check className="h-3 w-3" />
        ) : null}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-sm leading-6 text-white/75">{item.item_text}</div>
        <div className="mt-1 text-[10px] text-white/25">
          {item.completed ? tr("Completed", "Completado") : tr("Assigned", "Asignado")}
        </div>
      </div>
    </button>
  );
}

function ObjectiveDetailFallback({
  objective,
  isSaving,
  onEdit,
  onToggle,
}: {
  objective: Objective;
  isSaving: boolean;
  onEdit: () => void;
  onToggle: () => void;
}) {
  const tr = useTranslate();
  return (
    <button type="button" onClick={onEdit} className="admin-objective-card text-left">
      <span
        role="checkbox"
        aria-checked={Boolean(objective.completed)}
        aria-label={adminUiText(
          tr,
          objective.completed ? "Mark objective incomplete" : "Mark objective complete",
        )}
        tabIndex={0}
        className={`admin-objective-check ${objective.completed ? "done" : ""}`}
        onClick={(event) => {
          event.stopPropagation();
          if (!isSaving) onToggle();
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            event.stopPropagation();
            if (!isSaving) onToggle();
          }
        }}
      >
        {isSaving ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : objective.completed ? (
          <Check className="h-3 w-3" />
        ) : (
          <Circle className="h-3 w-3" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-sm leading-6 text-white/75">{objective.focus_title}</div>
        <div className="mt-1 text-[10px] text-white/25">
          {objective.completed
            ? tr("Completed", "Completado")
            : (objective.context_for_student ??
              objective.week_label ??
              `${adminUiText(tr, "Week")} ${objective.week_number}`)}
        </div>
      </div>
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
  const tr = useTranslate();
  const [adding, setAdding] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentRow | null>(null);
  const activeCount = allStudents.filter((student) => student.status === "active").length;
  const pendingCount = allStudents.filter(
    (student) => Number(student.stat?.pending_checkins ?? 0) > 0,
  ).length;

  function exportCsv() {
    const headers = ["Student", "Program", "Week", "Industry", "Confidence", "Sessions", "Status"];
    const rows = students.map((student) => [
      nameFor(student.profile),
      studentProgramLabel(student),
      `${student.current_week} / ${studentDurationWeeks(student)}`,
      student.industry ?? "",
      student.confidence_score ?? "",
      `${studentCompletedSessions(student)} / ${studentTotalSessions(student)}`,
      studentRosterStatus(student),
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "fluent-with-sena-students.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <Topbar
        title="Students"
        subtitle={`${activeCount} active · ${pendingCount} check-ins pending`}
        action={
          <>
            <button type="button" onClick={exportCsv} className="admin-outline-btn">
              {tr("Export CSV", "Exportar CSV")}
            </button>
            <button type="button" onClick={() => setAdding(true)} className="admin-gold-btn">
              <Plus className="mr-1.5 inline h-3.5 w-3.5" />
              {tr("Add student", "Agregar estudiante")}
            </button>
          </>
        }
      />
      <div className="admin-content">
        <label className="admin-search mb-4 max-w-sm">
          <Search className="h-4 w-4 text-white/30" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={tr("Search students", "Buscar estudiantes")}
          />
        </label>
        <div className="admin-grid-table">
          <div className="admin-table-head admin-students-row">
            <span>{adminUiText(tr, "Student")}</span>
            <span>{adminUiText(tr, "Program")}</span>
            <span>{adminUiText(tr, "Week")}</span>
            <span>{adminUiText(tr, "Industry")}</span>
            <span>{adminUiText(tr, "Confidence")}</span>
            <span>{adminUiText(tr, "Sessions")}</span>
            <span>{adminUiText(tr, "Status")}</span>
            <span />
          </div>
          {students.map((student) => {
            const name = nameFor(student.profile);
            const rosterStatus = studentRosterStatus(student);
            return (
              <div
                key={student.id}
                onClick={() => onSelect(student.id)}
                className="admin-table-row admin-students-row"
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
                <span>{studentProgramLabel(student)}</span>
                <span>
                  {student.current_week} / {studentDurationWeeks(student)}
                </span>
                <span>{student.industry ?? adminUiText(tr, "No industry")}</span>
                <span className="text-sena-gold">{student.confidence_score ?? "—"}</span>
                <span>
                  {studentCompletedSessions(student)} / {studentTotalSessions(student)}
                </span>
                <StatusPill status={rosterStatus} />
                <span className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onSelect(student.id);
                    }}
                    className="admin-panel-link whitespace-nowrap"
                  >
                    {tr("View", "Ver")}
                    {" ->"}
                  </button>
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
          applications={applications}
          tiers={tiers}
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
              options: [
                { label: "No tier", value: "" },
                ...tiers.map((tier) => ({
                  label: `${tier.name} - ${tier.duration_weeks} weeks`,
                  value: tier.id,
                })),
              ],
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
  const tr = useTranslate();
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
      if (!supabase) throw new Error("The workspace is not connected yet.");
      if (!profileId) throw new Error("Choose a student first.");

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
      <div
        className="admin-modal"
        role="dialog"
        aria-modal="true"
        aria-label={tr("Add student", "Agregar estudiante")}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/7 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold">{tr("Add student", "Agregar estudiante")}</h2>
            <p className="mt-1 text-xs leading-5 text-white/38">
              {tr(
                "Enroll an existing student into a coaching program.",
                "Inscribe a un estudiante existente en un programa de coaching.",
              )}
            </p>
          </div>
          <button type="button" onClick={onClose} className="admin-outline-btn">
            {adminUiText(tr, "Close")}
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
                <span className="admin-field-label">{adminUiText(tr, "Student")}</span>
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
                  <span className="admin-field-label">{tr("Program tier", "Nivel del programa")}</span>
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
                  <span className="admin-field-label">{adminUiText(tr, "Current week")}</span>
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
                  <span className="admin-field-label">{adminUiText(tr, "Industry")}</span>
                  <input
                    value={industry}
                    onChange={(event) => setIndustry(event.target.value)}
                    className="admin-input"
                    placeholder={tr("Healthcare, hospitality...", "Salud, hospitalidad...")}
                  />
                </label>

                <label className="block">
                  <span className="admin-field-label">{adminUiText(tr, "Start date")}</span>
                  <input
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                    type="date"
                    className="admin-input"
                  />
                </label>
              </div>

              <label className="block">
                <span className="admin-field-label">
                  {tr("Accepted application", "Solicitud aceptada")}
                </span>
                <select
                  value={applicationId}
                  onChange={(event) => setApplicationId(event.target.value)}
                  className="admin-select"
                >
                  <option value="">{tr("No application link", "Sin enlace de solicitud")}</option>
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
                {mutation.isPending
                  ? tr("Adding student...", "Agregando estudiante...")
                  : tr("Add student", "Agregar estudiante")}
              </button>
            </>
          ) : (
            <div className="rounded-lg border border-sena-gold/20 bg-sena-gold/7 p-4 text-sm leading-6 text-white/65">
              {tr(
                "No available students found. Create the student first, then come back here to enroll them in a program.",
                "No se encontraron estudiantes disponibles. Crea primero al estudiante y luego vuelve aqui para inscribirlo en un programa.",
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

function AddStudentAccountDialog({
  applications,
  tiers,
  onClose,
}: {
  applications: Application[];
  tiers: ProgramTier[];
  onClose: () => void;
}) {
  const tr = useTranslate();
  const queryClient = useQueryClient();
  const acceptedApplications = applications.filter(
    (application) => application.status === "accepted",
  );
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [timezone, setTimezone] = useState("America/New_York");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [tierId, setTierId] = useState(tiers[0]?.id ?? "");
  const [industry, setIndustry] = useState("");
  const [currentWeek, setCurrentWeek] = useState("1");
  const [startDate, setStartDate] = useState("");
  const [applicationId, setApplicationId] = useState("");
  const [notes, setNotes] = useState("");
  const [createdInvite, setCreatedInvite] = useState<{
    email: string;
    inviteSent?: boolean;
  } | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      return createStudentAccount({
        firstName,
        lastName,
        email,
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
    onSuccess: async (result) => {
      setCreatedInvite(result ?? null);
      await queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
  });

  return (
    <div className="admin-modal-backdrop" role="presentation">
      <div
        className="admin-modal"
        role="dialog"
        aria-modal="true"
        aria-label={tr("Add student", "Agregar estudiante")}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/7 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold">{tr("Add student", "Agregar estudiante")}</h2>
            <p className="mt-1 text-xs leading-5 text-white/38">
              {tr(
                "Create dashboard access after consult, contract, and payment. The student sets their own password from the setup link.",
                "Crea el acceso al panel despues de la consultoria, el contrato y el pago. El estudiante crea su propia contrasena desde el enlace de configuracion.",
              )}
            </p>
          </div>
          <button type="button" onClick={onClose} className="admin-outline-btn">
            {adminUiText(tr, "Close")}
          </button>
        </div>

        <form
          className="space-y-4 p-5"
          onSubmit={(event) => {
            event.preventDefault();
            mutation.mutate();
          }}
        >
          {createdInvite ? (
            <div className="rounded-xl border border-sena-gold/25 bg-sena-gold/8 p-4">
              <h3 className="text-sm font-semibold">
                {tr("Dashboard invite created", "Invitacion al panel creada")}
              </h3>
              <p className="mt-2 text-sm leading-6 opacity-70">
                {tr(
                  "A professional setup email was sent to",
                  "Se envio un correo profesional de configuracion a",
                )}{" "}
                {createdInvite.email}.{" "}
                {tr(
                  "The student can open it to create their own password and access the student dashboard.",
                  "El estudiante puede abrirlo para crear su propia contrasena y acceder al panel del estudiante.",
                )}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" className="admin-outline-btn" onClick={onClose}>
                  {tr("Done", "Listo")}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="admin-field-label">{adminUiText(tr, "First name")}</span>
                  <input
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    className="admin-input"
                    required
                  />
                </label>
                <label className="block">
                  <span className="admin-field-label">{adminUiText(tr, "Last name")}</span>
                  <input
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    className="admin-input"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="admin-field-label">{adminUiText(tr, "Email")}</span>
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    type="email"
                    className="admin-input"
                    required
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <label className="block">
                  <span className="admin-field-label">{adminUiText(tr, "Timezone")}</span>
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
                  <span className="admin-field-label">{adminUiText(tr, "Phone")}</span>
                  <input
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    className="admin-input"
                  />
                </label>
                <label className="block">
                  <span className="admin-field-label">{adminUiText(tr, "WhatsApp")}</span>
                  <input
                    value={whatsapp}
                    onChange={(event) => setWhatsapp(event.target.value)}
                    className="admin-input"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="admin-field-label">{tr("Program tier", "Nivel del programa")}</span>
                  <select
                    value={tierId}
                    onChange={(event) => setTierId(event.target.value)}
                    className="admin-select"
                  >
                    <option value="">{adminUiText(tr, "No tier")}</option>
                    {tiers.map((tier) => (
                      <option key={tier.id} value={tier.id}>
                        {tier.name} - {tier.duration_weeks} weeks
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="admin-field-label">{adminUiText(tr, "Current week")}</span>
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
                  <span className="admin-field-label">{adminUiText(tr, "Industry")}</span>
                  <input
                    value={industry}
                    onChange={(event) => setIndustry(event.target.value)}
                    className="admin-input"
                    placeholder={tr("Healthcare, hospitality...", "Salud, hospitalidad...")}
                  />
                </label>

                <label className="block">
                  <span className="admin-field-label">{adminUiText(tr, "Start date")}</span>
                  <input
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                    type="date"
                    className="admin-input"
                  />
                </label>
              </div>

              <label className="block">
                <span className="admin-field-label">{tr("Application", "Solicitud")}</span>
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
                  <option value="">
                    {acceptedApplications.length
                      ? tr("No application link", "Sin enlace de solicitud")
                      : tr("No accepted applications yet", "Aun no hay solicitudes aceptadas")}
                  </option>
                  {acceptedApplications.map((application) => (
                    <option key={application.id} value={application.id}>
                      {application.full_name} - {application.email}
                    </option>
                  ))}
                </select>
                {!acceptedApplications.length && (
                  <p className="mt-2 text-xs leading-5 text-white/38">
                    {tr(
                      "Applications appear here only after an application has been reviewed and marked accepted. This link is optional, so you can create access without choosing one.",
                      "Las solicitudes aparecen aqui solo despues de haber sido revisadas y marcadas como aceptadas. Este enlace es opcional, asi que puedes crear el acceso sin elegir una.",
                    )}
                  </p>
                )}
              </label>

              <label className="block">
                <span className="admin-field-label">{adminUiText(tr, "Admin notes")}</span>
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
                {mutation.isPending
                  ? tr("Sending invite...", "Enviando invitacion...")
                  : tr("Send dashboard invite", "Enviar invitacion al panel")}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

function CheckInsScreen({
  checkIns,
  students,
}: {
  checkIns: CheckIn[];
  students: StudentRow[];
  setScreen: (screen: ScreenId) => void;
}) {
  const tr = useTranslate();
  const [selectedCheckInId, setSelectedCheckInId] = useState<string | null>(
    checkIns[0]?.id ?? null,
  );
  const pending = checkIns.filter((item) => item.status === "pending");
  const reviewed = checkIns.filter((item) => item.status === "reviewed");
  const now = new Date();
  const startOfWeek = new Date(now);
  const day = startOfWeek.getDay() || 7;
  startOfWeek.setDate(startOfWeek.getDate() - day + 1);
  startOfWeek.setHours(0, 0, 0, 0);
  const weekCheckIns = checkIns.filter((item) => new Date(item.submitted_at) >= startOfWeek);
  const visibleThisWeek = weekCheckIns.length ? weekCheckIns : checkIns.slice(0, 3);
  const selectedCheckIn =
    checkIns.find((item) => item.id === selectedCheckInId) ?? checkIns[0] ?? null;

  useEffect(() => {
    if (!checkIns.length) {
      setSelectedCheckInId(null);
      return;
    }
    if (!selectedCheckInId || !checkIns.some((item) => item.id === selectedCheckInId)) {
      setSelectedCheckInId(checkIns[0].id);
    }
  }, [checkIns, selectedCheckInId]);

  return (
    <>
      <Topbar
        title="Check-in Inbox"
        subtitle={`${pending.length} unread · ${formatWeekRange(checkIns[0]?.submitted_at)}`}
      />
      <div className="admin-content">
        <div className="checkin-inbox-layout">
          <section className="checkin-inbox-list">
            <h2>{tr("This Week", "Esta semana")}</h2>
            <div className="checkin-thread-list">
              {visibleThisWeek.length ? (
                visibleThisWeek.map((checkIn) => (
                  <CheckInInboxItem
                    key={checkIn.id}
                    checkIn={checkIn}
                    student={students.find((item) => item.id === checkIn.student_id)}
                    active={checkIn.id === selectedCheckIn?.id}
                    onSelect={() => setSelectedCheckInId(checkIn.id)}
                  />
                ))
              ) : (
                <EmptyRows text="No check-ins submitted this week." />
              )}
            </div>

            <div className="checkin-pending-block">
              <h3>{tr("Pending", "Pendientes")}</h3>
              {pending.length ? (
                pending.map((checkIn) => (
                  <button
                    key={`pending-${checkIn.id}`}
                    type="button"
                    onClick={() => setSelectedCheckInId(checkIn.id)}
                    className="checkin-pending-row"
                  >
                    <span>
                      {nameFor(students.find((item) => item.id === checkIn.student_id)?.profile)}
                    </span>
                    <strong>
                      {checkIn.id === selectedCheckIn?.id
                        ? tr("Open", "Abrir")
                        : tr("Review", "Revisar")}
                    </strong>
                  </button>
                ))
              ) : (
                <p>{adminUiText(tr, "No pending check-ins.")}</p>
              )}
            </div>

            {reviewed.length > 0 && (
              <div className="checkin-pending-block">
                <h3>{tr("Reviewed", "Revisados")}</h3>
                {reviewed.slice(0, 4).map((checkIn) => (
                  <button
                    key={`reviewed-${checkIn.id}`}
                    type="button"
                    onClick={() => setSelectedCheckInId(checkIn.id)}
                    className="checkin-pending-row"
                  >
                    <span>
                      {nameFor(students.find((item) => item.id === checkIn.student_id)?.profile)}
                    </span>
                    <strong>{tr("Done", "Listo")}</strong>
                  </button>
                ))}
              </div>
            )}
          </section>

          {selectedCheckIn ? (
            <CheckInReviewCard
              checkIn={selectedCheckIn}
              students={students}
              onReviewed={() => {
                const next = checkIns.find(
                  (item) => item.id !== selectedCheckIn.id && item.status === "pending",
                );
                if (next) setSelectedCheckInId(next.id);
              }}
            />
          ) : (
            <section className="checkin-review-panel">
              <EmptyRows text="No check-in selected." />
            </section>
          )}
        </div>
      </div>
    </>
  );
}

function CheckInInboxItem({
  checkIn,
  student,
  active,
  onSelect,
}: {
  checkIn: CheckIn;
  student?: StudentRow;
  active: boolean;
  onSelect: () => void;
}) {
  const tr = useTranslate();
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`checkin-thread-row ${active ? "active" : ""}`}
    >
      <span className={`checkin-thread-dot ${checkIn.status === "reviewed" ? "read" : ""}`} />
      <span className="checkin-thread-main">
        <strong>{nameFor(student?.profile)}</strong>
        <small>
          Mood: {checkIn.mood || "Not set"} · Confidence: {checkIn.confidence_score ?? "-"}/10
        </small>
        <em>{formatDate(checkIn.submitted_at)}</em>
      </span>
      <span className="checkin-thread-mood">{moodLabel(checkIn)}</span>
    </button>
  );
}

function CheckInReviewCard({
  checkIn,
  students,
  onReviewed,
}: {
  checkIn: CheckIn;
  students: StudentRow[];
  onReviewed?: () => void;
}) {
  const tr = useTranslate();
  const queryClient = useQueryClient();
  const [adminNote, setAdminNote] = useState(checkIn.admin_note ?? "");
  const student = students.find((item) => item.id === checkIn.student_id);
  const mutation = useMutation({
    mutationFn: async () => {
      if (!supabase) throw new Error("The workspace is not connected yet.");
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
      onReviewed?.();
    },
  });

  useEffect(() => {
    setAdminNote(checkIn.admin_note ?? "");
  }, [checkIn.id, checkIn.admin_note]);

  return (
    <section className="checkin-review-panel">
      <div className="checkin-review-head">
        <div>
          <h2>{nameFor(student?.profile)}</h2>
          <p>
            Week {checkIn.week_number} · {formatDate(checkIn.submitted_at)} ·{" "}
            {formatTime(checkIn.submitted_at)} · {moodLabel(checkIn)}{" "}
            {checkIn.mood || "Mood not set"}
          </p>
        </div>
        <div className="checkin-score">
          <strong>{checkIn.confidence_score ?? "-"}</strong>
          <span>10</span>
        </div>
      </div>

      <div className="checkin-answer-card gold">
        <span>{adminUiText(tr, "Win of the week")}</span>
        <p>"{checkIn.win_of_week ?? adminUiText(tr, "No win submitted.")}"</p>
      </div>
      <div className="checkin-answer-card red">
        <span>{adminUiText(tr, "Biggest struggle")}</span>
        <p>"{checkIn.biggest_struggle ?? adminUiText(tr, "No struggle submitted.")}"</p>
      </div>
      <div className="checkin-answer-card blue">
        <span>{tr("A first this week", "Una primera vez esta semana")}</span>
        <p>
          "{checkIn.first_this_week ?? tr("No first submitted.", "No se envio ninguna primera vez.")}"
        </p>
      </div>

      <label className="checkin-note-field">
        <span>{adminUiText(tr, "Note for next session")}</span>
        <textarea
          value={adminNote}
          onChange={(event) => setAdminNote(event.target.value)}
          className="admin-textarea"
          rows={4}
          placeholder={tr(
            "Write Sena's note for the next session...",
            "Escribe la nota de Sena para la proxima sesion...",
          )}
        />
      </label>

      <button
        type="button"
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        className="admin-gold-btn checkin-review-save"
      >
        {mutation.isPending
          ? adminUiText(tr, "Saving...")
          : tr("Save note - mark as reviewed", "Guardar nota y marcar como revisado")}
      </button>
      {mutation.error instanceof Error && (
        <p className="mt-2 text-xs text-red-300">{mutation.error.message}</p>
      )}
    </section>
  );
}

function LegacyCheckInsScreen({
  checkIns,
  students,
  setScreen,
}: {
  checkIns: CheckIn[];
  students: StudentRow[];
  setScreen: (screen: ScreenId) => void;
}) {
  const tr = useTranslate();
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
            {tr("Add check-in", "Agregar check-in")}
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
              {tr("Open student journals", "Abrir diarios de estudiantes")}
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

function LegacyCheckInReviewCard({
  checkIn,
  students,
  onEdit,
}: {
  checkIn: CheckIn;
  students: StudentRow[];
  onEdit: () => void;
}) {
  const tr = useTranslate();
  const queryClient = useQueryClient();
  const [adminNote, setAdminNote] = useState(checkIn.admin_note ?? "");
  const student = students.find((item) => item.id === checkIn.student_id);
  const mutation = useMutation({
    mutationFn: async () => {
      if (!supabase) throw new Error("The workspace is not connected yet.");
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
        <span className="admin-field-label">{tr("Admin response", "Respuesta del admin")}</span>
        <textarea
          value={adminNote}
          onChange={(event) => setAdminNote(event.target.value)}
          className="admin-textarea"
          rows={3}
          placeholder={tr(
            "Write a short response or coaching note...",
            "Escribe una respuesta corta o una nota de coaching...",
          )}
        />
      </label>
      <button
        type="button"
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        className="admin-gold-btn mt-3"
      >
        {mutation.isPending
          ? adminUiText(tr, "Saving...")
          : tr("Mark reviewed", "Marcar como revisado")}
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
  const tr = useTranslate();
  const [adding, setAdding] = useState(false);
  const [editingSession, setEditingSession] = useState<LiveSession | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const firstSession = sessions.find((session) => session.status !== "completed");
    const date = new Date(firstSession?.scheduled_at ?? Date.now());
    date.setDate(1);
    date.setHours(0, 0, 0, 0);
    return date;
  });
  const now = new Date();
  const endOfNextWeek = new Date(now);
  const day = endOfNextWeek.getDay() || 7;
  endOfNextWeek.setDate(endOfNextWeek.getDate() - day + 14);
  endOfNextWeek.setHours(23, 59, 59, 999);
  const upcomingSessions = sessions
    .filter((session) => {
      const scheduledAt = new Date(session.scheduled_at);
      return (
        scheduledAt >= now &&
        scheduledAt <= endOfNextWeek &&
        session.status !== "cancelled" &&
        session.status !== "no_show"
      );
    })
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
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
    { name: "session_notes", label: "Session notes", type: "textarea" },
  ];

  return (
    <>
      <Topbar
        title="Live Sessions"
        subtitle={formatWeekRange(sessions[0]?.scheduled_at)}
        action={
          <>
            <button type="button" className="admin-outline-btn">
              {tr("Sync calendar", "Sincronizar calendario")}
            </button>
            <button
              type="button"
              className="admin-outline-btn"
              onClick={() => downloadSessionsIcs(sessions, students)}
            >
              <CalendarDays className="mr-1.5 inline h-3.5 w-3.5" />
              {tr("Apple Calendar", "Calendario de Apple")}
            </button>
            <button type="button" onClick={() => setAdding(true)} className="admin-gold-btn">
              <Plus className="mr-1.5 inline h-3.5 w-3.5" />
              {tr("Schedule session", "Programar sesion")}
            </button>
          </>
        }
      />
      <div className="admin-content">
        <SessionCalendarMonth
          month={calendarMonth}
          sessions={sessions}
          students={students}
          onPrev={() =>
            setCalendarMonth((current) => {
              const next = new Date(current);
              next.setMonth(next.getMonth() - 1);
              return next;
            })
          }
          onNext={() =>
            setCalendarMonth((current) => {
              const next = new Date(current);
              next.setMonth(next.getMonth() + 1);
              return next;
            })
          }
          onToday={() => {
            const date = new Date();
            date.setDate(1);
            date.setHours(0, 0, 0, 0);
            setCalendarMonth(date);
          }}
        />
        <div className="admin-live-grid">
          {sessions.map((session) => {
            const student = students.find((item) => item.id === session.student_id);
            const isLive = session.status === "live";
            const isCompleted = session.status === "completed";
            const canJoin = session.zoom_join_url && !isCompleted;
            return (
              <SessionCard
                key={session.id}
                session={session}
                student={student}
                canJoin={Boolean(canJoin)}
                isLive={isLive}
                isCompleted={isCompleted}
                onEdit={() => setEditingSession(session)}
              />
            );
          })}
          {!sessions.length && <EmptyRows text="No sessions scheduled yet." />}
        </div>
        <section className="admin-upcoming-panel">
          <div className="admin-upcoming-head">
            <h2>{tr("Upcoming - Rest of Week", "Proximas - Resto de la semana")}</h2>
            <span>{tr("Through next week only", "Solo hasta la proxima semana")}</span>
          </div>
          <div className="admin-upcoming-list">
            {upcomingSessions.length ? (
              upcomingSessions.map((session) => (
                <UpcomingSessionRow
                  key={`upcoming-${session.id}`}
                  session={session}
                  student={students.find((item) => item.id === session.student_id)}
                />
              ))
            ) : (
              <EmptyRows text="No upcoming sessions in the next week." />
            )}
          </div>
        </section>
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

function SessionCalendarMonth({
  month,
  sessions,
  students,
  onPrev,
  onNext,
  onToday,
}: {
  month: Date;
  sessions: LiveSession[];
  students: StudentRow[];
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}) {
  const tr = useTranslate();
  const monthLabel = new Intl.DateTimeFormat(appLanguageLocale(), {
    month: "long",
    year: "numeric",
  }).format(month);
  const first = new Date(month);
  first.setDate(1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  const days = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
  const sessionsByDay = sessions.reduce<Record<string, LiveSession[]>>((acc, session) => {
    const key = dateKey(session.scheduled_at);
    acc[key] = [...(acc[key] ?? []), session];
    return acc;
  }, {});
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const todayKey = dateKey(new Date());

  return (
    <section className="admin-session-calendar">
      <div className="admin-session-calendar-head">
        <div>
          <h2>{monthLabel}</h2>
          <p>{tr("Literal calendar view for coaching sessions", "Vista de calendario para sesiones de coaching")}</p>
        </div>
        <div className="admin-session-calendar-controls">
          <button
            type="button"
            onClick={onPrev}
            className="admin-icon-btn"
            aria-label={tr("Previous month", "Mes anterior")}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button type="button" onClick={onToday} className="admin-outline-btn">
            {tr("Today", "Hoy")}
          </button>
          <button
            type="button"
            onClick={onNext}
            className="admin-icon-btn"
            aria-label={tr("Next month", "Mes siguiente")}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="admin-session-weekdays">
        {weekDays.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>
      <div className="admin-session-calendar-grid">
        {days.map((day) => {
          const key = dateKey(day);
          const daySessions = (sessionsByDay[key] ?? []).sort(
            (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime(),
          );
          const outside = day.getMonth() !== month.getMonth();
          return (
            <div
              key={key}
              className={`admin-session-day ${outside ? "muted" : ""} ${
                key === todayKey ? "today" : ""
              }`}
            >
              <div className="admin-session-day-number">{day.getDate()}</div>
              <div className="admin-session-day-list">
                {daySessions.slice(0, 3).map((session) => {
                  const student = students.find((item) => item.id === session.student_id);
                  return (
                    <div key={session.id} className={`admin-session-pill ${session.status}`}>
                      <span>{formatTime(session.scheduled_at)}</span>
                      <strong>{nameFor(student?.profile)}</strong>
                    </div>
                  );
                })}
                {daySessions.length > 3 && (
                  <div className="admin-session-more">
                    +{daySessions.length - 3} {tr("more", "mas")}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function SessionCard({
  session,
  student,
  canJoin,
  isLive,
  isCompleted,
  onEdit,
}: {
  session: LiveSession;
  student?: StudentRow;
  canJoin: boolean;
  isLive: boolean;
  isCompleted: boolean;
  onEdit: () => void;
}) {
  const tr = useTranslate();
  const sessionsPerWeek = student ? studentSessionsPerWeek(student) : 4;
  const durationWeeks = student ? studentDurationWeeks(student) : 16;
  const duration = session.duration_minutes || 60;
  const joinLabel = isLive
    ? tr("Join session", "Unirse a la sesion")
    : tr("Join Zoom", "Unirse a Zoom");
  const statusLabel = isLive
    ? tr("Live now", "En vivo ahora")
    : session.status === "scheduled"
      ? adminUiText(tr, "Scheduled")
      : adminUiText(tr, session.status.replace(/_/g, " "));

  return (
    <article className="admin-live-card">
      <div className="admin-live-header">
        <div>
          <h2 className="admin-live-title">{nameFor(student?.profile)}</h2>
        </div>
        <div className={`admin-live-state ${isLive ? "now" : ""}`}>
          {isLive && <span className="admin-live-dot" />}
          {statusLabel}
        </div>
      </div>

      <div className="admin-live-meta">
        <LiveMeta label="Time" value={formatRelativeSessionTime(session.scheduled_at)} />
        <LiveMeta label="Duration" value={`${duration} min`} />
        <LiveMeta
          label="Focus"
          value={session.focus_topic || adminUiText(tr, "Live coaching session")}
        />
        <LiveMeta
          label="Week"
          value={`${adminUiText(tr, "Week")} ${session.week_number} ${tr("of", "de")} ${durationWeeks}`}
        />
        <LiveMeta
          label="Session"
          value={`${tr("Session", "Sesion")} ${session.session_number} ${tr(
            "of",
            "de",
          )} ${sessionsPerWeek} ${tr("this week", "esta semana")}`}
          tone="gold"
        />
      </div>

      <div className="admin-live-actions">
        {canJoin && session.zoom_join_url ? (
          <a
            href={session.zoom_join_url}
            target="_blank"
            rel="noreferrer"
            className={isLive ? "admin-gold-btn" : "admin-outline-btn"}
          >
            {joinLabel}
          </a>
        ) : null}
        {!isCompleted && session.zoom_start_url && (
          <a
            href={session.zoom_start_url}
            target="_blank"
            rel="noreferrer"
            className="admin-outline-btn"
          >
            {tr("Start Zoom", "Iniciar Zoom")}
          </a>
        )}
        {isCompleted && session.recording_url && (
          <a
            href={session.recording_url}
            target="_blank"
            rel="noreferrer"
            className="admin-outline-btn"
          >
            {adminUiText(tr, "Watch recording")}
          </a>
        )}
        {session.zoom_meeting_id && !isLive && !session.recording_url && (
          <RecordingSyncButton session={session} />
        )}
      </div>

      {session.session_notes && (
        <div className="admin-live-note">
          <span>{adminUiText(tr, "Notes")}</span>
          {session.session_notes}
        </div>
      )}
      <button type="button" onClick={onEdit} className="admin-outline-btn admin-live-edit-btn">
        {adminUiText(tr, "Edit session")}
      </button>
    </article>
  );
}

function LiveMeta({ label, value, tone }: { label: string; value: string; tone?: "gold" }) {
  const tr = useTranslate();
  return (
    <div className="admin-live-row">
      <span>{adminUiText(tr, label)}</span>
      <strong className={tone === "gold" ? "gold" : undefined}>{adminUiText(tr, value)}</strong>
    </div>
  );
}

function UpcomingSessionRow({ session, student }: { session: LiveSession; student?: StudentRow }) {
  const tr = useTranslate();
  const statusLabel =
    session.status === "scheduled"
      ? adminUiText(tr, "Scheduled")
      : adminUiText(tr, session.status.replace(/_/g, " "));

  return (
    <div className="admin-upcoming-row">
      <div className="admin-upcoming-time">{formatCompactSessionTime(session.scheduled_at)}</div>
      <div className="admin-upcoming-main">
        <div className="admin-upcoming-name">{nameFor(student?.profile)}</div>
        <div className="admin-upcoming-sub">
          {student ? studentProgramLabel(student) : "Program"} · Week {session.week_number} ·{" "}
          {session.focus_topic || "Live coaching session"}
        </div>
      </div>
      <div className="admin-upcoming-status">{statusLabel}</div>
    </div>
  );
}

function RecordingSyncButton({
  session,
  primary = false,
}: {
  session: LiveSession;
  primary?: boolean;
}) {
  const tr = useTranslate();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async () => {
      if (!supabase) throw new Error("The workspace is not connected yet.");
      if (!session.zoom_meeting_id) throw new Error("No Zoom meeting is connected yet.");

      const recording = await invokeZoomMeeting({
        action: "recordings",
        meetingId: session.zoom_meeting_id,
      });
      const recordingUrl = recording.shareUrl || recording.playUrl || recording.downloadUrl;
      if (!recordingUrl) {
        throw new Error("Zoom has not published a recording link for this session yet.");
      }

      const { error } = await supabase
        .from("live_sessions")
        .update({
          recording_url: recordingUrl,
          zoom_uuid: recording.uuid ?? session.zoom_uuid,
          recording_expires_at: null,
        })
        .eq("id", session.id);

      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] }),
  });

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        disabled={mutation.isPending || !session.zoom_meeting_id}
        onClick={() => mutation.mutate()}
        className={primary ? "admin-gold-btn" : "admin-outline-btn"}
      >
        {mutation.isPending ? "Checking Zoom..." : "Sync recording"}
      </button>
      {mutation.error instanceof Error && (
        <span className="max-w-xs text-xs text-red-300">{mutation.error.message}</span>
      )}
    </div>
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
  const tr = useTranslate();
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
      if (!supabase) throw new Error("The workspace is not connected yet.");
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
            <h2 className="text-base font-semibold">{adminUiText(tr, title)}</h2>
            <p className="mt-1 text-xs leading-5 text-white/38">
              {adminUiText(
                tr,
                "This saves the session and syncs the matching Zoom meeting. The recording link will appear after Zoom finishes processing it.",
              )}
            </p>
          </div>
          <button type="button" onClick={onClose} className="admin-outline-btn">
            {adminUiText(tr, "Close")}
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
              <span className="admin-field-label">{adminUiText(tr, field.label)}</span>
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
                  <option value="">{adminUiText(tr, "Select...")}</option>
                  {(field.options ?? []).map((option) => (
                    <option key={option.value} value={option.value}>
                      {adminUiText(tr, option.label)}
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
              ? adminUiText(tr, "Syncing Zoom...")
              : rowId
                ? adminUiText(tr, "Save and sync Zoom")
                : adminUiText(tr, "Create Zoom session")}
          </button>
        </form>
      </div>
    </div>
  );
}

function SessionDeleteButton({ session }: { session: LiveSession }) {
  const tr = useTranslate();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async () => {
      if (!supabase) throw new Error("The workspace is not connected yet.");
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
        if (window.confirm(adminUiText(tr, "Delete this session and its Zoom meeting?"))) {
          mutation.mutate();
        }
      }}
      className="admin-danger-btn"
      title={
        mutation.error instanceof Error
          ? mutation.error.message
          : adminUiText(tr, "Delete session")
      }
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}

function journalTypeLabel(type: JournalEntry["entry_type"]) {
  if (type === "phrase_bank") return translateAdminStatic("Phrase Bank");
  if (type === "question") return translateAdminStatic("Questions");
  return translateAdminStatic("Session Notes");
}

function journalAddLabel(type: JournalEntry["entry_type"]) {
  if (type === "phrase_bank") return translateAdminStatic("Add Phrase");
  if (type === "question") return translateAdminStatic("Add Question");
  return translateAdminStatic("Add Session Note");
}

function journalWeekColor(week?: number | null) {
  const colors = ["#c9a84c", "#5ba3d4", "#d4875b", "#8ccf9b", "#c58adf", "#f2d06b"];
  if (!week) return colors[0];
  return colors[(week - 1) % colors.length];
}

function phraseLines(content?: string | null) {
  return (content ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function JournalsScreen({
  journals,
  students,
  selectedStudent,
  setSelectedStudentId,
}: {
  journals: JournalEntry[];
  students: StudentRow[];
  selectedStudent?: StudentRow;
  setSelectedStudentId: (id: string) => void;
}) {
  const tr = useTranslate();
  const [type, setType] = useState<JournalEntry["entry_type"]>("phrase_bank");
  const [adding, setAdding] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number | "all">("all");
  const currentStudent = selectedStudent ?? students[0];
  const filtered = journals.filter(
    (entry) =>
      entry.entry_type === type && (!currentStudent || entry.student_id === currentStudent.id),
  );
  const weeks = Array.from(
    new Set(filtered.map((entry) => entry.week_number).filter((week): week is number => !!week)),
  ).sort((a, b) => a - b);
  const grouped = filtered.reduce<Record<string, JournalEntry[]>>((acc, entry) => {
    const key = String(entry.week_number ?? "Unassigned");
    acc[key] = [...(acc[key] ?? []), entry];
    return acc;
  }, {});
  const nextWeek = Math.max(0, ...weeks) + 1;

  return (
    <>
      <Topbar
        title="Student Journals"
        subtitle="Phrase banks, questions for Sena, and session notes"
        action={
          <select
            value={currentStudent?.id ?? ""}
            onChange={(event) => {
              setSelectedStudentId(event.target.value);
              setSelectedWeek("all");
            }}
            className="admin-select admin-client-switch journal-client-switch"
          >
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {nameFor(student.profile)}
              </option>
            ))}
          </select>
        }
      />
      <div className="admin-content">
        <section className="journal-mockup-shell">
          <div className="journal-tabs">
            {(["phrase_bank", "question", "session_note"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setType(item);
                  setSelectedWeek("all");
                }}
                className={type === item ? "active" : ""}
              >
                {item === "question" ? adminUiText(tr, "Questions for Sena") : journalTypeLabel(item)}
              </button>
            ))}
          </div>

          {type === "phrase_bank" && (
            <JournalPhraseBankView
              grouped={grouped}
              currentStudent={currentStudent}
              nextWeek={nextWeek}
              onAddWeek={(week) => {
                setSelectedWeek(week);
                setAdding(true);
              }}
              onEdit={setEditingEntry}
            />
          )}

          {type === "question" && (
            <JournalQuestionsView
              entries={filtered}
              currentStudent={currentStudent}
              onAdd={() => setAdding(true)}
              onEdit={setEditingEntry}
            />
          )}

          {type === "session_note" && (
            <JournalSessionNotesView
              entries={filtered}
              currentStudent={currentStudent}
              onAdd={() => setAdding(true)}
              onEdit={setEditingEntry}
            />
          )}

          {!filtered.length && (
            <div className="journal-empty">
              <h2>
                {tr("No", "No")} {journalTypeLabel(type).toLowerCase()} {tr("yet", "todavia")}
              </h2>
              <p>
                {tr(
                  "Create a week entry for this client, then both coach and client can build inside it.",
                  "Crea una entrada semanal para este cliente y luego tanto el coach como el cliente podran trabajar dentro de ella.",
                )}
              </p>
            </div>
          )}
        </section>
      </div>
      {adding && currentStudent && (
        <JournalEntryDialog
          title={journalAddLabel(type)}
          students={students}
          selectedStudent={currentStudent}
          entryType={type}
          initialWeek={
            selectedWeek === "all" ? (weeks[0] ?? currentStudent.current_week ?? 1) : selectedWeek
          }
          onClose={() => setAdding(false)}
        />
      )}
      {editingEntry && (
        <JournalEntryDialog
          title={`Edit ${journalTypeLabel(editingEntry.entry_type)}`}
          students={students}
          selectedStudent={
            students.find((student) => student.id === editingEntry.student_id) ?? currentStudent
          }
          entryType={editingEntry.entry_type}
          entry={editingEntry}
          onClose={() => setEditingEntry(null)}
        />
      )}
    </>
  );
}

function JournalPhraseBankView({
  grouped,
  currentStudent,
  nextWeek,
  onAddWeek,
  onEdit,
}: {
  grouped: Record<string, JournalEntry[]>;
  currentStudent?: StudentRow;
  nextWeek: number;
  onAddWeek: (week: number) => void;
  onEdit: (entry: JournalEntry) => void;
}) {
  const tr = useTranslate();
  const groups = Object.entries(grouped).sort(([a], [b]) => Number(b) - Number(a));
  return (
    <section className="journal-board">
      <div className="journal-board-head">
        <h2>{journalTypeLabel("phrase_bank")}</h2>
        <span>
          {currentStudent
            ? `${nameFor(currentStudent.profile)} - ${adminUiText(tr, "Week")} ${currentStudent.current_week}`
            : ""}
        </span>
      </div>
      <div className="journal-phrase-grid">
        {groups.map(([week, entries]) => (
          <article key={week} className="journal-phrase-set">
            <h3 style={{ color: journalWeekColor(Number(week)) }}>
              {adminUiText(tr, "Week")} {week} -{" "}
              {entries[0]?.context_note || entries[0]?.topic || adminUiText(tr, "Phrase Set")}
            </h3>
            <div className="journal-phrase-table">
              {entries.map((entry) => {
                const phrases = phraseLines(entry.content);
                const phrase = phrases[0] ?? entry.content;
                return (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => onEdit(entry)}
                    className="journal-phrase-row"
                  >
                    <strong>{entry.topic ? `"${entry.topic}"` : `"${phrase}"`}</strong>
                    <em>
                      {entry.context_note ||
                        phrases.slice(1).join(" / ") ||
                        adminUiText(tr, "Add context")}
                    </em>
                  </button>
                );
              })}
            </div>
          </article>
        ))}
        <button type="button" onClick={() => onAddWeek(nextWeek)} className="journal-add-week-card">
          {adminUiText(tr, "Add phrase set for Week")} {nextWeek}
        </button>
      </div>
    </section>
  );
}

function JournalQuestionsView({
  entries,
  currentStudent,
  onAdd,
  onEdit,
}: {
  entries: JournalEntry[];
  currentStudent?: StudentRow;
  onAdd: () => void;
  onEdit: (entry: JournalEntry) => void;
}) {
  const tr = useTranslate();
  const unanswered = entries.filter((entry) => !entry.context_note).length;
  return (
    <section className="journal-board">
      <div className="journal-board-head">
        <h2>{adminUiText(tr, "Questions for Sena")}</h2>
        <span>
          {currentStudent
            ? `${nameFor(currentStudent.profile)} - ${unanswered} ${adminUiText(tr, "unanswered")}`
            : `${unanswered} ${adminUiText(tr, "unanswered")}`}
        </span>
      </div>
      <div className="journal-question-list">
        {entries.map((entry) => {
          const answered = Boolean(entry.context_note);
          return (
            <article
              key={entry.id}
              className={`journal-question-row ${answered ? "answered" : ""}`}
            >
              <span className="journal-question-dot" />
              <button type="button" onClick={() => onEdit(entry)} className="journal-question-main">
                <strong>"{entry.topic || entry.content}"</strong>
                <small>
                  {adminUiText(tr, "Asked")} {formatDate(entry.created_at)} -{" "}
                  {answered
                    ? adminUiText(tr, "Answered in session")
                    : adminUiText(tr, "Unanswered")}
                </small>
              </button>
              <button
                type="button"
                onClick={() => onEdit(entry)}
                className={answered ? "admin-outline-btn" : "admin-gold-btn"}
              >
                {answered ? adminUiText(tr, "View answer") : adminUiText(tr, "Answer")}
              </button>
            </article>
          );
        })}
      </div>
      <button type="button" onClick={onAdd} className="admin-outline-btn journal-bottom-add">
        {adminUiText(tr, "Add Question")}
      </button>
    </section>
  );
}

function JournalSessionNotesView({
  entries,
  currentStudent,
  onAdd,
  onEdit,
}: {
  entries: JournalEntry[];
  currentStudent?: StudentRow;
  onAdd: () => void;
  onEdit: (entry: JournalEntry) => void;
}) {
  const tr = useTranslate();
  return (
    <div className="journal-session-stack">
      {entries.map((entry, index) => (
        <article key={entry.id} className="journal-session-card">
          <div className="journal-session-head">
            <div>
              <h2>{entry.topic || `${adminUiText(tr, "Session")} ${entries.length - index}`}</h2>
              <p>
                {currentStudent?.tier?.name ?? "Build"} - {adminUiText(tr, "Week")}{" "}
                {entry.week_number ?? currentStudent?.current_week ?? 1} -{" "}
                {formatDate(entry.created_at)}
              </p>
            </div>
            <button type="button" onClick={() => onEdit(entry)} className="admin-outline-btn">
              {adminUiText(tr, "Edit")}
            </button>
          </div>
          <div className="journal-session-note gold">
            <span>{adminUiText(tr, "What we worked on")}</span>
            <p>{entry.content || adminUiText(tr, "Add the notes from this session.")}</p>
          </div>
          <div className="journal-session-note blue">
            <span>{adminUiText(tr, "What to follow up next session")}</span>
            <p>{entry.context_note || adminUiText(tr, "Add next-session follow-up notes.")}</p>
          </div>
        </article>
      ))}
      <button type="button" onClick={onAdd} className="admin-outline-btn journal-bottom-add">
        {journalAddLabel("session_note")}
      </button>
    </div>
  );
}

function JournalEntryCard({
  entry,
  type,
  onEdit,
}: {
  entry: JournalEntry;
  type: JournalEntry["entry_type"];
  onEdit: () => void;
}) {
  const tr = useTranslate();
  const phrases = phraseLines(entry.content);
  return (
    <article className="journal-entry-card">
      <div className="journal-entry-head">
        <div>
          <p>
            {type === "phrase_bank"
              ? adminUiText(tr, "Vocabulary Word")
              : type === "question"
                ? adminUiText(tr, "Question")
                : adminUiText(tr, "Note")}
          </p>
          <h3>{entry.topic || adminUiText(tr, "Untitled")}</h3>
        </div>
        <small>{formatDate(entry.created_at)}</small>
      </div>

      {type === "phrase_bank" ? (
        <ol className="journal-phrase-list">
          {phrases.map((phrase, index) => (
            <li key={`${phrase}-${index}`}>{phrase}</li>
          ))}
          {!phrases.length && <li>{adminUiText(tr, "No phrases yet.")}</li>}
        </ol>
      ) : (
        <div className="journal-rich-text">{entry.content}</div>
      )}

      {entry.context_note && (
        <div className="journal-entry-note">
          <span>
            {type === "question"
              ? adminUiText(tr, "Answer / Notes")
              : adminUiText(tr, "Notes")}
          </span>
          <p>{entry.context_note}</p>
        </div>
      )}

      <div className="journal-entry-actions">
        <EditButton onClick={onEdit} />
        <DeleteButton table="journal_entries" id={entry.id} label="Journal entry" />
      </div>
    </article>
  );
}

function JournalEntryDialog({
  title,
  students,
  selectedStudent,
  entryType,
  entry,
  initialWeek,
  onClose,
}: {
  title: string;
  students: StudentRow[];
  selectedStudent?: StudentRow;
  entryType: JournalEntry["entry_type"];
  entry?: JournalEntry;
  initialWeek?: number;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [studentId, setStudentId] = useState(entry?.student_id ?? selectedStudent?.id ?? "");
  const [weekNumber, setWeekNumber] = useState(String(entry?.week_number ?? initialWeek ?? 1));
  const [topic, setTopic] = useState(entry?.topic ?? "");
  const [content, setContent] = useState(entry?.content ?? "");
  const [phrases, setPhrases] = useState<string[]>(() => {
    const lines = phraseLines(entry?.content);
    return lines.length ? lines : [""];
  });
  const [contextNote, setContextNote] = useState(entry?.context_note ?? "");

  const mutation = useMutation({
    mutationFn: async () => {
      if (!supabase) throw new Error("The workspace is not connected yet.");
      const finalContent =
        entryType === "phrase_bank"
          ? phrases
              .map((phrase) => phrase.trim())
              .filter(Boolean)
              .join("\n")
          : content.trim();
      const payload = {
        student_id: studentId,
        entry_type: entryType,
        week_number: Number(weekNumber) || null,
        topic: topic.trim() || null,
        content: finalContent,
        context_note: contextNote.trim() || null,
      };
      const result = entry
        ? await supabase.from("journal_entries").update(payload).eq("id", entry.id)
        : await supabase.from("journal_entries").insert(payload);
      if (result.error) throw result.error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
      onClose();
    },
  });

  const topicLabel =
    entryType === "phrase_bank"
      ? adminUiText(tr, "Vocabulary Word")
      : entryType === "question"
        ? adminUiText(tr, "Question")
        : adminUiText(tr, "Session note title");

  return (
    <div className="admin-modal-backdrop" role="presentation">
      <div className="admin-modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="flex items-start justify-between gap-4 border-b border-white/7 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold">{title}</h2>
            <p className="mt-1 text-xs leading-5 text-white/38">
              {adminUiText(
                tr,
                "Organize the client journal by week. Phrase entries can include as many phrases as needed.",
              )}
            </p>
          </div>
          <button type="button" onClick={onClose} className="admin-outline-btn">
            {adminUiText(tr, "Close")}
          </button>
        </div>

        <form
          className="journal-form"
          onSubmit={(event) => {
            event.preventDefault();
            mutation.mutate();
          }}
          >
          <label>
            <span className="admin-field-label">{adminUiText(tr, "Client")}</span>
            <select
              value={studentId}
              onChange={(event) => setStudentId(event.target.value)}
              required
              className="admin-select"
            >
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {nameFor(student.profile)}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="admin-field-label">{adminUiText(tr, "Week # / Color for title")}</span>
            <div className="journal-week-input">
              <input
                value={weekNumber}
                onChange={(event) => setWeekNumber(event.target.value)}
                type="number"
                min="1"
                required
                className="admin-input"
              />
              <span style={{ background: journalWeekColor(Number(weekNumber)) }} />
            </div>
          </label>

          <label>
            <span className="admin-field-label">{topicLabel}</span>
            <input
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              required={entryType !== "session_note"}
              className="admin-input"
            />
          </label>

          {entryType === "phrase_bank" ? (
            <div className="journal-phrase-fields">
              <span className="admin-field-label">{adminUiText(tr, "Phrases")}</span>
              {phrases.map((phrase, index) => (
                <label key={index}>
                  <span>
                    {adminUiText(tr, "Phrase #")}
                    {index + 1}
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
                    className="admin-input"
                  />
                </label>
              ))}
              <button
                type="button"
                onClick={() => setPhrases((current) => [...current, ""])}
                className="admin-outline-btn"
              >
                <Plus className="mr-1.5 inline h-3.5 w-3.5" />
                {adminUiText(tr, "Add Phrase")}
              </button>
            </div>
          ) : (
            <label>
              <span className="admin-field-label">
                {entryType === "question"
                  ? adminUiText(tr, "Answer")
                  : adminUiText(tr, "Rich-text notes")}
              </span>
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                required
                rows={7}
                placeholder={adminUiText(
                  tr,
                  "Use new lines, bullets, **bold**, and *italic* notes.",
                )}
                className="admin-textarea"
              />
            </label>
          )}

          <label>
            <span className="admin-field-label">{adminUiText(tr, "Notes")}</span>
            <textarea
              value={contextNote}
              onChange={(event) => setContextNote(event.target.value)}
              rows={4}
              className="admin-textarea"
            />
          </label>

          {mutation.error instanceof Error && (
            <div className="rounded-lg border border-red-300/20 bg-red-400/7 px-4 py-3 text-sm text-red-200">
              {mutation.error.message}
            </div>
          )}

          <button type="submit" disabled={mutation.isPending} className="admin-gold-btn w-full">
            {mutation.isPending
              ? adminUiText(tr, "Saving...")
              : entry
                ? adminUiText(tr, "Save changes")
                : adminUiText(tr, "Create")}
          </button>
        </form>
      </div>
    </div>
  );
}

function LegacyJournalsScreen({
  journals,
  students,
  selectedStudent,
}: {
  journals: JournalEntry[];
  students: StudentRow[];
  selectedStudent?: StudentRow;
}) {
  const tr = useTranslate();
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
          selectedStudent
            ? nameFor(selectedStudent.profile)
            : `${students.length} ${adminUiText(tr, "Students").toLowerCase()}`
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
                  {journalTypeLabel(item)}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setAdding(true)} className="admin-gold-btn">
              <Plus className="mr-1.5 inline h-3.5 w-3.5" />
              {adminUiText(tr, "Add entry")}
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
  const tr = useTranslate();
  const currentStudent = selectedStudent ?? students[0];
  const [adding, setAdding] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [editingGoal, setEditingGoal] = useState(false);
  const rows = milestones
    .filter((item) => item.student_id === currentStudent?.id)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const done = rows.filter((item) => milestoneIsComplete(item, currentStudent)).length;
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
        subtitle="Student fluency journey · milestones complete automatically as weeks pass"
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
              {adminUiText(tr, "New milestone")}
            </button>
          </>
        }
      />
      <div className="admin-content">
        <section className="milestone-journey">
          <div className="text-center">
            <div className="inline-flex rounded-full border border-sena-gold/35 bg-sena-gold/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-sena-gold">
              {adminUiText(tr, "Fluency Milestones")}
            </div>
            <h2 className="mt-4 text-3xl font-bold">
              {currentStudent ? nameFor(currentStudent.profile) : adminUiText(tr, "No student")}
            </h2>
            <p className="mt-2 text-sm text-sena-gold">
              {currentStudent?.goal?.fluency_goal ?? adminUiText(tr, "No fluency goal set.")}
            </p>
            {currentStudent && (
              <button
                type="button"
                onClick={() => setEditingGoal(true)}
                className="milestone-goal-edit"
              >
                {currentStudent.goal
                  ? adminUiText(tr, "Edit fluency goal")
                  : adminUiText(tr, "Create fluency goal")}
              </button>
            )}
            <div className="mx-auto mt-6 flex max-w-sm items-center gap-3 rounded-full border border-white/8 bg-white/5 px-5 py-3">
              <span className="text-xs text-white/50">{adminUiText(tr, "Journey progress")}</span>
              <div className="h-1 flex-1 rounded-full bg-white/8">
                <div className="h-full rounded-full bg-sena-gold" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs font-semibold text-sena-gold">{pct}%</span>
            </div>
          </div>

          <div className="relative mx-auto mt-10 max-w-3xl">
            <div className="milestone-gold-line" />
            {rows.map((milestone, index) => (
              <MilestoneTimelineCard
                key={milestone.id}
                milestone={milestone}
                currentStudent={currentStudent}
                side={index % 2 === 0 ? "left" : "right"}
                onEdit={() => setEditingMilestone(milestone)}
              />
            ))}
            {currentStudent && rows.length > 0 && (
              <MilestoneFinishLineCard currentStudent={currentStudent} pct={pct} />
            )}
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
      {editingGoal && currentStudent && (
        <StudentGoalDialog student={currentStudent} onClose={() => setEditingGoal(false)} />
      )}
    </>
  );
}

function milestoneIsComplete(milestone: Milestone, student?: StudentRow) {
  if (milestone.completed) return true;
  if (milestone.target_week && student) return student.current_week > milestone.target_week;
  if (milestone.target_date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(milestone.target_date);
    target.setHours(0, 0, 0, 0);
    return target < today;
  }
  return milestone.completed;
}

function StudentGoalDialog({ student, onClose }: { student: StudentRow; onClose: () => void }) {
  const tr = useTranslate();
  const queryClient = useQueryClient();
  const [fluencyGoal, setFluencyGoal] = useState(student.goal?.fluency_goal ?? "");
  const [dayOneQuestion, setDayOneQuestion] = useState(student.goal?.day_one_question ?? "");
  const mutation = useMutation({
    mutationFn: async () => {
      if (!supabase) throw new Error("The workspace is not connected yet.");
      const payload = {
        student_id: student.id,
        fluency_goal: fluencyGoal,
        day_one_question: dayOneQuestion || null,
      };
      const result = await supabase.from("student_goals").upsert(payload, {
        onConflict: "student_id",
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
      <div
        className="admin-modal"
        role="dialog"
        aria-modal="true"
        aria-label={tr("Fluency goal", "Meta de fluidez")}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/7 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold">{tr("Fluency goal", "Meta de fluidez")}</h2>
            <p className="mt-1 text-xs leading-5 text-white/38">
              {tr(
                "This creates the gold goal shown at the top of the milestone journey.",
                "Esto crea la meta dorada que se muestra al inicio del recorrido de hitos.",
              )}
            </p>
          </div>
          <button type="button" onClick={onClose} className="admin-outline-btn">
            {adminUiText(tr, "Close")}
          </button>
        </div>
        <form
          className="space-y-4 p-5"
          onSubmit={(event) => {
            event.preventDefault();
            mutation.mutate();
          }}
        >
          <label className="block">
            <span className="admin-field-label">{tr("Fluency goal", "Meta de fluidez")}</span>
            <textarea
              value={fluencyGoal}
              onChange={(event) => setFluencyGoal(event.target.value)}
              className="admin-textarea"
              rows={4}
              required
              placeholder={tr(
                "Example: Lead client calls confidently without translating first.",
                "Ejemplo: Liderar llamadas con clientes con confianza sin traducir primero.",
              )}
            />
          </label>
          <label className="block">
            <span className="admin-field-label">{tr("Day one question", "Pregunta del dia uno")}</span>
            <textarea
              value={dayOneQuestion}
              onChange={(event) => setDayOneQuestion(event.target.value)}
              className="admin-textarea"
              rows={3}
              placeholder={tr(
                "Optional intake question or starting reflection.",
                "Pregunta inicial o reflexion de inicio opcional.",
              )}
            />
          </label>
          <button type="submit" disabled={mutation.isPending} className="admin-gold-btn w-full">
            {mutation.isPending
              ? adminUiText(tr, "Saving...")
              : tr("Save fluency goal", "Guardar meta de fluidez")}
          </button>
          {mutation.error instanceof Error && (
            <p className="text-xs text-red-300">{mutation.error.message}</p>
          )}
        </form>
      </div>
    </div>
  );
}

function MilestoneTimelineCard({
  milestone,
  currentStudent,
  side,
  onEdit,
}: {
  milestone: Milestone;
  currentStudent?: StudentRow;
  side: "left" | "right";
  onEdit: () => void;
}) {
  const tr = useTranslate();
  const complete = milestoneIsComplete(milestone, currentStudent);

  return (
    <div className={`milestone-timeline-row ${side}`}>
      <article className={`milestone-card ${complete ? "done" : ""}`}>
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sena-gold">
          {milestone.target_week
            ? `${adminUiText(tr, "After week")} ${milestone.target_week}`
            : adminUiText(tr, "Milestone")}{" "}
          ·{" "}
          {formatDate(milestone.target_date)}
        </div>
        <h3 className="mt-2 text-sm font-bold">{milestone.title}</h3>
        <p className="mt-2 text-xs leading-6 text-white/62">
          {milestone.description ?? adminUiText(tr, "No description added.")}
        </p>
        {complete && (
          <div className="mt-3 inline-flex items-center gap-1.5 border-t border-sena-gold/15 pt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-sena-gold">
            <Check className="h-3 w-3" />
            {adminUiText(tr, "Auto achieved")}
          </div>
        )}
        <div className="mt-3 flex justify-end gap-2">
          <MilestoneCompletionButton milestone={milestone} complete={complete} />
          <EditButton onClick={onEdit} />
          <DeleteButton table="milestones" id={milestone.id} label="Milestone" />
        </div>
      </article>
      <span className={`milestone-node ${complete ? "done" : ""}`} />
      <span className="milestone-spacer" />
    </div>
  );
}

function MilestoneCompletionButton({
  milestone,
  complete,
}: {
  milestone: Milestone;
  complete: boolean;
}) {
  const tr = useTranslate();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async () => {
      if (!supabase) throw new Error("The workspace is not connected yet.");
      const markComplete = !milestone.completed;
      const { error } = await supabase
        .from("milestones")
        .update({
          completed: markComplete,
          completed_at: markComplete ? new Date().toISOString() : null,
        })
        .eq("id", milestone.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] }),
  });
  const automaticOnly = complete && !milestone.completed;

  return (
    <button
      type="button"
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
      className={milestone.completed ? "admin-outline-btn" : "admin-gold-btn"}
      title={
        automaticOnly
          ? adminUiText(
              tr,
              "This milestone is already complete by week/date. Click to save it as manually done.",
            )
          : undefined
      }
    >
      {mutation.isPending
        ? adminUiText(tr, "Saving...")
        : milestone.completed
          ? adminUiText(tr, "Undo done")
          : complete
            ? adminUiText(tr, "Save as done")
            : adminUiText(tr, "Mark done")}
    </button>
  );
}

function MilestoneFinishLineCard({
  currentStudent,
  pct,
}: {
  currentStudent: StudentRow;
  pct: number;
}) {
  const tr = useTranslate();
  const complete = pct >= 100;

  return (
    <div className="milestone-timeline-row finish right">
      <article className={`milestone-card finish ${complete ? "done" : ""}`}>
        <div className="milestone-finish-stars" aria-hidden="true">
          <span>★</span>
          <span>★</span>
          <span>★</span>
        </div>
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sena-gold">
          {adminUiText(tr, "Finish line")}
        </div>
        <h3 className="mt-2 text-sm font-bold">{adminUiText(tr, "True Fluency Goal")}</h3>
        <p className="mt-2 text-xs leading-6 text-white/62">
          {currentStudent.goal?.fluency_goal ??
            adminUiText(tr, "Add the student's fluency goal to define the finish line.")}
        </p>
        <div className="mt-3 inline-flex items-center gap-1.5 border-t border-sena-gold/15 pt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-sena-gold">
          <Check className="h-3 w-3" />
          {complete ? adminUiText(tr, "Reached") : adminUiText(tr, "Final destination")}
        </div>
      </article>
      <span className={`milestone-node finish ${complete ? "done" : ""}`} />
      <span className="milestone-spacer" />
    </div>
  );
}

function CoursesScreen({ courses }: { courses: Course[] }) {
  const tr = useTranslate();
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
            {adminUiText(tr, "Add course")}
          </button>
        }
      />
      <div className="admin-content">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <article key={course.id} className="admin-card p-5">
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sena-gold">
                {course.category ? adminUiText(tr, course.category) : adminUiText(tr, "Course")}
              </div>
              <h2 className="mt-3 text-base font-semibold">{course.title}</h2>
              <p className="mt-2 min-h-12 text-sm leading-6 text-white/55">
                {course.description ?? adminUiText(tr, "No description yet.")}
              </p>
              <div className="mt-4 flex items-center justify-between text-xs text-white/35">
                <span>
                  {course.avg_lesson_minutes
                    ? `${course.avg_lesson_minutes} ${adminUiText(tr, "min avg")}`
                    : adminUiText(tr, "No length")}
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

function justWatchUrl(title: string) {
  return `https://www.justwatch.com/us/search?q=${encodeURIComponent(title)}`;
}

function spotifySearchUrl(query: string) {
  return `https://open.spotify.com/search/${encodeURIComponent(query)}`;
}

const referenceContentItems: ContentItem[] = [
  {
    id: "ref-show-friends",
    title: "Friends",
    author_or_host: "TV Show",
    media_type: "show",
    cefr_level: "A2-B1",
    external_url: justWatchUrl("Friends"),
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
    external_url: justWatchUrl("The Office"),
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
    external_url: justWatchUrl("Modern Family"),
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
    external_url: justWatchUrl("Ted Lasso"),
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
    external_url: justWatchUrl("Brooklyn Nine-Nine"),
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
    external_url: justWatchUrl("Emily in Paris"),
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
    external_url: justWatchUrl("Stranger Things"),
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
    external_url: justWatchUrl("The Crown"),
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
    external_url: justWatchUrl("Forrest Gump"),
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
    external_url: justWatchUrl("The Pursuit of Happyness"),
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
    external_url: justWatchUrl("The Devil Wears Prada"),
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
    external_url: justWatchUrl("Inside Out"),
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
    external_url: justWatchUrl("La La Land"),
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
    external_url: justWatchUrl("Little Women"),
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
    external_url: justWatchUrl("The Social Network"),
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
    external_url: justWatchUrl("The King's Speech"),
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
    external_url: spotifySearchUrl("folklore Taylor Swift"),
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
    external_url: spotifySearchUrl("Divide Ed Sheeran"),
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
    external_url: spotifySearchUrl("Happier Than Ever Billie Eilish"),
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
    external_url: spotifySearchUrl("24K Magic Bruno Mars"),
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
    external_url: spotifySearchUrl("30 Adele"),
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
    external_url: spotifySearchUrl("A Head Full of Dreams Coldplay"),
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
    external_url: spotifySearchUrl("Amidst the Chaos Sara Bareilles"),
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
    external_url: "https://www.nytimes.com/column/the-daily",
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
    external_url: "https://www.npr.org/series/490248027/how-i-built-this",
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
    external_url: "https://www.ted.com/podcasts/ted-talks-daily",
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
    external_url: "https://www.thisamericanlife.org/",
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
    external_url: "https://www.allearsenglish.com/episodes/",
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
    external_url: "https://www.bbc.co.uk/learningenglish/english/features/6-minute-english",
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
    external_url: "https://teacherluke.co.uk/",
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
    external_url: "https://www.espressoenglish.net/podcast/",
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

const playlistSelections: Record<string, string[]> = {
  car: ["The Daily", "6 Minute English", "TED Talks Daily", "Espresso English", "News in Levels"],
  work: [
    "How I Built This",
    "Atomic Habits",
    "The Social Network",
    "The Atlantic",
    "TED Talks Daily",
    "NPR",
  ],
  moon: [
    "Friends",
    "Modern Family",
    "Emily in Paris",
    "Little Women",
    "All Ears English",
    "folklore",
  ],
  laugh: ["The Office", "Brooklyn Nine-Nine", "Ted Lasso", "Friends", "Luke's English Podcast"],
  fire: [
    "This American Life",
    "The Atlantic",
    "The Social Network",
    "The King's Speech",
    "Educated",
    "TED Talks Daily",
  ],
};

function playlistMatches(item: ContentItem, target: string) {
  const haystack = [
    item.title,
    item.author_or_host,
    item.genre_tag,
    item.playlist_tag,
    item.media_type,
  ]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase());

  return haystack.includes(target.toLowerCase());
}

function playlistItemsFor(playlist: ContentItem, items: ContentItem[]) {
  const playlistKey = playlist.genre_tag ?? playlist.playlist_tag ?? playlist.id;
  const selections = playlistSelections[playlistKey] ?? [];
  const selectionOrder = new Map(selections.map((title, index) => [title.toLowerCase(), index]));

  return items
    .filter((item) => item.media_type !== "playlist")
    .filter((item) => {
      if (item.playlist_tag === playlistKey || item.genre_tag === playlistKey) return true;
      return selections.some((target) => playlistMatches(item, target));
    })
    .sort((a, b) => {
      const aIndex =
        selectionOrder.get(a.title.toLowerCase()) ??
        selectionOrder.get((a.author_or_host ?? "").toLowerCase()) ??
        999 + (a.sort_order ?? 0);
      const bIndex =
        selectionOrder.get(b.title.toLowerCase()) ??
        selectionOrder.get((b.author_or_host ?? "").toLowerCase()) ??
        999 + (b.sort_order ?? 0);
      return aIndex - bIndex;
    })
    .slice(0, 8);
}

function ContentLibraryScreen({ content }: { content: ContentItem[] }) {
  const tr = useTranslate();
  const [adding, setAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);
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
  const activePlaylist = playlists.find((item) => item.id === activePlaylistId) ?? null;
  const activePlaylistItems = activePlaylist
    ? playlistItemsFor(activePlaylist, libraryContent)
    : [];
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
    {
      name: "thumbnail_url",
      label: "Thumbnail",
      type: "file",
      accept: "image/*",
      storageBucket: "content-library",
      storageFolder: "thumbnails",
    },
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
            {adminUiText(tr, "Add content")}
          </button>
        }
      />
      <div className="admin-content">
        <div className="cl-wrap">
          <div className="cl-nav">
            <div className="cl-nav-title">
              Fluent with Sena <span>{adminUiText(tr, "Library")}</span>
            </div>
            <div className="cl-dot" />
          </div>
          <div className="cl-main">
            <div className="cl-hero">
              <h1>{adminUiText(tr, "English You Enjoy")}</h1>
              <p>
                {adminUiText(
                  tr,
                  "Keep what you love and incorporate it into your daily routine - your commute, chores, or evenings. English you enjoy never feels like homework.",
                )}
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
                    <div className="cl-mini-head">{adminUiText(tr, "Books")}</div>
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
                    <div className="cl-mini-head cl-mini-head-spaced">
                      {adminUiText(tr, "Reading Sources")}
                    </div>
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
                      active={item.id === activePlaylistId}
                      onOpen={() =>
                        setActivePlaylistId((current) => (current === item.id ? null : item.id))
                      }
                      onEdit={() => setEditingItem(item)}
                    />
                  ))}
                </div>
                {activePlaylist && (
                  <div className="cl-playlist-detail">
                    <div className="cl-playlist-detail-head">
                      <div>
                        <span>{adminUiText(tr, "Curated playlist")}</span>
                        <h3>{activePlaylist.title}</h3>
                        <p>{activePlaylist.description}</p>
                      </div>
                      <button
                        type="button"
                        className="admin-ghost-btn"
                        onClick={() => setActivePlaylistId(null)}
                      >
                        {adminUiText(tr, "Close")}
                      </button>
                    </div>
                    {activePlaylistItems.length ? (
                      <div className="cl-playlist-items">
                        {activePlaylistItems.map((item) => (
                          <a
                            key={item.id}
                            href={contentHref(item)}
                            target="_blank"
                            rel="noreferrer"
                            className="cl-playlist-item"
                          >
                            <span>
                              {item.duration_label ??
                                adminUiText(tr, item.media_type.replace("_", " "))}
                            </span>
                            <strong>{item.title}</strong>
                            <small>
                              {item.author_or_host ??
                                item.genre_tag ??
                                item.cefr_level ??
                                adminUiText(tr, "Open")}
                            </small>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <div className="cl-empty">
                        {adminUiText(
                          tr,
                          "No content is tagged for this playlist yet. Add items with the same playlist tag to build it.",
                        )}
                      </div>
                    )}
                  </div>
                )}
              </ContentSection>
            </div>
            <div className="cl-footer">
              <p>
                {adminUiText(
                  tr,
                  "All content links to its original source. Click any card to start watching, listening, or reading.",
                )}
              </p>
              <p>{adminUiText(tr, "Property of Fluent with Sena LLC. All Rights Reserved.")}</p>
            </div>
          </div>
        </div>
        <div className="admin-grid-table" style={{ display: "none" }}>
          <div className="admin-table-head grid-cols-[1.4fr_.7fr_.6fr_.8fr_.5fr_.5fr]">
            <span>{adminUiText(tr, "Title")}</span>
            <span>{adminUiText(tr, "Type")}</span>
            <span>{adminUiText(tr, "Level")}</span>
            <span>{adminUiText(tr, "Genre")}</span>
            <span>{adminUiText(tr, "Status")}</span>
            <span>{adminUiText(tr, "Actions")}</span>
          </div>
          {content.map((item) => (
            <div
              key={item.id}
              className="admin-table-row grid-cols-[1.4fr_.7fr_.6fr_.8fr_.5fr_.5fr]"
            >
              <span>
                <span className="block text-sm font-medium">{item.title}</span>
                <span className="block text-xs text-white/32">
                  {item.author_or_host ? adminUiText(tr, item.author_or_host) : adminUiText(tr, "No author")}
                </span>
              </span>
              <span>{adminUiText(tr, item.media_type.replace("_", " "))}</span>
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
  const tr = useTranslate();
  return (
    <section>
      <div className="cl-sec-head">{adminUiText(tr, title)}</div>
      {isEmpty ? <div className="cl-empty">{adminUiText(tr, emptyText)}</div> : children}
    </section>
  );
}

function ContentShelf({ label, children }: { label: string; children: ReactNode }) {
  const tr = useTranslate();
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
        aria-label={`${adminUiText(tr, "Scroll")} ${adminUiText(tr, label)} ${adminUiText(tr, "left")}`}
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
        aria-label={`${adminUiText(tr, "Scroll")} ${adminUiText(tr, label)} ${adminUiText(tr, "right")}`}
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
  const tr = useTranslate();
  return (
    <div className={contentCardShellClass(item)}>
      <a href={contentHref(item)} target="_blank" rel="noreferrer" className="cl-card-v">
        <div className="cl-img">
          <img src={contentImage(item, "poster")} alt={item.title} />
        </div>
        <div className="cl-level">{item.cefr_level ?? adminUiText(tr, "All")}</div>
        <div className="cl-card-title">{item.title}</div>
        <div className="cl-card-sub">
          {item.author_or_host ? adminUiText(tr, item.author_or_host) : adminUiText(tr, fallbackKind)}
        </div>
      </a>
      <CardAdminActions item={item} onEdit={onEdit} />
    </div>
  );
}

function LibrarySquareCard({ item, onEdit }: { item: ContentItem; onEdit: () => void }) {
  const tr = useTranslate();
  return (
    <div className={contentCardShellClass(item)}>
      <a href={contentHref(item)} target="_blank" rel="noreferrer" className="cl-card-sq">
        <div className="cl-img-sq">
          <img src={contentImage(item, "square")} alt={item.title} />
        </div>
        <div className="cl-card-title">{item.title}</div>
        <div className="cl-card-sub">
          {item.author_or_host ? adminUiText(tr, item.author_or_host) : adminUiText(tr, "Music")}
        </div>
      </a>
      <CardAdminActions item={item} onEdit={onEdit} />
    </div>
  );
}

function LibraryPodcastCard({ item, onEdit }: { item: ContentItem; onEdit: () => void }) {
  const tr = useTranslate();
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
        <div className="cl-pod-desc">
          {item.description ?? adminUiText(tr, "Podcast immersion resource.")}
        </div>
        <span className="cl-pod-tag">{item.genre_tag ?? adminUiText(tr, "Audio")}</span>
      </a>
      <CardAdminActions item={item} onEdit={onEdit} />
    </div>
  );
}

function LibraryBookCard({ item, onEdit }: { item: ContentItem; onEdit: () => void }) {
  const tr = useTranslate();
  return (
    <div className={contentCardShellClass(item)}>
      <a href={contentHref(item)} target="_blank" rel="noreferrer" className="cl-book-card">
        <div className="cl-book-cover">
          <img src={contentImage(item, "book")} alt={item.title} />
        </div>
        <div className="cl-level">{item.cefr_level ?? adminUiText(tr, "All")}</div>
        <div className="cl-book-title">{item.title}</div>
        <div className="cl-card-sub">
          {item.author_or_host ? adminUiText(tr, item.author_or_host) : adminUiText(tr, "Book")}
        </div>
      </a>
      <CardAdminActions item={item} onEdit={onEdit} />
    </div>
  );
}

function LibrarySourceCard({ item, onEdit }: { item: ContentItem; onEdit: () => void }) {
  const tr = useTranslate();
  return (
    <div className={contentCardShellClass(item)}>
      <a href={contentHref(item)} target="_blank" rel="noreferrer" className="cl-src-card">
        <div className="cl-src-label">
          {item.author_or_host ? adminUiText(tr, item.author_or_host) : adminUiText(tr, "Source")}
        </div>
        <div className="cl-src-title">{item.title}</div>
        <div className="cl-src-desc">
          {item.description ?? item.genre_tag ?? adminUiText(tr, "Reading immersion.")}
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

function LibraryPlaylistCard({
  item,
  active,
  onOpen,
  onEdit,
}: {
  item: ContentItem;
  active: boolean;
  onOpen: () => void;
  onEdit: () => void;
}) {
  const tr = useTranslate();
  return (
    <div className={contentCardShellClass(item)}>
      <button type="button" className={`cl-pl-card${active ? " active" : ""}`} onClick={onOpen}>
        <div className="cl-pl-icon">{playlistNode(item.genre_tag)}</div>
        <div className="cl-pl-title">{item.title}</div>
        <div className="cl-pl-desc">
          {item.description ??
            tr("Curated resources for focused practice.", "Recursos curados para una practica enfocada.")}
        </div>
        <div className="cl-pl-count">{item.duration_label ?? adminUiText(tr, "Open playlist ->")}</div>
      </button>
      <CardAdminActions item={item} onEdit={onEdit} />
    </div>
  );
}

type ObjectiveBuilderItem = {
  id?: string;
  text: string;
};

type ObjectiveBuilderFocus = {
  id?: string;
  focusArea: number;
  title: string;
  context: string;
  items: ObjectiveBuilderItem[];
};

function formatMonthDay(value: Date) {
  return new Intl.DateTimeFormat(appLanguageLocale(), { month: "short", day: "numeric" }).format(
    value,
  );
}

function weekLabelForStudent(student: StudentRow | undefined, weekNumber: number) {
  if (!student?.start_date) return `${translateAdminStatic("Week")} ${weekNumber}`;
  const start = new Date(student.start_date);
  start.setDate(start.getDate() + (weekNumber - 1) * 7);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return `${translateAdminStatic("Week")} ${weekNumber} (${formatMonthDay(start)} - ${formatMonthDay(end)})`;
}

function defaultCheckInContext(checkIn?: CheckIn | null) {
  if (!checkIn) {
    return translateAdminStatic(
      "Use the latest check-in to choose one specific real-world speaking problem for this week.",
    );
  }

  const parts = [
    checkIn.biggest_struggle
      ? `${translateAdminStatic("Struggle")}: ${checkIn.biggest_struggle}`
      : null,
    checkIn.win_of_week ? `${translateAdminStatic("Win")}: ${checkIn.win_of_week}` : null,
    checkIn.mood
      ? `${translateAdminStatic("Mood")}: ${checkIn.mood}`
      : checkIn.mood_emoji
        ? `${translateAdminStatic("Mood")}: ${checkIn.mood_emoji}`
        : null,
    checkIn.confidence_score
      ? `${translateAdminStatic("Confidence")}: ${checkIn.confidence_score}/10`
      : null,
  ].filter(Boolean);

  return (
    parts.join(" · ") ||
    translateCurrent("No detailed check-in context yet.", "Aun no hay contexto detallado del check-in.")
  );
}

function emptyFocusArea(focusArea: number): ObjectiveBuilderFocus {
  return {
    focusArea,
    title: "",
    context: "",
    items: [{ text: "" }],
  };
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
  const tr = useTranslate();
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
            ? `${nameFor(selectedStudent.profile)} · ${adminUiText(tr, "weekly focus areas")}`
            : `${students.length} ${adminUiText(tr, "Students").toLowerCase()}`
        }
        action={
          <button type="button" onClick={() => setAdding(true)} className="admin-gold-btn">
            <Plus className="mr-1.5 inline h-3.5 w-3.5" />
            {adminUiText(tr, "Add objective")}
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
                    <div className="text-xs text-sena-gold">
                      {adminUiText(tr, "Focus area")} {objective.focus_area}
                    </div>
                    <h2 className="mt-1 text-base font-semibold">{objective.focus_title}</h2>
                    <p className="mt-1 text-xs text-white/35">
                      {nameFor(student?.profile)} ·{" "}
                      {objective.week_label ??
                        `${adminUiText(tr, "Week")} ${objective.week_number}`}
                    </p>
                  </div>
                  <StatusPill status={objective.sent_at ? "sent" : "draft"} />
                </div>
                <p className="mt-4 text-sm leading-7 text-white/62">
                  {objective.context_for_student ?? adminUiText(tr, "No student context written yet.")}
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

function ObjectivesBuilderScreen({
  objectives,
  objectiveItems,
  checkIns,
  students,
  selectedStudent,
}: {
  objectives: Objective[];
  objectiveItems: ObjectiveItem[];
  checkIns: CheckIn[];
  students: StudentRow[];
  selectedStudent?: StudentRow;
}) {
  const tr = useTranslate();
  const queryClient = useQueryClient();
  const [studentId, setStudentId] = useState(selectedStudent?.id ?? students[0]?.id ?? "");
  const currentStudent = students.find((student) => student.id === studentId) ?? students[0];
  const [weekNumber, setWeekNumber] = useState(currentStudent?.current_week ?? 1);
  const [notice, setNotice] = useState("");
  const [focusAreas, setFocusAreas] = useState<ObjectiveBuilderFocus[]>([emptyFocusArea(1)]);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const skipDraftSaveRef = useRef(false);
  const currentWeekLabel = weekLabelForStudent(currentStudent, weekNumber);
  const draftKey = currentStudent
    ? `fluent-objectives-draft:${currentStudent.id}:${weekNumber}`
    : null;
  const maxWeeks = Math.max(
    currentStudent?.tier?.duration_weeks ?? 16,
    currentStudent?.current_week ?? 1,
    16,
  );
  const latestCheckIn =
    checkIns
      .filter((checkIn) => checkIn.student_id === currentStudent?.id)
      .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())[0] ??
    null;
  const checkInContext = defaultCheckInContext(latestCheckIn);

  useEffect(() => {
    if (selectedStudent?.id) setStudentId(selectedStudent.id);
  }, [selectedStudent?.id]);

  useEffect(() => {
    if (currentStudent?.current_week) setWeekNumber(currentStudent.current_week);
  }, [currentStudent?.id]);

  useEffect(() => {
    if (!currentStudent) return;
    skipDraftSaveRef.current = true;
    const draft =
      draftKey && typeof window !== "undefined" ? window.localStorage.getItem(draftKey) : null;

    if (draft) {
      try {
        const parsed = JSON.parse(draft) as {
          notice?: string;
          focusAreas?: ObjectiveBuilderFocus[];
        };
        setNotice(parsed.notice ?? checkInContext);
        setFocusAreas(parsed.focusAreas?.length ? parsed.focusAreas : [emptyFocusArea(1)]);
        setSavedAt(null);
        return;
      } catch {
        if (draftKey && typeof window !== "undefined") {
          window.localStorage.removeItem(draftKey);
        }
      }
    }

    const existing = objectives
      .filter(
        (objective) =>
          objective.student_id === currentStudent.id && objective.week_number === weekNumber,
      )
      .sort((a, b) => a.focus_area - b.focus_area);

    if (!existing.length) {
      setNotice(checkInContext);
      setFocusAreas([emptyFocusArea(1)]);
      return;
    }

    setNotice(existing[0]?.check_in_context ?? checkInContext);
    setFocusAreas(
      existing.map((objective) => {
        const items = objectiveItems
          .filter((item) => item.objective_id === objective.id)
          .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
          .map((item) => ({ id: item.id, text: item.item_text }));
        return {
          id: objective.id,
          focusArea: objective.focus_area,
          title: objective.focus_title,
          context: objective.context_for_student ?? "",
          items: items.length ? items : [{ text: "" }],
        };
      }),
    );
  }, [currentStudent?.id, weekNumber, objectives, objectiveItems, checkInContext, draftKey]);

  useEffect(() => {
    if (!draftKey || typeof window === "undefined") return;
    if (skipDraftSaveRef.current) {
      skipDraftSaveRef.current = false;
      return;
    }
    window.localStorage.setItem(draftKey, JSON.stringify({ notice, focusAreas }));
  }, [draftKey, notice, focusAreas]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!supabase || !currentStudent) throw new Error("Unable to save objectives right now.");
      const cleanAreas = focusAreas
        .map((area, index) => ({
          ...area,
          focusArea: index + 1,
          title: area.title.trim(),
          context: area.context.trim(),
          items: area.items.map((item) => item.text.trim()).filter(Boolean),
        }))
        .filter((area) => area.title || area.context || area.items.length);

      if (!cleanAreas.length) {
        throw new Error(
          tr(
            "Add at least one objective before saving.",
            "Agrega al menos un objetivo antes de guardar.",
          ),
        );
      }

      const existingForWeek = objectives.filter(
        (objective) =>
          objective.student_id === currentStudent.id && objective.week_number === weekNumber,
      );
      const savedIds: string[] = [];

      for (const area of cleanAreas) {
        let objectiveId = area.id;
        const payload = {
          student_id: currentStudent.id,
          week_number: weekNumber,
          week_label: currentWeekLabel,
          focus_area: area.focusArea,
          focus_title: area.title || `Focus area ${area.focusArea}`,
          context_for_student: area.context || null,
          check_in_context: notice.trim() || null,
          sent_at: new Date().toISOString(),
        };

        if (objectiveId) {
          const { error } = await supabase.from("objectives").update(payload).eq("id", objectiveId);
          if (error) throw error;
        } else {
          const { data, error } = await supabase
            .from("objectives")
            .insert(payload)
            .select("id")
            .single();
          if (error) throw error;
          objectiveId = data.id;
        }

        savedIds.push(objectiveId);
        const { error: deleteItemsError } = await supabase
          .from("objective_items")
          .delete()
          .eq("objective_id", objectiveId);
        if (deleteItemsError) throw deleteItemsError;

        if (area.items.length) {
          const { error: insertItemsError } = await supabase.from("objective_items").insert(
            area.items.map((text, index) => ({
              objective_id: objectiveId,
              item_text: text,
              sort_order: index + 1,
            })),
          );
          if (insertItemsError) throw insertItemsError;
        }
      }

      const removedIds = existingForWeek
        .map((objective) => objective.id)
        .filter((id) => !savedIds.includes(id));
      if (removedIds.length) {
        const { error } = await supabase.from("objectives").delete().in("id", removedIds);
        if (error) throw error;
      }
    },
    onSuccess: async () => {
      if (draftKey && typeof window !== "undefined") {
        window.localStorage.removeItem(draftKey);
      }
      setSavedAt(new Date().toISOString());
      await queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
  });

  const updateFocusArea = (
    index: number,
    updater: (area: ObjectiveBuilderFocus) => ObjectiveBuilderFocus,
  ) => {
    setFocusAreas((areas) =>
      areas.map((area, areaIndex) => (areaIndex === index ? updater(area) : area)),
    );
  };

  const updateObjectiveItem = (areaIndex: number, itemIndex: number, text: string) => {
    updateFocusArea(areaIndex, (area) => ({
      ...area,
      items: area.items.map((item, index) => (index === itemIndex ? { ...item, text } : item)),
    }));
  };

  return (
    <>
      <Topbar
        title="Objectives Builder"
        subtitle="Write and assign weekly objectives to students"
        action={
          <button
            type="button"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || !currentStudent}
            className="admin-gold-btn"
          >
            {saveMutation.isPending ? (
              <Loader2 className="mr-1.5 inline h-3.5 w-3.5 animate-spin" />
            ) : null}
            {adminUiText(tr, "Save & send to student")}
          </button>
        }
      />
      <div className="admin-content">
        <div className="objectives-builder-shell">
          <div className="objectives-builder-card">
            <div className="objectives-section-label">{adminUiText(tr, "Student & week")}</div>
            <div className="objectives-two-col">
              <label>
                <span>{adminUiText(tr, "Student")}</span>
                <select
                  className="admin-select"
                  value={currentStudent?.id ?? ""}
                  onChange={(event) => setStudentId(event.target.value)}
                >
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {nameFor(student.profile)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>{adminUiText(tr, "Week")}</span>
                <select
                  className="admin-select"
                  value={weekNumber}
                  onChange={(event) => setWeekNumber(Number(event.target.value))}
                >
                  {Array.from({ length: maxWeeks }, (_, index) => index + 1).map((week) => (
                    <option key={week} value={week}>
                      {weekLabelForStudent(currentStudent, week)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="objectives-section-label objectives-gap">
              {tr("Focus areas", "Areas de enfoque")}
            </div>
            <div className="objectives-context-box">
              <strong>{adminUiText(tr, "Context from last check-in")}</strong>
              <p>{checkInContext}</p>
            </div>

            {focusAreas.map((area, areaIndex) => (
              <div key={area.id ?? areaIndex} className="objectives-focus-block">
                <label>
                  <span>
                    {adminUiText(tr, "Focus area")} {String(areaIndex + 1).padStart(2, "0")} -{" "}
                    {adminUiText(tr, "Title").toLowerCase()}
                  </span>
                  <input
                    className="admin-input"
                    value={area.title}
                    onChange={(event) =>
                      updateFocusArea(areaIndex, (current) => ({
                        ...current,
                        title: event.target.value,
                      }))
                    }
                    placeholder={adminUiText(tr, "Phone Call Fluency")}
                  />
                </label>
                <label className="objectives-context-label">
                  <span>{adminUiText(tr, "Context for student")}</span>
                  <textarea
                    className="admin-textarea objectives-context-input"
                    value={area.context}
                    onChange={(event) =>
                      updateFocusArea(areaIndex, (current) => ({
                        ...current,
                        context: event.target.value,
                      }))
                    }
                    placeholder={tr(
                      "You're freezing when you miss a word on the phone. This week we're building the reflex to ask for clarification instead of shutting down.",
                      "Te bloqueas cuando no entiendes una palabra por telefono. Esta semana estamos creando el reflejo de pedir aclaracion en lugar de quedarte en silencio.",
                    )}
                  />
                </label>
                <div className="objectives-items-label">{adminUiText(tr, "Objectives")}</div>
                <div className="objectives-items">
                  {area.items.map((item, itemIndex) => (
                    <div key={item.id ?? itemIndex} className="objectives-item-row">
                      <input
                        className="admin-input"
                        value={item.text}
                        onChange={(event) =>
                          updateObjectiveItem(areaIndex, itemIndex, event.target.value)
                        }
                        placeholder={tr(
                          "Practice 'Sorry, could you say that again?' until it's a reflex",
                          "Practica 'Perdon, podrias decir eso otra vez?' hasta que sea un reflejo.",
                        )}
                      />
                      <button
                        type="button"
                        className="objectives-remove-btn"
                        onClick={() =>
                          updateFocusArea(areaIndex, (current) => ({
                            ...current,
                            items:
                              current.items.length > 1
                                ? current.items.filter((_, index) => index !== itemIndex)
                                : [{ text: "" }],
                          }))
                        }
                        aria-label={adminUiText(tr, "Remove objective")}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="objectives-add-objective"
                    onClick={() =>
                      updateFocusArea(areaIndex, (current) => ({
                        ...current,
                        items: [...current.items, { text: "" }],
                      }))
                    }
                  >
                    <span>{adminUiText(tr, "+ Add objective")}</span>
                    <strong>+</strong>
                  </button>
                </div>
                {focusAreas.length > 1 && (
                  <button
                    type="button"
                    className="objectives-remove-focus"
                    onClick={() =>
                      setFocusAreas((areas) => areas.filter((_, index) => index !== areaIndex))
                    }
                  >
                    {adminUiText(tr, "Remove focus area")}
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              className="objectives-add-focus"
              onClick={() => setFocusAreas((areas) => [...areas, emptyFocusArea(areas.length + 1)])}
            >
              {adminUiText(tr, "+ Add focus area")}
            </button>

            <label className="objectives-notice">
              <span>{adminUiText(tr, "One thing to notice")}</span>
              <textarea
                className="admin-textarea objectives-context-input"
                value={notice}
                onChange={(event) => setNotice(event.target.value)}
                placeholder={tr(
                  "Listen to how native speakers handle not understanding something. They never panic. Notice what they say instead.",
                  "Escucha como los hablantes nativos manejan el no entender algo. Nunca entran en panico. Observa que dicen en su lugar.",
                )}
              />
            </label>

            {saveMutation.isError && (
              <div className="admin-error mt-4">
                {saveMutation.error instanceof Error
                  ? saveMutation.error.message
                  : adminUiText(tr, "Unable to save objectives.")}
              </div>
            )}
            {savedAt && !saveMutation.isError && (
              <div className="admin-success mt-4">{adminUiText(tr, "Saved to database.")}</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function ApplicationsScreen({ applications }: { applications: Application[] }) {
  const tr = useTranslate();
  const [addingApplication, setAddingApplication] = useState(false);
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
        title="Applications"
        subtitle="Review coaching applications and mark next steps"
        action={
          <button
            type="button"
            onClick={() => setAddingApplication(true)}
            className="admin-gold-btn"
          >
            <Plus className="mr-1.5 inline h-3.5 w-3.5" />
            {adminUiText(tr, "Add application")}
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
      {addingApplication && (
        <RecordDialog
          title="Add application"
          table="applications"
          fields={applicationFields}
          initialValues={{ status: "pending" }}
          onClose={() => setAddingApplication(false)}
        />
      )}
    </>
  );
}

function SettingsScreen({ adminProfile, tiers }: { adminProfile?: Profile; tiers: ProgramTier[] }) {
  const tr = useTranslate();
  const [editing, setEditing] = useState(false);
  const [addingTier, setAddingTier] = useState(false);
  const [editingTier, setEditingTier] = useState<ProgramTier | null>(null);
  const adminFields: AdminFormField[] = [
    { name: "first_name", label: "First name", required: true },
    { name: "last_name", label: "Last name" },
    { name: "email", label: "Email", required: true },
    {
      name: "timezone",
      label: "Timezone",
      type: "select",
      options: timezoneOptions,
    },
    { name: "phone", label: "Phone" },
    { name: "whatsapp", label: "WhatsApp" },
  ];
  const tierFields: AdminFormField[] = [
    { name: "name", label: "Tier name", required: true },
    { name: "duration_weeks", label: "Duration weeks", type: "number", required: true },
    { name: "sessions_per_week", label: "Sessions per week", type: "number", required: true },
    { name: "price_usd", label: "Price", type: "number" },
    { name: "description", label: "Description", type: "textarea" },
  ];

  return (
    <>
      <Topbar
        title="Settings"
        subtitle="Admin name, contact details, and dashboard preferences"
        action={
          adminProfile ? (
            <button type="button" onClick={() => setEditing(true)} className="admin-gold-btn">
              <Pencil className="mr-1.5 inline h-3.5 w-3.5" />
              {adminUiText(tr, "Edit details")}
            </button>
          ) : undefined
        }
      />
      <div className="admin-content">
        <Panel title="Admin details">
          {adminProfile ? (
            <div className="grid gap-3 text-sm">
              <KeyValue label="Name" value={nameFor(adminProfile, "Sena")} />
              <KeyValue label="Email" value={adminProfile.email} />
              <KeyValue label="Timezone" value={adminProfile.timezone ?? "Not set"} />
              <KeyValue label="Phone" value={adminProfile.phone ?? "Not set"} />
              <KeyValue label="WhatsApp" value={adminProfile.whatsapp ?? "Not set"} />
            </div>
          ) : (
            <EmptyRows text="No admin details found yet." />
          )}
        </Panel>
        <div className="settings-section-spacer">
          <Panel
            title="Program tiers"
            action={
              <button type="button" onClick={() => setAddingTier(true)} className="admin-gold-btn">
                <Plus className="mr-1.5 inline h-3.5 w-3.5" />
                {adminUiText(tr, "Add tier")}
              </button>
            }
          >
            <div className="tier-manager-list">
              {tiers.map((tier) => (
                <article key={tier.id} className="tier-manager-row">
                  <div>
                    <h3>{tier.name}</h3>
                    <p>
                      {tier.duration_weeks} {tr("weeks", "semanas")} · {tier.sessions_per_week}{" "}
                      {tr("sessions/week", "sesiones/semana")}
                      {tier.price_usd ? ` · $${tier.price_usd}` : ""}
                    </p>
                    {tier.description && <small>{tier.description}</small>}
                  </div>
                  <div className="tier-manager-actions">
                    <EditButton onClick={() => setEditingTier(tier)} />
                    <DeleteButton table="program_tiers" id={tier.id} label="Program tier" />
                  </div>
                </article>
              ))}
              {!tiers.length && (
                <EmptyRows text="No program tiers yet. Add one to show it in client dropdowns." />
              )}
            </div>
          </Panel>
        </div>
      </div>
      {editing && adminProfile && (
        <RecordDialog
          title="Edit admin details"
          table="profiles"
          rowId={adminProfile.id}
          fields={adminFields}
          initialValues={adminProfile}
          onClose={() => setEditing(false)}
        />
      )}
      {addingTier && (
        <RecordDialog
          title="Add program tier"
          table="program_tiers"
          fields={tierFields}
          initialValues={{ duration_weeks: 16, sessions_per_week: 4 }}
          onClose={() => setAddingTier(false)}
        />
      )}
      {editingTier && (
        <RecordDialog
          title="Edit program tier"
          table="program_tiers"
          rowId={editingTier.id}
          fields={tierFields}
          initialValues={editingTier}
          onClose={() => setEditingTier(null)}
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
  const tr = useTranslate();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [viewing, setViewing] = useState(false);
  const [localStatus, setLocalStatus] = useState<Application["status"]>(application.status);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    setLocalStatus(application.status);
  }, [application.status]);

  const mutation = useMutation({
    mutationFn: async (status: Application["status"]) => {
      if (!supabase) throw new Error("The workspace is not connected yet.");
      const { error } = await supabase
        .from("applications")
        .update({ status, reviewed_at: new Date().toISOString() })
        .eq("id", application.id);
      if (error) throw error;
    },
    onSuccess: (_, status) => {
      setLocalStatus(status);
      const messages: Record<Application["status"], string> = {
        pending: adminUiText(tr, "Moved back to pending."),
        reviewed: adminUiText(tr, "Marked as reviewed."),
        accepted: adminUiText(
          tr,
          "Marked as eligible for a consult call. No dashboard access was created.",
        ),
        rejected: adminUiText(
          tr,
          "Marked as not a fit. Send the graceful decline email manually.",
        ),
      };
      setStatusMessage(messages[status]);
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
  });

  return (
    <article className="border-b border-white/5 py-4 last:border-0">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold">{application.full_name}</h3>
          <p className="mt-1 text-xs text-white/35">
            {application.email} ·{" "}
            {application.current_role
              ? adminUiText(tr, application.current_role)
              : adminUiText(tr, "No role")}{" "}
            ·{" "}
            {formatDate(application.created_at)}
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/58">
            {application.motivation ?? adminUiText(tr, "No motivation submitted.")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusPill status={localStatus} />
          <button
            className="admin-outline-btn"
            disabled={mutation.isPending || localStatus === "reviewed"}
            onClick={() => mutation.mutate("reviewed")}
          >
            {mutation.isPending && mutation.variables === "reviewed"
              ? adminUiText(tr, "Saving...")
              : adminUiText(tr, "Reviewed")}
          </button>
          <button
            className="admin-gold-btn"
            disabled={mutation.isPending || localStatus === "accepted"}
            onClick={() => mutation.mutate("accepted")}
          >
            {localStatus === "accepted"
              ? adminUiText(tr, "Consult fit")
              : mutation.isPending && mutation.variables === "accepted"
                ? adminUiText(tr, "Saving...")
                : adminUiText(tr, "Accept for consult")}
          </button>
          <button
            className={localStatus === "rejected" ? "admin-outline-btn" : "admin-danger-text-btn"}
            disabled={mutation.isPending || localStatus === "rejected"}
            onClick={() => mutation.mutate("rejected")}
          >
            {localStatus === "rejected"
              ? adminUiText(tr, "Declined")
              : mutation.isPending && mutation.variables === "rejected"
                ? adminUiText(tr, "Saving...")
                : adminUiText(tr, "Decline")}
          </button>
          <button
            type="button"
            className="admin-icon-btn"
            onClick={() => setViewing(true)}
            title={adminUiText(tr, "View full application")}
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <EditButton onClick={() => setEditing(true)} />
          <DeleteButton table="applications" id={application.id} label="Application" />
        </div>
      </div>
      {mutation.error instanceof Error && (
        <p className="mt-2 text-xs text-red-300">{mutation.error.message}</p>
      )}
      {statusMessage && <p className="mt-2 text-xs text-emerald-300">{statusMessage}</p>}
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
      {viewing && (
        <ApplicationDetailDialog application={application} onClose={() => setViewing(false)} />
      )}
    </article>
  );
}

function formatApplicationValue(value: string | null | undefined) {
  if (!value) return translateAdminStatic("Not provided");
  return translateAdminStatic(value.replaceAll("_", " "));
}

function ApplicationDetailDialog({
  application,
  onClose,
}: {
  application: Application;
  onClose: () => void;
}) {
  const tr = useTranslate();
  const details = [
    ["Full name", application.full_name],
    ["Email", application.email],
    ["LinkedIn", application.linkedin_url],
    ["Current role", application.current_role],
    ["Industry", application.industry],
    ["English level", application.english_level],
    ["Primary goal", application.primary_goal],
    ["Preferred start", application.preferred_start],
    ["Weekly hours", application.weekly_hours],
    ["Referral source", application.referral_source],
    ["Submitted", formatDate(application.created_at)],
    ["Status", application.status],
  ];

  return (
    <div className="admin-modal-backdrop" role="presentation">
      <div
        className="admin-modal"
        role="dialog"
        aria-modal="true"
        aria-label={adminUiText(tr, "Application details")}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/5 p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sena-gold">
              {adminUiText(tr, "Application")}
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight">{application.full_name}</h2>
            <p className="mt-1 text-xs text-white/35">{application.email}</p>
          </div>
          <button type="button" className="admin-outline-btn" onClick={onClose}>
            {adminUiText(tr, "Close")}
          </button>
        </div>
        <div className="space-y-6 p-5">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {details.map(([label, value]) => (
              <div key={label} className="rounded-lg border border-white/7 bg-white/[0.03] p-4">
                <div className="admin-field-label">{adminUiText(tr, label)}</div>
                {label === "LinkedIn" && value ? (
                  <a
                    href={String(value).startsWith("http") ? String(value) : `https://${value}`}
                    target="_blank"
                    rel="noreferrer"
                    className="break-words text-sm text-sena-gold underline-offset-4 hover:underline"
                  >
                    {value}
                  </a>
                ) : (
                  <p className="break-words text-sm capitalize text-white/72">
                    {formatApplicationValue(value)}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-white/7 bg-white/[0.03] p-4">
            <div className="admin-field-label">{adminUiText(tr, "Motivation")}</div>
            <p className="whitespace-pre-wrap text-sm leading-7 text-white/72">
              {application.motivation || adminUiText(tr, "Not provided")}
            </p>
          </div>

          <div className="rounded-lg border border-white/7 bg-white/[0.03] p-4">
            <div className="admin-field-label">{adminUiText(tr, "Additional notes")}</div>
            <p className="whitespace-pre-wrap text-sm leading-7 text-white/72">
              {application.additional_notes || adminUiText(tr, "Not provided")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StudentListRow({ student, onSelect }: { student: StudentRow; onSelect?: () => void }) {
  const tr = useTranslate();
  const name = nameFor(student.profile);
  return (
    <button type="button" onClick={onSelect} className="admin-list-row w-full text-left">
      <Avatar name={name} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-medium">{name}</div>
        <div className="truncate text-[10px] text-white/30">
          {student.tier?.name ?? adminUiText(tr, "No tier")} · {adminUiText(tr, "Week")}{" "}
          {student.current_week} · {student.industry ?? adminUiText(tr, "No industry")}
        </div>
      </div>
      <div className="w-10 text-right text-xs font-semibold text-sena-gold">
        {student.confidence_score ?? "—"}
      </div>
      <StatusPill status={student.status} />
    </button>
  );
}

function SessionListRow({ session, students }: { session: LiveSession; students: StudentRow[] }) {
  const tr = useTranslate();
  const student = students.find((item) => item.id === session.student_id);
  return (
    <div className="admin-list-row">
      <div className="w-20 text-xs font-semibold text-sena-gold">
        {formatTime(session.scheduled_at)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px]">{nameFor(student?.profile)}</div>
        <div className="truncate text-[10px] text-white/30">
          {adminUiText(tr, "Week")} {session.week_number} ·{" "}
          {session.focus_topic ?? adminUiText(tr, "Coaching")}
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
    <div className="admin-checkin-row">
      <span className={`admin-checkin-dot ${checkIn.status === "reviewed" ? "read" : ""}`} />
      <div className="admin-checkin-meta">
        <div className="admin-checkin-who">{nameFor(student?.profile)}</div>
        <div className="admin-checkin-preview">
          {compact
            ? checkIn.biggest_struggle || checkIn.win_of_week
            : checkIn.note_for_next || checkIn.win_of_week}
        </div>
      </div>
      <div className="admin-checkin-side">
        <div className="admin-checkin-mood">{moodLabel(checkIn)}</div>
        <div className="admin-checkin-time">{formatDate(checkIn.submitted_at)}</div>
      </div>
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
    <div className="admin-milestone-row">
      <div className="admin-milestone-icon">
        <Check className="h-4 w-4" />
      </div>
      <div className="admin-milestone-meta">
        <div className="admin-milestone-title">{milestone.title}</div>
        <div className="admin-milestone-who">{nameFor(student?.profile)}</div>
      </div>
      <div className="admin-milestone-date">{formatDate(milestone.target_date)}</div>
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
  const tr = useTranslate();
  const normalized = status.toLowerCase();
  const cls =
    normalized.includes("active") ||
    normalized.includes("published") ||
    normalized.includes("accepted")
      ? "bg-sena-green/15 text-sena-green border-sena-green/25"
      : normalized.includes("pending") ||
          normalized.includes("scheduled") ||
          normalized.includes("check-in")
        ? "bg-sena-gold/12 text-sena-gold border-sena-gold/25"
        : normalized.includes("overdue") || normalized.includes("rejected")
          ? "bg-red-400/10 text-red-200 border-red-300/20"
          : normalized.includes("live") || normalized.includes("sent")
            ? "bg-sena-blue/12 text-sena-blue border-sena-blue/25"
            : "bg-white/7 text-white/45 border-white/10";
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-medium capitalize ${cls}`}
    >
      {adminUiText(tr, status.replace(/_/g, " "))}
    </span>
  );
}

function KeyValue({ label, value }: { label: string; value: string }) {
  const tr = useTranslate();
  return (
    <div className="flex justify-between gap-4 border-b border-white/5 py-1.5 last:border-0">
      <span className="text-white/35">{adminUiText(tr, label)}</span>
      <span className="text-right font-medium text-white/78">{adminUiText(tr, value)}</span>
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
  const tr = useTranslate();
  const cls =
    tone === "blue"
      ? "border-sena-blue/20 bg-sena-blue/7 text-sena-blue"
      : tone === "red"
        ? "border-red-400/20 bg-red-400/7 text-red-300"
        : "border-sena-gold/20 bg-sena-gold/7 text-sena-gold";
  return (
    <div className={`mt-3 rounded-lg border p-3 ${cls}`}>
      <div className="text-[10px] font-semibold uppercase tracking-[0.1em]">
        {adminUiText(tr, label)}
      </div>
      <div className="mt-1 text-[13px] leading-6 text-white/70">{adminUiText(tr, text)}</div>
    </div>
  );
}

function EmptyRows({ text }: { text: string }) {
  const tr = useTranslate();
  return (
    <div className="rounded-lg border border-dashed border-white/10 p-6 text-center text-sm text-white/35">
      {adminUiText(tr, text)}
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
  const tr = useTranslate();
  return (
    <div className="flex min-h-[70vh] items-center justify-center p-8">
      <div className="max-w-lg rounded-xl border border-white/8 bg-[#0e1825] p-8 text-center">
        <Icon className="mx-auto h-10 w-10 text-sena-gold" />
        <h1 className="mt-4 text-xl font-semibold">{adminUiText(tr, title)}</h1>
        <p className="mt-3 text-sm leading-7 text-white/50">{adminUiText(tr, body)}</p>
      </div>
    </div>
  );
}
