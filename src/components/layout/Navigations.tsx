import { NavLink } from "react-router-dom";
import styles from "./styles.module.scss";
import { motion } from "framer-motion";
import { NAV_ITEMS } from "./NavItems.data";

export default function Navigation() {
  return (
    <nav>
      <ul>
        {NAV_ITEMS.map((item) => (
          <li key={item.path}>
            <NavLink to={item.path}>
              {({ isActive }) => (
                <>
                  {item.icon}
                  <span>{item.name}</span>

                  {isActive && (
                    <motion.div
                      layoutId="active-pill"
                      className={styles.activeBackground}
                      transition={{ type: "spring", duration: 0.6 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
