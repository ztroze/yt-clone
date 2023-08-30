'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from './navbar.module.css';
import Authenticate from './auth';
import { onAuthStateChangedHelper } from '../firebase/firebase';
import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';

export default function Navbar() {
  // Initialize user state
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    // Set up authentication state listener through a subscription
    // Whenever authentication state changes, set user
    const unsubscribe = onAuthStateChangedHelper((user) => {
      setUser(user);
    });

    // Clean up subscription on unmount, aka unsubscribe
    return () => unsubscribe();
  }, []);

  return (
    <nav className={styles.nav}>
      <Link href="/">
        <Image
          width={90}
          height={20}
          className={styles.logo}
          src="/youtube-logo.svg"
          alt="YouTube Logo"
        />
      </Link>
      {
        // TODO: Add an upload option
      }
      <Authenticate user={user}/>
    </nav>
  );
}
