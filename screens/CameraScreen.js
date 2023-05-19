import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Button, Alert, Platform } from "react-native";
import { Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { useNavigation, useIsFocused } from "@react-navigation/native";

export default function CameraScreen() {
  // used this hook to prevent camera from black screen
  const isFocused = useIsFocused();

  const navigation = useNavigation();

  const [cameraPermission, setCameraPermission] = useState(null);
  const [imagePermission, setImagePermission] = useState(null);
  const [mediaLibraryPermission, setMediaLibraryPermission] = useState(null);

  const [camera, setCamera] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);

  const permissionFunction = async () => {
    const cameraPermission = await Camera.requestCameraPermissionsAsync();
    console.log(cameraPermission.status);
    setCameraPermission(cameraPermission.status === "granted");

    const imagePermission = await ImagePicker.getMediaLibraryPermissionsAsync();
    console.log(imagePermission.status);
    setImagePermission(imagePermission.status === "granted");

    const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync();
    console.log(mediaLibraryPermission.status);
    setMediaLibraryPermission(mediaLibraryPermission.status === "granted");

    if (
      imagePermission.status !== "granted" &&
      cameraPermission.status !== "granted" &&
      mediaLibraryPermission.status !== "granted"
    ) {
      Alert.alert("Permission for media access needed.");
    }
  };

  useEffect(() => {
    permissionFunction();
  }, []);

  const takePicture = async () => {
    if (camera) {
      const data = await camera.takePictureAsync(null);
      console.log("URI", data.uri);
      await saveImageToGallery(data.uri);
      setImageUri(data.uri);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 1,
      presentationStyle: 0,
    });

    console.log("result", result.assets[0].uri);
    // console.log(result);  // its causes WARN Key "cancelled" in the image picker result is deprecated and will be removed in SDK 48, use "canceled" instead
    if (!result.canceled) {
      navigation.navigate("ImageScreen", { uri: result.assets[0].uri });
    }
  };

  const saveImageToGallery = async (uri) => {
    if (mediaLibraryPermission) {
      try {
        const asset = await MediaLibrary.createAssetAsync(uri);
        console.log("Asset:", asset);
        if (Platform.OS === "android") {
          MediaLibrary.createAlbumAsync("Images", asset, false)
            .then(() => {
              console.log("File Saved Successfully!");
            })
            .catch((e) => {
              console.log("Error In Saving File!", e);
            });
        } else {
          MediaLibrary.createAlbumAsync("Images", [asset], false)
            .then(() => {
              console.log("File Saved Successfully!");
            })
            .catch((e) => {
              console.log("Error In Saving File!", e);
            });
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log("Need Storage permission to save file");
    }
  };

  if (
    cameraPermission === null ||
    imagePermission === null ||
    mediaLibraryPermission === null
  ) {
    return <View />;
  }
  if (
    cameraPermission === false ||
    imagePermission === false ||
    mediaLibraryPermission === false
  ) {
    return <Text>No access to camera or gallery</Text>;
  }
  return (
    <View style={styles.container}>
      <View style={styles.cameraContainer}>
        {isFocused && (
          <Camera
            ref={(ref) => setCamera(ref)}
            style={styles.fixedRatio}
            type={type}
            ratio={"1:1"}
          />
        )}
      </View>

      <Button title={"Take Picture"} onPress={takePicture} />
      <Button title={"Gallery"} onPress={pickImage} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 0,
    width: "100%",
    height: "100%",
  },
  cameraContainer: {
    flex: 1,
  },
  fixedRatio: {
    flex: 1,
    aspectRatio: 1,
  },
  button: {
    flex: 0.1,
    padding: 10,
    alignSelf: "flex-end",
    alignItems: "center",
  },
});
