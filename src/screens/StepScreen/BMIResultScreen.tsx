// screens/BMIResultScreen.js
import React from "react";
import { View, StyleSheet } from "react-native";
import BMIGauge from "./BMIGauge"; // The gauge UI code from before

export default function BMIResultScreen({ route }) {
    const { bmi } = route.params; // Get BMI value from navigation

    return (
        <View style={styles.container}>
            <BMIGauge bmi={bmi} />
            {/* Add other BMI result info here if needed */}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#161617ff",
        justifyContent: "center",
        alignItems: "center",
    },
});
