import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import CreateUserScreen from './CreateUserScreen';
import UserListScreen from './UserListScreen';
import ProfileScreen from './ProfileScreen';


type TabType = 'create' | 'list' | 'profile';

const MainScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('create'); // Start with create tab

  const renderTabContent = () => {
    switch (activeTab) {
      case 'create':
        return <CreateUserScreen />;
      case 'list':
        return <UserListScreen />;
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
            activeTab === 'create' && styles.activeTab
          ]}
          onPress={() => setActiveTab('create')}
        >
          <Ionicons
            name={activeTab === 'create' ? 'person-add' : 'person-add-outline'}
            size={24}
            color={activeTab === 'create' ? '#007AFF' : '#666'}
          />
          <Text style={[
            styles.tabText,
            activeTab === 'create' && styles.activeTabText
          ]}>
            Create User
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'list' && styles.activeTab
          ]}
          onPress={() => setActiveTab('list')}
        >
          <Ionicons
            name={activeTab === 'list' ? 'people' : 'people-outline'}
            size={24}
            color={activeTab === 'list' ? '#007AFF' : '#666'}
          />
          <Text style={[
            styles.tabText,
            activeTab === 'list' && styles.activeTabText
          ]}>
            User List
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
            size={24}
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