import { prisma } from "@/lib/prisma";

export interface InteractionFinding {
  drugAId: string;
  drugBId: string;
  severity: string;
  description: string;
}

export async function checkInteractions(drugCatalogIds: string[]): Promise<InteractionFinding[]> {
  const uniqueIds = Array.from(new Set(drugCatalogIds));
  if (uniqueIds.length < 2) return [];

  const interactions = await prisma.drugInteraction.findMany({
    where: { drugAId: { in: uniqueIds }, drugBId: { in: uniqueIds } },
  });

  return interactions
    .filter((i) => i.drugAId !== i.drugBId)
    .map((i) => ({
      drugAId: i.drugAId,
      drugBId: i.drugBId,
      severity: i.severity,
      description: i.description,
    }));
}
