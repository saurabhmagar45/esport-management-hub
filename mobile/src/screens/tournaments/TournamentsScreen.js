import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Search, Trophy, Filter, Gamepad2 } from 'lucide-react-native';
import { COLORS } from '../../constants/theme';
import { Header } from '../../components/common/Header';
import { TournamentCard } from '../../components/tournaments/TournamentCard';
import { tournamentsAPI } from '../../api/tournaments';

const GAME_TABS = ['ALL', 'BGMI', 'FREE FIRE', 'VALORANT'];

export const TournamentsScreen = ({ navigation }) => {
  const [tournaments, setTournaments] = useState([]);
  const [filteredTournaments, setFilteredTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTournaments = async () => {
    try {
      const res = await tournamentsAPI.list();
      if (res.data && res.data.success) {
        const list = res.data.tournaments || [];
        setTournaments(list);
        filterList(list, activeTab, searchQuery);
      }
    } catch (err) {
      console.log('Error fetching tournament list:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  const filterList = (list, tab, query) => {
    let result = [...list];
    if (tab !== 'ALL') {
      result = result.filter(
        (t) => (t.game || '').toUpperCase().includes(tab)
      );
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (t) =>
          (t.name || '').toLowerCase().includes(q) ||
          (t.game || '').toLowerCase().includes(q)
      );
    }
    setFilteredTournaments(result);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    filterList(tournaments, tab, searchQuery);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    filterList(tournaments, activeTab, text);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTournaments();
  };

  return (
    <View style={styles.container}>
      <Header />

      {/* Search Bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Search size={16} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tournament or game..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      {/* Game Filter Tabs */}
      <View style={styles.tabBar}>
        {GAME_TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
            onPress={() => handleTabChange(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tournament FlatList */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.centerText}>Loading competitive tournaments...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTournaments}
          keyExtractor={(item) => item._id || item.id || String(Math.random())}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
            />
          }
          renderItem={({ item }) => (
            <TournamentCard
              tournament={item}
              onPress={(selected) =>
                navigation.navigate('TournamentDetail', { tournament: selected })
              }
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Gamepad2 size={44} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>No Tournaments Found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? 'No results matched your search query.'
                  : 'No active tournaments in this category currently.'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchRow: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 13,
    height: '100%',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  tabBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  centerText: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 12,
    marginBottom: 6,
  },
  emptySubtitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
  },
});
