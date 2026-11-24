const USER_ID   = "1264042367";
const SERVER_ID = "15139";

const REGION_MAP = {
  "1":"Indonesia","2":"Indonesia","3":"Indonesia","4":"Indonesia",
  "5":"Indonesia","6":"Indonesia","7":"Indonesia","8":"Indonesia","9":"Indonesia",
  "10":"Malaysia / SG / BN","11":"Philippines","12":"Thailand",
  "13":"Vietnam","14":"Cambodia","15":"Myanmar","16":"Laos",
  "17":"Timor-Leste","19":"Middle East","20":"North America",
  "21":"Europe","22":"South America",
};

function getRegion(sid) {
  const s = String(sid);
  return REGION_MAP[s.slice(0, 2)] ?? REGION_MAP[s.slice(0, 1)] ?? "Unknown";
}

async function stalkML(userId, serverId) {
  let status, code, username;

  try {
    const res = await fetch(
      `https://api.isan.eu.org/nickname/ml?id=${userId}&server=${serverId}`,
      { headers: { "User-Agent": "StalkML/1.0", "Accept": "application/json" } }
    );

    const json = await res.json();

    if (json.success) {
      status   = "success";
      code     = 200;
      username = json.name;
    } else {
      status   = "failed";
      code     = 404;
      username = null;
    }
  } catch (e) {
    status   = "error";
    code     = 500;
    username = null;
  }

  const result = {
    status,
    code,
    data: {
      id:       userId,
      server:   serverId,
      username: username ?? "Not Found",
      region:   getRegion(serverId),
    },
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}

stalkML(USER_ID, SERVER_ID);
