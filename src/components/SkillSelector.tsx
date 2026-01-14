import React from 'react';
import { Skill, StaffMember } from '../types/index';
import { getAvailableSkills, calculateUsedSkillSlots, getMaxSkillSlots } from '../config/gameRules';
import { getSkillIcon } from '../utils/iconMaps';

interface SkillSelectorProps {
  staffMember: StaffMember;
  onSkillSelect: (skill: Skill) => void;
  onClose: () => void;
}

export const SkillSelector: React.FC<SkillSelectorProps> = ({
  staffMember,
  onSkillSelect,
  onClose,
}) => {
  const availableSkills = getAvailableSkills(staffMember.type);
  const unusedSkills = availableSkills.filter((skill) => !staffMember.skills.has(skill as Skill));
  const usedSlots = calculateUsedSkillSlots(staffMember.skills);
  const maxSlots = getMaxSkillSlots();
  const canAddSkill = usedSlots < maxSlots;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          padding: '20px',
          maxWidth: '400px',
          maxHeight: '70vh',
          overflowY: 'auto',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: '0 0 15px 0', color: '#1a1a1a' }}>Select a Skill to Add</h3>
        
        {unusedSkills.length === 0 ? (
          <p style={{ color: '#666', textAlign: 'center', padding: '20px 0' }}>All available skills have been added</p>
        ) : !canAddSkill ? (
          <p style={{ color: '#666', textAlign: 'center', padding: '20px 0' }}>Maximum skill slots reached</p>
        ) : (
          unusedSkills.map((skill) => (
            <button
              key={skill}
              onClick={() => {
                onSkillSelect(skill as Skill);
                onClose();
              }}
              style={{
                width: '100%',
                padding: '12px',
                marginBottom: '8px',
                backgroundColor: '#e7f5ff',
                color: '#1971c2',
                border: '1px solid #74c0fc',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                textAlign: 'left',
                transition: 'background-color 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = '#d0ebff';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = '#e7f5ff';
              }}
            >
              <img
                src={getSkillIcon(skill as Skill)}
                alt={skill}
                style={{ width: '20px', height: '20px' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              {skill}
            </button>
          ))
        )}

        <button
          onClick={onClose}
          style={{
            marginTop: '15px',
            padding: '8px 16px',
            backgroundColor: '#6c757d',
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            width: '100%',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
