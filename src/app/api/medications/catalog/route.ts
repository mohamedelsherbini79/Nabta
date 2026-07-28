import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { drugCatalogSearchSchema } from "@/lib/validation";

export const runtime = "nodejs";

// Global reference data, not patient-scoped — no canAccessProfile check needed.
export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const parsed = drugCatalogSearchSchema.safeParse({
    q: searchParams.get("q") ?? undefined,
    barcode: searchParams.get("barcode") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", message: "Invalid search input." }, { status: 400 });
  }

  const term = parsed.data.q ?? parsed.data.barcode;
  if (!term) {
    return NextResponse.json({ results: [] });
  }

  const results = await prisma.drugCatalog.findMany({
    where: {
      OR: [
        { tradeName: { contains: term, mode: "insensitive" } },
        { genericName: { contains: term, mode: "insensitive" } },
        { activeIngredient: { contains: term, mode: "insensitive" } },
      ],
    },
    take: 20,
    orderBy: { tradeName: "asc" },
  });

  return NextResponse.json({ results });
}
