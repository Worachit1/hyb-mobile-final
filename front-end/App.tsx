import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import MainScreen from './src/screens/MainScreen';
import SigninScreen from './src/screens/SigninScreen';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoggedIn, isLoading, refreshUser } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // หากยังไม่ได้ signin ให้แสดงหน้า signin
  if (!isLoggedIn) {
    return <SigninScreen />;
  }

  // หาก signin แล้วแต่ยัง authenticate ไม่ได้ (token + x-api-key ไม่ work)
  if (!isAuthenticated) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Authentication Error</Text>
        <Text style={styles.errorText}>
          Signed in successfully, but unable to access profile.
        </Text>
        <Text style={styles.errorText}>
          Please check API key configuration.
        </Text>
      </View>
    );
  }

  // ทุกอย่างสำเร็จ แสดง main screen
  return <MainScreen />;
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff3b30',
    marginBottom: 15,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});
