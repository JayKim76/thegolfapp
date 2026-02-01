import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react-native';
import { Schedule, ScheduleService } from '../services/ScheduleService';

export default function ScheduleScreen() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null); // YYYY-MM-DD
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(false);

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
    const filteredSchedules = selectedDate
        ? schedules.filter(s => s.date === selectedDate)
        : schedules.filter(s => {
            // If no date selected, show all future schedules from this month onwards? 
            // Or just all schedules for this month? 
            // Let's show all schedules for the current month.
            return s.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`);
        });

    filteredSchedules.sort((a, b) => a.date.localeCompare(b.date));

    return (
        <SafeAreaView className="flex-1 bg-[#0B120B]" edges={['top', 'left', 'right']}>
            {/* Header */}
            <View className="px-6 py-4 flex-row items-center justify-between">
                <Text className="text-2xl font-bold text-white">예약 관리</Text>
                <View className="flex-row gap-4">
                    <TouchableOpacity onPress={() => {
                        const now = new Date();
                        setCurrentDate(now);
                        // Also select today so the list updates
                        const year = now.getFullYear();
                        const month = now.getMonth();
                        const day = now.getDate();
                        setSelectedDate(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
                    }}>
                        <Text className="text-[#00FF00] font-bold">오늘</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Calendar Card */}
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

                {/* Schedule List */}
                <View className="px-6">
                    <Text className="text-white font-bold text-lg mb-4">
                        {selectedDate ? `${selectedDate} 일정` : `${month + 1}월 일정`}
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
                                        <View className="bg-[#0B120B] px-3 py-1.5 rounded-lg flex-row items-center gap-1.5 border border-[#2A3C2A]">
                                            <Clock size={12} color="#00FF00" />
                                            <Text className="text-[#00FF00] font-bold text-xs">{schedule.time}</Text>
                                        </View>
                                    </View>

                                    <View className="h-[1px] bg-[#2A3C2A] mb-3" />

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
                                </View>
                            )) : (
                                <View className="items-center py-10 bg-[#142314] rounded-2xl border border-[#2A3C2A] border-dashed">
                                    <CalendarIcon size={40} color="#374151" />
                                    <Text className="text-gray-500 mt-4 text-center">예약된 일정이 없습니다.</Text>
                                </View>
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
