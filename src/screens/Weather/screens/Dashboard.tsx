// src/features/weather/Dashboard.tsx
import React from "react";
import { View, Text, ScrollView, Pressable, Dimensions } from "react-native";
import { LineChart, BarChart } from "react-native-chart-kit";
import { useTheme } from "../theme";
import { MOCK_WEATHER } from "../features/weather/mockData";

const { width: SCREEN_W } = Dimensions.get("window");
const CHART_W = Math.min(360, SCREEN_W - 48);

export default function Dashboard({ metric = "Temperature", onClose }: { metric?: string; onClose?: ()=>void }) {
  const theme = useTheme();
  const days = MOCK_WEATHER.days;

  const chartConfig = {
    backgroundGradientFrom: theme.card,
    backgroundGradientTo: theme.card,
    decimalPlaces: 0,
    color: (opacity = 1) => theme.accent,
    labelColor: () => theme.subtext,
  };

  if (metric === "AQI") {
    const data = { labels: days.map((_: any,i: number)=>`D${i+1}`), datasets: [{ data: days.map((d: { tempMax: any; tempMin: any; })=>Math.round((d.tempMax + d.tempMin)/2 + Math.random()*10)) }] };
    return (
      <ScrollView style={{ flex:1, padding:16, backgroundColor: theme.background }}>
        <View style={{ flexDirection:"row", justifyContent:"space-between", alignItems:"center" }}>
          <Text style={{ color: theme.text, fontSize:20, fontWeight:"700" }}>AQI Dashboard</Text>
          <Pressable onPress={onClose}><Text style={{ color: theme.text }}>Close</Text></Pressable>
        </View>
        <View style={{ marginTop:12, backgroundColor: theme.card, padding:12, borderRadius:12 }}>
          <BarChart data={data} width={CHART_W} height={220} chartConfig={chartConfig} yAxisLabel={""} yAxisSuffix={""} fromZero style={{ borderRadius:12 }} />
          <Text style={{ color: theme.subtext, marginTop:8 }}>Suggestions: Air is currently moderate. Avoid long outdoor exertion.</Text>
        </View>
      </ScrollView>
    );
  }

  const tdata = { labels: days.map((d: { date: string | number | Date; })=>new Date(d.date).toLocaleDateString(undefined,{weekday:"short"})), datasets: [{ data: days.map((d: { tempMax: any; })=>d.tempMax) }] };
  return (
    <ScrollView style={{ flex:1, padding:16, backgroundColor: theme.background }}>
      <View style={{ flexDirection:"row", justifyContent:"space-between", alignItems:"center" }}>
        <Text style={{ color: theme.text, fontSize:20, fontWeight:"700" }}>{metric} Dashboard</Text>
        <Pressable onPress={onClose}><Text style={{ color: theme.text }}>Close</Text></Pressable>
      </View>

      <View style={{ marginTop:12, backgroundColor: theme.card, padding:12, borderRadius:12 }}>
        <LineChart data={tdata} width={CHART_W} height={220} chartConfig={chartConfig} yAxisLabel={""} yAxisSuffix={"°"} bezier style={{ borderRadius:12 }} />
        <Text style={{ color: theme.subtext, marginTop:8 }}>Suggestions: Drink water on hot days, stay shaded.</Text>
      </View>
    </ScrollView>
  );
}
