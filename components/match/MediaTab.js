// components/match/MediaTab.js
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref as storageRef,
  uploadBytesResumable,
} from "firebase/storage";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db, storage } from "../../firebaseConfig";

export default function MediaTab({ match }) {
  const [motm, setMotm] = useState(null);
  const [lineups, setLineups] = useState({});
  const [gallery, setGallery] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [motmData, setMotmData] = useState({ name: "", team: "", rating: "" });

  const canEdit = userRole === "admin" || userRole === "creator";

  useEffect(() => {
    if (!match?.id) return undefined;
    const docRef = doc(db, "fixtures", match.id);
    const unsub = onSnapshot(docRef, (snap) => {
      if (!snap.exists()) {
        setMotm(null);
        setLineups({});
        setGallery([]);
        return;
      }
      const data = snap.data().media || {};
      setMotm(data.motm || null);
      setLineups(data.lineups || {});
      setGallery(data.gallery || []);
    });
    return () => unsub();
  }, [match?.id]);

  useEffect(() => {
    const fetchRole = async () => {
      const user = auth.currentUser;
      if (!user) return setUserRole(null);
      const userDoc = doc(db, "users", user.uid);
      const unsub = onSnapshot(userDoc, (snap) =>
        setUserRole(snap.exists() ? snap.data().role : null)
      );
      return () => unsub();
    };
    fetchRole();
  }, []);

  useEffect(() => {
    const onBack = () => {
      if (selectedImage) {
        setSelectedImage(null);
        return true;
      }
      return false;
    };
    const sub = BackHandler.addEventListener("hardwareBackPress", onBack);
    return () => sub.remove();
  }, [selectedImage]);

  const uploadUriWithProgress = (uri, path, key) =>
    new Promise((resolve, reject) => {
      const fileRef = storageRef(storage, path);
      const xhr = new XMLHttpRequest();
      xhr.responseType = "blob";
      xhr.onload = () => {
        const blob = xhr.response;
        const uploadTask = uploadBytesResumable(fileRef, blob);
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress((prev) => ({ ...prev, [key]: progress }));
          },
          (error) => reject(error),
          async () => {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({ url, path });
            setUploadProgress((prev) => {
              const updated = { ...prev };
              delete updated[key];
              return updated;
            });
          }
        );
      };
      xhr.onerror = reject;
      xhr.open("GET", uri);
      xhr.send();
    });

  const pickImages = async (allowMultiple = false) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.Images,
      quality: 0.8,
      allowsMultipleSelection: allowMultiple,
    });
    if (result.canceled) return [];
    return result.assets.map((a) => a.uri);
  };

  // === MOTM ===
  const handleMotmSave = async () => {
    if (!canEdit) return;
    try {
      const uris = await pickImages(false);
      let photoObj = motm?.photoObj || null;
      if (uris.length > 0) {
        const path = `media/${match.id}/motm/${Date.now()}.jpg`;
        photoObj = await uploadUriWithProgress(uris[0], path, "motm");
      }
      const newMotm = {
        name: motmData.name || motm?.name || "",
        team: motmData.team || motm?.team || "",
        rating: motmData.rating || motm?.rating || "",
        photoObj,
      };
      await updateDoc(doc(db, "fixtures", match.id), {
        "media.motm": newMotm,
      });
      setEditMode(false);
      setMotmData({ name: "", team: "", rating: "" });
    } catch (err) {
      console.error(err);
      Alert.alert("Erreur", "Impossible de sauvegarder le MOTM.");
    }
  };

  // === LINEUPS ===
  const handleLineupUpload = async (side) => {
    if (!canEdit) return;
    const uris = await pickImages(false);
    if (uris.length === 0) return;
    const path = `media/${match.id}/lineups/${side}_${Date.now()}.jpg`;
    const result = await uploadUriWithProgress(uris[0], path, `lineup_${side}`);
    await updateDoc(doc(db, "fixtures", match.id), {
      [`media.lineups.${side}`]: result,
    });
  };

  // === GALLERY ===
  const handleGalleryUpload = async () => {
    if (!canEdit) return;
    const uris = await pickImages(true);
    if (uris.length === 0) return;
    const uploads = await Promise.all(
      uris.map((u, i) =>
        uploadUriWithProgress(
          u,
          `media/${match.id}/gallery/${Date.now()}_${i}.jpg`,
          `gallery_${i}`
        )
      )
    );
    const newGallery = [...(gallery || []), ...uploads];
    await updateDoc(doc(db, "fixtures", match.id), {
      "media.gallery": newGallery,
    });
  };

  // === DELETE ===
  const handleDeleteImage = async (item, type, side = null) => {
    if (!canEdit) return;
    Alert.alert("Confirmer", "Supprimer cette image ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          try {
            if (item?.path && item.path !== "") {
              const refDel = storageRef(storage, item.path);
              await deleteObject(refDel);
            }
          } catch (err) {
            console.warn("deleteObject failed:", err);
          }
          const fixtureRef = doc(db, "fixtures", match.id);
          if (type === "motm") {
            await updateDoc(fixtureRef, { "media.motm.photoObj": null });
          } else if (type === "lineup" && side) {
            await updateDoc(fixtureRef, {
              [`media.lineups.${side}`]: null,
            });
          } else if (type === "gallery") {
            const newGallery = gallery.filter((g) => g.path !== item.path);
            await updateDoc(fixtureRef, { "media.gallery": newGallery });
          }
        },
      },
    ]);
  };

  // === RENDER ===
  const renderProgress = (key) =>
    uploadProgress[key] ? (
      <View style={{ alignItems: "center", marginVertical: 6 }}>
        <Text style={{ color: "#1077a7" }}>
          Upload: {uploadProgress[key].toFixed(0)}%
        </Text>
        <ActivityIndicator color="#1077a7" />
      </View>
    ) : null;

  const renderMotm = () => (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>🏅 Homme du Match</Text>
      <View style={styles.motmRow}>
        <TouchableOpacity
          onPress={() =>
            motm?.photoObj?.url && setSelectedImage(motm.photoObj.url)
          }
        >
          {motm?.photoObj?.url ? (
            <Image source={{ uri: motm.photoObj.url }} style={styles.motmPhoto} />
          ) : (
            <View style={[styles.motmPhoto, styles.placeholderBox]}>
              <MaterialCommunityIcons name="image-off-outline" size={36} color="#bbb" />
            </View>
          )}
        </TouchableOpacity>
        {canEdit && motm?.photoObj?.url && (
          <TouchableOpacity
            style={styles.deleteIconTop}
            onPress={() => handleDeleteImage(motm.photoObj, "motm")}
          >
            <MaterialCommunityIcons name="delete" size={18} color="#fff" />
          </TouchableOpacity>
        )}
        <View style={styles.motmDetails}>
          <Text style={styles.motmName}>{motm?.name || "—"}</Text>
          <Text style={styles.motmTeam}>Équipe: {motm?.team || "—"}</Text>
          <Text style={styles.motmRating}>
            {motm?.rating ? motm.rating + "/10" : "—"}
          </Text>
        </View>
      </View>
      {canEdit && (
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => setEditMode((s) => !s)}
        >
          <Text style={styles.uploadText}>{editMode ? "Annuler" : "Modifier"}</Text>
        </TouchableOpacity>
      )}
      {editMode && (
        <View style={styles.editContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nom du joueur"
            value={motmData.name}
            onChangeText={(t) => setMotmData({ ...motmData, name: t })}
          />
          <TextInput
            style={styles.input}
            placeholder="Équipe"
            value={motmData.team}
            onChangeText={(t) => setMotmData({ ...motmData, team: t })}
          />
          <TextInput
            style={styles.input}
            placeholder="Note /10"
            keyboardType="numeric"
            value={motmData.rating}
            onChangeText={(t) => setMotmData({ ...motmData, rating: t })}
          />
          {renderProgress("motm")}
          <TouchableOpacity style={styles.uploadButton} onPress={handleMotmSave}>
            <Text style={styles.uploadText}>Uploader & sauvegarder</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderLineups = () => (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>🧑‍🤝 Equipes</Text>
      <View style={styles.lineupsContainer}>
        {["teamA", "teamB"].map((side) => {
          const lineupUrl = lineups?.[side]?.url || null;
          return (
            <View key={side} style={styles.lineupBox}>
              <TouchableOpacity
                onPress={() => lineupUrl && setSelectedImage(lineupUrl)}
              >
                {lineupUrl ? (
                  <Image source={{ uri: lineupUrl }} style={styles.lineupPhoto} />
                ) : (
                  <View style={[styles.lineupPhoto, styles.placeholderBox]}>
                    <Text style={styles.placeholderSmall}>
                      Pas de composition {side === "teamA" ? "A" : "B"}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              {canEdit && (
                <>
                  {renderProgress(`lineup_${side}`)}
                  <TouchableOpacity
                    style={styles.uploadButtonSmall}
                    onPress={() => handleLineupUpload(side)}
                  >
                    <Text style={styles.uploadText}>
                      Uploader {side === "teamA" ? "A" : "B"}
                    </Text>
                  </TouchableOpacity>
                  {lineupUrl && (
                    <TouchableOpacity
                      style={styles.deleteIconTop}
                      onPress={() =>
                        handleDeleteImage(lineups[side], "lineup", side)
                      }
                    >
                      <MaterialCommunityIcons name="delete" size={18} color="#fff" />
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );

  const renderGallery = () => (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>📸 Galerie</Text>
      <View style={styles.galleryContainer}>
        {gallery.length > 0 ? (
          gallery.map((img, i) => (
            <View key={`${img.path}-${i}`} style={styles.galleryItem}>
              <TouchableOpacity onPress={() => setSelectedImage(img.url)}>
                <Image source={{ uri: img.url }} style={styles.galleryImage} />
              </TouchableOpacity>
              {canEdit && (
                <TouchableOpacity
                  style={styles.deleteIcon}
                  onPress={() => handleDeleteImage(img, "gallery")}
                >
                  <MaterialCommunityIcons name="delete" size={18} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.placeholder}>Aucune image pour le moment.</Text>
        )}
      </View>
      {canEdit && (
        <>
          {Object.keys(uploadProgress)
            .filter((k) => k.startsWith("gallery_"))
            .map((k) => renderProgress(k))}
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleGalleryUpload}
          >
            <Text style={styles.uploadText}>Ajouter des images</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {renderMotm()}
        {renderLineups()}
        {renderGallery()}
      </ScrollView>

      <Modal visible={!!selectedImage} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalBackground}
          activeOpacity={1}
          onPress={() => setSelectedImage(null)}
        >
          {selectedImage && (
            <Image source={{ uri: selectedImage }} style={styles.fullImage} />
          )}
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    margin: 10,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1077a7",
    marginBottom: 8,
  },
  motmRow: { flexDirection: "row", alignItems: "center" },
  motmPhoto: {
    width: 120,
    height: 120,
    borderRadius: 18,
    backgroundColor: "#eee",
    marginHorizontal: 20,
  },
  motmDetails: { flex: 1 },
  motmName: { fontSize: 15, fontWeight: "700" },
  motmTeam: { color: "#555", marginTop: 5 },
  motmRating: { color: "#1077a7", fontWeight: "700", marginTop: 5 },
  placeholder: { textAlign: "center", color: "#999", marginVertical: 10 },
  placeholderSmall: { color: "#999", textAlign: "center", paddingTop: 40 },
  input: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  uploadButton: {
    backgroundColor: "#1077a7",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  uploadButtonSmall: {
    backgroundColor: "#1077a7",
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: "center",
  },
  uploadText: { color: "#fff", fontWeight: "700" },
  lineupsContainer: { flexDirection: "row", justifyContent: "space-between" },
  lineupBox: { flex: 1, alignItems: "center", position: "relative" },
  lineupPhoto: { width: 160, height: 140, borderRadius: 8 },
  galleryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  galleryItem: { width: "30%", margin: "1.5%", position: "relative" },
  galleryImage: { width: "100%", height: 110, borderRadius: 8 },
  deleteIcon: {
    position: "absolute",
    right: 6,
    top: 6,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 6,
    borderRadius: 18,
  },
  deleteIconTop: {
    position: "absolute",
    right: 10,
    top: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 6,
    borderRadius: 18,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: Platform.OS === "web" ? "70%" : "95%",
    height: Platform.OS === "web" ? "70%" : "85%",
    resizeMode: "contain",
  },
});
