import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Bell, Edit, Users, Map, BarChart2, Plus, ArrowRight, Calendar, List, User } from 'lucide-react-native';

import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {
    const navigation = useNavigation<any>();

    // Custom Colors
    const darkBackground = '#0B120B';
    const neonGreen = '#00FF00';
    const cardBg = '#142314'; // Slightly lighter than background

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
                                <Text className="text-white text-lg font-bold">안녕하세요, 김민수님</Text>
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
                        <View className="rounded-3xl overflow-hidden bg-[#142314] shadow-lg elevation-5 border border-[#2A3E2A]">
                            <Image
                                source={{ uri: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=2070&auto=format&fit=crop" }}
                                className="w-full h-32"
                            />
                            <LinearGradient
                                colors={['transparent', '#142314']}
                                className="absolute inset-0 top-10"
                            />
                            <View className="absolute top-4 left-4">
                                <Text className="text-white font-bold text-xl drop-shadow-md">스카이 72 골프 클럽</Text>
                                <View className="flex-row items-center gap-1">
                                    <Map size={12} color="white" />
                                    <Text className="text-white text-xs opacity-90">인천광역시 중구</Text>
                                </View>
                            </View>

                            <View className="p-4 pt-1">
                                <View className="flex-row items-center justify-between mb-4 bg-[#1C2A1C] p-3 rounded-xl border border-[#2A3E2A]">
                                    <View className="flex-row items-center gap-3">
                                        <View className="w-10 h-10 bg-[#2A3E2A] rounded-lg items-center justify-center">
                                            <Calendar size={20} color="#00FF00" />
                                        </View>
                                        <View>
                                            <Text className="text-white font-bold text-sm">10월 24일 (토)</Text>
                                            <Text className="text-gray-400 text-xs">오전 07:00 티오프</Text>
                                        </View>
                                    </View>
                                    <View className="bg-[#2A3E2A] px-2 py-1 rounded">
                                        <Text className="text-[#00FF00] text-[10px] font-bold">예약 확정</Text>
                                    </View>
                                </View>

                                <View className="flex-row justify-between items-center">
                                    <View className="flex-row pl-2">
                                        {[1, 2, 3].map((_, i) => (
                                            <View key={i} className={`w-8 h-8 rounded-full border-2 border-[#142314] -ml-2 bg-gray-700 items-center justify-center overflow-hidden`}>
                                                <Image source={{ uri: `https://randomuser.me/api/portraits/men/${40 + i}.jpg` }} className="w-full h-full" />
                                            </View>
                                        ))}
                                        <View className="w-8 h-8 rounded-full border-2 border-[#142314] -ml-2 bg-[#2A3E2A] items-center justify-center">
                                            <Text className="text-white text-[10px] font-bold">+1</Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity className="bg-[#00FF00] px-5 py-2 rounded-full">
                                        <Text className="text-black font-bold text-sm">상세 보기</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
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
