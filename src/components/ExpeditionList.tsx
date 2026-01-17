import React, { useState } from 'react';
import { ExpeditionFeasibility, StaffMember } from '../types/index';
import { getStaffTypeIcon, getSkillIcon, getExpeditionIcon, getRewardIcon, getMapIcon, getEventIcon, getEventTypeIcon, getItemIcon, getStatIcon } from '../utils/iconMaps';
import { accumulateRequirements } from '../utils/eventRequirements';

interface ExpeditionListProps {
  expeditions: ExpeditionFeasibility[];
  staff?: StaffMember[];
  filterByStatuses?: Set<'possible' | 'partial' | 'impossible'>;
  filterByMaps?: Set<string>;
  filterByRewardNames?: Set<string>;
  filterAvailableItems?: Set<string>;
  onToggleAvailableItem?: (itemName: string) => void;
  filterByEventTypes?: Set<string>;
  filterByEventSubtypes?: Set<string>;
  pinnedExpeditions?: Set<string>;
  onTogglePin?: (expeditionName: string) => void;
  ignoredExpeditions?: Set<string>;
  onToggleIgnore?: (expeditionName: string) => void;
}

export const ExpeditionList: React.FC<ExpeditionListProps> = ({
  expeditions,
  staff = [],
  filterByStatuses = new Set(['possible', 'partial', 'impossible']),
  filterByMaps = new Set(),
  filterByRewardNames = new Set(),
  filterAvailableItems = new Set(),
  filterByEventTypes = new Set(),
  filterByEventSubtypes = new Set(),
  pinnedExpeditions = new Set(),
  onTogglePin,
  ignoredExpeditions = new Set(),
  onToggleIgnore,
}) => {
  // Helper function to check if a specific requirement can be fulfilled by a given team
  const canFulfillRequirement = (
    requirementName: string,
    requirementType: string,
    requirementLevel?: number,
    chosenTeam?: StaffMember[]
  ): boolean => {
    const teamToUse = chosenTeam && chosenTeam.length > 0 ? chosenTeam : staff;
    if (teamToUse.length === 0) return false;

    switch (requirementType) {
      case 'Skill': {
        // Find max skill level in team
        let maxLevel = 0;
        for (const member of teamToUse) {
          const skillLevel = member.skills.get(requirementName as any);
          if (skillLevel && skillLevel > maxLevel) {
            maxLevel = skillLevel;
          }
        }
        return maxLevel >= (requirementLevel || 0);
      }
      case 'Stat': {
        // Calculate total stat for team
        let totalStat = 0;
        // Map CSV stat abbreviations to property names
        const statMap: Record<string, string> = {
          'INT': 'intelligence',
          'STR': 'strength',
          'DEX': 'dexterity',
          'LUCK': 'luck',
          'intelligence': 'intelligence',
          'strength': 'strength',
          'dexterity': 'dexterity',
          'luck': 'luck',
        };
        const statKey = statMap[requirementName] || requirementName.toLowerCase();
        for (const member of teamToUse) {
          if (member.stats) {
            totalStat += (member.stats[statKey as keyof typeof member.stats] || 0);
          }
        }
        return totalStat >= (requirementLevel || 0);
      }
      case 'Rank': {
        // Calculate total level for team
        const totalLevel = teamToUse.reduce((sum, member) => sum + (member.level || 1), 0);
        return totalLevel >= (requirementLevel || 0);
      }
      case 'Item': {
        // Check if item is in the available items filter
        return filterAvailableItems.has(requirementName);
      }
      default:
        return false;
    }
  };

  // Helper function to check if expedition has uncountered MIA events
  const hasUnounteredMIA = (feasibility: ExpeditionFeasibility): boolean => {
    // Only show if MIA is in the filter
    if (!filterByEventTypes.has('MIA')) {
      return false;
    }
    
    // Check if there are any MIA events that are NOT satisfied
    return feasibility.expedition.events.some((event) => {
      if (event.type !== 'MIA') return false;
      // MIA events grey out when requirements ARE satisfied, so if greyed = countered
      // We want to show warning when NOT greyed = NOT satisfied
      const allRequirementsSatisfied = !event.requirements || event.requirements.length === 0 || 
        event.requirements.every(req => canFulfillRequirement(req.name, req.type, req.level, feasibility.chosenTeam));
      return !allRequirementsSatisfied; // Show warning when NOT satisfied
    });
  };

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
                    padding: '4px 4px',
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
                    padding: '4px 4px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                >
                  ✖
                </button>
              </div>
              <div className="expedition-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'stretch', paddingLeft: '25px', gap: '8px' }}>
                <div style={{ flex: 1, display: 'flex', gap: '8px', alignItems: 'stretch' }}>
                  <img
                    src={getExpeditionIcon(feasibility.expedition.name)}
                    alt={feasibility.expedition.name}
                    style={{ width: '60px', height: '60px', objectFit: 'contain', objectPosition: 'center', borderRadius: '2px', flexShrink: 0, backgroundColor: '#f0f0f0', border: '1px solid #ddd' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.backgroundColor = '#f0f0f0';
                      (e.target as HTMLImageElement).style.opacity = '0';
                    }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h4 style={{ margin: '0 0 3px 0', color: '#1a1a1a' }}>{feasibility.expedition.name}</h4>
                      {hasUnounteredMIA(feasibility) && (
                        <img
                          src={getEventTypeIcon('MIA')}
                          alt="Uncountered MIA risk"
                          title="Uncountered MIA event"
                          style={{ width: '20px', height: '20px', objectFit: 'contain' }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      )}
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
                  {feasibility.expedition.staffRequirements.length > 0 && (
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
                  )}

                  {/* Divider after staff - only show if staff exists AND something follows */}
                  {feasibility.expedition.staffRequirements.length > 0 && (() => {
                    const accumulated = accumulateRequirements(
                      feasibility.expedition,
                      filterByEventTypes.size > 0 ? filterByEventTypes : undefined,
                      filterByEventSubtypes.size > 0 ? filterByEventSubtypes : undefined
                    );
                    return (accumulated.skills.length > 0 || accumulated.stats.length > 0 || accumulated.ranks.length > 0 || accumulated.items.length > 0) && (
                      <div style={{ color: '#ccc', fontSize: '16px', margin: '0 4px' }}>|</div>
                    );
                  })()}

                  {/* Skill Icons */}
                  {(() => {
                    const accumulated = accumulateRequirements(
                      feasibility.expedition,
                      filterByEventTypes.size > 0 ? filterByEventTypes : undefined,
                      filterByEventSubtypes.size > 0 ? filterByEventSubtypes : undefined
                    );
                    return accumulated.skills.length > 0 ? (
                      <>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {accumulated.skills.map((req) => {
                            const canFulfill = canFulfillRequirement(req.name, 'Skill', req.level, feasibility.chosenTeam);
                            return (
                              <div
                                key={`skill-${req.name}`}
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
                                title={`${req.name} (Level ${req.level})`}
                              >
                                <img
                                  src={getSkillIcon(req.name as any)}
                                  alt={req.name}
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
                                    backgroundColor: canFulfill ? '#2f9e44' : '#c92a2a',
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
                        {(accumulated.stats.length > 0 || accumulated.ranks.length > 0 || accumulated.items.length > 0) && (
                          <div style={{ color: '#ccc', fontSize: '16px' }}>|</div>
                        )}
                      </>
                    ) : null;
                  })()}

                  {/* Stat Icons */}
                  {(() => {
                    const accumulated = accumulateRequirements(
                      feasibility.expedition,
                      filterByEventTypes.size > 0 ? filterByEventTypes : undefined,
                      filterByEventSubtypes.size > 0 ? filterByEventSubtypes : undefined
                    );
                    return accumulated.stats.length > 0 ? (
                      <>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {accumulated.stats.map((req) => {
                            const canFulfill = canFulfillRequirement(req.name, 'Stat', req.level, feasibility.chosenTeam);
                            return (
                            <div
                              key={`stat-${req.name}`}
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
                              title={`${req.name} (Level ${req.level})`}
                            >
                              <img
                                src={getStatIcon(req.name)}
                                alt={req.name}
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
                                  backgroundColor: canFulfill ? '#2f9e44' : '#c92a2a',
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
                        {(accumulated.ranks.length > 0 || accumulated.items.length > 0) && (
                          <div style={{ color: '#ccc', fontSize: '16px' }}>|</div>
                        )}
                      </>
                    ) : null;
                  })()}

                  {/* Rank Icons */}
                  {(() => {
                    const accumulated = accumulateRequirements(
                      feasibility.expedition,
                      filterByEventTypes.size > 0 ? filterByEventTypes : undefined,
                      filterByEventSubtypes.size > 0 ? filterByEventSubtypes : undefined
                    );
                    if (accumulated.ranks.length === 0) return null;

                    const highestRank = accumulated.ranks.reduce((max, current) => {
                      const currentNum = parseInt(current.name.match(/\d+/)?.[0] || '0');
                      const maxNum = parseInt(max.name.match(/\d+/)?.[0] || '0');
                      return currentNum > maxNum ? current : max;
                    });

                    // Check if the highest rank requirement can be fulfilled
                    const canFulfill = canFulfillRequirement(highestRank.name, 'Rank', highestRank.level, feasibility.chosenTeam);
                    const bgColor = canFulfill ? '#2f9e44' : '#c92a2a';

                    return (
                      <>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              backgroundColor: bgColor,
                              borderRadius: '2px',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#fff',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              fontFamily: 'monospace',
                            }}
                            title={highestRank.name}
                          >
                            {highestRank.name.match(/\d+/)?.[0] || highestRank.name}
                          </div>
                        </div>
                        {accumulated.items.length > 0 && (
                          <div style={{ color: '#ccc', fontSize: '16px' }}>|</div>
                        )}
                      </>
                    );
                  })()}

                  {/* Item Icons */}
                  {(() => {
                    const accumulated = accumulateRequirements(
                      feasibility.expedition,
                      filterByEventTypes.size > 0 ? filterByEventTypes : undefined,
                      filterByEventSubtypes.size > 0 ? filterByEventSubtypes : undefined
                    );
                    return accumulated.items.length > 0 ? (
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {accumulated.items.map((req) => (
                          <div
                            key={`item-${req.name}`}
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
                            title={req.name}
                          >
                            <img
                              src={getItemIcon(req.name)}
                              alt={req.name}
                              style={{ width: '24px', height: '24px' }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    ) : null;
                  })()}
                </div>
              </div>

              {expandedId === feasibility.expedition.name && (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(0,0,0,0.1)', color: '#1a1a1a' }}>
                  {feasibility.chosenTeam && feasibility.chosenTeam.length > 0 && (
                    <div style={{ marginBottom: '10px', color: '#1a1a1a', padding: '8px 0' }}>
                      <strong style={{ fontSize: '1.05em', marginRight: '12px' }}>Chosen Staff:</strong>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                        {feasibility.chosenTeam.map((member) => (
                          <div key={member.id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ position: 'relative', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <img
                                src={getStaffTypeIcon(member.type)}
                                alt={member.type}
                                style={{ width: '20px', height: '20px' }}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            </div>
                            <span style={{ fontWeight: 'bold', fontSize: '0.9em' }}>{member.name} Lv{member.level}</span>
                            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                              {Array.from(member.skills.entries()).map(([skill, level]) => (
                                <div key={skill} style={{ position: 'relative', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <img
                                    src={getSkillIcon(skill as any)}
                                    alt={skill}
                                    style={{ width: '20px', height: '20px' }}
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                  <span style={{ position: 'absolute', bottom: '-2px', right: '-2px', backgroundColor: '#4c6ef5', color: '#fff', fontSize: '8px', fontWeight: 'bold', padding: '1px 2px', borderRadius: '1px', minWidth: '12px', textAlign: 'center', lineHeight: '1' }}>
                                    {level}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
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
                            <div key={idx} style={{ backgroundColor: colors.bg, padding: '8px', borderRadius: '4px', border: `1px solid ${colors.border}`, display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                              <img
                                src={getRewardIcon(reward.name)}
                                alt={reward.name}
                                style={{ width: '66px', height: '66px', objectFit: 'cover', borderRadius: '3px', flexShrink: 0, backgroundColor: '#f0f0f0', border: `2px solid ${colors.border}` }}
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
                          
                          // Check if event is seasonal (should never be greyed)
                          const isSeasonal = event.unlockDescription && event.unlockDescription.trim().endsWith('Season');
                          
                          // Check if all event requirements are satisfied
                          const allRequirementsSatisfied = !event.requirements || event.requirements.length === 0 || 
                            event.requirements.every(req => canFulfillRequirement(req.name, req.type, req.level, feasibility.chosenTeam));
                          
                          // Determine if event should be greyed out
                          // Seasonal events are never greyed out
                          // For Positive/Neutral: grey if NOT all satisfied
                          // For others: grey if all ARE satisfied
                          const shouldBeGreyed = isSeasonal ? false : (
                            (event.type === 'Positive' || event.type === 'Neutral') 
                              ? !allRequirementsSatisfied 
                              : allRequirementsSatisfied
                          );
                          
                          // Greyed out colors
                          const greyedColors = {
                            bg: shouldBeGreyed ? 'rgba(158, 158, 158, 0.1)' : colors.bg,
                            text: shouldBeGreyed ? '#999' : colors.text,
                            brightText: shouldBeGreyed ? '#666' : colors.text
                          };
                          
                          return (
                            <div key={event.id} style={{ backgroundColor: greyedColors.bg, padding: '8px', borderRadius: '4px', border: `1px solid ${colors.text}`, color: greyedColors.text, display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                              <div style={{ position: 'relative', width: '72px', height: '72px', flexShrink: 0 }}>
                                <img
                                  src={getEventIcon(event.name)}
                                  alt={event.name}
                                  style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '3px', backgroundColor: '#f0f0f0', border: `4px solid ${colors.text}`, display: 'block', filter: shouldBeGreyed ? 'grayscale(100%)' : 'none' }}
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.backgroundColor = '#f0f0f0';
                                    (e.target as HTMLImageElement).style.opacity = '0.3';
                                  }}
                                />
                                {/* Event type icon - top left */}
                                <img
                                  src={getEventTypeIcon(event.type)}
                                  alt={event.type}
                                  style={{ position: 'absolute', top: '-4px', left: '-4px', width: '28px', height: '28px', objectFit: 'contain' }}
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                                
                                {/* Requirement stamps - top right */}
                                {event.requirements && event.requirements.length > 0 && (
                                  <div style={{ position: 'absolute', top: '-4px', right: '-4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    {event.requirements.map((req, idx) => {
                                      // Check if requirement can be fulfilled by chosen team
                                      const canFulfill = canFulfillRequirement(req.name, req.type, req.level, feasibility.chosenTeam);
                                      const greenColor = '#2f9e44';
                                      const redColor = '#c92a2a';
                                      const bgColor = canFulfill ? greenColor : redColor; // Green if can fulfill, red if cannot

                                      // Handle Rank requirements specially - display as text in colored box
                                      if (req.type === 'Rank') {
                                        const rankMatch = req.name.match(/\d+/);
                                        const rankNumber = rankMatch ? rankMatch[0] : req.name;
                                        
                                        return (
                                          <div
                                            key={`${req.type}-${req.name}-${idx}`}
                                            style={{
                                              width: '28px',
                                              height: '28px',
                                              backgroundColor: bgColor,
                                              borderRadius: '2px',
                                              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              color: '#fff',
                                              fontSize: '16px',
                                              fontWeight: 'bold',
                                              fontFamily: 'monospace',
                                            }}
                                            title={req.name}
                                          >
                                            {rankNumber}
                                          </div>
                                        );
                                      }

                                      // Handle icon-based requirements (Skill, Stat, Item)
                                      const reqIcon = 
                                        req.type === 'Skill' ? getSkillIcon(req.name as any) :
                                        req.type === 'Stat' ? getStatIcon(req.name) :
                                        req.type === 'Item' ? getItemIcon(req.name) :
                                        null;
                                      
                                      if (!reqIcon) return null;
                                      
                                      return (
                                        <div
                                          key={`${req.type}-${req.name}-${idx}`}
                                          style={{
                                            position: 'relative',
                                            width: '28px',
                                            height: '28px',
                                            backgroundColor: '#f0f0f0',
                                            borderRadius: '3px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: '1px solid #ddd',
                                          }}
                                          title={req.level ? `${req.name} (Level ${req.level})` : req.name}
                                        >
                                          <img
                                            src={reqIcon}
                                            alt={req.name}
                                            style={{ width: '20px', height: '20px', objectFit: 'cover' }}
                                            onError={(e) => {
                                              (e.target as HTMLImageElement).style.display = 'none';
                                            }}
                                          />
                                          {req.level && (
                                            <span
                                              style={{
                                                position: 'absolute',
                                                bottom: '-5px',
                                                right: '-5px',
                                                backgroundColor: bgColor,
                                                color: '#ffffff',
                                                fontSize: '8px',
                                                fontWeight: 'bold',
                                                padding: '1px 2px',
                                                borderRadius: '1px',
                                                minWidth: '12px',
                                                textAlign: 'center',
                                              }}
                                            >
                                              {req.level}
                                            </span>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                                
                                {/* Seasonal stamp - if event is seasonal */}
                                {event.unlockDescription && event.unlockDescription.trim().endsWith('Season') && (
                                  <div style={{ position: 'absolute', top: '-4px', right: event.requirements && event.requirements.length > 0 ? 'auto' : '-4px', left: event.requirements && event.requirements.length > 0 ? '-36px' : 'auto', display: 'flex' }}>
                                    <div
                                      style={{
                                        position: 'relative',
                                        width: '28px',
                                        height: '28px',
                                        backgroundColor: '#f0f0f0',
                                        borderRadius: '3px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '1px solid #ddd',
                                      }}
                                      title="Seasonal Event"
                                    >
                                      <img
                                        src="/assets/misc-icons/seasonal.webp"
                                        alt="Seasonal"
                                        style={{ width: '20px', height: '20px', objectFit: 'cover' }}
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                  <strong style={{ fontSize: '0.95em', color: greyedColors.text }}>{event.name}</strong>
                                  <span style={{ backgroundColor: greyedColors.text === '#999' ? '#999' : colors.text, color: '#fff', padding: '2px 6px', borderRadius: '3px', fontSize: '0.75em', fontWeight: 'bold' }}>
                                    {event.type}{event.subtype ? ` - ${event.subtype}` : ''}
                                  </span>
                                </div>
                                <p style={{ margin: '4px 0', fontSize: '0.9em', fontStyle: 'italic' }}>
                                  {event.description}
                                </p>
                                {event.unlockDescription && (
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.85em', borderTop: `1px solid ${colors.text}`, paddingTop: '4px' }}>
                                  <strong>{event.unlockDescription.trim().endsWith('Season') ? 'Seasonal:' : event.type === 'Positive' || event.type === 'Neutral' ? 'Unlock:' : 'Counter:'}
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
