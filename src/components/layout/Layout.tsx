import styles from "./styles.module.scss";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
