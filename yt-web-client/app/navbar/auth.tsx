'use client';

import { Fragment } from "react";
import { signInWithGoogle, signOut } from "../firebase/firebase";
import { User } from "firebase/auth";
import styles from "./auth.module.css";

interface SignInProps {
  user: User | null;
}

export default function Authenticate({ user }: SignInProps) {
  return (
    <Fragment>
      { user ?
        (
          <button className={styles.auth} onClick={signOut}>
            Sign Out
          </button>
        ) : (
          <button className={styles.auth} onClick={signInWithGoogle}>
            Sign In
          </button>
        )
      }
    </Fragment>
  );
}