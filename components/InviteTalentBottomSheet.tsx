import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
    FlatList,
    Image,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BG = '#F5F3F0';

type Talent = {
  id: string;
  name: string;
  categories: string[];
  avatar: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
};

const InviteTalentBottomSheet: React.FC<Props> = ({ visible, onClose }) => {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');

  // Dummy data for talents
  const dummyTalents: Talent[] = [
    { id: '1', name: 'Marcus Lee', categories: ['Wrestling'], avatar: 'https://i.pravatar.cc/100?img=1' },
    { id: '2', name: 'Krishhelle Diaz', categories: ['Boxing', 'MMA'], avatar: 'https://i.pravatar.cc/100?img=2' },
    { id: '3', name: 'Alex Johnson', categories: ['Boxing'], avatar: 'https://i.pravatar.cc/100?img=3' },
    { id: '4', name: 'Sarah Chen', categories: ['MMA', 'Jiu-Jitsu'], avatar: 'https://i.pravatar.cc/100?img=4' },
    { id: '5', name: 'Mike Rodriguez', categories: ['Wrestling', 'Boxing'], avatar: 'https://i.pravatar.cc/100?img=5' },
    { id: '6', name: 'Emma Wilson', categories: ['MMA'], avatar: 'https://i.pravatar.cc/100?img=6' },
  ];

  // Filter talents based on search query
  const filteredTalents = useMemo(() => {
    if (!searchQuery.trim()) {
      return dummyTalents;
    }

    const query = searchQuery.toLowerCase();
    return dummyTalents.filter(talent => 
      talent.name.toLowerCase().includes(query) ||
      talent.categories.some(category => 
        category.toLowerCase().includes(query)
      )
    );
  }, [searchQuery]);

  const handleSendInvite = (talent: Talent) => {
    console.log("Invited talent:", talent.name);
    // TODO: Implement actual invite logic
  };

  const renderTalentCard = ({ item }: { item: Talent }) => (
    <View style={styles.talentCard}>
      <Image source={{ uri: item.avatar }} style={styles.talentAvatar} />
      <View style={styles.talentInfo}>
        <Text style={styles.talentName}>{item.name}</Text>
        <Text style={styles.talentCategories}>
          {item.categories.join(', ')}
        </Text>
      </View>
      <Pressable 
        style={styles.inviteBtn}
        onPress={() => handleSendInvite(item)}
      >
        <Text style={styles.inviteText}>Send Invite</Text>
      </Pressable>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.sheet, { paddingBottom: insets.bottom }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Invite Talent</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#111" />
            </Pressable>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or category"
              placeholderTextColor="#6B7280"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Talents List */}
          <FlatList
            data={filteredTalents}
            keyExtractor={(item) => item.id}
            renderItem={renderTalentCard}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={48} color="#9CA3AF" />
                <Text style={styles.emptyStateTitle}>No talents found</Text>
                <Text style={styles.emptyStateSubtitle}>
                  Try adjusting your search terms
                </Text>
              </View>
            )}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: BG,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: '50%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
  },
  closeBtn: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginVertical: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#111',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  talentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
  },
  talentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  talentInfo: {
    flex: 1,
  },
  talentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  talentCategories: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  inviteBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#111',
  },
  inviteText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
    marginTop: 16,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default InviteTalentBottomSheet;
