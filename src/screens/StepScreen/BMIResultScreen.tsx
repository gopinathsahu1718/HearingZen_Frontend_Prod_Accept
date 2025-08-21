import React from 'react';
import { View, StyleSheet } from 'react-native';
import BMIGauge from './BMIGauge';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/types'; // Adjust path

type Props = StackScreenProps<RootStackParamList, 'BMIResult'>;

export default function BMIResultScreen({ route }: Props) {
    const { bmi } = route.params;

    return (
        <View style={styles.container}>
            <BMIGauge bmi={parseFloat(bmi)} />
            {/* You can display additional info like BMI status, recommendations, etc. */}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#161617ff',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
