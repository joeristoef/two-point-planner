import { useState, useEffect } from 'react';
import { StaffMember, Skill, Expedition } from './types/index';
import { expeditions as expeditionsBase } from './data/expeditions';
import { StaffForm } from './components/StaffForm';
import { StaffList } from './components/StaffList';
import { ExpeditionList } from './components/ExpeditionList';
import { SkillSelector } from './components/SkillSelector';
import { checkAllExpeditions } from './utils/expeditionMatcher';
import { parseRewardsCsv } from './data/loadRewards';
import { getRewardIcon, getStaffTypeIcon, getMapIcon } from './utils/iconMaps';
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
  const [showInstructions, setShowInstructions] = useState(false);
  const [showCredits, setShowCredits] = useState(false);
  const [showPlannedFeatures, setShowPlannedFeatures] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);
  const [plannedFeaturesContent, setPlannedFeaturesContent] = useState('');
  const [changelogContent, setChangelogContent] = useState('');
  const [currentVersion, setCurrentVersion] = useState('');
  const [hasNewVersion, setHasNewVersion] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [mobileActivePanel, setMobileActivePanel] = useState<'staff' | 'expeditions'>('staff');

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

  // Load markdown files on mount
  useEffect(() => {
    Promise.all([
      fetch('/PLANNED_FEATURES.md').then(res => res.text()),
      fetch('/CHANGELOG.md').then(res => res.text())
    ]).then(([features, changelog]) => {
      setPlannedFeaturesContent(features);
      setChangelogContent(changelog);
      
      // Extract version from changelog
      const versionMatch = changelog.match(/## Version ([\d.]+)/);
      if (versionMatch) {
        const version = versionMatch[1];
        setCurrentVersion(version);
        
        // Check if this is a new version since last visit
        const lastSeenVersion = localStorage.getItem('lastSeenVersion');
        if (lastSeenVersion !== version) {
          setHasNewVersion(true);
        }
      }
    }).catch(err => {
      console.error('Error loading content files:', err);
    });
  }, []);


  // Load staff and filters from localStorage on mount
  useEffect(() => {
    const savedStaff = localStorage.getItem('staff');
    const savedFilterStatuses = localStorage.getItem('filterStatuses');
    const savedFilterMaps = localStorage.getItem('filterMaps');
    const savedFilterRewardNames = localStorage.getItem('filterRewardNames');
    const savedPinnedExpeditions = localStorage.getItem('pinnedExpeditions');
    const savedIgnoredExpeditions = localStorage.getItem('ignoredExpeditions');

    if (savedStaff) {
      try {
        const parsedStaff = JSON.parse(savedStaff).map((member: any) => ({
          ...member,
          skills: new Map(member.skills),
        }));
        setStaff(parsedStaff);
      } catch (e) {
        console.error('Error loading staff', e);
      }
    }

    if (savedFilterStatuses) {
      try {
        setFilterStatuses(new Set(JSON.parse(savedFilterStatuses)));
      } catch (e) {
        console.error('Error loading filter statuses', e);
      }
    }

    if (savedFilterMaps) {
      try {
        setFilterMaps(new Set(JSON.parse(savedFilterMaps)));
      } catch (e) {
        console.error('Error loading filter maps', e);
      }
    }

    if (savedFilterRewardNames) {
      try {
        setFilterRewardNames(new Set(JSON.parse(savedFilterRewardNames)));
      } catch (e) {
        console.error('Error loading filter reward names', e);
      }
    }

    if (savedPinnedExpeditions) {
      try {
        setPinnedExpeditions(new Set(JSON.parse(savedPinnedExpeditions)));
      } catch (e) {
        console.error('Error loading pinned expeditions', e);
      }
    }

    if (savedIgnoredExpeditions) {
      try {
        setIgnoredExpeditions(new Set(JSON.parse(savedIgnoredExpeditions)));
      } catch (e) {
        console.error('Error loading ignored expeditions', e);
      }
    }

    // Mark that we've finished loading from localStorage
    setHasLoaded(true);
  }, []);

  // Save staff to localStorage whenever it changes (but only after loading)
  useEffect(() => {
    if (!hasLoaded) return;
    const staffToSave = staff.map((member) => ({
      ...member,
      skills: Array.from(member.skills.entries()),
    }));
    localStorage.setItem('staff', JSON.stringify(staffToSave));
  }, [staff, hasLoaded]);

  // Save filters to localStorage whenever they change (but only after loading)
  useEffect(() => {
    if (!hasLoaded) return;
    localStorage.setItem('filterStatuses', JSON.stringify(Array.from(filterStatuses)));
  }, [filterStatuses, hasLoaded]);

  useEffect(() => {
    if (!hasLoaded) return;
    localStorage.setItem('filterMaps', JSON.stringify(Array.from(filterMaps)));
  }, [filterMaps, hasLoaded]);

  useEffect(() => {
    if (!hasLoaded) return;
    localStorage.setItem('filterRewardNames', JSON.stringify(Array.from(filterRewardNames)));
  }, [filterRewardNames, hasLoaded]);

  useEffect(() => {
    if (!hasLoaded) return;
    localStorage.setItem('pinnedExpeditions', JSON.stringify(Array.from(pinnedExpeditions)));
  }, [pinnedExpeditions, hasLoaded]);

  useEffect(() => {
    if (!hasLoaded) return;
    localStorage.setItem('ignoredExpeditions', JSON.stringify(Array.from(ignoredExpeditions)));
  }, [ignoredExpeditions, hasLoaded]);

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
  
  // Order maps as specified
  const mapOrder = ['Bone Belt', 'Two Point Sea', 'Bungle Burrows', 'Known Universe', 'Netherworld', 'Farflung Isles', 'Scorched Earth', 'Digiverse'];
  const uniqueMaps = Array.from(new Set(expeditions.map((e) => e.map))).sort((a, b) => {
    const indexA = mapOrder.indexOf(a);
    const indexB = mapOrder.indexOf(b);
    if (indexA === -1 && indexB === -1) return a.localeCompare(b); // Both not in order, sort alphabetically
    if (indexA === -1) return 1; // a not in order, comes after
    if (indexB === -1) return -1; // b not in order, comes after
    return indexA - indexB; // Both in order, sort by order
  });
  
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
  
  // Order reward types to match expert order: Prehistory, Botany, Marine Life, Science, Space, Supernatural, Wildlife, Fantasy, Digital
  const rewardTypeOrder = ['Prehistory', 'Botany', 'Marine Life', 'Science', 'Space', 'Supernatural', 'Wildlife', 'Fantasy', 'Digital'];
  const uniqueRewardTypes = Array.from(rewardTypeMap.keys()).sort((a, b) => {
    const indexA = rewardTypeOrder.indexOf(a);
    const indexB = rewardTypeOrder.indexOf(b);
    if (indexA === -1 && indexB === -1) return a.localeCompare(b); // Both not in order, sort alphabetically
    if (indexA === -1) return 1; // a not in order, comes after
    if (indexB === -1) return -1; // b not in order, comes after
    return indexA - indexB; // Both in order, sort by order
  });
  
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

  const handleOpenChangelog = () => {
    setShowChangelog(true);
    // Mark version as seen
    if (currentVersion) {
      localStorage.setItem('lastSeenVersion', currentVersion);
      setHasNewVersion(false);
    }
  };

  const resetStaff = () => {
    if (window.confirm('Are you sure you want to reset all staff members? This cannot be undone.')) {
      setStaff([]);
      setSelectedStaffId(null);
    }
  };

  const resetFilters = () => {
    if (window.confirm('Are you sure you want to reset all filters?')) {
      setFilterStatuses(new Set(['possible', 'partial', 'impossible']));
      setFilterMaps(new Set());
      setFilterRewardNames(new Set());
      setExpandedThemes(new Set());
      setExpandedSubthemes(new Set());
      setPinnedExpeditions(new Set());
      setIgnoredExpeditions(new Set());
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f8f9fa', flexDirection: 'column' }}>
      {/* Mobile Panel Toggle - Always visible on mobile */}
      <div className="mobile-toggle" style={{ display: 'none', gap: '10px', padding: '10px 20px', backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
        <button
          onClick={() => setMobileActivePanel('staff')}
          style={{
            flex: 1,
            padding: '8px 12px',
            backgroundColor: mobileActivePanel === 'staff' ? '#4c6ef5' : '#e9ecef',
            color: mobileActivePanel === 'staff' ? '#ffffff' : '#495057',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
          }}
        >
          Staff
        </button>
        <button
          onClick={() => setMobileActivePanel('expeditions')}
          style={{
            flex: 1,
            padding: '8px 12px',
            backgroundColor: mobileActivePanel === 'expeditions' ? '#4c6ef5' : '#e9ecef',
            color: mobileActivePanel === 'expeditions' ? '#ffffff' : '#495057',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
          }}
        >
          Expeditions
        </button>
      </div>

      {/* Main content container */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      <div
        className={`staff-panel ${mobileActivePanel === 'expeditions' ? 'hidden' : ''}`}
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
          <h1 style={{ margin: '0 0 12px 0', color: '#1a1a1a' }}>Two Point Museum™ Planner {currentVersion && <span style={{ fontSize: '0.6em', color: '#666' }}>v{currentVersion}</span>}</h1>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <button
              onClick={() => setShowInstructions(true)}
              style={{
                padding: '6px 12px',
                backgroundColor: '#4c6ef5',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#364fc7';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#4c6ef5';
              }}
            >
              Instructions
            </button>
            <button
              onClick={() => setShowCredits(true)}
              style={{
                padding: '6px 12px',
                backgroundColor: '#748ffc',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#5c7cfa';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#748ffc';
              }}
            >
              Credits
            </button>
            <button
              onClick={() => window.open('https://docs.google.com/forms/d/e/1FAIpQLSdZikF5AhrT7BPp94z_V0z20dNp502sPRzFBQ7jJu0kh0nt4Q/viewform?usp=dialog', '_blank')}
              style={{
                padding: '6px 12px',
                backgroundColor: '#a78bfa',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#9370db';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#a78bfa';
              }}
            >
              Feedback
            </button>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setShowPlannedFeatures(true)}
              style={{
                padding: '6px 12px',
                backgroundColor: '#f76707',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#e56600';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#f76707';
              }}
            >
              Planned Features
            </button>
            <button
              onClick={handleOpenChangelog}
              style={{
                padding: '6px 12px',
                backgroundColor: '#40c057',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                position: 'relative',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#37b24d';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#40c057';
              }}
            >
              Changelog
              {hasNewVersion && (
                <span style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  fontSize: '18px',
                }}>
                  ⭐
                </span>
              )}
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', padding: '0 20px 15px 20px', borderBottom: '1px solid #dee2e6', flexShrink: 0 }}>
          <button
            onClick={resetStaff}
            style={{
              flex: 1,
              padding: '8px 12px',
              backgroundColor: '#ff6b6b',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#ee5a52';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#ff6b6b';
            }}
          >
            Reset Staff
          </button>
          <button
            onClick={resetFilters}
            style={{
              flex: 1,
              padding: '8px 12px',
              backgroundColor: '#ffa94d',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#fd7e14';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#ffa94d';
            }}
          >
            Reset Filters
          </button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1, paddingBottom: '100px' }}>
          <StaffForm onAddStaff={handleAddStaff} />
          <StaffList staff={staff} onRemoveStaff={handleRemoveStaff} onSkillSlotClick={handleSkillSlotClick} onSkillLevelChange={handleSkillLevelChange} />
        </div>
      </div>

      {/* Right Panel - Expeditions */}
      <div className={`expeditions-panel ${mobileActivePanel === 'staff' ? 'hidden' : ''}`} style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px' }}>
          <div style={{ marginBottom: '20px', backgroundColor: '#ffffff', padding: '15px', borderRadius: '8px', border: '1px solid #dee2e6' }}>
            <h2 style={{ margin: '0 0 15px 0', color: '#1a1a1a' }}>Expedition Summary</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', backgroundColor: '#d3f9d8', borderRadius: '5px', border: '1px solid #b2f2bb' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#28a745', flexShrink: 0 }}>✓</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#2f9e44' }}>{stats.possible}</div>
                  <div style={{ fontSize: '11px', color: '#5c940d' }}>Possible</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', backgroundColor: '#fff3bf', borderRadius: '5px', border: '1px solid #ffe066' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffc107', flexShrink: 0 }}>≈</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f59f00' }}>{stats.partial}</div>
                  <div style={{ fontSize: '11px', color: '#d9a825' }}>Partial</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', backgroundColor: '#ffe0e0', borderRadius: '5px', border: '1px solid #ffa8a8' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#dc3545', flexShrink: 0 }}>✕</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#dc3545' }}>{stats.impossible}</div>
                  <div style={{ fontSize: '11px', color: '#c92a2a' }}>Impossible</div>
                </div>
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
              <div className="filters-grid" style={{ padding: '15px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                {/* Left Column: Status */}
                <div>
                  {/* Status Section */}
                  <div>
                    <p style={{ margin: '0 0 10px 0', color: '#1a1a1a', fontWeight: 'bold' }}>Status:</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {(['possible', 'partial', 'impossible'] as const).map((status) => {
                        const statusConfig = {
                          possible: { icon: '✓', color: '#28a745', symbol: 'checkmark' },
                          partial: { icon: '≈', color: '#ffc107', symbol: 'tilde' },
                          impossible: { icon: '✕', color: '#dc3545', symbol: 'cross' },
                        };
                        const config = statusConfig[status];
                        return (
                          <label key={status} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1a1a1a', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={filterStatuses.has(status)}
                              onChange={() => toggleStatusFilter(status)}
                              style={{ cursor: 'pointer' }}
                            />
                            <span style={{
                              fontSize: '1.2em',
                              fontWeight: 'bold',
                              color: config.color,
                              width: '20px',
                              textAlign: 'center',
                              lineHeight: '1',
                            }}>
                              {config.icon}
                            </span>
                            <span style={{ textTransform: 'capitalize' }}>{status}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Middle Column: Maps */}
                <div>
                  {/* Maps Section */}
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
                          <img
                            src={getMapIcon(map)}
                            alt={map}
                            style={{ width: '24px', height: '24px', objectFit: 'cover', borderRadius: '2px', flexShrink: 0 }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                          <span>{map}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Reward Filters */}
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
                              {/* Expert icon for this reward type */}
                              <img
                                src={getStaffTypeIcon(`${rewardType} Expert`)}
                                alt={`${rewardType} Expert`}
                                style={{ width: '24px', height: '24px', objectFit: 'cover', borderRadius: '2px', flexShrink: 0 }}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
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
                                          <label key={rewardName} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85em', color: '#495057' }}>
                                            <input
                                              type="checkbox"
                                              checked={filterRewardNames.has(rewardName)}
                                              onChange={() => toggleRewardNameFilter(rewardName)}
                                              style={{ cursor: 'pointer', marginRight: '2px' }}
                                            />
                                            <img
                                              src={getRewardIcon(rewardName)}
                                              alt={rewardName}
                                              style={{ width: '31px', height: '31px', objectFit: 'cover', borderRadius: '2px', flexShrink: 0 }}
                                              onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                              }}
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

      {/* Instructions Modal */}
      {showInstructions && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowInstructions(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              padding: '30px',
              maxWidth: '600px',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#1a1a1a' }}>How to Use</h2>
              <button
                onClick={() => setShowInstructions(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666',
                  padding: 0,
                  width: '30px',
                  height: '30px',
                }}
              >
                ×
              </button>
            </div>

            <div style={{ color: '#333', lineHeight: '1.6' }}>
              <h3 style={{ marginTop: '20px', marginBottom: '10px', color: '#1a1a1a' }}>1. Add Staff Members</h3>
              <p style={{ marginTop: 0 }}>Start by adding your museum staff members on the left panel.</p>

              <h3 style={{ marginTop: '20px', marginBottom: '10px', color: '#1a1a1a' }}>2. Assign Skills</h3>
              <p style={{ marginTop: 0 }}>Click on a skill slot under a staff member to select a skill. Each skill can have a level from 1 to 3. Use the + and - buttons to adjust skill levels.</p>

              <h3 style={{ marginTop: '20px', marginBottom: '10px', color: '#1a1a1a' }}>3. Filter Expeditions</h3>
              <p style={{ marginTop: 0 }}>Use the filter panel on the right to narrow down expeditions by:</p>
              <ul style={{ marginTop: '8px', marginBottom: 0 }}>
                <li><strong>Status:</strong> Possible (green), Partial (yellow), or Impossible (red)</li>
                <li><strong>Maps:</strong> Select expedition maps</li>
                <li><strong>Reward Types:</strong> Filter by reward themes and specific items</li>
              </ul>

              <h3 style={{ marginTop: '20px', marginBottom: '10px', color: '#1a1a1a' }}>4. Pin & Ignore Expeditions</h3>
              <p style={{ marginTop: 0 }}>Pin expeditions to keep them at the top of the list. Use the ignore button to exclude expeditions from the summary and push them to the bottom—this is useful for marking expeditions as completed or ones you don't want to focus on.</p>

              <h3 style={{ marginTop: '20px', marginBottom: '10px', color: '#1a1a1a' }}>5. View Summary</h3>
              <p style={{ marginTop: 0 }}>The expedition summary shows how many expeditions are possible, partial, or impossible with your current staff (excluding ignored expeditions).</p>

              <h3 style={{ marginTop: '20px', marginBottom: '10px', color: '#1a1a1a' }}>Tips</h3>
              <ul style={{ marginTop: '8px', marginBottom: 0 }}>
                <li>Duplicate rewards across expeditions are highlighted to help you plan efficiently</li>
                <li>Click on reward names in the filter to show only expeditions with those specific rewards</li>
                <li>Use the expand/collapse buttons to manage the filter panel and see more expeditions</li>
              </ul>
            </div>

            <button
              onClick={() => setShowInstructions(false)}
              style={{
                marginTop: '25px',
                padding: '10px 20px',
                backgroundColor: '#4c6ef5',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#364fc7';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#4c6ef5';
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Credits Modal */}
      {showCredits && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowCredits(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              padding: '30px',
              maxWidth: '600px',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#1a1a1a' }}>Credits & Legal</h2>
              <button
                onClick={() => setShowCredits(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666',
                  padding: 0,
                  width: '30px',
                  height: '30px',
                }}
              >
                ×
              </button>
            </div>

            <div style={{ color: '#333', lineHeight: '1.6' }}>
              <h3 style={{ marginTop: '20px', marginBottom: '10px', color: '#1a1a1a' }}>Game Intellectual Property</h3>
              <p style={{ marginTop: 0 }}><strong>Two Point Studios Limited</strong> owns the trademarks for "Two Point," "Two Point Museum™," and all related logos and intellectual property associated with the game.</p>

              <h3 style={{ marginTop: '20px', marginBottom: '10px', color: '#1a1a1a' }}>Publisher</h3>
              <p style={{ marginTop: 0 }}><strong>SEGA CORPORATION</strong> is the publisher of Two Point Museum™ and holds all copyrights for the game and its brand assets.</p>

              <h3 style={{ marginTop: '20px', marginBottom: '10px', color: '#1a1a1a' }}>Application Creator</h3>
              <p style={{ marginTop: 0 }}>This Two Point Museum™ Planner application was created by <strong>Joeristoef</strong> as a fan-made planning tool.</p>

              <h3 style={{ marginTop: '20px', marginBottom: '10px', color: '#1a1a1a' }}>Disclaimer</h3>
              <p style={{ marginTop: 0 }}>This is an unofficial fan application and is not affiliated with, endorsed by, or associated with Two Point Studios Limited or SEGA CORPORATION. All trademarks and copyrights belong to their respective owners.</p>
            </div>

            <button
              onClick={() => setShowCredits(false)}
              style={{
                marginTop: '25px',
                padding: '10px 20px',
                backgroundColor: '#4c6ef5',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#364fc7';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#4c6ef5';
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Planned Features Modal */}
      {showPlannedFeatures && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowPlannedFeatures(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              padding: '30px',
              maxWidth: '600px',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#1a1a1a' }}>Planned Features</h2>
              <button
                onClick={() => setShowPlannedFeatures(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666',
                  padding: 0,
                  width: '30px',
                  height: '30px',
                }}
              >
                ×
              </button>
            </div>

            <div style={{ color: '#333', lineHeight: '1.6' }}>
              {plannedFeaturesContent && (
                <>
                  {plannedFeaturesContent.split('\n').map((line, idx) => {
                    if (line.startsWith('# ')) {
                      return null; // Skip the main heading
                    } else if (line.startsWith('## ')) {
                      return <h3 key={idx} style={{ marginTop: '20px', marginBottom: '10px', color: '#1a1a1a' }}>{line.replace('## ', '')}</h3>;
                    } else if (line.startsWith('- ')) {
                      return <div key={idx} style={{ marginLeft: '20px', marginBottom: '8px' }}>• {line.replace('- ', '')}</div>;
                    } else if (line.trim()) {
                      return <p key={idx} style={{ marginTop: '12px', marginBottom: '12px' }}>{line}</p>;
                    }
                    return null;
                  })}
                </>
              )}
            </div>

            <button
              onClick={() => setShowPlannedFeatures(false)}
              style={{
                marginTop: '25px',
                padding: '10px 20px',
                backgroundColor: '#4c6ef5',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#364fc7';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#4c6ef5';
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Changelog Modal */}
      {showChangelog && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowChangelog(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              padding: '30px',
              maxWidth: '600px',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#1a1a1a' }}>Changelog</h2>
              <button
                onClick={() => setShowChangelog(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666',
                  padding: 0,
                  width: '30px',
                  height: '30px',
                }}
              >
                ×
              </button>
            </div>

            <div style={{ color: '#333', lineHeight: '1.6' }}>
              {changelogContent && (
                <>
                  {changelogContent.split('\n').map((line, idx) => {
                    if (line.startsWith('# ')) {
                      return null; // Skip the main heading
                    } else if (line.startsWith('## ')) {
                      return <h3 key={idx} style={{ marginTop: '20px', marginBottom: '5px', color: '#1a1a1a' }}>{line.replace('## ', '')}</h3>;
                    } else if (/^\w+ \d+, \d{4}$/.test(line.trim())) {
                      // Date pattern: "January 10, 2026"
                      return <p key={idx} style={{ marginTop: '2px', marginBottom: '12px', fontSize: '13px', color: '#999' }}>{line}</p>;
                    } else if (line.startsWith('- ')) {
                      return <div key={idx} style={{ marginLeft: '20px', marginBottom: '6px' }}>• {line.replace('- ', '')}</div>;
                    } else if (line.trim()) {
                      return <p key={idx} style={{ marginTop: '8px', marginBottom: '8px', fontSize: '14px', color: '#666' }}>{line}</p>;
                    }
                    return null;
                  })}
                </>
              )}
            </div>

            <button
              onClick={() => setShowChangelog(false)}
              style={{
                marginTop: '25px',
                padding: '10px 20px',
                backgroundColor: '#4c6ef5',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#364fc7';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#4c6ef5';
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default App;
