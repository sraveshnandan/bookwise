import { router } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Index() {

  useEffect(() => {
    setTimeout(() => {
      router.push(`/new`);
    }, 5000);
  }, []);
  return (
    <View style={styles.container}>
      <Text>
        This is just a template 
      </Text>
      <TouchableOpacity onPress={() => router.push(`/new`)} style={styles.btn}><Text>Login</Text></TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  btn:{
    padding:10,
    borderWidth:3,
    margin:12
  }
});
