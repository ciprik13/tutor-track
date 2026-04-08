import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { useStudents } from "@/queries/useStudents";
import { useLessons } from "@/queries/useLessons";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const MONTHS_SHORT = [
  "Ian",
  "Feb",
  "Mar",
  "Apr",
  "Mai",
  "Iun",
  "Iul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function StatisticsPage() {
  const profile = useSelector((state: RootState) => state.profile);
  const theme = useSelector((state: RootState) => state.ui.theme);
  const { data: students = [] } = useStudents();
  const { data: allLessons = [] } = useLessons();

  const isDark = theme === "dark";
  const currentYear = new Date().getFullYear();

  const textColor = isDark ? "#8e8e9e" : "#6a6a7a";
  const gridColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const tooltipBg = isDark ? "#17171f" : "#ffffff";
  const tooltipBorder = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

  const yearLessons = allLessons.filter(
    (l) => l.date.startsWith(String(currentYear)) && l.status === "done",
  );

  const monthlyData = MONTHS_SHORT.map((month, i) => {
    const monthStr = `${currentYear}-${String(i + 1).padStart(2, "0")}`;
    const monthLessons = yearLessons.filter((l) => l.date.startsWith(monthStr));
    const total = monthLessons.reduce((s, l) => s + l.pricePerSession, 0);
    const achitat = monthLessons
      .filter((l) => l.paymentStatus === "paid")
      .reduce((s, l) => s + l.pricePerSession, 0);
    const neachitat = total - achitat;
    return { month, total, achitat, neachitat, lectii: monthLessons.length };
  });

  const totalYear = monthlyData.reduce((s, m) => s + m.total, 0);
  const totalAchitat = monthlyData.reduce((s, m) => s + m.achitat, 0);
  const avgMonthly = Math.round(totalYear / 12);
  const bestMonth = monthlyData.reduce(
    (best, m) => (m.total > best.total ? m : best),
    monthlyData[0],
  );

  const studentData = [
    {
      name: "Activi",
      value: students.filter((s) => s.status === "active").length,
      color: isDark ? "#52ab98" : "#2b6777",
    },
    {
      name: "Inactivi",
      value: students.filter((s) => s.status === "inactive").length,
      color: isDark ? "#2a2a35" : "#e8e5e0",
    },
  ];

  const durationData = [
    {
      name: "60 min",
      value: yearLessons.filter((l) => l.durationMinutes === 60).length,
      color: isDark ? "#52ab98" : "#2b6777",
    },
    {
      name: "90 min",
      value: yearLessons.filter((l) => l.durationMinutes === 90).length,
      color: "#2b6777",
    },
    {
      name: "120 min",
      value: yearLessons.filter((l) => l.durationMinutes === 120).length,
      color: "#c8d8e4",
    },
  ];

  const cardStyle = {
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    padding: "20px",
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div
        style={{
          background: tooltipBg,
          border: `1px solid ${tooltipBorder}`,
          borderRadius: "8px",
          padding: "10px 14px",
        }}
      >
        <p style={{ fontSize: "12px", color: textColor, marginBottom: "6px" }}>
          {label}
        </p>
        {payload.map((p: any) => (
          <p
            key={p.name}
            style={{
              fontSize: "13px",
              fontWeight: 500,
              color: p.color,
              margin: "2px 0",
            }}
          >
            {p.name}: {p.value} {p.name === "lectii" ? "" : profile.currency}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-full p-4 md:p-6 bg-(--bg-page)">
      <div className="max-w-5xl mx-auto">
        <div className="mb-4 md:mb-6 lg:mb-7">
          <h1 className="text-xl sm:text-2xl font-bold text-(--text-1) tracking-tight">
            Statistici
          </h1>
          <p className="text-(--text-2) text-xs sm:text-sm mt-1">
            Anul {currentYear} — privire de ansamblu
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
          {[
            {
              label: "Venit total",
              value: `${totalYear.toLocaleString()} ${profile.currency}`,
              sub: `din care ${totalAchitat.toLocaleString()} achitat`,
            },
            {
              label: "Medie lunară",
              value: `${avgMonthly.toLocaleString()} ${profile.currency}`,
              sub: "per lună în " + currentYear,
            },
            {
              label: "Luna cea mai bună",
              value: bestMonth.total > 0 ? bestMonth.month : "—",
              sub:
                bestMonth.total > 0
                  ? `${bestMonth.total.toLocaleString()} ${profile.currency}`
                  : "nicio lecție încă",
            },
            {
              label: "Lecții total",
              value: yearLessons.length,
              sub: `în ${currentYear}`,
            },
          ].map((card) => (
            <div
              key={card.label}
              className="bg-(--bg-card) border border-(--border) rounded-xl p-4"
            >
              <p className="text-xs text-(--text-2) uppercase tracking-wider mb-2">
                {card.label}
              </p>
              <p className="text-xl sm:text-2xl font-bold text-(--text-1) leading-none">
                {card.value}
              </p>
              <p className="text-xs text-(--text-3) mt-2">{card.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
          <div className="bg-(--bg-card) border border-(--border) rounded-xl p-4 md:p-5">
            <p className="text-sm font-semibold text-(--text-1) mb-4">
              Venituri lunare {currentYear}
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart
                data={monthlyData}
                margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: textColor }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: textColor }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "12px", color: textColor }} />
                <Line
                  type="monotone"
                  dataKey="total"
                  name="Total"
                  stroke="#52ab98"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="achitat"
                  name="achitat"
                  stroke="#4ecdc4"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                  strokeDasharray="4 4"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-(--bg-card) border border-(--border) rounded-xl p-4 md:p-5">
            <p className="text-sm font-semibold text-(--text-1) mb-4">
              Lecții per lună
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={monthlyData}
                margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: textColor }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: textColor }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="lectii"
                  name="lectii"
                  fill="#2b6777"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-(--bg-card) border border-(--border) rounded-xl p-4 md:p-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <div className="flex-shrink-0">
              <p className="text-sm font-semibold text-(--text-1) mb-3">
                Studenți
              </p>
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie
                    data={studentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {studentData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1">
              <p className="text-xl sm:text-2xl font-bold text-(--text-1) leading-none">
                {students.length}
              </p>
              <p className="text-xs text-(--text-3) mt-1.5 mb-4 sm:mb-5">
                studenți total
              </p>
              <div className="space-y-2">
                {studentData.map((s) => (
                  <div key={s.name} className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: s.color }}
                    />
                    <span className="text-xs text-(--text-2)">{s.name}</span>
                    <span className="text-xs font-semibold text-(--text-1) ml-auto">
                      {s.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-(--bg-card) border border-(--border) rounded-xl p-4 md:p-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <div className="flex-shrink-0">
              <p className="text-sm font-semibold text-(--text-1) mb-3">
                Durată lecții
              </p>
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie
                    data={durationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {durationData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1">
              <p className="text-xl sm:text-2xl font-bold text-(--text-1) leading-none">
                {yearLessons.length}
              </p>
              <p className="text-xs text-(--text-3) mt-1.5 mb-4 sm:mb-5">
                lecții în {currentYear}
              </p>
              <div className="space-y-2">
                {durationData.map((d) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: d.color }}
                    />
                    <span className="text-xs text-(--text-2)">{d.name}</span>
                    <span className="text-xs font-semibold text-(--text-1) ml-auto">
                      {d.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
