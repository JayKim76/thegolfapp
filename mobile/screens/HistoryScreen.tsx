import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, ChevronRight, TrendingUp, Filter } from 'lucide-react-native';

export default function HistoryScreen() {
    const rounds = [
        { id: 1, course: '파인 밸리 GC', date: '2023년 10월 15일', score: 84, diff: '+12', color: 'bg-emerald-500' },
        { id: 2, course: '오거스타 내셔널', date: '2023년 9월 28일', score: 79, diff: '+7', color: 'bg-blue-500' },
        { id: 3, course: '사이프러스 포인트', date: '2023년 9월 10일', score: 88, diff: '+16', color: 'bg-orange-500' },
        { id: 4, course: '페블 비치', date: '2023년 8월 22일', score: 82, diff: '+10', color: 'bg-emerald-500' },
        { id: 5, course: '세인트 앤드류스 (올드)', date: '2023년 8월 5일', score: 78, diff: '+6', color: 'bg-blue-500' },
    ];

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <View className="bg-gray-900 pt-12 pb-6 px-6 rounded-b-[32px] shadow-lg z-10">
                <StatusBar barStyle="light-content" />
                <View className="flex-row justify-between items-center mb-6">
                    <Text className="text-3xl font-bold text-white">라운드 기록</Text>
                    <TouchableOpacity className="w-10 h-10 bg-gray-800 rounded-full items-center justify-center border border-gray-700">
                        <Filter size={20} className="text-gray-300" color="#D1D5DB" />
                    </TouchableOpacity>
                </View>

                {/* Summary Card */}
                <View className="bg-gray-800/80 p-4 rounded-2xl border border-gray-700">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-3">
                            <View className="w-10 h-10 rounded-full bg-[#059669]/20 items-center justify-center">
                                <TrendingUp size={20} color="#059669" />
                            </View>
                            <View>
                                <Text className="text-gray-400 text-xs font-medium">평균 타수</Text>
                                <Text className="text-xl font-bold text-white">82.2</Text>
                            </View>
                        </View>
                        <View className="h-8 w-px bg-gray-700" />
                        <View>
                            <Text className="text-gray-400 text-xs font-medium text-right">최근 5경기</Text>
                            <Text className="text-sm font-bold text-emerald-400 text-right">-1.4 타</Text>
                        </View>
                    </View>
                </View>
            </View>

            <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
                <Text className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider">전체 라운드</Text>

                <View className="gap-4 pb-24">
                    {rounds.map((round) => (
                        <TouchableOpacity key={round.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex-row items-center justify-between">
                            <View className="flex-row items-center gap-4">
                                <View className={`w-12 h-12 ${round.color} rounded-2xl items-center justify-center opacity-90`}>
                                    <Text className="text-xl">⛳</Text>
                                </View>
                                <View>
                                    <Text className="font-bold text-gray-900 dark:text-white text-base">{round.course}</Text>
                                    <View className="flex-row items-center gap-1.5 mt-1">
                                        <Calendar size={12} color="#9CA3AF" />
                                        <Text className="text-xs text-gray-500 dark:text-gray-400">{round.date}</Text>
                                    </View>
                                </View>
                            </View>
                            <View className="flex-row items-center gap-3">
                                <View className="items-end">
                                    <Text className="font-bold text-gray-900 dark:text-white text-lg">{round.score}</Text>
                                    <Text className={`text-xs font-medium ${round.score < 80 ? 'text-[#059669]' : 'text-gray-500'}`}>{round.diff}</Text>
                                </View>
                                <ChevronRight size={20} color="#D1D5DB" />
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}
