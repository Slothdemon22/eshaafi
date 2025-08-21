'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toaster';
import { API_ENDPOINTS, buildApiUrl } from '@/lib/config';
import { ArrowLeft, Edit, Trash2, Shield, Users, Search } from 'lucide-react';

type Role = 'PATIENT' | 'DOCTOR' | 'ADMIN' | 'CLINIC_ADMIN' | 'SUPER_ADMIN';

interface UserRow {
  id: number;
  name: string;
  email: string;
  role: Role;
}

const AdminUsersPage: React.FC = () => {
  const { isAuthenticated, isAdmin, isSuperAdmin } = useAuth();
  const { addToast } = useToast();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<null | UserRow>(null);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q));
  }, [users, query]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(buildApiUrl(API_ENDPOINTS.getUsers), { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch users');
      setUsers(data.users || []);
    } catch (e: any) {
      addToast({ type: 'error', title: 'Error', message: e.message || 'Failed to load users' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && (isAdmin || isSuperAdmin)) fetchUsers();
  }, [isAuthenticated, isAdmin, isSuperAdmin]);

  const onSave = async () => {
    if (!editing) return;
    try {
      const res = await fetch(buildApiUrl(API_ENDPOINTS.updateUser(String(editing.id))), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: editing.name, email: editing.email, role: editing.role })
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Failed to update user');
      addToast({ type: 'success', title: 'Updated', message: 'User updated successfully' });
      setEditing(null);
      fetchUsers();
    } catch (e: any) {
      addToast({ type: 'error', title: 'Update failed', message: e.message || 'Try again' });
    }
  };

  const onDelete = async (id: number) => {
    try {
      const res = await fetch(buildApiUrl(API_ENDPOINTS.deleteUser(String(id))), {
        method: 'DELETE',
        credentials: 'include'
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Failed to delete user');
      addToast({ type: 'success', title: 'Deleted', message: 'User deleted' });
      fetchUsers();
    } catch (e: any) {
      addToast({ type: 'error', title: 'Delete failed', message: e.message || 'Try again' });
    }
  };

  if (!isAuthenticated || (!isAdmin && !isSuperAdmin)) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="text-center">
          <div className="w-20 h-20 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-elevated">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-[#1F2937] mb-4 heading-font">Access Denied</h2>
          <p className="text-[#4B5563] mb-8 text-lg">You need to be admin or super admin to access this page.</p>
          <Link href="/login" className="btn-primary">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/admin/dashboard" className="inline-flex items-center space-x-2 text-[#0E6BA8] hover:text-[#0B5A8A] mb-6 font-medium">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold text-[#1F2937] heading-font flex items-center gap-2"><Users className="w-7 h-7 text-[#0E6BA8]" /> Users</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={query} onChange={e => setQuery(e.target.value)} className="input-field pl-9" placeholder="Search users..." />
            </div>
          </div>
        </div>

        <div className="card-hover overflow-x-auto">
          {loading ? (
            <div className="p-6">Loading...</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Role</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id} className="border-b border-gray-100">
                    <td className="py-3 px-4">
                      {editing?.id === u.id ? (
                        <input className="input-field" value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} />
                      ) : (
                        <span className="font-medium text-[#1F2937]">{u.name}</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editing?.id === u.id ? (
                        <input className="input-field" value={editing.email} onChange={e => setEditing({ ...editing, email: e.target.value })} />
                      ) : (
                        <span className="text-[#4B5563]">{u.email}</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editing?.id === u.id ? (
                        <select className="input-field" value={editing.role} onChange={e => setEditing({ ...editing, role: e.target.value as Role })}>
                          <option value="PATIENT">PATIENT</option>
                          <option value="DOCTOR">DOCTOR</option>
                          <option value="ADMIN">ADMIN</option>
                          <option value="CLINIC_ADMIN">CLINIC_ADMIN</option>
                          <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                        </select>
                      ) : (
                        <span className="text-[#1F2937]">{u.role}</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editing?.id === u.id ? (
                        <div className="flex items-center gap-2">
                          <button onClick={onSave} className="btn-primary">Save</button>
                          <button onClick={() => setEditing(null)} className="btn-secondary">Cancel</button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button onClick={() => setEditing(u)} className="btn-secondary flex items-center gap-1"><Edit className="w-4 h-4" /> Edit</button>
                          <button onClick={() => onDelete(u.id)} className="btn-outline flex items-center gap-1 text-red-600"><Trash2 className="w-4 h-4" /> Delete</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage;


