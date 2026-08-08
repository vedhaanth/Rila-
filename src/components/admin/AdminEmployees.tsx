import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { Employee } from '../../types';
import { Users, Plus, Trash2, Edit, Mail, Lock, UserCheck, ShieldAlert, Phone, Check, X } from 'lucide-react';

export const AdminEmployees: React.FC = () => {
  const { activeAdminId, addToast } = useApp();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('order_manager');
  const [submitting, setSubmitting] = useState(false);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const list = await api.getEmployees(activeAdminId);
      setEmployees(list);
    } catch (err) {
      console.error(err);
      addToast('Error', 'Failed to load employees', 'error');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEmployees();
  }, [activeAdminId]);

  const openCreateModal = () => {
    setEditingEmp(null);
    setName('');
    setEmail('');
    setPassword('');
    setPhone('');
    setRole('order_manager');
    setIsModalOpen(true);
  };

  const openEditModal = (emp: Employee) => {
    setEditingEmp(emp);
    setName(emp.name);
    setEmail(emp.email);
    setPassword('');
    setPhone(emp.phone || '');
    setRole(emp.role || 'order_manager');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setSubmitting(true);
    try {
      if (editingEmp) {
        const updatePayload: any = { name: name.trim(), email: email.trim(), phone: phone.trim(), role };
        if (password.trim()) {
          updatePayload.password = password.trim();
        }
        await api.updateEmployee(editingEmp.employee_id, updatePayload);
        addToast('Employee Updated', `Updated details for ${name}`);
      } else {
        if (!password.trim()) {
          addToast('Password Required', 'Please set a password for the new employee', 'error');
          setSubmitting(false);
          return;
        }
        await api.createEmployee({
          admin_id: activeAdminId,
          name: name.trim(),
          email: email.trim(),
          password: password.trim(),
          phone: phone.trim(),
          role
        });
        addToast('Employee Created', `Added ${name} to your team`);
      }
      setIsModalOpen(false);
      fetchEmployees();
    } catch (err: any) {
      addToast('Error', err.message || 'Operation failed', 'error');
    }
    setSubmitting(false);
  };

  const handleDelete = async (emp: Employee) => {
    if (!window.confirm(`Are you sure you want to remove ${emp.name}?`)) return;

    try {
      await api.deleteEmployee(emp.employee_id);
      addToast('Employee Removed', `Removed ${emp.name}`);
      fetchEmployees();
    } catch (err: any) {
      addToast('Error', err.message || 'Failed to delete employee', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-500" />
            Employee & Staff Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage staff credentials and assign order management permissions for division {activeAdminId}
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          Add New Employee
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading staff directory...</div>
        ) : employees.length === 0 ? (
          <div className="p-12 text-center">
            <UserCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">No Employees Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              You haven't created any staff accounts yet. Click "Add New Employee" to give staff access to order management.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-400 uppercase font-extrabold text-[10px]">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {employees.map((emp) => (
                  <tr key={emp.employee_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 font-bold flex items-center justify-center">
                          {emp.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">{emp.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{emp.employee_id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                      {emp.email}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {emp.phone || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold text-[10px] rounded-full uppercase">
                        {emp.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(emp)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="Edit Employee"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(emp)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="Delete Employee"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Employee Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {editingEmp ? 'Edit Employee Credentials' : 'Create Staff Member'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Email Address (Login)</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rahul@smartretail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Password {editingEmp && <span className="text-[10px] text-slate-400">(Leave blank to keep unchanged)</span>}
                </label>
                <input
                  type="password"
                  required={!editingEmp}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={editingEmp ? '••••••••' : 'Set login password'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Phone Number (Optional)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Assigned Portal Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="order_manager">Order Manager (Order Status Updates)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold transition shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingEmp ? 'Save Changes' : 'Create Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
