import React, { useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions, 
  Image,
  Platform,
  Switch,
  Alert,
  Modal,
  RefreshControl,
  ActivityIndicator,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ChevronLeft, 
  User,
  Settings, 
  Shield, 
  Bell, 
  CreditCard, 
  ChevronRight, 
  LogOut, 
  Package,
  Award
} from 'lucide-react-native';
import { Theme } from '../styles/theme';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useAuth } from '../context/AuthContext';
import { profileApi } from '../api/profiles';
import { supabase } from '../lib/supabase';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const GOLD = Theme.colors.gold;
const GOLD_GRADIENT = Theme.colors.goldGradient;

export default function ProfileScreen({ navigation }: any) {
  const { user, profile: authProfile, signOut } = useAuth();
  const [profile, setProfile] = React.useState<any>(null);
  const [clickCount, setClickCount] = React.useState(0);
  const [adminUnlocked, setAdminUnlocked] = React.useState(false);

  const handleSecretTap = () => {
    setClickCount(prev => {
      const next = prev + 1;
      if (next >= 5) {
        setAdminUnlocked(true);
        showLuxuryAlert('Developer Access Unlocked', 'Administrative options are now temporarily visible.');
        return 0;
      }
      return next;
    });
  };
  const [notifications, setNotifications] = React.useState(true);
  const [stats, setStats] = React.useState({ saved: 0, viewings: 0, offers: 0 });
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [activeModal, setActiveModal] = React.useState<string | null>(null);
  const [editedName, setEditedName] = React.useState('');
  const [editedAvatar, setEditedAvatar] = React.useState('');
  const [editedPhone, setEditedPhone] = React.useState('+1 (555) 000-0000');
  const [editedLocation, setEditedLocation] = React.useState('New York, USA');
  const [editedTitle, setEditedTitle] = React.useState('Platinum Member');
  const [editedBio, setEditedBio] = React.useState('');
  const [editedContact, setEditedContact] = React.useState('Secure Call');
  const [userBookings, setUserBookings] = React.useState<any[]>([]);
  const [alertConfig, setAlertConfig] = React.useState({ visible: false, title: '', message: '', type: 'success' });
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const showLuxuryAlert = (title: string, message: string, type: 'success' | 'error' = 'success') => {
    setAlertConfig({ visible: true, title, message, type });
  };

  const fetchData = React.useCallback(async (silent = false) => {
    if (!user) return;
    if (!silent) setLoading(true);
    try {
      // 1. Fetch Profile
      try {
        const profileRes = await profileApi.getProfile(user.id);
        if (profileRes.data) {
          setProfile(profileRes.data);
          setEditedName(profileRes.data.full_name || '');
          setEditedAvatar(profileRes.data.avatar_url || '');
          setEditedPhone(profileRes.data.phone || '+1 (555) 000-0000');
          setEditedLocation(profileRes.data.location || 'New York, USA');
          setEditedTitle(profileRes.data.title || 'Elite Investor');
          setEditedBio(profileRes.data.bio || '');
          setEditedContact(profileRes.data.preferred_contact || 'Secure Call');
        }
      } catch (e) {
        console.error('Error fetching profile detail:', e);
      }

      // 2. Fetch User Stats
      try {
        const statsRes = await profileApi.getUserStats(user.id);
        if (statsRes) setStats(statsRes);
      } catch (e) {
        console.error('Error fetching stats:', e);
      }

      // 3. Fetch Bookings
      try {
        const bookingsRes = await supabase.from('bookings').select('*, property(*)').eq('buyer_id', user.id).order('created_at', { ascending: false });
        if (bookingsRes.data) setUserBookings(bookingsRes.data);
      } catch (e) {
        console.error('Error fetching bookings:', e);
      }
    } catch (error) {
      console.error('Error in profile screen load:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData(true);
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const updates: any = {
        full_name: editedName,
        avatar_url: editedAvatar,
        updated_at: new Date().toISOString(),
      };

      // Add advanced fields only if they exist in the schema
      // This prevents the app from crashing if columns are missing
      if (editedPhone) updates.phone = editedPhone;
      if (editedLocation) updates.location = editedLocation;
      if (editedTitle) updates.title = editedTitle;
      if (editedBio) updates.bio = editedBio;
      if (editedContact) updates.preferred_contact = editedContact;

      const { error } = await profileApi.updateProfile(user.id, updates);
      if (error) throw error;
      
      await fetchData(true);
      setActiveModal(null);
      showLuxuryAlert('Identity Synchronized', 'Your presence has been successfully updated across the Elite network.');
    } catch (error: any) {
      showLuxuryAlert('Error', error.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setEditedAvatar(uri);
      uploadImage(uri);
    }
  };

  const uploadImage = async (uri: string) => {
    if (!user) return;
    setIsSaving(true);
    console.log("[Profile] Starting image upload for uri:", uri);
    
    try {
      const fileName = `${user.id}/${Date.now()}.jpg`;
      
      // Attempt to read the file as a blob
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Convert blob to arrayBuffer for Supabase
      // Using FileReader for maximum compatibility in React Native
      const arrayBuffer: ArrayBuffer = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = (e) => reject(e);
        reader.readAsArrayBuffer(blob);
      });
      
      console.log("[Profile] File read successful, uploading to Supabase...");

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (error) {
        console.error('Supabase Storage Error:', error);
        throw new Error(`Upload failed: ${error.message}`);
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      console.log("[Profile] Upload successful, public URL:", publicUrl);
      setEditedAvatar(publicUrl);
      
      // Update profile immediately
      await profileApi.updateProfile(user.id, { avatar_url: publicUrl });
      await fetchData(true);
      
      showLuxuryAlert('Identity Synchronized', 'Your executive photo has been uploaded and secured.');
    } catch (error: any) {
      console.error("[Profile] Upload Process Error:", error);
      showLuxuryAlert('Storage Error', error.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // handleLogout is now handled inline by the premium confirm/progress modal

  // Extract user info with fallbacks
  const userName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Member';
  const userEmail = user?.email || '';
  const userImage = profile?.avatar_url || authProfile?.avatar_url || user?.user_metadata?.avatar_url || `https://i.pravatar.cc/150?u=${user?.id}`;
  const isUserAdmin = adminUnlocked ||
                      userEmail.toLowerCase().includes('admin') || 
                      profile?.role?.toLowerCase() === 'admin' || 
                      authProfile?.role?.toLowerCase() === 'admin' || 
                      user?.user_metadata?.role?.toLowerCase() === 'admin';
  const userRole = isUserAdmin ? 'ADMIN' : (profile?.role?.toUpperCase() || authProfile?.role?.toUpperCase() || user?.user_metadata?.role?.toUpperCase() || 'MEMBER');

  const MenuItem = ({ icon: Icon, title, subtitle, color = 'white', onPress, rightElement }: any) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={[styles.menuIconContainer, { backgroundColor: `${color}15` }]}>
        <Icon size={20} color={color} />
      </View>
      <View style={styles.menuTextContainer}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement ? rightElement : <ChevronRight size={20} color="rgba(255,255,255,0.3)" />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={GOLD} />
        </View>
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={GOLD} colors={[GOLD]} />
          }
        >
        
        {/* Profile Card */}
        <Animated.View entering={FadeInDown.duration(800)} style={styles.profileCardWrapper}>
          <LinearGradient
            colors={['rgba(212, 175, 55, 0.15)', 'rgba(20, 20, 20, 0.8)']}
            style={styles.profileCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.profileHeader}>
              <TouchableOpacity style={styles.avatarWrapper} onPress={() => setActiveModal('identity')}>
                <Image 
                  source={{ uri: userImage }} 
                  style={styles.avatar} 
                />
                <View style={styles.badgeWrapper}>
                  <Award size={14} color="black" fill={GOLD} />
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.nameContainer} onPress={handleSecretTap} activeOpacity={0.9}>
                <Text style={styles.userName}>{userName}</Text>
                <Text style={styles.userRole}>{userRole}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.statsRow}>
              <TouchableOpacity 
                style={styles.statItem}
                onPress={() => navigation.navigate('Saved')}
              >
                <Text style={styles.statValue}>{stats.saved}</Text>
                <Text style={styles.statLabel}>Saved</Text>
              </TouchableOpacity>
              <View style={styles.statDivider} />
              <TouchableOpacity 
                style={styles.statItem}
                onPress={() => showLuxuryAlert('Concierge Update', 'You have ' + stats.viewings + ' private viewings scheduled for this month.')}
              >
                <Text style={styles.statValue}>{stats.viewings}</Text>
                <Text style={styles.statLabel}>Viewings</Text>
              </TouchableOpacity>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.offers}</Text>
                <Text style={styles.statLabel}>Offers</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Menu Sections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <View style={styles.menuContainer}>
            <MenuItem 
              icon={User} 
              title="Personal Information" 
              subtitle={userName} 
              color={GOLD}
              onPress={() => setActiveModal('identity')}
            />
            <MenuItem 
              icon={Shield} 
              title="Security" 
              subtitle="Password and biometric auth" 
              color="#10B981"
              onPress={() => setActiveModal('security')}
            />
            <MenuItem 
              icon={Bell} 
              title="Notifications" 
              subtitle="Stay updated on properties" 
              color="#3B82F6"
              rightElement={
                <Switch 
                  value={notifications} 
                  onValueChange={setNotifications}
                  trackColor={{ false: '#333', true: GOLD }}
                  thumbColor="white"
                />
              }
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Real Estate Portfolio</Text>
          <View style={styles.menuContainer}>
            <MenuItem 
              icon={Package} 
              title="My Bookings" 
              subtitle="Manage your property tours" 
              color="#F59E0B"
              onPress={() => setActiveModal('bookings')}
            />
            <MenuItem 
              icon={CreditCard} 
              title="Payments" 
              subtitle="Transaction history and invoices" 
              color="#EC4899"
              onPress={() => setActiveModal('payments')}
            />
          </View>
        </View>

        {(userRole.toLowerCase() === 'admin') && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Administrative</Text>
            <View style={styles.menuContainer}>
              <MenuItem 
                icon={Shield} 
                title="Admin Dashboard" 
                subtitle="Manage properties, users, and offers" 
                color={Theme.colors.primary}
                onPress={() => navigation.navigate('AdminDashboard')}
              />
            </View>
          </View>
        )}

        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={() => { setShowLogoutModal(true); setIsLoggingOut(false); }}>
            <LogOut size={20} color="#EF4444" />
            <Text style={styles.logoutText}>Secure Logout</Text>
          </TouchableOpacity>
          <Text style={styles.versionText}>Elite Estates v1.0.4 Premium • Concierge Edition</Text>
        </View>
      </ScrollView>
      )}

      {/* Production Modals Suite */}
      
      {/* 1. Profile Editor */}
      <Modal visible={activeModal === 'identity'} transparent animationType="slide" onRequestClose={() => setActiveModal(null)}>
        <View style={styles.editOverlay}>
          <View style={[styles.editContainer, { height: '90%' }]}>
            <View style={styles.editHeader}>
              <View style={styles.headerTitleGroup}>
                <TouchableOpacity onPress={() => setActiveModal(null)} style={styles.backBtn}>
                  <ChevronLeft size={24} color="white" />
                </TouchableOpacity>
                <View>
                  <Text style={styles.editTitle}>Edit Profile</Text>
                  <Text style={styles.modalSub}>Update your personal details</Text>
                </View>
              </View>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.dossierSection}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput style={styles.textInput} value={editedName} onChangeText={setEditedName} placeholder="Full Name" placeholderTextColor="rgba(255,255,255,0.3)" />
              </View>
              <View style={styles.dossierSection}>
                <Text style={styles.inputLabel}>Your Title / Role</Text>
                <TextInput style={styles.textInput} value={editedTitle} onChangeText={setEditedTitle} placeholder="e.g. Home Buyer / Investor" placeholderTextColor="rgba(255,255,255,0.3)" />
              </View>
              <View style={styles.dossierSection}>
                <Text style={styles.inputLabel}>Profile Photo</Text>
                <TouchableOpacity style={styles.uploadBtn} onPress={pickImage} disabled={isSaving}>
                  <Image source={{ uri: editedAvatar || userImage }} style={styles.uploadPreview} />
                  <View style={styles.uploadInfo}>
                    <Text style={styles.uploadText}>{isSaving ? 'Saving...' : 'Upload Profile Photo'}</Text>
                    <Text style={styles.uploadSub}>Select from your gallery</Text>
                  </View>
                  <ChevronRight size={18} color={Theme.colors.gold} />
                </TouchableOpacity>
              </View>
              <View style={styles.dossierSection}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <TextInput style={styles.textInput} value={editedPhone} onChangeText={setEditedPhone} placeholder="Phone Number" placeholderTextColor="rgba(255,255,255,0.3)" />
              </View>
              <View style={styles.dossierSection}>
                <Text style={styles.inputLabel}>Preferred Contact Method</Text>
                <View style={styles.contactRow}>
                  {['Phone Call', 'WhatsApp', 'Email'].map(method => (
                    <TouchableOpacity 
                      key={method} 
                      style={[styles.contactChip, editedContact === method && styles.contactChipActive]}
                      onPress={() => setEditedContact(method)}
                    >
                      <Text style={[styles.contactChipText, editedContact === method && styles.contactChipTextActive]}>{method}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.dossierSection}>
                <Text style={styles.inputLabel}>About You (Bio)</Text>
                <TextInput 
                  style={[styles.textInput, { height: 100, paddingTop: 15 }]} 
                  value={editedBio} 
                  onChangeText={setEditedBio} 
                  placeholder="Tell us about your interests in homes..." 
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  multiline
                />
              </View>
              <View style={styles.dossierSection}>
                <Text style={styles.inputLabel}>Residency (City, Country)</Text>
                <TextInput style={styles.textInput} value={editedLocation} onChangeText={setEditedLocation} placeholder="City, Country" placeholderTextColor="rgba(255,255,255,0.3)" />
              </View>
              <TouchableOpacity style={styles.saveButton} onPress={handleUpdateProfile} disabled={isSaving}>
                <LinearGradient colors={GOLD_GRADIENT} style={styles.saveBtnGradient}>
                  {isSaving ? <ActivityIndicator color="black" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 2. Security Command */}
      <Modal visible={activeModal === 'security'} transparent animationType="slide" onRequestClose={() => setActiveModal(null)}>
        <View style={styles.editOverlay}>
          <View style={styles.editContainer}>
            <View style={styles.editHeader}>
              <View style={styles.headerTitleGroup}>
                <TouchableOpacity onPress={() => setActiveModal(null)} style={styles.backBtn}>
                  <ChevronLeft size={24} color="white" />
                </TouchableOpacity>
                <View>
                  <Text style={styles.editTitle}>Security Guard</Text>
                  <Text style={styles.modalSub}>Protection & authentication</Text>
                </View>
              </View>
            </View>
            <View style={styles.menuContainer}>
              <MenuItem icon={Shield} title="Biometric Unlock" subtitle="FaceID and Fingerprint" color={Theme.colors.gold} rightElement={<Switch value={true} trackColor={{ false: '#333', true: Theme.colors.gold }} thumbColor="white" />} />
              <MenuItem icon={User} title="Two-Factor Auth" subtitle="SMS Verification" color="#10B981" rightElement={<Switch value={false} trackColor={{ false: '#333', true: Theme.colors.gold }} thumbColor="white" />} />
            </View>
            <TouchableOpacity style={[styles.saveButton, { marginTop: 30 }]} onPress={() => showLuxuryAlert('Security Updated', 'Your biometric shields have been activated.')}>
              <LinearGradient colors={GOLD_GRADIENT} style={styles.saveBtnGradient}><Text style={styles.saveBtnText}>Secure Account</Text></LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 3. Portfolio: Bookings (Redesigned Itinerary) */}
      <Modal visible={activeModal === 'bookings'} transparent animationType="slide" onRequestClose={() => setActiveModal(null)}>
        <View style={styles.editOverlay}>
          <View style={[styles.editContainer, { height: '85%' }]}>
            <View style={styles.editHeader}>
              <View style={styles.headerTitleGroup}>
                <TouchableOpacity onPress={() => setActiveModal(null)} style={styles.backBtn}>
                  <ChevronLeft size={24} color="white" />
                </TouchableOpacity>
                <View>
                  <Text style={styles.editTitle}>Private Itinerary</Text>
                  <Text style={styles.modalSub}>Scheduled architectural tours</Text>
                </View>
              </View>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {userBookings.length === 0 ? (
                <View style={styles.emptyGallery}>
                  <Package size={60} color="rgba(255,255,255,0.05)" />
                  <Text style={styles.emptyGalleryText}>Your itinerary is currently clear.</Text>
                </View>
              ) : (
                userBookings.map((booking: any) => (
                  <View key={booking.id} style={styles.itineraryCard}>
                    <Image source={{ uri: booking.property?.images?.[0] || 'https://via.placeholder.com/100' }} style={styles.itineraryImg} />
                    <View style={styles.itineraryInfo}>
                      <Text style={styles.itineraryTitle} numberOfLines={1}>{booking.property?.title}</Text>
                      <View style={styles.itineraryMeta}>
                        <Settings size={12} color={Theme.colors.gold} />
                        <Text style={styles.itineraryDate}>{new Date(booking.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</Text>
                      </View>
                    </View>
                    <View style={styles.itineraryStatus}>
                      <Text style={styles.statusLabel}>CONFIRMED</Text>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 4. Real Estate Ledger: Payments (Redesigned Financials) */}
      <Modal visible={activeModal === 'payments'} transparent animationType="slide" onRequestClose={() => setActiveModal(null)}>
        <View style={styles.editOverlay}>
          <View style={styles.editContainer}>
            <View style={styles.editHeader}>
              <View style={styles.headerTitleGroup}>
                <TouchableOpacity onPress={() => setActiveModal(null)} style={styles.backBtn}>
                  <ChevronLeft size={24} color="white" />
                </TouchableOpacity>
                <View>
                  <Text style={styles.editTitle}>Financial Ledger</Text>
                  <Text style={styles.modalSub}>Transaction history & assets</Text>
                </View>
              </View>
            </View>
            <View style={styles.ledgerEmpty}>
              <View style={styles.ledgerIconContainer}>
                <CreditCard size={40} color={Theme.colors.gold} />
              </View>
              <Text style={styles.ledgerEmptyTitle}>No Transactions</Text>
              <Text style={styles.ledgerEmptySub}>Your financial history will appear here once you engage in property negotiations.</Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* Luxury Alert Modal */}
      <Modal
        visible={alertConfig.visible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setAlertConfig({ ...alertConfig, visible: false })}
      >
        <View style={styles.alertOverlay}>
          <Animated.View entering={ZoomIn.duration(400)} style={styles.alertBox}>
            <View style={[styles.alertIconBg, alertConfig.type === 'error' && { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
              {alertConfig.type === 'success' ? (
                <Award size={32} color={Theme.colors.gold} />
              ) : (
                <Shield size={32} color="#EF4444" />
              )}
            </View>
            <Text style={styles.alertTitle}>{alertConfig.title}</Text>
            <Text style={styles.alertMessage}>{alertConfig.message}</Text>
            <TouchableOpacity 
              style={styles.alertBtn}
              onPress={() => setAlertConfig({ ...alertConfig, visible: false })}
            >
              <LinearGradient 
                colors={alertConfig.type === 'success' ? ['#F9F295', '#E0AA3E', '#B88A44', '#D4AF37'] : ['#EF4444', '#B91C1C']} 
                style={styles.alertBtnGradient}
              >
                <Text style={[styles.alertBtnText, alertConfig.type === 'error' && { color: 'white' }]}>Dismiss</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* Premium Logout Confirmation & Progress Modal */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          if (!isLoggingOut) setShowLogoutModal(false);
        }}
      >
        <View style={styles.alertOverlay}>
          <Animated.View entering={ZoomIn.duration(400)} style={styles.alertBox}>
            <View style={[styles.alertIconBg, isLoggingOut ? { backgroundColor: 'rgba(212, 175, 55, 0.05)' } : { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
              {isLoggingOut ? (
                <ActivityIndicator size="small" color={GOLD} />
              ) : (
                <LogOut size={26} color="#EF4444" />
              )}
            </View>
            <Text style={styles.alertTitle}>
              {isLoggingOut ? 'Signing Out' : 'Secure Logout'}
            </Text>
            <Text style={styles.alertMessage}>
              {isLoggingOut 
                ? 'Your session is being securely terminated. We look forward to your return.' 
                : 'Are you sure you want to terminate your premium session?'}
            </Text>

            {!isLoggingOut ? (
              <View style={styles.logoutBtnRow}>
                <TouchableOpacity 
                  style={styles.cancelLogoutBtn}
                  onPress={() => setShowLogoutModal(false)}
                >
                  <Text style={styles.cancelLogoutBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.confirmLogoutBtn}
                  onPress={async () => {
                    setIsLoggingOut(true);
                    try {
                      await signOut();
                    } catch (error: any) {
                      setIsLoggingOut(false);
                      setShowLogoutModal(false);
                      showLuxuryAlert('Error', error.message, 'error');
                    }
                  }}
                >
                  <LinearGradient 
                    colors={['#EF4444', '#991B1B']} 
                    style={styles.confirmLogoutGradient}
                  >
                    <Text style={styles.confirmLogoutBtnText}>Logout</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : null}
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
  },
  scrollContent: {
    flexGrow: 1, // Let scroll content fill available space to prevent black gaps
    padding: 25,
    paddingTop: Platform.OS === 'android' ? 60 : 20,
    paddingBottom: 35, // Reduced from 160 to remove the unwanted black bottom gap
    maxWidth: isWeb ? 800 : '100%',
    alignSelf: 'center',
    width: '100%',
  },
  profileCardWrapper: {
    marginBottom: 35,
  },
  profileCard: {
    borderRadius: 30,
    padding: 25,
    backgroundColor: '#0D0D0D',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 3,
    borderColor: Theme.colors.gold,
  },
  badgeWrapper: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: Theme.colors.gold,
  },
  nameContainer: {
    marginLeft: 20,
    flex: 1,
  },
  userName: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  userRole: {
    color: Theme.colors.gold,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    marginTop: 6,
    textTransform: 'uppercase',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 25,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: 'white',
    fontSize: 20,
    fontWeight: '900',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 35,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: Theme.colors.gold,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginLeft: 5,
    marginBottom: 15,
  },
  menuContainer: {
    backgroundColor: '#0D0D0D',
    borderRadius: 24,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTextContainer: {
    flex: 1,
    marginLeft: 18,
  },
  menuTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  menuSubtitle: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.15)',
    marginTop: 15,
    gap: 12,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  versionText: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 40,
    fontWeight: '600',
    letterSpacing: 1,
  },
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  alertBox: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#0D0D0D',
    borderRadius: 35,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    shadowColor: Theme.colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  alertIconBg: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  alertTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  alertMessage: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 25,
  },
  alertBtn: {
    width: '100%',
    height: 56,
    borderRadius: 18,
    overflow: 'hidden',
  },
  alertBtnGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBtnText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  logoutBtnRow: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 10,
    width: '100%',
  },
  cancelLogoutBtn: {
    flex: 1,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cancelLogoutBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmLogoutBtn: {
    flex: 1,
    height: 56,
    borderRadius: 18,
    overflow: 'hidden',
  },
  confirmLogoutGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmLogoutBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalSub: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  editContainer: {
    backgroundColor: '#0D0D0D',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    padding: 30,
    paddingBottom: 50,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  editHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  editTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  inputSection: {
    marginBottom: 30,
  },
  inputLabel: {
    color: Theme.colors.gold,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 12,
    marginLeft: 5,
  },
  textInput: {
    backgroundColor: '#151515',
    height: 60,
    borderRadius: 18,
    paddingHorizontal: 20,
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  saveButton: {
    height: 64,
    borderRadius: 20,
    overflow: 'hidden',
  },
  saveBtnGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnText: {
    color: 'black',
    fontSize: 18,
    fontWeight: '900',
  },
  dossierSection: {
    marginBottom: 5,
  },
  staticField: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    height: 60,
    borderRadius: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  staticText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 15,
  },
  securityStack: {
    gap: 15,
    marginBottom: 30,
  },
  securityTile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#151515',
    padding: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  securityIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  securityTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  securitySub: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    marginTop: 2,
  },
  itineraryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#151515',
    borderRadius: 25,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  itineraryImg: {
    width: 64,
    height: 64,
    borderRadius: 16,
  },
  itineraryInfo: {
    flex: 1,
    marginLeft: 15,
  },
  itineraryTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  itineraryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  itineraryDate: {
    color: Theme.colors.gold,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  itineraryStatus: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusLabel: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  ledgerEmpty: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  ledgerIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
  },
  ledgerEmptyTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  ledgerEmptySub: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  logoutSection: {
    marginTop: 20,
    alignItems: 'center',
  },
  emptyGallery: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyGalleryText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 14,
    marginTop: 20,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  contactRow: {
    flexDirection: 'row',
    gap: 10,
  },
  contactChip: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#151515',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  contactChipActive: {
    borderColor: GOLD,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
  },
  contactChipText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontWeight: '600',
  },
  contactChipTextActive: {
    color: GOLD,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#151515',
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  uploadPreview: {
    width: 60,
    height: 60,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: GOLD,
  },
  uploadInfo: {
    flex: 1,
    marginLeft: 15,
  },
  uploadText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
  uploadSub: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    marginTop: 2,
  }
});
