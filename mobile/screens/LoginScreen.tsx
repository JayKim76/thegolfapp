import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ImageBackground, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, LogIn, MessageCircle } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen() {
    const navigation = useNavigation<any>();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Custom Colors
    const darkBackground = '#0B120B';
    const neonGreen = '#00FF00';
    const cardGradient = ['rgba(0,0,0,0)', 'rgba(0,0,0,0.8)'];

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: darkBackground }}>
            {/* Header / Back Button */}
            <View className="px-6 py-4">
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="w-10 h-10 items-center justify-center rounded-full"
                    >
                        <ArrowLeft size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-gray-400 font-medium text-base">Log In</Text>
                    <View className="w-10" />
                </View>
            </View>

            <View className="flex-1 px-6">
                {/* Welcome Back Card */}
                <View className="h-56 w-full rounded-3xl overflow-hidden mb-8 shadow-2xl elevation-10 relative bg-[#1a2e1a]">
                    <ImageBackground
                        source={{ uri: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=2070&auto=format&fit=crop" }} // Golf Swing Image
                        className="w-full h-full"
                        resizeMode="cover"
                    >
                        <LinearGradient
                            colors={['transparent', 'transparent', '#0B120B']}
                            locations={[0, 0.4, 1]}
                            className="absolute inset-0"
                        />
                        {/* Overlay Gradient for Text Readability */}
                        <LinearGradient
                            colors={['transparent', 'rgba(11, 18, 11, 0.9)']}
                            className="absolute inset-x-0 bottom-0 h-32 justify-end px-6 pb-6"
                        >
                            <Text className="text-white text-3xl font-extrabold tracking-tight mb-1">
                                Welcome Back
                            </Text>
                            <Text className="text-gray-300 text-sm font-medium opacity-90">
                                Ready to hit the green?
                            </Text>
                        </LinearGradient>
                    </ImageBackground>
                </View>

                {/* Form Section */}
                <View>
                    <Text className="text-2xl font-bold text-white mb-6 tracking-tight">Perfect Your Swing</Text>

                    <View className="gap-5">
                        {/* Email Input */}
                        <View className="gap-2">
                            <Text className="text-sm font-semibold text-gray-300 ml-1">Email Address</Text>
                            <View className="relative justify-center">
                                <View className="absolute left-4 z-10">
                                    <Mail size={20} color="#9ca3af" />
                                </View>
                                <TextInput
                                    placeholder="user@example.com"
                                    value={email}
                                    onChangeText={setEmail}
                                    className="w-full h-14 pl-12 pr-4 bg-[#1C2A1C] rounded-xl text-white border border-[#2A3E2A] focus:border-[#00FF00]"
                                    placeholderTextColor="#4b5563"
                                />
                            </View>
                        </View>

                        {/* Password Input */}
                        <View className="gap-2">
                            <Text className="text-sm font-semibold text-gray-300 ml-1">Password</Text>
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
                            <TouchableOpacity className="items-end mt-1">
                                <Text className="text-xs text-gray-400 font-medium hover:text-[#00FF00]">Forgot Password?</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Login Button */}
                        <TouchableOpacity
                            onPress={() => navigation.replace('MainTabs')}
                            className="w-full h-14 bg-[#00FF00] rounded-xl flex-row items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,255,0,0.2)] mt-2"
                            activeOpacity={0.8}
                        >
                            <Text className="text-black font-extrabold text-lg">Log In</Text>
                            <LogIn size={20} color="black" strokeWidth={2.5} />
                        </TouchableOpacity>
                    </View>

                    {/* Divider */}
                    <View className="flex-row items-center gap-4 py-8 opacity-60">
                        <View className="h-[1px] flex-1 bg-gray-700" />
                        <Text className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">OR CONTINUE WITH</Text>
                        <View className="h-[1px] flex-1 bg-gray-700" />
                    </View>

                    {/* Social Login Buttons */}
                    <View className="flex-row gap-3 justify-between">
                        <TouchableOpacity className="h-14 flex-1 rounded-xl bg-[#FEE500] items-center justify-center">
                            <MessageCircle size={24} color="#3c1e1e" fill="#3c1e1e" />
                        </TouchableOpacity>
                        <TouchableOpacity className="h-14 flex-1 rounded-xl bg-[#03C75A] items-center justify-center">
                            <Text className="text-white font-black text-xl">N</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="h-14 flex-1 rounded-xl bg-white items-center justify-center">
                            <Image
                                source={{ uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/1667px-Apple_logo_black.svg.png" }}
                                className="w-6 h-6"
                                resizeMode="contain"
                            />
                        </TouchableOpacity>
                        <TouchableOpacity className="h-14 flex-1 rounded-xl bg-white items-center justify-center">
                            <Image
                                source={{ uri: "https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png" }}
                                className="w-6 h-6"
                                resizeMode="contain"
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Sign Up Link */}
                    <View className="flex-row justify-center mt-8 mb-4">
                        <Text className="text-gray-400 text-sm">Don't have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                            <Text className="text-[#00FF00] font-bold text-sm">Sign up</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}
