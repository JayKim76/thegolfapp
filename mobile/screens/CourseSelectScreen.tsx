import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Search, MapPin, ChevronRight, Plus } from 'lucide-react-native';
import { GolfCourseService, GolfCourse } from '../services/GolfCourseService';

export default function CourseSelectScreen() {
    const navigation = useNavigation<any>();
    const [searchQuery, setSearchQuery] = useState('');
    const [courses, setCourses] = useState<GolfCourse[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false); // 검색 모드 여부

    // 초기 로딩: 추천 골프장 표시
    useEffect(() => {
        loadRecommendedCourses();
    }, []);

    const loadRecommendedCourses = async () => {
        setIsLoading(true);
        try {
            const data = await GolfCourseService.getRecommendedCourses();
            setCourses(data);
        } catch (error) {
            console.error('Failed to load courses', error);
        } finally {
            setIsLoading(false);
        }
    };

    // 검색어 변경 감지 및 디바운싱
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.trim()) {
                setIsSearching(true);
                setIsLoading(true);
                try {
                    const results = await GolfCourseService.searchCourses(searchQuery);
                    setCourses(results);
                } catch (error) {
                    console.error('Search failed', error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setIsSearching(false);
                loadRecommendedCourses(); // 검색어 지우면 다시 추천 목록
            }
        }, 500); // 500ms 디바운스

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View className="bg-gray-900 pt-12 pb-6 px-6 rounded-b-[32px] shadow-lg z-10">
                <View className="flex-row items-center justify-between mb-6">
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="w-10 h-10 bg-gray-800 rounded-full items-center justify-center border border-gray-700"
                    >
                        <ArrowLeft size={20} color="#D1D5DB" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-white">골프장 선택</Text>
                    <View className="w-10" />
                </View>

                {/* Search Bar */}
                <View className="bg-gray-800 rounded-2xl flex-row items-center px-4 h-12 border border-gray-700">
                    <Search size={20} color="#9CA3AF" />
                    <TextInput
                        className="flex-1 ml-3 text-white text-base"
                        placeholder="골프장 검색..."
                        placeholderTextColor="#6B7280"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        returnKeyType="search"
                    />
                    {isLoading && (
                        <ActivityIndicator size="small" color="#059669" />
                    )}
                </View>
            </View>

            {/* Content */}
            <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                        {isSearching ? `검색 결과 (${courses.length})` : '추천 골프장'}
                    </Text>
                    {!isSearching && (
                        <TouchableOpacity>
                            <Text className="text-[#059669] font-bold text-sm">지도 보기</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View className="gap-4 pb-24">
                    {courses.length > 0 ? (
                        courses.map((course) => (
                            <TouchableOpacity
                                key={course.id}
                                className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex-row items-center justify-between"
                                onPress={() => {
                                    navigation.navigate('GroupFormation', {
                                        courseName: course.name,
                                        courseLocation: course.location
                                    });
                                }}
                            >
                                <View className="flex-row items-center gap-4 flex-1">
                                    <View className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl items-center justify-center">
                                        <MapPin size={24} color="#059669" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="font-bold text-gray-900 dark:text-white text-base" numberOfLines={1}>{course.name}</Text>
                                        <View className="flex-row items-center gap-1.5 mt-1">
                                            <Text className="text-xs text-gray-500 dark:text-gray-400">{course.location} • {course.distance}</Text>
                                        </View>
                                    </View>
                                </View>
                                <ChevronRight size={20} color="#D1D5DB" />
                            </TouchableOpacity>
                        ))
                    ) : (
                        !isLoading && (
                            <View className="items-center justify-center py-10">
                                <Text className="text-gray-400 mb-4">
                                    {isSearching ? `'${searchQuery}'에 대한 검색 결과가 없습니다.` : '골프장 목록을 불러올 수 없습니다.'}
                                </Text>
                                <TouchableOpacity className="flex-row items-center gap-2 bg-gray-200 dark:bg-gray-700 px-5 py-3 rounded-xl">
                                    <Plus size={18} color="#4B5563" />
                                    <Text className="font-bold text-gray-700 dark:text-gray-300">직접 골프장 추가</Text>
                                </TouchableOpacity>
                            </View>
                        )
                    )}
                </View>
            </ScrollView>
        </View>
    );
}
