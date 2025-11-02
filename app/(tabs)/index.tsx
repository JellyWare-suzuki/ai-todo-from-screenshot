import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, ImagePlus } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';

interface TodoItem {
  title: string;
  description: string;
}

export default function ScanScreen() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('権限が必要です', 'ギャラリーへのアクセス権限が必要です');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      setSelectedImageBase64(result.assets[0].base64 || null);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage || !selectedImageBase64) {
      Alert.alert('エラー', '画像を選択してください');
      return;
    }

    setLoading(true);

    try {
      const base64Image = selectedImageBase64;

      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
      const apiUrl = `${supabaseUrl}/functions/v1/analyze-screenshot`;

      console.log('Calling Edge Function:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: base64Image,
        }),
      });

      console.log('Response status:', response.status);

      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok || data.error) {
        const errorMessage = data.error || '画像の解析に失敗しました';
        console.error('Error from Edge Function:', errorMessage);
        Alert.alert('エラー', errorMessage);
        setLoading(false);
        return;
      }

      const todos: TodoItem[] = data.todos || [];

      if (todos.length === 0) {
        Alert.alert('結果', 'ToDoリストが見つかりませんでした');
        setLoading(false);
        return;
      }

      const fileName = `screenshot-${Date.now()}.jpg`;

      const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
      const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      const blob = new Blob([binaryData], { type: 'image/jpeg' });

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('screenshots')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error('画像のアップロードに失敗しました');
      }

      const { data: { publicUrl } } = supabase.storage
        .from('screenshots')
        .getPublicUrl(fileName);

      const { data: screenshotData, error: screenshotError } = await supabase
        .from('screenshots')
        .insert({
          image_url: publicUrl,
          analyzed: true,
        })
        .select()
        .maybeSingle();

      if (screenshotError || !screenshotData) {
        throw new Error('スクリーンショットの保存に失敗しました');
      }

      const todosToInsert = todos.map((todo) => ({
        screenshot_id: screenshotData.id,
        title: todo.title,
        description: todo.description,
        completed: false,
      }));

      const { error: todosError } = await supabase
        .from('todos')
        .insert(todosToInsert);

      if (todosError) {
        throw new Error('ToDoの保存に失敗しました');
      }

      Alert.alert('成功', `${todos.length}件のToDoを作成しました`, [
        {
          text: 'OK',
          onPress: () => {
            setSelectedImage(null);
            setSelectedImageBase64(null);
            router.push('/todos');
          },
        },
      ]);
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('エラー', '処理中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Camera size={40} color="#007AFF" />
        <Text style={styles.title}>スクリーンショットをスキャン</Text>
        <Text style={styles.subtitle}>
          スクリーンショットを選択してAIが自動的にToDoリストを作成します
        </Text>
      </View>

      {selectedImage ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: selectedImage }} style={styles.image} resizeMode="contain" />
          <TouchableOpacity style={styles.changeButton} onPress={pickImage}>
            <Text style={styles.changeButtonText}>別の画像を選択</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.selectButton} onPress={pickImage}>
          <ImagePlus size={48} color="#007AFF" />
          <Text style={styles.selectButtonText}>画像を選択</Text>
        </TouchableOpacity>
      )}

      {selectedImage && (
        <TouchableOpacity
          style={[styles.analyzeButton, loading && styles.analyzeButtonDisabled]}
          onPress={analyzeImage}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.analyzeButtonText}>ToDoを抽出</Text>
          )}
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  image: {
    width: '100%',
    height: 400,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  changeButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  changeButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  selectButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    marginVertical: 20,
  },
  selectButtonText: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
  },
  analyzeButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  analyzeButtonDisabled: {
    backgroundColor: '#A0C4FF',
  },
  analyzeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
