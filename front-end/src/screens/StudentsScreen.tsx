import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { classAPI } from '../services/classService';
import { Student } from '../types/api';
import { useAuth } from '../contexts/AuthContext';
import StudentDetailScreen from './StudentDetailScreen';

const StudentsScreen: React.FC = () => {
  const { refreshUser, logout } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedYear, setSelectedYear] = useState('2565'); // เริ่มต้นที่ 2565
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [customYear, setCustomYear] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // ปีที่มีให้เลือก
  const availableYears = ['2565', '2566', '2567', '2568'];

  const fetchStudents = useCallback(async (year: string, showLoading: boolean = true, retryCount: number = 0) => {
    if (showLoading) setLoading(true);
    
    try {
      console.log(`📚 Fetching students for year: ${year}, retry: ${retryCount}`);
      const response = await classAPI.getStudentsByYear(year);
      
      if (response.success && response.data) {
        setStudents(response.data);
        console.log(`📚 Found ${response.data.length} students`);
      } else {
        console.log('📚 No students found or API error:', response.message);
        setStudents([]);
        
        // หากได้ message เกี่ยวกับการ signin ใหม่
        if (response.message && response.message.includes('เข้าสู่ระบบใหม่')) {
          Alert.alert(
            'Session หมดอายุ',
            'กรุณาออกจากแอปและเข้าสู่ระบบใหม่',
            [
              { text: 'ยกเลิก', style: 'cancel' },
              { 
                text: 'ออกจากระบบ', 
                style: 'destructive',
                onPress: () => logout()
              }
            ]
          );
        } else if (response.message) {
          Alert.alert('ข้อมูลนักเรียน', response.message);
        }
      }
    } catch (error: any) {
      console.error('📚 Fetch students error:', error);
      
      // ลอง retry หากเป็น network error และยังไม่เกิน 2 ครั้ง
      if (retryCount < 2 && (error.code === 'NETWORK_ERROR' || !error.response)) {
        console.log(`📚 Retrying... attempt ${retryCount + 1}`);
        setTimeout(() => {
          fetchStudents(year, false, retryCount + 1);
        }, 1000);
        return;
      }
      
      Alert.alert(
        'เกิดข้อผิดพลาด',
        'ไม่สามารถดึงข้อมูลนักเรียนได้ กรุณาลองใหม่อีกครั้ง'
      );
      setStudents([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [logout]);

  useEffect(() => {
    fetchStudents(selectedYear, true);
  }, [selectedYear, fetchStudents]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    
    // ลอง refresh user token ก่อน
    try {
      await refreshUser();
    } catch (error) {
      console.log('📚 Failed to refresh user, continuing with existing token');
    }
    
    // แล้วค่อยดึงข้อมูลนักเรียน
    await fetchStudents(selectedYear, false);
  }, [selectedYear, fetchStudents, refreshUser]);

  const handleYearSelect = (year: string) => {
    setSelectedYear(year);
    setShowYearPicker(false);
  };

  const handleCustomYearSubmit = () => {
    if (customYear && customYear.length === 4 && /^\d+$/.test(customYear)) {
      setSelectedYear(customYear);
      setCustomYear('');
      setShowYearPicker(false);
    } else {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกปี พ.ศ. ที่ถูกต้อง (4 หลัก)');
    }
  };

  const getInitials = (name: string): string => {
    if (!name || typeof name !== 'string') {
      return 'N/A';
    }
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  const renderStudentItem = ({ item }: { item: Student }) => {
    // สร้างชื่อให้แสดงจากข้อมูลที่มี
    const displayName = item.name || 
                       (item.firstname && item.lastname ? `${item.firstname} ${item.lastname}` : '') ||
                       item.firstname ||
                       item.lastname ||
                       (item.studentId ? `Student ${item.studentId}` : '') ||
                       (item.email ? item.email : '') ||
                       'Unknown Student';
    
    // สร้าง ID สำหรับแสดง - ใช้เฉพาะ studentId จาก education
    const displayId = item.education?.studentId || item.studentId;
    
    // สาขาวิชา
    const major = item.education?.major;
    
    return (
      <TouchableOpacity
        style={styles.studentCard}
        onPress={() => setSelectedStudent(item)}
        activeOpacity={0.7}
      >
        <View style={styles.studentInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(displayName)}</Text>
          </View>
          <View style={styles.studentDetails}>
            <Text style={styles.studentName}>{displayName}</Text>
            {displayId && (
              <Text style={styles.studentId}>รหัสนักศึกษา: {displayId}</Text>
            )}
            {major && (
              <Text style={styles.studentClass}>สาขาวิชา: {major}</Text>
            )}
            {item.email && (
              <Text style={styles.studentEmail}>{item.email}</Text>
            )}
            {item.class && (
              <Text style={styles.studentClass}>ชั้นเรียน: {item.class}</Text>
            )}
            {item.year && item.year !== selectedYear && (
              <Text style={styles.studentClass}>ปี: {item.year}</Text>
            )}
            {item.department && (
              <Text style={styles.studentClass}>แผนก: {item.department}</Text>
            )}
            {item.role && (
              <Text style={styles.studentClass}>สถานะ: {item.role}</Text>
            )}
          </View>
        </View>
        <TouchableOpacity 
          style={styles.moreButton}
          onPress={() => setSelectedStudent(item)}
        >
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerInfo}>
        <Text style={styles.headerTitle}>รายชื่อนักเรียน</Text>
        <Text style={styles.headerSubtitle}>
          ปี พ.ศ. {selectedYear} ({students.length} คน)
        </Text>
      </View>
      <TouchableOpacity
        style={styles.yearButton}
        onPress={() => setShowYearPicker(true)}
      >
        <Ionicons name="calendar-outline" size={20} color="#007AFF" />
        <Text style={styles.yearButtonText}>{selectedYear}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderYearPicker = () => (
    <Modal
      visible={showYearPicker}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowYearPicker(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>เลือกปี พ.ศ.</Text>
            <TouchableOpacity
              onPress={() => setShowYearPicker(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.yearGrid}>
            {availableYears.map((year) => (
              <TouchableOpacity
                key={year}
                style={[
                  styles.yearOption,
                  selectedYear === year && styles.selectedYearOption
                ]}
                onPress={() => handleYearSelect(year)}
              >
                <Text style={[
                  styles.yearOptionText,
                  selectedYear === year && styles.selectedYearOptionText
                ]}>
                  {year}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.customYearSection}>
            <Text style={styles.customYearLabel}>หรือกรอกปีเอง:</Text>
            <View style={styles.customYearInput}>
              <TextInput
                style={styles.textInput}
                placeholder="เช่น 2569"
                value={customYear}
                onChangeText={setCustomYear}
                keyboardType="numeric"
                maxLength={4}
              />
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleCustomYearSubmit}
              >
                <Text style={styles.submitButtonText}>ตกลง</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="school-outline" size={80} color="#ccc" />
      <Text style={styles.emptyTitle}>ไม่พบข้อมูลนักเรียน</Text>
      <Text style={styles.emptySubtitle}>
        ไม่มีข้อมูลนักเรียนสำหรับปี พ.ศ. {selectedYear}
      </Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => fetchStudents(selectedYear, true)}
      >
        <Text style={styles.retryButtonText}>ลองใหม่</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && students.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>กำลังโหลดข้อมูลนักเรียน...</Text>
      </View>
    );
  }

  // แสดงหน้า detail หากมีการเลือกนักเรียน
  if (selectedStudent) {
    return (
      <StudentDetailScreen
        student={selectedStudent}
        onBack={() => setSelectedStudent(null)}
      />
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={students}
        keyExtractor={(item, index) => item.id || item._id || item.studentId || index.toString()}
        renderItem={renderStudentItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
        contentContainerStyle={students.length === 0 ? styles.emptyList : undefined}
        showsVerticalScrollIndicator={false}
      />
      {renderYearPicker()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  yearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f3f4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  yearButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 5,
  },
  studentCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 5,
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  studentId: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 2,
  },
  studentEmail: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  studentClass: {
    fontSize: 12,
    color: '#999',
  },
  moreButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  yearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  yearOption: {
    width: '30%',
    backgroundColor: '#f1f3f4',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  selectedYearOption: {
    backgroundColor: '#007AFF',
  },
  yearOptionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  selectedYearOptionText: {
    color: '#fff',
  },
  customYearSection: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 20,
  },
  customYearLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  customYearInput: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 10,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default StudentsScreen;