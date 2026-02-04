import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Image, Switch, Alert, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Search, SlidersHorizontal, Settings, RefreshCw, Check, User, Save, X, ArrowLeft } from 'lucide-react-native';
import Slider from '@react-native-community/slider';
import { MemberService, Member } from '../services/MemberService';
import { GroupService, Group } from '../services/GroupService';

export default function GroupFormationScreen({ route }: any) {
    const navigation = useNavigation<any>();
    const { courseName } = route.params || {};

    const [searchQuery, setSearchQuery] = useState('');
    const [roundDate, setRoundDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
    const [roundTime, setRoundTime] = useState('07:00'); // HH:mm
    const [balancingMode, setBalancingMode] = useState<'equal' | 'random' | 'handicap'>('equal');
    const [separateGender, setSeparateGender] = useState(false);
    const [balancingCriteria, setBalancingCriteria] = useState<'avg' | 'sum'>('avg');
    const [maxDiff, setMaxDiff] = useState(3.0);
    const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);

    const [allMembers, setAllMembers] = useState<Member[]>([]);
    const [selectedMemberIds, setSelectedMemberIds] = useState<Set<number>>(new Set());
    const [isLoading, setIsLoading] = useState(false);

    // Results Modal
    const [showResults, setShowResults] = useState(false);
    const [formedGroups, setFormedGroups] = useState<Group[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    const fetchMembers = async () => {
        setIsLoading(true);
        try {
            const data = await MemberService.getMembers();
            setAllMembers(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchMembers();
        }, [])
    );

    const toggleSelection = (id: number) => {
        const newSet = new Set(selectedMemberIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedMemberIds(newSet);
    };

    const selectAll = () => {
        if (selectedMemberIds.size === filteredMembers.length) {
            setSelectedMemberIds(new Set());
        } else {
            const newSet = new Set(filteredMembers.map(m => m.id));
            setSelectedMemberIds(newSet);
        }
    };

    const filteredMembers = allMembers.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.handicap && m.handicap.toString().includes(searchQuery))
    );

    // --- ALGORITHM START ---
    const runAutoGrouping = () => {
        const selected = allMembers.filter(m => selectedMemberIds.has(m.id));
        if (selected.length < 2) {
            Alert.alert('알림', '최소 2명 이상의 회원을 선택해주세요.');
            return;
        }

        let pools: Member[][] = [];

        if (separateGender) {
            const males = selected.filter(m => m.gender !== 'female');
            const females = selected.filter(m => m.gender === 'female');
            if (males.length > 0) pools.push(males);
            if (females.length > 0) pools.push(females);
        } else {
            pools.push(selected);
        }

        let finalGroups: Group[] = [];
        let groupIndex = 0;
        const groupNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

        pools.forEach(pool => {
            let processedPool = [...pool];

            if (balancingMode === 'random') {
                // Fisher-Yates Shuffle
                for (let i = processedPool.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [processedPool[i], processedPool[j]] = [processedPool[j], processedPool[i]];
                }
            } else if (balancingMode === 'handicap') {
                // Sort by Handicap Ascending (Low to High - Best players first)
                processedPool.sort((a, b) => a.handicap - b.handicap);
            } else {
                // Equal Balancing: Sort Descending initially (often helps with snake draft)
                // Or just standard Ascending. Let's stick to Ascending for consistency
                processedPool.sort((a, b) => a.handicap - b.handicap);
            }

            // Chunk into groups of 4 (or less if remainder)
            const numGroups = Math.ceil(processedPool.length / 4);
            const tempGroups: Member[][] = Array.from({ length: numGroups }, () => []);

            if (balancingMode === 'equal') {
                // Snake / Modulo Distribution for Balance
                processedPool.forEach((member, idx) => {
                    const cycle = Math.floor(idx / numGroups);
                    const isEvenCycle = cycle % 2 === 0;
                    const targetGroupIndex = isEvenCycle
                        ? (idx % numGroups)
                        : (numGroups - 1 - (idx % numGroups));

                    tempGroups[targetGroupIndex].push(member);
                });
            } else {
                // Sequential chunking for Random (since it's already shuffled)
                // AND for Handicap Order (since it's sorted)
                processedPool.forEach((member, idx) => {
                    const targetGroupIndex = Math.floor(idx / 4);
                    tempGroups[targetGroupIndex].push(member);
                });
            }

            // Convert to Group objects
            tempGroups.forEach(members => {
                if (members.length === 0) return;
                const totalHcp = members.reduce((sum, m) => sum + m.handicap, 0);
                finalGroups.push({
                    id: groupIndex,
                    name: `${groupNames[groupIndex % groupNames.length]}조`,
                    members,
                    totalHandicap: totalHcp,
                    avgHandicap: parseFloat((totalHcp / members.length).toFixed(1))
                });
                groupIndex++;
            });
        });

        setFormedGroups(finalGroups);
        setShowResults(true);
    };
    // --- ALGORITHM END ---

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await GroupService.saveFormation(formedGroups, roundDate, courseName, roundTime);
            Alert.alert('저장 완료', '조편성 결과가 저장되었습니다.');
            setShowResults(false);
            navigation.navigate('MainTabs', { screen: 'Schedule' }); // Navigate to Schedule to see the result
        } catch (error) {
            console.error(error);
            Alert.alert('오류', '저장 중 문제가 발생했습니다.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-[#0B120B]" edges={['top', 'left', 'right']}>
            {/* Header */}
            <View className="flex-row items-center justify-between px-6 py-4">
                <View className="flex-row items-center gap-4">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 items-center justify-center rounded-full bg-[#1C2A1C]">
                        <ArrowLeft size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-2xl font-bold text-white">조편성</Text>
                </View>
                <View className="flex-row items-center gap-4">
                    <TouchableOpacity onPress={fetchMembers}>
                        <RefreshCw size={24} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setIsSettingsExpanded(!isSettingsExpanded)}>
                        <Settings size={24} color={isSettingsExpanded ? "#00FF00" : "white"} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Date & Time Selection */}
            <View className="px-6 mb-4 flex-row gap-2">
                <View className="flex-1">
                    <Text className="text-gray-400 font-bold mb-2">날짜 (YYYY-MM-DD)</Text>
                    <View className="bg-[#1C2A1C] rounded-xl px-4 py-3 border border-[#2A3C2A]">
                        <TextInput
                            className="text-white text-base font-bold"
                            value={roundDate}
                            onChangeText={setRoundDate}
                            placeholder="2024-01-01"
                            placeholderTextColor="#6B7280"
                        />
                    </View>
                </View>
                <View className="flex-1">
                    <Text className="text-gray-400 font-bold mb-2">시간 (HH:mm)</Text>
                    <View className="bg-[#1C2A1C] rounded-xl px-4 py-3 border border-[#2A3C2A]">
                        <TextInput
                            className="text-white text-base font-bold"
                            value={roundTime}
                            onChangeText={setRoundTime}
                            placeholder="07:00"
                            placeholderTextColor="#6B7280"
                        />
                    </View>
                </View>
            </View>

            {/* Search Bar */}
            <View className="px-6 mb-4">
                <View className="flex-row items-center bg-[#1C2A1C] rounded-xl px-4 py-3 border border-[#2A3C2A]">
                    <Search size={20} color="#9CA3AF" />
                    <TextInput
                        className="flex-1 ml-3 text-white text-base"
                        placeholder="회원 검색 (이름, 핸디캡)"
                        placeholderTextColor="#6B7280"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 120 }}>
                {/* Mode Toggles (3 Options) */}
                <View className="flex-row px-6 mb-4">
                    <TouchableOpacity
                        onPress={() => setBalancingMode('equal')}
                        className={`flex-1 py-3 items-center justify-center rounded-l-xl border-y border-l ${balancingMode === 'equal' ? 'bg-[#1C5E20] border-[#1C5E20]' : 'bg-[#1C2A1C] border-[#2A3C2A]'}`}
                    >
                        <Text className={`font-bold text-xs ${balancingMode === 'equal' ? 'text-white' : 'text-gray-400'}`}>균등 배정</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setBalancingMode('handicap')}
                        className={`flex-1 py-3 items-center justify-center border-y border-x ${balancingMode === 'handicap' ? 'bg-[#1C5E20] border-[#1C5E20]' : 'bg-[#1C2A1C] border-[#2A3C2A]'}`}
                    >
                        <Text className={`font-bold text-xs ${balancingMode === 'handicap' ? 'text-white' : 'text-gray-400'}`}>핸디캡 순</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setBalancingMode('random')}
                        className={`flex-1 py-3 items-center justify-center rounded-r-xl border-y border-r ${balancingMode === 'random' ? 'bg-[#1C5E20] border-[#1C5E20]' : 'bg-[#1C2A1C] border-[#2A3C2A]'}`}
                    >
                        <Text className={`font-bold text-xs ${balancingMode === 'random' ? 'text-white' : 'text-gray-400'}`}>무작위</Text>
                    </TouchableOpacity>
                </View>

                {/* Advanced Settings (Collapsible) */}
                {isSettingsExpanded && (
                    <View className="mx-6 bg-[#142314] rounded-2xl p-5 border border-[#2A3C2A] mb-6">
                        <View className="flex-row items-center gap-2 mb-4">
                            <SlidersHorizontal size={20} color="#00FF00" />
                            <Text className="text-white font-bold text-lg">상세 옵션</Text>
                        </View>

                        <View className="flex-row justify-between items-center">
                            <Text className="text-gray-300 text-base">남/여 구분 배정</Text>
                            <Switch
                                value={separateGender}
                                onValueChange={setSeparateGender}
                                trackColor={{ false: '#374151', true: '#00FF00' }}
                                thumbColor={'#ffffff'}
                            />
                        </View>
                    </View>
                )}

                {/* Member List Header */}
                <View className="flex-row items-center justify-between px-6 mb-4">
                    <Text className="text-gray-400 font-bold">참석 가능 회원 ({selectedMemberIds.size}명)</Text>
                    <TouchableOpacity onPress={selectAll}>
                        <Text className="text-[#00FF00] font-bold">
                            {selectedMemberIds.size === filteredMembers.length ? '선택 해제' : '모두 선택'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Members List */}
                <View className="px-6 gap-3">
                    {isLoading ? (
                        <ActivityIndicator color="#00FF00" />
                    ) : filteredMembers.map((member) => (
                        <TouchableOpacity
                            key={member.id}
                            onPress={() => toggleSelection(member.id)}
                            className={`flex-row items-center p-4 rounded-2xl border ${selectedMemberIds.has(member.id) ? 'bg-[#142314] border-[#1C5E20]' : 'bg-[#142314]/50 border-[#2A3C2A]'}`}
                        >
                            <View className="relative">
                                <View className="w-12 h-12 rounded-full bg-gray-700 items-center justify-center border-2 border-[#2A3C2A] overflow-hidden">
                                    {member.profileImage ? (
                                        <Image source={{ uri: member.profileImage }} className="w-full h-full" />
                                    ) : (
                                        <User size={24} color="#9CA3AF" />
                                    )}
                                </View>
                                <View className="absolute -bottom-1 -right-1 bg-[#2A3C2A] px-1.5 py-0.5 rounded-full border border-[#0B120B]">
                                    <Text className="text-[10px] text-white font-bold">Hcp {member.handicap}</Text>
                                </View>
                            </View>

                            <View className="flex-1 ml-4">
                                <View className="flex-row items-center gap-2">
                                    <Text className="text-white font-bold text-lg">{member.name}</Text>
                                    <View className={`px-1.5 py-0.5 rounded ${member.gender === 'female' ? 'bg-pink-900/50' : 'bg-blue-900/50'}`}>
                                        <Text className={`text-[10px] ${member.gender === 'female' ? 'text-pink-400' : 'text-blue-400'}`}>
                                            {member.gender === 'female' ? '여' : '남'}
                                        </Text>
                                    </View>
                                </View>
                                <Text className="text-gray-400 text-sm">{member.type}</Text>
                            </View>

                            <View className={`w-8 h-8 rounded-lg items-center justify-center border ${selectedMemberIds.has(member.id) ? 'bg-[#00FF00] border-[#00FF00]' : 'bg-transparent border-gray-600'}`}>
                                {selectedMemberIds.has(member.id) && <Check size={20} color="#0B120B" strokeWidth={3} />}
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* Bottom Action Footer */}
            <View className="absolute bottom-0 left-0 right-0 bg-[#0B120B]/95 p-6 border-t border-[#1C2A1C]">
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-white font-bold text-lg">
                        {selectedMemberIds.size}명 선택됨
                        <Text className="text-gray-500 text-sm font-normal"> ({Math.ceil(selectedMemberIds.size / 4)}개 조 예상)</Text>
                    </Text>
                    <TouchableOpacity onPress={() => setSelectedMemberIds(new Set())}>
                        <Text className="text-gray-400 underline decoration-gray-500">초기화</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity
                    className="w-full bg-[#00FF00] py-4 rounded-2xl items-center flex-row justify-center gap-2 shadow-lg shadow-green-900/50"
                    onPress={runAutoGrouping}
                >
                    <RefreshCw size={20} color="#0B120B" strokeWidth={2.5} />
                    <Text className="text-[#0B120B] font-bold text-lg">자동 편성 시작</Text>
                </TouchableOpacity>
            </View>

            {/* Result Modal */}
            <Modal visible={showResults} animationType="slide" presentationStyle="pageSheet">
                <View className="flex-1 bg-[#0B120B]">
                    <SafeAreaView className="flex-1">
                        <View className="flex-row items-center justify-between px-6 py-4 border-b border-[#2A3C2A]">
                            <Text className="text-xl font-bold text-white">편성 결과</Text>
                            <TouchableOpacity onPress={() => setShowResults(false)}>
                                <X size={24} color="white" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView className="flex-1 px-6 pt-6">
                            {formedGroups.map((group) => (
                                <View key={group.id} className="bg-[#142314] rounded-2xl p-5 mb-4 border border-[#2A3C2A]">
                                    <View className="flex-row justify-between items-center mb-4">
                                        <Text className="text-[#00FF00] font-bold text-lg">{group.name}</Text>
                                        <Text className="text-gray-400 text-sm">Avg Hcp: {group.avgHandicap}</Text>
                                    </View>
                                    <View className="gap-3">
                                        {group.members.map((m) => (
                                            <View key={m.id} className="flex-row items-center justify-between bg-[#0B120B] p-3 rounded-xl">
                                                <View className="flex-row items-center gap-3">
                                                    <View className="w-8 h-8 rounded-full bg-gray-700 items-center justify-center">
                                                        {m.profileImage ? (
                                                            <Image source={{ uri: m.profileImage }} className="w-full h-full rounded-full" />
                                                        ) : (
                                                            <User size={16} color="#9CA3AF" />
                                                        )}
                                                    </View>
                                                    <Text className="text-white font-bold">{m.name}</Text>
                                                </View>
                                                <View className="flex-row items-center gap-2">
                                                    <View className={`px-1.5 py-0.5 rounded ${m.gender === 'female' ? 'bg-pink-900/50' : 'bg-blue-900/50'}`}>
                                                        <Text className={`text-[10px] ${m.gender === 'female' ? 'text-pink-400' : 'text-blue-400'}`}>
                                                            {m.gender === 'female' ? '여' : '남'}
                                                        </Text>
                                                    </View>
                                                    <Text className="text-[#00FF00] font-bold w-8 text-right">{m.handicap}</Text>
                                                </View>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            ))}
                            <View className="h-24" />
                        </ScrollView>

                        <View className="p-6 border-t border-[#1C2A1C]">
                            <TouchableOpacity
                                className="w-full bg-[#00FF00] py-4 rounded-2xl items-center flex-row justify-center gap-2"
                                onPress={handleSave}
                                disabled={isSaving}
                            >
                                {isSaving ? <ActivityIndicator color="#0B120B" /> : <Save size={20} color="#0B120B" strokeWidth={2.5} />}
                                <Text className="text-[#0B120B] font-bold text-lg">결과 저장 및 완료</Text>
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </View>
            </Modal>
        </SafeAreaView >
    );
}
