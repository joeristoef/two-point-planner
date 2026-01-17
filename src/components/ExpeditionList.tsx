import React, { useState } from 'react';
import { ExpeditionFeasibility } from '../types/index';
import { getStaffTypeIcon, getSkillIcon, getExpeditionIcon, getRewardIcon, getMapIcon, getEventIcon } from '../utils/iconMaps';

interface ExpeditionListProps {
  expeditions: ExpeditionFeasibility[];
  filterByStatuses?: Set<'possible' | 'partial' | 'impossible'>;
  filterByMaps?: Set<string>;
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
  filterByRewardNames = new Set(),
  pinnedExpeditions = new Set(),
  onTogglePin,
  ignoredExpeditions = new Set(),
  onToggleIgnore,
}) => {
  // Create a map of expedition names to maps for duplicate display
  const expeditionMaps = new Map<string, string>();
  expeditions.forEach((feasibility) => {
    expeditionMaps.set(feasibility.expedition.name, feasibility.expedition.map);
  });

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
      // Exclude Bonus XP from duplicate tracking
      if (reward.name === 'Bonus XP') return;
      
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
      // Exclude Bonus XP from duplicate tracking
      if (reward.name === 'Bonus XP') return;
      
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
              <div className="expedition-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'stretch', paddingLeft: '40px', gap: '8px' }}>
                <div style={{ flex: 1, display: 'flex', gap: '8px', alignItems: 'stretch' }}>
                  <img
                    src={getExpeditionIcon(feasibility.expedition.name)}
                    alt={feasibility.expedition.name}
                    style={{ width: '50px', height: '50px', objectFit: 'contain', objectPosition: 'center', borderRadius: '2px', flexShrink: 0, backgroundColor: '#f0f0f0', border: '1px solid #ddd' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.backgroundColor = '#f0f0f0';
                      (e.target as HTMLImageElement).style.opacity = '0';
                    }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h4 style={{ margin: '0 0 3px 0', color: '#1a1a1a' }}>{feasibility.expedition.name}</h4>
                      {duplicateRewardsPerExpedition.has(feasibility.expedition.name) && (
                        <span style={{ backgroundColor: '#fff3bf', color: '#856404', padding: '2px 6px', borderRadius: '3px', fontSize: '11px', fontWeight: 'bold' }}>
                          {duplicateRewardsPerExpedition.get(feasibility.expedition.name)!.size} duplicate reward{duplicateRewardsPerExpedition.get(feasibility.expedition.name)!.size !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <p style={{ margin: '0', fontSize: '0.9em', color: '#6c757d', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <img
                        src={getMapIcon(feasibility.expedition.map)}
                        alt={feasibility.expedition.map}
                        style={{ width: '20px', height: '20px', objectFit: 'cover', borderRadius: '2px', flexShrink: 0 }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      {feasibility.expedition.map}
                    </p>
                  </div>
                </div>

                {/* Requirements Icons */}
                <div className="expedition-requirements" style={{ display: 'flex', gap: '12px', alignItems: 'center', marginRight: '12px', flexShrink: 0 }}>
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
                  {feasibility.expedition.rewards && feasibility.expedition.rewards.length > 0 && (
                    <div style={{ marginBottom: '10px', color: '#1a1a1a', backgroundColor: 'rgba(100, 150, 200, 0.1)', padding: '8px', borderRadius: '4px', border: '1px solid #6496c8' }}>
                      <strong style={{ fontSize: '1.05em' }}>Possible Rewards:</strong>
                      <div style={{ margin: '8px 0 0 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {feasibility.expedition.rewards.map((reward, idx) => {
                          const getRewardTypeColor = (type: string): { bg: string; border: string } => {
                            const colorMap: Record<string, { bg: string; border: string }> = {
                              'Prehistory': { bg: 'rgba(219, 111, 9, 0.15)', border: '#db6f09' },
                              'Botany': { bg: 'rgba(109, 159, 0, 0.15)', border: '#6d9f00' },
                              'Marine Life': { bg: 'rgba(4, 128, 219, 0.15)', border: '#0480db' },
                              'Supernatural': { bg: 'rgba(63, 103, 93, 0.15)', border: '#3f675d' },
                              'Science': { bg: 'rgba(0, 144, 119, 0.15)', border: '#009077' },
                              'Space': { bg: 'rgba(144, 81, 224, 0.15)', border: '#9051e0' },
                              'Digital': { bg: 'rgba(195, 67, 158, 0.15)', border: '#c3439e' },
                              'Fantasy': { bg: 'rgba(53, 62, 200, 0.15)', border: '#353ec8' },
                              'Wildlife': { bg: 'rgba(153, 196, 26, 0.15)', border: '#99c41a' },
                              'Other': { bg: 'rgba(28, 94, 4, 0.15)', border: '#1c5e04' },
                            };
                            return colorMap[type] || { bg: 'rgba(158, 158, 158, 0.15)', border: '#9e9e9e' };
                          };
                          
                          const colors = getRewardTypeColor(reward.type);
                          
                          return (
                            <div key={idx} style={{ backgroundColor: colors.bg, padding: '8px', borderRadius: '4px', border: `2px solid ${colors.border}`, display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                              <img
                                src={getRewardIcon(reward.name)}
                                alt={reward.name}
                                style={{ width: '68px', height: '68px', objectFit: 'cover', borderRadius: '3px', flexShrink: 0, backgroundColor: '#f0f0f0', border: `1px solid ${colors.border}` }}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.backgroundColor = '#f0f0f0';
                                  (e.target as HTMLImageElement).style.opacity = '0.3';
                                }}
                              />
                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                  <strong style={{ fontSize: '0.95em', color: '#000' }}>{reward.name}</strong>
                                  <span style={{ backgroundColor: colors.border, color: '#fff', padding: '2px 6px', borderRadius: '3px', fontSize: '0.75em', fontWeight: 'bold' }}>
                                    {reward.type}
                                  </span>
                                </div>
                                <span style={{ fontSize: '0.8em', color: '#666' }}>{reward.subtype}</span>
                                {duplicateRewardsPerExpedition.has(feasibility.expedition.name) && duplicateRewardsPerExpedition.get(feasibility.expedition.name)!.has(reward.name) && (
                                  <p style={{ margin: '6px 0 0 0', fontSize: '0.8em', borderTop: `1px solid ${colors.border}`, paddingTop: '4px' }}>
                                    <strong style={{ color: '#000' }}>Also in:</strong>{' '}
                                    {duplicateRewardsPerExpedition.get(feasibility.expedition.name)!.get(reward.name)!.map((expName, idx) => (
                                      <span key={idx}>
                                        {idx > 0 && ', '}
                                        <span style={{ color: '#666' }}>{expName} - {expeditionMaps.get(expName)}</span>
                                      </span>
                                    ))}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {feasibility.expedition.events && feasibility.expedition.events.length > 0 && (
                    <div style={{ marginBottom: '10px', color: '#1a1a1a', backgroundColor: 'rgba(100, 150, 200, 0.1)', padding: '8px', borderRadius: '4px', border: '1px solid #6496c8' }}>
                      <strong style={{ fontSize: '1.05em' }}>Possible Events:</strong>
                      <div style={{ margin: '8px 0 0 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {feasibility.expedition.events.map((event) => {
                          const getEventTypeColor = (type: string): { bg: string; text: string } => {
                            switch (type) {
                              case 'Positive':
                                return { bg: 'rgba(107, 215, 23, 0.2)', text: '#6bd717' };
                              case 'Negative':
                                return { bg: 'rgba(255, 92, 0, 0.2)', text: '#ff5c00' };
                              case 'Injury':
                                return { bg: 'rgba(255, 74, 43, 0.2)', text: '#ff4a2b' };
                              case 'Illness':
                                return { bg: 'rgba(0, 191, 218, 0.2)', text: '#00bfda' };
                              case 'MIA':
                                return { bg: 'rgba(250, 37, 33, 0.2)', text: '#fa2521' };
                              case 'Curse':
                                return { bg: 'rgba(158, 0, 255, 0.2)', text: '#9e00ff' };
                              case 'Neutral':
                                return { bg: 'rgba(239, 184, 43, 0.2)', text: '#efb82b' };
                              default:
                                return { bg: 'rgba(158, 158, 158, 0.2)', text: '#424242' };
                            }
                          };
                          
                          const colors = getEventTypeColor(event.type);
                          
                          return (
                            <div key={event.id} style={{ backgroundColor: colors.bg, padding: '8px', borderRadius: '4px', border: `1px solid ${colors.text}`, color: colors.text, display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                              <img
                                src={getEventIcon(event.name)}
                                alt={event.name}
                                style={{ width: '68px', height: '68px', objectFit: 'cover', borderRadius: '3px', flexShrink: 0, backgroundColor: '#f0f0f0', border: `1px solid ${colors.text}` }}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.backgroundColor = '#f0f0f0';
                                  (e.target as HTMLImageElement).style.opacity = '0.3';
                                }}
                              />
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                  <strong style={{ fontSize: '0.95em' }}>{event.name}</strong>
                                  <span style={{ backgroundColor: colors.text, color: '#fff', padding: '2px 6px', borderRadius: '3px', fontSize: '0.75em', fontWeight: 'bold' }}>
                                    {event.type}{event.subtype ? ` - ${event.subtype}` : ''}
                                  </span>
                                </div>
                                <p style={{ margin: '4px 0', fontSize: '0.9em', fontStyle: 'italic' }}>
                                  {event.description}
                                </p>
                                {event.unlockDescription && (
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.85em', borderTop: `1px solid ${colors.text}`, paddingTop: '4px' }}>
                                  <strong>{event.type === 'Positive' || event.type === 'Neutral' ? 'Unlock:' : 'Counter:'}
</strong> {event.unlockDescription}
                                </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
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
