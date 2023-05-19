import React, { useState } from "react";
import {
  StyleSheet,
  Image,
  View,
  Text,
  TouchableOpacity,
  Alert,
} from "react-native";
import { storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function ImageScreen({ route }) {
  const { uri } = route.params;
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    setUploading(true);
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const filename = uri.split("/").pop();
      const reference = ref(storage, `images/${filename}`);
      const result = await uploadBytes(reference, blob);
      const url = await getDownloadURL(result.ref);
      setUploading(false);
      Alert.alert("Upload successful");
    } catch (error) {
      console.error(error);
      setUploading(false);
      Alert.alert("Upload failed");
    }
  };
  return (
    <View style={styles.container}>
      <Image source={{ uri }} style={styles.image} />
      <TouchableOpacity onPress={handleUpload} style={styles.button}>
        <Text style={styles.buttonText}>
          {uploading ? "Uploading..." : "Upload to Firebase"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  image: {
    flex: 1,
    resizeMode: "contain",
  },
  button: {
    backgroundColor: "#2196F3",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignSelf: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
});
