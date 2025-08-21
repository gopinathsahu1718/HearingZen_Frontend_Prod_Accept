import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const BOX_SIZE = width * 0.22; // 22% of screen width

export default function StatsPanel({
    distance = 5.2,
    calories = 320,
    activeMins = 45,
    water = 1.5, // liters
}) {
    const stats = [
        {
            label: 'Distance',
            value: `${distance} km`,
            icon: require('../../assets/stepIcons/distance.png'),
            bg: '#262629ff',
        },
        {
            label: 'Calories',
            value: `${calories}`,
            icon: require('../../assets/stepIcons/calories.png'),
            bg: '#262629ff',
        },
        {
            label: 'Active',
            value: `${activeMins} min`,
            icon: require('../../assets/stepIcons/time.png'),
            bg: '#262629ff',
        },
        {
            label: 'Water',
            value: `${water} L`,
            icon: require('../../assets/stepIcons/water.png'),
            bg: '#262629ff',
        },
    ];

    return (
        <View style={styles.container}>
            {stats.map((stat, index) => (
                <View
                    key={index}
                    style={[styles.statBox, { backgroundColor: stat.bg }]}
                >
                    <View style={styles.iconWrapper}>
                        <Image
                            source={stat.icon}
                            style={styles.icon}
                            resizeMode="contain"
                        />
                    </View>
                    <Text style={styles.value}>{stat.value}</Text>
                    <Text style={styles.label}>{stat.label}</Text>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginTop: 30,
    },
    statBox: {
        alignItems: 'center',
        justifyContent: 'center',
        flexBasis: BOX_SIZE, // box size based on screen width
        paddingVertical: width * 0.02, // responsive padding
        borderRadius: 12,
    },
    iconWrapper: {
        backgroundColor: '#101012ff',
        borderRadius: 50,
        padding: width * 0.015, // responsive padding
        marginBottom: 6,
    },
    icon: {
        width: width * 0.06,
        height: width * 0.06,
    },
    value: {
        fontSize: width * 0.04, // responsive font
        fontWeight: 'bold',
        color: '#fff',
    },
    label: {
        fontSize: width * 0.03,
        color: '#bbb',
        marginTop: 2,
    },
});
