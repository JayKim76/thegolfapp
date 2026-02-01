import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { IdCard, Activity, Users, ArrowRight, Key } from 'lucide-react-native'; // Key icon for "Member" slide
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const slides = [
    {
        title: "간편한 회원 관리",
        englishTitle: "Easy Member Management",
        desc: "모든 클럽 회원, 프로필, 핸디캡을\n한 곳에서 안전하게 관리하세요.",
        Icon: Key,
        cardGradient: ['#3B82F6', '#0F172A'] as const, // Example gradient
    },
    {
        title: "실시간 스코어 추적",
        englishTitle: "Real-time Score Tracking",
        desc: "홀별로 간편하게 점수를 입력하고\n플레이 중 실시간 분석을 확인하세요.",
        Icon: Activity,
        cardGradient: ['#8B5CF6', '#4C1D95'] as const,
    },
    {
        title: "자동 조편성",
        englishTitle: "Automatic Team Formation",
        desc: "스마트 알고리즘을 사용하여 몇 초 만에\n공정하고 균형 잡힌 팀을 생성하세요.",
        Icon: Users,
        cardGradient: ['#F59E0B', '#78350F'] as const,
    }
];

export default function OnboardingScreen() {
    const [current, setCurrent] = useState(0);
    const navigation = useNavigation<any>();

    const next = () => {
        if (current < slides.length - 1) {
            setCurrent(current + 1);
        } else {
            navigation.navigate('Login');
        }
    };

    const skip = () => {
        navigation.navigate('Login');
    }

    const SlideIcon = slides[current].Icon;

    // Custom Neon Green Color
    const neonGreen = '#00FF00'; // Or specific hex from image 39FF14
    const darkBackground = '#0B120B'; // Very dark green/black

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: darkBackground }}>
            <View className="flex-1 px-6 py-8 justify-between">

                {/* Top Bar */}
                <View className="flex-row justify-end">
                    <TouchableOpacity onPress={skip}>
                        <Text className="text-gray-400 font-medium text-base">Skip</Text>
                    </TouchableOpacity>
                </View>

                {/* Main Content Area */}
                <View className="items-center justify-center flex-1">

                    {/* Gradient Card */}
                    <View className="w-full aspect-square max-w-[320px] mb-10 rounded-[40px] overflow-hidden shadow-2xl elevation-10">
                        <LinearGradient
                            // Using a fixed teal-ish gradient for the first slide to match image, 
                            // or dynamic based on slide. Let's try to match the image's teal look.
                            colors={['#4ADE80', '#115E59']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            className="w-full h-full items-center justify-center relative"
                        >
                            {/* Background Watermark Text */}
                            <View className="absolute inset-0 items-center justify-center opacity-10">
                                <Text className="text-white text-[50px] font-black tracking-widest leading-none text-center">
                                    MEMBER{'\n'}TEEMEA
                                </Text>
                            </View>

                            {/* Centered Icon & Label */}
                            <View className="items-center gap-4">
                                <SlideIcon size={64} color="rgba(255,255,255,0.9)" />
                                <Text className="text-white/80 font-semibold tracking-widest text-lg">MEMBER</Text>
                            </View>

                            {/* Floating Member ID Tag (Specific to first slide or decoration) */}
                            {current === 0 && (
                                <View className="absolute bottom-8 left-8 bg-[#1a2e1a] px-4 py-3 rounded-xl flex-row items-center gap-3 border border-white/10 shadow-lg">
                                    <IdCard size={20} color={neonGreen} />
                                    <View>
                                        <Text className="text-white text-[10px] font-bold uppercase">MEMBER ID</Text>
                                        <Text className="text-gray-300 text-xs font-medium">#8821-GLF</Text>
                                    </View>
                                </View>
                            )}
                        </LinearGradient>
                    </View>

                    {/* Text Content */}
                    <View className="items-center">
                        <Text className="text-white text-3xl font-bold text-center mb-4 leading-tight">
                            {slides[current].englishTitle}
                        </Text>
                        <Text className="text-gray-400 text-center text-base leading-6 px-4">
                            {/* Combining English feel with Korean desc for now, or just Korean */}
                            {slides[current].desc}
                        </Text>
                    </View>
                </View>

                {/* Bottom Controls */}
                <View className="w-full gap-8">
                    {/* Pagination */}
                    <View className="flex-row justify-center gap-2">
                        {slides.map((_, i) => (
                            <View
                                key={i}
                                className={`h-2 rounded-full transition-all duration-300 ${i === current ? 'w-8 bg-[#00FF00]' : 'w-2 bg-gray-600'}`}
                            />
                        ))}
                    </View>

                    {/* Large Button */}
                    <TouchableOpacity
                        onPress={next}
                        className="w-full h-14 bg-[#00FF00] rounded-xl flex-row items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,255,0,0.3)]"
                        activeOpacity={0.8}
                    >
                        <Text className="text-black font-extrabold text-lg">
                            {current === slides.length - 1 ? 'Start Golfing' : 'Next'}
                        </Text>
                        <ArrowRight size={24} color="black" strokeWidth={2.5} />
                    </TouchableOpacity>

                    {/* Bottom Link */}
                    <View className="flex-row justify-center items-center pb-2">
                        <Text className="text-gray-400 text-sm">Already a member? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text className="text-[#00FF00] font-bold text-sm">Log in</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}
