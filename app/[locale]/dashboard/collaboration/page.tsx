/**
 * Collaboration Hub - Real-time Team Collaboration
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Users,
  MessageSquare,
  Share2,
  MousePointer,
  Plus,
  Send,
  MoreVertical,
  UserPlus,
  Settings,
  Eye,
  EyeOff,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import DashboardBreadcrumbs from '@/components/navigation/DashboardBreadcrumbs';

interface Collaborator {
  id: string;
  name: string;
  avatar?: string;
  color: string;
  cursor?: { x: number; y: number };
  lastSeen: Date;
  isOnline: boolean;
}

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
  position?: { x: number; y: number };
  resolved: boolean;
  replies: Reply[];
}

interface Reply {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
}

interface SharedSession {
  id: string;
  name: string;
  description: string;
  collaborators: Collaborator[];
  comments: Comment[];
  createdAt: Date;
  lastActivity: Date;
  isActive: boolean;
}

export default function CollaborationPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const [sessions, setSessions] = useState<SharedSession[]>([]);
  const [activeSession, setActiveSession] = useState<SharedSession | null>(null);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(true);
  const [showCollaborators, setShowCollaborators] = useState(true);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Mock data for demonstration
    const mockSessions: SharedSession[] = [
      {
        id: '1',
        name: 'Frontend Development Sprint',
        description: 'Working on the new dashboard components',
        collaborators: [
          {
            id: '1',
            name: 'Alice Johnson',
            color: '#3B82F6',
            lastSeen: new Date(),
            isOnline: true,
            cursor: { x: 150, y: 200 },
          },
          {
            id: '2',
            name: 'Bob Smith',
            color: '#10B981',
            lastSeen: new Date(Date.now() - 300000), // 5 minutes ago
            isOnline: false,
          },
        ],
        comments: [
          {
            id: '1',
            author: 'Alice Johnson',
            content: 'This component needs better error handling',
            timestamp: new Date(Date.now() - 3600000), // 1 hour ago
            position: { x: 100, y: 150 },
            resolved: false,
            replies: [
              {
                id: '1',
                author: 'Bob Smith',
                content: 'I agree, let me add that',
                timestamp: new Date(Date.now() - 3300000),
              },
            ],
          },
        ],
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
        lastActivity: new Date(Date.now() - 300000),
        isActive: true,
      },
      {
        id: '2',
        name: 'API Design Review',
        description: 'Reviewing the new REST API endpoints',
        collaborators: [
          {
            id: '3',
            name: 'Charlie Brown',
            color: '#F59E0B',
            lastSeen: new Date(),
            isOnline: true,
          },
        ],
        comments: [],
        createdAt: new Date(Date.now() - 172800000), // 2 days ago
        lastActivity: new Date(Date.now() - 7200000), // 2 hours ago
        isActive: false,
      },
    ];

    setSessions(mockSessions);
    setActiveSession(mockSessions[0]);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const addComment = () => {
    if (!newComment.trim() || !activeSession) return;

    const comment: Comment = {
      id: Date.now().toString(),
      author: 'Current User', // In real app, get from auth
      content: newComment,
      timestamp: new Date(),
      position: mousePosition,
      resolved: false,
      replies: [],
    };

    setActiveSession((prev) =>
      prev
        ? {
            ...prev,
            comments: [...prev.comments, comment],
          }
        : null,
    );

    setNewComment('');
  };

  const resolveComment = (commentId: string) => {
    setActiveSession((prev) =>
      prev
        ? {
            ...prev,
            comments: prev.comments.map((comment) =>
              comment.id === commentId ? { ...comment, resolved: true } : comment,
            ),
          }
        : null,
    );
  };

  const createNewSession = () => {
    const newSession: SharedSession = {
      id: Date.now().toString(),
      name: 'New Collaboration Session',
      description: 'Start collaborating on your project',
      collaborators: [],
      comments: [],
      createdAt: new Date(),
      lastActivity: new Date(),
      isActive: true,
    };

    setSessions((prev) => [newSession, ...prev]);
    setActiveSession(newSession);
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Collaboration Hub</h1>
            <p className="text-sm text-muted-foreground">
              Real-time collaboration with live cursors and shared sessions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={createNewSession}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            New Session
          </button>
        </div>
      </div>

      <DashboardBreadcrumbs />

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sessions Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-card rounded-lg border p-4">
            <h3 className="text-lg font-semibold mb-4">Active Sessions</h3>
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => setActiveSession(session)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    activeSession?.id === session.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{session.name}</h4>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        session.isActive ? 'bg-green-500' : 'bg-gray-400'
                      }`}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{session.description}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{session.collaborators.length} collaborators</span>
                    <span>{session.comments.length} comments</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Collaboration Area */}
        <div className="lg:col-span-3 space-y-6">
          {activeSession ? (
            <>
              {/* Session Header */}
              <div className="bg-card rounded-lg border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold">{activeSession.name}</h2>
                    <p className="text-sm text-muted-foreground">{activeSession.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowCollaborators(!showCollaborators)}
                      className="p-2 rounded-md hover:bg-accent"
                    >
                      <Users className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setShowComments(!showComments)}
                      className="p-2 rounded-md hover:bg-accent"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </button>
                    <button className="p-2 rounded-md hover:bg-accent">
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Collaborators */}
                {showCollaborators && (
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-sm font-medium">Collaborators:</span>
                    {activeSession.collaborators.map((collaborator) => (
                      <div key={collaborator.id} className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium"
                          style={{ backgroundColor: collaborator.color }}
                        >
                          {collaborator.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium">{collaborator.name}</span>
                          <div className="flex items-center gap-1">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                collaborator.isOnline ? 'bg-green-500' : 'bg-gray-400'
                              }`}
                            />
                            <span className="text-xs text-muted-foreground">
                              {collaborator.isOnline ? 'Online' : 'Offline'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Collaboration Canvas */}
              <div className="bg-card rounded-lg border overflow-hidden">
                <div
                  ref={canvasRef}
                  className="relative h-96 bg-gray-50 dark:bg-gray-900 cursor-crosshair"
                  onMouseMove={handleMouseMove}
                  onClick={() => {
                    // Handle canvas clicks for comments
                  }}
                >
                  {/* Mock collaborative content */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
                        <Share2 className="h-12 w-12 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Collaboration Canvas</h3>
                      <p className="text-sm text-muted-foreground">
                        Click anywhere to add comments and collaborate in real-time
                      </p>
                    </div>
                  </div>

                  {/* Live Cursors */}
                  {activeSession.collaborators
                    .filter((c) => c.isOnline && c.cursor)
                    .map((collaborator) => (
                      <div
                        key={`cursor-${collaborator.id}`}
                        className="absolute pointer-events-none z-10"
                        style={{
                          left: collaborator.cursor!.x,
                          top: collaborator.cursor!.y,
                          transform: 'translate(-2px, -2px)',
                        }}
                      >
                        <MousePointer className="h-4 w-4" style={{ color: collaborator.color }} />
                        <div
                          className="absolute top-4 left-0 px-2 py-1 rounded text-xs text-white font-medium whitespace-nowrap"
                          style={{ backgroundColor: collaborator.color }}
                        >
                          {collaborator.name}
                        </div>
                      </div>
                    ))}

                  {/* Comments */}
                  {showComments &&
                    activeSession.comments
                      .filter((comment) => !comment.resolved)
                      .map((comment) => (
                        <div
                          key={comment.id}
                          className="absolute z-20"
                          style={{
                            left: comment.position?.x || 100,
                            top: comment.position?.y || 100,
                          }}
                        >
                          <div className="bg-white dark:bg-gray-800 border rounded-lg shadow-lg p-3 max-w-xs">
                            <div className="flex items-start gap-2 mb-2">
                              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                {comment.author
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium">{comment.author}</p>
                                <p className="text-xs text-muted-foreground">
                                  {comment.timestamp.toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm">{comment.content}</p>
                            {comment.replies.length > 0 && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {comment.replies.length} reply(ies)
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                </div>
              </div>

              {/* Comments Panel */}
              {showComments && (
                <div className="bg-card rounded-lg border p-6">
                  <h3 className="text-lg font-semibold mb-4">Comments</h3>

                  {/* Add Comment */}
                  <div className="flex gap-3 mb-4">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 px-3 py-2 border rounded-md"
                      onKeyPress={(e) => e.key === 'Enter' && addComment()}
                    />
                    <button
                      onClick={addComment}
                      disabled={!newComment.trim()}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                      Add
                    </button>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-4">
                    {activeSession.comments.map((comment) => (
                      <div key={comment.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                              {comment.author
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{comment.author}</p>
                              <p className="text-xs text-muted-foreground">
                                {comment.timestamp.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {comment.resolved ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <button
                                onClick={() => resolveComment(comment.id)}
                                className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                              >
                                Resolve
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-sm mb-3">{comment.content}</p>

                        {/* Replies */}
                        {comment.replies.length > 0 && (
                          <div className="space-y-2 ml-10">
                            {comment.replies.map((reply) => (
                              <div
                                key={reply.id}
                                className="bg-gray-50 dark:bg-gray-800 rounded p-3"
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs">
                                    {reply.author
                                      .split(' ')
                                      .map((n) => n[0])
                                      .join('')}
                                  </div>
                                  <p className="font-medium text-sm">{reply.author}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {reply.timestamp.toLocaleString()}
                                  </p>
                                </div>
                                <p className="text-sm">{reply.content}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}

                    {activeSession.comments.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No comments yet. Click on the canvas to add the first comment!</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Active Session</h3>
              <p className="text-muted-foreground mb-4">
                Select a session from the sidebar or create a new one to start collaborating.
              </p>
              <button
                onClick={createNewSession}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Create New Session
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
