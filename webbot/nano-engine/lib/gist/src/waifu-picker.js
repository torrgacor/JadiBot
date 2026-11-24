const CONFIG = {
  NSFW: true, //Kalo true berarti mode nfsw kalo false mode sfw
  PAGE_SIZE: 10 //Buat atur berapa banyak gambar yang mau di ambil
};

try {
  const params = new URLSearchParams({
    isNsfw: String(CONFIG.NSFW),
    orderBy: "Random",
    page: "1",
    pageSize: String(CONFIG.PAGE_SIZE)
  });

  const res = await fetch(
    `https://api.waifu.im/images?${params}`
  );

  const data = await res.json();

  console.log(
    JSON.stringify(
      {
        Status: true,
        Code: res.status,
        Result: data.items.map(item => item.url)
      },
      null,
      2
    )
  );
} catch (err) {
  console.log(
    JSON.stringify(
      {
        Status: false,
        Code: 500,
        Result: err.message
      },
      null,
      2
    )
  );
}