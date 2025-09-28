import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { ProgressBar } from 'react-native-paper';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

const PerformanceCard = () => {
  const { width, height } = useWindowDimensions();

  // Responsive calculations
  const isTablet = width >= 768;
  const isLargePhone = width >= 414;
  const isSmallPhone = width < 375;
  const isVerySmallPhone = width < 350;

  // Dynamic sizing functions
  const getCardPadding = () => {
    if (isTablet) return Math.max(24, width * 0.031);
    if (isLargePhone) return Math.max(20, width * 0.048);
    if (isSmallPhone) return Math.max(14, width * 0.037);
    return Math.max(18, width * 0.048);
  };

  const getCircularProgressSize = () => {
    if (isTablet) return Math.min(160, width * 0.208);
    if (isVerySmallPhone) return Math.min(90, width * 0.257);
    if (isSmallPhone) return Math.min(100, width * 0.267);
    if (isLargePhone) return Math.min(130, width * 0.314);
    return Math.min(120, width * 0.32);
  };

  const getCircularProgressWidth = () => {
    if (isTablet) return 14;
    if (isVerySmallPhone) return 8;
    if (isSmallPhone) return 9;
    return 10;
  };

  const getTitleFontSize = () => {
    if (isTablet) return Math.min(20, width * 0.026);
    if (isSmallPhone) return Math.min(13, width * 0.035);
    return Math.min(15, width * 0.04);
  };

  const getPerfTextFontSize = () => {
    if (isTablet) return Math.min(28, width * 0.036);
    if (isVerySmallPhone) return Math.min(18, width * 0.051);
    if (isSmallPhone) return Math.min(20, width * 0.053);
    return Math.min(22, width * 0.059);
  };

  const getSubjectLabelFontSize = () => {
    if (isTablet) return Math.min(16, width * 0.021);
    if (isVerySmallPhone) return Math.min(11, width * 0.031);
    if (isSmallPhone) return Math.min(12, width * 0.032);
    return Math.min(13, width * 0.035);
  };

  const getSubjectPercentFontSize = () => {
    if (isTablet) return Math.min(14, width * 0.018);
    if (isVerySmallPhone) return Math.min(10, width * 0.029);
    if (isSmallPhone) return Math.min(11, width * 0.029);
    return Math.min(12, width * 0.032);
  };

  const getBadgeFontSize = () => {
    if (isTablet) return Math.min(13, width * 0.017);
    if (isSmallPhone) return Math.min(10, width * 0.027);
    return Math.min(11, width * 0.029);
  };

  const getProgressBarHeight = () => {
    if (isTablet) return 9;
    if (isSmallPhone) return 6;
    return 7;
  };

  const getDotSize = () => {
    if (isTablet) return 16;
    if (isSmallPhone) return 10;
    return 12;
  };

  const getSpacing = () => {
    if (isTablet)
      return {
        circularMargin: 30,
        subjectMargin: 16,
        dotMargin: 12,
        badgePaddingH: 14,
        badgePaddingV: 6,
      };
    if (isVerySmallPhone)
      return {
        circularMargin: 12,
        subjectMargin: 8,
        dotMargin: 8,
        badgePaddingH: 8,
        badgePaddingV: 3,
      };
    if (isSmallPhone)
      return {
        circularMargin: 15,
        subjectMargin: 10,
        dotMargin: 8,
        badgePaddingH: 8,
        badgePaddingV: 3,
      };
    return {
      circularMargin: 20,
      subjectMargin: 12,
      dotMargin: 10,
      badgePaddingH: 10,
      badgePaddingV: 4,
    };
  };

  const spacing = getSpacing();

  // Check if we should stack vertically on very small screens
  const shouldStackVertically = isVerySmallPhone || width < 320;

  const dynamicStyles = StyleSheet.create({
    card: {
      backgroundColor: '#fff',
      borderRadius: isTablet ? 24 : 18,
      padding: getCardPadding(),
      marginTop: 10,
      shadowColor: '#000',
      shadowOpacity: 0.12,
      shadowRadius: isTablet ? 15 : 10,
      elevation: isTablet ? 8 : 6,
    },
    title: {
      fontSize: getTitleFontSize(),
      fontWeight: 'bold',
      color: '#222',
      marginBottom: 6,
      flexShrink: 1,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: isTablet ? 12 : 8,
      flexWrap: 'wrap',
    },
    badge: {
      backgroundColor: '#F0F8FF',
      paddingHorizontal: spacing.badgePaddingH,
      paddingVertical: spacing.badgePaddingV,
      borderRadius: isTablet ? 16 : 12,
      marginLeft: 8,
    },
    badgeText: {
      fontSize: getBadgeFontSize(),
      color: '#288BE6',
      fontWeight: '600',
    },
    row: {
      flexDirection: shouldStackVertically ? 'column' : 'row',
      alignItems: shouldStackVertically ? 'stretch' : 'center',
    },
    perfCenter: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    perfText: {
      fontSize: getPerfTextFontSize(),
      fontWeight: 'bold',
      color: '#288BE6',
    },
    subjects: {
      flex: 1,
      marginLeft: shouldStackVertically ? 0 : spacing.circularMargin,
      marginTop: shouldStackVertically ? spacing.circularMargin : 0,
      justifyContent: 'center',
    },
    subjectBlockRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.subjectMargin,
    },
    dot: {
      width: getDotSize(),
      height: getDotSize(),
      borderRadius: getDotSize() / 2,
      marginRight: spacing.dotMargin,
    },
    subTextWrap: {
      flex: 1,
    },
    subjectLabel: {
      fontSize: getSubjectLabelFontSize(),
      fontWeight: '800',
      
      color: '#000000ff',
    },
    subjectPercent: {
      fontSize: getSubjectPercentFontSize(),
      color: '#666',
      marginBottom: 4,
    },
    bar: {
      height: getProgressBarHeight(),
      borderRadius: getProgressBarHeight() / 2,
      marginBottom: 3,
    },
  });

  const circularProgressSize = getCircularProgressSize();
  const circularProgressWidth = getCircularProgressWidth();

  return (
    <View style={dynamicStyles.card}>
      <View style={dynamicStyles.headerRow}>
        <Text style={dynamicStyles.title} numberOfLines={isSmallPhone ? 2 : 1}>
          Weekly test overview
        </Text>
        <View style={dynamicStyles.badge}>
          <Text style={dynamicStyles.badgeText}>Updated</Text>
        </View>
      </View>

      <View style={dynamicStyles.row}>
        <View style={shouldStackVertically ? { alignItems: 'center' } : {}}>
          <AnimatedCircularProgress
            size={circularProgressSize}
            width={circularProgressWidth}
            fill={88}
            tintColor="#288BE6"
            backgroundColor="#E6F1FB"
            duration={700}
          >
            {() => (
              <View style={dynamicStyles.perfCenter}>
                <Text style={dynamicStyles.perfText}>88%</Text>
              </View>
            )}
          </AnimatedCircularProgress>
        </View>

        <View style={dynamicStyles.subjects}>
          <View style={dynamicStyles.subjectBlockRow}>
            <View style={[dynamicStyles.dot, { backgroundColor: '#288BE6' }]} />
            <View style={dynamicStyles.subTextWrap}>
              <Text style={dynamicStyles.subjectLabel} numberOfLines={1}>
                Mathematics
              </Text>
              <Text style={dynamicStyles.subjectPercent}>85%</Text>
              <ProgressBar
                progress={0.85}
                color="#288BE6"
                style={dynamicStyles.bar}
              />
            </View>
          </View>

          <View style={dynamicStyles.subjectBlockRow}>
            <View style={[dynamicStyles.dot, { backgroundColor: '#28E6D6' }]} />
            <View style={dynamicStyles.subTextWrap}>
              <Text style={dynamicStyles.subjectLabel} numberOfLines={1}>
                Chemistry
              </Text>
              <Text style={dynamicStyles.subjectPercent}>70%</Text>
              <ProgressBar
                progress={0.7}
                color="#28E6D6"
                style={dynamicStyles.bar}
              />
            </View>
          </View>

          <View style={dynamicStyles.subjectBlockRow}>
            <View style={[dynamicStyles.dot, { backgroundColor: '#E6283C' }]} />
            <View style={dynamicStyles.subTextWrap}>
              <Text style={dynamicStyles.subjectLabel} numberOfLines={1}>
                Physics
              </Text>
              <Text style={dynamicStyles.subjectPercent}>60%</Text>
              <ProgressBar
                progress={0.6}
                color="#E6283C"
                style={dynamicStyles.bar}
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

// Alternative version with breakpoint-based styling
export const PerformanceCardBreakpoints = () => {
  const { width } = useWindowDimensions();

  const getScreenSize = () => {
    if (width >= 768) return 'tablet';
    if (width >= 414) return 'large';
    if (width >= 375) return 'medium';
    if (width >= 350) return 'small';
    return 'extraSmall';
  };

  const screenSize = getScreenSize();
  const shouldStack = screenSize === 'extraSmall';

  return (
    <View style={[styles.card, styles[`card_${screenSize}`]]}>
      <View style={[styles.headerRow, styles[`headerRow_${screenSize}`]]}>
        <Text
          style={[styles.title, styles[`title_${screenSize}`]]}
          numberOfLines={
            screenSize === 'small' || screenSize === 'extraSmall' ? 2 : 1
          }
        >
          Weekly test overview
        </Text>
        <View style={[styles.badge, styles[`badge_${screenSize}`]]}>
          <Text style={[styles.badgeText, styles[`badgeText_${screenSize}`]]}>
            Updated
          </Text>
        </View>
      </View>

      <View style={[styles.row, shouldStack && styles.rowStacked]}>
        <View style={shouldStack ? styles.circularContainer : {}}>
          <AnimatedCircularProgress
            size={styles[`circularSize_${screenSize}`].size}
            width={styles[`circularSize_${screenSize}`].width}
            fill={88}
            tintColor="#288BE6"
            backgroundColor="#E6F1FB"
            duration={700}
          >
            {() => (
              <View style={styles.perfCenter}>
                <Text
                  style={[styles.perfText, styles[`perfText_${screenSize}`]]}
                >
                  88%
                </Text>
              </View>
            )}
          </AnimatedCircularProgress>
        </View>

        <View
          style={[
            styles.subjects,
            styles[`subjects_${screenSize}`],
            shouldStack && styles.subjectsStacked,
          ]}
        >
          {['Mathematics', 'Chemistry', 'Physics'].map((subject, index) => {
            const colors = ['#288BE6', '#28E6D6', '#E6283C'];
            const progress = [0.85, 0.7, 0.6];
            const percentages = ['85%', '70%', '60%'];

            return (
              <View
                key={subject}
                style={[
                  styles.subjectBlockRow,
                  styles[`subjectBlockRow_${screenSize}`],
                ]}
              >
                <View
                  style={[
                    styles.dot,
                    styles[`dot_${screenSize}`],
                    { backgroundColor: colors[index] },
                  ]}
                />
                <View style={styles.subTextWrap}>
                  <Text
                    style={[
                      styles.subjectLabel,
                      styles[`subjectLabel_${screenSize}`],
                    ]}
                    numberOfLines={1}
                  >
                    {subject}
                  </Text>
                  <Text
                    style={[
                      styles.subjectPercent,
                      styles[`subjectPercent_${screenSize}`],
                    ]}
                  >
                    {percentages[index]}
                  </Text>
                  <ProgressBar
                    progress={progress[index]}
                    color={colors[index]}
                    style={[styles.bar, styles[`bar_${screenSize}`]]}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  badge: {
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    marginLeft: 8,
  },
  badgeText: {
    color: '#288BE6',
    fontWeight: '600',
  },
  title: {
    fontWeight: 600,
    color: '#222',
    marginBottom: 6,
    flexShrink: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  circularContainer: {
    alignItems: 'center',
  },
  perfCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  perfText: {
    fontWeight: 'bold',
    color: '#288BE6',
  },
  subjects: {
    flex: 1,
    justifyContent: 'center',
  },
  subjectsStacked: {
    marginLeft: 0,
  },
  subjectBlockRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    borderRadius: 6,
  },
  subTextWrap: {
    flex: 1,
  },
  subjectLabel: {
    fontWeight: '600',
    color: '#f61818ff',
  },
  subjectPercent: {
    color: '#666',
    marginBottom: 4,
  },
  bar: {
    borderRadius: 3,
    marginBottom: 3,
  },

  // Extra Small screens (< 350px)
  card_extraSmall: { padding: 14, borderRadius: 16 },
  headerRow_extraSmall: { marginBottom: 6 },
  title_extraSmall: { fontSize: 13 },
  badge_extraSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeText_extraSmall: { fontSize: 10 },
  circularSize_extraSmall: { size: 90, width: 8 },
  perfText_extraSmall: { fontSize: 18 },
  subjects_extraSmall: { marginTop: 15 },
  subjectBlockRow_extraSmall: { marginBottom: 8 },
  dot_extraSmall: { width: 10, height: 10 },
  subjectLabel_extraSmall: { fontSize: 11 },
  subjectPercent_extraSmall: { fontSize: 10 },
  bar_extraSmall: { height: 6 },

  // Small screens (350px - 374px)
  card_small: { padding: 14, borderRadius: 16 },
  title_small: { fontSize: 13 },
  badge_small: { paddingHorizontal: 8, paddingVertical: 3 },
  badgeText_small: { fontSize: 10 },
  circularSize_small: { size: 100, width: 9 },
  perfText_small: { fontSize: 20 },
  subjects_small: { marginLeft: 15 },
  subjectBlockRow_small: { marginBottom: 10 },
  dot_small: { width: 10, height: 10 },
  subjectLabel_small: { fontSize: 12 },
  subjectPercent_small: { fontSize: 11 },
  bar_small: { height: 6 },

  // Medium screens (375px - 413px)
  card_medium: { padding: 18 },
  title_medium: { fontSize: 15 },
  badge_medium: { paddingHorizontal: 10, paddingVertical: 4 },
  badgeText_medium: { fontSize: 11 },
  circularSize_medium: { size: 120, width: 10 },
  perfText_medium: { fontSize: 22 },
  subjects_medium: { marginLeft: 20 },
  subjectBlockRow_medium: { marginBottom: 12 },
  dot_medium: { width: 12, height: 12 },
  subjectLabel_medium: { fontSize: 13 },
  subjectPercent_medium: { fontSize: 12 },
  bar_medium: { height: 7 },

  // Large screens (414px - 767px)
  card_large: { padding: 20, borderRadius: 20 },
  headerRow_large: { marginBottom: 10 },
  title_large: { fontSize: 16 },
  badge_large: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 },
  badgeText_large: { fontSize: 12 },
  circularSize_large: { size: 130, width: 11 },
  perfText_large: { fontSize: 24 },
  subjects_large: { marginLeft: 25 },
  subjectBlockRow_large: { marginBottom: 14 },
  dot_large: { width: 14, height: 14 },
  subjectLabel_large: { fontSize: 14 },
  subjectPercent_large: { fontSize: 13 },
  bar_large: { height: 8 },

  // Tablet screens (768px+)
  card_tablet: { padding: 24, borderRadius: 24 },
  headerRow_tablet: { marginBottom: 12 },
  title_tablet: { fontSize: 20 },
  badge_tablet: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16 },
  badgeText_tablet: { fontSize: 13 },
  circularSize_tablet: { size: 160, width: 14 },
  perfText_tablet: { fontSize: 28 },
  subjects_tablet: { marginLeft: 30 },
  subjectBlockRow_tablet: { marginBottom: 16 },
  dot_tablet: { width: 16, height: 16 },
  subjectLabel_tablet: { fontSize: 16 },
  subjectPercent_tablet: { fontSize: 14 },
  bar_tablet: { height: 9 },
});

export default PerformanceCard;
