import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import statusService, { Status } from '../services/statusService';

const MyPostsScreen: React.FC = () => {
  const { user } = useAuth();
  const [myPosts, setMyPosts] = useState<Status[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMyPosts();
  }, []);

  const loadMyPosts = async () => {
    setLoading(true);
    try {
      const response = await statusService.getAllStatuses();
      if (response.success && response.data) {
        // กรองเฉพาะโพสของตัวเอง
        const userPosts = response.data.filter(status => {
          const userId = user?.id || user?._id;
          return status.createdBy._id === userId || 
                 status.createdBy._id === user?.id ||
                 status.createdBy._id === user?._id;
        });
        
        setMyPosts(userPosts);
        console.log('📄 My posts loaded:', userPosts.length);
      } else {
        Alert.alert('Error', response.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load your posts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMyPosts();
  };

  const deletePost = async (statusId: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => performDelete(statusId)
        }
      ]
    );
  };

  const performDelete = async (statusId: string) => {
    try {
      // อัปเดต UI ทันที (Optimistic Update)
      setMyPosts(prevPosts => 
        prevPosts.filter(post => post._id !== statusId)
      );

      // เรียก API ลบ
      const response = await statusService.deleteStatus(statusId);
      
      if (response.success) {
        Alert.alert('Success', response.message);
        // โหลดข้อมูลใหม่เพื่อให้แน่ใจ
        loadMyPosts();
      } else {
        // ถ้า API fail ให้โหลดข้อมูลกลับ
        loadMyPosts();
        Alert.alert('Error', response.message);
      }
      
    } catch (error) {
      // ถ้า error ให้โหลดข้อมูลกลับ
      loadMyPosts();
      Alert.alert('Error', 'Failed to delete post');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderPostItem = ({ item }: { item: Status }) => (
    <View style={styles.postCard}>
      {/* Header */}
      <View style={styles.postHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={20} color="#007AFF" />
          </View>
          <View>
            <Text style={styles.userName}>
              {item.createdBy.email || 'You'}
            </Text>
            <Text style={styles.timestamp}>
              {formatDate(item.createdAt)}
            </Text>
          </View>
        </View>
        
        {/* Delete Button */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deletePost(item._id)}
        >
          <Ionicons name="trash-outline" size={20} color="#ff3040" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <Text style={styles.postContent}>{item.content}</Text>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Ionicons name="heart" size={16} color="#ff3040" />
          <Text style={styles.statText}>
            {item.like?.length || 0} Likes
          </Text>
        </View>

        <View style={styles.statItem}>
          <Ionicons name="chatbubble" size={16} color="#007AFF" />
          <Text style={styles.statText}>
            {item.comment?.length || 0} Comments
          </Text>
        </View>
      </View>
    </View>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="document-text-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No Posts Yet</Text>
      <Text style={styles.emptyMessage}>
        You haven't created any posts yet.{'\n'}
        Go to Social tab to create your first post!
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Posts</Text>
        <View style={styles.headerStats}>
          <Text style={styles.statsHeaderText}>
            {myPosts.length} Posts
          </Text>
        </View>
      </View>

      {/* Posts List */}
      <FlatList
        data={myPosts}
        renderItem={renderPostItem}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={[
          styles.listContainer,
          myPosts.length === 0 && styles.emptyListContainer
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={EmptyState}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerStats: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statsHeaderText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  listContainer: {
    padding: 15,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#ffe6e8',
  },
  postContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  statText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 40,
  },
});

export default MyPostsScreen;