import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useI18n } from '@/providers/language-provider';
import { useAppTheme } from '@/providers/theme-provider';

type PolicyRowProps = {
  description: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress: () => void;
  title: string;
};

function PolicyRow({ description, icon, onPress, title }: PolicyRowProps) {
  const { colors } = useAppTheme();

  return (
    <Pressable onPress={onPress} style={styles.policyRow}>
      <View style={styles.policyRowMain}>
        <View style={[styles.policyIconBox, { backgroundColor: colors.surfaceMuted }]}>
          <MaterialCommunityIcons name={icon} size={20} color={colors.icon} />
        </View>
        <View style={styles.policyTextWrap}>
          <Text style={[styles.policyTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.policyDescription, { color: colors.textMuted }]}>{description}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.iconMuted} />
    </Pressable>
  );
}

export default function PrivacyScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { colors, resolvedTheme } = useAppTheme();

  const handleOpenTerms = () => {
    const url = 'https://degrow.app/terms.html';
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert(
          t('privacy.unavailableTitle'),
          t('privacy.unavailableMessage')
        );
      }
    });
  };

  const handleOpenPrivacyPolicy = () => {
    const url = 'https://degrow.app/privacy.html';
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert(
          t('privacy.unavailableTitle'),
          t('privacy.unavailableMessage')
        );
      }
    });
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right', 'bottom']}
      style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={styles.contentColumn}>
          <View style={styles.header}>
            <Pressable
              onPress={() => router.back()}
              style={[styles.backButton, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
              <Ionicons name="chevron-back" size={22} color={colors.icon} />
            </Pressable>
            <Text style={[styles.screenTitle, { color: colors.text }]}>{t('privacy.title')}</Text>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.heroIconWrap, { backgroundColor: colors.surfaceMuted }]}>
                <Ionicons name="shield-checkmark" size={28} color={colors.icon} />
              </View>
              <View style={styles.heroTextWrap}>
                <Text style={[styles.heroTitle, { color: colors.text }]}>{t('privacy.heroTitle')}</Text>
                <Text style={[styles.heroSubtitle, { color: colors.textMuted }]}>{t('privacy.heroSubtitle')}</Text>
              </View>
            </View>

            <View style={[styles.policyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.sectionEyebrow, { color: colors.textSoft }]}>{t('privacy.legalEyebrow')}</Text>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('privacy.documentsTitle')}</Text>

              <View style={styles.policyList}>
                <PolicyRow
                  icon="file-document-outline"
                  title={t('privacy.termsTitle')}
                  description={t('privacy.termsDescription')}
                  onPress={handleOpenTerms}
                />
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <PolicyRow
                  icon="shield-lock-outline"
                  title={t('privacy.privacyPolicyTitle')}
                  description={t('privacy.privacyPolicyDescription')}
                  onPress={handleOpenPrivacyPolicy}
                />
              </View>
            </View>

            <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.sectionEyebrow, { color: colors.textSoft }]}>{t('privacy.dataEyebrow')}</Text>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('privacy.dataHandlingTitle')}</Text>
              <Text style={[styles.infoText, { color: colors.textMuted }]}>{t('privacy.dataHandlingBody')}</Text>

              <View style={styles.featureList}>
                <View style={styles.featureItem}>
                  <View style={[styles.featureDot, { backgroundColor: colors.tint }]} />
                  <Text style={[styles.featureText, { color: colors.text }]}>{t('privacy.feature1')}</Text>
                </View>
                <View style={styles.featureItem}>
                  <View style={[styles.featureDot, { backgroundColor: colors.tint }]} />
                  <Text style={[styles.featureText, { color: colors.text }]}>{t('privacy.feature2')}</Text>
                </View>
                <View style={styles.featureItem}>
                  <View style={[styles.featureDot, { backgroundColor: colors.tint }]} />
                  <Text style={[styles.featureText, { color: colors.text }]}>{t('privacy.feature3')}</Text>
                </View>
                <View style={styles.featureItem}>
                  <View style={[styles.featureDot, { backgroundColor: colors.tint }]} />
                  <Text style={[styles.featureText, { color: colors.text }]}>{t('privacy.feature4')}</Text>
                </View>
              </View>
            </View>

            <View style={[styles.footerCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
              <Ionicons name="information-circle-outline" size={20} color={colors.textSoft} />
              <Text style={[styles.footerText, { color: colors.textMuted }]}>{t('privacy.footerNote')}</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  screen: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  contentColumn: {
    flex: 1,
    width: '100%',
    maxWidth: 360,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
    paddingHorizontal: 2,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111113',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  headerSpacer: {
    width: 34,
    height: 34,
  },
  screenTitle: {
    color: '#F5F5F7',
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: -0.45,
    flex: 1,
    textAlign: 'center',
  },
  scrollContent: {
    gap: 14,
    paddingBottom: 44,
  },
  heroCard: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#0C0C0D',
    padding: 18,
    flexDirection: 'row',
    gap: 14,
  },
  heroIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: '#171719',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTextWrap: {
    flex: 1,
  },
  heroTitle: {
    color: '#F5F5F7',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.45,
  },
  heroSubtitle: {
    marginTop: 6,
    color: 'rgba(255,255,255,0.62)',
    fontSize: 13.5,
    lineHeight: 19,
  },
  policyCard: {
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#0C0C0D',
    padding: 18,
  },
  sectionEyebrow: {
    color: 'rgba(255,255,255,0.48)',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sectionTitle: {
    marginTop: 4,
    color: '#F5F5F7',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.3,
    marginBottom: 16,
  },
  policyList: {
    gap: 2,
  },
  policyRow: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  policyRowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  policyIconBox: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#171719',
    alignItems: 'center',
    justifyContent: 'center',
  },
  policyTextWrap: {
    flex: 1,
  },
  policyTitle: {
    color: '#F5F5F7',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  policyDescription: {
    marginTop: 3,
    color: 'rgba(255,255,255,0.56)',
    fontSize: 12.5,
    lineHeight: 17,
  },
  divider: {
    height: 1,
    marginVertical: 2,
  },
  infoCard: {
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#0C0C0D',
    padding: 18,
  },
  infoText: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: 13.5,
    lineHeight: 20,
    marginBottom: 16,
  },
  featureList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
  },
  featureText: {
    flex: 1,
    color: '#F5F5F7',
    fontSize: 13.5,
    lineHeight: 19,
  },
  footerCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: '#0A0A0B',
    padding: 14,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  footerText: {
    flex: 1,
    color: 'rgba(255,255,255,0.56)',
    fontSize: 12,
    lineHeight: 17,
  },
});
