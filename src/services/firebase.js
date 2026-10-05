// src/services/firebase.js
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  collection, 
  addDoc, 
  serverTimestamp,
  updateDoc
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC7q-EuN-PTdnnH3gQgUbm2cLdcKCws24Y",
  authDomain: "gen-lang-client-0787784134.firebaseapp.com",
  projectId: "gen-lang-client-0787784134",
  storageBucket: "gen-lang-client-0787784134.firebasestorage.app",
  messagingSenderId: "112370564653",
  appId: "1:112370564653:web:f3fff774c691435c2cc2a4",
  measurementId: "G-8LJ3W7Q3T1"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Fetch Telegram User
export function getTelegramUser() {
  if (typeof window !== "undefined" && window.Telegram?.WebApp?.initDataUnsafe?.user) {
    return window.Telegram.WebApp.initDataUnsafe.user;
  }
  // Fallback for dev / browser testing
  return {
    id: "guest_" + (localStorage.getItem("guest_id") || (() => {
      const gId = Math.floor(100000 + Math.random() * 900000);
      localStorage.setItem("guest_id", gId);
      return gId;
    })()),
    first_name: "Creator",
    username: "telegram_user"
  };
}

// 1. User profile realtime listener
export function listenToUserProfile(userId, onDataUpdate) {
  const userRef = doc(db, "creators", String(userId));
  return onSnapshot(
    userRef, 
    (docSnap) => {
      if (docSnap.exists()) {
        onDataUpdate(docSnap.data());
      } else {
        onDataUpdate(null);
      }
    },
    (error) => {
      console.warn("Firestore access error:", error.message);
      const localData = localStorage.getItem("apple_farm_creator") || localStorage.getItem("mango_affiliate_creator");
      onDataUpdate(localData ? JSON.parse(localData) : null);
    }
  );
}

// 2. Creator Onboarding Submit
export async function registerCreator(creatorInfo) {
  const user = getTelegramUser();
  const userRef = doc(db, "creators", String(user.id));
  
  const isTelegram = creatorInfo.platform === 'Telegram';
  const baseReward = isTelegram ? 2.0 : 5.0;
  const maxReward = isTelegram ? 10.0 : 25.0;

  const payload = {
    userId: user.id,
    username: user.username || "",
    firstName: user.first_name || "",
    platform: creatorInfo.platform,
    channelUrl: creatorInfo.channelUrl,
    followers: creatorInfo.followers,
    channelTitle: creatorInfo.channelTitle || "",
    referralCount: 0,
    targetMilestone: maxReward,
    maxReward: maxReward,
    availableRewardUSDT: baseReward,
    isJoined: true,
    taskVideoStatus: "pending", // pending, under_review, approved
    joinedAt: serverTimestamp()
  };

  await setDoc(userRef, payload, { merge: true });
  localStorage.setItem("apple_farm_creator", JSON.stringify(payload));
  return payload;
}

// 3. Submit video / channel post verification
export async function submitVideoPostVerification(videoUrl, autoApprove = true) {
  const user = getTelegramUser();
  const userRef = doc(db, "creators", String(user.id));
  const finalStatus = autoApprove ? "approved" : "under_review";

  const updatePayload = {
    taskVideoStatus: finalStatus,
    "tasks.video_post": {
      status: finalStatus,
      videoUrl: videoUrl,
      updatedAt: new Date().toISOString()
    }
  };

  await setDoc(userRef, updatePayload, { merge: true });
  return true;
}

// 4. Milestone claim submit
export async function saveMilestoneClaimToFirebase(claimData, autoApprove = true) {
  const user = getTelegramUser();
  const userRef = doc(db, "creators", String(user.id));
  const finalStatus = autoApprove ? "approved" : "under_review";
  
  const updatePayload = {};
  updatePayload[`tasks.${claimData.tier}`] = {
    status: finalStatus,
    videoUrl: claimData.videoUrl,
    amount: claimData.amount,
    viewCount: claimData.viewCount || null,
    updatedAt: new Date().toISOString()
  };

  await setDoc(userRef, updatePayload, { merge: true });
  return true;
}

// 5. Secure cashout request submit
export async function submitCashoutRequest(walletAddress, customAmount) {
  const user = getTelegramUser();
  const userRef = doc(db, "creators", String(user.id));
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    throw new Error("Creator profile not found!");
  }

  const userData = userSnap.data();
  const isTelegram = userData.platform === 'Telegram';
  const minRequired = isTelegram ? 10.0 : 25.0;

  const withdrawAmount = (typeof customAmount === 'number' && !isNaN(customAmount)) 
    ? customAmount 
    : minRequired;

  await addDoc(collection(db, "withdrawals"), {
    userId: user.id,
    username: user.username || "",
    amount: withdrawAmount,
    currency: "USDT",
    network: "TRC-20",
    walletAddress: walletAddress,
    status: "Pending",
    createdAt: serverTimestamp()
  });

  await updateDoc(userRef, {
    lastWithdrawalDate: serverTimestamp()
  });

  return true;
}
