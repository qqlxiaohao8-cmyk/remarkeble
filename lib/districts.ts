export const REGIONS = [
  { id: "hk", name: "香港島", tab: "港島" },
  { id: "kln", name: "九龍", tab: "九龍" },
  { id: "nt", name: "新界", tab: "新界" },
  { id: "islands", name: "離島", tab: "離島" },
] as const;

export type RegionId = (typeof REGIONS)[number]["id"];

export const DISTRICTS = [
  { id: "central", name: "中西區", nameEn: "Central & Western", regionId: "hk", x: 42, y: 67, lng: 114.153, lat: 22.282, color: "#E24A2A" },
  { id: "wan-chai", name: "灣仔", nameEn: "Wan Chai", regionId: "hk", x: 50, y: 65, lng: 114.173, lat: 22.277, color: "#A86B00" },
  { id: "eastern", name: "東區", nameEn: "Eastern", regionId: "hk", x: 62, y: 66, lng: 114.224, lat: 22.284, color: "#1F8A70" },
  { id: "southern", name: "南區", nameEn: "Southern", regionId: "hk", x: 48, y: 74, lng: 114.16, lat: 22.247, color: "#3D5A80" },
  { id: "yau-tsim-mong", name: "油尖旺", nameEn: "Yau Tsim Mong", regionId: "kln", x: 46, y: 56, lng: 114.17, lat: 22.312, color: "#D81159" },
  { id: "sham-shui-po", name: "深水埗", nameEn: "Sham Shui Po", regionId: "kln", x: 38, y: 51, lng: 114.162, lat: 22.331, color: "#6A4C93" },
  { id: "kowloon-city", name: "九龍城", nameEn: "Kowloon City", regionId: "kln", x: 52, y: 49, lng: 114.188, lat: 22.328, color: "#2D6A4F" },
  { id: "wong-tai-sin", name: "黃大仙", nameEn: "Wong Tai Sin", regionId: "kln", x: 56, y: 44, lng: 114.194, lat: 22.342, color: "#E07A3D" },
  { id: "kwun-tong", name: "觀塘", nameEn: "Kwun Tong", regionId: "kln", x: 66, y: 51, lng: 114.226, lat: 22.313, color: "#0077B6" },
  { id: "kwai-tsing", name: "葵青", nameEn: "Kwai Tsing", regionId: "nt", x: 32, y: 46, lng: 114.127, lat: 22.355, color: "#9B2226" },
  { id: "tsuen-wan", name: "荃灣", nameEn: "Tsuen Wan", regionId: "nt", x: 28, y: 40, lng: 114.113, lat: 22.371, color: "#0A9396" },
  { id: "tuen-mun", name: "屯門", nameEn: "Tuen Mun", regionId: "nt", x: 18, y: 30, lng: 113.977, lat: 22.391, color: "#BB6B2C" },
  { id: "yuen-long", name: "元朗", nameEn: "Yuen Long", regionId: "nt", x: 24, y: 20, lng: 114.023, lat: 22.444, color: "#606C38" },
  { id: "north", name: "北區", nameEn: "North", regionId: "nt", x: 42, y: 14, lng: 114.138, lat: 22.494, color: "#9C6644" },
  { id: "tai-po", name: "大埔", nameEn: "Tai Po", regionId: "nt", x: 54, y: 22, lng: 114.171, lat: 22.451, color: "#BC4749" },
  { id: "sha-tin", name: "沙田", nameEn: "Sha Tin", regionId: "nt", x: 52, y: 36, lng: 114.195, lat: 22.387, color: "#5C4D7D" },
  { id: "sai-kung", name: "西貢", nameEn: "Sai Kung", regionId: "nt", x: 74, y: 40, lng: 114.271, lat: 22.382, color: "#218380" },
  { id: "islands", name: "離島", nameEn: "Islands", regionId: "islands", x: 16, y: 70, lng: 113.946, lat: 22.262, color: "#4A5759" },
] as const;

export type DistrictId = (typeof DISTRICTS)[number]["id"];

export function getDistrict(id: string) {
  return DISTRICTS.find((district) => district.id === id);
}

export function getRegion(id: RegionId) {
  return REGIONS.find((region) => region.id === id);
}

export function districtName(id: string) {
  return getDistrict(id)?.name ?? "未分區";
}

export function nearestDistrict(lat: number, lng: number): DistrictId {
  let best: DistrictId = DISTRICTS[0].id;
  let score = Number.POSITIVE_INFINITY;
  const scale = Math.cos((lat * Math.PI) / 180);
  for (const district of DISTRICTS) {
    const dlat = district.lat - lat;
    const dlng = (district.lng - lng) * scale;
    const dist = dlat * dlat + dlng * dlng;
    if (dist < score) {
      score = dist;
      best = district.id;
    }
  }
  return best;
}
