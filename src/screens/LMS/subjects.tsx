// FeaturedCoursesScreen.js
import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native"; // ✅ import navigation hook

const { width } = Dimensions.get("window");
const CARD_HORIZONTAL_PADDING = 2;
const CARD_WIDTH = width - CARD_HORIZONTAL_PADDING * 2;
const IMAGE_HEIGHT = Math.round((CARD_WIDTH * 9) / 16); // 16:9 image area

const sampleCourses = [
  {
    id: "1",
    title: "Web Development",
    image: require("../../assets/LMS/web-development.png"),
  },
  {
    id: "2",
    title: "App Development",
    image: require("../../assets/LMS/App-Development.jpeg"),
  },
  {
    id: "3",
    title: "Machine Learning",
    image: require("../../assets/LMS/Machine-Learning.jpeg"),
  },
];

const CourseCard = ({ item, onPress }) => (
  <View style={styles.cardContainer}>
    <View style={styles.imageWrap}>
      {item.image ? (
        <Image source={item.image} style={styles.image} resizeMode="cover" />
      ) : (
        <View
          style={[
            styles.image,
            { justifyContent: "center", alignItems: "center" },
          ]}
        >
          <Text style={{ color: "#888" }}>No Image</Text>
        </View>
      )}
    </View>

    <View style={styles.infoBox}>
      <Text style={styles.title} numberOfLines={3}>
        {item.title}
      </Text>

      <TouchableOpacity style={styles.button} onPress={() => onPress(item)}>
        <Text style={styles.buttonText}>See more...</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default function FeaturedCoursesScreen() {
  const navigation = useNavigation(); // ✅ get navigation

  const handleSeeMore = (course) => {
    // ✅ navigate to SubjectDetailScreen with correct param
    navigation.navigate("SubjectDetailScreen", {
      categoryName: course.title,
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar
        barStyle={Platform.OS === "ios" ? "dark-content" : "light-content"}
      />
      <View style={styles.container}>
        <Text style={styles.header}>Course Categories</Text>

        <FlatList
          data={sampleCourses}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <CourseCard item={item} onPress={handleSeeMore} />
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  container: {
    flex: 1,
    paddingHorizontal: CARD_HORIZONTAL_PADDING,
    paddingTop: 24,
    backgroundColor: "#ffffff",
  },
  header: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 18,
    color: "#000000",
  },
  listContent: {
    paddingBottom: 40,
  },
  cardContainer: {
    width: "100%",
    marginBottom: 22,
    backgroundColor: "transparent",
  },
  imageWrap: {
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#eee",
    borderWidth: 1,
    borderColor: "#e6e6e6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  image: {
    width: "100%",
    height: IMAGE_HEIGHT,
  },
  infoBox: {
    marginTop: -10,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: "#e9e9e9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111111",
    marginBottom: 16,
    lineHeight: 28,
  },
  button: {
    alignSelf: "stretch",
    backgroundColor: "#4B9CD3",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
