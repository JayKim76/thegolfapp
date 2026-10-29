import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Alert, TextInput } from 'react-native';
import { Users, UserPlus, Calendar, BarChart2, ClipboardList, Settings, ChevronRight, LogOut, ShieldCheck } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ClubService, ClubStats } from '../services/ClubService';
import { AuthService } from '../services/AuthService';

// Club management screen (the former per-user "MY" tab).
// One club, one admin: club info, member totals, and admin shortcuts.
export default function ProfileScreen() {
    const navigation = useNavigation<any>();
    const [stats, setStats] = useState<ClubStats | null>(null);
    const [isEditingName, setIsEditingName] = useState(false);
    const [clubName, setClubName] = useState('');

    const load = async () => {
        const s = await ClubService.getStats();
        setStats(s);
        if (s) setClubName(s.club.name);
    };

    useFocusEffect(
        useCallback(() => {
            load();
        }, [])
    );

    const handleLogout = () => {
        AuthService.logout();
        navigation.replace('Login');
    };

    const handleSaveName = async () => {
        if (!clubName.trim()) return;
        const updated = await ClubService.updateClub(clubName.trim());
        if (updated) {
            setIsEditingName(false);
            load();
        } else {
            Alert.alert('저장 실패', '모임 이름을 바꾸지 못했습니다. 관리자 로그인 상태를 확인해주세요.');
        }
    };

    const menuItems = [
        { icon: Users, label: '회원 관리 (전체 회원)', desc: '회원 목록·검색·핸디캡 관리', color: '#00FF00', onPress: () => navigation.navigate('MemberList') },
        { icon: UserPlus, label: '회원 등록', desc: '관리자가 새 회원을 직접 등록', color: '#00FF00', onPress: () => navigation.navigate('AddMember') },
        { icon: Calendar, label: '일정·조편성 관리', desc: '라운드 일정과 조편성 결과', color: '#F59E0B', onPress: () => navigation.navigate('MainTabs', { screen: 'Schedule' }) },
        { icon: ClipboardList, label: '스코어 관리', desc: '전체 회원 스코어 입력·조회', color: '#00FF00', onPress: () => navigation.navigate('ScoreList') },
        { icon: BarChart2, label: '모임 통계', desc: '회원별 평균·최고 스코어와 추이', color: '#9CA3AF', onPress: () => navigation.navigate('Statistics') },
    ];

    return (
        <View className="flex-1 bg-[#0B120B]">
            <View className="bg-[#0B120B] pt-12 pb-10 px-6 rounded-b-[32px] border-b border-[#1C2A1C] z-10 items-center shadow-lg shadow-[#00FF00]/10">
                <StatusBar barStyle="light-content" />
                <View className="w-24 h-24 bg-[#142314] rounded-full border-4 border-[#00FF00] mb-4 items-center justify-center shadow-[0_0_15px_rgba(0,255,0,0.3)]">
                    <ShieldCheck size={40} color="#00FF00" />
                </View>

                {isEditingName ? (
                    <View className="flex-row items-center gap-2 mb-1">
                        <TextInput
                            value={clubName}
                            onChangeText={setClubName}
                            className="bg-[#1C2A1C] text-white font-bold text-lg px-4 py-2 rounded-xl border border-[#2A3E2A] min-w-[180px] text-center"
                        />
                        <TouchableOpacity onPress={handleSaveName} className="bg-[#00FF00] px-3 py-2 rounded-xl">
                            <Text className="text-black font-bold">저장</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity onPress={() => setIsEditingName(true)}>
                        <Text className="text-2xl font-bold text-white mb-1">{stats?.club.name || '모임 정보를 불러오는 중'}</Text>
                    </TouchableOpacity>
                )}
                <Text className="text-[#00FF00] font-medium bg-[#1C2A1C] px-3 py-1 rounded-full text-sm border border-[#2A3E2A]">관리자 모드 · 이름을 누르면 모임명 수정</Text>

                <View className="flex-row gap-8 mt-8 w-full justify-center">
                    <View className="items-center">
                        <Text className="text-white font-bold text-xl">{stats?.members.total ?? '-'}</Text>
                        <Text className="text-gray-400 text-xs mt-1">전체 회원</Text>
                    </View>
                    <View className="items-center">
                        <Text className="text-white font-bold text-xl">{stats?.members.avgHandicap ?? '-'}</Text>
                        <Text className="text-gray-400 text-xs mt-1">평균 핸디캡</Text>
                    </View>
                    <View className="items-center">
                        <Text className="text-white font-bold text-xl">{stats?.schedules.total ?? '-'}</Text>
                        <Text className="text-gray-400 text-xs mt-1">등록된 일정</Text>
                    </View>
                </View>
                {stats?.members.topMember && (
                    <Text className="text-gray-400 text-xs mt-4">
                        최저 핸디캡: {stats.members.topMember.name} ({stats.members.topMember.handicap})
                    </Text>
                )}
            </View>

            <ScrollView className="flex-1 px-6 -mt-6" showsVerticalScrollIndicator={false}>
                <View className="bg-[#142314] rounded-3xl p-2 shadow-lg border border-[#2A3E2A] mb-8">
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={item.onPress}
                            className={`flex-row items-center justify-between p-4 ${index !== menuItems.length - 1 ? 'border-b border-[#2A3E2A]' : ''}`}
                        >
                            <View className="flex-row items-center gap-4">
                                <View className="w-10 h-10 rounded-xl items-center justify-center bg-[#1C2A1C] border border-[#2A3E2A]">
                                    <item.icon size={20} color={item.color} />
                                </View>
                                <View>
                                    <Text className="font-bold text-white text-base">{item.label}</Text>
                                    <Text className="text-gray-500 text-xs">{item.desc}</Text>
                                </View>
                            </View>
                            <ChevronRight size={20} color="#2A3E2A" />
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity
                    onPress={handleLogout}
                    className="flex-row items-center justify-center gap-2 mb-12 p-4"
                >
                    <LogOut size={20} color="#EF4444" />
                    <Text className="text-red-500 font-bold">관리자 로그아웃</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
