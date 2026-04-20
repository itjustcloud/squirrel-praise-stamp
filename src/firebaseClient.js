import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyBBmPpCBsTl6FnmbAAJgkZU60QJ_mbj5mg',
  authDomain: 'flip-flash-cards.firebaseapp.com',
  databaseURL: 'https://flip-flash-cards-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'flip-flash-cards',
  storageBucket: 'flip-flash-cards.firebasestorage.app',
  messagingSenderId: '871198531742',
  appId: '1:871198531742:web:0d41a5ce65e81289215b8f',
  measurementId: 'G-P75FL87BNS',
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const STATE_PATH = 'apps/squirrel-praise-stamp/state';
