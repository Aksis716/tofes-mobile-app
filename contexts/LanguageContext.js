import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, updateDoc } from "firebase/firestore";
import { createContext, useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("fr"); // "fr" or "en"

  useEffect(() => {
    // Load saved language
    AsyncStorage.getItem("language")
      .then((value) => {
        if (value) setLanguage(value);
      })
      .catch(console.error);
  }, []);

  const changeLanguage = async (newLang) => {
    setLanguage(newLang);
    try {
      await AsyncStorage.setItem("language", newLang);

      // If user logged in, save to Firestore
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { language: newLang });
      }
    } catch (e) {
      console.error("Error saving language:", e);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
