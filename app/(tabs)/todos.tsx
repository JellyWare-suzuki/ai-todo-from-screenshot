import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { CheckCircle2, Circle, Trash2 } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { Todo } from '@/types/database';
import TodoDetailModal from '@/components/TodoDetailModal';

export default function TodosScreen() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchTodos = async () => {
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*, screenshots(*)')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching todos:', error);
        return;
      }

      setTodos(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTodos();
  };

  const toggleTodo = async (id: string, currentCompleted: boolean) => {
    try {
      const { error } = await supabase
        .from('todos')
        .update({ completed: !currentCompleted, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.error('Error updating todo:', error);
        return;
      }

      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo.id === id ? { ...todo, completed: !currentCompleted } : todo
        )
      );
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting todo:', error);
        return;
      }

      setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const openTodoDetail = (todo: Todo) => {
    setSelectedTodo(todo);
    setModalVisible(true);
  };

  const renderTodoItem = ({ item }: { item: Todo }) => (
    <View style={styles.todoItem}>
      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={() => toggleTodo(item.id, item.completed)}
      >
        {item.completed ? (
          <CheckCircle2 size={24} color="#34C759" />
        ) : (
          <Circle size={24} color="#8E8E93" />
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.todoContent}
        onPress={() => openTodoDetail(item)}
      >
        <View style={styles.todoTextContainer}>
          <Text
            style={[
              styles.todoTitle,
              item.completed && styles.todoTitleCompleted,
            ]}
          >
            {item.title}
          </Text>
          {item.description ? (
            <Text
              style={[
                styles.todoDescription,
                item.completed && styles.todoDescriptionCompleted,
              ]}
            >
              {item.description}
            </Text>
          ) : null}
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteTodo(item.id)}
      >
        <Trash2 size={20} color="#FF3B30" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TodoDetailModal
        visible={modalVisible}
        todo={selectedTodo}
        onClose={() => setModalVisible(false)}
      />
      <View style={styles.header}>
        <Text style={styles.title}>ToDoリスト</Text>
        <Text style={styles.count}>
          {todos.filter((t) => !t.completed).length} / {todos.length} 件
        </Text>
      </View>

      {todos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>ToDoがありません</Text>
          <Text style={styles.emptySubtext}>
            スキャンタブから画像を選択してToDoを作成しましょう
          </Text>
        </View>
      ) : (
        <FlatList
          data={todos}
          renderItem={renderTodoItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  count: {
    fontSize: 16,
    color: '#666666',
  },
  listContent: {
    padding: 16,
  },
  todoItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  todoContent: {
    flex: 1,
  },
  checkboxContainer: {
    marginRight: 12,
  },
  todoTextContainer: {
    flex: 1,
  },
  todoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  todoTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#8E8E93',
  },
  todoDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  todoDescriptionCompleted: {
    textDecorationLine: 'line-through',
    color: '#8E8E93',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
});
