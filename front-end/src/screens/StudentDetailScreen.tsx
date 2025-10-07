import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Student } from '../types/api';

interface StudentDetailScreenProps {
  student: Student;
  onBack: () => void;
}

const StudentDetailScreen: React.FC<StudentDetailScreenProps> = ({ student, onBack }) => {
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

  // สร้างชื่อให้แสดงจากข้อมูลที่มี
  const displayName = student.name || 
                     (student.firstname && student.lastname ? `${student.firstname} ${student.lastname}` : '') ||
                     student.firstname ||
                     student.lastname ||
                     (student.education?.studentId ? `Student ${student.education.studentId}` : '') ||
                     (student.email ? student.email : '') ||
                     'Unknown Student';

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'N/A';
    }
  };

  const renderInfoRow = (label: string, value?: string | null, icon?: string) => {
    if (!value) return null;
    
    return (
      <View style={styles.infoRow}>
        <View style={styles.infoLabel}>
          {icon && <Ionicons name={icon as any} size={20} color="#007AFF" style={styles.infoIcon} />}
          <Text style={styles.labelText}>{label}</Text>
        </View>
        <Text style={styles.valueText}>{value}</Text>
      </View>
    );
  };

  const renderSection = (title: string, icon: string, children: React.ReactNode) => {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name={icon as any} size={24} color="#007AFF" />
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <View style={styles.sectionContent}>
          {children}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>รายละเอียดนักศึกษา</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {student.image ? (
              <Image source={{ uri: student.image }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{getInitials(displayName)}</Text>
              </View>
            )}
          </View>
          <Text style={styles.profileName}>{displayName}</Text>
          {student.education?.studentId && (
            <Text style={styles.profileId}>รหัสนักศึกษา: {student.education.studentId}</Text>
          )}
          {student.role && (
            <View style={styles.roleTag}>
              <Text style={styles.roleText}>{student.role}</Text>
            </View>
          )}
        </View>

        {/* Personal Information */}
        {renderSection('ข้อมูลส่วนตัว', 'person-outline', (
          <>
            {renderInfoRow('ชื่อ', student.firstname, 'person-outline')}
            {renderInfoRow('นามสกุล', student.lastname, 'person-outline')}
            {renderInfoRow('อีเมล', student.email, 'mail-outline')}
            {renderInfoRow('ประเภท', student.type, 'pricetag-outline')}
            {renderInfoRow('สถานะยืนยัน', student.confirmed ? 'ยืนยันแล้ว' : 'ยังไม่ยืนยัน', 'checkmark-circle-outline')}
          </>
        ))}

        {/* Education Information */}
        {student.education && renderSection('ข้อมูลการศึกษา', 'school-outline', (
          <>
            {renderInfoRow('รหัสนักศึกษา', student.education.studentId, 'card-outline')}
            {renderInfoRow('สาขาวิชา', student.education.major, 'library-outline')}
            {renderInfoRow('ปีที่เข้าศึกษา', student.education.enrollmentYear, 'calendar-outline')}
            {renderInfoRow('รหัสโรงเรียน', student.education.schoolId, 'business-outline')}
            {renderInfoRow('จังหวัดโรงเรียน', student.education.schoolProvince, 'location-outline')}
            {renderInfoRow('รหัสอาจารย์ที่ปรึกษา', student.education.advisorId, 'people-outline')}
          </>
        ))}


        {/* Additional Information */}
        {(student.department || student.class || student.year) && renderSection('ข้อมูลเพิ่มเติม', 'information-circle-outline', (
          <>
            {renderInfoRow('แผนก', student.department, 'business-outline')}
            {renderInfoRow('ชั้นเรียน', student.class, 'school-outline')}
            {renderInfoRow('ปี', student.year, 'calendar-outline')}
          </>
        ))}

        {/* Jobs Information */}
        {student.job && student.job.length > 0 && renderSection('งาน/โครงการ', 'briefcase-outline', (
          <Text style={styles.jobsText}>
            {student.job.length > 0 ? `มีงาน ${student.job.length} งาน` : 'ไม่มีงาน'}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  avatarContainer: {
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    textAlign: 'center',
  },
  profileId: {
    fontSize: 16,
    color: '#007AFF',
    marginBottom: 10,
  },
  roleTag: {
    backgroundColor: '#e8f4ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 15,
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  sectionContent: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  infoRow: {
    marginBottom: 15,
  },
  infoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  infoIcon: {
    marginRight: 8,
  },
  labelText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  valueText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 28,
    lineHeight: 22,
  },
  jobsText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default StudentDetailScreen;