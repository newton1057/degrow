import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';
import React from 'react';
import { Platform } from 'react-native';

import { useI18n } from '@/providers/language-provider';
import { useAppTheme } from '@/providers/theme-provider';

export default function TabLayout() {
  const { t } = useI18n();
  const { colors } = useAppTheme();

  return (
    <NativeTabs
      blurEffect={Platform.OS === 'ios' ? 'systemDefault' : undefined}
      disableTransparentOnScrollEdge={false}
      iconColor={{
        default: colors.iconMuted,
        selected: colors.text,
      }}
      minimizeBehavior={Platform.OS === 'ios' ? 'onScrollDown' : undefined}
      labelStyle={{
        default: {
          color: colors.textMuted,
          fontSize: 13,
          fontWeight: '600',
        },
        selected: {
          color: colors.text,
          fontSize: 13,
          fontWeight: '700',
        },
      }}
      tintColor={colors.tint}>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: 'list.bullet', selected: 'list.bullet' }} />
        <Label selectedStyle={{ color: colors.text, fontWeight: '700' }}>{t('tabs.listView')}</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Icon sf={{ default: 'person.crop.circle', selected: 'person.crop.circle.fill' }} />
        <Label selectedStyle={{ color: colors.text, fontWeight: '700' }}>{t('tabs.profile')}</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
