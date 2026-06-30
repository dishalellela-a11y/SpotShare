export type AuthUser = {
  name: string;
  email: string;
  role: "driver" | "owner";
};

export type SpotType = {
  id: number;
  name: string;
  building: string;
  block: string;
  area: string;
  address: string;
  landmark: string;
  entry: string;
  coords: {
    lat: number;
    lng: number;
  };
  dist: string;
  walkTime: string;
  driveTime: string;
  price: number;
  avail: string;
  score: number;
  rating: number;
  img: string;
  vehicles: string[];
  safety: number;
  cover: boolean;
  cctv: boolean;
  guard: boolean;
  ev: boolean;
  open24: boolean;
  owner: {
    name: string;
    phone: string;
    rating: number;
  };
};