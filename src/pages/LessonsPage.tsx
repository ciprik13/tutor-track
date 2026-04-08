import { useState } from "react";
import {
  useLessons,
  useDeleteLesson,
  useTogglePayment,
} from "@/queries/useLessons";
import { useStudents } from "@/queries/useStudents";
import LessonModal from "@/components/lessons/LessonModal";
import type { Lesson } from "@/types";
import MonthPicker from "@/components/ui/MonthPicker";
import CalendarImport from "@/components/calendar/CalendarImport";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";

export default function LessonsPage() {
  const [studentFilter, setStudentFilter] = useState<number | undefined>();
  const [monthFilter, setMonthFilter] = useState(
    new Date().toISOString().slice(0, 7),
  );
  const [paymentFilter, setPaymentFilter] = useState<
    "paid" | "unpaid" | undefined
  >();
  const [modalOpen, setModalOpen] = useState(false);
  const [editLesson, setEditLesson] = useState<Lesson | null>(null);
  const [calendarImport, setCalendarImport] = useState(false);
  const googleConnected = useSelector(
    (state: RootState) => state.profile.googleCalendarConnected,
  );

  const { data: lessons = [], isLoading } = useLessons({
    studentId: studentFilter,
    month: monthFilter || undefined,
    paymentStatus: paymentFilter,
  });

  const { data: students = [] } = useStudents();
  const deleteLesson = useDeleteLesson();
  const togglePayment = useTogglePayment();

  const handleEdit = (lesson: Lesson) => {
    setEditLesson(lesson);
    setModalOpen(true);
  };
  const handleAdd = () => {
    setEditLesson(null);
    setModalOpen(true);
  };
  const handleDelete = (id: number) => {
    if (confirm("Sigur vrei să ștergi această lecție?"))
      deleteLesson.mutate(id);
  };
  const handleToggle = (lesson: Lesson) => {
    togglePayment.mutate({
      id: lesson.id!,
      paymentStatus: lesson.paymentStatus === "paid" ? "unpaid" : "paid",
    });
  };

  const getStudentName = (studentId: number) =>
    students.find((s) => s.id === studentId)?.name ?? "—";
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("ro-RO", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="min-h-full p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 md:mb-6 gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-(--text-1) tracking-tight">
              Lecții
            </h1>
            <p className="text-(--text-2) text-sm mt-0.5">
              {lessons.length} lecții
            </p>
          </div>
          <div className="flex items-center gap-2">
            {googleConnected && (
              <button
                onClick={() => setCalendarImport(true)}
                className="hidden md:flex items-center gap-2 bg-(--bg-card) border border-(--border) text-(--text-2) font-medium rounded-lg px-3 py-2 text-sm hover:border-(--border-hover) transition-colors"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <rect x="1" y="2" width="12" height="11" rx="1.5" />
                  <path d="M4 1v2M10 1v2M1 5.5h12" />
                </svg>
                <span className="hidden lg:inline">Import Calendar</span>
              </button>
            )}
            <button
              onClick={handleAdd}
              className="bg-[#2b6777] text-white font-semibold rounded-lg px-3 md:px-4 py-2 text-sm hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              + Adaugă
            </button>
          </div>
        </div>

        <div className="space-y-3 md:space-y-0 md:flex md:items-center md:gap-3 mb-4 md:mb-6">
          <select
            value={studentFilter ?? ""}
            onChange={(e) =>
              setStudentFilter(
                e.target.value ? Number(e.target.value) : undefined,
              )
            }
            className="w-full md:w-auto bg-(--bg-card) border border-(--border) rounded-lg px-3 py-2 text-sm text-(--text-1) focus:outline-none focus:border-[#2b6777] transition-colors"
          >
            <option value="">Toți studenții</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <MonthPicker value={monthFilter} onChange={setMonthFilter} />

          <div className="flex gap-1 md:gap-2 overflow-x-auto">
            {([undefined, "paid", "unpaid"] as const).map((p) => (
              <button
                key={p ?? "all"}
                onClick={() => setPaymentFilter(p)}
                className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                  paymentFilter === p
                    ? "bg-[#2b6777] text-white"
                    : "bg-(--bg-card) text-(--text-2) border border-(--border)"
                }`}
              >
                {p === undefined
                  ? "Toate"
                  : p === "paid"
                    ? "Achitate"
                    : "Neachitate"}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <p className="text-(--text-2) text-sm">Se încarcă...</p>
        ) : lessons.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-(--text-3) text-sm">Nicio lecție găsită</p>
            <button
              onClick={handleAdd}
              className="mt-4 text-[#52ab98] text-sm hover:underline"
            >
              Adaugă prima lecție →
            </button>
          </div>
        ) : (
          <div className="grid gap-2 md:gap-3">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="bg-(--bg-card) border border-(--border) rounded-xl p-3 md:p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="text-center min-w-[36px] md:min-w-[48px] flex-shrink-0">
                      <p className="text-(--text-1) font-bold text-base md:text-lg leading-none">
                        {new Date(lesson.date).getDate()}
                      </p>
                      <p className="text-(--text-2) text-xs mt-0.5">
                        {new Date(lesson.date).toLocaleDateString("ro-RO", {
                          month: "short",
                        })}
                      </p>
                    </div>
                    <div className="w-px h-8 bg-(--bg-input) flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-(--text-1) font-medium text-sm truncate">
                        {getStudentName(lesson.studentId)}
                      </p>
                      <p className="text-(--text-2) text-xs mt-0.5 truncate">
                        {formatDate(lesson.date)} · {lesson.durationMinutes} min
                        · {lesson.pricePerSession} MDL
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleToggle(lesson)}
                      className={`text-xs px-2 md:px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                        lesson.paymentStatus === "paid"
                          ? "bg-[#2b6777]/10 text-[#52ab98]"
                          : "bg-[#c07a20]/10 text-[#c07a20]"
                      }`}
                    >
                      {lesson.paymentStatus === "paid"
                        ? "Achitat"
                        : "Neachitat"}
                    </button>

                    <span
                      className={`hidden md:inline text-xs px-2.5 py-1 rounded-full ${
                        lesson.status === "done"
                          ? "bg-(--bg-input) text-(--text-3)"
                          : "bg-red-400/10 text-red-400"
                      }`}
                    >
                      {lesson.status === "done" ? "Efectuat" : "Anulat"}
                    </span>

                    <button
                      onClick={() => handleEdit(lesson)}
                      className="text-(--text-3) hover:text-(--text-1) text-xs transition-colors p-1.5 rounded-lg hover:bg-(--bg-input)"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path d="M10 2l2 2-7 7H3v-2L10 2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(lesson.id!)}
                      className="text-(--text-3) hover:text-red-400 text-xs transition-colors p-1.5 rounded-lg hover:bg-red-400/10"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path d="M2 3h10M5 3V2h4v1M3 3l1 9h6l1-9" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <LessonModal lesson={editLesson} onClose={() => setModalOpen(false)} />
      )}
      {calendarImport && (
        <CalendarImport onClose={() => setCalendarImport(false)} />
      )}
    </div>
  );
}
