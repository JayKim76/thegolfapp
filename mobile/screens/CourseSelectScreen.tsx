import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StatusBar, ActivityIndicator, Modal, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Search, MapPin, ChevronRight, Plus } from 'lucide-react-native';
import { GolfCourseService, GolfCourse } from '../services/GolfCourseService';

export default function CourseSelectScreen() {
    const navigation = useNavigation<any>();
    const [searchQuery, setSearchQuery] = useState('');
    const [courses, setCourses] = useState<GolfCourse[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    // Add Course Modal State
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [newCourseName, setNewCourseName] = useState('');
    const [newCourseLocation, setNewCourseLocation] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    // ... useEffects ...

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

    const handleAddCourse = async () => {
        if (!newCourseName.trim()) {
            Alert.alert('알림', '골프장 이름을 입력해주세요.');
            return;
        }

        setIsAdding(true);
        try {
            const newCourse = await GolfCourseService.addCourse(newCourseName, newCourseLocation || '위치 정보 없음');
            if (newCourse) {
                setIsAddModalVisible(false);
                setNewCourseName('');
                setNewCourseLocation('');

                // Navigate with new course
                navigation.navigate('GroupFormation', {
                    courseName: newCourse.name,
                    courseLocation: newCourse.location
                });
            } else {
                Alert.alert('오류', '골프장 추가에 실패했습니다.');
            }
        } catch (error) {
            Alert.alert('오류', '골프장 추가 중 문제가 발생했습니다.');
        } finally {
            setIsAdding(false);
        }
    };

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
                        <TouchableOpacity onPress={loadRecommendedCourses}>
                            <Text className="text-[#059669] font-bold text-sm">목록 갱신</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View className="gap-4 pb-24">
                    {courses.length > 0 ? (
                        courses.map((course) => (
                            <TouchableOpacity
                                key={course.id || Math.random()} // Fallback key
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
                                <TouchableOpacity
                                    onPress={() => {
                                        setNewCourseName(searchQuery); // Pre-fill search query
                                        setIsAddModalVisible(true);
                                    }}
                                    className="flex-row items-center gap-2 bg-gray-200 dark:bg-gray-700 px-5 py-3 rounded-xl"
                                >
                                    <Plus size={18} color="#4B5563" />
                                    <Text className="font-bold text-gray-700 dark:text-gray-300">직접 골프장 추가</Text>
                                </TouchableOpacity>
                            </View>
                        )
                    )}
                </View>
            </ScrollView>

            {/* Add Course Modal */}
            <Modal
                visible={isAddModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setIsAddModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    className="flex-1 bg-black/50 justify-center items-center px-6"
                >
                    <View className="bg-gray-900 w-full rounded-2xl p-6 border border-gray-700 shadow-xl">
                        <Text className="text-xl font-bold text-white mb-4">골프장 직접 추가</Text>

                        <Text className="text-gray-400 mb-2 font-bold">골프장 이름</Text>
                        <TextInput
                            className="bg-gray-800 text-white rounded-xl px-4 py-3 mb-4 border border-gray-700"
                            placeholder="예: 우리동네 CC"
                            placeholderTextColor="#6B7280"
                            value={newCourseName}
                            onChangeText={setNewCourseName}
                            autoFocus
                        />

                        <Text className="text-gray-400 mb-2 font-bold">위치 (선택)</Text>
                        <TextInput
                            className="bg-gray-800 text-white rounded-xl px-4 py-3 mb-6 border border-gray-700"
                            placeholder="예: 경기도 용인시"
                            placeholderTextColor="#6B7280"
                            value={newCourseLocation}
                            onChangeText={setNewCourseLocation}
                        />

                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={() => setIsAddModalVisible(false)}
                                className="flex-1 bg-gray-700 py-3 rounded-xl items-center"
                            >
                                <Text className="text-gray-300 font-bold">취소</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleAddCourse}
                                className="flex-1 bg-[#059669] py-3 rounded-xl items-center"
                            >
                                {isAdding ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="text-white font-bold">추가 및 선택</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}
