"use client"

import React from 'react';
import { motion } from 'framer-motion';
import styles from './RotatingCoin.module.css';

const RotatingCoin: React.FC = () => {
  return (
    <motion.div
      className={styles.coinContainer}
      initial={{ scale: 8 }}
      animate={{ scale: 2 }}
      transition={{ duration: 5, ease: "easeInOut" }}
    >
      <div className={styles.coin}>
        <div className={styles.coinEdge}></div>
        <div className={`${styles.coinSide} ${styles.coinSideFront}`}>
          <img className={styles.coinImage} src="/dvst1.png" alt="Coin front" />
        </div>
        <div className={`${styles.coinSide} ${styles.coinSideBack}`}>
          <img className={styles.coinImage} src="/dvst1.png" alt="Coin back" />
        </div>
      </div>
    </motion.div>
  );
};

export default RotatingCoin;

