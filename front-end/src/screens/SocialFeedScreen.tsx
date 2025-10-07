import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import statusService from '../services/statusService';

interface Status {
  _id: string;
  content: string;
  createdBy: {
    email: string;
    name?: string;
  };
  createdAt: string;
  comment?: any[];
  like?: (string | { _id: string; name?: string; email?: string })[];
}

interface ExtendedStatus extends Status {
  like?: (string | { _id: string; name?: string; email?: string })[];
}

interface CreateStatusRequest {
  content: string;
}

interface CommentRequest {
  statusId: string;
  content: string;
}

const SocialFeedScreen = () => {
  const { user } = useAuth();
  const [statuses, setStatuses] = useState<ExtendedStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newStatusContent, setNewStatusContent] = useState('');
  const [viewCommentsModal, setViewCommentsModal] = useState<{visible: boolean, status: ExtendedStatus | null}>({
    visible: false,
    status: null
  });
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    loadStatuses();
  }, []);

  const loadStatuses = async () => {
    try {
      setLoading(true);
      const response = await statusService.getAllStatuses();
      
      if (response.success && response.data) {
        console.log('📚 Found', response.data.length, 'statuses');
        
        const statusesWithExtendedLikes = response.data.map(status => ({
          ...status,
          like: status.like || []
        }));
        
        setStatuses(statusesWithExtendedLikes as ExtendedStatus[]);
      } else {
        Alert.alert('Error', response.message || 'Failed to load statuses');
      }
    } catch (error) {
      console.error('❌ Error loading statuses:', error);
      Alert.alert('Error', 'Failed to load statuses');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadStatuses().finally(() => setRefreshing(false));
  };

  const createStatus = async () => {
    if (!newStatusContent.trim()) {
      Alert.alert('Error', 'Please enter some content');
      return;
    }

    try {
      const request: CreateStatusRequest = {
        content: newStatusContent.trim()
      };

      const response = await statusService.createStatus(request);
      if (response.success) {
        setModalVisible(false);
        setNewStatusContent('');
        Alert.alert('Success', response.message);
        loadStatuses(); // Reload to show new status
      } else {
        Alert.alert('Error', response.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create status');
    }
  };

  const toggleLike = async (statusId: string, currentlyLiked: boolean) => {
    if (!user?._id && !user?.id) {
      Alert.alert('Error', 'User not found');
      return;
    }

    const userId = user._id || user.id;
    if (!userId) return;

    // Optimistic update
    setStatuses(prevStatuses => 
      prevStatuses.map(status => {
        if (status._id === statusId) {
          let newLikes = [...(status.like || [])];
          
          if (currentlyLiked) {
            // Remove like
            newLikes = newLikes.filter(like => {
              if (typeof like === 'string') {
                return like !== userId && like !== user.id && like !== user._id;
              } else {
                return like._id !== userId && like._id !== user.id && like._id !== user._id;
              }
            });
          } else {
            // Add like
            newLikes.push(userId);
          }

          return {
            ...status,
            like: newLikes
          } as ExtendedStatus;
        }
        return status;
      })
    );

    try {
      let response;
      if (currentlyLiked) {
        response = await statusService.unlikeStatus({statusId});
      } else {
        response = await statusService.likeStatus({statusId});
      }

      if (!response.success) {
        // Revert optimistic update
        setStatuses(prevStatuses => 
          prevStatuses.map(status => {
            if (status._id === statusId) {
              let revertedLikes = [...(status.like || [])];
              
              if (!currentlyLiked) {
                // Remove the added like
                revertedLikes = revertedLikes.filter(like => {
                  if (typeof like === 'string') {
                    return like !== userId && like !== user.id && like !== user._id;
                  } else {
                    return like._id !== userId && like._id !== user.id && like._id !== user._id;
                  }
                });
              } else {
                // Re-add the removed like
                revertedLikes.push(userId);
              }

              return {
                ...status,
                like: revertedLikes
              } as ExtendedStatus;
            }
            return status;
          })
        );
        Alert.alert('Error', 'Failed to toggle like');
      }
    } catch (error) {
      // Revert optimistic update
      setStatuses(prevStatuses => 
        prevStatuses.map(status => {
          if (status._id === statusId) {
            let revertedLikes = [...(status.like || [])];
            
            if (!currentlyLiked) {
              revertedLikes = revertedLikes.filter(like => {
                if (typeof like === 'string') {
                  return like !== userId && like !== user.id && like !== user._id;
                } else {
                  return like._id !== userId && like._id !== user.id && like._id !== user._id;
                }
              });
            } else {
              revertedLikes.push(userId);
            }

            return {
              ...status,
              like: revertedLikes
            } as ExtendedStatus;
          }
          return status;
        })
      );
      Alert.alert('Error', 'Failed to toggle like');
    }
  };

  const addCommentInModal = async () => {
    if (!newComment.trim() || !viewCommentsModal.status) return;

    try {
      const request: CommentRequest = {
        statusId: viewCommentsModal.status._id,
        content: newComment.trim()
      };

      const response = await statusService.addComment(request);
      if (response.success) {
        setNewComment('');
        Alert.alert('Success', response.message);
        loadStatuses(); // Reload to show new comment
        // Update the view modal status
        const updatedStatuses = await statusService.getAllStatuses();
        if (updatedStatuses.success && updatedStatuses.data) {
          const updatedStatus = updatedStatuses.data.find(s => s._id === viewCommentsModal.status?._id);
          if (updatedStatus) setViewCommentsModal({visible: true, status: updatedStatus as ExtendedStatus});
        }
      } else {
        Alert.alert('Error', response.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add comment');
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

  const isUserLiked = (status: ExtendedStatus) => {
    if (!user || !status.like || !Array.isArray(status.like)) return false;
    
    const userId = user.id || user._id;
    if (!userId) return false;
    
    return status.like.some(like => {
      if (typeof like === 'string') {
        return like === userId || like === user.id || like === user._id;
      } else {
        return like._id === userId || like._id === user.id || like._id === user._id;
      }
    });
  };

  const renderStatusItem = ({ item }: { item: ExtendedStatus }) => (
    <View style={styles.statusCard}>
      {/* Header */}
      <View style={styles.statusHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={20} color="#666" />
          </View>
          <View>
            <Text style={styles.userName}>
              {item.createdBy.email || 'Unknown User'}
            </Text>
            <Text style={styles.timestamp}>
              {formatDate(item.createdAt)}
            </Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <Text style={styles.statusContent}>{item.content}</Text>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            isUserLiked(item) && styles.likedButton
          ]}
          onPress={() => toggleLike(item._id, isUserLiked(item))}
        >
          <Ionicons
            name={isUserLiked(item) ? "heart" : "heart-outline"}
            size={20}
            color={isUserLiked(item) ? "#ff3040" : "#666"}
          />
          <Text style={[
            styles.actionText,
            isUserLiked(item) && styles.likedText
          ]}>
            {item.like?.length || 0} {isUserLiked(item) ? 'Liked' : 'Like'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setViewCommentsModal({visible: true, status: item})}
        >
          <Ionicons name="chatbubble-outline" size={20} color="#007AFF" />
          <Text style={[styles.actionText, {color: '#007AFF'}]}>
            {item.comment?.length || 0} Comment
          </Text>
        </TouchableOpacity>
      </View>

      {/* Comments Preview */}
      {item.comment && item.comment.length > 0 && (
        <View style={styles.commentsPreview}>
          {item.comment.slice(-2).map((comment, index) => {
            const commentData = typeof comment === 'string' ? 
              { content: comment, createdBy: { email: 'ผู้ใช้' } } : 
              comment;
            
            return (
              <View key={index} style={styles.commentItem}>
                <Text style={styles.commentAuthor}>
                  {commentData.createdBy?.email || commentData.createdBy?.name || 'ผู้ใช้'}
                </Text>
                <Text style={styles.commentText} numberOfLines={2}>
                  {commentData.content}
                </Text>
              </View>
            );
          })}
          
          <TouchableOpacity
            style={styles.viewAllComments}
            onPress={() => setViewCommentsModal({visible: true, status: item})}
          >
            <Text style={styles.viewAllCommentsText}>
              ดูคอมเมนท์ทั้งหมด ({item.comment.length})
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Social Feed</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Status List */}
      <FlatList
        data={statuses}
        renderItem={renderStatusItem}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Create Status Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Post</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.textInput}
              placeholder="What's on your mind?"
              value={newStatusContent}
              onChangeText={setNewStatusContent}
              multiline
              maxLength={500}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.postButton]}
                onPress={createStatus}
              >
                <Text style={styles.postButtonText}>Post</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* View Comments Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={viewCommentsModal.visible}
        onRequestClose={() => setViewCommentsModal({visible: false, status: null})}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, {maxHeight: '80%'}]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Comments ({viewCommentsModal.status?.comment?.length || 0})
              </Text>
              <TouchableOpacity onPress={() => setViewCommentsModal({visible: false, status: null})}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Add Comment Section */}
            <View style={styles.addCommentSection}>
              <TextInput
                style={styles.commentInput}
                placeholder="Write a comment..."
                value={newComment}
                onChangeText={setNewComment}
                multiline
                maxLength={300}
              />
              <TouchableOpacity
                style={styles.sendButton}
                onPress={addCommentInModal}
              >
                <Ionicons name="send" size={16} color="#fff" />
                <Text style={styles.sendButtonText}>ส่ง</Text>
              </TouchableOpacity>
            </View>

            {/* Comments List */}
            <ScrollView style={styles.commentsList} showsVerticalScrollIndicator={false}>
              {viewCommentsModal.status?.comment && viewCommentsModal.status.comment.length > 0 ? (
                viewCommentsModal.status.comment.map((comment, index) => {
                  const commentData = typeof comment === 'string' ? 
                    { content: comment, createdBy: { email: 'ผู้ใช้' } } : 
                    comment;
                  
                  return (
                    <View key={index} style={styles.commentItem}>
                      <View style={styles.commentHeader}>
                        <Text style={styles.commentAuthor}>
                          {commentData.createdBy?.email || commentData.createdBy?.name || 'ผู้ใช้'}
                        </Text>
                      </View>
                      <Text style={styles.commentText}>
                        {commentData.content}
                      </Text>
                    </View>
                  );
                })
              ) : (
                <View style={styles.noCommentsContainer}>
                  <Ionicons name="chatbubble-outline" size={48} color="#ccc" />
                  <Text style={styles.noCommentsText}>No comments yet</Text>
                  <Text style={styles.noCommentsSubtext}>Be the first to comment!</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  createButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 15,
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
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
  statusContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 15,
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 25,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  likedButton: {
    backgroundColor: '#ffe6e8',
  },
  actionText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
    fontWeight: '500',
  },
  likedText: {
    color: '#ff3040',
    fontWeight: '600',
  },
  commentsPreview: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  commentItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
  },
  commentText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 18,
  },
  viewAllComments: {
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: 4,
  },
  viewAllCommentsText: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    minHeight: 100,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  postButton: {
    backgroundColor: '#007AFF',
  },
  postButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  addCommentSection: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
    fontSize: 14,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  commentsList: {
    maxHeight: 300,
  },
  noCommentsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noCommentsText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    fontWeight: '500',
  },
  noCommentsSubtext: {
    fontSize: 14,
    color: '#ccc',
  },
});

export default SocialFeedScreen;