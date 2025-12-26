'use client';

import { useEffect, useState } from 'react';
import { Course, Group, GroupMember } from '@/lib/types';
import LoadingSpinner from './LoadingSpinner';
import styles from '@/styles/group-modal.module.scss';

interface GroupModalProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
}

export default function GroupModal({ course, isOpen, onClose }: GroupModalProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Create group form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createContact, setCreateContact] = useState('');
  const [createTeeTime, setCreateTeeTime] = useState('');
  const [createNote, setCreateNote] = useState('');
  const [creating, setCreating] = useState(false);
  
  // Join group state
  const [joiningGroupId, setJoiningGroupId] = useState<string | null>(null);
  const [joinName, setJoinName] = useState('');
  const [joinContact, setJoinContact] = useState('');

  // Fetch groups when modal opens
  useEffect(() => {
    if (isOpen && course.id) {
      fetchGroups();
    }
  }, [isOpen, course.id]);

  const fetchGroups = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/groups?courseId=${course.id}`);
      if (response.ok) {
        const data = await response.json();
        setGroups(data);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch groups' }));
        setError(errorData.error || 'Failed to fetch groups');
      }
    } catch (err) {
      console.error('Failed to fetch groups:', err);
      setError('Failed to fetch groups');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!createName.trim()) {
      setError('Name is required');
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: course.id,
          name: createName.trim(),
          contact: createContact.trim() || undefined,
          teeTime: createTeeTime || undefined,
          note: createNote.trim() || undefined,
        }),
      });

      if (response.ok) {
        const newGroup = await response.json();
        setGroups([newGroup, ...groups]);
        setShowCreateForm(false);
        setCreateName('');
        setCreateContact('');
        setCreateTeeTime('');
        setCreateNote('');
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to create group' }));
        setError(errorData.error || 'Failed to create group');
      }
    } catch (err) {
      console.error('Failed to create group:', err);
      setError('Failed to create group');
    } finally {
      setCreating(false);
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    if (!joinName.trim()) {
      setError('Name is required to join a group');
      return;
    }

    setJoiningGroupId(groupId);
    setError(null);

    try {
      const response = await fetch('/api/groups/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupId,
          name: joinName.trim(),
          contact: joinContact.trim() || undefined,
        }),
      });

      if (response.ok) {
        const updatedGroup = await response.json();
        setGroups(groups.map(g => g.id === groupId ? updatedGroup : g));
        setJoiningGroupId(null);
        setJoinName('');
        setJoinContact('');
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to join group' }));
        setError(errorData.error || 'Failed to join group');
      }
    } catch (err) {
      console.error('Failed to join group:', err);
      setError('Failed to join group');
    } finally {
      setJoiningGroupId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Play with Others</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.courseInfo}>
            <h3 className={styles.courseName}>{course.name}</h3>
            {course.yardage && course.slope_rating && (
              <p className={styles.courseDetails}>
                {course.yardage.toLocaleString()} yards • Slope: {course.slope_rating}
              </p>
            )}
          </div>

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          {loading ? (
            <div className={styles.loadingContainer}>
              <LoadingSpinner />
            </div>
          ) : (
            <>
              {/* Existing Groups */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Open Groups</h3>
                {groups.length === 0 ? (
                  <p className={styles.emptyText}>No open groups yet. Be the first to create one!</p>
                ) : (
                  <div className={styles.groupsList}>
                    {groups.map((group) => {
                      const isFull = (group.member_count || 0) >= 4;
                      const isJoining = joiningGroupId === group.id;
                      
                      return (
                        <div key={group.id} className={styles.groupCard}>
                          <div className={styles.groupHeader}>
                            <div className={styles.groupInfo}>
                              <span className={styles.memberCount}>
                                {group.member_count || 0} / 4 players
                              </span>
                              {isFull && <span className={styles.fullBadge}>Full</span>}
                            </div>
                            {group.tee_time && (
                              <div className={styles.teeTime}>
                                Tee Time: {new Date(group.tee_time).toLocaleString()}
                              </div>
                            )}
                          </div>
                          
                          {group.note && (
                            <p className={styles.groupNote}>{group.note}</p>
                          )}

                          {group.members && group.members.length > 0 && (
                            <div className={styles.membersList}>
                              <strong>Members:</strong>
                              <ul>
                                {group.members.map((member) => (
                                  <li key={member.id}>{member.name}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {!isFull && (
                            <div className={styles.joinForm}>
                              <input
                                type="text"
                                placeholder="Your name"
                                value={joinName}
                                onChange={(e) => setJoinName(e.target.value)}
                                className={styles.input}
                                disabled={isJoining}
                              />
                              <input
                                type="text"
                                placeholder="Contact (optional)"
                                value={joinContact}
                                onChange={(e) => setJoinContact(e.target.value)}
                                className={styles.input}
                                disabled={isJoining}
                              />
                              <button
                                onClick={() => handleJoinGroup(group.id)}
                                disabled={isJoining || !joinName.trim()}
                                className={styles.joinButton}
                              >
                                {isJoining ? 'Joining...' : 'Join Group'}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Create New Group */}
              <div className={styles.section}>
                {!showCreateForm ? (
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className={styles.createButton}
                  >
                    Create New Group
                  </button>
                ) : (
                  <form onSubmit={handleCreateGroup} className={styles.createForm}>
                    <h3 className={styles.sectionTitle}>Create New Group</h3>
                    
                    <input
                      type="text"
                      placeholder="Your name *"
                      value={createName}
                      onChange={(e) => setCreateName(e.target.value)}
                      className={styles.input}
                      required
                      disabled={creating}
                    />
                    
                    <input
                      type="text"
                      placeholder="Contact (optional)"
                      value={createContact}
                      onChange={(e) => setCreateContact(e.target.value)}
                      className={styles.input}
                      disabled={creating}
                    />
                    
                    <input
                      type="datetime-local"
                      placeholder="Preferred tee time (optional)"
                      value={createTeeTime}
                      onChange={(e) => setCreateTeeTime(e.target.value)}
                      className={styles.input}
                      disabled={creating}
                    />
                    
                    <textarea
                      placeholder="Note (optional)"
                      value={createNote}
                      onChange={(e) => setCreateNote(e.target.value)}
                      className={styles.textarea}
                      rows={3}
                      disabled={creating}
                    />
                    
                    <div className={styles.formActions}>
                      <button
                        type="submit"
                        disabled={creating || !createName.trim()}
                        className={styles.submitButton}
                      >
                        {creating ? 'Creating...' : 'Create Group'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCreateForm(false);
                          setCreateName('');
                          setCreateContact('');
                          setCreateTeeTime('');
                          setCreateNote('');
                        }}
                        className={styles.cancelButton}
                        disabled={creating}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

