import { createId } from "@paralleldrive/cuid2";
import { env } from "@typebot.io/env";
import prisma from "@typebot.io/prisma";
import { WorkspaceRole } from "@typebot.io/prisma/enum";
import { parseWorkspaceDefaultPlan } from "@typebot.io/workspaces/parseWorkspaceDefaultPlan";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

const useSecureCookies = env.NEXTAUTH_URL?.startsWith("https://");
const sessionCookieName = useSecureCookies
  ? "__Secure-authjs.session-token"
  : "authjs.session-token";

export const GET = async (req: NextRequest) => {
  const token = req.nextUrl.searchParams.get("token");
  const redirectTo = req.nextUrl.searchParams.get("redirect") ?? "/typebots";

  if (!token)
    return NextResponse.json({ error: "Missing token" }, { status: 400 });

  if (!env.SSO_JWT_SECRET)
    return NextResponse.json(
      { error: "SSO not configured" },
      { status: 500 },
    );

  let payload: jwt.JwtPayload;
  try {
    payload = jwt.verify(token, env.SSO_JWT_SECRET) as jwt.JwtPayload;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const email = payload.email as string | undefined;
  if (!email)
    return NextResponse.json(
      { error: "Token missing email claim" },
      { status: 401 },
    );

  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: createId(),
        email,
        name: (payload.user_metadata as Record<string, unknown> | undefined)
          ?.full_name as string | undefined,
        emailVerified: new Date(),
        onboardingCategories: [],
        workspaces: {
          create: {
            role: WorkspaceRole.ADMIN,
            workspace: {
              create: {
                name: `My workspace`,
                plan: parseWorkspaceDefaultPlan(email),
              },
            },
          },
        },
      },
    });
  }

  const sessionToken = createId();
  const expires = new Date(Date.now() + SESSION_MAX_AGE_MS);

  await prisma.session.create({
    data: {
      sessionToken,
      userId: user.id,
      expires,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName, sessionToken, {
    expires,
    httpOnly: true,
    sameSite: "lax",
    secure: useSecureCookies,
    path: "/",
  });

  return NextResponse.redirect(new URL(redirectTo, env.NEXTAUTH_URL));
};
