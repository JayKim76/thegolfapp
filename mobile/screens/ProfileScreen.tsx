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
        { icon: User, label: '내 계정', color: '#00FF00' },
        { icon: Award, label: '업적', color: '#F59E0B' }, // Gold for awards
        { icon: Shield, label: '개인정보 및 보안', color: '#00FF00' },
        { icon: Settings, label: '설정', color: '#9CA3AF' },
    ];

    return (
        <View className="flex-1 bg-[#0B120B]">
            {/* Header */}
            <View className="bg-[#0B120B] pt-12 pb-10 px-6 rounded-b-[32px] border-b border-[#1C2A1C] z-10 items-center shadow-lg shadow-[#00FF00]/10">
                <StatusBar barStyle="light-content" />
                <View className="w-24 h-24 bg-[#142314] rounded-full border-4 border-[#00FF00] mb-4 items-center justify-center overflow-hidden shadow-[0_0_15px_rgba(0,255,0,0.3)]">
                    <Image
                        source={{ uri: "https://picsum.photos/seed/golfer/200" }}
                        className="w-full h-full"
                    />
                </View>
                <Text className="text-2xl font-bold text-white mb-1">홍길동</Text>
                <Text className="text-[#00FF00] font-medium bg-[#1C2A1C] px-3 py-1 rounded-full text-sm border border-[#2A3E2A]">핸디캡: 14.5</Text>

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
                <View className="bg-[#142314] rounded-3xl p-2 shadow-lg border border-[#2A3E2A] mb-8">
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            className={`flex-row items-center justify-between p-4 ${index !== menuItems.length - 1 ? 'border-b border-[#2A3E2A]' : ''}`}
                        >
                            <View className="flex-row items-center gap-4">
                                <View className="w-10 h-10 rounded-xl items-center justify-center bg-[#1C2A1C] border border-[#2A3E2A]">
                                    <item.icon size={20} color={item.color} />
                                </View>
                                <Text className="font-bold text-white text-base">{item.label}</Text>
                            </View>
                            <ChevronRight size={20} color="#2A3E2A" />
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
