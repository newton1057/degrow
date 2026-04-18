import { Redirect } from 'expo-router';
import {
    Icon,
    Label,
    NativeTabs,
    type NativeTabsBlurEffect,
    type NativeTabsTriggerTabBarProps,
} from 'expo-router/unstable-native-tabs';
import React from 'react';
import { Platform, View } from 'react-native';

import { useAuth } from '@/providers/auth-provider';
import { useI18n } from '@/providers/language-provider';
import { useAppTheme } from '@/providers/theme-provider';

export default function TabLayout() {
  const { t } = useI18n();
  const { colors, resolvedTheme } = useAppTheme();
  const { user, isInitializing } = useAuth();
  const isIOS = Platform.OS === 'ios';
  const tabBlurEffect: NativeTabsBlurEffect | undefined = isIOS
    ? resolvedTheme === 'light'
      ? 'systemThinMaterialLight'
      : 'systemThinMaterialDark'
    : undefined;
  const tabBackgroundColor = isIOS
    ? resolvedTheme === 'light'
      ? 'rgba(247,248,251,0.58)'
      : 'rgba(17,17,19,0.54)'
    : colors.surface;
  const defaultTabColor = colors.textMuted;
  const selectedTabColor = colors.text;
  const tabGlassTintColor = resolvedTheme === 'light' ? '#FFFFFF' : '#F5F5F7';
  const tabShadowColor = resolvedTheme === 'light' ? 'rgba(17,19,21,0.12)' : 'rgba(255,255,255,0.10)';
  const tabBarAppearance: NativeTabsTriggerTabBarProps = {
    backgroundColor: tabBackgroundColor,
    blurEffect: tabBlurEffect,
    disableTransparentOnScrollEdge: true,
    iconColor: defaultTabColor,
    labelStyle: {
      color: defaultTabColor,
      fontSize: 13,
      fontWeight: '600' as const,
    },
    shadowColor: tabShadowColor,
  };
  const stableScrollEdgeOptions = {
    overrideScrollViewContentInsetAdjustmentBehavior: false,
  } as unknown as React.ComponentProps<typeof NativeTabs.Trigger>['options'];

  if (isInitializing) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <NativeTabs
      backgroundColor={tabBackgroundColor}
      blurEffect={tabBlurEffect}
      disableTransparentOnScrollEdge
      iconColor={{
        default: colors.iconMuted,
        selected: colors.text,
      }}
      minimizeBehavior={isIOS ? 'never' : undefined}
      shadowColor={tabShadowColor}
      labelStyle={{
        default: {
          color: defaultTabColor,
          fontSize: 13,
          fontWeight: '600',
        },
        selected: {
          color: selectedTabColor,
          fontSize: 13,
          fontWeight: '700',
        },
      }}
      tintColor={tabGlassTintColor}>
      <NativeTabs.Trigger name="index" disableScrollToTop options={stableScrollEdgeOptions}>
        <NativeTabs.Trigger.TabBar {...tabBarAppearance} />
        <Icon sf={{ default: 'checkmark.circle', selected: 'checkmark.circle.fill' }} selectedColor={selectedTabColor} />
        <Label selectedStyle={{ color: selectedTabColor, fontWeight: '700' }}>{t('tabs.listView')}</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile" disableScrollToTop options={stableScrollEdgeOptions}>
        <NativeTabs.Trigger.TabBar {...tabBarAppearance} />
        <Icon sf={{ default: 'person.crop.circle', selected: 'person.crop.circle.fill' }} selectedColor={selectedTabColor} />
        <Label selectedStyle={{ color: selectedTabColor, fontWeight: '700' }}>{t('tabs.profile')}</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
