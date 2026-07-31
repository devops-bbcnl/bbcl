import { headers } from "next/headers";
import Image from "next/image";
import { getPublicVerificationData } from "@/services/employee-service";
import { checkRateLimit } from "@/lib/rate-limit";

// Public, no-login page. Hard field allowlist only (see employee-service's
// getPublicVerificationData) — never a generic employee serializer. Rate-limited
// per IP+token via a Supabase-backed counter (design doc Premise 5, eng review
// rate-limit-store finding).

function getClientIp(headerList: Headers): string {
  const forwardedFor = headerList.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() ?? "unknown";
}

export default async function VerifyPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const headerList = await headers();
  const ip = getClientIp(headerList);

  const { allowed } = await checkRateLimit(ip, token);
  if (!allowed) {
    return <StatusCard title="TOO MANY REQUESTS" subtitle="Please try again shortly." />;
  }

  const result = await getPublicVerificationData(token);

  if (result.status === "INVALID_EMPLOYEE") {
    return <StatusCard title="INVALID EMPLOYEE" subtitle="This QR code could not be verified." />;
  }
  if (result.status === "FORMER_EMPLOYEE") {
    return <StatusCard title="FORMER EMPLOYEE" subtitle="This person is no longer with Bubble Barrel." />;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white p-6 text-center">
      <div className="text-bb-blue text-sm font-semibold uppercase tracking-wide">Bubble Barrel</div>
      {result.profilePhotoUrl && (
        <Image
          src={result.profilePhotoUrl}
          alt={result.fullName}
          width={120}
          height={120}
          className="rounded-full object-cover"
        />
      )}
      <h1 className="text-2xl font-bold">{result.fullName}</h1>
      {result.jobTitle && <p className="text-gray-600">{result.jobTitle}</p>}
      {result.department && <p className="text-gray-500 text-sm">{result.department}</p>}
      <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-1 text-sm font-medium text-green-800">
        Verified Bubble Barrel Employee
      </div>
      <p className="text-xs text-gray-400">
        Joined {new Date(result.dateJoined).toLocaleDateString("en-US", { year: "numeric", month: "long" })}
      </p>
    </main>
  );
}

function StatusCard({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2 bg-white p-6 text-center">
      <div className="text-bb-blue text-sm font-semibold uppercase tracking-wide">Bubble Barrel</div>
      <h1 className="text-2xl font-bold text-red-700">{title}</h1>
      <p className="text-gray-500">{subtitle}</p>
    </main>
  );
}
