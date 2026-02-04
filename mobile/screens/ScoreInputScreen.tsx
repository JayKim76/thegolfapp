import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, Modal, Alert, TextInput, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, Edit2, Check, X, User, Search } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { OCRService, OCRResult, OCRPlayer } from '../services/OCRService';
import { RoundService } from '../services/RoundService';
import { MemberService, Member } from '../services/MemberService';

export default function ScoreInputScreen() {
    const navigation = useNavigation<any>();
    const [scannedImage, setScannedImage] = useState<string | null>(null);
    const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
    const [isScanning, setIsScanning] = useState(false);

    // For manual entry or editing
    const [scoreData, setScoreData] = useState<OCRPlayer[]>([]);

    // Edit Score Modal
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedPlayerIndex, setSelectedPlayerIndex] = useState<number | null>(null);
    const [tempScore, setTempScore] = useState('');

    // Member Selection Modal
    const [memberModalVisible, setMemberModalVisible] = useState(false);
    const [members, setMembers] = useState<Member[]>([]);
    const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
    const [memberSearchQuery, setMemberSearchQuery] = useState('');
    const [loadingMembers, setLoadingMembers] = useState(false);

    useEffect(() => {
        fetchMembers();
    }, []);

    useEffect(() => {
        if (memberSearchQuery.trim() === '') {
            setFilteredMembers(members);
        } else {
            const lowerDate = memberSearchQuery.toLowerCase();
            setFilteredMembers(members.filter(m =>
                m.name.toLowerCase().includes(lowerDate) ||
                m.phone.includes(lowerDate)
            ));
        }
    }, [memberSearchQuery, members]);

    const fetchMembers = async () => {
        setLoadingMembers(true);
        try {
            const data = await MemberService.getMembers();
            setMembers(data);
            setFilteredMembers(data);
        } catch (error) {
            console.error('Failed to fetch members', error);
        } finally {
            setLoadingMembers(false);
        }
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('권한 필요', '사진 라이브러리 접근 권한이 필요합니다.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            processImage(result.assets[0].uri);
        }
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('권한 필요', '카메라 접근 권한이 필요합니다.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            processImage(result.assets[0].uri);
        }
    };

    const processImage = async (uri: string) => {
        setScannedImage(uri);
        setIsScanning(true);
        try {
            const result = await OCRService.scanScorecard(uri);
            setOcrResult(result);
            setScoreData(result.players);
        } catch (error) {
            Alert.alert('오류', '스코어카드 인식에 실패했습니다.');
        } finally {
            setIsScanning(false);
        }
    };

    const handleSave = async () => {
        if (!ocrResult || scoreData.length === 0) {
            Alert.alert('저장 불가', '저장할 스코어 데이터가 없습니다.');
            return;
        }

        try {
            await RoundService.saveRound({
                date: ocrResult.date,
                courseName: '스카이 72 GC', // Default or select from course list later
                players: scoreData.map(p => ({
                    name: p.originalName,
                    memberId: p.matchedMemberId,
                    score: p.totalScore
                }))
            });
            Alert.alert('성공', '라운드 기록이 각 회원별로 저장되었습니다.', [
                { text: '확인', onPress: () => navigation.navigate('History') }
            ]);
        } catch (e) {
            Alert.alert('오류', '저장 중 문제가 발생했습니다.');
        }
    };

    const openEditModal = (index: number) => {
        setSelectedPlayerIndex(index);
        setTempScore(String(scoreData[index].totalScore));
        setEditModalVisible(true);
    };

    const openMemberModal = (index: number) => {
        setSelectedPlayerIndex(index);
        setMemberSearchQuery('');
        setMemberModalVisible(true);
    };

    const saveEdit = () => {
        if (selectedPlayerIndex !== null) {
            const newScore = parseInt(tempScore, 10);
            if (isNaN(newScore)) {
                Alert.alert('오류', '유효한 숫자를 입력해주세요.');
                return;
            }
            const updatedData = [...scoreData];
            updatedData[selectedPlayerIndex].totalScore = newScore;
            setScoreData(updatedData);
            setEditModalVisible(false);
        }
    };

    const selectMember = (member: Member) => {
        if (selectedPlayerIndex !== null) {
            const updatedData = [...scoreData];
            updatedData[selectedPlayerIndex].matchedMemberId = member.id;
            updatedData[selectedPlayerIndex].originalName = member.name; // Update name to match member
            setScoreData(updatedData);
            setMemberModalVisible(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-[#0B120B]" edges={['top', 'left', 'right']}>
            {/* Edit Score Modal */}
            <Modal
                transparent={true}
                visible={editModalVisible}
                animationType="fade"
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View className="flex-1 bg-black/80 items-center justify-center">
                    <View className="bg-[#1C2A1C] p-6 rounded-2xl w-80 border border-[#2A3C2A]">
                        <Text className="text-white text-lg font-bold mb-4">점수 수정</Text>
                        <TextInput
                            value={tempScore}
                            onChangeText={setTempScore}
                            keyboardType="number-pad"
                            className="bg-[#0B120B] text-white text-3xl font-bold p-4 rounded-xl text-center mb-6 border border-[#2A3C2A]"
                            autoFocus
                        />
                        <View className="flex-row gap-4">
                            <TouchableOpacity
                                onPress={() => setEditModalVisible(false)}
                                className="flex-1 bg-[#2A3C2A] p-3 rounded-xl items-center"
                            >
                                <Text className="text-gray-300 font-bold">취소</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={saveEdit}
                                className="flex-1 bg-[#00FF00] p-3 rounded-xl items-center"
                            >
                                <Text className="text-[#0B120B] font-bold">확인</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Member Selection Modal */}
            <Modal
                transparent={true}
                visible={memberModalVisible}
                animationType="slide"
                onRequestClose={() => setMemberModalVisible(false)}
            >
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-[#1C2A1C] h-[80%] rounded-t-3xl border-t border-[#2A3C2A]">
                        <View className="p-4 border-b border-[#2A3C2A] flex-row justify-between items-center">
                            <Text className="text-white text-xl font-bold">회원 연결</Text>
                            <TouchableOpacity onPress={() => setMemberModalVisible(false)}>
                                <X size={24} color="gray" />
                            </TouchableOpacity>
                        </View>

                        <View className="p-4">
                            <View className="bg-[#0B120B] rounded-xl flex-row items-center px-4 h-12 border border-[#2A3C2A]">
                                <Search size={20} color="gray" />
                                <TextInput
                                    className="flex-1 ml-3 text-white"
                                    placeholder="이름 검색..."
                                    placeholderTextColor="gray"
                                    value={memberSearchQuery}
                                    onChangeText={setMemberSearchQuery}
                                />
                            </View>
                        </View>

                        {loadingMembers ? (
                            <ActivityIndicator color="#00FF00" />
                        ) : (
                            <FlatList
                                data={filteredMembers}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        onPress={() => selectMember(item)}
                                        className="p-4 flex-row items-center border-b border-[#2A3C2A] active:bg-[#2A3C2A]"
                                    >
                                        <View className="w-10 h-10 rounded-full bg-gray-700 items-center justify-center mr-4">
                                            <Text className="text-white font-bold">{item.name[0]}</Text>
                                        </View>
                                        <View>
                                            <Text className="text-white font-bold text-lg">{item.name}</Text>
                                            <Text className="text-gray-400 text-sm">{item.phone}</Text>
                                        </View>
                                        {item.status === 'active' && (
                                            <View className="ml-auto bg-[#00FF00]/20 px-2 py-1 rounded">
                                                <Text className="text-[#00FF00] text-xs">활동중</Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                )}
                            />
                        )}
                    </View>
                </View>
            </Modal>

            {/* Header */}
            <View className="px-6 py-4 flex-row items-center justify-between border-b border-[#1C2A1C]">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <X size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-white">스코어 입력</Text>
                <TouchableOpacity onPress={handleSave}>
                    <Text className="text-[#00FF00] font-bold text-lg">저장</Text>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1">
                {/* 1. Scan Action */}
                {!scannedImage && (
                    <View className="p-6 items-center justify-center h-80">
                        <Text className="text-white text-lg mb-6 text-center">
                            스코어카드를 촬영하거나{'\n'}갤러리에서 불러오세요.
                        </Text>
                        <View className="flex-row gap-4">
                            <TouchableOpacity
                                onPress={takePhoto}
                                className="bg-[#00FF00] p-4 rounded-2xl items-center w-36"
                            >
                                <Camera size={32} color="#0B120B" />
                                <Text className="text-[#0B120B] font-bold mt-2">카메라 촬영</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={pickImage}
                                className="bg-[#1C2A1C] p-4 rounded-2xl items-center w-36 border border-[#2A3C2A]"
                            >
                                <Check size={32} color="white" />
                                <Text className="text-white font-bold mt-2">앨범 선택</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* 2. Scanning Progress */}
                {isScanning && (
                    <View className="p-10 items-center">
                        <ActivityIndicator size="large" color="#00FF00" />
                        <Text className="text-[#00FF00] mt-4 font-bold">스코어카드 분석 중...</Text>
                    </View>
                )}

                {/* 3. Result & Grid */}
                {!isScanning && scannedImage && (
                    <View>
                        {/* Scanned Image Preview */}
                        <View className="h-40 bg-black mb-4">
                            <Image source={{ uri: scannedImage }} className="w-full h-full" resizeMode="contain" />
                            <TouchableOpacity
                                onPress={() => setScannedImage(null)}
                                className="absolute top-2 right-2 bg-black/50 p-1 rounded-full"
                            >
                                <X size={20} color="white" />
                            </TouchableOpacity>
                        </View>

                        {/* Date */}
                        <View className="px-6 mb-4">
                            <Text className="text-gray-400">일자: {ocrResult?.date}</Text>
                        </View>

                        {/* Score Board Grid - Total Score Only */}
                        <View className="bg-[#142314] mx-4 rounded-2xl border border-[#2A3C2A] overflow-hidden mb-10">
                            {/* Header Row */}
                            <View className="flex-row border-b border-[#2A3C2A] bg-[#1C5E20]">
                                <View className="flex-1 p-4 justify-center"><Text className="text-white font-bold text-lg">이름 (터치하여 선택)</Text></View>
                                <View className="w-32 p-4 items-center justify-center border-l border-[#2A3C2A]"><Text className="text-[#00FF00] font-bold text-lg">전체 스코어</Text></View>
                            </View>

                            {/* Player Rows */}
                            {scoreData.map((player, idx) => (
                                <View key={idx} className="flex-row border-b border-[#2A3C2A] h-20 items-center">
                                    {/* Name Column (Click to Select Member) */}
                                    <TouchableOpacity
                                        onPress={() => openMemberModal(idx)}
                                        className="flex-1 pl-4 h-full justify-center active:bg-[#2A3C2A]"
                                    >
                                        <Text className="text-white font-bold text-xl numberOfLines={1}">{player.originalName}</Text>
                                        {player.matchedMemberId ? (
                                            <View className="flex-row items-center mt-1">
                                                <View className="w-2 h-2 rounded-full bg-[#00FF00] mr-1" />
                                                <Text className="text-[#00FF00] text-sm">회원 연결됨</Text>
                                            </View>
                                        ) : (
                                            <Text className="text-gray-500 text-sm mt-1">회원 미연결 (터치하여 선택)</Text>
                                        )}
                                    </TouchableOpacity>

                                    {/* Total with Edit Action */}
                                    <TouchableOpacity
                                        onPress={() => openEditModal(idx)}
                                        className="w-32 h-full items-center justify-center border-l border-[#2A3C2A] bg-[#1C2A1C] active:bg-[#2A3C2A]"
                                    >
                                        <Text className="text-white font-bold text-3xl underline decoration-gray-500 decoration-dotted">
                                            {player.totalScore}
                                        </Text>
                                        <Text className="text-gray-500 text-[10px] mt-1">수정</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>

                        <View className="px-6 mb-10">
                            <Text className="text-gray-500 text-center text-xs">
                                * 이름을 터치하여 회원을 연결하고, 점수를 터치하여 수정하세요.
                            </Text>
                        </View>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
