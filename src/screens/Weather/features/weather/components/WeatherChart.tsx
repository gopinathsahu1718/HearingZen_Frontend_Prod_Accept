import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Svg, {
  Line,
  Polyline,
  Text as SvgText,
  G,
} from 'react-native-svg';

const WeatherChart = () => {
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 40;
  const chartHeight = 200;
  
  // Data points for the temperature line
  const temperatureData = [19, 19, 18, 17, 16, 15, 15, 14, 14];
  const weatherConditions = [
    'scattered clouds',
    'scattered clouds',
    'broken clouds',
    'broken clouds',
    'broken clouds',
    'overcast clouds',
    'overcast clouds',
    'overcast clouds',
    'overcast clouds'
  ];
  const windSpeeds = ['3.4m/s', '2.6m/s', '2.6m/s', '2.3m/s', '1.8m/s', '1.6m/s', '1.3m/s', '1.2m/s', '1.4m/s'];
  const precipitationChance = ['0%', '0%', '0%', '0%', '0%', '0%', '0%', '0%', '0%'];
  
  // Calculate positions for the line chart
  const maxTemp = Math.max(...temperatureData);
  const minTemp = Math.min(...temperatureData);
  const tempRange = maxTemp - minTemp;
  const padding = 20;
  
  const points = temperatureData.map((temp, index) => {
    const x = (chartWidth / (temperatureData.length - 1)) * index;
    const y = chartHeight - padding - ((temp - minTemp) / tempRange) * (chartHeight - 2 * padding);
    return `${x},${y}`;
  }).join(' ');
  
  // Y-axis labels
  const yAxisLabels = [];
  for (let temp = 10; temp <= 25; temp += 5) {
    const y = chartHeight - padding - ((temp - minTemp) / tempRange) * (chartHeight - 2 * padding);
    yAxisLabels.push({ temp: `${temp}°`, y });
  }
  
  return (
    <View style={styles.container}>
      {/* Chart Area */}
      <View style={styles.chartContainer}>
        <Svg width={chartWidth} height={chartHeight} style={styles.svg}>
          {/* Y-axis grid lines and labels */}
          {yAxisLabels.map((label, index) => (
            <G key={index}>
              <Line
                x1="0"
                y1={label.y}
                x2={chartWidth}
                y2={label.y}
                stroke="#f0f0f0"
                strokeWidth="1"
              />
            </G>
          ))}
          
          {/* Temperature line */}
          <Polyline
            points={points}
            fill="none"
            stroke="#ff6b35"
            strokeWidth="2"
          />
        </Svg>
        
        {/* Y-axis labels positioned outside SVG */}
        <View style={styles.yAxisLabels}>
          {yAxisLabels.map((label, index) => (
            <Text key={index} style={[styles.yAxisLabel, { top: label.y - 8 }]}>
              {label.temp}
            </Text>
          ))}
        </View>
      </View>
      
      {/* Bottom section with weather data */}
      <View style={styles.bottomSection}>
        {/* Precipitation row */}
        <View style={styles.dataRow}>
          {precipitationChance.map((chance, index) => (
            <View key={index} style={styles.dataCell}>
              <Text style={styles.precipitationText}>{chance}</Text>
            </View>
          ))}
        </View>
        
        {/* Weather conditions row */}
        <View style={styles.dataRow}>
          {weatherConditions.map((condition, index) => (
            <View key={index} style={styles.dataCell}>
              <Text style={styles.conditionText}>{condition}</Text>
            </View>
          ))}
        </View>
        
        {/* Wind speed row */}
        <View style={styles.dataRow}>
          {windSpeeds.map((speed, index) => (
            <View key={index} style={styles.dataCell}>
              <Text style={styles.windSpeedText}>{speed}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  chartContainer: {
    position: 'relative',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  svg: {
    marginLeft: 30, // Space for Y-axis labels
  },
  yAxisLabels: {
    position: 'absolute',
    left: 0,
    top: 10,
    height: '100%',
  },
  yAxisLabel: {
    position: 'absolute',
    fontSize: 12,
    color: '#ff6b35',
    fontWeight: '500',
    left: 5,
  },
  bottomSection: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dataRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  dataCell: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  precipitationText: {
    fontSize: 10,
    color: '#4CAF50',
    fontWeight: '600',
  },
  conditionText: {
    fontSize: 8,
    color: '#666',
    textAlign: 'center',
    lineHeight: 10,
  },
  windSpeedText: {
    fontSize: 10,
    color: '#333',
    fontWeight: '500',
  },
});

export default WeatherChart;