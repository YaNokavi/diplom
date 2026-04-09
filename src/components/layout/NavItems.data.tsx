import HomeIcon from "../../assets/icons/HomeIcon.svg?react";
import EquipmentIcon from "../../assets/icons/EquipmentIcon.svg?react";
import ManualsIcon from "../../assets/icons/ManualsIcon.svg?react";
import ReportsIcon from "../../assets/icons/ReportsIcon.svg?react";
import TestsIcon from "../../assets/icons/TestsIcon.svg?react";

export const NAV_ITEMS = [
  { name: "Главная", path: "/home", icon: <HomeIcon /> },
  { name: "Испытания", path: "/tests", icon: <TestsIcon /> },
  { name: "Оборудование", path: "/equipment", icon: <EquipmentIcon /> },
  { name: "Отчеты", path: "/reports", icon: <ReportsIcon /> },
  { name: "Инструкции", path: "/manuals", icon: <ManualsIcon /> },
];
