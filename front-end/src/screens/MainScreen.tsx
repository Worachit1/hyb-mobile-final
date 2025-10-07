import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import ProfileScreen from './ProfileScreen';
import StudentsScreen from './StudentsScreen';
import SocialFeedScreen from './SocialFeedScreen';
import MyPostsScreen from './MyPostsScreen';

type TabType = 'students' | 'social' | 'myposts' | 'profile';

const MainScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('profile'); // Start with profile tab after signin

  const renderTabContent = () => {
    switch (activeTab) {
      case 'students':
        return <StudentsScreen />;
      case 'social':
        return <SocialFeedScreen />;
      case 'myposts':
        return <MyPostsScreen />;
      case 'profile':
        return <ProfileScreen />;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Tab Content */}
      <View style={styles.content}>
        {renderTabContent()}
      </View>

      {/* Bottom Tab Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'students' && styles.activeTab
          ]}
          onPress={() => setActiveTab('students')}
        >
          <Ionicons
            name={activeTab === 'students' ? 'school' : 'school-outline'}
            size={20}
            color={activeTab === 'students' ? '#007AFF' : '#666'}
          />
          <Text style={[
            styles.tabText,
            activeTab === 'students' && styles.activeTabText
          ]}>
            Students
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'social' && styles.activeTab
          ]}
          onPress={() => setActiveTab('social')}
        >
          <Ionicons
            name={activeTab === 'social' ? 'chatbubbles' : 'chatbubbles-outline'}
            size={20}
            color={activeTab === 'social' ? '#007AFF' : '#666'}
          />
          <Text style={[
            styles.tabText,
            activeTab === 'social' && styles.activeTabText
          ]}>
            Social
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'myposts' && styles.activeTab
          ]}
          onPress={() => setActiveTab('myposts')}
        >
          <Ionicons
            name={activeTab === 'myposts' ? 'document-text' : 'document-text-outline'}
            size={20}
            color={activeTab === 'myposts' ? '#007AFF' : '#666'}
          />
          <Text style={[
            styles.tabText,
            activeTab === 'myposts' && styles.activeTabText
          ]}>
            My Posts
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'profile' && styles.activeTab
          ]}
          onPress={() => setActiveTab('profile')}
        >
          <Ionicons
            name={activeTab === 'profile' ? 'person' : 'person-outline'}
            size={20}
            color={activeTab === 'profile' ? '#007AFF' : '#666'}
          />
          <Text style={[
            styles.tabText,
            activeTab === 'profile' && styles.activeTabText
          ]}>
            Profile
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
  },
  comingSoon: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  comingSoonTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  comingSoonText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingBottom: 20,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  activeTab: {
    // Additional styles for active tab if needed
  },
  tabText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default MainScreen;