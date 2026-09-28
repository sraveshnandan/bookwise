import { useEffect, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

export default function Registration() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [message, setMessage] = useState("");

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(25)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),

      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  /*
   * CREATE ACCOUNT CALLBACK
   */
  const handleCreateAccount = () => {
    setMessage("");

    if (!firstName.trim()) {
      setMessage("Please enter your first name.");
      return;
    }

    if (!lastName.trim()) {
      setMessage("Please enter your last name.");
      return;
    }

    if (!username.trim()) {
      setMessage("Please choose a username.");
      return;
    }

    if (!email.trim()) {
      setMessage("Please enter your email.");
      return;
    }

    if (!phone.trim()) {
      setMessage("Please enter your phone number.");
      return;
    }

    if (!password.trim()) {
      setMessage("Please enter a password.");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (!agreeToTerms) {
      setMessage("Please accept the terms and conditions.");
      return;
    }

    // Add your API call here later.
    setMessage("Account created successfully!");
  };

  /*
   * LOGIN CALLBACK
   */
  const handleLogin = () => {
    setMessage("Opening login...");
  };

  return (
    <View style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Decorative top element */}
            <View style={styles.decorativeCircle}>
              <View style={styles.innerCircle}>
                <Text style={styles.logoText}>M</Text>
              </View>

              <View style={styles.smallDot} />
              <View style={styles.smallDotTwo} />
            </View>

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Create account</Text>

              <Text style={styles.subtitle}>
                Join us and get started in a few seconds
              </Text>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              {/* First + Last name */}
              <View style={styles.row}>
                <View style={styles.halfInputContainer}>
                  <Text style={styles.label}>First name</Text>

                  <TextInput
                    style={styles.input}
                    placeholder="John"
                    placeholderTextColor="#9A9A9A"
                    value={firstName}
                    onChangeText={(text) => {
                      setFirstName(text);
                      setMessage("");
                    }}
                    autoCapitalize="words"
                  />
                </View>

                <View style={styles.inputGap} />

                <View style={styles.halfInputContainer}>
                  <Text style={styles.label}>Last name</Text>

                  <TextInput
                    style={styles.input}
                    placeholder="Doe"
                    placeholderTextColor="#9A9A9A"
                    value={lastName}
                    onChangeText={(text) => {
                      setLastName(text);
                      setMessage("");
                    }}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              {/* Username */}
              <View style={styles.field}>
                <Text style={styles.label}>Username</Text>

                <TextInput
                  style={styles.input}
                  placeholder="johndoe"
                  placeholderTextColor="#9A9A9A"
                  value={username}
                  onChangeText={(text) => {
                    setUsername(text);
                    setMessage("");
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Email */}
              <View style={styles.field}>
                <Text style={styles.label}>Email</Text>

                <TextInput
                  style={styles.input}
                  placeholder="john@example.com"
                  placeholderTextColor="#9A9A9A"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setMessage("");
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Phone */}
              <View style={styles.field}>
                <Text style={styles.label}>Phone number</Text>

                <TextInput
                  style={styles.input}
                  placeholder="+91 98765 43210"
                  placeholderTextColor="#9A9A9A"
                  value={phone}
                  onChangeText={(text) => {
                    setPhone(text);
                    setMessage("");
                  }}
                  keyboardType="phone-pad"
                />
              </View>

              {/* Password */}
              <View style={styles.field}>
                <Text style={styles.label}>Password</Text>

                <View style={styles.passwordWrapper}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Create a password"
                    placeholderTextColor="#9A9A9A"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      setMessage("");
                    }}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />

                  {password.length > 0 && (
                    <Pressable
                      onPress={() =>
                        setShowPassword(!showPassword)
                      }
                    >
                      <Text style={styles.showText}>
                        {showPassword ? "Hide" : "Show"}
                      </Text>
                    </Pressable>
                  )}
                </View>
              </View>

              {/* Confirm password */}
              <View style={styles.field}>
                <Text style={styles.label}>Confirm password</Text>

                <View style={styles.passwordWrapper}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Enter password again"
                    placeholderTextColor="#9A9A9A"
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      setMessage("");
                    }}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    returnKeyType="done"
                    onSubmitEditing={handleCreateAccount}
                  />

                  {confirmPassword.length > 0 && (
                    <Pressable
                      onPress={() =>
                        setShowConfirmPassword(
                          !showConfirmPassword
                        )
                      }
                    >
                      <Text style={styles.showText}>
                        {showConfirmPassword ? "Hide" : "Show"}
                      </Text>
                    </Pressable>
                  )}
                </View>
              </View>
            </View>

            {/* Terms */}
            <Pressable
              style={styles.termsContainer}
              onPress={() =>
                setAgreeToTerms(!agreeToTerms)
              }
            >
              <View
                style={[
                  styles.checkbox,
                  agreeToTerms && styles.checkboxActive,
                ]}
              >
                {agreeToTerms && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>

              <Text style={styles.termsText}>
                I agree to the{" "}
                <Text style={styles.termsLink}>
                  Terms & Conditions
                </Text>
              </Text>
            </Pressable>

            {/* Message */}
            {message !== "" && (
              <View style={styles.messageContainer}>
                <Text style={styles.messageText}>
                  {message}
                </Text>
              </View>
            )}

            {/* Create account */}
            <Pressable
              style={[
                styles.createButton,
                agreeToTerms && styles.createButtonActive,
              ]}
              onPress={handleCreateAccount}
            >
              <Text
                style={[
                  styles.createButtonText,
                  agreeToTerms &&
                  styles.createButtonTextActive,
                ]}
              >
                Create account
              </Text>
            </Pressable>

            {/* Login */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginLabel}>
                Already have an account?
              </Text>

              <Pressable onPress={handleLogin}>
                <Text style={styles.loginText}>
                  Log in
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F9FC",
  },

  keyboardView: {
    flex: 1,
  },

  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 35,
    paddingBottom: 40,
  },

  content: {
    width: "100%",
    alignItems: "center",
  },

  /*
   * DECORATIVE LOGO
   */

  decorativeCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#E9E1FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    position: "relative",
  },

  innerCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#7C4DFF",
    alignItems: "center",
    justifyContent: "center",
  },

  logoText: {
    fontSize: 27,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  smallDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FF6B8A",
    position: "absolute",
    top: 0,
    right: 5,
  },

  smallDotTwo: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#5DDBA6",
    position: "absolute",
    bottom: 3,
    left: 2,
  },

  /*
   * HEADER
   */

  header: {
    alignItems: "center",
    marginBottom: 25,
  },

  title: {
    fontSize: 29,
    fontWeight: "800",
    color: "#151515",
    marginBottom: 7,
  },

  subtitle: {
    fontSize: 14,
    color: "#777777",
    textAlign: "center",
  },

  /*
   * FORM
   */

  formContainer: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 12,

    elevation: 3,
  },

  row: {
    flexDirection: "row",
    width: "100%",
  },

  halfInputContainer: {
    flex: 1,
  },

  inputGap: {
    width: 12,
  },

  field: {
    width: "100%",
    marginTop: 17,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#444444",
    marginBottom: 7,
  },

  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E4E4E8",
    backgroundColor: "#FAFAFB",
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#151515",
  },

  passwordWrapper: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E4E4E8",
    backgroundColor: "#FAFAFB",
    flexDirection: "row",
    alignItems: "center",
  },

  passwordInput: {
    flex: 1,
    height: 48,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#151515",
  },

  showText: {
    color: "#6941E8",
    fontSize: 13,
    fontWeight: "700",
    paddingHorizontal: 14,
  },

  /*
   * TERMS
   */

  termsContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
  },

  checkbox: {
    width: 21,
    height: 21,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#CCCCCC",
    alignItems: "center",
    justifyContent: "center",
  },

  checkboxActive: {
    backgroundColor: "#6941E8",
    borderColor: "#6941E8",
  },

  checkmark: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  termsText: {
    fontSize: 13,
    color: "#777777",
    marginLeft: 9,
  },

  termsLink: {
    color: "#6941E8",
    fontWeight: "700",
  },

  /*
   * MESSAGE
   */

  messageContainer: {
    width: "100%",
    marginTop: 15,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: "#EEEEF2",
  },

  messageText: {
    fontSize: 13,
    color: "#444444",
    textAlign: "center",
    fontWeight: "500",
  },

  /*
   * CREATE BUTTON
   */

  createButton: {
    width: "100%",
    height: 52,
    borderRadius: 15,
    backgroundColor: "#E8E8EC",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },

  createButtonActive: {
    backgroundColor: "#6941E8",
  },

  createButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#A5A5AA",
  },

  createButtonTextActive: {
    color: "#FFFFFF",
  },

  /*
   * LOGIN
   */

  loginContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 22,
  },

  loginLabel: {
    fontSize: 14,
    color: "#777777",
    marginRight: 5,
  },

  loginText: {
    fontSize: 14,
    color: "#6941E8",
    fontWeight: "700",
  },
});