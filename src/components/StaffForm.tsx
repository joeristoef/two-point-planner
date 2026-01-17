import React, { useState } from 'react';
import { StaffMember, StaffType } from '../types/index';
import { getStaffTypeIcon } from '../utils/iconMaps';
import { FANTASY_EXPERT_BASE_STATS } from '../config/gameRules';

interface StaffFormProps {
  onAddStaff: (staff: StaffMember) => void;
  staff: StaffMember[];
}

const STAFF_TYPES: StaffType[] = [
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

const FANTASY_SUBTYPES: StaffType[] = ['Barbarian', 'Bard', 'Rogue', 'Wizard'];

export const StaffForm: React.FC<StaffFormProps> = ({ onAddStaff, staff }) => {
  const [fantasySubtypeMenu, setFantasySubtypeMenu] = useState<{ x: number; y: number } | null>(null);

  const handleAddStaffType = (type: StaffType) => {
    // Get the grouping key for the type (to handle fantasy subtypes)
    const getGroupingKey = (staffType: StaffType): StaffType => {
      if (['Barbarian', 'Bard', 'Rogue', 'Wizard'].includes(staffType as any)) {
        return 'Fantasy Expert';
      }
      return staffType;
    };

    // Find the highest number for this type/grouping
    const groupingKey = getGroupingKey(type);
    const staffOfThisType = staff.filter(s => getGroupingKey(s.type) === groupingKey);
    
    let highestNumber = 0;
    staffOfThisType.forEach(s => {
      const match = s.name.match(/#(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > highestNumber) {
          highestNumber = num;
        }
      }
    });
    
    const nextNumber = highestNumber + 1;
    const id = `${type}-${Date.now()}`; // Use unique ID based on timestamp
    
    // Check if this is a fantasy expert subtype
    const isFastasySubtype = ['Barbarian', 'Bard', 'Rogue', 'Wizard'].includes(type as any);
    const baseStats = isFastasySubtype ? FANTASY_EXPERT_BASE_STATS[type] : undefined;
    
    onAddStaff({
      id,
      name: `${type} #${nextNumber}`, // Auto-generated name with number
      type,
      level: 1, // Start at level 1
      skills: new Map(),
      ...(baseStats && { stats: { ...baseStats } }), // Add base stats for fantasy experts
    });
  };

  const handleFantasyExpertClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setFantasySubtypeMenu({ x: rect.left, y: rect.bottom + 5 });
  };

  const handleFantasySubtypeSelect = (subtype: StaffType) => {
    handleAddStaffType(subtype);
    setFantasySubtypeMenu(null);
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#1a1a1a' }}>Add Staff Member</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
        {STAFF_TYPES.map((type) => (
          <button
            key={type}
            onClick={(e) => {
              if (type === 'Fantasy Expert') {
                handleFantasyExpertClick(e);
              } else {
                handleAddStaffType(type);
              }
            }}
            style={{
              padding: '10px',
              backgroundColor: '#1971c2',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.9em',
              transition: 'background-color 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              minHeight: '60px',
              flexDirection: 'column',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#1864ab';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#1971c2';
            }}
          >
            <img
              src={getStaffTypeIcon(type)}
              alt={type}
              style={{ width: '20px', height: '20px' }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            {type}
          </button>
        ))}
      </div>

      {/* Fantasy Expert Subtype Menu */}
      {fantasySubtypeMenu && (
        <>
          {/* Backdrop to close menu */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999,
            }}
            onClick={() => setFantasySubtypeMenu(null)}
          />
          
          {/* Popup Menu */}
          <div
            style={{
              position: 'fixed',
              left: `${fantasySubtypeMenu.x}px`,
              top: `${fantasySubtypeMenu.y}px`,
              backgroundColor: '#ffffff',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              zIndex: 1000,
              padding: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              minWidth: '160px',
            }}
          >
            {FANTASY_SUBTYPES.map((subtype) => (
              <button
                key={subtype}
                onClick={() => handleFantasySubtypeSelect(subtype)}
                style={{
                  padding: '10px 12px',
                  backgroundColor: '#1971c2',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.85em',
                  transition: 'background-color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  justifyContent: 'flex-start',
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#1864ab';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#1971c2';
                }}
              >
                <img
                  src={getStaffTypeIcon(subtype)}
                  alt={subtype}
                  style={{ width: '24px', height: '24px', objectFit: 'cover', borderRadius: '2px' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                {subtype}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
