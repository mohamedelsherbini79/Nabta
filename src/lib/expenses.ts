import { prisma } from "@/lib/prisma";
import type { ExpenseRecordInput } from "@/lib/validation";
import type { ExpenseCategoryTotal, ExpenseCurrencyTotal, ExpenseRecordSummary, ExpenseSummary } from "@/types";

const DEFAULT_WINDOW_DAYS = 365;

export function getExpensesForProfile(patientProfileId: string, days = DEFAULT_WINDOW_DAYS) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return prisma.expenseRecord.findMany({
    where: { patientProfileId, incurredAt: { gte: since } },
    orderBy: { incurredAt: "desc" },
  });
}

export function createExpenseRecord(patientProfileId: string, input: ExpenseRecordInput) {
  return prisma.expenseRecord.create({
    data: {
      patientProfileId,
      category: input.category,
      amount: input.amount,
      currency: input.currency,
      incurredAt: input.incurredAt,
      note: input.note,
    },
  });
}

export function deleteExpenseRecord(id: string) {
  return prisma.expenseRecord.delete({ where: { id } });
}

interface ExpenseRecordForSummary {
  id: string;
  category: string;
  amount: { toNumber(): number };
  currency: string;
  incurredAt: Date;
  note: string | null;
}

export function toExpenseRecordSummary(record: ExpenseRecordForSummary): ExpenseRecordSummary {
  return {
    id: record.id,
    category: record.category as ExpenseRecordSummary["category"],
    amount: record.amount.toNumber(),
    currency: record.currency,
    incurredAt: record.incurredAt.toISOString(),
    note: record.note,
  };
}

export function computeExpenseSummary(records: ExpenseRecordSummary[]): ExpenseSummary {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const currencyMap = new Map<string, { monthTotal: number; yearTotal: number }>();
  const categoryMap = new Map<string, number>();

  for (const record of records) {
    const incurredAt = new Date(record.incurredAt);
    const entry = currencyMap.get(record.currency) ?? { monthTotal: 0, yearTotal: 0 };
    if (incurredAt >= startOfYear) entry.yearTotal += record.amount;
    if (incurredAt >= startOfMonth) entry.monthTotal += record.amount;
    currencyMap.set(record.currency, entry);

    const key = `${record.category}|${record.currency}`;
    categoryMap.set(key, (categoryMap.get(key) ?? 0) + record.amount);
  }

  const totalsByCurrency: ExpenseCurrencyTotal[] = Array.from(currencyMap.entries()).map(([currency, totals]) => ({
    currency,
    monthTotal: Math.round(totals.monthTotal * 100) / 100,
    yearTotal: Math.round(totals.yearTotal * 100) / 100,
  }));

  const byCategory: ExpenseCategoryTotal[] = Array.from(categoryMap.entries()).map(([key, total]) => {
    const [category, currency] = key.split("|");
    return { category: category as ExpenseCategoryTotal["category"], currency, total: Math.round(total * 100) / 100 };
  });

  return { totalsByCurrency, byCategory };
}
