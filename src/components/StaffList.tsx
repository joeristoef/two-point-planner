import React, { useState } from 'react';
import { StaffMember, Skill } from '../types/index';
import { calculateUsedSkillSlots, FANTASY_EXPERT_BASE_STATS } from '../config/gameRules';
import { getSkillIcon, getStaffTypeIcon, getStatIcon } from '../utils/iconMaps';
import { getAvailableSkillSlots } from '../utils/staffLevelSystem';

// Staff type ordering
const STAFF_TYPES_ORDER: StaffMember['type'][] = [
  'Prehistory Expert',
  'Botany Expert',
  'Marine Life Expert',
  'Science Expert',
  'Space Expert',
  'Supernatural Expert',
  'Wildlife Expert',
  'Fantasy Expert',
  'Digital Expert',
  'Assistant',
  'Janitor',
  'Security Guard',
];

// Fantasy subtypes that should be grouped under "Fantasy Expert"
const FANTASY_SUBTYPES = new Set(['Barbarian', 'Bard', 'Rogue', 'Wizard']);

// Get the display name and grouping key for a staff type
const getGroupingKey = (type: StaffMember['type']): StaffMember['type'] => {
  if (FANTASY_SUBTYPES.has(type as any)) {
    return 'Fantasy Expert';
  }
  return type;
};

interface StaffListProps {
  staff: StaffMember[];
  onRemoveStaff: (id: string) => void;
  onRenameStaff?: (id: string, newName: string) => void;
  onSkillSlotClick?: (staffId: string, slotIndex: number) => void;
  onSkillLevelChange?: (staffId: string, skill: Skill, delta: number) => void;
  onStaffLevelChange?: (staffId: string, delta: number) => void;
  onStaffStatChange?: (staffId: string, stat: 'strength' | 'dexterity' | 'intelligence' | 'luck', delta: number) => void;
  onReorderStaff?: (staffIds: string[]) => void;
}

