import { Modal, View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import { X } from 'lucide-react-native';
import { Todo } from '@/types/database';

interface TodoDetailModalProps {
  visible: boolean;
  todo: Todo | null;
  onClose: () => void;
}

const { width } = Dimensions.get('window');

export default function TodoDetailModal({ visible, todo, onClose }: TodoDetailModalProps) {
  if (!todo) return null;

  const screenshot = (todo as any).screenshots;

  console.log('Todo data:', todo);
  console.log('Screenshot data:', screenshot);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>ToDo詳細</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#000000" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <Text style={styles.label}>タイトル</Text>
              <Text style={styles.title}>{todo.title}</Text>
            </View>

            {todo.description ? (
              <View style={styles.section}>
                <Text style={styles.label}>詳細</Text>
                <Text style={styles.description}>{todo.description}</Text>
              </View>
            ) : null}

            {screenshot?.image_url ? (
              <View style={styles.section}>
                <Text style={styles.label}>元の画像</Text>
                <Image
                  source={{ uri: screenshot.image_url }}
                  style={styles.image}
                  resizeMode="contain"
                  onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
                  onLoad={() => console.log('Image loaded successfully')}
                />
              </View>
            ) : (
              <View style={styles.section}>
                <Text style={styles.label}>元の画像</Text>
                <Text style={styles.noImage}>画像が見つかりません</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    lineHeight: 24,
  },
  description: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 24,
  },
  image: {
    width: width - 80,
    height: 300,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
  },
  noImage: {
    fontSize: 14,
    color: '#999999',
    fontStyle: 'italic',
  },
});
