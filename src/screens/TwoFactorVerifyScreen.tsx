import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../state/authStore";
import { useTwoFactorStore } from "../state/twoFactorStore";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "TwoFactorVerify">;

export default function TwoFactorVerifyScreen({ route }: Props) {
  const { userId } = route.params;
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [useBackup, setUseBackup] = useState(false);

  const verifyCode = useTwoFactorStore((s) => s.verifyCode);
  const verifyBackupCode = useTwoFactorStore((s) => s.useBackupCode);
  const completeTwoFactorLogin = useAuthStore((s) => s.completeTwoFactorLogin);

  const handleVerify = async () => {
    if (code.length < 6) {
      Alert.alert("Greška", "Unesite kompletan kod");
      return;
    }

    setLoading(true);

    let success = false;
    if (useBackup) {
      success = verifyBackupCode(userId, code);
    } else {
      success = await verifyCode(userId, code);
    }

    setLoading(false);

    if (success) {
      // Code is valid, complete the login
      completeTwoFactorLogin();
      // Navigation will be handled automatically by RootNavigator
      // when isAuthenticated becomes true
    } else {
      Alert.alert(
        "Greška",
        useBackup
          ? "Neispravan backup kod. Možda je već iskorišćen."
          : "Neispravan kod. Pokušajte ponovo."
      );
      setCode("");
    }
  };

  const handleLogout = () => {
    const logout = useAuthStore.getState().logout;
    logout();
  };

  return (
    <View className="flex-1">
      <LinearGradient
        colors={["#1E40AF", "#3B82F6", "#60A5FA"]}
        style={{ flex: 1 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView className="flex-1">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1"
          >
            <View className="flex-1 justify-center px-6">
              {/* Header */}
              <View className="items-center mb-8">
                <View className="bg-white/20 rounded-full p-4 mb-4">
                  <Ionicons name="shield-checkmark" size={64} color="#FFFFFF" />
                </View>
                <Text className="text-white text-3xl font-bold mb-2">
                  Dvofaktorska autentifikacija
                </Text>
                <Text className="text-blue-200 text-base text-center">
                  {useBackup
                    ? "Unesite backup kod"
                    : "Unesite kod iz authenticator aplikacije"}
                </Text>
              </View>

              {/* Verification Form */}
              <View className="bg-white rounded-3xl p-6 shadow-xl">
                <View className="mb-6">
                  <Text className="text-gray-700 text-sm font-medium mb-2 text-center">
                    {useBackup ? "Backup kod (8 cifara)" : "Verifikacioni kod (6 cifara)"}
                  </Text>
                  <TextInput
                    className="bg-gray-50 rounded-xl px-4 py-4 text-center text-3xl font-mono text-gray-900 border-2 border-gray-200"
                    placeholder={useBackup ? "00000000" : "000000"}
                    placeholderTextColor="#9CA3AF"
                    value={code}
                    onChangeText={setCode}
                    keyboardType="number-pad"
                    maxLength={useBackup ? 8 : 6}
                    autoFocus
                    returnKeyType="done"
                    onSubmitEditing={handleVerify}
                  />
                </View>

                {/* Verify Button */}
                <Pressable
                  onPress={handleVerify}
                  disabled={loading || code.length < (useBackup ? 8 : 6)}
                  className="active:opacity-80 mb-3"
                >
                  <LinearGradient
                    colors={
                      code.length < (useBackup ? 8 : 6)
                        ? ["#9CA3AF", "#6B7280"]
                        : ["#10B981", "#059669"]
                    }
                    style={{
                      borderRadius: 12,
                      paddingVertical: 16,
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

                {/* Toggle Backup Code */}
                <Pressable
                  onPress={() => {
                    setUseBackup(!useBackup);
                    setCode("");
                  }}
                  className="py-3"
                >
                  <Text className="text-blue-600 text-sm text-center font-medium">
                    {useBackup
                      ? "Koristi authenticator kod"
                      : "Koristi backup kod"}
                  </Text>
                </Pressable>
              </View>

              {/* Help Text */}
              <View className="mt-6 bg-white/10 backdrop-blur rounded-2xl p-4">
                <Text className="text-white text-xs text-center mb-2">
                  {useBackup
                    ? "Svaki backup kod može se koristiti samo jednom."
                    : "Kod se menja svakih 30 sekundi u vašoj authenticator aplikaciji."}
                </Text>
              </View>

              {/* Cancel Button */}
              <Pressable onPress={handleLogout} className="mt-4">
                <Text className="text-white text-sm text-center">
                  Odustani i vrati se na login
                </Text>
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
