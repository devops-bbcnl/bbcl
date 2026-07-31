import { randomUUID } from "node:crypto";
import { auth } from "../lib/auth";
import { prisma } from "../lib/prisma";

const [email, password, firstName, lastName] = process.argv.slice(2);

if (!email || !password || !firstName || !lastName) {
  console.error("Usage: tsx scripts/seed-admin.ts <email> <password> <firstName> <lastName>");
  process.exit(1);
}

async function main() {
  const existing = await prisma.user.findUnique({ where: { email } });

  const userId =
    existing?.id ??
    (
      await auth.api.signUpEmail({
        body: { email, password, name: `${firstName} ${lastName}` },
      })
    ).user.id;

  const [{ nextval }] = await prisma.$queryRaw<{ nextval: bigint }[]>`
    SELECT nextval('staff_number_seq') AS nextval;
  `;
  const yearSuffix = new Date().getFullYear().toString().slice(-2);
  const staffNumber = `BB-${yearSuffix}${nextval.toString().padStart(4, "0")}`;

  const employee = await prisma.employee.create({
    data: {
      userId,
      staffNumber,
      firstName,
      lastName,
      email,
      role: "ADMIN",
      verificationToken: randomUUID(),
    },
  });

  console.log(`Created admin ${email} — staff number ${employee.staffNumber}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
