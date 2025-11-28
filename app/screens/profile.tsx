import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, View } from "react-native";
import { useAuth } from "../../util/AuthContext";
import { supabase } from "../../util/supabase";

import BirthDateInput from "../components/BirthDateInput";
import Dropdown from "../components/Dropdown";
import LabeledInput from "../components/LabeledInput";
import PageWithMenu from "../components/PageWithMenu";
import PrimaryButton from "../components/PrimaryButton";
import SectionTitle from "../components/SectionTitle";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function ProfileScreen() {
  const router = useRouter();
  const { token, userId, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    blood_type: "",
    phone: "",
    date_of_birth: "",
    date_of_birth_display: "",
    allergies: "",
    medications: "",
    conditions: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relationship: "",
  });

  useEffect(() => {
    if (userId) loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;

      const dateDisplay = data?.date_of_birth
        ? `${data.date_of_birth.slice(8, 10)}/${data.date_of_birth.slice(5, 7)}/${data.date_of_birth.slice(0, 4)}`
        : "";

      setProfile({ ...data, date_of_birth_display: dateDisplay });
    } catch (err: any) {
      console.error(err);
      Alert.alert("Erro", err.message ?? "Erro inesperado ao carregar perfil.");
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    if (!profile.date_of_birth && profile.date_of_birth_display) {
      Alert.alert("Erro", "Data de nascimento inválida.");
      return;
    }

    try {
      setSaving(true);
      const { error } = await supabase.functions.invoke("update-profile", {
        body: profile,
        headers: { Authorization: `Bearer ${token}` },
      });
      if (error) throw error;
      Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
    } catch (err: any) {
      console.error(err);
      Alert.alert("Erro", err.message ?? "Erro inesperado ao atualizar perfil.");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      router.replace("/");
    } catch (err: any) {
      console.error(err);
      Alert.alert("Erro", err.message ?? "Erro ao sair da conta.");
    }
  };

  if (loading) {
    return (
      <PageWithMenu scroll={false}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" />
        </View>
      </PageWithMenu>
    );
  }

  return (
    <PageWithMenu>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 60, paddingTop: 10 }}>
        <PrimaryButton
          title={saving ? "Salvando..." : "Salvar Dados"}
          loading={saving}
          onPress={updateProfile}
        />

        <SectionTitle>Informações pessoais</SectionTitle>
        <LabeledInput
          label="Nome"
          value={profile.name}
          onChangeText={(t) => setProfile({ ...profile, name: t })}
        />
        <LabeledInput
          label="Telefone"
          value={profile.phone}
          keyboardType="phone-pad"
          onChangeText={(t) =>
            setProfile({ ...profile, phone: t.replace(/[^0-9+\-\(\)\s]/g, "") })
          }
        />
        <BirthDateInput
          value={profile.date_of_birth_display}
          onChange={(display, dbValue) =>
            setProfile({ ...profile, date_of_birth_display: display, date_of_birth: dbValue })
          }
        />
        <Dropdown
          label="Tipo sanguíneo"
          value={profile.blood_type}
          options={BLOOD_TYPES}
          onChange={(value) => setProfile({ ...profile, blood_type: value })}
        />

        <SectionTitle>Informações médicas</SectionTitle>
        <LabeledInput
          label="Alergias"
          value={profile.allergies}
          onChangeText={(t) => setProfile({ ...profile, allergies: t })}
        />
        <LabeledInput
          label="Medicações"
          value={profile.medications}
          onChangeText={(t) => setProfile({ ...profile, medications: t })}
        />
        <LabeledInput
          label="Condições médicas"
          value={profile.conditions}
          onChangeText={(t) => setProfile({ ...profile, conditions: t })}
        />

        <SectionTitle>Contato de emergência</SectionTitle>
        <LabeledInput
          label="Nome"
          value={profile.emergency_contact_name}
          onChangeText={(t) => setProfile({ ...profile, emergency_contact_name: t })}
        />
        <LabeledInput
          label="Telefone"
          value={profile.emergency_contact_phone}
          keyboardType="phone-pad"
          onChangeText={(t) =>
            setProfile({
              ...profile,
              emergency_contact_phone: t.replace(/[^0-9+\-\(\)\s]/g, ""),
            })
          }
        />
        <LabeledInput
          label="Parentesco"
          value={profile.emergency_contact_relationship}
          onChangeText={(t) =>
            setProfile({ ...profile, emergency_contact_relationship: t })
          }
        />

        <PrimaryButton
          title="Sair da Conta"
          loading={false}
          onPress={handleSignOut}
          style={{ backgroundColor: "#f44336", marginTop: 20 }}
        />
      </ScrollView>
    </PageWithMenu>
  );
}