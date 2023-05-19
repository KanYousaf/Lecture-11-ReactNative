import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Button, Image, Alert } from "react-native";
import { Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";

export default function CameraScreen() {
  const [cameraPermission, setCameraPermission] = useState(null);
  const [imagePermission, setGalleryPermission] = useState(null);

  const [camera, setCamera] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);

  const permissionFunction = async () => {
    // here is how you can get the camera permission
    const cameraPermission = await Camera.requestCameraPermissionsAsync();
    setCameraPermission(cameraPermission.status === "granted");

    const imagePermission = await ImagePicker.getMediaLibraryPermissionsAsync();
    console.log(imagePermission.status);
    setGalleryPermission(imagePermission.status === "granted");

    if (
      imagePermission.status !== "granted" &&
      cameraPermission.status !== "granted"
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
      console.log(data.uri);
      await saveImageToGallery(data.uri);
      setImageUri(data.uri);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
      presentationStyle: 0,
    });

    console.log(result);
    if (!result.canceled) {
      await saveImageToGallery(result.assets[0].uri);
      setImageUri(result.assets[0].uri);
    }
  };

  const saveImageToGallery = async (uri) => {
    const permission = await MediaLibrary.requestPermissionsAsync();
    if (permission.granted) {
      try {
        const asset = await MediaLibrary.createAssetAsync(uri);
        console.log("Asset:", asset);
        if (Platform.OS === "android") {
          MediaLibrary.createAlbumAsync("Images", asset, false)
            .then(() => {
              console.log("File Saved Successfully!");
            })
            .catch((e) => {
              console.log("Error In Saving File!" + e);
            });
        } else {
          MediaLibrary.createAlbumAsync("Images", [asset], false)
            .then(() => {
              console.log("File Saved Successfully!");
            })
            .catch((e) => {
              console.log("Error In Saving File!" + e);
            });
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log("Need Storage permission to save file");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.cameraContainer}>
        <Camera
          ref={(ref) => setCamera(ref)}
          style={styles.fixedRatio}
          type={type}
          ratio={"1:1"}
        />
      </View>

      <Button title={"Take Picture"} onPress={takePicture} />
      <Button title={"Gallery"} onPress={pickImage} />
      {imageUri && <Image source={{ uri: imageUri }} style={{ flex: 1 }} />}
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
