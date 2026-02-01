import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, TrendingUp, TrendingDown, Target, Award, Calendar } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { RoundService, Round } from '../services/RoundService';

export default function StatisticsScreen() {
    const navigation = useNavigation();
    const [rounds, setRounds] = useState<Round[]>([]);
    const [stats, setStats] = useState({
        avgScore: 0,
        bestScore: 0,
        handicap: 0,
        recentTrend: [] as number[],
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const history = await RoundService.getRounds();
        setRounds(history);

        if (history.length > 0) {
            // Calculate Stats (Mock logic for demonstration)
            // In a real app, filter for the specific user (e.g. memberId 101)
            const myScores = history.flatMap(r => r.players.filter(p => p.id === 101 || p.name === '김민수')).map(p => p.score);

            if (myScores.length > 0) {
                const total = myScores.reduce((a, b) => a + b, 0);
                const avg = total / myScores.length;
                const min = Math.min(...myScores);
                const recent = myScores.slice(0, 5).reverse(); // Last 5

                setStats({
                    avgScore: parseFloat(avg.toFixed(1)),
                    bestScore: min,
                    handicap: 12, // Mock
                    recentTrend: recent,
                });
            }
        }
    };

    const screenWidth = Dimensions.get('window').width;

    return (
        <View className="flex-1 bg-[#0B120B]">
            <SafeAreaView className="flex-1">
                {/* Header */}
                <View className="px-6 py-4 flex-row items-center gap-4">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 items-center justify-center rounded-full bg-[#1C2A1C]">
                        <ArrowLeft size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white text-xl font-bold">통계 분석</Text>
                </View>

                <ScrollView className="flex-1 px-6 pt-2" showsVerticalScrollIndicator={false}>

                    {/* Summary Cards */}
                    <View className="flex-row gap-4 mb-6">
                        <View className="flex-1 bg-[#142314] p-5 rounded-2xl border border-[#2A3C2A]">
                            <View className="flex-row items-center gap-2 mb-2 opacity-80">
                                <Target size={16} color="#00FF00" />
                                <Text className="text-gray-400 text-xs font-bold">평균 스코어</Text>
                            </View>
                            <Text className="text-white text-3xl font-extrabold">{stats.avgScore || '-'}</Text>
                        </View>
                        <View className="flex-1 bg-[#142314] p-5 rounded-2xl border border-[#2A3C2A]">
                            <View className="flex-row items-center gap-2 mb-2 opacity-80">
                                <Award size={16} color="#00FF00" />
                                <Text className="text-gray-400 text-xs font-bold">베스트 스코어</Text>
                            </View>
                            <Text className="text-white text-3xl font-extrabold">{stats.bestScore || '-'}</Text>
                        </View>
                    </View>

                    {/* Chart Section */}
                    <View className="bg-[#142314] p-6 rounded-3xl border border-[#2A3C2A] mb-8">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-white text-lg font-bold">최근 5경기 추이</Text>
                            <View className="flex-row items-center bg-[#1C2A1C] px-3 py-1 rounded-full">
                                <TrendingDown size={14} color="#00FF00" />
                                <Text className="text-[#00FF00] text-xs font-bold ml-1">-1.5 타</Text>
                            </View>
                        </View>

                        {/* Custom Bar Chart */}
                        <View className="h-48 flex-row items-end justify-between px-2">
                            {stats.recentTrend.length > 0 ? stats.recentTrend.map((score, index) => {
                                // Normalize height: max score 120 -> 100% height
                                const height = (score / 120) * 100;
                                const isBest = score === Math.min(...stats.recentTrend);
                                return (
                                    <View key={index} className="items-center gap-2 w-8">
                                        <Text className="text-white font-bold text-xs mb-1">{score}</Text>
                                        <View
                                            style={{ height: `${height}%` }}
                                            className={`w-full rounded-t-lg ${isBest ? 'bg-[#00FF00]' : 'bg-[#2A3C2A]'}`}
                                        />
                                        <Text className="text-gray-500 text-[10px]">{index + 1}</Text>
                                    </View>
                                )
                            }) : (
                                <Text className="text-gray-500 text-center w-full">데이터가 부족합니다.</Text>
                            )}
                        </View>
                    </View>

                    {/* Recent History List */}
                    <Text className="text-white text-lg font-bold mb-4">상세 기록</Text>
                    <View className="pb-10 gap-4">
                        {rounds.map((round) => {
                            // Find user's score in this round
                            const userPlayer = round.players.find(p => p.id === 101 || p.name === '김민수' || p.name === '홍길동'); // Mock Logic
                            const score = userPlayer ? userPlayer.score : '-';

                            return (
                                <View key={round.id} className="bg-[#142314] p-5 rounded-2xl border border-[#2A3C2A] flex-row items-center justify-between">
                                    <View>
                                        <Text className="text-white font-bold text-base mb-1">{round.courseName}</Text>
                                        <View className="flex-row items-center gap-2">
                                            <Calendar size={14} color="#6B7280" />
                                            <Text className="text-gray-500 text-xs">{round.date}</Text>
                                        </View>
                                    </View>
                                    <View className="w-12 h-12 bg-[#1C2A1C] rounded-xl items-center justify-center border border-[#2A3C2A]">
                                        <Text className="text-[#00FF00] font-bold text-lg">{score}</Text>
                                    </View>
                                </View>
                            )
                        })}
                    </View>

                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
