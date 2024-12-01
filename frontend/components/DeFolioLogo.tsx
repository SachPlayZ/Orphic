"use client";

import React from "react";
import { motion } from "framer-motion";
import RotatingCoin from "./RotatingCoin";
import styles from "./DeFolioLogo.module.css";
import { useRouter } from "next/navigation";

const DeFolioLogo: React.FC = () => {
  const router = useRouter();
  return (
    <div
      className={styles.container}
      onClick={() => {
        router.push("/choose");
      }}
    >
      {/* <motion.div
        className={styles.textContainer}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 5 }}
      >
        <span className={styles.whiteText}>De</span>
        <span className={styles.gradientText}>F&nbsp;</span>
      </motion.div> */}
      <RotatingCoin />

      <motion.div
        className={styles.textContainer}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 5 }}
      >
        <span className={styles.gradientText}>
          &nbsp;rphic
          <br />
        </span>
      </motion.div>
    </div>
  );
};

export default DeFolioLogo;
