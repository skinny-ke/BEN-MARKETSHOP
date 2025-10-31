import React, { useState, useEffect } from 'react';
import { useClerkContext } from '../context/ClerkContext';
import { userService } from '../api/userService';
import {
  UserIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

const UserManagement = () => {
  const { isAdmin } = useClerkContext();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [newRole, setNewRole] = useState('user');

  useEffect(() => {
    if (isAdmin) fetchUsers();
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAllUsers();
      if (response && response.users) {
        setUsers(response.users);
      } else {
        toast.error('No users found or invalid response');
      }
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async (userId, role) => {
    try {
      await userService.updateUserRole(userId, role);
      setUsers(prev =>
        prev.map(u => (u._id === userId ? { ...u, role } : u))
      );
      toast.success('✅ User role updated successfully');
      setEditingUser(null);
    } catch (error) {
      console.error('❌ Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-600 font-medium">
          Access denied. Admin privileges required.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
        <span className="text-sm text-gray-500">Total Users: {users.length}</span>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['User', 'Clerk ID', 'Role', 'Created', 'Last Login', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-3 text-left font-medium text-gray-600 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(user => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {user.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt={user.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-800">{user.name || 'N/A'}</p>
                        <p className="text-gray-500">{user.email || '—'}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-gray-500">
                    {user.clerkUserId || '—'}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {user.role === 'admin' ? (
                        <ShieldCheckIcon className="h-5 w-5 text-green-500 mr-2" />
                      ) : (
                        <ShieldExclamationIcon className="h-5 w-5 text-gray-400 mr-2" />
                      )}
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'admin'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {user.role}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-gray-500">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                  </td>

                  <td className="px-6 py-4 text-gray-500">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : '—'}
                  </td>

                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        setEditingUser(user);
                        setNewRole(user.role);
                      }}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Update User Role</h3>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                <strong>User:</strong> {editingUser.name || 'N/A'}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Current Role:</strong> {editingUser.role}
              </p>

              <select
                value={newRole}
                onChange={e => setNewRole(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRoleUpdate(editingUser._id, newRole)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Update Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
