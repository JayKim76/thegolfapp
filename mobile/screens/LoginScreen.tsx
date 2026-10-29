import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ImageBackground, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, User, Lock, Eye, EyeOff, LogIn, ShieldCheck } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthService } from '../services/AuthService';

// Club-admin model: this is the ONLY login in the app.
// The admin manages every member of the club; members have no accounts.
export default function LoginScreen() {
    const navigation = useNavigation<any>();
    const [adminId, setAdminId] = useState('admin');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const darkBackground = '#0B120B';

    const handleLogin = async () => {
        setIsLoggingIn(true);
        try {
            const ok = await AuthService.login(adminId, password);
            if (ok) {
                navigation.replace('MainTabs', { screen: 'Home' });
            } else {
                Alert.alert('로그인 실패', '관리자 아이디 또는 비밀번호가 올바르지 않습니다.\n(개발 기본값: admin / 1234)');
            }
        } finally {
            setIsLoggingIn(false);
        }
    };

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: darkBackground }}>
            <View className="px-6 py-4">
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="w-10 h-10 items-center justify-center rounded-full"
                    >
                        <ArrowLeft size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-gray-400 font-medium text-base">관리자 로그인</Text>
                    <View className="w-10" />
                </View>
            </View>

            <View className="flex-1 px-6">
                <View className="h-56 w-full rounded-3xl overflow-hidden mb-8 shadow-2xl elevation-10 relative bg-[#1a2e1a]">
                    <ImageBackground
                        source={{ uri: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=2070&auto=format&fit=crop" }}
                        className="w-full h-full"
                        resizeMode="cover"
                    >
                        <LinearGradient
                            colors={['transparent', 'transparent', '#0B120B']}
                            locations={[0, 0.4, 1]}
                            className="absolute inset-0"
                        />
                        <LinearGradient
                            colors={['transparent', 'rgba(11, 18, 11, 0.9)']}
                            className="absolute inset-x-0 bottom-0 h-32 justify-end px-6 pb-6"
                        >
                            <Text className="text-white text-3xl font-extrabold tracking-tight mb-1">
                                모임 관리자
                            </Text>
                            <Text className="text-gray-300 text-sm font-medium opacity-90">
                                전체 회원·일정·스코어를 한 계정으로 관리합니다
                            </Text>
                        </LinearGradient>
                    </ImageBackground>
                </View>

                <View>
                    <Text className="text-2xl font-bold text-white mb-6 tracking-tight">관리자 로그인</Text>

                    <View className="gap-5">
                        <View className="gap-2">
                            <Text className="text-sm font-semibold text-gray-300 ml-1">관리자 ID</Text>
                            <View className="relative justify-center">
                                <View className="absolute left-4 z-10">
                                    <User size={20} color="#9ca3af" />
                                </View>
                                <TextInput
                                    placeholder="admin"
                                    value={adminId}
                                    onChangeText={setAdminId}
                                    autoCapitalize="none"
                                    className="w-full h-14 pl-12 pr-4 bg-[#1C2A1C] rounded-xl text-white border border-[#2A3E2A] focus:border-[#00FF00]"
                                    placeholderTextColor="#4b5563"
                                />
                            </View>
                        </View>

                        <View className="gap-2">
                            <Text className="text-sm font-semibold text-gray-300 ml-1">비밀번호</Text>
                            <View className="relative justify-center">
                                <View className="absolute left-4 z-10">
                                    <Lock size={20} color="#9ca3af" />
                                </View>
                                <TextInput
                                    placeholder="••••••••"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    className="w-full h-14 pl-12 pr-12 bg-[#1C2A1C] rounded-xl text-white border border-[#2A3E2A] focus:border-[#00FF00]"
                                    placeholderTextColor="#4b5563"
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 z-10"
                                >
                                    {showPassword ? (
                                        <Eye size={20} color="#9ca3af" />
                                    ) : (
                                        <EyeOff size={20} color="#9ca3af" />
                                    )}
                                </TouchableOpacity>
                            </View>
                            <Text className="text-xs text-gray-500 ml-1">비밀번호는 서버의 ADMIN_PASSWORD로 관리합니다.</Text>
                        </View>

                        <TouchableOpacity
                            onPress={handleLogin}
                            disabled={isLoggingIn}
                            className="w-full h-14 bg-[#00FF00] rounded-xl flex-row items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,255,0,0.2)] mt-2"
                            activeOpacity={0.8}
                        >
                            {isLoggingIn ? (
                                <ActivityIndicator color="black" />
                            ) : (
                                <>
                                    <Text className="text-black font-extrabold text-lg">관리자로 로그인</Text>
                                    <LogIn size={20} color="black" strokeWidth={2.5} />
                                </>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View className="flex-row items-start gap-2 mt-8 mb-4 bg-[#142314] border border-[#2A3E2A] rounded-xl p-4">
                        <ShieldCheck size={18} color="#00FF00" />
                        <Text className="text-gray-400 text-sm flex-1">
                            회원은 개별 계정을 만들지 않습니다. 회원 등록·수정은 관리자가 회원 관리 메뉴에서 직접 합니다.
                        </Text>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}
