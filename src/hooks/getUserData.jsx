import React from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../configuration/firebase";

const getUserData = async () => {
  if (!uid) return null;
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
};

export default getUserData;
