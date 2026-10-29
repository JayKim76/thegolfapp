import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, TrendingUp, Users, Trophy } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { RoundService, Round } from '../services/RoundService';

// Club round history (admin view): every outing stored in the backend DB,
// with all players' scores. Nothing here is per-user or hardcoded.
export default function HistoryScreen() {
    const [rounds, setRounds] = useState<Round[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const load = async () => {
        setIsLoading(true);
        try {
            setRounds(await RoundService.getRounds());
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            load();
        }, [])
    );

    const allScores = rounds.flatMap(r => r.players.map(p => p.score));
    const avgScore = allScores.length
        ? (allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(1)
        : '-';

    return (
        <View className="flex-1 bg-[#0B120B]">
            <View className="bg-[#0B120B] pt-12 pb-6 px-6 rounded-b-[32px] border-b border-[#1C2A1C] z-10 shadow-lg shadow-[#00FF00]/10">
                <StatusBar barStyle="light-content" />
                <View className="flex-row justify-between items-center mb-6">
                    <Text className="text-3xl font-bold text-white">라운드 기록</Text>
                </View>

                <View className="bg-[#142314] p-4 rounded-2xl border border-[#2A3E2A]">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-3">
                            <View className="w-10 h-10 rounded-full bg-[#1C2A1C] items-center justify-center border border-[#2A3E2A]">
                                <TrendingUp size={20} color="#00FF00" />
                            </View>
                            <View>
                                <Text className="text-gray-400 text-xs font-medium">전체 회원 평균 타수</Text>
                                <Text className="text-xl font-bold text-white">{avgScore}</Text>
                            </View>
                        </View>
                        <View className="h-8 w-px bg-[#2A3E2A]" />
                        <View>
                            <Text className="text-gray-400 text-xs font-medium text-right">기록된 라운드</Text>
                            <Text className="text-sm font-bold text-[#00FF00] text-right">{rounds.length}회 · 스코어 {allScores.length}건</Text>
                        </View>
                    </View>
                </View>
            </View>

            <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
                <Text className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider">전체 라운드</Text>

                {isLoading ? (
                    <ActivityIndicator color="#00FF00" />
                ) : rounds.length === 0 ? (
                    <View className="bg-[#142314] p-6 rounded-2xl border border-[#2A3E2A] items-center">
                        <Text className="text-gray-400">아직 기록된 라운드가 없습니다.</Text>
                        <Text className="text-gray-500 text-xs mt-1">스코어를 입력하면 여기에 쌓입니다.</Text>
                    </View>
                ) : (
                    <View className="gap-4 pb-24">
                        {rounds.map((round) => {
                            const best = round.players.length ? Math.min(...round.players.map(p => p.score)) : null;
                            const bestPlayer = best !== null ? round.players.find(p => p.score === best) : undefined;
                            return (
                                <View key={round.id} className="bg-[#142314] p-4 rounded-2xl border border-[#2A3E2A] shadow-sm">
                                    <View className="flex-row items-center justify-between mb-2">
                                        <Text className="font-bold text-white text-base">{round.courseName || '코스 정보 없음'}</Text>
                                        <View className="flex-row items-center gap-1">
                                            <Calendar size={12} color="#9CA3AF" />
                                            <Text className="text-gray-400 text-xs">{round.date}</Text>
                                        </View>
                                    </View>
                                    <View className="flex-row items-center gap-4">
                                        <View className="flex-row items-center gap-1">
                                            <Users size={14} color="#9CA3AF" />
                                            <Text className="text-gray-400 text-xs">{round.players.length}명 기록</Text>
                                        </View>
                                        {bestPlayer && (
                                            <View className="flex-row items-center gap-1">
                                                <Trophy size={14} color="#00FF00" />
                                                <Text className="text-[#00FF00] text-xs font-bold">{bestPlayer.name} {bestPlayer.score}타</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
