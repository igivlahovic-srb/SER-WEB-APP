import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import QRCode from "react-native-qrcode-svg";
import { useAuthStore } from "../state/authStore";
import { useTwoFactorStore } from "../state/twoFactorStore";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "TwoFactorSetup">;

export default function TwoFactorSetupScreen({ navigation }: Props) {
  const user = useAuthStore((s) => s.user);
  const enableTwoFactor = useTwoFactorStore((s) => s.enableTwoFactor);
  const activateTwoFactor = useTwoFactorStore((s) => s.activateTwoFactor);
  const getBackupCodes = useTwoFactorStore((s) => s.getBackupCodes);

  const [secret, setSecret] = useState("");
  const [qrData, setQrData] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [step, setStep] = useState<"qr" | "verify" | "backup">("qr");
  const [loading, setLoading] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      const data = enableTwoFactor(user.id);
      setSecret(data.secret);
      setQrData(data.qrData);
      setBackupCodes(getBackupCodes(user.id));
    }
  }, [user]);

  const handleVerify = async () => {
    if (!user || verificationCode.length !== 6) {
      Alert.alert("Greška", "Unesite 6-cifreni kod");
      return;
    }

    setLoading(true);

    const success = await activateTwoFactor(user.id, verificationCode);

    setLoading(false);

    if (success) {
      setStep("backup");
    } else {
      Alert.alert("Greška", "Neispravan kod. Pokušajte ponovo.");
      setVerificationCode("");
    }
  };

  const handleFinish = () => {
    Alert.alert(
      "2FA Aktivirana",
      "Dvofaktorska autentifikacija je uspešno aktivirana za vaš nalog.",
      [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <LinearGradient
        colors={["#1E40AF", "#3B82F6"]}
        style={{ paddingTop: 0 }}
      >
        <SafeAreaView edges={["top"]}>
          <View className="flex-row items-center justify-between px-4 py-4">
            <Pressable onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </Pressable>
            <Text className="text-white text-lg font-semibold">
              Podešavanje 2FA
            </Text>
            <View style={{ width: 24 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView className="flex-1">
        {step === "qr" && (
          <View className="p-6">
            <View className="bg-white rounded-2xl p-6 shadow-sm mb-4">
              <View className="items-center mb-6">
                <View className="bg-blue-100 rounded-full p-4 mb-4">
                  <Ionicons name="shield-checkmark" size={48} color="#3B82F6" />
                </View>
                <Text className="text-gray-900 text-xl font-bold mb-2">
                  Skenirajte QR kod
                </Text>
                <Text className="text-gray-600 text-sm text-center">
                  Koristite authenticator aplikaciju (Google Authenticator, Authy, itd.) da skenirate kod
                </Text>
              </View>

              {qrData ? (
                <View className="items-center mb-6 p-4 bg-white rounded-xl">
                  <QRCode value={qrData} size={200} />
                </View>
              ) : (
                <View className="items-center mb-6 p-4">
                  <ActivityIndicator size="large" color="#3B82F6" />
                </View>
              )}

              <View className="bg-gray-50 rounded-xl p-4 mb-6">
                <Text className="text-gray-700 text-xs font-medium mb-2 text-center">
                  Ili unesite tajni ključ ručno:
                </Text>
                <Text className="text-gray-900 text-sm font-mono text-center">
                  {secret}
                </Text>
              </View>

              <Pressable
                onPress={() => setStep("verify")}
                className="active:opacity-80"
              >
                <LinearGradient
                  colors={["#1E40AF", "#3B82F6"]}
                  style={{
                    borderRadius: 12,
                    paddingVertical: 14,
                    alignItems: "center",
                  }}
                >
                  <Text className="text-white text-base font-semibold">
                    Nastavi
                  </Text>
                </LinearGradient>
              </Pressable>
            </View>

            <View className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <View className="flex-row items-start">
                <Ionicons name="information-circle" size={20} color="#3B82F6" />
                <Text className="text-blue-800 text-sm ml-2 flex-1">
                  Preuzimate authenticator aplikaciju sa App Store ili Google Play ako je već nemate.
                </Text>
              </View>
            </View>
          </View>
        )}

        {step === "verify" && (
          <View className="p-6">
            <View className="bg-white rounded-2xl p-6 shadow-sm mb-4">
              <View className="items-center mb-6">
                <View className="bg-green-100 rounded-full p-4 mb-4">
                  <Ionicons name="key" size={48} color="#10B981" />
                </View>
                <Text className="text-gray-900 text-xl font-bold mb-2">
                  Potvrdite kod
                </Text>
                <Text className="text-gray-600 text-sm text-center">
                  Unesite 6-cifreni kod iz vaše authenticator aplikacije
                </Text>
              </View>

              <View className="mb-6">
                <TextInput
                  className="bg-gray-50 rounded-xl px-4 py-4 text-center text-2xl font-mono text-gray-900 border border-gray-200"
                  placeholder="000000"
                  placeholderTextColor="#9CA3AF"
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus
                />
              </View>

              <Pressable
                onPress={handleVerify}
                disabled={loading || verificationCode.length !== 6}
                className="active:opacity-80"
              >
                <LinearGradient
                  colors={
                    verificationCode.length !== 6
                      ? ["#9CA3AF", "#6B7280"]
                      : ["#10B981", "#059669"]
                  }
                  style={{
                    borderRadius: 12,
                    paddingVertical: 14,
                    alignItems: "center",
                  }}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text className="text-white text-base font-semibold">
                      Potvrdi
                    </Text>
                  )}
                </LinearGradient>
              </Pressable>
            </View>

            <Pressable onPress={() => setStep("qr")}>
              <Text className="text-blue-600 text-sm text-center">
                Nazad na QR kod
              </Text>
            </Pressable>
          </View>
        )}

        {step === "backup" && (
          <View className="p-6">
            <View className="bg-white rounded-2xl p-6 shadow-sm mb-4">
              <View className="items-center mb-6">
                <View className="bg-yellow-100 rounded-full p-4 mb-4">
                  <Ionicons name="shield" size={48} color="#F59E0B" />
                </View>
                <Text className="text-gray-900 text-xl font-bold mb-2">
                  Backup kodovi
                </Text>
                <Text className="text-gray-600 text-sm text-center">
                  Sačuvajte ove kodove na sigurnom mestu. Možete ih koristiti za pristup ako izgubite telefon.
                </Text>
              </View>

              <View className="bg-gray-50 rounded-xl p-4 mb-6">
                {backupCodes.map((code, index) => (
                  <View
                    key={index}
                    className="flex-row items-center justify-between py-2 border-b border-gray-200"
                  >
                    <Text className="text-gray-400 text-sm">{index + 1}.</Text>
                    <Text className="text-gray-900 text-base font-mono">
                      {code}
                    </Text>
                  </View>
                ))}
              </View>

              <Pressable
                onPress={handleFinish}
                className="active:opacity-80"
              >
                <LinearGradient
                  colors={["#10B981", "#059669"]}
                  style={{
                    borderRadius: 12,
                    paddingVertical: 14,
                    alignItems: "center",
                  }}
                >
                  <Text className="text-white text-base font-semibold">
                    Završi podešavanje
                  </Text>
                </LinearGradient>
              </Pressable>
            </View>

            <View className="bg-red-50 border border-red-200 rounded-xl p-4">
              <View className="flex-row items-start">
                <Ionicons name="warning" size={20} color="#EF4444" />
                <Text className="text-red-800 text-sm ml-2 flex-1">
                  VAŽNO: Svaki backup kod može se koristiti samo jednom. Kada upotrebite sve kodove, možete generisati nove u podešavanjima.
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
