import styles from "./styles.module.scss";

export default function UserProfile() {
  // const user = {
  //   avatarUrl: "",
  //   name: "GNIDA",
  //   email: "ivan.ivanov@mail.ru",
  // };

  const user = {
    avatarUrl: "src/assets/photoIcon/80889.png",
    name: "Иван",
    email: "ivan.ivanov@mail.ru",
  };

  //TODO GNIDA Gateway Node for Industrial Data Analytics
  return (
    <div className={styles.userProfile}>
      {user.avatarUrl && <img src={user.avatarUrl} alt={user.name} />}
      <div className={styles.userInfo}>
        <h2>{user.name}</h2>
        <span>{user.email}</span>
      </div>
    </div>
  );
}
