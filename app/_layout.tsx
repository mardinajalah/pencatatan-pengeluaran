// @ts-ignore: side-effect CSS import has no type declarations in this project
import "./global.css";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
