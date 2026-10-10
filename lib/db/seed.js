import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, sql } from 'drizzle-orm';
import {
  users,
  workspaces,
  memberships,
  contacts,
  tags,
  contactTags,
  activities,
  plans,
} from './schema.js';

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DIRECT_URL or DATABASE_URL required for seeding');
  process.exit(1);
}

const client = postgres(connectionString, { max: 1 });
const db = drizzle(client);

const DEMO_WORKSPACE_SLUG = 'nexus-demo';

const SEED_USERS = [
  { email: 'owner@nexus.demo', name: 'Alex Owner', role: 'owner' },
  { email: 'admin@nexus.demo', name: 'Beth Admin', role: 'admin' },
  { email: 'marketer@nexus.demo', name: 'Chris Marketer', role: 'marketer' },
  { email: 'sales@nexus.demo', name: 'Dana Sales', role: 'sales' },
  { email: 'viewer@nexus.demo', name: 'Eve Viewer', role: 'viewer' },
];

const SEED_TAGS = [
  'webinar-interest',
  'newsletter',
  'enterprise',
  'trial-user',
  'hot-lead',
  'churned',
];

const STAGES = ['new', 'contacted', 'registered', 'customer', 'lost'];
const SOURCES = ['website', 'referral', 'webinar', 'manual'];

async function seed() {
  console.log('🌱 Seeding Nexus demo data...');

  // 1. Upsert workspace
  let [workspace] = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.slug, DEMO_WORKSPACE_SLUG))
    .limit(1);

  if (!workspace) {
    [workspace] = await db.insert(workspaces).values({
      name: 'Nexus Demo',
      slug: DEMO_WORKSPACE_SLUG,
    }).returning();
    console.log('  ✓ Created workspace:', workspace.name);
  } else {
    console.log('  ✓ Workspace exists:', workspace.name);
  }

  // 2. Upsert users and memberships
  const userMap = {};
  for (const u of SEED_USERS) {
    let [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, u.email))
      .limit(1);

    if (!existing) {
      [existing] = await db.insert(users).values({
        email: u.email,
        name: u.name,
        emailVerified: new Date(),
      }).returning();
      console.log(`  ✓ Created user: ${u.email} (${u.role})`);
    } else {
      console.log(`  ✓ User exists: ${u.email}`);
    }

    userMap[u.role] = existing;

    // Upsert membership
    const [existingMembership] = await db
      .select()
      .from(memberships)
      .where(
        sql`${memberships.workspaceId} = ${workspace.id} AND ${memberships.userId} = ${existing.id}`
      )
      .limit(1);

    if (!existingMembership) {
      await db.insert(memberships).values({
        workspaceId: workspace.id,
        userId: existing.id,
        role: u.role,
      });
      console.log(`  ✓ Added membership: ${u.email} → ${u.role}`);
    }
  }

  // 3. Upsert tags
  const tagMap = {};
  for (const tagName of SEED_TAGS) {
    let [existing] = await db
      .select()
      .from(tags)
      .where(
        sql`${tags.workspaceId} = ${workspace.id} AND ${tags.name} = ${tagName}`
      )
      .limit(1);

    if (!existing) {
      [existing] = await db.insert(tags).values({
        workspaceId: workspace.id,
        name: tagName,
      }).returning();
    }
    tagMap[tagName] = existing;
  }
  console.log(`  ✓ ${SEED_TAGS.length} tags ready`);

  // 4. Upsert 40 contacts
  const existingContacts = await db
    .select()
    .from(contacts)
    .where(eq(contacts.workspaceId, workspace.id));

  if (existingContacts.length < 40) {
    const toCreate = 40 - existingContacts.length;
    const contactValues = [];
    for (let i = existingContacts.length; i < 40; i++) {
      contactValues.push({
        workspaceId: workspace.id,
        email: `lead${i + 1}@example.com`,
        name: `Lead ${i + 1}`,
        stage: STAGES[i % STAGES.length],
        source: SOURCES[i % SOURCES.length],
      });
    }

    if (contactValues.length > 0) {
      await db.insert(contacts).values(contactValues);
      console.log(`  ✓ Created ${toCreate} contacts (total 40)`);
    }
  } else {
    console.log(`  ✓ 40 contacts exist`);
  }

  // 5. Tag some contacts
  const allContacts = await db
    .select()
    .from(contacts)
    .where(eq(contacts.workspaceId, workspace.id));

  const tagEntries = SEED_TAGS.map((tagName) => tagMap[tagName]);
  for (let i = 0; i < allContacts.length; i++) {
    // Each contact gets 1-2 tags
    const tagsForContact = [tagEntries[i % tagEntries.length]];
    if (i % 3 === 0 && tagEntries[(i + 1) % tagEntries.length]) {
      tagsForContact.push(tagEntries[(i + 1) % tagEntries.length]);
    }

    for (const tag of tagsForContact) {
      try {
        await db.insert(contactTags).values({
          contactId: allContacts[i].id,
          tagId: tag.id,
        }).onConflictDoNothing();
      } catch {
        // Already tagged — ignore
      }
    }
  }
  console.log(`  ✓ Contact tags applied`);

  // 6. Seed activities for first 10 contacts
  for (let i = 0; i < Math.min(10, allContacts.length); i++) {
    const [existingActivity] = await db
      .select()
      .from(activities)
      .where(eq(activities.contactId, allContacts[i].id))
      .limit(1);

    if (!existingActivity) {
      await db.insert(activities).values({
        workspaceId: workspace.id,
        contactId: allContacts[i].id,
        type: 'created',
        data: { source: allContacts[i].source },
        actorType: 'system',
      });
    }
  }
  console.log(`  ✓ Activities seeded for first 10 contacts`);

  // 7. Seed 3 plans
  const existingPlans = await db
    .select()
    .from(plans)
    .where(eq(plans.workspaceId, workspace.id));

  if (existingPlans.length === 0) {
    await db.insert(plans).values([
      {
        workspaceId: workspace.id,
        name: 'Starter',
        amountCents: 1900,
        currency: 'usd',
        interval: 'month',
        active: true,
      },
      {
        workspaceId: workspace.id,
        name: 'Pro',
        amountCents: 4900,
        currency: 'usd',
        interval: 'month',
        active: true,
      },
      {
        workspaceId: workspace.id,
        name: 'Event Pass',
        amountCents: 2900,
        currency: 'usd',
        interval: 'one_time',
        active: true,
      },
    ]);
    console.log(`  ✓ Created 3 plans`);
  } else {
    console.log(`  ✓ Plans exist (${existingPlans.length})`);
  }

  console.log('✅ Seed complete!');
  await client.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
