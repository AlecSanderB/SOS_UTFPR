import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../AuthContext";
import AnimatedMenu from "../components/AnimatedMenu";

type Emergency = {
  id: string;
  latitude: number;
  longitude: number;
  nature_of_emergency: string;
  additional_info: string | null;
  status: string;
  created_at: string;
};

export default function EmergenciesScreen() {
  const { token } = useAuth();
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEmergencies = async () => {
    if (!token) {
      setError("Usuário não autenticado");
      setLoading(false);
      setRefreshing(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("https://ydhvbuoslztdnornlawv.supabase.co/functions/v1/get-emergencies", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json?.error || "Falha ao buscar emergências");

      setEmergencies(json.data);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEmergencies();
  }, [token]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEmergencies();
  };

  const renderItem = ({ item }: { item: Emergency }) => {
    let statusColor = "#f0ad4e";
    if (item.status === "resolved") statusColor = "#4CAF50";
    else if (item.status === "rejected") statusColor = "#f44336";

    return (
      <View style={styles.itemContainer}>
        <Text style={styles.title}>{item.nature_of_emergency}</Text>
        {item.additional_info ? <Text style={styles.info}>{item.additional_info}</Text> : null}
        <Text style={[styles.status, { color: statusColor }]}>Status: {item.status}</Text>
        <Text style={styles.date}>{new Date(item.created_at).toLocaleString()}</Text>
      </View>
    );
  };

  return (
    <View style={styles.page}>
      <AnimatedMenu />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text>Carregando emergências...</Text>
        </View>
      ) : error ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : emergencies.length === 0 ? (
        <View style={styles.loadingContainer}>
          <Text>Nenhuma emergência encontrada.</Text>
        </View>
      ) : (
        <FlatList
          data={emergencies}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#f5f5f5" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: "#a00", fontWeight: "bold" },
  list: { padding: 20, paddingTop: 110 },
  itemContainer: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 5 },
  info: { fontSize: 14, marginBottom: 5 },
  status: { fontSize: 14, fontWeight: "600", marginBottom: 5 },
  date: { fontSize: 12, color: "#666" },
});