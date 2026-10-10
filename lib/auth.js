import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Resend from 'next-auth/providers/resend';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from '@/lib/db/index.js';
import { eq } from 'drizzle-orm';
import { memberships, workspaces } from '@/lib/db/schema.js';

// Build providers list dynamically — missing keys simply hide the provider
const providers = [];

if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    })
  );
}

if (process.env.RESEND_API_KEY) {
  providers.push(
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  session: { strategy: 'database' },
  providers,
  pages: {
    signIn: '/sign-in',
    newUser: '/onboarding',
  },
  callbacks: {
    async session({ session, user }) {
      // Attach workspaceId and role from the first membership
      session.user.id = user.id;

      const membershipRows = await db
        .select({
          workspaceId: memberships.workspaceId,
          role: memberships.role,
          workspaceName: workspaces.name,
          workspaceSlug: workspaces.slug,
        })
        .from(memberships)
        .innerJoin(workspaces, eq(memberships.workspaceId, workspaces.id))
        .where(eq(memberships.userId, user.id))
        .limit(1);

      if (membershipRows.length > 0) {
        session.user.workspaceId = membershipRows[0].workspaceId;
        session.user.role = membershipRows[0].role;
        session.user.workspaceName = membershipRows[0].workspaceName;
        session.user.workspaceSlug = membershipRows[0].workspaceSlug;
      }

      return session;
    },
  },
});
