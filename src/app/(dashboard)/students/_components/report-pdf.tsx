import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';

// 注册中文字体（思源黑体）
Font.register({
  family: 'Noto Sans SC',
  src: 'https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@master/hinted/ttf/NotoSansSC/NotoSansSC-Regular.ttf',
});

Font.register({
  family: 'Noto Sans SC Bold',
  src: 'https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@master/hinted/ttf/NotoSansSC/NotoSansSC-Bold.ttf',
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Noto Sans SC',
    fontSize: 10,
    color: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderBottomColor: '#6366f1',
    paddingBottom: 20,
    marginBottom: 20,
  },
  schoolName: {
    fontSize: 20,
    fontFamily: 'Noto Sans SC Bold',
    color: '#6366f1',
  },
  reportTitle: {
    fontSize: 14,
    marginTop: 4,
    color: '#666',
  },
  studentInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  infoItem: {
    width: '33.33%',
    marginBottom: 8,
  },
  label: {
    color: '#64748b',
    fontSize: 9,
    marginBottom: 2,
  },
  value: {
    fontSize: 11,
    fontFamily: 'Noto Sans SC Bold',
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Noto Sans SC Bold',
    marginBottom: 12,
    marginTop: 10,
    color: '#1e293b',
    borderLeftWidth: 4,
    borderLeftColor: '#6366f1',
    paddingLeft: 8,
  },
  chartContainer: {
    height: 200,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 10,
  },
  chartImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  table: {
    width: '100%',
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#6366f1',
    padding: 8,
    borderRadius: 4,
  },
  tableHeaderText: {
    color: '#fff',
    fontFamily: 'Noto Sans SC Bold',
    fontSize: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    padding: 8,
  },
  col1: { width: '20%' },
  col2: { width: '40%' },
  col3: { width: '20%' },
  col4: { width: '20%', textAlign: 'right' },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 8,
  }
});

interface GradeReportPDFProps {
  student: any;
  grades: any[];
  chartImage?: string;
}

export const GradeReportPDF = ({ student, grades, chartImage }: GradeReportPDFProps) => (
  <Document title={`${student.name} 的学业报告`}>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.schoolName}>智学管理系统</Text>
          <Text style={styles.reportTitle}>学生学业发展报告</Text>
        </View>
        <View style={{ textAlign: 'right' }}>
          <Text style={{ fontSize: 10, color: '#94a3b8' }}>生成日期: {new Date().toLocaleDateString()}</Text>
        </View>
      </View>

      {/* Student Info */}
      <View style={styles.studentInfo}>
        <View style={styles.infoItem}>
          <Text style={styles.label}>姓名</Text>
          <Text style={styles.value}>{student.name}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.label}>学号</Text>
          <Text style={styles.value}>{student.student_no}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.label}>性别</Text>
          <Text style={styles.value}>{student.gender}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.label}>班级</Text>
          <Text style={styles.value}>{student.class_id}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.label}>出生日期</Text>
          <Text style={styles.value}>{student.birth_date}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.label}>状态</Text>
          <Text style={styles.value}>{student.status}</Text>
        </View>
      </View>

      {/* Performance Trend */}
      <Text style={styles.sectionTitle}>学期综合表现趋势</Text>
      <View style={styles.chartContainer}>
        {chartImage ? (
          <Image src={chartImage} style={styles.chartImage} />
        ) : (
          <Text style={{ color: '#94a3b8' }}>趋势数据加载中...</Text>
        )}
      </View>

      {/* Grades Table */}
      <Text style={styles.sectionTitle}>近期成绩明细</Text>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.col1]}>日期</Text>
          <Text style={[styles.tableHeaderText, styles.col2]}>考试名称</Text>
          <Text style={[styles.tableHeaderText, styles.col3]}>科目</Text>
          <Text style={[styles.tableHeaderText, styles.col4]}>成绩</Text>
        </View>
        {grades.slice(0, 15).map((grade, index) => (
          <View key={index} style={[styles.tableRow, { backgroundColor: index % 2 === 1 ? '#f8fafc' : '#fff' }]}>
            <Text style={styles.col1}>{grade.exams?.exam_date || '-'}</Text>
            <Text style={styles.col2}>{grade.exams?.name || '-'}</Text>
            <Text style={styles.col3}>{grade.courses?.name || '-'}</Text>
            <Text style={[styles.col4, { color: grade.score < (grade.courses?.max_score * 0.6) ? '#ef4444' : '#1e293b' }]}>
              {grade.score} / {grade.courses?.max_score}
            </Text>
          </View>
        ))}
      </View>

      <Text style={styles.footer}>
        报告由智学管理系统自动生成 · 官方认证学业记录
      </Text>
    </Page>
  </Document>
);
