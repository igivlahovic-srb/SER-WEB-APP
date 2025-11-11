import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
  Switch,
  Modal,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSyncStore } from "../state/syncStore";
import { useAuthStore } from "../state/authStore";
import { useServiceStore } from "../state/serviceStore";
import { useConfigStore } from "../state/configStore";
import { format } from "date-fns";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const apiUrl = useSyncStore((s) => s.apiUrl);
  const autoSync = useSyncStore((s) => s.autoSync);
  const lastSyncTime = useSyncStore((s) => s.lastSyncTime);
  const isSyncing = useSyncStore((s) => s.isSyncing);
  const liveUpdateEnabled = useSyncStore((s) => s.liveUpdateEnabled);

  const setApiUrl = useSyncStore((s) => s.setApiUrl);
  const setAutoSync = useSyncStore((s) => s.setAutoSync);
  const setLastSyncTime = useSyncStore((s) => s.setLastSyncTime);
  const setIsSyncing = useSyncStore((s) => s.setIsSyncing);
  const testConnection = useSyncStore((s) => s.testConnection);
  const setLiveUpdateEnabled = useSyncStore((s) => s.setLiveUpdateEnabled);
  const getBackups = useSyncStore((s) => s.getBackups);
  const createBackup = useSyncStore((s) => s.createBackup);
  const restoreBackup = useSyncStore((s) => s.restoreBackup);

  const syncUsersToWeb = useAuthStore((s) => s.syncToWeb);
  const syncTicketsToWeb = useServiceStore((s) => s.syncToWeb);
  const fetchUsersFromWeb = useAuthStore((s) => s.fetchFromWeb);
  const fetchTicketsFromWeb = useServiceStore((s) => s.syncFromWeb);

  const fetchConfig = useConfigStore((s) => s.fetchConfig);
  const lastConfigSync = useConfigStore((s) => s.lastConfigSync);

  const [urlInput, setUrlInput] = useState(apiUrl);
  const [testing, setTesting] = useState(false);
  const [refreshingConfig, setRefreshingConfig] = useState(false);
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [restoringBackup, setRestoringBackup] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [backupList, setBackupList] = useState<any[]>([]);
  const [loadingBackups, setLoadingBackups] = useState(false);

  // Live update polling
  useEffect(() => {
    if (!liveUpdateEnabled || !apiUrl) return;

    const interval = setInterval(async () => {
      try {
        const connectionOk = await testConnection();
        if (connectionOk) {
          await Promise.all([
            fetchUsersFromWeb(),
            fetchTicketsFromWeb(),
          ]);
          setLastSyncTime(new Date());
        }
      } catch (error) {
        console.error("Live update error:", error);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [liveUpdateEnabled, apiUrl]);

  const handleSaveUrl = () => {
    if (!urlInput.trim()) {
      Alert.alert("Greška", "URL ne može biti prazan");
      return;
    }

    setApiUrl(urlInput.trim());
    Alert.alert("Uspeh", "API URL sačuvan");
  };

  const handleTestConnection = async () => {
    if (!urlInput.trim()) {
      Alert.alert("Greška", "Prvo unesite URL web panela");
      return;
    }

    // Check if using localhost in Expo environment
    if (urlInput.includes("localhost") || urlInput.includes("127.0.0.1")) {
      Alert.alert(
        "Upozorenje",
        "Koristite 'localhost' ali ste u mobilnoj aplikaciji.\n\nZa testiranje na pravom telefonu, koristite:\n• IP adresu računara (npr. http://192.168.1.100:3000) ako je na lokalnoj mreži\n• Javnu IP adresu ili domen ako je server dostupan javno\n\nZa Expo Go ili iOS Simulator, možete nastaviti sa testiranjem."
      );
    }

    setTesting(true);
    const success = await testConnection();
    setTesting(false);

    if (success) {
      Alert.alert("Uspeh", "Konekcija sa web panelom je uspešna! ✅");
    } else {
      Alert.alert(
        "Greška konekcije",
        "Ne mogu da se povežem sa web panelom.\n\n" +
        "Mogući razlozi:\n" +
        "• Web panel nije pokrenut\n" +
        "• Pogrešan URL ili adresa\n" +
        "• Koristite 'localhost' umesto stvarne IP adrese ili domena\n" +
        "• Firewall blokira konekciju\n" +
        "• Server nije dostupan sa vaše mreže\n\n" +
        "Saveti:\n" +
        "• Pokrenite web panel: cd web-admin && bun dev\n" +
        "• Koristite IP adresu računara ili javni domen, ne localhost\n" +
        "• Proverite da mobilni uređaj može da pristupi serveru"
      );
    }
  };

  const handleSyncNow = async () => {
    if (isSyncing) return;

    setIsSyncing(true);

    try {
      // Test connection first
      const connectionOk = await testConnection();
      if (!connectionOk) {
        Alert.alert(
          "Greška konekcije",
          "Ne mogu da se povežem sa web panelom. Proverite podešavanja."
        );
        setIsSyncing(false);
        return;
      }

      // Sync users
      const usersSync = await syncUsersToWeb();
      if (!usersSync) {
        Alert.alert("Greška", "Sinhronizacija korisnika nije uspela");
        setIsSyncing(false);
        return;
      }

      // Sync tickets
      const ticketsSync = await syncTicketsToWeb();
      if (!ticketsSync) {
        Alert.alert("Greška", "Sinhronizacija servisa nije uspela");
        setIsSyncing(false);
        return;
      }

      setLastSyncTime(new Date());
      Alert.alert(
        "Uspeh",
        "Svi podaci su uspešno sinhronizovani sa web panelom! ✅"
      );
    } catch (error) {
      Alert.alert("Greška", "Došlo je do greške pri sinhronizaciji");
      console.error(error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRefreshConfig = async () => {
    if (refreshingConfig) return;

    setRefreshingConfig(true);

    try {
      // Test connection first
      const connectionOk = await testConnection();
      if (!connectionOk) {
        Alert.alert(
          "Greška konekcije",
          "Ne mogu da se povežem sa web panelom. Proverite podešavanja."
        );
        setRefreshingConfig(false);
        return;
      }

      // Fetch config (operations and spare parts) from web admin
      const success = await fetchConfig();

      if (success) {
        Alert.alert(
          "Uspeh",
          "Operacije i rezervni delovi su uspešno ažurirani sa web panela! ✅"
        );
      } else {
        Alert.alert(
          "Greška",
          "Nije moguće učitati operacije i rezervne delove sa web panela"
        );
      }
    } catch (error) {
      Alert.alert("Greška", "Došlo je do greške pri ažuriranju konfiguracije");
      console.error(error);
    } finally {
      setRefreshingConfig(false);
    }
  };

  const handleCreateBackup = async () => {
    if (creatingBackup) return;

    setCreatingBackup(true);

    try {
      const connectionOk = await testConnection();
      if (!connectionOk) {
        Alert.alert(
          "Greška konekcije",
          "Ne mogu da se povežem sa web panelom. Proverite podešavanja."
        );
        setCreatingBackup(false);
        return;
      }

      const success = await createBackup();

      if (success) {
        Alert.alert(
          "Uspeh",
          "Backup je uspešno kreiran! Možete ga preuzeti sa web admin panela."
        );
      } else {
        Alert.alert(
          "Greška",
          "Nije moguće kreirati backup. Proverite web admin panel."
        );
      }
    } catch (error) {
      Alert.alert("Greška", "Došlo je do greške pri kreiranju backup-a");
      console.error(error);
    } finally {
      setCreatingBackup(false);
    }
  };

  const handleOpenBackupModal = async () => {
    setShowBackupModal(true);
    setLoadingBackups(true);

    try {
      const connectionOk = await testConnection();
      if (!connectionOk) {
        Alert.alert(
          "Greška konekcije",
          "Ne mogu da se povežem sa web panelom."
        );
        setShowBackupModal(false);
        return;
      }

      const backups = await getBackups();
      setBackupList(backups);
    } catch (error) {
      Alert.alert("Greška", "Nije moguće učitati listu backup-ova");
      console.error(error);
    } finally {
      setLoadingBackups(false);
    }
  };

  const handleRestoreBackup = async (filename: string) => {
    Alert.alert(
      "Potvrda",
      "Da li ste sigurni da želite da vratite podatke iz ovog backup-a? Svi trenutni podaci će biti zamenjeni.",
      [
        { text: "Otkaži", style: "cancel" },
        {
          text: "Vrati",
          style: "destructive",
          onPress: async () => {
            setRestoringBackup(true);
            setShowBackupModal(false);

            try {
              const success = await restoreBackup(filename);

              if (success) {
                // Refresh local data after restore
                await Promise.all([
                  fetchUsersFromWeb(),
                  fetchTicketsFromWeb(),
                  fetchConfig(),
                ]);

                Alert.alert(
                  "Uspeh",
                  "Podaci su uspešno vraćeni iz backup-a!"
                );
              } else {
                Alert.alert(
                  "Greška",
                  "Nije moguće vratiti podatke iz backup-a"
                );
              }
            } catch (error) {
              Alert.alert("Greška", "Došlo je do greške pri vraćanju backup-a");
              console.error(error);
            } finally {
              setRestoringBackup(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        <View className="px-6 py-6">
          {/* Sync Status Card */}
          <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-900 text-xl font-bold">
                Web Admin Sync
              </Text>
              <Ionicons name="cloud-outline" size={32} color="#3B82F6" />
            </View>

            {lastSyncTime && (
              <View className="bg-blue-50 rounded-xl p-3 mb-4">
                <Text className="text-blue-900 text-sm font-medium">
                  Poslednja sinhronizacija:
                </Text>
                <Text className="text-blue-700 text-xs mt-1">
                  {format(new Date(lastSyncTime), "dd.MM.yyyy HH:mm:ss")}
                </Text>
              </View>
            )}

            <Text className="text-gray-600 text-sm mb-4">
              Sinhronizujte podatke između mobilne aplikacije i web admin panela
            </Text>

            <Pressable
              onPress={handleSyncNow}
              disabled={isSyncing || testing}
              className={`rounded-2xl px-6 py-4 flex-row items-center justify-center ${
                isSyncing || testing ? "bg-gray-300" : "bg-blue-600"
              }`}
            >
              {isSyncing ? (
                <>
                  <ActivityIndicator color="#FFFFFF" className="mr-2" />
                  <Text className="text-white text-base font-bold">
                    Sinhronizacija u toku...
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name="sync" size={20} color="#FFFFFF" />
                  <Text className="text-white text-base font-bold ml-2">
                    Sinhronizuj sada
                  </Text>
                </>
              )}
            </Pressable>
          </View>

          {/* Auto Sync Setting */}
          <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 mr-4">
                <Text className="text-gray-900 text-base font-bold mb-1">
                  Automatska sinhronizacija
                </Text>
                <Text className="text-gray-600 text-sm">
                  Automatski sinhronizuj podatke nakon promene
                </Text>
              </View>
              <Switch
                value={autoSync}
                onValueChange={setAutoSync}
                trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
                thumbColor={autoSync ? "#3B82F6" : "#F3F4F6"}
              />
            </View>
          </View>

          {/* Configuration Refresh */}
          <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-900 text-xl font-bold">
                Operacije i rezervni delovi
              </Text>
              <Ionicons name="build-outline" size={32} color="#10B981" />
            </View>

            {lastConfigSync && (
              <View className="bg-emerald-50 rounded-xl p-3 mb-4">
                <Text className="text-emerald-900 text-sm font-medium">
                  Poslednje ažuriranje:
                </Text>
                <Text className="text-emerald-700 text-xs mt-1">
                  {format(new Date(lastConfigSync), "dd.MM.yyyy HH:mm:ss")}
                </Text>
              </View>
            )}

            <Text className="text-gray-600 text-sm mb-4">
              Ažurirajte listu operacija i rezervnih delova sa web admin panela
            </Text>

            <Pressable
              onPress={handleRefreshConfig}
              disabled={refreshingConfig || testing || isSyncing}
              className={`rounded-2xl px-6 py-4 flex-row items-center justify-center ${
                refreshingConfig || testing || isSyncing ? "bg-gray-300" : "bg-emerald-600"
              }`}
            >
              {refreshingConfig ? (
                <>
                  <ActivityIndicator color="#FFFFFF" className="mr-2" />
                  <Text className="text-white text-base font-bold">
                    Ažuriranje u toku...
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name="refresh" size={20} color="#FFFFFF" />
                  <Text className="text-white text-base font-bold ml-2">
                    Osveži operacije i delove
                  </Text>
                </>
              )}
            </Pressable>
          </View>

          {/* Live Update Toggle */}
          <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 mr-4">
                <Text className="text-gray-900 text-base font-bold mb-1">
                  Portal Live Update
                </Text>
                <Text className="text-gray-600 text-sm">
                  Automatski učitaj promene sa web portala svakih 30 sekundi
                </Text>
              </View>
              <Switch
                value={liveUpdateEnabled}
                onValueChange={setLiveUpdateEnabled}
                trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
                thumbColor={liveUpdateEnabled ? "#3B82F6" : "#F3F4F6"}
              />
            </View>
          </View>

          {/* Backup and Restore */}
          <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-900 text-xl font-bold">
                Backup i Restore
              </Text>
              <Ionicons name="save-outline" size={32} color="#8B5CF6" />
            </View>

            <Text className="text-gray-600 text-sm mb-4">
              Kreirajte backup svih podataka ili vratite podatke iz postojećeg backup-a
            </Text>

            <View className="gap-3">
              <Pressable
                onPress={handleCreateBackup}
                disabled={creatingBackup || testing || isSyncing || restoringBackup}
                className={`rounded-2xl px-6 py-4 flex-row items-center justify-center ${
                  creatingBackup || testing || isSyncing || restoringBackup
                    ? "bg-gray-300"
                    : "bg-purple-600"
                }`}
              >
                {creatingBackup ? (
                  <>
                    <ActivityIndicator color="#FFFFFF" className="mr-2" />
                    <Text className="text-white text-base font-bold">
                      Kreiranje backup-a...
                    </Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="cloud-upload-outline" size={20} color="#FFFFFF" />
                    <Text className="text-white text-base font-bold ml-2">
                      Kreiraj Backup
                    </Text>
                  </>
                )}
              </Pressable>

              <Pressable
                onPress={handleOpenBackupModal}
                disabled={restoringBackup || testing || isSyncing || creatingBackup}
                className={`rounded-2xl px-6 py-4 flex-row items-center justify-center ${
                  restoringBackup || testing || isSyncing || creatingBackup
                    ? "bg-gray-300"
                    : "bg-indigo-600"
                }`}
              >
                {restoringBackup ? (
                  <>
                    <ActivityIndicator color="#FFFFFF" className="mr-2" />
                    <Text className="text-white text-base font-bold">
                      Vraćanje podataka...
                    </Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="cloud-download-outline" size={20} color="#FFFFFF" />
                    <Text className="text-white text-base font-bold ml-2">
                      Vrati iz Backup-a
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>

          {/* API Configuration */}
          <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
            <Text className="text-gray-900 text-xl font-bold mb-4">
              Podešavanja API-ja
            </Text>

            <View className="mb-4">
              <Text className="text-gray-700 text-sm font-semibold mb-2">
                Web Admin Panel URL
              </Text>
              <TextInput
                className="bg-gray-50 rounded-xl px-4 py-3 text-gray-900 text-base border-2 border-gray-200"
                placeholder="http://api.example.com:3000"
                placeholderTextColor="#9CA3AF"
                value={urlInput}
                onChangeText={setUrlInput}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
              <Text className="text-gray-500 text-xs mt-2">
                Unesite IP adresu, javnu IP ili domen web panela
              </Text>
            </View>

            <View className="flex-row gap-2">
              <Pressable
                onPress={handleSaveUrl}
                disabled={testing || isSyncing}
                className="flex-1 bg-blue-600 rounded-xl px-4 py-3 active:opacity-80"
              >
                <Text className="text-white text-sm font-semibold text-center">
                  💾 Sačuvaj
                </Text>
              </Pressable>

              <Pressable
                onPress={handleTestConnection}
                disabled={testing || isSyncing}
                className="flex-1 bg-emerald-600 rounded-xl px-4 py-3 active:opacity-80"
              >
                {testing ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-white text-sm font-semibold text-center">
                    🔌 Testiraj
                  </Text>
                )}
              </Pressable>
            </View>
          </View>

          {/* Info Card */}
          <View className="bg-blue-50 rounded-2xl p-4 border border-blue-200 mb-4">
            <View className="flex-row items-start gap-3">
              <Ionicons name="information-circle" size={24} color="#3B82F6" />
              <View className="flex-1">
                <Text className="text-blue-900 text-sm font-semibold mb-1">
                  Kako koristiti Web Admin Panel:
                </Text>
                <Text className="text-blue-800 text-xs leading-5">
                  1. Pokrenite web admin panel na serveru:{"\n"}
                  {"   "}cd web-admin && bun dev{"\n"}
                  {"\n"}
                  2. Unesite URL web panela:{"\n"}
                  {"   "}• Lokalna mreža: http://192.168.1.XXX:3000{"\n"}
                  {"   "}• Javna adresa: http://vasdomen.com:3000{"\n"}
                  {"   "}• Javna IP: http://XX.XX.XX.XX:3000{"\n"}
                  {"\n"}
                  3. Sačuvajte i testirajte konekciju{"\n"}
                  {"\n"}
                  4. Sinhronizujte podatke{"\n"}
                  {"\n"}
                  ⚠️ NE koristite localhost ili 127.0.0.1!
                </Text>
              </View>
            </View>
          </View>

          {/* Warning Card */}
          <View className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
            <View className="flex-row items-start gap-3">
              <Ionicons name="warning" size={24} color="#F59E0B" />
              <View className="flex-1">
                <Text className="text-amber-900 text-sm font-semibold mb-1">
                  Važno:
                </Text>
                <Text className="text-amber-800 text-xs leading-5">
                  • Mobilni uređaj mora imati mrežni pristup serveru{"\n"}
                  • Web panel mora biti pokrenut pre testiranja{"\n"}
                  • Firewall ili router mogu blokirati pristup{"\n"}
                  • Za javni pristup, server mora biti izložen internetu
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Backup Restore Modal */}
      <Modal
        visible={showBackupModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowBackupModal(false)}
      >
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
            <Text className="text-gray-900 text-xl font-bold">
              Izaberi Backup
            </Text>
            <Pressable
              onPress={() => setShowBackupModal(false)}
              className="w-8 h-8 items-center justify-center"
            >
              <Ionicons name="close" size={28} color="#6B7280" />
            </Pressable>
          </View>

          {loadingBackups ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text className="text-gray-600 text-sm mt-4">
                Učitavanje backup-ova...
              </Text>
            </View>
          ) : backupList.length === 0 ? (
            <View className="flex-1 items-center justify-center px-6">
              <Ionicons name="cloud-offline-outline" size={64} color="#9CA3AF" />
              <Text className="text-gray-900 text-lg font-semibold mt-4">
                Nema dostupnih backup-ova
              </Text>
              <Text className="text-gray-500 text-sm text-center mt-2">
                Kreirajte novi backup da biste mogli da vratite podatke
              </Text>
            </View>
          ) : (
            <FlatList
              data={backupList}
              keyExtractor={(item) => item.filename}
              contentContainerClassName="px-6 py-4"
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => handleRestoreBackup(item.filename)}
                  className="bg-white rounded-xl p-4 mb-3 border-2 border-gray-200 active:border-indigo-500"
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-gray-900 text-base font-bold flex-1">
                      {item.version || "Unknown Version"}
                    </Text>
                    <View className="bg-indigo-100 px-3 py-1 rounded-lg">
                      <Text className="text-indigo-700 text-xs font-semibold">
                        {item.size || "N/A"}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row items-center gap-2 mb-1">
                    <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                    <Text className="text-gray-600 text-sm">
                      {item.date ? format(new Date(item.date), "dd.MM.yyyy HH:mm") : "Unknown Date"}
                    </Text>
                  </View>
                  <Text className="text-gray-500 text-xs" numberOfLines={1}>
                    {item.filename}
                  </Text>
                </Pressable>
              )}
            />
          )}
        </SafeAreaView>
      </Modal>
    </View>
  );
}
