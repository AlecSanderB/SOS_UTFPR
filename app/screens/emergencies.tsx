import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
} from "react-native";
import { useAuth } from "../../util/AuthContext";
import { supabase } from "../../util/supabase";
import { useTheme } from "../../util/ThemeContext";
import EmergencyCard from "../components/EmergencyCard";
import PageWithMenu from "../components/PageWithMenu";

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
  const { theme } = useTheme();

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
      const { data: rawData, error } = await supabase.functions.invoke(
        "get-emergencies",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (error) throw error;

      const resData = typeof rawData === "string"
        ? JSON.parse(rawData)
        : rawData;

      setEmergencies(resData?.data ?? []);
    } catch (err: any) {
      console.error("Error fetching emergencies:", err);
      setError(err.message || "Ocorreu um erro inesperado.");
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

  const renderEmptyState = () => (
    <PageWithMenu
      scroll={false}
      contentContainerStyle={{
        ...styles.centered,
        backgroundColor: theme.colors.background,
      }}
    >
      {loading && (
        <>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Carregando emergências...
          </Text>
        </>
      )}

      {error && (
        <Text style={[styles.errorText, { color: theme.colors.primary }]}>
          {error}
        </Text>
      )}

      {!loading && !error && (
        <Text style={{ color: theme.colors.text }}>
          Nenhuma emergência encontrada.
        </Text>
      )}
    </PageWithMenu>
  );

  if (loading || error || emergencies.length === 0) return renderEmptyState();

  return (
    <PageWithMenu
      scroll={false}
      contentContainerStyle={{ backgroundColor: theme.colors.background }}
    >
      <FlatList
        data={emergencies}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <EmergencyCard item={item} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
            progressBackgroundColor={theme.colors.card}
          />
        }
        contentContainerStyle={{ padding: 20, paddingTop: 0 }}
      />
    </PageWithMenu>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    marginTop: 10,
    fontWeight: "bold",
    fontSize: 16,
  },
});