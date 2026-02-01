import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, ChevronRight, User, Award, Shield, LogOut } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
    const navigation = useNavigation<any>();

    const handleLogout = () => {
        navigation.replace('Login');
    };

    const menuItems = [
        { icon: User, label: '내 계정', color: '#3B82F6' },
        { icon: Award, label: '업적', color: '#F59E0B' },
        { icon: Shield, label: '개인정보 및 보안', color: '#10B981' },
        { icon: Settings, label: '설정', color: '#6B7280' },
    ];

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <View className="bg-gray-900 pt-12 pb-10 px-6 rounded-b-[32px] shadow-lg z-10 items-center">
                <StatusBar barStyle="light-content" />
                <View className="w-24 h-24 bg-gray-800 rounded-full border-4 border-[#059669] mb-4 items-center justify-center overflow-hidden">
                    <Image
                        source={{ uri: "https://picsum.photos/seed/golfer/200" }}
                        className="w-full h-full"
                    />
                </View>
                <Text className="text-2xl font-bold text-white mb-1">홍길동</Text>
                <Text className="text-[#059669] font-medium bg-[#059669]/10 px-3 py-1 rounded-full text-sm">핸디캡: 14.5</Text>

                <View className="flex-row gap-8 mt-8 w-full justify-center">
                    <View className="items-center">
                        <Text className="text-white font-bold text-xl">42</Text>
                        <Text className="text-gray-400 text-xs mt-1">라운드</Text>
                    </View>
                    <View className="items-center">
                        <Text className="text-white font-bold text-xl">82.5</Text>
                        <Text className="text-gray-400 text-xs mt-1">평균 타수</Text>
                    </View>
                    <View className="items-center">
                        <Text className="text-white font-bold text-xl">3</Text>
                        <Text className="text-gray-400 text-xs mt-1">클럽 챔피언</Text>
                    </View>
                </View>
            </View>

            <ScrollView className="flex-1 px-6 -mt-6" showsVerticalScrollIndicator={false}>
                <View className="bg-white dark:bg-gray-800 rounded-3xl p-2 shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            className={`flex-row items-center justify-between p-4 ${index !== menuItems.length - 1 ? 'border-b border-gray-50 dark:border-gray-700' : ''}`}
                        >
                            <View className="flex-row items-center gap-4">
                                <View className="w-10 h-10 rounded-xl items-center justify-center bg-gray-50 dark:bg-gray-700/50">
                                    <item.icon size={20} color={item.color} />
                                </View>
                                <Text className="font-bold text-gray-900 dark:text-white text-base">{item.label}</Text>
                            </View>
                            <ChevronRight size={20} color="#D1D5DB" />
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity
                    onPress={handleLogout}
                    className="flex-row items-center justify-center gap-2 mb-12 p-4"
                >
                    <LogOut size={20} color="#EF4444" />
                    <Text className="text-red-500 font-bold">로그아웃</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