export const StaffList: React.FC<StaffListProps> = ({ staff, onRemoveStaff, onRenameStaff, onSkillSlotClick, onSkillLevelChange, onStaffLevelChange, onStaffStatChange, onReorderStaff }) => {
  const [expandedTypes, setExpandedTypes] = useState<Set<StaffMember['type']>>(
    new Set(STAFF_TYPES_ORDER)
  );
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [newName, setNewName] = useState<string>('');
  const [draggedMemberId, setDraggedMemberId] = useState<string | null>(null);

  const toggleTypeExpanded = (type: StaffMember['type']) => {
    const newExpanded = new Set(expandedTypes);
    if (newExpanded.has(type)) {
      newExpanded.delete(type);
    } else {
      newExpanded.add(type);
    }
    setExpandedTypes(newExpanded);
  };

  // Sort staff by STAFF_TYPES_ORDER and calculate dynamic numbering
  const sortedStaff = [...staff].sort((a, b) => {
    const aGrouping = getGroupingKey(a.type);
    const bGrouping = getGroupingKey(b.type);
    const aIndex = STAFF_TYPES_ORDER.indexOf(aGrouping);
    const bIndex = STAFF_TYPES_ORDER.indexOf(bGrouping);
    if (aIndex !== bIndex) return aIndex - bIndex;
    return 0;
  });

  // Calculate dynamic numbering based on count of each type
  // Note: This function is kept for reference but numbering is now handled via name parsing in display
  // const getStaffNumber = (member: StaffMember): number => {
  //   return sortedStaff.filter((m) => m.type === member.type && sortedStaff.indexOf(m) <= sortedStaff.indexOf(member)).length;
  // };

  // Group staff by their grouping key (e.g., all fantasy subtypes under "Fantasy Expert")
  const staffByType = new Map<StaffMember['type'], StaffMember[]>();
  STAFF_TYPES_ORDER.forEach(type => {
    const membersOfType = sortedStaff.filter(member => getGroupingKey(member.type) === type);
    if (membersOfType.length > 0) {
      staffByType.set(type, membersOfType);
    }
  });
  return (
    <div style={{ padding: '20px' }}>
      <h3 style={{ color: '#1a1a1a' }}>Staff Roster ({staff.length})</h3>
      {staff.length === 0 ? (
        <p style={{ color: '#6c757d' }}>No staff members yet. Add some to get started!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {Array.from(staffByType.entries()).map(([type, membersOfType]) => (
            <div key={type}>
              {/* Type Section Header */}
              <button
                onClick={() => toggleTypeExpanded(type)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 15px',
                  backgroundColor: '#f0f3f7',
                  border: '1px solid #dee2e6',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.95em',
                  color: '#1a1a1a',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#e9ecef';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f0f3f7';
                }}
              >
                <span style={{ fontSize: '1.1em' }}>
                  {expandedTypes.has(type) ? '▼' : '▶'}
                </span>
                <img 
                  src={getStaffTypeIcon(type)} 
                  alt={type}
                  style={{ width: '20px', height: '20px' }}
                />
                <span>{type}</span>
                <span style={{ marginLeft: 'auto', color: '#6c757d', fontWeight: 'normal', fontSize: '0.9em' }}>
                  {membersOfType.length} {membersOfType.length === 1 ? 'member' : 'members'}
                </span>
              </button>

              {/* Staff Members in Type */}
              {expandedTypes.has(type) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px', paddingLeft: '12px' }}>
                  {membersOfType.map((member) => {
                    const usedSlots = calculateUsedSkillSlots(member.skills);
                    const maxSlots = getAvailableSkillSlots(member.level);

                    return (
                      <div
                        key={member.id}
                        draggable
                        onDragStart={() => setDraggedMemberId(member.id)}
                        onDragEnd={() => setDraggedMemberId(null)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => {
                          if (draggedMemberId && draggedMemberId !== member.id && onReorderStaff) {
                            const draggedIndex = staff.findIndex(s => s.id === draggedMemberId);
                            const targetIndex = staff.findIndex(s => s.id === member.id);
                            if (draggedIndex !== -1 && targetIndex !== -1) {
                              const newOrder = [...staff];
                              const [draggedStaff] = newOrder.splice(draggedIndex, 1);
                              newOrder.splice(targetIndex, 0, draggedStaff);
                              onReorderStaff(newOrder.map(s => s.id));
                            }
                          }
                          setDraggedMemberId(null);
                        }}
                        style={{
                          padding: '15px',
                          border: `2px solid ${draggedMemberId === member.id ? '#4c6ef5' : '#dee2e6'}`,
                          borderRadius: '8px',
                          backgroundColor: draggedMemberId === member.id ? '#e7f5ff' : '#ffffff',
                          boxShadow: draggedMemberId === member.id ? '0 4px 8px rgba(76, 110, 245, 0.2)' : '0 2px 4px rgba(0,0,0,0.05)',
                          cursor: 'grab',
                          opacity: draggedMemberId === member.id ? 0.7 : 1,
                          transition: 'all 0.2s ease',
                        }}
                      >
                {/* Header with rename and remove buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                    <img 
                      src={getStaffTypeIcon(member.type)} 
                      alt={member.type}
                      style={{ width: '24px', height: '24px' }}
                    />
                    {renamingId === member.id ? (
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <input
                          type="text"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              onRenameStaff?.(member.id, newName || member.name);
                              setRenamingId(null);
                            } else if (e.key === 'Escape') {
                              setRenamingId(null);
                            }
                          }}
                          autoFocus
                          style={{
                            padding: '4px 8px',
                            border: '1px solid #1971c2',
                            borderRadius: '4px',
                            fontSize: '0.95em',
                            fontWeight: 'bold',
                          }}
                        />
                        <button
                          onClick={() => {
                            onRenameStaff?.(member.id, newName || member.name);
                            setRenamingId(null);
                          }}
                          style={{
                            backgroundColor: '#2f9e44',
                            color: '#ffffff',
                            border: 'none',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '0.85em',
                          }}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setRenamingId(null)}
                          style={{
                            backgroundColor: '#c92a2a',
                            color: '#ffffff',
                            border: 'none',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '0.85em',
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <h4 style={{ color: '#1a1a1a', margin: '0', flex: 1 }}>
                          {member.name}
                        </h4>
                      </>
                    )}
                  </div>
                  {renamingId !== member.id && (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => {
                          setRenamingId(member.id);
                          setNewName(member.name);
                        }}
                        style={{
                          backgroundColor: '#1971c2',
                          color: '#ffffff',
                          border: 'none',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          fontSize: '1em',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '32px',
                          height: '32px',
                        }}
                        title="Rename"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => onRemoveStaff(member.id)}
                        style={{
                          backgroundColor: '#c92a2a',
                          color: '#ffffff',
                          border: 'none',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          fontSize: '1em',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '32px',
                          height: '32px',
                        }}
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                {/* Skill and Level Controls */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  {/* Add Skill Button */}
                  <button
                    onClick={() => onSkillSlotClick?.(member.id, 0)}
                    disabled={usedSlots >= maxSlots}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: usedSlots >= maxSlots ? '#ccc' : '#1971c2',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: usedSlots >= maxSlots ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold',
                      fontSize: '0.9em',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      if (usedSlots < maxSlots) {
                        (e.target as HTMLButtonElement).style.backgroundColor = '#1864ab';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (usedSlots < maxSlots) {
                        (e.target as HTMLButtonElement).style.backgroundColor = '#1971c2';
                      }
                    }}
                  >
                    Add Skill
                  </button>

                  {/* Level Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#e7f5ff', padding: '4px 8px', borderRadius: '4px' }}>
                    <button
                      onClick={() => onStaffLevelChange?.(member.id, -5)}
                      disabled={member.level <= 1}
                      style={{
                        backgroundColor: member.level <= 1 ? '#ccc' : '#c92a2a',
                        color: '#ffffff',
                        border: 'none',
                        padding: '2px 4px',
                        borderRadius: '3px',
                        cursor: member.level <= 1 ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold',
                        fontSize: '0.7em',
                      }}
                    >
                      -5
                    </button>
                    <button
                      onClick={() => onStaffLevelChange?.(member.id, -1)}
                      disabled={member.level <= 1}
                      style={{
                        backgroundColor: member.level <= 1 ? '#ccc' : '#c92a2a',
                        color: '#ffffff',
                        border: 'none',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        cursor: member.level <= 1 ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold',
                        fontSize: '0.75em',
                      }}
                    >
                      −
                    </button>
                    <span style={{ color: '#1971c2', fontWeight: 'bold', fontSize: '0.85em', minWidth: '50px', textAlign: 'center' }}>Lv: {member.level}</span>
                    <button
                      onClick={() => onStaffLevelChange?.(member.id, 1)}
                      disabled={member.level >= 20}
                      style={{
                        backgroundColor: member.level >= 20 ? '#ccc' : '#2f9e44',
                        color: '#ffffff',
                        border: 'none',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        cursor: member.level >= 20 ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold',
                        fontSize: '0.75em',
                      }}
                    >
                      +
                    </button>
                    <button
                      onClick={() => onStaffLevelChange?.(member.id, 5)}
                      disabled={member.level >= 20}
                      style={{
                        backgroundColor: member.level >= 20 ? '#ccc' : '#2f9e44',
                        color: '#ffffff',
                        border: 'none',
                        padding: '2px 4px',
                        borderRadius: '3px',
                        cursor: member.level >= 20 ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold',
                        fontSize: '0.7em',
                      }}
                    >
                      +5
                    </button>
                  </div>
                </div>

                {/* Skills list */}
                {member.skills.size > 0 && (
                  <div style={{ paddingTop: '12px', borderTop: '1px solid #eee' }}>
                    <p style={{ color: '#666', margin: '0 0 8px 0', fontSize: '0.85em' }}>
                      Skills ({usedSlots}/{maxSlots} slots):
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {Array.from(member.skills.entries()).map(([skill, level]) => (
                        <div
                          key={skill}
                          style={{
                            backgroundColor: '#d0ebff',
                            color: '#1971c2',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '0.85em',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <img
                            src={getSkillIcon(skill as Skill)}
                            alt={skill}
                            style={{ width: '16px', height: '16px' }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                          <button
                            onClick={() => onSkillLevelChange?.(member.id, skill as Skill, -1)}
                            style={{
                              backgroundColor: '#c92a2a',
                              color: '#ffffff',
                              border: 'none',
                              padding: '2px 6px',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              fontWeight: 'bold',
                              fontSize: '0.75em',
                            }}
                          >
                            −
                          </button>
                          {skill} (Level {level})
                          <button
                            onClick={() => onSkillLevelChange?.(member.id, skill as Skill, 1)}
                            style={{
                              backgroundColor: level >= 3 || usedSlots >= maxSlots ? '#ccc' : '#2f9e44',
                              color: '#ffffff',
                              border: 'none',
                              padding: '2px 6px',
                              borderRadius: '3px',
                              cursor: level >= 3 || usedSlots >= maxSlots ? 'not-allowed' : 'pointer',
                              fontWeight: 'bold',
                              fontSize: '0.75em',
                            }}
                            disabled={level >= 3 || usedSlots >= maxSlots}
                          >
                            +
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stats for Fantasy Experts */}
                {member.stats && (
                  <div style={{ paddingTop: '12px', borderTop: '1px solid #eee' }}>
                    <p style={{ color: '#666', margin: '0 0 8px 0', fontSize: '0.85em' }}>
                      Stats:
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {(['strength', 'dexterity', 'intelligence', 'luck'] as const).map((stat) => {
                        const value = member.stats![stat];
                        const baseStats = FANTASY_EXPERT_BASE_STATS[member.type];
                        const baseStat = baseStats ? baseStats[stat] : 0;
                        
                        // Calculate available bonus points
                        const totalBase = baseStats ? (Object.values(baseStats) as number[]).reduce((a, b) => a + b, 0) : 0;
                        const currentTotal = (Object.values(member.stats!) as number[]).reduce((a, b) => a + b, 0);
                        const bonusPointsSpent = currentTotal - totalBase;
                        const availableBonusPoints = member.level - 1;
                        const canDecrease = value > baseStat;
                        const canIncrease = bonusPointsSpent < availableBonusPoints;
                        
                        const statLabels = {
                          strength: 'STR',
                          dexterity: 'DEX',
                          intelligence: 'INT',
                          luck: 'LUCK'
                        };
                        return (
                          <div key={stat} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <img
                              src={getStatIcon(stat)}
                              alt={stat}
                              style={{ width: '16px', height: '16px' }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                            <span style={{ minWidth: '40px', fontWeight: 'bold', fontSize: '0.9em', color: '#1a1a1a' }}>
                              {statLabels[stat]}:
                            </span>
                            <span style={{ fontWeight: 'bold', fontSize: '0.9em', color: '#1971c2', minWidth: '25px' }}>
                              {value}
                            </span>
                            <button
                              onClick={() => onStaffStatChange?.(member.id, stat, -1)}
                              disabled={!canDecrease}
                              style={{
                                backgroundColor: !canDecrease ? '#ccc' : '#c92a2a',
                                color: '#ffffff',
                                border: 'none',
                                padding: '2px 6px',
                                borderRadius: '3px',
                                cursor: !canDecrease ? 'not-allowed' : 'pointer',
                                fontWeight: 'bold',
                                fontSize: '0.75em',
                              }}
                            >
                              −
                            </button>
                            <button
                              onClick={() => onStaffStatChange?.(member.id, stat, 1)}
                              disabled={!canIncrease}
                              style={{
                                backgroundColor: !canIncrease ? '#ccc' : '#2f9e44',
                                color: '#ffffff',
                                border: 'none',
                                padding: '2px 6px',
                                borderRadius: '3px',
                                cursor: !canIncrease ? 'not-allowed' : 'pointer',
                                fontWeight: 'bold',
                                fontSize: '0.75em',
                              }}
                            >
                              +
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
