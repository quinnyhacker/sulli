import { Tabs } from 'expo-router';
import { View } from 'react-native';

function TabIcon({ name, color, focused }: { name: string; color: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <i 
        className={`ti ti-${name}`} 
        style={{ 
          fontSize: focused ? 22 : 20, 
          color,
          lineHeight: 1 
        }} 
      />
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#F0EBE3',
          borderTopWidth: 0.5,
          paddingBottom: 12,
          paddingTop: 8,
          height: 68,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: '#2C2016',
        tabBarInactiveTintColor: '#C4B8AC',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: 2,
          letterSpacing: 0.3,
        },
        tabBarShowLabel: true,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ width: focused ? 20 : 18, height: focused ? 20 : 18, borderRadius: focused ? 6 : 5, borderWidth: focused ? 2 : 1.5, borderColor: color }} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Dates',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ width: focused ? 16 : 14, height: focused ? 16 : 14, borderRadius: 50, borderWidth: focused ? 2 : 1.5, borderColor: color }} />
              <View style={{ position: 'absolute', bottom: 0, width: focused ? 20 : 18, height: focused ? 10 : 9, borderBottomLeftRadius: 50, borderBottomRightRadius: 50, borderWidth: focused ? 2 : 1.5, borderTopWidth: 0, borderColor: color }} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
  name="calendar"
  options={{
    title: 'Plans',
    tabBarIcon: ({ color, focused }) => (
  <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
    <View style={{ width: focused ? 18 : 16, height: focused ? 17 : 15, borderRadius: 3, borderWidth: focused ? 2 : 1.5, borderColor: color, overflow: 'hidden' }}>
      <View style={{ height: focused ? 5 : 4, backgroundColor: color, width: '100%' }} />
    </View>
    <View style={{ position: 'absolute', top: 0, left: focused ? 5 : 5, width: 2, height: 5, backgroundColor: color, borderRadius: 1 }} />
    <View style={{ position: 'absolute', top: 0, right: focused ? 5 : 5, width: 2, height: 5, backgroundColor: color, borderRadius: 1 }} />
  </View>
),
  }}
/>
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Wags',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ width: focused ? 20 : 18, height: focused ? 14 : 12, borderRadius: 6, borderWidth: focused ? 2 : 1.5, borderColor: color }} />
              <View style={{ position: 'absolute', bottom: 2, left: focused ? 5 : 6, width: 0, height: 0, borderLeftWidth: 4, borderRightWidth: 0, borderTopWidth: 5, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: color }} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="safety"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ width: focused ? 10 : 8, height: focused ? 10 : 8, borderRadius: 50, borderWidth: focused ? 2 : 1.5, borderColor: color, marginBottom: 2 }} />
              <View style={{ width: focused ? 18 : 16, height: focused ? 8 : 7, borderTopLeftRadius: 8, borderTopRightRadius: 8, borderWidth: focused ? 2 : 1.5, borderBottomWidth: 0, borderColor: color }} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}