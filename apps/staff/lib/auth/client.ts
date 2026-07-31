import { createAuthClient } from "better-auth/react";

// No baseURL — the client and the /api/auth route it calls are the same Next app,
// so it should always hit the page's own origin. A hardcoded absolute URL here
// broke the moment the dev server ran on a different port than NEXT_PUBLIC_BETTER_AUTH_URL
// (e.g. two apps racing for :3000, or the port being reassigned after a restart).
export const authClient = createAuthClient();

export const { signIn, signOut, useSession } = authClient;
