
import React, { useState, useEffect } from 'react';
import { View, Text, SectionList, StyleSheet, TouchableOpacity } from 'react-native';
import { getDiaryEntries, DiaryEntry } from '../storage/diary';
import { StackNavigationProp } from '@react-navigation/stack';
import Header from '../components/Header';
import { colors, typography, spacing } from '../theme/theme';

export type RootStackParamList = {
  DiaryList: undefined;
  AddDiary: { id?: string };
};

type DiaryListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'DiaryList'>;

interface DiarySection {
  title: string;
  data: DiaryEntry[];
}

const formatTime = (isoString: string) => {
  const date = new Date(isoString);
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const minutesStr = minutes < 10 ? '0' + minutes : minutes;
  return `${hours}:${minutesStr} ${ampm}`;
};

const formatDateHeader = (isoString: string) => {
  const date = new Date(isoString);
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString(undefined, options);
};

const DiaryListScreen = ({ navigation }: { navigation: DiaryListScreenNavigationProp }) => {
  const [sections, setSections] = useState<DiarySection[]>([]);

  useEffect(() => {
    const fetchEntries = async () => {
      const diaryEntries = await getDiaryEntries();
      const sortedEntries = diaryEntries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Group by Date for Scrollytelling format
      const grouped = sortedEntries.reduce((acc, entry) => {
        const dateKey = formatDateHeader(entry.createdAt);
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(entry);
        return acc;
      }, {} as Record<string, DiaryEntry[]>);

      const sectionData: DiarySection[] = Object.keys(grouped).map(dateKey => ({
        title: dateKey,
        data: grouped[dateKey]
      }));

      setSections(sectionData);
    };

    const unsubscribe = navigation.addListener('focus', () => {
      fetchEntries();
    });

    return unsubscribe;
  }, [navigation]);

  const renderEmptyListComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>It's quiet here.</Text>
      <Text style={styles.emptySubText}>Tap the + below to write your first entry.</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="Journal" />
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('AddDiary', { id: item.id })} activeOpacity={0.7}>
            <View style={styles.entryContainer}>
              <View style={styles.metaRow}>
                 <Text style={styles.entryTime}>{formatTime(item.createdAt)}</Text>
                 <Text style={styles.entryMood}>{item.mood || item.title || '📝'}</Text>
              </View>
              <Text style={styles.entrySnippet} numberOfLines={3}>
                {item.content}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={renderEmptyListComponent}
        contentContainerStyle={styles.listContentContainer}
        showsVerticalScrollIndicator={false}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddDiary')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContentContainer: {
    padding: spacing.lg,
    paddingBottom: 100, // Space for FAB
  },
  sectionHeader: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: typography.fontFamilySans,
    color: colors.textPrimary,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    letterSpacing: -0.5,
  },
  entryContainer: {
    backgroundColor: 'transparent',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  entryTime: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: typography.fontFamilySans,
    marginRight: spacing.sm,
  },
  entryMood: {
    fontSize: 16,
  },
  entrySnippet: {
    fontSize: 18,
    fontFamily: typography.fontFamilySerif,
    color: colors.textPrimary,
    lineHeight: 26,
  },
  fab: {
    position: 'absolute',
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    right: spacing.xl,
    bottom: spacing.xl * 1.5,
    backgroundColor: colors.accentSage,
    borderRadius: 32,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  fabText: {
    fontSize: 32,
    color: colors.background,
    fontWeight: '300',
    marginTop: -4, // Optical centering
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 24,
    fontFamily: typography.fontFamilySerif,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptySubText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});

export default DiaryListScreen;
