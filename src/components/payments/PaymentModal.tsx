import { useState } from "react";
import { useCreatePayment, useUpdatePayment } from "@/queries/usePayments";
import { useStudents } from "@/queries/useStudents";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import type { Payment } from "@/types";

interface Props {
  payment: Payment | null;
  onClose: () => void;
}

export default function PaymentModal({ payment, onClose }: Props) {
  const profile = useSelector((state: RootState) => state.profile);
  const { data: students = [] } = useStudents();

  const [form, setForm] = useState<Omit<Payment, "id">>({
    studentId: payment?.studentId ?? students[0]?.id ?? 0,
    amount: payment?.amount ?? 0,
    currency: payment?.currency ?? profile.currency,
    period:
      payment?.period ??
      new Date().toLocaleDateString("ro-RO", {
        month: "long",
        year: "numeric",
      }),
    status: payment?.status ?? "unpaid",
    date: payment?.date ?? new Date().toISOString().slice(0, 10),
    notes: payment?.notes ?? "",
    createdAt: payment?.createdAt ?? new Date().toISOString(),
  });

  const createPayment = useCreatePayment();
  const updatePayment = useUpdatePayment();

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "amount" || name === "studentId" ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (payment?.id) {
      updatePayment.mutate({ ...form, id: payment.id }, { onSuccess: onClose });
    } else {
      createPayment.mutate(form, { onSuccess: onClose });
    }
  };

  const isValid = form.studentId && form.amount > 0 && form.period.trim();

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-lg">
            {payment ? "Editează plată" : "Plată nouă"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-white transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Student</label>
            <select
              name="studentId"
              value={form.studentId}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-lime-400 transition-colors"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Sumă</label>
              <input
                name="amount"
                type="number"
                value={form.amount}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-lime-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Monedă</label>
              <select
                name="currency"
                value={form.currency}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-lime-400 transition-colors"
              >
                <option value="MDL">MDL</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Perioadă</label>
            <input
              name="period"
              value={form.period}
              onChange={handleChange}
              placeholder="ex. Aprilie 2026"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-lime-400 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Data</label>
              <input
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-lime-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-lime-400 transition-colors"
              >
                <option value="unpaid">Neachitat</option>
                <option value="paid">Achitat</option>
                <option value="partial">Parțial</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Note</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={2}
              placeholder="Observații opționale..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-lime-400 transition-colors resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-800 text-gray-400 font-medium rounded-lg py-2.5 text-sm hover:bg-gray-700 transition-colors"
            >
              Anulează
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className="flex-1 bg-lime-400 text-gray-950 font-semibold rounded-lg py-2.5 text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {payment ? "Salvează" : "Adaugă"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
