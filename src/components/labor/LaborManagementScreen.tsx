import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { f } from '@/utils/fontScale';

import { LaborMatrixTable } from './LaborMatrixTable';
import { WorkerDirectoryView } from './workers/WorkerDirectoryView';

// Helper to format Date instance to MM-DD-YYYY string safely in local time
const formatDateToMMDDYYYY = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}-${day}-${year}`;
};

export default function LaborManagementScreen() {
  const [activeTab, setActiveTab] = useState<'matrix' | 'workers'>('matrix');

  // Compute today's date dynamically
  const [today, setToday] = useState(() => new Date());

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const timeNow = new Date();
    if (formatDateToMMDDYYYY(timeNow) !== formatDateToMMDDYYYY(today)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setToday(timeNow);
    }
  });

  const todayStr = useMemo(() => formatDateToMMDDYYYY(today), [today]);

  // Initial range: today to today
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);

  // Compute days of current week up to today
  const weekDaysUpToToday = useMemo(() => {
    const currentDayOfWeek = today.getDay(); // 0 is Sunday, 1 is Mon, etc.
    // Distance from Monday (if Sunday (0), distance is 6 days back)
    const diffToMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;

    const monday = new Date(today);
    monday.setDate(today.getDate() - diffToMonday);

    const days: { label: string; dateStr: string }[] = [];
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    // Iterate day by day from Monday up to today
    for (let i = 0; i <= diffToMonday; i++) {
      const dayDate = new Date(monday);
      dayDate.setDate(monday.getDate() + i);

      days.push({
        label: dayLabels[i],
        dateStr: formatDateToMMDDYYYY(dayDate),
      });
    }

    return days;
  }, [today]);

  // Quick preset helper functions
  const handleSetToday = () => {
    setStartDate(todayStr);
    setEndDate(todayStr);
  };

  const handleSetThisWeek = () => {
    const mondayStr = weekDaysUpToToday[0]?.dateStr ?? todayStr;
    setStartDate(mondayStr);
    setEndDate(todayStr);
  };

  const handleSetSingleDay = (dateStr: string) => {
    setStartDate(dateStr);
    setEndDate(dateStr);
  };

  return (
    <View style={styles.container}>
      {/* Top Navigation Switcher */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'matrix' && styles.activeTabItem]}
          onPress={() => setActiveTab('matrix')}
        >
          <Text style={[styles.tabText, activeTab === 'matrix' && styles.activeTabText]}>
            Labor Items Matrix
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'workers' && styles.activeTabItem]}
          onPress={() => setActiveTab('workers')}
        >
          <Text style={[styles.tabText, activeTab === 'workers' && styles.activeTabText]}>
            Worker View
          </Text>
        </TouchableOpacity>
      </View>

      {/* Date Range Selector Bar */}
      <View style={styles.dateFilterBar}>
        <View style={styles.rangeInputContainer}>
          <TextInput
            style={styles.dateInput}
            value={startDate}
            onChangeText={setStartDate}
            placeholder="MM-DD-YYYY"
            placeholderTextColor="#8A93A3"
            maxLength={10}
          />
          <Text style={styles.rangeSeparator}>to</Text>
          <TextInput
            style={styles.dateInput}
            value={endDate}
            onChangeText={setEndDate}
            placeholder="MM-DD-YYYY"
            placeholderTextColor="#8A93A3"
            maxLength={10}
          />
        </View>

        {/* Preset Range Buttons */}
        <View style={styles.presetsContainer}>
          <TouchableOpacity
            style={[
              styles.presetBtn,
              startDate === todayStr && endDate === todayStr && styles.activePresetBtn,
            ]}
            onPress={handleSetToday}
          >
            <Text
              style={[
                styles.presetBtnText,
                startDate === todayStr && endDate === todayStr && styles.activePresetBtnText,
              ]}
            >
              Today
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.presetBtn,

              startDate === weekDaysUpToToday[0]?.dateStr &&
                endDate === todayStr &&
                styles.activePresetBtn,
            ]}
            onPress={handleSetThisWeek}
          >
            <Text
              style={[
                styles.presetBtnText,
                startDate === weekDaysUpToToday[0]?.dateStr &&
                  endDate === todayStr &&
                  styles.activePresetBtnText,
              ]}
            >
              This Week
            </Text>
          </TouchableOpacity>
        </View>

        {/* Dynamic Day Pills (e.g. Mon, Tue, Wed up to today) */}
        <View style={styles.dayPillsContainer}>
          {weekDaysUpToToday.map((day) => {
            const isSelected = startDate === day.dateStr && endDate === day.dateStr;

            return (
              <TouchableOpacity
                key={day.dateStr}
                style={[styles.dayPill, isSelected && styles.activeDayPill]}
                onPress={() => handleSetSingleDay(day.dateStr)}
              >
                <Text style={[styles.dayPillText, isSelected && styles.activeDayPillText]}>
                  {day.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Content Area */}
      <View style={styles.content}>
        {activeTab === 'matrix' ? (
          <LaborMatrixTable startDate={startDate} endDate={endDate} />
        ) : (
          <WorkerDirectoryView startDate={startDate} endDate={endDate} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  tabBar: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#06132F',
    gap: 12,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#1e293b',
  },
  activeTabItem: {
    backgroundColor: '#1745D1',
  },
  tabText: {
    color: '#94a3b8',
    fontWeight: '600',
    fontSize: f(14),
  },
  activeTabText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  dateFilterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#D9DEE8',
    gap: 12,
    flexWrap: 'wrap',
  },
  dateFilterLabel: {
    fontSize: f(14),
    fontWeight: '700',
    color: '#06132F',
  },
  rangeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateInput: {
    width: 140,
    height: 36,
    borderWidth: 1,
    borderColor: '#CBD2DE',
    borderRadius: 6,
    textAlign: 'center',
    fontSize: f(13),
    fontWeight: '600',
    color: '#06132F',
    backgroundColor: '#F3F5F8',
  },
  rangeSeparator: {
    fontSize: f(13),
    fontWeight: '600',
    color: '#596273',
  },
  presetsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  presetBtn: {
    paddingHorizontal: 12,
    height: 36,
    backgroundColor: '#E9EDF4',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activePresetBtn: {
    backgroundColor: '#1745D1',
  },
  presetBtnText: {
    fontSize: f(12),
    fontWeight: '700',
    color: '#1745D1',
  },
  activePresetBtnText: {
    color: '#FFFFFF',
  },
  dayPillsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderLeftWidth: 1,
    borderLeftColor: '#D9DEE8',
    paddingLeft: 10,
  },
  dayPill: {
    paddingHorizontal: 10,
    height: 32,
    backgroundColor: '#F3F5F8',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CBD2DE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeDayPill: {
    backgroundColor: '#06132F',
    borderColor: '#06132F',
  },
  dayPillText: {
    fontSize: f(12),
    fontWeight: '600',
    color: '#596273',
  },
  activeDayPillText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
});
