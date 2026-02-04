import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, FlatList, ActivityIndicator, Image, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Search, Calendar, Filter, X, ChevronDown } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { RoundService, Round } from '../services/RoundService';
import { LinearGradient } from 'expo-linear-gradient';

interface ScoreRecord {
    id: string; // Composite ID
    roundId: number;
    date: string;
    courseName: string;
    playerName: string;
    score: number;
    diff?: number;
    memberId?: number;
}

export default function ScoreListScreen() {
    const navigation = useNavigation<any>();
    const [allScores, setAllScores] = useState<ScoreRecord[]>([]);
    const [filteredScores, setFilteredScores] = useState<ScoreRecord[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilterModal, setShowFilterModal] = useState(false);

    // Date Range (Simple text input for now, format: YYYY-MM-DD)
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        fetchScores();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [searchQuery, startDate, endDate, allScores]);

    const fetchScores = async () => {
        setIsLoading(true);
        try {
            const rounds = await RoundService.getRounds();
            // Flatten rounds into valid score records
            const flattened: ScoreRecord[] = [];
            rounds.forEach(r => {
                r.players.forEach((p, idx) => {
                    flattened.push({
                        id: `${r.id}-${idx}`,
                        roundId: r.id,
                        date: r.date,
                        courseName: r.courseName,
                        playerName: p.name,
                        score: p.score,
                        diff: p.diff,
                        memberId: p.memberId
                    });
                });
            });

            // Sort by date descending
            flattened.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            setAllScores(flattened);
            setFilteredScores(flattened);
        } catch (error) {
            console.error('Failed to fetch scores:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const applyFilters = () => {
        let result = [...allScores];

        // 1. Name Filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            result = result.filter(item => item.playerName.toLowerCase().includes(query));
        }

        // 2. Date Range Filter
        if (startDate.trim()) {
            result = result.filter(item => item.date >= startDate.trim());
        }
        if (endDate.trim()) {
            result = result.filter(item => item.date <= endDate.trim());
        }

        setFilteredScores(result);
    };

    const clearFilters = () => {
        setSearchQuery('');
        setStartDate('');
        setEndDate('');
        setShowFilterModal(false);
    };

    return (
        <View className="flex-1 bg-[#0B120B]">
            <SafeAreaView className="flex-1" edges={['top']}>
                {/* Header */}
                <View className="px-6 py-4 flex-row items-center border-b border-[#1C2A1C]">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                        <ArrowLeft size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-white flex-1">스코어 조회</Text>
                    <TouchableOpacity
                        onPress={() => setShowFilterModal(true)}
                        className={`p-2 rounded-lg ${startDate || endDate ? 'bg-[#00FF00]/20' : 'bg-[#1C2A1C]'}`}
                    >
                        <Filter size={20} color={startDate || endDate ? '#00FF00' : 'white'} />
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View className="px-6 py-4">
                    <View className="flex-row items-center bg-[#142314] rounded-xl px-4 py-3 border border-[#2A3E2A]">
                        <Search size={20} color="#9CA3AF" />
                        <TextInput
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder="회원 이름 검색..."
                            placeholderTextColor="#6B7280"
                            className="flex-1 ml-3 text-white text-base"
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <X size={18} color="#9CA3AF" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Active Filters Filters Chips */}
                {(startDate || endDate) && (
                    <View className="px-6 pb-2 flex-row flex-wrap gap-2">
                        <View className="flex-row items-center bg-[#1C2A1C] px-3 py-1 rounded-full border border-[#2A3E2A]">
                            <Text className="text-[#00FF00] text-xs mr-2">
                                {startDate || '시작일'} ~ {endDate || '종료일'}
                            </Text>
                            <TouchableOpacity onPress={() => { setStartDate(''); setEndDate(''); }}>
                                <X size={14} color="#00FF00" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Content */}
                {isLoading ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color="#00FF00" />
                    </View>
                ) : (
                    <FlatList
                        data={filteredScores}
                        keyExtractor={item => item.id}
                        contentContainerStyle={{ padding: 24, paddingTop: 8 }}
                        renderItem={({ item }) => (
                            <View className="bg-[#142314] mb-4 rounded-2xl p-4 border border-[#2A3E2A]">
                                <View className="flex-row justify-between items-start mb-3">
                                    <View>
                                        <Text className="text-gray-400 text-xs mb-1">{item.date}</Text>
                                        <Text className="text-white font-bold text-lg">{item.courseName}</Text>
                                    </View>
                                    <View className={`px-3 py-1 rounded-lg ${item.score < 80 ? 'bg-[#00FF00]/20' : 'bg-[#2A3E2A]'}`}>
                                        <Text className={`font-bold ${item.score < 80 ? 'text-[#00FF00]' : 'text-white'}`}>
                                            {item.score}타
                                        </Text>
                                    </View>
                                </View>

                                <View className="h-[1px] bg-[#2A3E2A] my-2" />

                                <View className="flex-row items-center justify-between">
                                    <View className="flex-row items-center">
                                        <View className="w-8 h-8 rounded-full bg-gray-700 items-center justify-center mr-2 border border-[#2A3E2A]">
                                            <Text className="text-white text-xs font-bold">{item.playerName[0]}</Text>
                                        </View>
                                        <Text className="text-white font-medium">{item.playerName}</Text>
                                    </View>
                                    {item.diff !== undefined && (
                                        <Text className={`text-xs ${item.diff > 0 ? 'text-[#ff6b6b]' : 'text-[#00FF00]'}`}>
                                            {item.diff > 0 ? `+${item.diff}` : item.diff}
                                        </Text>
                                    )}
                                </View>
                            </View>
                        )}
                        ListEmptyComponent={
                            <View className="items-center justify-center py-20">
                                <Text className="text-gray-500">검색 결과가 없습니다.</Text>
                            </View>
                        }
                    />
                )}

                {/* Filter Modal */}
                <Modal
                    visible={showFilterModal}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setShowFilterModal(false)}
                >
                    <View className="flex-1 justify-end bg-black/50">
                        <View className="bg-[#1C2A1C] rounded-t-3xl p-6 border-t border-[#2A3E2A]">
                            <View className="flex-row justify-between items-center mb-6">
                                <Text className="text-white text-xl font-bold">기간 설정</Text>
                                <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                                    <X size={24} color="gray" />
                                </TouchableOpacity>
                            </View>

                            <View className="flex-row gap-4 mb-8">
                                <View className="flex-1">
                                    <Text className="text-gray-400 text-xs mb-2">시작일 (YYYY-MM-DD)</Text>
                                    <TextInput
                                        value={startDate}
                                        onChangeText={setStartDate}
                                        placeholder="2023-01-01"
                                        placeholderTextColor="#4B5563"
                                        className="bg-[#0B120B] text-white p-4 rounded-xl border border-[#2A3E2A]"
                                        keyboardType="numbers-and-punctuation"
                                    />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-gray-400 text-xs mb-2">종료일 (YYYY-MM-DD)</Text>
                                    <TextInput
                                        value={endDate}
                                        onChangeText={setEndDate}
                                        placeholder="2023-12-31"
                                        placeholderTextColor="#4B5563"
                                        className="bg-[#0B120B] text-white p-4 rounded-xl border border-[#2A3E2A]"
                                        keyboardType="numbers-and-punctuation"
                                    />
                                </View>
                            </View>

                            <View className="flex-row gap-3">
                                <TouchableOpacity
                                    onPress={clearFilters}
                                    className="flex-1 bg-[#2A3E2A] p-4 rounded-xl items-center"
                                >
                                    <Text className="text-white font-bold">초기화</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => setShowFilterModal(false)}
                                    className="flex-1 bg-[#00FF00] p-4 rounded-xl items-center"
                                >
                                    <Text className="text-[#0B120B] font-bold">적용하기</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

            </SafeAreaView>
        </View>
    );
}
