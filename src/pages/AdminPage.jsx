import { useEffect, useState } from 'react';
import api from '../api';
import DataTable from '../components/DataTable';
import SectionTitle from '../components/SectionTitle';

const userInitial = { name: '', username: '', password: '', roleId: '', eventDutyType: 'NONE', availabilityStatus: 'AVAILABLE' };
const templateInitial = { name: '', type: 'STUDENT_AWARD' };
const ruleInitial = { name: '', triggerKey: '', templateName: '', recipientType: 'Student', isActive: true };

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [rules, setRules] = useState([]);
  const [userForm, setUserForm] = useState(userInitial);
  const [templateForm, setTemplateForm] = useState(templateInitial);
  const [ruleForm, setRuleForm] = useState(ruleInitial);

  const load = async () => {
    const [u, r, t, a] = await Promise.all([api.get('/users'), api.get('/roles'), api.get('/certificate-templates'), api.get('/automation-rules')]);
    setUsers(u.data); setRoles(r.data); setTemplates(t.data); setRules(a.data);
  };
  useEffect(() => { load(); }, []);

  const addUser = async (e) => { e.preventDefault(); await api.post('/users', userForm); setUserForm(userInitial); load(); };
  const addTemplate = async (e) => { e.preventDefault(); await api.post('/certificate-templates', templateForm); setTemplateForm(templateInitial); load(); };
  const addRule = async (e) => { e.preventDefault(); await api.post('/automation-rules', ruleForm); setRuleForm(ruleInitial); load(); };

  return (
    <div className="page">
      <SectionTitle title="Admin + Master Data" subtitle="This page controls users, roles, certificate templates and WhatsApp automation rules." />
      <div className="grid two">
        <form className="panel stack gap12" onSubmit={addUser}>
          <h3>Create user</h3>
          <div className="form-grid">
            <input placeholder="Name" value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} />
            <input placeholder="Username" value={userForm.username} onChange={(e) => setUserForm({ ...userForm, username: e.target.value })} />
            <input placeholder="Password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} />
            <select value={userForm.roleId} onChange={(e) => setUserForm({ ...userForm, roleId: e.target.value })}><option value="">Role</option>{roles.map((r) => <option key={r._id} value={r._id}>{r.name}</option>)}</select>
            <input placeholder="Duty type" value={userForm.eventDutyType} onChange={(e) => setUserForm({ ...userForm, eventDutyType: e.target.value })} />
            <select value={userForm.availabilityStatus} onChange={(e) => setUserForm({ ...userForm, availabilityStatus: e.target.value })}><option>AVAILABLE</option><option>BUSY</option><option>EXPECTED</option><option>ARRIVED_EARLY</option><option>LEFT_VENUE</option></select>
          </div>
          <button className="primary" type="submit">Add User</button>
        </form>

        <div className="panel">
          <h3>Roles</h3>
          <DataTable headers={['Role', 'Code', 'Dashboard']} rows={roles.map((r) => [r.name, r.code, r.dashboardKey])} />
        </div>
      </div>

      <div className="grid two mt16">
        <form className="panel stack gap12" onSubmit={addTemplate}>
          <h3>Certificate template</h3>
          <div className="form-grid">
            <input placeholder="Template name" value={templateForm.name} onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })} />
            <select value={templateForm.type} onChange={(e) => setTemplateForm({ ...templateForm, type: e.target.value })}><option value="STUDENT_AWARD">Student award</option><option value="GUEST_THANK_YOU">Guest thank you</option><option value="VOLUNTEER_APPRECIATION">Volunteer</option><option value="TEAM_APPRECIATION">Team</option></select>
          </div>
          <button className="primary" type="submit">Add Template</button>
        </form>

        <form className="panel stack gap12" onSubmit={addRule}>
          <h3>Automation rule</h3>
          <div className="form-grid">
            <input placeholder="Rule name" value={ruleForm.name} onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })} />
            <input placeholder="Trigger key" value={ruleForm.triggerKey} onChange={(e) => setRuleForm({ ...ruleForm, triggerKey: e.target.value })} />
            <input placeholder="Template name" value={ruleForm.templateName} onChange={(e) => setRuleForm({ ...ruleForm, templateName: e.target.value })} />
            <input placeholder="Recipient type" value={ruleForm.recipientType} onChange={(e) => setRuleForm({ ...ruleForm, recipientType: e.target.value })} />
          </div>
          <button className="primary" type="submit">Add Rule</button>
        </form>
      </div>

      <div className="grid two mt16">
        <div className="panel">
          <h3>Users</h3>
          <DataTable headers={['Name', 'Username', 'Role', 'Duty', 'Status']} rows={users.map((u) => [u.name, u.username, u.roleId?.name || '-', u.eventDutyType, u.availabilityStatus])} />
        </div>
        <div className="panel">
          <h3>Automation + templates</h3>
          <DataTable headers={['Certificate Template', 'Type']} rows={templates.map((t) => [t.name, t.type])} />
          <div className="spacer8" />
          <DataTable headers={['Rule', 'Trigger', 'Template', 'Recipient']} rows={rules.map((r) => [r.name, r.triggerKey, r.templateName, r.recipientType])} />
        </div>
      </div>
    </div>
  );
}
