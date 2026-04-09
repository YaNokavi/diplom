export default function HomePage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <h1>Это домашняя страница</h1>
      <div
        style={{
          display: "flex",
          background: "var(--bg-block)",
          width: "100%",
          height: 200,
          borderRadius: 30,
          padding: 20,
          // border: "1px solid rgba(0,0,0,0.1)",
        }}
      >
        <h3>Тут дашборд</h3>
      </div>
      <div style={{ display: "flex", gap: 20 }}>
        <div
          style={{
            display: "flex",
            background: "var(--bg-block)",
            width: "100%",
            height: 200,
            borderRadius: 30,
            padding: 20,
            // border: "1px solid rgba(0,0,0,0.1)",
          }}
        >
          <h3>Тут дашборд</h3>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            background: "var(--bg-block)",
            width: "100%",
            height: 200,
            borderRadius: 30,
            padding: 20,
            // border: "1px solid rgba(0,0,0,0.1)",
          }}
        >
          <h3>Тут дашборд</h3>
          <button
            style={{
              marginTop: "auto",
              alignSelf: "flex-end",
              backgroundColor: "var(--color-accent)",
              width: 100,
              height: 40,
              borderRadius: 30,
              border: "none",
              color: "white",
              fontSize: 18,
              fontWeight: 600,
            }}
          >
            Кнопка
          </button>
        </div>
      </div>
    </div>
  );
}
