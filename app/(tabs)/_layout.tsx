import { Tabs } from 'expo-router';
import { Camera, ListTodo } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'スキャン',
          tabBarIcon: ({ size, color }) => (
            <Camera size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="todos"
        options={{
          title: 'ToDoリスト',
          tabBarIcon: ({ size, color }) => (
            <ListTodo size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
