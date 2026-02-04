import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, Trash2, Search, X } from 'lucide-react-native';
import { TextInput } from 'react-native';
import { Schedule, ScheduleService } from '../services/ScheduleService';
import { Alert } from 'react-native';

export default function ScheduleScreen() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null); // YYYY-MM-DD
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    useFocusEffect(
        useCallback(() => {
            fetchSchedules();
        }, [])
    );

    const fetchSchedules = async () => {
        setLoading(true);
        try {
            const data = await ScheduleService.getSchedules();
            setSchedules(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id: number) => {
        Alert.alert(
            '일정 삭제',
            '정말 이 일정을 삭제하시겠습니까?',
            [
                { text: '취소', style: 'cancel' },
                {
                    text: '삭제',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await ScheduleService.deleteSchedule(id);
                            fetchSchedules(); // Refresh list
                        } catch (error) {
                            Alert.alert('오류', '일정 삭제 중 문제가 발생했습니다.');
                        }
                    }
                }
            ]
        );
    };

    // Calendar Logic
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); // 0-indexed

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay(); // 0 (Sun) - 6 (Sat)

    const weeks: (number | null)[][] = [];
    let currentWeek: (number | null)[] = Array(startDayOfWeek).fill(null);

    for (let day = 1; day <= daysInMonth; day++) {
        currentWeek.push(day);
        if (currentWeek.length === 7) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
    }
    if (currentWeek.length > 0) {
        while (currentWeek.length < 7) currentWeek.push(null);
        weeks.push(currentWeek);
    }

    const changeMonth = (delta: number) => {
        setCurrentDate(new Date(year, month + delta, 1));
        setSelectedDate(null); // Reset selection on month change
    };

    const getFormattedDate = (day: number) => {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

    const hasSchedule = (day: number) => {
        const dateStr = getFormattedDate(day);
        return schedules.some(s => s.date === dateStr);
    };

    const isSelected = (day: number) => {
        return selectedDate === getFormattedDate(day);
    };

    // Filter schedules for list
    let filteredSchedules = schedules;

    // 1. Date Filter (only if NOT searching)
    if (!isSearching) {
        if (selectedDate) {
            filteredSchedules = filteredSchedules.filter(s => s.date === selectedDate);
        } else {
            filteredSchedules = filteredSchedules.filter(s =>
                s.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)
            );
        }
    }

    // 2. Search Filter (Course Name or Member Name)
    if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filteredSchedules = filteredSchedules.filter(s =>
            s.courseName.toLowerCase().includes(query) ||
            s.groups.some(g => g.members.some(m => m.name.toLowerCase().includes(query)))
        );
    }

    filteredSchedules.sort((a, b) => a.date.localeCompare(b.date));

    return (
        <SafeAreaView className="flex-1 bg-[#0B120B]" edges={['top', 'left', 'right']}>
            {/* Header */}
            <View className="px-6 py-4">
                <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-2xl font-bold text-white">예약 관리</Text>
                    <View className="flex-row gap-4">
                        <TouchableOpacity onPress={() => setIsSearching(!isSearching)}>
                            <Search size={24} color={isSearching ? "#00FF00" : "white"} />
                        </TouchableOpacity>
                        {!isSearching && (
                            <TouchableOpacity onPress={() => {
                                const now = new Date();
                                setCurrentDate(now);
                                const year = now.getFullYear();
                                const month = now.getMonth();
                                const day = now.getDate();
                                setSelectedDate(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
                            }}>
                                <Text className="text-[#00FF00] font-bold">오늘</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Search Bar */}
                {isSearching && (
                    <View className="bg-[#1C2A1C] rounded-xl flex-row items-center px-4 h-12 border border-[#2A3C2A] mb-2">
                        <Search size={20} color="#9CA3AF" />
                        <TextInput
                            className="flex-1 ml-3 text-white text-base"
                            placeholder="골프장 또는 회원 검색..."
                            placeholderTextColor="#6B7280"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            returnKeyType="search"
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <X size={18} color="#9CA3AF" />
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Calendar Card - Hide when searching to focus on results */}
                {!isSearching && (
                    <View className="mx-6 bg-[#142314] rounded-3xl p-4 border border-[#2A3C2A] mb-6 shadow-lg">
                        {/* Month Navigator */}
                        <View className="flex-row items-center justify-between mb-6 px-2">
                            <TouchableOpacity onPress={() => changeMonth(-1)} className="p-2">
                                <ChevronLeft size={24} color="#9CA3AF" />
                            </TouchableOpacity>
                            <Text className="text-white text-xl font-bold">
                                {year}년 {month + 1}월
                            </Text>
                            <TouchableOpacity onPress={() => changeMonth(1)} className="p-2">
                                <ChevronRight size={24} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>

                        {/* Days Header */}
                        <View className="flex-row justify-between mb-4 px-1">
                            {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
                                <Text key={i} className={`text-center w-8 font-bold ${i === 0 ? 'text-red-500' : 'text-gray-400'}`}>
                                    {d}
                                </Text>
                            ))}
                        </View>

                        {/* Calendar Grid */}
                        <View className="gap-2">
                            {weeks.map((week, wIndex) => (
                                <View key={wIndex} className="flex-row justify-between px-1">
                                    {week.map((day, dIndex) => {
                                        if (!day) return <View key={dIndex} className="w-8 h-8" />;

                                        const scheduled = hasSchedule(day);
                                        const selected = isSelected(day);
                                        const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

                                        return (
                                            <TouchableOpacity
                                                key={dIndex}
                                                onPress={() => setSelectedDate(selected ? null : getFormattedDate(day))}
                                                className={`w-8 h-10 items-center justify-start rounded-lg pt-1 ${selected ? 'bg-[#00FF00]' : ''} ${isToday && !selected ? 'bg-[#1C5E20]' : ''}`}
                                            >
                                                <Text className={`font-bold ${selected ? 'text-[#0B120B]' : 'text-white'} ${dIndex === 0 && !selected ? 'text-red-400' : ''}`}>
                                                    {day}
                                                </Text>
                                                {scheduled && (
                                                    <View className={`w-1.5 h-1.5 rounded-full mt-1 ${selected ? 'bg-[#0B120B]' : 'bg-[#00FF00]'}`} />
                                                )}
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Schedule List */}
                <View className="px-6">
                    <Text className="text-white font-bold text-lg mb-4">
                        {isSearching ? `검색 결과 (${filteredSchedules.length})` : (selectedDate ? `${selectedDate} 일정` : `${month + 1}월 일정`)}
                    </Text>

                    {loading ? (
                        <ActivityIndicator color="#00FF00" />
                    ) : (
                        <View className="gap-4">
                            {filteredSchedules.length > 0 ? filteredSchedules.map((schedule) => (
                                <View key={schedule.id} className="bg-[#1C2A1C] rounded-2xl p-5 border-l-4 border-l-[#00FF00] mb-2">
                                    <View className="flex-row justify-between items-start mb-3">
                                        <View>
                                            <Text className="text-gray-400 text-xs mb-1">{schedule.date}</Text>
                                            <Text className="text-white font-bold text-lg">{schedule.courseName}</Text>
                                        </View>
                                        <View className="flex-row gap-2">
                                            <View className="bg-[#0B120B] px-3 py-1.5 rounded-lg flex-row items-center gap-1.5 border border-[#2A3C2A]">
                                                <Clock size={12} color="#00FF00" />
                                                <Text className="text-[#00FF00] font-bold text-xs">{schedule.time}</Text>
                                            </View>
                                            <TouchableOpacity
                                                onPress={() => handleDelete(schedule.id)}
                                                className="bg-[#2A3C2A] p-1.5 rounded-lg items-center justify-center border border-red-900/30"
                                            >
                                                <Trash2 size={16} color="#EF4444" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <View className="h-[1px] bg-[#2A3C2A] mb-3" />

                                    {/* Groups Display */}
                                    <View className="gap-3">
                                        {schedule.groups && schedule.groups.length > 0 ? (
                                            schedule.groups.map((group, gIndex) => (
                                                <View key={gIndex} className="bg-[#142314] p-3 rounded-xl border border-[#2A3C2A]">
                                                    <Text className="text-[#00FF00] font-bold text-sm mb-2">{group.name}</Text>
                                                    <View className="flex-row gap-2 flex-wrap">
                                                        {group.members.map((m, i) => (
                                                            <View key={i} className="flex-row items-center gap-2 bg-[#1C2A1C] px-2 py-1 rounded-lg border border-[#2A3C2A]">
                                                                <View className="w-6 h-6 rounded-full bg-gray-700 items-center justify-center overflow-hidden">
                                                                    {m.profileImage ? (
                                                                        <Image source={{ uri: m.profileImage }} className="w-full h-full" />
                                                                    ) : (
                                                                        <Text className="text-[10px] text-white uppercase">{m.name[0]}</Text>
                                                                    )}
                                                                </View>
                                                                <Text className="text-gray-300 text-xs">{m.name}</Text>
                                                            </View>
                                                        ))}
                                                    </View>
                                                </View>
                                            ))
                                        ) : (
                                            /* Fallback for old data or no groups */
                                            <View className="flex-row gap-2">
                                                {schedule.members.map((m, i) => (
                                                    <View key={i} className="w-8 h-8 rounded-full bg-gray-700 border border-[#2A3C2A] items-center justify-center overflow-hidden">
                                                        {m.profileImage ? (
                                                            <Image source={{ uri: m.profileImage }} className="w-full h-full" />
                                                        ) : (
                                                            <Text className="text-xs text-white uppercase">{m.name[0]}</Text>
                                                        )}
                                                    </View>
                                                ))}
                                                {schedule.members.length === 0 && <Text className="text-gray-500 text-sm">참석자가 없습니다.</Text>}
                                            </View>
                                        )}
                                    </View>
                                </View>
                            )) : (
                                <View className="items-center py-10 bg-[#142314] rounded-2xl border border-[#2A3C2A] border-dashed">
                                    <CalendarIcon size={40} color="#374151" />
                                    <Text className="text-gray-500 mt-4 text-center">
                                        {isSearching ? '검색 결과가 없습니다.' : '예약된 일정이 없습니다.'}
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
