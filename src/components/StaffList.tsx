import React from 'react';
import { StaffMember, Skill } from '../types/index';
import { calculateUsedSkillSlots, getMaxSkillSlots } from '../utils/skillRules';
import { getSkillIcon } from '../utils/iconMaps';

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

interface StaffListProps {
  staff: StaffMember[];
  onRemoveStaff: (id: string) => void;
  onSkillSlotClick?: (staffId: string, slotIndex: number) => void;
  onSkillLevelChange?: (staffId: string, skill: Skill, delta: number) => void;
}

export const StaffList: React.FC<StaffListProps> = ({ staff, onRemoveStaff, onSkillSlotClick, onSkillLevelChange }) => {
  // Sort staff by STAFF_TYPES_ORDER and calculate dynamic numbering
  const sortedStaff = [...staff].sort((a, b) => {
    const aIndex = STAFF_TYPES_ORDER.indexOf(a.type);
    const bIndex = STAFF_TYPES_ORDER.indexOf(b.type);
    if (aIndex !== bIndex) return aIndex - bIndex;
    return 0;
  });

  // Calculate dynamic numbering based on count of each type
  const getStaffNumber = (member: StaffMember): number => {
    return sortedStaff.filter((m) => m.type === member.type && sortedStaff.indexOf(m) <= sortedStaff.indexOf(member)).length;
  };
  return (
    <div style={{ padding: '20px' }}>
      <h3 style={{ color: '#1a1a1a' }}>Staff Roster ({staff.length})</h3>
      {staff.length === 0 ? (
        <p style={{ color: '#6c757d' }}>No staff members yet. Add some to get started!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {sortedStaff.map((member) => {
            const usedSlots = calculateUsedSkillSlots(member.skills);
            const maxSlots = getMaxSkillSlots();

            return (
              <div
                key={member.id}
                style={{
                  padding: '15px',
                  border: '2px solid #dee2e6',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                }}
              >
                {/* Header with remove button */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <h4 style={{ color: '#1a1a1a', margin: '0' }}>
                      {member.type} #{getStaffNumber(member)}
                    </h4>
                  </div>
                  <button
                    onClick={() => onRemoveStaff(member.id)}
                    style={{
                      backgroundColor: '#c92a2a',
                      color: '#ffffff',
                      border: 'none',
                      padding: '6px 10px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '0.85em',
                    }}
                  >
                    Remove
                  </button>
                </div>

                {/* Add skill button */}
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
