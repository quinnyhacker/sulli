import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E8D5B7',
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 6,
          height: 60,
        },
        tabBarActiveTintColor: '#8B5E3C',
        tabBarInactiveTintColor: '#8C7B68',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
        },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Explore', tabBarIcon: ({ color }) => <TabIcon emoji="🐾" color={color} /> }} />
      <Tabs.Screen name="explore" options={{ title: 'Dates', tabBarIcon: ({ color }) => <TabIcon emoji="☕" color={color} /> }} />
      <Tabs.Screen name="calendar" options={{ title: 'Plans', tabBarIcon: ({ color }) => <TabIcon emoji="🗓" color={color} /> }} />
      <Tabs.Screen name="messages" options={{ title: 'Wags', tabBarIcon: ({ color }) => <TabIcon emoji="💬" color={color} /> }} />
      <Tabs.Screen name="safety" options={{ title: 'Profile', tabBarIcon: ({ color }) => <TabIcon emoji="🐶" color={color} /> }} />
    </Tabs>
  );
}

function TabIcon({ emoji, color }: { emoji: string; color: string }) {
  const { Text } = require('react-native');
  return <Text style={{ fontSize: 20 }}>{emoji}</Text>;
}