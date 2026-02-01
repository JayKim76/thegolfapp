import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Mail, Lock, User, CheckCircle, Eye, EyeOff } from 'lucide-react-native';

export default function SignUpScreen() {
    const navigation = useNavigation<any>();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSignUp = () => {
        if (!name || !email || !password || !confirmPassword) {
            Alert.alert('오류', '모든 정보를 입력해주세요.');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('오류', '비밀번호가 일치하지 않습니다.');
            return;
        }

        setIsLoading(true);
        // Mock API call simulation
        setTimeout(() => {
            setIsLoading(false);
            Alert.alert('성공', '회원가입이 완료되었습니다.', [
                { text: '로그인하러 가기', onPress: () => navigation.goBack() }
            ]);
        }, 1500);
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="p-4 border-b border-gray-100 dark:border-gray-800">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="w-10 h-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800"
                >
                    <ArrowLeft size={24} color="black" />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
                    <Text className="text-3xl font-bold text-gray-900 mb-2">새 계정 만들기</Text>
                    <Text className="text-gray-500 mb-8">골프 라이프를 시작해보세요!</Text>

                    <View className="gap-5">
                        <View className="gap-1.5">
                            <Text className="text-sm font-medium text-gray-700 ml-1">이름</Text>
                            <View className="relative justify-center">
                                <View className="absolute left-4 z-10">
                                    <User size={20} color="#6b7280" />
                                </View>
                                <TextInput
                                    placeholder="홍길동"
                                    className="w-full h-14 pl-12 pr-4 bg-gray-50 rounded-xl text-black border border-gray-200 focus:border-emerald-500"
                                    placeholderTextColor="#9ca3af"
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>
                        </View>

                        <View className="gap-1.5">
                            <Text className="text-sm font-medium text-gray-700 ml-1">이메일</Text>
                            <View className="relative justify-center">
                                <View className="absolute left-4 z-10">
                                    <Mail size={20} color="#6b7280" />
                                </View>
                                <TextInput
                                    placeholder="user@example.com"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    className="w-full h-14 pl-12 pr-4 bg-gray-50 rounded-xl text-black border border-gray-200 focus:border-emerald-500"
                                    placeholderTextColor="#9ca3af"
                                    value={email}
                                    onChangeText={setEmail}
                                />
                            </View>
                        </View>

                        <View className="gap-1.5">
                            <Text className="text-sm font-medium text-gray-700 ml-1">비밀번호</Text>
                            <View className="relative justify-center">
                                <View className="absolute left-4 z-10">
                                    <Lock size={20} color="#6b7280" />
                                </View>
                                <TextInput
                                    placeholder="••••••••"
                                    secureTextEntry={!showPassword}
                                    className="w-full h-14 pl-12 pr-12 bg-gray-50 rounded-xl text-black border border-gray-200 focus:border-emerald-500"
                                    placeholderTextColor="#9ca3af"
                                    value={password}
                                    onChangeText={setPassword}
                                />
                                <TouchableOpacity
                                    className="absolute right-4 z-10"
                                    onPress={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff size={20} color="#6b7280" />
                                    ) : (
                                        <Eye size={20} color="#6b7280" />
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View className="gap-1.5">
                            <Text className="text-sm font-medium text-gray-700 ml-1">비밀번호 확인</Text>
                            <View className="relative justify-center">
                                <View className="absolute left-4 z-10">
                                    <CheckCircle size={20} color="#6b7280" />
                                </View>
                                <TextInput
                                    placeholder="••••••••"
                                    secureTextEntry={!showConfirmPassword}
                                    className="w-full h-14 pl-12 pr-12 bg-gray-50 rounded-xl text-black border border-gray-200 focus:border-emerald-500"
                                    placeholderTextColor="#9ca3af"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                />
                                <TouchableOpacity
                                    className="absolute right-4 z-10"
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff size={20} color="#6b7280" />
                                    ) : (
                                        <Eye size={20} color="#6b7280" />
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={handleSignUp}
                            disabled={isLoading}
                            className={`w-full h-14 bg-[#059669] rounded-xl flex-row items-center justify-center gap-2 shadow-lg mt-6 ${isLoading ? 'opacity-70' : ''}`}
                        >
                            <Text className="text-white font-bold text-lg">
                                {isLoading ? '가입 처리중...' : '회원가입 완료'}
                            </Text>
                        </TouchableOpacity>

                        <View className="flex-row justify-center py-4">
                            <Text className="text-gray-500 text-sm">이미 계정이 있으신가요? </Text>
                            <TouchableOpacity onPress={() => navigation.goBack()}>
                                <Text className="text-[#059669] font-bold text-sm">로그인</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
