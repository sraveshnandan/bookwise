import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function Index() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [saveLogin, setSaveLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  // Login callback
  const handleLogin = () => {
    setMessage("");

    if (!phone.trim()) {
      setMessage("Please enter your phone number or email.");
      return;
    }

    if (!password.trim()) {
      setMessage("Please enter your password.");
      return;
    }

    // Your actual API/login logic can go here later.
    setMessage("Login submitted successfully!");
  };

  // Create account callback
  const handleCreateAccount = () => {
    router.push(`/Registation`);
    setMessage("Create account button pressed.");
  };

  // Forgot password callback
  const handleForgotPassword = () => {
    setMessage("Password recovery requested.");
  };

  const isFormValid = phone.trim() !== "" && password.trim() !== "";

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <View style={styles.logoTail} />

            <View style={styles.symbol}>
              <View style={[styles.symbolLine, styles.lineOne]} />
              <View style={[styles.symbolLine, styles.lineTwo]} />
              <View style={[styles.symbolLine, styles.lineThree]} />
            </View>
          </View>
        </View>

        {/* Heading */}
        <Text style={styles.title}>
          Log in with your phone{"\n"}
          number or Facebook{"\n"}
          account
        </Text>

        {/* Input fields */}
        <View style={styles.formContainer}>
          <TextInput
            style={[styles.input, styles.firstInput]}
            placeholder="Phone number or email"
            placeholderTextColor="#777"
            value={phone}
            onChangeText={(text) => {
              setPhone(text);
              setMessage("");
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              placeholderTextColor="#777"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setMessage("");
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />

            {/* Show / Hide password */}
            {password.length > 0 && (
              <Pressable
                style={styles.showPasswordButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.showPasswordText}>
                  {showPassword ? "Hide" : "Show"}
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Save login info */}
        <Pressable
          style={styles.saveLoginContainer}
          onPress={() => setSaveLogin(!saveLogin)}
        >
          <View
            style={[
              styles.checkbox,
              saveLogin && styles.checkboxChecked,
            ]}
          >
            {saveLogin && <Text style={styles.checkmark}>✓</Text>}
          </View>

          <Text style={styles.saveLoginText}>
            Save login info
          </Text>
        </Pressable>

        {/* Login */}
        <Pressable
          style={[
            styles.loginButton,
            isFormValid && styles.loginButtonActive,
          ]}
          onPress={handleLogin}
        >
          <Text
            style={[
              styles.loginButtonText,
              isFormValid && styles.loginButtonTextActive,
            ]}
          >
            Log in
          </Text>
        </Pressable>

        {/* Create account */}
        <Pressable
          style={styles.createAccountButton}
          onPress={handleCreateAccount}
        >
          <Text style={styles.createAccountText}>
            Create new account
          </Text>
        </Pressable>

        {/* Forgot password */}
        <Pressable
          style={styles.forgotButton}
          onPress={handleForgotPassword}
        >
          <Text style={styles.forgotText}>
            Forgot password?
          </Text>
        </Pressable>

        {/* Confirmation / Error message */}
        {message !== "" && (
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>
              {message}
            </Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 9,
    paddingTop: 62,
  },

  /*
   * LOGO
   */

  logoContainer: {
    width: 150,
    height: 150,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 27,
  },

  logo: {
    width: 132,
    height: 132,
    borderRadius: 66,
    backgroundColor: "#8b35ee",
    position: "relative",
  },

  logoTail: {
    position: "absolute",
    width: 31,
    height: 31,
    backgroundColor: "#3979ed",
    left: 17,
    bottom: -5,
    borderBottomLeftRadius: 8,
    transform: [{ rotate: "-20deg" }],
  },

  symbol: {
    position: "absolute",
    width: 90,
    height: 65,
    left: 21,
    top: 36,
  },

  symbolLine: {
    position: "absolute",
    height: 10,
    backgroundColor: "#ffffff",
    borderRadius: 8,
  },

  lineOne: {
    width: 48,
    left: 3,
    top: 28,
    transform: [{ rotate: "-48deg" }],
  },

  lineTwo: {
    width: 45,
    left: 25,
    top: 19,
    transform: [{ rotate: "37deg" }],
  },

  lineThree: {
    width: 47,
    left: 45,
    top: 17,
    transform: [{ rotate: "-48deg" }],
  },

  /*
   * TITLE
   */

  title: {
    fontSize: 21,
    lineHeight: 26,
    fontWeight: "700",
    color: "#050505",
    textAlign: "center",
    marginBottom: 20,
  },

  /*
   * INPUTS
   */

  formContainer: {
    width: "100%",
    maxWidth: 390,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#f5f5f5",
  },

  input: {
    height: 50,
    width: "100%",
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#111111",
    backgroundColor: "#f5f5f5",
  },

  firstInput: {
    borderBottomWidth: 1,
    borderBottomColor: "#ffffff",
  },

  passwordContainer: {
    height: 50,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },

  passwordInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#111111",
  },

  showPasswordButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },

  showPasswordText: {
    color: "#3478e5",
    fontSize: 14,
    fontWeight: "600",
  },

  /*
   * SAVE LOGIN
   */

  saveLoginContainer: {
    width: "100%",
    maxWidth: 390,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    marginBottom: 17,
  },

  checkbox: {
    width: 21,
    height: 21,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#cccccc",
    alignItems: "center",
    justifyContent: "center",
  },

  checkboxChecked: {
    backgroundColor: "#3478e5",
    borderColor: "#3478e5",
  },

  checkmark: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 19,
  },

  saveLoginText: {
    fontSize: 15,
    color: "#777777",
    marginLeft: 7,
    fontWeight: "500",
  },

  /*
   * LOGIN BUTTON
   */

  loginButton: {
    width: "100%",
    maxWidth: 390,
    height: 50,
    borderRadius: 15,
    backgroundColor: "#f2f2f2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },

  loginButtonActive: {
    backgroundColor: "#e5e5e5",
  },

  loginButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#bdbdbd",
  },

  loginButtonTextActive: {
    color: "#111111",
  },

  /*
   * CREATE ACCOUNT
   */

  createAccountButton: {
    width: "100%",
    maxWidth: 390,
    height: 50,
    borderRadius: 15,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },

  createAccountText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111111",
  },

  /*
   * FORGOT PASSWORD
   */

  forgotButton: {
    marginTop: 27,
    padding: 8,
  },

  forgotText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#3478e5",
  },

  /*
   * MESSAGE
   */

  messageContainer: {
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
  },

  messageText: {
    fontSize: 14,
    color: "#333333",
    textAlign: "center",
    fontWeight: "500",
  },
});