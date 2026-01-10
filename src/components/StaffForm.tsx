import React from 'react';
import { StaffMember, StaffType } from '../types/index';
import { getStaffTypeIcon } from '../utils/iconMaps';

interface StaffFormProps {
  onAddStaff: (staff: StaffMember) => void;
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

// Counter for auto-generating unique IDs
const staffIdCounter: Map<StaffType, number> = new Map();

STAFF_TYPES.forEach(type => staffIdCounter.set(type, 0));

export const StaffForm: React.FC<StaffFormProps> = ({ onAddStaff }) => {
  const handleAddStaffType = (type: StaffType) => {
    const id = `${type}-${Date.now()}`; // Use unique ID instead of counter for name
    
    onAddStaff({
      id,
      name: `${type}`, // Name is just the type, display name with number is in StaffList
      type,
      skills: new Map(),
    });
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#1a1a1a' }}>Add Staff Member</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
        {STAFF_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => handleAddStaffType(type)}
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
    </div>
  );
};
