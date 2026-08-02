import { NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/session";
import {
  getDelegatesForFamilyGroup,
  getPendingInvitesForUser,
  getUserFamilyGroup,
  inviteDelegate,
} from "@/lib/family";
import { logAudit } from "@/lib/audit";
import { delegateInviteSchema } from "@/lib/validation";
import { emailSender } from "@/lib/email";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const user = await getSessionUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const group = await getUserFamilyGroup(user.id);
  const delegates = group ? await getDelegatesForFamilyGroup(group.id) : [];
  const pendingInvites = await getPendingInvitesForUser(user.id);

  return NextResponse.json({ delegates, pendingInvites });
}

export async function POST(req: Request) {
  const user = await getSessionUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "unauthorized", message: "Not signed in." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = delegateInviteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", message: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const group = await getUserFamilyGroup(user.id);
  if (!group) {
    return NextResponse.json({ error: "not_found", message: "No family group found." }, { status: 404 });
  }

  const result = await inviteDelegate(group.id, parsed.data.email, parsed.data.scope);
  if (!result.ok) {
    const messages: Record<string, string> = {
      user_not_found: "No account found with this email.",
      cannot_invite_self: "You cannot invite yourself.",
      already_invited: "This person has already been invited.",
    };
    return NextResponse.json(
      { error: result.error, message: messages[result.error] ?? "Could not send invite." },
      { status: 400 },
    );
  }

  await logAudit({
    actorUserId: user.id,
    action: "FAMILY_DELEGATE_INVITE",
    entityType: "FamilyDelegate",
    entityId: result.delegate.id,
  });

  // Best-effort notification — the in-app "Pending Invites" list is the real
  // mechanism, so a failed/unconfigured email must never fail the invite itself.
  const appBaseUrl = process.env.APP_BASE_URL || "http://localhost:3000";
  emailSender
    .sendEmail({
      to: parsed.data.email,
      subject: `${user.name ?? "Someone"} invited you to their family health group`,
      html: `<p>${user.name ?? "Someone"} (${user.email}) invited you to help manage their family's health on Nabta.</p><p>Log in and visit <a href="${appBaseUrl}/profile/family">Family Mode</a> to accept.</p>`,
    })
    .catch((err) => console.error("Delegate invite email failed:", err));

  return NextResponse.json({ delegate: result.delegate }, { status: 201 });
}
