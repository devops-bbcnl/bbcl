import { headers } from "next/headers";
import { auth } from "./index";
import { prisma } from "../prisma";

// Server-side session read for layouts/pages/route handlers — never trust a
// client-supplied user id. Role is re-read live from Employee, same as
// requireRole in rbac.ts, so a role change/offboarding is reflected immediately.
export async function getCurrentUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const employee = await prisma.employee.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      role: true,
      employmentStatus: true,
      profilePhotoUrl: true,
    },
  });

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    employee,
  };
}
