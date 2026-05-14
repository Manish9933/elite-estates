import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  Dimensions, 
  TouchableOpacity,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  BarChart3, 
  Users, 
  Home as HomeIcon, 
  DollarSign, 
  TrendingUp, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react-native';
import { Theme } from '../styles/theme';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

const STATS = [
  { label: 'Total Revenue', value: '$12.4M', icon: DollarSign, color: '#10B981', trend: '+12.5%' },
  { label: 'Active Listings', value: '1,284', icon: HomeIcon, color: '#6366F1', trend: '+5.2%' },
  { label: 'New Users', value: '452', icon: Users, color: '#F59E0B', trend: '+18.7%' },
  { label: 'Pending Approvals', value: '28', icon: AlertCircle, color: '#EF4444', trend: '-2.4%' },
];

const RECENT_LISTINGS = [
  { id: '1', title: 'Oceanic Villa', agent: 'John Doe', status: 'Pending', date: '2 hours ago' },
  { id: '2', title: 'Mountain Retreat', agent: 'Jane Smith', status: 'Approved', date: '5 hours ago' },
  { id: '3', title: 'Urban Loft', agent: 'Mike Ross', status: 'Pending', date: 'Yesterday' },
];

export default function DashboardScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Mission Control</Text>
            <Text style={styles.subtitle}>Elite Estates Platform Overview</Text>
          </View>
          {isWeb && (
            <TouchableOpacity style={styles.exportButton}>
              <Text style={styles.exportButtonText}>Export Report</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Stats Grid */}
        <View style={[styles.statsGrid, isWeb && styles.statsGridWeb]}>
          {STATS.map((stat, index) => (
            <View key={index} style={[styles.statCard, isWeb && styles.statCardWeb]}>
              <View style={[styles.statIconContainer, { backgroundColor: `${stat.color}15` }]}>
                <stat.icon color={stat.color} size={24} />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <Text style={styles.statValue}>{stat.value}</Text>
                <View style={styles.trendRow}>
                  <TrendingUp color={stat.trend.startsWith('+') ? '#10B981' : '#EF4444'} size={14} />
                  <Text style={[styles.trendText, { color: stat.trend.startsWith('+') ? '#10B981' : '#EF4444' }]}>
                    {stat.trend} this month
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Main Content Area */}
        <View style={[styles.mainLayout, isWeb && styles.mainLayoutWeb]}>
          {/* Chart Placeholder */}
          <View style={[styles.chartSection, isWeb && styles.chartSectionWeb]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Property Trends</Text>
              <BarChart3 color={Theme.colors.textMuted} size={20} />
            </View>
            <View style={styles.chartPlaceholder}>
              <Text style={styles.placeholderText}>Revenue & Listing Analytics Chart</Text>
              {/* In a real app, integrate react-native-chart-kit or similar */}
              <View style={styles.mockChart}>
                {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                  <View key={i} style={[styles.chartBar, { height: h }]} />
                ))}
              </View>
            </View>
          </View>

          {/* Recent Activity */}
          <View style={[styles.activitySection, isWeb && styles.activitySectionWeb]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Listing Moderation</Text>
              <TouchableOpacity><Text style={styles.seeAllText}>View All</Text></TouchableOpacity>
            </View>
            {RECENT_LISTINGS.map((listing) => (
              <View key={listing.id} style={styles.listingRow}>
                <View style={styles.listingInfo}>
                  <Text style={styles.listingTitle}>{listing.title}</Text>
                  <Text style={styles.listingMeta}>by {listing.agent} • {listing.date}</Text>
                </View>
                <View style={[
                  styles.statusBadge, 
                  { backgroundColor: listing.status === 'Approved' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)' }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: listing.status === 'Approved' ? '#10B981' : '#F59E0B' }
                  ]}>{listing.status}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  scrollContent: {
    padding: Theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Theme.colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: Theme.colors.textMuted,
    marginTop: 4,
  },
  exportButton: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  exportButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'column',
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.xl,
  },
  statsGridWeb: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statCard: {
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.lg,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.glassBorder,
    flex: 1,
  },
  statCardWeb: {
    minWidth: 250,
  },
  statIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  statInfo: {
    flex: 1,
  },
  statLabel: {
    color: Theme.colors.textMuted,
    fontSize: 14,
  },
  statValue: {
    color: Theme.colors.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 2,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
  },
  mainLayout: {
    flexDirection: 'column',
    gap: Theme.spacing.lg,
  },
  mainLayoutWeb: {
    flexDirection: 'row',
  },
  chartSection: {
    flex: 2,
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.lg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Theme.colors.glassBorder,
  },
  chartSectionWeb: {
    flex: 2,
  },
  activitySection: {
    flex: 1,
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.lg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Theme.colors.glassBorder,
  },
  activitySectionWeb: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Theme.colors.text,
  },
  chartPlaceholder: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: Theme.colors.textMuted,
    marginBottom: 20,
  },
  mockChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 15,
    height: 100,
  },
  chartBar: {
    width: 20,
    backgroundColor: Theme.colors.primary,
    borderRadius: 4,
    opacity: 0.8,
  },
  seeAllText: {
    color: Theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  listingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  listingInfo: {
    flex: 1,
  },
  listingTitle: {
    color: Theme.colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  listingMeta: {
    color: Theme.colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  }
});
