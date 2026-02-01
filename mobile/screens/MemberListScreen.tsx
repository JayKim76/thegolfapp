import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Image, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, User, MoreVertical, Plus } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MemberService, Member } from '../services/MemberService';

export default function MemberListScreen({ navigation, route }: any) {
    const { isSelectionMode, index } = route.params || {};

    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('전체'); // '전체', '남자', '여자', '정회원'
    const [isLoading, setIsLoading] = useState(false);
    const [members, setMembers] = useState<Member[]>([]);

    const tabs = ['전체', '남자', '여자', '정회원'];

    const fetchMembers = async () => {
        setIsLoading(true);
        try {
            // In a real app, you would pass filter params here
            const data = await MemberService.getMembers();
            setMembers(data);
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

    // Placeholder for search logic
    useEffect(() => {
        // Implement real search/filter logic here later
    }, [searchQuery, activeTab]);

    const handleDeleteMember = async (id: number) => {
        try {
            await MemberService.deleteMember(id);
            fetchMembers(); // Refresh list
        } catch (error) {
            console.error(error);
            Alert.alert('오류', '회원 삭제 중 문제가 발생했습니다.');
        }
    };

    const confirmDelete = (member: Member) => {
        Alert.alert(
            '회원 삭제',
            `'${member.name}' 회원을 삭제하시겠습니까?`,
            [
                { text: '취소', style: 'cancel' },
                {
                    text: '삭제',
                    style: 'destructive',
                    onPress: () => handleDeleteMember(member.id)
                }
            ]
        );
    };

    const renderMemberItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            onPress={() => isSelectionMode ? handleSelectMember(item) : null}
            activeOpacity={0.7}
            className={`flex-row items-center bg-[#142314] p-4 mb-3 rounded-3xl border ${isSelectionMode ? 'border-[#00FF00]' : 'border-[#2A3C2A]'}`}
        >
            <View className="relative mr-4">
                <View className="w-14 h-14 rounded-full bg-[#1C2A1C] items-center justify-center border-2 border-[#2A3C2A] overflow-hidden">
                    {item.avatar ? (
                        <Image source={{ uri: item.avatar }} className="w-full h-full" />
                    ) : (
                        <User size={28} color="#9CA3AF" />
                    )}
                </View>
                {/* Status Dot */}
                <View className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#142314] ${item.status === 'active' ? 'bg-[#00FF00]' : item.status === 'offline' ? 'bg-gray-400' : 'bg-transparent'}`} />
            </View>

            <View className="flex-1">
                <View className="flex-row items-center gap-2 mb-1">
                    <Text className={`text-lg font-bold ${item.status === 'inactive' ? 'text-gray-500' : 'text-white'}`}>{item.name}</Text>
                    {item.badges && item.badges.map((badge: string, idx: number) => {
                        let badgeBg = 'bg-[#1C2A1C]';
                        let badgeText = 'text-gray-400';
                        if (badge.includes('HDCP')) {
                            badgeBg = 'bg-[#1C5E20]'; badgeText = 'text-[#00FF00]';
                        } else if (badge === 'PRO') {
                            badgeBg = 'bg-[#422006]'; badgeText = 'text-[#FACC15]';
                        }

                        return (
                            <View key={idx} className={`px-2 py-0.5 rounded-md ${badgeBg}`}>
                                <Text className={`text-[10px] font-bold ${badgeText}`}>{badge}</Text>
                            </View>
                        );
                    })}
                </View>
                <Text className="text-gray-400 text-sm">{item.type} {item.intro ? `• ${item.intro}` : ''}</Text>
            </View>

            <TouchableOpacity className="p-2" onPress={() => confirmDelete(item)}>
                <MoreVertical size={20} color="#6B7280" />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-[#0B120B]">
            <SafeAreaView className="flex-1" edges={['top']}>
                {/* Header */}
                <View className="px-6 py-4 flex-row items-center justify-between">
                    <Text className="text-2xl font-bold text-white">회원 목록</Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('AddMember')}
                        className="w-10 h-10 bg-[#00FF00] rounded-full items-center justify-center shadow-lg shadow-green-900/40"
                    >
                        <Plus size={24} color="#0B120B" strokeWidth={3} />
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View className="px-6 mb-2">
                    <View className="bg-[#1C2A1C] rounded-2xl flex-row items-center px-4 h-12 border border-[#2A3C2A]">
                        <Search size={20} color="#9CA3AF" />
                        <TextInput
                            className="flex-1 ml-3 text-base text-white"
                            placeholder="회원 검색 (이름, 핸디캡)"
                            placeholderTextColor="#6B7280"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>

                {/* Filter Tabs */}
                <View className="mb-4">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, gap: 10 }}>
                        {tabs.map((tab) => (
                            <TouchableOpacity
                                key={tab}
                                onPress={() => setActiveTab(tab)}
                                className={`px-5 py-2 rounded-full border ${activeTab === tab ? 'bg-[#00FF00] border-[#00FF00]' : 'bg-[#1C2A1C] border-[#2A3C2A]'}`}
                            >
                                <Text className={`font-bold ${activeTab === tab ? 'text-[#0B120B]' : 'text-gray-400'}`}>{tab}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* List */}
                <FlatList
                    data={members}
                    renderItem={renderMemberItem}
                    keyExtractor={item => item.id.toString()}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
                />
            </SafeAreaView>
        </View>
    );
}
