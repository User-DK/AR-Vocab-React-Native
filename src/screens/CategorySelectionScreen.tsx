import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/Ionicons";
import { NavigationProps } from "../types/navigation";
import Card from "../components/Card";
import { responsiveHeight } from "react-native-responsive-dimensions";
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  responsive,
} from "../styles/constants";
import { VocabularyCategory, VocabularyData } from "../types/vocabulary";

interface Category {
  id: string;
  name: string;
  icon: string;
  gradient: readonly [string, string, ...string[]];
}

const categories: Category[] = [
  {
    id: "animals",
    name: "Animals",
    icon: "🦁",
    gradient: colors.gradients.orange,
  },
  { id: "fruits", name: "Fruits", icon: "🍎", gradient: colors.gradients.pink },
  {
    id: "objects",
    name: "Objects",
    icon: "⚽",
    gradient: colors.gradients.blue,
  },
  {
    id: "vehicles",
    name: "Vehicles",
    icon: "🚗",
    gradient: colors.gradients.green,
  },
  {
    id: "colors",
    name: "Colors",
    icon: "🎨",
    gradient: colors.gradients.purple,
  },
  { id: "music", name: "Music", icon: "🎵", gradient: colors.gradients.yellow },
  { id: "home", name: "Home", icon: "🏠", gradient: colors.gradients.teal },
  {
    id: "emotions",
    name: "Emotions",
    icon: "😊",
    gradient: colors.gradients.pink,
  },
];

export default function CategorySelectionScreen({
  navigation,
}: NavigationProps) {
  const [categories, setCategories] = useState<VocabularyCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      // For now, let's use the bundled data directly
      const vocabularyData =
        require("../../assets/ar/vocabulary-data.json") as VocabularyData;
      setCategories(vocabularyData.categories);
      setIsLoading(false);
    } catch (error) {
      Alert.alert("Error", "Failed to load categories");
      setIsLoading(false);
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    navigation.navigate("Learning", { category: categoryId });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={["#ddd6fe", "#bfdbfe", "#fce7f3"]}
          style={styles.background}
        >
          <View style={styles.loadingContainer}>
            <Icon name="cube" size={50} color={colors.primary} />
            <Text style={styles.loadingText}>Loading Categories...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#ddd6fe", "#bfdbfe", "#fce7f3"]}
        style={styles.background}
      >
        {/* Header */}
        <LinearGradient colors={colors.gradients.purple} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Choose a Category</Text>
              <Text style={styles.headerSubtitle}>
                What do you want to learn?
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Categories Grid */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.categoriesGrid}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryButton}
                onPress={() => handleCategorySelect(category.id)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={category.color}
                  style={styles.categoryGradient}
                >
                  <Text style={styles.categoryIcon}>{category.emoji}</Text>
                  <Text style={styles.categoryName}>{category.name}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.primary,
    marginTop: spacing.md,
  },
  header: {
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    ...shadows.md,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: responsiveHeight(6),
    height: responsiveHeight(6),
    borderRadius: responsiveHeight(3),
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.card,
  },
  headerSubtitle: {
    fontSize: typography.fontSizes.sm,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  categoryButton: {
    width: "48%",
    marginBottom: spacing.md,
  },
  categoryGradient: {
    height: responsiveHeight(20),
    borderRadius: borderRadius["3xl"],
    justifyContent: "center",
    alignItems: "center",
    ...shadows.xl,
  },
  categoryIcon: {
    fontSize: typography.fontSizes["4xl"],
    marginBottom: spacing.sm,
  },
  categoryName: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.card,
    textAlign: "center",
  },
});

