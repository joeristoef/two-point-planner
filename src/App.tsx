import { useState, useEffect } from 'react';
import { StaffMember, Skill, Expedition } from './types/index';
import { expeditions as expeditionsBase } from './data/expeditions';
import { StaffForm } from './components/StaffForm';
import { StaffList } from './components/StaffList';
import { ExpeditionList } from './components/ExpeditionList';
import { SkillSelector } from './components/SkillSelector';
import { checkAllExpeditions } from './utils/expeditionMatcher';
import { parseRewardsCsv } from './data/loadRewards';
import './App.css';

function App() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [expeditions, setExpeditions] = useState<Expedition[]>(expeditionsBase);
  const [filterStatuses, setFilterStatuses] = useState<Set<'possible' | 'partial' | 'impossible'>>(
    new Set(['possible', 'partial', 'impossible'])
  );
  const [filterMaps, setFilterMaps] = useState<Set<string>>(new Set());
  const [filterRewardNames, setFilterRewardNames] = useState<Set<string>>(new Set());
  const [filtersExpanded, setFiltersExpanded] = useState(true);
  const [expandedThemes, setExpandedThemes] = useState<Set<string>>(new Set());
  const [expandedSubthemes, setExpandedSubthemes] = useState<Set<string>>(new Set());
  const [pinnedExpeditions, setPinnedExpeditions] = useState<Set<string>>(new Set());
  const [ignoredExpeditions, setIgnoredExpeditions] = useState<Set<string>>(new Set());
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);

  // Load rewards on mount
  useEffect(() => {
    parseRewardsCsv().then((rewardsMap) => {
      const expeditionsWithRewards = expeditionsBase.map((exp) => ({
        ...exp,
        rewards: rewardsMap.get(exp.name) || [],
      }));
      setExpeditions(expeditionsWithRewards);
    });
  }, []);

  const handleAddStaff = (newStaff: StaffMember) => {
    setStaff([...staff, newStaff]);
  };

  const handleRemoveStaff = (id: string) => {
    setStaff(staff.filter((s) => s.id !== id));
  };

  const handleSkillSlotClick = (staffId: string, _slotIndex: number) => {
    setSelectedStaffId(staffId);
  };

  const handleSkillSelect = (skill: Skill) => {
    if (!selectedStaffId) return;

    setStaff(
      staff.map((member) => {
        if (member.id === selectedStaffId) {
          const newSkills = new Map(member.skills);
          newSkills.set(skill, 1); // Add at level 1
          return { ...member, skills: newSkills };
        }
        return member;
      })
    );

    setSelectedStaffId(null);
  };

  const handleSkillLevelChange = (staffId: string, skill: Skill, delta: number) => {
    setStaff(
      staff.map((member) => {
        if (member.id === staffId) {
          const newSkills = new Map(member.skills);
          const currentLevel = newSkills.get(skill) || 0;
          const newLevel = currentLevel + delta;

          if (newLevel <= 0) {
            newSkills.delete(skill);
          } else if (newLevel <= 3) {
            newSkills.set(skill, newLevel);
          }

          return { ...member, skills: newSkills };
        }
        return member;
      })
    );
  };

  const handleSkillSelectorClose = () => {
    setSelectedStaffId(null);
  };

  const toggleStatusFilter = (status: 'possible' | 'partial' | 'impossible') => {
    setFilterStatuses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(status)) {
        newSet.delete(status);
      } else {
        newSet.add(status);
      }
      return newSet;
    });
  };

  const toggleMapFilter = (map: string) => {
    setFilterMaps((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(map)) {
        newSet.delete(map);
      } else {
        newSet.add(map);
      }
      return newSet;
    });
  };

  const toggleRewardTypeFilter = (rewardType: string) => {
    setFilterRewardNames((prev) => {
      const newSet = new Set(prev);
      const subtypesForType = Array.from(rewardTypeMap.get(rewardType) || []);
      
      // Get all reward names for all subtypes in this theme
      const allRewardNamesForTheme = new Set<string>();
      subtypesForType.forEach((subtype) => {
        Array.from(rewardSubtypeMap.get(subtype) || []).forEach((name) => {
          allRewardNamesForTheme.add(name);
        });
      });
      
      // Check if all these reward names are already selected
      const allNamesSelected = Array.from(allRewardNamesForTheme).every((name) => newSet.has(name));

      if (allNamesSelected) {
        // Deselect all reward names for this theme
        allRewardNamesForTheme.forEach((name) => newSet.delete(name));
      } else {
        // Select all reward names for this theme
        allRewardNamesForTheme.forEach((name) => newSet.add(name));
      }
      return newSet;
    });
  };

  const toggleRewardSubtypeFilter = (subtype: string) => {
    setFilterRewardNames((prev) => {
      const newSet = new Set(prev);
      const rewardNamesForSubtype = Array.from(rewardSubtypeMap.get(subtype) || []);
      const allNamesSelected = rewardNamesForSubtype.every((name) => newSet.has(name));

      if (allNamesSelected) {
        // Deselect all reward names for this subtype
        rewardNamesForSubtype.forEach((name) => newSet.delete(name));
      } else {
        // Select all reward names for this subtype
        rewardNamesForSubtype.forEach((name) => newSet.add(name));
      }
      return newSet;
    });
  };

  const toggleRewardNameFilter = (rewardName: string) => {
    setFilterRewardNames((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(rewardName)) {
        newSet.delete(rewardName);
      } else {
        newSet.add(rewardName);
      }
      return newSet;
    });
  };

  const toggleThemeExpanded = (theme: string) => {
    setExpandedThemes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(theme)) {
        newSet.delete(theme);
      } else {
        newSet.add(theme);
      }
      return newSet;
    });
  };

  const toggleSubthemeExpanded = (subtheme: string) => {
    setExpandedSubthemes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(subtheme)) {
        newSet.delete(subtheme);
      } else {
        newSet.add(subtheme);
      }
      return newSet;
    });
  };

  const togglePinExpedition = (expeditionName: string) => {
    setPinnedExpeditions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(expeditionName)) {
        newSet.delete(expeditionName);
      } else {
        newSet.add(expeditionName);
      }
      return newSet;
    });
  };

  const toggleIgnoreExpedition = (expeditionName: string) => {
    setIgnoredExpeditions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(expeditionName)) {
        newSet.delete(expeditionName);
      } else {
        newSet.add(expeditionName);
      }
      return newSet;
    });
  };

  const feasibilities = checkAllExpeditions(staff, expeditions);
  const uniqueMaps = Array.from(new Set(expeditions.map((e) => e.map))).sort();
  
  // Get unique reward types, subtypes, and names
  const rewardTypeMap = new Map<string, Set<string>>();
  const rewardSubtypeMap = new Map<string, Set<string>>();
  expeditions.forEach((exp) => {
    exp.rewards?.forEach((reward) => {
      if (!rewardTypeMap.has(reward.type)) {
        rewardTypeMap.set(reward.type, new Set());
      }
      rewardTypeMap.get(reward.type)!.add(reward.subtype);
      
      if (!rewardSubtypeMap.has(reward.subtype)) {
        rewardSubtypeMap.set(reward.subtype, new Set());
      }
      rewardSubtypeMap.get(reward.subtype)!.add(reward.name);
    });
  });
  const uniqueRewardTypes = Array.from(rewardTypeMap.keys()).sort();
  
  // Apply same filtering logic to stats as in ExpeditionList
  const filteredForStats = feasibilities.filter((exp) => {
    if (!filterStatuses.has(exp.status)) return false;
    if (filterMaps.size > 0 && !filterMaps.has(exp.expedition.map)) return false;
    if (filterRewardNames.size > 0) {
      const hasMatchingReward = exp.expedition.rewards?.some((reward) => {
        return filterRewardNames.has(reward.name);
      });
      if (!hasMatchingReward) return false;
    }
    return true;
  });
  
  const stats = {
    possible: filteredForStats.filter((f) => f.status === 'possible' && !ignoredExpeditions.has(f.expedition.name)).length,
    partial: filteredForStats.filter((f) => f.status === 'partial' && !ignoredExpeditions.has(f.expedition.name)).length,
    impossible: filteredForStats.filter((f) => f.status === 'impossible' && !ignoredExpeditions.has(f.expedition.name)).length,
  };

  const selectedStaff = staff.find((s) => s.id === selectedStaffId);

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Left Panel - Staff Management */}
      <div
        style={{
          flex: 1,
          maxWidth: '400px',
          backgroundColor: '#ffffff',
          borderRight: '1px solid #dee2e6',
          overflowY: 'auto',
          overflowX: 'hidden',
          boxShadow: '0 0 10px rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ padding: '20px', borderBottom: '1px solid #dee2e6', backgroundColor: '#f8f9fa', flexShrink: 0 }}>
          <h1 style={{ margin: '0', color: '#1a1a1a' }}>Two Point Museum Planner</h1>
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          <StaffForm onAddStaff={handleAddStaff} />
          <StaffList staff={staff} onRemoveStaff={handleRemoveStaff} onSkillSlotClick={handleSkillSlotClick} onSkillLevelChange={handleSkillLevelChange} />
        </div>
      </div>

      {/* Right Panel - Expeditions */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', backgroundColor: '#ffffff' }}>
        <div style={{ padding: '20px' }}>
          <div style={{ marginBottom: '20px', backgroundColor: '#ffffff', padding: '15px', borderRadius: '8px', border: '1px solid #dee2e6' }}>
            <h2 style={{ margin: '0 0 15px 0', color: '#1a1a1a' }}>Expedition Summary</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#d3f9d8', borderRadius: '5px', border: '1px solid #b2f2bb' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2f9e44' }}>{stats.possible}</div>
                <div style={{ fontSize: '12px', color: '#5c940d' }}>Possible</div>
              </div>
              <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#fff3bf', borderRadius: '5px', border: '1px solid #ffe066' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59f00' }}>{stats.partial}</div>
                <div style={{ fontSize: '12px', color: '#d9a825' }}>Partial</div>
              </div>
              <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#ffe0e0', borderRadius: '5px', border: '1px solid #ffa8a8' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>{stats.impossible}</div>
                <div style={{ fontSize: '12px', color: '#c92a2a' }}>Impossible</div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div style={{ marginBottom: '20px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #dee2e6', overflow: 'hidden' }}>
            <button
              onClick={() => setFiltersExpanded(!filtersExpanded)}
              style={{
                width: '100%',
                padding: '15px',
                backgroundColor: '#f8f9fa',
                border: 'none',
                borderBottom: filtersExpanded ? '1px solid #dee2e6' : 'none',
                cursor: 'pointer',
                fontWeight: 'bold',
                color: '#1a1a1a',
                fontSize: '1em',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>Filters</span>
              <span style={{ transform: filtersExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                ▼
              </span>
            </button>

            {filtersExpanded && (
              <div style={{ padding: '15px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                {/* Status Column */}
                <div>
                  <p style={{ margin: '0 0 10px 0', color: '#1a1a1a', fontWeight: 'bold' }}>Status:</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(['possible', 'partial', 'impossible'] as const).map((status) => (
                      <label key={status} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1a1a1a', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={filterStatuses.has(status)}
                          onChange={() => toggleStatusFilter(status)}
                          style={{ cursor: 'pointer' }}
                        />
                        <span style={{ textTransform: 'capitalize' }}>{status}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Maps Column */}
                <div>
                  <p style={{ margin: '0 0 10px 0', color: '#1a1a1a', fontWeight: 'bold' }}>Maps:</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {uniqueMaps.map((map) => (
                      <label key={map} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1a1a1a', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={filterMaps.has(map)}
                          onChange={() => toggleMapFilter(map)}
                          style={{ cursor: 'pointer' }}
                        />
                        <span>{map}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Reward Filters */}
                <div>
                  <p style={{ margin: '0 0 10px 0', color: '#1a1a1a', fontWeight: 'bold' }}>Reward Types:</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {uniqueRewardTypes.map((rewardType) => {
                      const subtypesForType = Array.from(rewardTypeMap.get(rewardType) || []).sort();
                      
                      // Get all reward names for this theme
                      const allRewardNamesForTheme = new Set<string>();
                      subtypesForType.forEach((subtype) => {
                        Array.from(rewardSubtypeMap.get(subtype) || []).forEach((name) => {
                          allRewardNamesForTheme.add(name);
                        });
                      });
                      const allNamesSelected = Array.from(allRewardNamesForTheme).every((name) => filterRewardNames.has(name));
                      const someNamesSelected = Array.from(allRewardNamesForTheme).some((name) => filterRewardNames.has(name));
                      const isIndeterminate = someNamesSelected && !allNamesSelected;
                      
                      const isThemeExpanded = expandedThemes.has(rewardType);
                      return (
                        <div key={rewardType}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                              onClick={() => toggleThemeExpanded(rewardType)}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '0',
                                display: 'flex',
                                alignItems: 'center',
                                color: '#1a1a1a',
                                fontSize: '0.8em',
                                width: '20px',
                                justifyContent: 'center',
                              }}
                            >
                              {isThemeExpanded ? '▼' : '▶'}
                            </button>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold', flex: 1, marginBottom: 0 }}>
                              <input
                                type="checkbox"
                                checked={allNamesSelected}
                                onChange={() => toggleRewardTypeFilter(rewardType)}
                                ref={(input) => {
                                  if (input) input.indeterminate = isIndeterminate;
                                }}
                                style={{ cursor: 'pointer' }}
                              />
                              <span>{rewardType}</span>
                            </label>
                          </div>
                          {/* Subtypes for this reward type */}
                          {isThemeExpanded && (
                            <div style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '5px' }}>
                              {subtypesForType.map((subtype) => {
                                const rewardNamesForSubtype = Array.from(rewardSubtypeMap.get(subtype) || []).sort();
                                const isSubthemeExpanded = expandedSubthemes.has(subtype);
                                const allNamesSelected = rewardNamesForSubtype.every((name) => filterRewardNames.has(name));
                                const someNamesSelected = rewardNamesForSubtype.some((name) => filterRewardNames.has(name));
                                const isIndeterminate = someNamesSelected && !allNamesSelected;
                                return (
                                  <div key={subtype}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <button
                                        onClick={() => toggleSubthemeExpanded(subtype)}
                                        style={{
                                          background: 'none',
                                          border: 'none',
                                          cursor: 'pointer',
                                          padding: '0',
                                          display: 'flex',
                                          alignItems: 'center',
                                          color: '#1a1a1a',
                                          fontSize: '0.75em',
                                          width: '20px',
                                          justifyContent: 'center',
                                        }}
                                      >
                                        {isSubthemeExpanded ? '▼' : '▶'}
                                      </button>
                                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9em', flex: 1, marginBottom: 0 }}>
                                        <input
                                          type="checkbox"
                                          checked={allNamesSelected}
                                          onChange={() => toggleRewardSubtypeFilter(subtype)}
                                          ref={(input) => {
                                            if (input) input.indeterminate = isIndeterminate;
                                          }}
                                          style={{ cursor: 'pointer' }}
                                        />
                                        <span>{subtype}</span>
                                      </label>
                                    </div>
                                    {/* Reward names for this subtype */}
                                    {isSubthemeExpanded && (
                                      <div style={{ paddingLeft: '40px', display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '3px' }}>
                                        {rewardNamesForSubtype.map((rewardName) => (
                                          <label key={rewardName} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85em', color: '#495057' }}>
                                            <input
                                              type="checkbox"
                                              checked={filterRewardNames.has(rewardName)}
                                              onChange={() => toggleRewardNameFilter(rewardName)}
                                              style={{ cursor: 'pointer' }}
                                            />
                                            <span>{rewardName}</span>
                                          </label>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          <ExpeditionList
            expeditions={feasibilities}
            filterByStatuses={filterStatuses}
            filterByMaps={filterMaps}
            filterByRewardNames={filterRewardNames}
            pinnedExpeditions={pinnedExpeditions}
            onTogglePin={togglePinExpedition}
            ignoredExpeditions={ignoredExpeditions}
            onToggleIgnore={toggleIgnoreExpedition}
          />
        </div>
      </div>

      {/* Skill Selector Modal */}
      {selectedStaff && (
        <SkillSelector
          staffMember={selectedStaff}
          onSkillSelect={handleSkillSelect}
          onClose={handleSkillSelectorClose}
        />
      )}
    </div>
  );
}

export default App;
