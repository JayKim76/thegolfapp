import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { Bell, Edit, Users, Map, BarChart2, Plus, ArrowRight, Calendar, List, User } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScheduleService, Schedule } from '../services/ScheduleService';

export default function HomeScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const username = route.params?.username || '김민수';

    const [upcomingSchedule, setUpcomingSchedule] = useState<Schedule | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Custom Colors
    const darkBackground = '#0B120B';
    const neonGreen = '#00FF00';
    const cardBg = '#142314';

    const fetchUpcomingSchedule = async () => {
        setIsLoading(true);
        try {
            const allSchedules = await ScheduleService.getSchedules();
            // Filter only future schedules
            const now = new Date();
            const futureSchedules = allSchedules.filter(s => {
                const scheduleDate = new Date(`${s.date}T${s.time || '00:00'}`);
                return scheduleDate >= now;
            });

            // Sort by date/time ascending
            futureSchedules.sort((a, b) => {
                const dateA = new Date(`${a.date}T${a.time || '00:00'}`).getTime();
                const dateB = new Date(`${b.date}T${b.time || '00:00'}`).getTime();
                return dateA - dateB;
            });

            if (futureSchedules.length > 0) {
                setUpcomingSchedule(futureSchedules[0]);
            } else {
                setUpcomingSchedule(null);
            }
        } catch (error) {
            console.error('Failed to fetch upcoming schedule:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchUpcomingSchedule();
        }, [])
    );

    const handleLogout = () => {
        navigation.replace('Login');
    };

    return (
        <View className="flex-1" style={{ backgroundColor: darkBackground }}>
            <SafeAreaView edges={['top']} className="flex-1">
                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

                    {/* Header */}
                    <View className="px-6 pt-2 pb-6 flex-row justify-between items-center">
                        <View className="flex-row items-center gap-3">
                            <View className="w-12 h-12 rounded-full border-2 border-[#00FF00] p-0.5">
                                <Image
                                    source={{ uri: "https://randomuser.me/api/portraits/men/32.jpg" }}
                                    className="w-full h-full rounded-full"
                                />
                                <View className="absolute bottom-0 right-0 w-3 h-3 bg-[#00FF00] rounded-full border border-[#0B120B]" />
                            </View>
                            <View>
                                <Text className="text-white text-lg font-bold">안녕하세요, {username}님</Text>
                                <Text className="text-[#00FF00] text-xs font-medium">Gold Member</Text>
                            </View>
                        </View>
                        <TouchableOpacity className="w-10 h-10 bg-[#1A2E1A] rounded-full items-center justify-center">
                            <Bell size={20} color="white" />
                        </TouchableOpacity>
                    </View>

                    {/* Stats Cards Row 1 */}
                    <View className="flex-row px-6 gap-4 mb-4">
                        {/* Handicap Card */}
                        <View className="flex-1 bg-[#142314] rounded-2xl p-4 border border-[#2A3E2A]">
                            <View className="flex-row items-center gap-2 mb-2">
                                <View className="w-2 h-2 rounded-full bg-[#00FF00]" />
                                <Text className="text-gray-400 text-xs">핸디캡</Text>
                            </View>
                            <Text className="text-white text-3xl font-extrabold">12</Text>
                            <Text className="text-gray-500 text-xs mt-1">상위 15%</Text>
                        </View>

                        {/* Best Score Card */}
                        <View className="flex-1 bg-[#142314] rounded-2xl p-4 border border-[#2A3E2A]">
                            <View className="flex-row items-center gap-2 mb-2">
                                <View className="w-2 h-2 rounded-full bg-[#00FF00]" />
                                <Text className="text-gray-400 text-xs">최고 점수</Text>
                            </View>
                            <Text className="text-white text-3xl font-extrabold">78</Text>
                            <Text className="text-[#00FF00] text-xs mt-1 font-bold">New Record!</Text>
                        </View>
                    </View>

                    {/* Avg Score Card Row 2 */}
                    <View className="px-6 mb-8">
                        <View className="bg-[#142314] rounded-2xl p-4 border border-[#2A3E2A] flex-row justify-between items-center">
                            <View>
                                <Text className="text-gray-400 text-xs mb-1">평균 스코어 (최근 5경기)</Text>
                                <View className="flex-row items-baseline gap-2">
                                    <Text className="text-white text-3xl font-extrabold">82.4</Text>
                                    <Text className="text-[#00FF00] text-xs font-medium">▼ -1.5%</Text>
                                </View>
                            </View>
                            {/* Simple Bar Chart Visualization */}
                            <View className="flex-row items-end gap-1.5 h-10">
                                <View className="w-3 h-4 bg-gray-600 rounded-sm" />
                                <View className="w-3 h-6 bg-gray-500 rounded-sm" />
                                <View className="w-3 h-5 bg-gray-600 rounded-sm" />
                                <View className="w-3 h-8 bg-gray-500 rounded-sm" />
                                <View className="w-3 h-10 bg-[#00FF00] rounded-sm shadow-[0_0_10px_rgba(0,255,0,0.5)]" />
                            </View>
                        </View>
                    </View>

                    {/* Quick Actions Title */}
                    <View className="px-6 mb-4">
                        <Text className="text-white text-lg font-bold">빠른 실행</Text>
                    </View>

                    <View className="flex-row px-6 gap-4 mb-8">
                        <TouchableOpacity onPress={() => navigation.navigate('ScoreInput')} className="items-center gap-2">
                            <View className="w-16 h-16 rounded-2xl bg-[#142314] border border-[#2A3E2A] items-center justify-center">
                                <Edit size={24} color="#00FF00" />
                            </View>
                            <Text className="text-gray-400 text-xs">스코어 입력</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('GroupFormation')} className="items-center gap-2">
                            <View className="w-16 h-16 rounded-2xl bg-[#142314] border border-[#2A3E2A] items-center justify-center">
                                <Users size={24} color="#00FF00" />
                            </View>
                            <Text className="text-gray-400 text-xs">조편성</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('MemberList')} className="items-center gap-2">
                            <View className="w-16 h-16 rounded-2xl bg-[#142314] border border-[#2A3E2A] items-center justify-center">
                                <User size={24} color="#00FF00" />
                            </View>
                            <Text className="text-gray-400 text-xs">회원 목록</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('ScoreList')} className="items-center gap-2">
                            <View className="w-16 h-16 rounded-2xl bg-[#142314] border border-[#2A3E2A] items-center justify-center">
                                <List size={24} color="#00FF00" />
                            </View>
                            <Text className="text-gray-400 text-xs">스코어 조회</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('Statistics')} className="items-center gap-2">
                            <View className="w-16 h-16 rounded-2xl bg-[#142314] border border-[#2A3E2A] items-center justify-center">
                                <BarChart2 size={24} color="#00FF00" />
                            </View>
                            <Text className="text-gray-400 text-xs">통계 분석</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Upcoming Round Title */}
                    <View className="px-6 mb-4 flex-row justify-between items-end">
                        <Text className="text-white text-lg font-bold">다가오는 라운드</Text>
                        <Text className="text-[#00FF00] text-xs">전체보기</Text>
                    </View>

                    {/* Upcoming Round Card */}
                    <View className="px-6 mb-8">
                        {isLoading ? (
                            <ActivityIndicator color="#00FF00" />
                        ) : upcomingSchedule ? (
                            <TouchableOpacity
                                onPress={() => navigation.navigate('MainTabs', { screen: 'Schedule' })}
                                className="rounded-3xl overflow-hidden bg-[#142314] shadow-lg elevation-5 border border-[#2A3E2A]"
                            >
                                <Image
                                    source={{ uri: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=2070&auto=format&fit=crop" }}
                                    className="w-full h-32"
                                />
                                <LinearGradient
                                    colors={['transparent', '#142314']}
                                    className="absolute inset-0 top-10"
                                />
                                <View className="absolute top-4 left-4">
                                    <Text className="text-white font-bold text-xl drop-shadow-md">{upcomingSchedule.courseName}</Text>
                                    <View className="flex-row items-center gap-1">
                                        <Map size={12} color="white" />
                                        <Text className="text-white text-xs opacity-90">위치 정보 없음</Text>
                                    </View>
                                </View>

                                <View className="p-4 pt-1">
                                    <View className="flex-row items-center justify-between mb-4 bg-[#1C2A1C] p-3 rounded-xl border border-[#2A3E2A]">
                                        <View className="flex-row items-center gap-3">
                                            <View className="w-10 h-10 bg-[#2A3E2A] rounded-lg items-center justify-center">
                                                <Calendar size={20} color="#00FF00" />
                                            </View>
                                            <View>
                                                <Text className="text-white font-bold text-sm">{upcomingSchedule.date}</Text>
                                                <Text className="text-gray-400 text-xs">{upcomingSchedule.time} 티오프</Text>
                                            </View>
                                        </View>
                                        <View className="bg-[#2A3E2A] px-2 py-1 rounded">
                                            <Text className="text-[#00FF00] text-[10px] font-bold">참석 {upcomingSchedule.members?.length || 0}명</Text>
                                        </View>
                                    </View>

                                    <View className="flex-row justify-between items-center">
                                        <View className="flex-row pl-2">
                                            {upcomingSchedule.members && upcomingSchedule.members.slice(0, 4).map((m, i) => (
                                                <View key={i} className={`w-8 h-8 rounded-full border-2 border-[#142314] -ml-2 bg-gray-700 items-center justify-center overflow-hidden`}>
                                                    {m.profileImage ? (
                                                        <Image source={{ uri: m.profileImage }} className="w-full h-full" />
                                                    ) : (
                                                        <User size={16} color="#9CA3AF" />
                                                    )}
                                                </View>
                                            ))}
                                            {upcomingSchedule.members && upcomingSchedule.members.length > 4 && (
                                                <View className="w-8 h-8 rounded-full border-2 border-[#142314] -ml-2 bg-[#2A3E2A] items-center justify-center">
                                                    <Text className="text-white text-[10px] font-bold">+{upcomingSchedule.members.length - 4}</Text>
                                                </View>
                                            )}
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => navigation.navigate('MainTabs', { screen: 'Schedule' })}
                                            className="bg-[#00FF00] px-5 py-2 rounded-full"
                                        >
                                            <Text className="text-black font-bold text-sm">상세 보기</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ) : (
                            <View className="bg-[#142314] rounded-2xl p-6 border border-[#2A3E2A] items-center justify-center">
                                <Text className="text-gray-400 mb-4">예정된 라운드가 없습니다.</Text>
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('CourseSelect')}
                                    className="bg-[#1C2A1C] px-6 py-3 rounded-full border border-[#00FF00]"
                                >
                                    <Text className="text-[#00FF00] font-bold">라운드 일정 잡기</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {/* Recent Rounds Title */}
                    <View className="px-6 mb-4">
                        <Text className="text-white text-lg font-bold">최근 라운드 기록</Text>
                    </View>

                    {/* Recent Rounds List */}
                    <View className="px-6 pb-24 gap-4">
                        <View className="bg-[#142314] p-4 rounded-2xl border border-[#2A3E2A] flex-row justify-between items-center">
                            <View className="flex-row items-center gap-4">
                                <View className="w-12 h-12 bg-[#1C2A1C] rounded-xl items-center justify-center">
                                    <Text className="text-white font-bold text-lg">85</Text>
                                </View>
                                <View>
                                    <Text className="text-white font-bold text-sm">레이크사이드 CC</Text>
                                    <Text className="text-gray-500 text-xs">2023. 10. 15 • 남코스</Text>
                                </View>
                            </View>
                            <View className="items-end">
                                <Text className="text-[#ff6b6b] font-bold text-sm">+13</Text>
                                <Text className="text-gray-500 text-[10px]">98타</Text>
                            </View>
                        </View>

                        <View className="bg-[#142314] p-4 rounded-2xl border border-[#2A3E2A] flex-row justify-between items-center">
                            <View className="flex-row items-center gap-4">
                                <View className="w-12 h-12 bg-[#1C2A1C] rounded-xl items-center justify-center">
                                    <Text className="text-white font-bold text-lg">90</Text>
                                </View>
                                <View>
                                    <Text className="text-white font-bold text-sm">안양 베네스트</Text>
                                    <Text className="text-gray-500 text-xs">2023. 10. 08</Text>
                                </View>
                            </View>
                            <View className="items-end">
                                <Text className="text-[#ff6b6b] font-bold text-sm">+18</Text>
                                <Text className="text-gray-500 text-[10px]">102타</Text>
                            </View>
                        </View>

                        <View className="bg-[#142314] p-4 rounded-2xl border border-[#2A3E2A] flex-row justify-between items-center">
                            <View className="flex-row items-center gap-4">
                                <View className="w-12 h-12 bg-[#1C2A1C] rounded-xl items-center justify-center">
                                    <Text className="text-[#00FF00] font-bold text-lg">79</Text>
                                </View>
                                <View>
                                    <Text className="text-white font-bold text-sm">가평 베네스트</Text>
                                    <Text className="text-gray-500 text-xs">2023. 09. 22</Text>
                                </View>
                            </View>
                            <View className="items-end">
                                <Text className="text-[#00FF00] font-bold text-sm">+7</Text>
                                <Text className="text-gray-500 text-[10px]">79타</Text>
                            </View>
                        </View>
                    </View>

                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
