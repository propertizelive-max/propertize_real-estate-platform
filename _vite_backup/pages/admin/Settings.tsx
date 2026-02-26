import { useState } from 'react'

const tabs = ['General', 'Security', 'Team Management']
const admins = [
  { name: 'Alex Johnson', email: 'alex.j@estatepro.com', role: 'SUPER ADMIN', roleColor: 'bg-blue-100 text-blue-800', status: 'Active', statusColor: 'text-green-600' },
  { name: 'Sarah Chen', email: 'sarah.c@estatepro.com', role: 'MANAGER', roleColor: 'bg-gray-100 text-gray-800', status: 'Active', statusColor: 'text-green-600' },
  { name: 'Michael Ross', email: 'michael.r@estatepro.com', role: 'AGENT', roleColor: 'bg-blue-100 text-blue-800', status: 'Active', statusColor: 'text-green-600' },
  { name: 'Emily Davis', email: 'emily.d@estatepro.com', role: 'MANAGER', roleColor: 'bg-gray-100 text-gray-800', status: 'Pending', statusColor: 'text-amber-600' },
]
const roles = ['Agent', 'Manager', 'Super Admin']

export default function Settings() {
  const [activeTab, setActiveTab] = useState('Team Management')
  const [modalOpen, setModalOpen] = useState(false)
  const [toast, setToast] = useState<{ show: boolean; message: string; sub: string }>({ show: false, message: '', sub: '' })
  const [inviteForm, setInviteForm] = useState({ fullName: '', email: '', role: 'Agent' })

  const sendInvite = () => {
    setModalOpen(false)
    setToast({ show: true, message: 'Invitation Sent', sub: `Email sent to ${inviteForm.fullName || 'invitee'}.` })
    setInviteForm({ fullName: '', email: '', role: 'Agent' })
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 4000)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your team and platform preferences.</p>
        </div>
        {activeTab === 'Team Management' && (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-primary text-white font-medium hover:opacity-90 flex items-center gap-2 shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
            + Invite Admin
          </button>
        )}
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'Team Management' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4 border-b border-gray-200">
            <h2 className="font-bold text-gray-900">Admins</h2>
            <span className="text-sm text-gray-500">4 Total Admins</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 bg-gray-50">
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {admins.map((a) => (
                  <tr key={a.email} className="hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium text-gray-600">
                          {a.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <span className="font-medium text-gray-900">{a.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">{a.email}</td>
                    <td className="p-4">
                      <span className={`inline-flex px-2.5 py-1 rounded text-xs font-medium ${a.roleColor}`}>{a.role}</span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 text-sm ${a.statusColor}`}>
                        <span className={`w-2 h-2 rounded-full ${a.status === 'Active' ? 'bg-green-500' : 'bg-amber-500'}`} />
                        {a.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <button type="button" className="text-primary hover:underline font-medium text-sm">
                        {a.status === 'Pending' ? 'Revoke' : 'Edit'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab !== 'Team Management' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-gray-500">Configure {activeTab.toLowerCase()} settings here.</p>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setModalOpen(false)} aria-hidden />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Invite New Admin</h3>
              <button type="button" onClick={() => setModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={inviteForm.fullName}
                  onChange={(e) => setInviteForm((f) => ({ ...f, fullName: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="john@estatepro.com"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Assign Role</label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm((f) => ({ ...f, role: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {roles.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="button"
              onClick={sendInvite}
              className="mt-6 w-full py-2.5 rounded-lg bg-primary text-white font-medium hover:opacity-90"
            >
              Send Invitation
            </button>
          </div>
        </div>
      )}

      {toast.show && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-800 text-white shadow-lg max-w-sm">
          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </span>
          <div className="min-w-0">
            <p className="font-medium">{toast.message}</p>
            <p className="text-sm text-gray-300 truncate">{toast.sub}</p>
          </div>
          <button type="button" onClick={() => setToast((t) => ({ ...t, show: false }))} className="p-1 text-gray-400 hover:text-white">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}
    </div>
  )
}
