# UX Flows

Journey: Sign in -> Create workspace -> Dashboard -> (Build site | CRM | Agent) -> Approve -> Analytics.
There is no marketing landing page in v1; unauthenticated visitors get the sign-in screen.

## Flow 1 - Sign in and workspace
1. User opens /sign-in.
2. Enters email or chooses Google.
3. Magic link is sent (Resend) or OAuth completes.
4. First login: user names the workspace and becomes Owner.
5. Redirect to /dashboard.
Success: dashboard with seeded or empty-state widgets.
Failure: expired link shows a plain message and a "Send new link" button; OAuth failure returns to sign-in with an error box.

## Flow 2 - Build and publish a site
1. User opens Website, clicks New Site.
2. Modal asks name and slug; slug availability checked.
3. Builder opens with a starter page.
4. User drags blocks, edits text, adds a Lead Form block.
5. Save writes craft_json; Publish (Owner/Admin/Marketer) writes published_json and sets status published.
6. Toast shows /s/[slug] link.
Loading State: striped skeleton in the builder canvas.
Error State: save failure keeps local state and shows Retry; slug taken shows inline error.
Empty State: "No sites yet" with New Site button.

## Flow 3 - Lead capture
1. Visitor opens /s/[slug].
2. Fills form and submits.
3. Endpoint validates, rate-limits, dedupes by email.
4. Contact created or updated, activity logged.
5. Visitor sees a confirmation block.
Failure: validation errors inline; rate limit shows a generic try-later message.

## Flow 4 - CRM pipeline
1. User opens CRM; list and pipeline board views.
2. Filters by tag, stage, source.
3. Opens a contact: timeline, tags, stage selector.
4. Changes stage; activity and audit rows are written.
Empty State: "No contacts yet" with Add Contact and "Connect a form" hint.

## Flow 5 - Agent run (centerpiece)
1. User opens Agent and types an instruction.
2. Plan appears: ordered steps, tool name, args summary, risk badge.
3. LOW and MEDIUM steps run automatically and tick off live.
4. HIGH steps pause with NEEDS APPROVAL; Owner/Admin sees Approve and Reject with the exact args (recipient count, subject, site slug).
5. Approval enqueues the step via Inngest; timeline updates over SSE.
6. Run ends with a summary and links to created objects.
Loading State: "Planning..." block with stepped animation.
Error State: failed step shows red block with error and a Resume button.
Empty State: example instructions to click.
Rejected State: step marked rejected, dependent steps skipped, summary explains.

## Flow 6 - Campaign
1. Marketer opens Marketing, creates campaign (subject, body, tag audience).
2. Preview shows recipient count and sanitized body.
3. Schedule or Send Now (Send requires Owner/Admin/Marketer; agent-triggered sends require approval).
4. Detail page shows sent, opens, clicks.

## Flow 7 - Webinar
1. User creates a webinar (title, time, optional plan).
2. Registration page or site form registers contacts.
3. At start time the Join page embeds Jitsi; join marks attended.
4. Follow-up campaign targets attendees or no-shows.

## Flow 8 - Billing
1. Owner opens Billing; sees plans and current MRR.
2. Creates a plan; Nexus creates the Stripe product and price.
3. Test checkout via Stripe Checkout; webhook updates subscription status.
4. Usage meter shows emails sent and agent steps this period.
Failure: failed payment shows a tomato badge and the invoice link.

## Flow 9 - Analytics
Dashboard shows: 3D bar chart (leads per week), funnel scene (stage conversion), MRR, campaign performance, workflow outcomes. Data refreshes on focus and after agent run completion. SVG fallback when WebGL is unavailable.
