
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../theme/theme';

const Header = ({ title }: { title: string }) => {
  return (
    <View style={styles.header}>
      <Text style={styles.headerText}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    width: '100%',
    paddingTop: 60, // Accommodate safe area roughly if no SafeAreaView
    paddingBottom: spacing.lg,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerText: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '600',
    fontFamily: typography.fontFamilySans,
    letterSpacing: -0.5,
  },
});

export default Header;
