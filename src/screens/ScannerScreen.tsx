import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CameraView,
  CameraType,
  useCameraPermissions,
} from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";
import { useServiceStore } from "../state/serviceStore";
import { useAuthStore } from "../state/authStore";
import { ServiceTicket } from "../types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ScannerScreen() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [processing, setProcessing] = useState(false);
  const navigation = useNavigation<NavigationProp>();

  const addTicket = useServiceStore((s) => s.addTicket);
  const setCurrentTicket = useServiceStore((s) => s.setCurrentTicket);
  const user = useAuthStore((s) => s.user);

  if (!permission) {
    return (
      <View className="flex-1 bg-gray-900 items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900">
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="camera-outline" size={80} color="#6B7280" />
          <Text className="text-white text-xl font-semibold mt-6 mb-3 text-center">
            Potreban pristup kameri
          </Text>
          <Text className="text-gray-400 text-base text-center mb-8">
            Da biste skenirali QR kod water aparata, potreban je pristup kameri.
          </Text>
          <Pressable
            onPress={requestPermission}
            className="bg-blue-600 px-8 py-4 rounded-xl active:opacity-80"
          >
            <Text className="text-white text-base font-semibold">
              Omogući pristup
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const handleBarCodeScanned = ({ data }: { type: string; data: string }) => {
    if (scanned || processing) return;

    setScanned(true);
    setProcessing(true);

    // Create new service ticket
    const newTicket: ServiceTicket = {
      id: Date.now().toString(),
      deviceCode: data,
      technicianId: user?.id || "",
      technicianName: user?.name || "",
      startTime: new Date(),
      status: "in_progress",
      operations: [],
      spareParts: [],
    };

    addTicket(newTicket);
    setCurrentTicket(newTicket);

    // Navigate to service ticket screen
    setTimeout(() => {
      setProcessing(false);
      navigation.navigate("ServiceTicket");
    }, 500);
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const handleManualEntry = () => {
    // For now, create a demo ticket with manual code
    const demoCode = `WD-${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")}`;

    const newTicket: ServiceTicket = {
      id: Date.now().toString(),
      deviceCode: demoCode,
      technicianId: user?.id || "",
      technicianName: user?.name || "",
      startTime: new Date(),
      status: "in_progress",
      operations: [],
      spareParts: [],
    };

    addTicket(newTicket);
    setCurrentTicket(newTicket);
    navigation.navigate("ServiceTicket");
  };

  return (
    <View className="flex-1 bg-black">
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing={facing}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      />

      {/* Overlay UI */}
      <View style={StyleSheet.absoluteFillObject}>
        {/* Header */}
        <SafeAreaView edges={["top"]}>
          <View className="px-4 py-3 flex-row items-center justify-between">
            <Pressable
              onPress={() => navigation.goBack()}
              className="w-10 h-10 items-center justify-center bg-black/50 rounded-full active:opacity-70"
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </Pressable>
            <Pressable
              onPress={toggleCameraFacing}
              className="w-10 h-10 items-center justify-center bg-black/50 rounded-full active:opacity-70"
            >
              <Ionicons name="camera-reverse" size={24} color="#FFFFFF" />
            </Pressable>
          </View>
        </SafeAreaView>

        {/* Scanning Frame */}
        <View className="flex-1 items-center justify-center">
          <View className="relative">
            {/* QR Frame */}
            <View className="w-64 h-64 border-2 border-white rounded-3xl">
              {/* Corner decorations */}
              <View className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-2xl" />
              <View className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-2xl" />
              <View className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-2xl" />
              <View className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-2xl" />
            </View>

            {processing && (
              <View className="absolute inset-0 items-center justify-center bg-black/60 rounded-3xl">
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className="text-white text-base font-medium mt-3">
                  Procesiranje...
                </Text>
              </View>
            )}
          </View>

          <Text className="text-white text-lg font-medium mt-8 text-center px-8">
            Skenirajte QR kod water aparata
          </Text>
          <Text className="text-gray-300 text-sm mt-2 text-center px-8">
            Pozicionirajte QR kod unutar okvira
          </Text>
        </View>

        {/* Bottom Actions */}
        <SafeAreaView edges={["bottom"]}>
          <View className="px-6 pb-6">
            <Pressable
              onPress={handleManualEntry}
              className="bg-white/20 backdrop-blur px-6 py-4 rounded-2xl active:opacity-70"
            >
              <Text className="text-white text-base font-semibold text-center">
                Unesi šifru ručno
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
}
