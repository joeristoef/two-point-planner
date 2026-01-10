import React, { useState } from 'react';
import { ExpeditionFeasibility } from '../types/index';
import { getStaffTypeIcon, getSkillIcon } from '../utils/iconMaps';

interface ExpeditionListProps {
  expeditions: ExpeditionFeasibility[];
  filterByStatuses?: Set<'possible' | 'partial' | 'impossible'>;
  filterByMaps?: Set<string>;
  filterByRewardTypes?: Set<string>;
  filterByRewardSubtypes?: Set<string>;
  filterByRewardNames?: Set<string>;
  pinnedExpeditions?: Set<string>;
  onTogglePin?: (expeditionName: string) => void;
  ignoredExpeditions?: Set<string>;
  onToggleIgnore?: (expeditionName: string) => void;
}

export const ExpeditionList: React.FC<ExpeditionListProps> = ({
  expeditions,
  filterByStatuses = new Set(['possible', 'partial', 'impossible']),
  filterByMaps = new Set(),
  filterByRewardTypes = new Set(),
  filterByRewardSubtypes = new Set(),
  filterByRewardNames = new Set(),
  pinnedExpeditions = new Set(),
  onTogglePin,
  ignoredExpeditions = new Set(),
  onToggleIgnore,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = expeditions.filter((exp) => {
    if (!filterByStatuses.has(exp.status)) return false;
    if (filterByMaps.size > 0 && !filterByMaps.has(exp.expedition.map)) return false;
    
    // Filter by reward names only (subtypes just auto-select reward names)
    if (filterByRewardNames.size > 0) {
      const hasMatchingReward = exp.expedition.rewards?.some((reward) => {
        return filterByRewardNames.has(reward.name);
      });
      if (!hasMatchingReward) return false;
    }
    
    return true;
  });

  // Sort with pinned expeditions at the top and ignored at the bottom
  const sorted = [...filtered].sort((a, b) => {
    const aIgnored = ignoredExpeditions.has(a.expedition.name);
    const bIgnored = ignoredExpeditions.has(b.expedition.name);
    if (aIgnored && !bIgnored) return 1;
    if (!aIgnored && bIgnored) return -1;
    
    const aPinned = pinnedExpeditions.has(a.expedition.name);
    const bPinned = pinnedExpeditions.has(b.expedition.name);
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;
    return 0;
  });

  // Calculate duplicate rewards across filtered expeditions (excluding ignored ones)
  const nonIgnoredFiltered = filtered.filter((f) => !ignoredExpeditions.has(f.expedition.name));
  
  const rewardToExpeditions = new Map<string, string[]>();
  nonIgnoredFiltered.forEach((feasibility) => {
    feasibility.expedition.rewards?.forEach((reward) => {
      const key = reward.name;
      if (!rewardToExpeditions.has(key)) {
        rewardToExpeditions.set(key, []);
      }
      rewardToExpeditions.get(key)!.push(feasibility.expedition.name);
    });
  });

  const duplicateRewardsPerExpedition = new Map<string, Map<string, string[]>>();
  nonIgnoredFiltered.forEach((feasibility) => {
    const duplicates = new Map<string, string[]>();
    feasibility.expedition.rewards?.forEach((reward) => {
      const appearances = rewardToExpeditions.get(reward.name) || [];
      if (appearances.length > 1) {
        duplicates.set(reward.name, appearances.filter((name) => name !== feasibility.expedition.name));
      }
    });
    if (duplicates.size > 0) {
      duplicateRewardsPerExpedition.set(feasibility.expedition.name, duplicates);
    }
  });

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'possible':
        return '#51cf66'; // Green
      case 'partial':
        return '#fab005'; // Yellow
      case 'impossible':
        return '#ff8787'; // Red
      default:
        return '#dee2e6';
    }
  };

  const getStatusBgColor = (status: string): string => {
    switch (status) {
      case 'possible':
        return '#d3f9d8'; // Light green
      case 'partial':
        return '#fff3bf'; // Light yellow
      case 'impossible':
        return '#ffe0e0'; // Light red
      default:
        return '#f8f9fa';
    }
  };

  return (
    <div style={{ padding: '0' }}>
      <h3 style={{ color: '#1a1a1a', padding: '0 20px' }}>Expeditions ({filtered.length} of {expeditions.length})</h3>
      {filtered.length === 0 ? (
        <p style={{ color: '#6c757d', padding: '0 20px' }}>No expeditions match your filters.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '0 20px' }}>
          {sorted.map((feasibility) => (
            <div
              key={feasibility.expedition.name}
              style={{
                padding: '12px',
                border: `2px solid ${getStatusColor(feasibility.status)}`,
                borderRadius: '6px',
                backgroundColor: getStatusBgColor(feasibility.status),
                cursor: 'pointer',
                transition: 'box-shadow 0.2s',
                position: 'relative',
                opacity: ignoredExpeditions.has(feasibility.expedition.name) ? 0.5 : 1,
              }}
              onClick={() =>
                setExpandedId(
                  expandedId === feasibility.expedition.name ? null : feasibility.expedition.name
                )
              }
            >
              {/* Left side buttons */}
              <div style={{ position: 'absolute', top: '8px', left: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTogglePin?.(feasibility.expedition.name);
                  }}
                  style={{
                    backgroundColor: pinnedExpeditions.has(feasibility.expedition.name) ? '#ffd700' : '#ddd',
                    color: pinnedExpeditions.has(feasibility.expedition.name) ? '#000' : '#666',
                    border: 'none',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                >
                  📌
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleIgnore?.(feasibility.expedition.name);
                  }}
                  style={{
                    backgroundColor: ignoredExpeditions.has(feasibility.expedition.name) ? '#c92a2a' : '#ddd',
                    color: ignoredExpeditions.has(feasibility.expedition.name) ? '#fff' : '#666',
                    border: 'none',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                >
                  ✖
                </button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: '40px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h4 style={{ margin: '0 0 3px 0', color: '#1a1a1a' }}>{feasibility.expedition.name}</h4>
                    {duplicateRewardsPerExpedition.has(feasibility.expedition.name) && (
                      <span style={{ backgroundColor: '#fff3bf', color: '#856404', padding: '2px 6px', borderRadius: '3px', fontSize: '11px', fontWeight: 'bold' }}>
                        {duplicateRewardsPerExpedition.get(feasibility.expedition.name)!.size} duplicate reward{duplicateRewardsPerExpedition.get(feasibility.expedition.name)!.size !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <p style={{ margin: '0', fontSize: '0.9em', color: '#6c757d' }}>
                    {feasibility.expedition.map}
                  </p>
                </div>

                {/* Requirements Icons */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginRight: '12px' }}>
                  {/* Staff Icons */}
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {feasibility.expedition.staffRequirements.map((req) => {
                      const isMissing = feasibility.missingStaff.some((m) => m.includes(req.type));
                      return (
                        <div
                          key={`staff-${req.type}`}
                          style={{
                            position: 'relative',
                            width: '32px',
                            height: '32px',
                            backgroundColor: '#f0f0f0',
                            borderRadius: '3px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid #ddd',
                          }}
                          title={`${req.count}x ${req.type}`}
                        >
                          <img
                            src={getStaffTypeIcon(req.type as any)}
                            alt={req.type}
                            style={{ width: '24px', height: '24px' }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                          <span
                            style={{
                              position: 'absolute',
                              bottom: '-6px',
                              right: '-6px',
                              backgroundColor: isMissing ? '#c92a2a' : '#2f9e44',
                              color: '#ffffff',
                              fontSize: '9px',
                              fontWeight: 'bold',
                              padding: '2px 3px',
                              borderRadius: '2px',
                              minWidth: '14px',
                              textAlign: 'center',
                            }}
                          >
                            {req.count}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Skill Icons */}
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {feasibility.expedition.skillRequirements.map((req) => {
                      const isMissing = feasibility.missingSkills.some((m) => m.includes(req.skill));
                      return (
                        <div
                          key={`skill-${req.skill}`}
                          style={{
                            position: 'relative',
                            width: '32px',
                            height: '32px',
                            backgroundColor: '#f0f0f0',
                            borderRadius: '3px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid #ddd',
                          }}
                          title={`${req.skill} (Level ${req.level})`}
                        >
                          <img
                            src={getSkillIcon(req.skill)}
                            alt={req.skill}
                            style={{ width: '24px', height: '24px' }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                          <span
                            style={{
                              position: 'absolute',
                              bottom: '-6px',
                              right: '-6px',
                              backgroundColor: isMissing ? '#c92a2a' : '#2f9e44',
                              color: '#ffffff',
                              fontSize: '9px',
                              fontWeight: 'bold',
                              padding: '2px 3px',
                              borderRadius: '2px',
                              minWidth: '14px',
                              textAlign: 'center',
                            }}
                          >
                            {req.level}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {expandedId === feasibility.expedition.name && (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(0,0,0,0.1)', color: '#1a1a1a' }}>
                  {feasibility.missingStaff.length > 0 && (
                    <div style={{ marginBottom: '10px', color: '#c92a2a', backgroundColor: 'rgba(220, 53, 69, 0.1)', padding: '8px', borderRadius: '4px' }}>
                      <strong>Missing Staff:</strong>
                      <ul style={{ margin: '5px 0 0 20px' }}>
                        {feasibility.missingStaff.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {feasibility.missingSkills.length > 0 && (
                    <div style={{ marginBottom: '10px', color: '#c92a2a', backgroundColor: 'rgba(220, 53, 69, 0.1)', padding: '8px', borderRadius: '4px' }}>
                      <strong>Missing Skills:</strong>
                      <ul style={{ margin: '5px 0 0 20px' }}>
                        {feasibility.missingSkills.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {duplicateRewardsPerExpedition.has(feasibility.expedition.name) && (
                    <div style={{ marginBottom: '10px', color: '#856404', backgroundColor: 'rgba(255, 243, 191, 0.5)', padding: '8px', borderRadius: '4px', border: '1px solid #ffe066' }}>
                      <strong>Duplicate Rewards:</strong>
                      <ul style={{ margin: '5px 0 0 20px' }}>
                        {Array.from(duplicateRewardsPerExpedition.get(feasibility.expedition.name)!).map(([rewardName, otherExpeditions]) => (
                          <li key={rewardName}>
                            <strong>{rewardName}</strong> also in: {otherExpeditions.join(', ')}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {feasibility.expedition.rewards && feasibility.expedition.rewards.length > 0 && (
                    <div style={{ marginBottom: '10px', color: '#1a1a1a', backgroundColor: 'rgba(76, 175, 80, 0.1)', padding: '8px', borderRadius: '4px' }}>
                      <strong>Possible Rewards:</strong>
                      <ul style={{ margin: '5px 0 0 20px' }}>
                        {feasibility.expedition.rewards.map((reward, idx) => (
                          <li key={idx}>
                            {reward.name} <span style={{ fontSize: '0.85em', color: '#666' }}>({reward.type} - {reward.subtype})</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
