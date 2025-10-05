/**
 * Team Management - Multi-tenancy & Team Collaboration
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Crown,
  Shield,
  Mail,
  Settings,
  Trash2,
  Edit,
  Check,
  X,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Building,
  Globe,
  Lock,
  Eye,
  Send,
} from 'lucide-react';
import DashboardBreadcrumbs from '@/components/navigation/DashboardBreadcrumbs';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  status: 'active' | 'pending' | 'inactive';
  joinedAt: Date;
  lastActive: Date;
  permissions: string[];
}

interface Team {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  ownerId: string;
  members: TeamMember[];
  workspaces: Workspace[];
  settings: TeamSettings;
  createdAt: Date;
  plan: 'free' | 'pro' | 'enterprise';
}

interface Workspace {
  id: string;
  name: string;
  description: string;
  type: 'private' | 'team' | 'public';
  members: string[]; // member IDs
  createdAt: Date;
}

interface TeamSettings {
  allowPublicWorkspaces: boolean;
  requireApproval: boolean;
  maxMembers: number;
  features: {
    aiAssistant: boolean;
    collaboration: boolean;
    advancedAnalytics: boolean;
    customIntegrations: boolean;
  };
}

interface Invitation {
  id: string;
  email: string;
  role: TeamMember['role'];
  invitedBy: string;
  invitedAt: Date;
  expiresAt: Date;
  status: 'pending' | 'accepted' | 'expired' | 'declined';
}

const rolePermissions = {
  owner: ['manage_team', 'manage_members', 'manage_billing', 'delete_team', 'manage_workspaces'],
  admin: ['manage_members', 'manage_workspaces', 'view_analytics', 'manage_settings'],
  member: ['create_workspaces', 'edit_workspaces', 'invite_members', 'view_team'],
  viewer: ['view_workspaces', 'view_team', 'comment'],
};

const roleColors = {
  owner: 'bg-purple-100 text-purple-800',
  admin: 'bg-blue-100 text-blue-800',
  member: 'bg-green-100 text-green-800',
  viewer: 'bg-gray-100 text-gray-800',
};

export default function TeamManagementPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newInvitation, setNewInvitation] = useState({
    email: '',
    role: 'member' as TeamMember['role'],
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [editingMember, setEditingMember] = useState<string | null>(null);

  useEffect(() => {
    // Mock team data
    const mockTeam: Team = {
      id: '1',
      name: 'SIGMACODE AI Team',
      description: 'Enterprise AI development and collaboration platform',
      ownerId: 'owner-1',
      plan: 'enterprise',
      createdAt: new Date('2024-01-15'),
      members: [
        {
          id: 'owner-1',
          name: 'John Doe',
          email: 'john@sigmacode.ai',
          role: 'owner',
          status: 'active',
          joinedAt: new Date('2024-01-15'),
          lastActive: new Date(),
          permissions: rolePermissions.owner,
        },
        {
          id: 'admin-1',
          name: 'Jane Smith',
          email: 'jane@sigmacode.ai',
          role: 'admin',
          status: 'active',
          joinedAt: new Date('2024-01-20'),
          lastActive: new Date(Date.now() - 3600000),
          permissions: rolePermissions.admin,
        },
        {
          id: 'member-1',
          name: 'Bob Johnson',
          email: 'bob@sigmacode.ai',
          role: 'member',
          status: 'active',
          joinedAt: new Date('2024-02-01'),
          lastActive: new Date(Date.now() - 7200000),
          permissions: rolePermissions.member,
        },
        {
          id: 'viewer-1',
          name: 'Alice Brown',
          email: 'alice@company.com',
          role: 'viewer',
          status: 'pending',
          joinedAt: new Date('2024-02-10'),
          lastActive: new Date(Date.now() - 86400000),
          permissions: rolePermissions.viewer,
        },
      ],
      workspaces: [
        {
          id: 'ws-1',
          name: 'Frontend Development',
          description: 'React components and UI development',
          type: 'team',
          members: ['owner-1', 'admin-1', 'member-1'],
          createdAt: new Date('2024-01-15'),
        },
        {
          id: 'ws-2',
          name: 'Backend API',
          description: 'REST API and database development',
          type: 'private',
          members: ['owner-1', 'admin-1'],
          createdAt: new Date('2024-01-20'),
        },
      ],
      settings: {
        allowPublicWorkspaces: false,
        requireApproval: true,
        maxMembers: 50,
        features: {
          aiAssistant: true,
          collaboration: true,
          advancedAnalytics: true,
          customIntegrations: true,
        },
      },
    };

    const mockInvitations: Invitation[] = [
      {
        id: 'inv-1',
        email: 'newmember@company.com',
        role: 'member',
        invitedBy: 'owner-1',
        invitedAt: new Date(Date.now() - 86400000),
        expiresAt: new Date(Date.now() + 604800000), // 7 days
        status: 'pending',
      },
    ];

    setCurrentTeam(mockTeam);
    setInvitations(mockInvitations);
  }, []);

  const filteredMembers =
    currentTeam?.members.filter((member) => {
      const matchesSearch =
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = filterRole === 'all' || member.role === filterRole;
      return matchesSearch && matchesRole;
    }) || [];

  const sendInvitation = () => {
    if (!newInvitation.email.trim()) return;

    const invitation: Invitation = {
      id: Date.now().toString(),
      email: newInvitation.email,
      role: newInvitation.role,
      invitedBy: 'current-user', // In real app, get from auth
      invitedAt: new Date(),
      expiresAt: new Date(Date.now() + 604800000), // 7 days
      status: 'pending',
    };

    setInvitations((prev) => [...prev, invitation]);
    setNewInvitation({ email: '', role: 'member' });
    setShowInviteModal(false);
  };

  const updateMemberRole = (memberId: string, newRole: TeamMember['role']) => {
    setCurrentTeam((prev) =>
      prev
        ? {
            ...prev,
            members: prev.members.map((member) =>
              member.id === memberId
                ? { ...member, role: newRole, permissions: rolePermissions[newRole] }
                : member,
            ),
          }
        : null,
    );
    setEditingMember(null);
  };

  const removeMember = (memberId: string) => {
    setCurrentTeam((prev) =>
      prev
        ? {
            ...prev,
            members: prev.members.filter((member) => member.id !== memberId),
          }
        : null,
    );
  };

  const getRoleIcon = (role: TeamMember['role']) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4" />;
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'member':
        return <Users className="h-4 w-4" />;
      case 'viewer':
        return <Eye className="h-4 w-4" />;
    }
  };

  const getWorkspaceTypeIcon = (type: Workspace['type']) => {
    switch (type) {
      case 'private':
        return <Lock className="h-4 w-4 text-red-500" />;
      case 'team':
        return <Users className="h-4 w-4 text-blue-500" />;
      case 'public':
        return <Globe className="h-4 w-4 text-green-500" />;
    }
  };

  if (!currentTeam) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Team Management</h1>
            <p className="text-sm text-muted-foreground">
              Manage your team members, roles, and workspaces
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
            <Building className="h-4 w-4" />
            {currentTeam.plan.charAt(0).toUpperCase() + currentTeam.plan.slice(1)} Plan
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            <UserPlus className="h-4 w-4" />
            Invite Member
          </button>
        </div>
      </div>

      <DashboardBreadcrumbs />

      {/* Team Overview */}
      <div className="grid gap-6 md:grid-cols-4">
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{currentTeam.members.length}</p>
              <p className="text-sm text-muted-foreground">Total Members</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {currentTeam.members.filter((m) => m.status === 'active').length}
              </p>
              <p className="text-sm text-muted-foreground">Active Members</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Building className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{currentTeam.workspaces.length}</p>
              <p className="text-sm text-muted-foreground">Workspaces</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Mail className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {invitations.filter((i) => i.status === 'pending').length}
              </p>
              <p className="text-sm text-muted-foreground">Pending Invites</p>
            </div>
          </div>
        </div>
      </div>

      {/* Members Management */}
      <div className="bg-card rounded-lg border">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Team Members</h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-md w-64"
                />
              </div>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Roles</option>
                <option value="owner">Owner</option>
                <option value="admin">Admin</option>
                <option value="member">Member</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
          </div>
        </div>

        <div className="divide-y">
          {filteredMembers.map((member) => (
            <div key={member.id} className="p-6 hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    {member.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium">
                        {member.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{member.name}</h3>
                      {member.status === 'pending' && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          Pending
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Joined {member.joinedAt.toLocaleDateString()} • Last active{' '}
                      {member.lastActive.toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {editingMember === member.id ? (
                    <select
                      value={member.role}
                      onChange={(e) =>
                        updateMemberRole(member.id, e.target.value as TeamMember['role'])
                      }
                      className="px-3 py-1 border rounded text-sm"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                      {member.role === 'owner' && <option value="owner">Owner</option>}
                    </select>
                  ) : (
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${roleColors[member.role]}`}
                    >
                      {getRoleIcon(member.role)}
                      {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                    </span>
                  )}

                  <div className="flex items-center gap-1">
                    {editingMember === member.id ? (
                      <>
                        <button
                          onClick={() => setEditingMember(null)}
                          className="p-1 hover:bg-green-100 rounded"
                        >
                          <Check className="h-4 w-4 text-green-600" />
                        </button>
                        <button
                          onClick={() => setEditingMember(null)}
                          className="p-1 hover:bg-red-100 rounded"
                        >
                          <X className="h-4 w-4 text-red-600" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditingMember(member.id)}
                          className="p-1 hover:bg-gray-100 rounded"
                          disabled={member.role === 'owner'}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => removeMember(member.id)}
                          className="p-1 hover:bg-red-100 rounded"
                          disabled={member.role === 'owner'}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Workspaces */}
      <div className="bg-card rounded-lg border">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Workspaces</h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              Create Workspace
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid gap-4 md:grid-cols-2">
            {currentTeam.workspaces.map((workspace) => (
              <div
                key={workspace.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium flex items-center gap-2">
                      {getWorkspaceTypeIcon(workspace.type)}
                      {workspace.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{workspace.description}</p>
                  </div>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{workspace.members.length} members</span>
                  <span className="text-muted-foreground">
                    Created {workspace.createdAt.toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <div className="bg-card rounded-lg border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Pending Invitations</h2>
          </div>

          <div className="divide-y">
            {invitations.map((invitation) => (
              <div key={invitation.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Mail className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium">{invitation.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Invited as {invitation.role} • Expires{' '}
                        {invitation.expiresAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        invitation.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : invitation.status === 'accepted'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                    </span>
                    {invitation.status === 'pending' && (
                      <button className="flex items-center gap-1 px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90">
                        <Send className="h-3 w-3" />
                        Resend
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Invite Team Member</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  value={newInvitation.email}
                  onChange={(e) => setNewInvitation((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="member@company.com"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <select
                  value={newInvitation.role}
                  onChange={(e) =>
                    setNewInvitation((prev) => ({
                      ...prev,
                      role: e.target.value as TeamMember['role'],
                    }))
                  }
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="viewer">Viewer - Can view team content</option>
                  <option value="member">Member - Can create and edit</option>
                  <option value="admin">Admin - Can manage team and members</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowInviteModal(false)}
                className="flex-1 px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={sendInvitation}
                disabled={!newInvitation.email.trim()}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
              >
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
