import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Camera, User, Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MemberService } from '../services/MemberService';

export default function AddMemberScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { initialMember } = route.params || {};

    const isEditMode = !!initialMember;

    const [name, setName] = useState(initialMember?.name || '');
    const [handicap, setHandicap] = useState(initialMember?.handicap?.toString() || '');
    const [phone, setPhone] = useState(initialMember?.phone || '');
    const [gender, setGender] = useState(initialMember?.gender || 'male'); // 'male' or 'female'

    // Map initial type to state
    const mapTypeToState = (type: string) => {
        if (!type) return 'regular';
        if (type === '정회원') return 'regular';
        if (type === '준회원') return 'associate';
        if (type === '티칭프로') return 'pro';
        return 'regular';
    };
    const [memberType, setMemberType] = useState(mapTypeToState(initialMember?.type));

    const getMemberTypeLabel = (key: string) => {
        if (key === 'regular') return '정회원';
        if (key === 'associate') return '준회원';
        if (key === 'pro') return '티칭프로';
        return '정회원';
    };

    const handleSave = async () => {
        // Validation logic here
        if (!name) {
            Alert.alert('오류', '이름을 입력해주세요.');
            return;
        }

        const typeLabel = getMemberTypeLabel(memberType);
        const badges = [typeLabel === '티칭프로' ? 'PRO' : '', `HDCP ${handicap}`].filter(Boolean);

        const memberData = {
            name,
            handicap: parseFloat(handicap) || 0,
            phone,
            gender,
            type: typeLabel,
            badges
        };

        try {
            if (isEditMode) {
                await MemberService.updateMember(initialMember.id, memberData);
                Alert.alert('성공', '회원 정보가 수정되었습니다.', [{ text: '확인', onPress: () => navigation.goBack() }]);
            } else {
                await MemberService.addMember(memberData);
                Alert.alert('성공', '회원이 등록되었습니다.', [{ text: '확인', onPress: () => navigation.goBack() }]);
            }
        } catch (error) {
            console.error(error);
            Alert.alert('오류', isEditMode ? '회원 수정에 실패했습니다.' : '회원 등록에 실패했습니다.');
        }
    };

    return (
        <View className="flex-1 bg-[#0B120B]">
            <SafeAreaView className="flex-1" edges={['top']}>
                {/* Header */}
                <View className="px-6 py-4 flex-row items-center justify-between">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 items-center justify-center rounded-full bg-[#1C2A1C]">
                        <ArrowLeft size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white font-bold text-lg">{isEditMode ? '회원 정보 수정' : '회원 등록'}</Text>
                    <View className="w-10" />
                </View>

                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
                    <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>

                        {/* Profile Image Upload */}
                        <View className="items-center my-8">
                            <View className="w-32 h-32 rounded-full bg-[#1C2A1C] border-2 border-[#2A3C2A] items-center justify-center overflow-hidden relative">
                                <User size={48} color="#4B5563" />
                                <View className="absolute bottom-0 right-0 left-0 bg-[#000000]/60 h-10 items-center justify-center">
                                    <Camera size={16} color="white" />
                                </View>
                            </View>
                            <TouchableOpacity className="mt-3">
                                <Text className="text-[#00FF00] font-medium text-sm">프로필 사진 변경</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Form Fields */}
                        <View className="gap-6 mb-10">
                            {/* Name Input */}
                            <View className="gap-2">
                                <Text className="text-gray-400 font-medium text-sm ml-1">이름</Text>
                                <TextInput
                                    className="bg-[#1C2A1C] text-white p-4 rounded-xl border border-[#2A3C2A] text-base"
                                    placeholder="이름을 입력하세요"
                                    placeholderTextColor="#6B7280"
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>

                            {/* Gender Selection */}
                            <View className="gap-2">
                                <Text className="text-gray-400 font-medium text-sm ml-1">성별</Text>
                                <View className="flex-row gap-3">
                                    <TouchableOpacity
                                        onPress={() => setGender('male')}
                                        className={`flex-1 py-4 rounded-xl border items-center ${gender === 'male' ? 'bg-[#1C5E20] border-[#00FF00]' : 'bg-[#1C2A1C] border-[#2A3C2A]'}`}
                                    >
                                        <Text className={`font-bold ${gender === 'male' ? 'text-white' : 'text-gray-500'}`}>남자</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => setGender('female')}
                                        className={`flex-1 py-4 rounded-xl border items-center ${gender === 'female' ? 'bg-[#1C5E20] border-[#00FF00]' : 'bg-[#1C2A1C] border-[#2A3C2A]'}`}
                                    >
                                        <Text className={`font-bold ${gender === 'female' ? 'text-white' : 'text-gray-500'}`}>여자</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Handicap Input */}
                            <View className="gap-2">
                                <Text className="text-gray-400 font-medium text-sm ml-1">핸디캡</Text>
                                <TextInput
                                    className="bg-[#1C2A1C] text-white p-4 rounded-xl border border-[#2A3C2A] text-base"
                                    placeholder="핸디캡 (예: 18)"
                                    placeholderTextColor="#6B7280"
                                    value={handicap}
                                    onChangeText={setHandicap}
                                    keyboardType="numeric"
                                />
                            </View>

                            {/* Contact Info */}
                            <View className="gap-2">
                                <Text className="text-gray-400 font-medium text-sm ml-1">연락처</Text>
                                <TextInput
                                    className="bg-[#1C2A1C] text-white p-4 rounded-xl border border-[#2A3C2A] text-base"
                                    placeholder="010-0000-0000"
                                    placeholderTextColor="#6B7280"
                                    value={phone}
                                    onChangeText={setPhone}
                                    keyboardType="phone-pad"
                                />
                            </View>

                            {/* Member Type */}
                            <View className="gap-2">
                                <Text className="text-gray-400 font-medium text-sm ml-1">회원 등급</Text>
                                <View className="flex-row gap-2">
                                    {['regular', 'associate', 'pro'].map((type) => (
                                        <TouchableOpacity
                                            key={type}
                                            onPress={() => setMemberType(type)}
                                            className={`px-4 py-2 rounded-lg border ${memberType === type ? 'bg-[#00FF00] border-[#00FF00]' : 'bg-[#1C2A1C] border-[#2A3C2A]'}`}
                                        >
                                            <Text className={`text-sm font-bold ${memberType === type ? 'text-black' : 'text-gray-400'}`}>
                                                {type === 'regular' ? '정회원' : type === 'associate' ? '준회원' : '티칭프로'}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </View>

                    </ScrollView>
                </KeyboardAvoidingView>

                {/* Save Button Footer */}
                <View className="p-6 bg-[#0B120B] border-t border-[#1C2A1C]">
                    <TouchableOpacity
                        onPress={handleSave}
                        className="w-full bg-[#00FF00] py-4 rounded-2xl items-center shadow-lg shadow-green-900/50"
                    >
                        <Text className="text-[#0B120B] font-bold text-lg">{isEditMode ? '수정 완료' : '등록 완료'}</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}
