const text = `MASTER FLOW AND FEATURES CHART

1. CORE APP FLOW
- PWA opens in planning mode before event day
- User logs in with role-based access
- Dashboard loads according to role and event duty
- Admin/Senior Team configure event, categories, guests, teams, vendors, budgets and tasks
- Student uploads form, result image, photo and certificate preview adjustments
- System runs parsing/extraction and board logic like CBSE Best 5
- Student is marked Eligible / Not Eligible / Review Needed
- Eligible students enter award stage sequence
- Category-wise pre-decided anchor is attached automatically
- Preferred guest is attached, but can be changed live by senior team
- Team member and volunteer assignments are tracked with counts
- On event day, app enters live mode with Socket.IO sync
- Anchor gets instant popup if guest changes
- Donation entry can be created instantly
- WhatsApp thank-you can be triggered instantly
- Guest / volunteer / team certificates can be sent on or after event
- Budget vs actual expense, vendors and responsibility tasks remain visible throughout event lifecycle

2. NEW BUDGET AND TASK MODULES
- Budget heads: Food, Decor, Printing, Trophies, Sound, Misc
- Vendors: food vendor, decor vendor, printing vendor, sound vendor, etc.
- Expenses: vendor expense, direct expense, emergency expense, team purchase
- Teams: guest management, stage management, finance, food & hospitality, certificate team, communication team
- Event tasks: assign specific responsibility to team members with backup owner, deadline and status
- Final report includes allowed budget, actual expense, pending dues, vendor summary, task status

3. ROLE-WISE FOCUS
- Super Admin: full system, roles, reports, settings, audit
- Host: monitoring and summary
- Admin: planning, categories, users, stage, budget, vendors, reports
- Senior Team: live event control, guest change, donation and thank-you actions
- Team Leader: team execution and task coordination
- Anchor: category-wise live stage flow only
- Volunteer: support tasks and readiness
- Guest: own attendance and schedule view
- Student: own status and certificate preview

4. LIVE MODE RULE
- Planning days: manual sync + local cache okay
- Event day: server truth + sockets + auto refresh
- Offline fallback can queue limited actions, but live stage state should come from server`;

export default function SystemFlowPage() {
  return (
    <div className="page">
      <h2>Complete System Flow</h2>
      <div className="panel">
        <pre className="code">{text}</pre>
      </div>
    </div>
  );
}
