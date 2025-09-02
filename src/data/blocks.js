// hardness defines how long a block takes to break
// toughness defines the necessary tool level required to break it

export const blockData = {
  wood: {
    id: "wood",
    name: "Wood",
    hardness: 4,
    toughness: 1,
    class: "wood",
    image: import.meta.env.BASE_URL + "img/blocks/oak.png",
  },
  dirt: {
    id: "dirt",
    name: "Dirt",
    hardness: 3,
    toughness: 1,
    class: "soil",
    image: import.meta.env.BASE_URL + "img/blocks/dirt.png",
  },
  stone: {
    id: "stone",
    name: "Stone",
    hardness: 8,
    toughness: 2,
    class: "rock",
    image: import.meta.env.BASE_URL + "img/blocks/stone.png",
  },
  coal: {
    id: "coal",
    name: "Coal",
    hardness: 16,
    toughness: 2,
    class: "rock",
    image: import.meta.env.BASE_URL + "img/blocks/coal.png",
  },
  iron: {
    id: "iron",
    name: "Iron",
    hardness: 18,
    toughness: 3,
    class: "rock",
    image: import.meta.env.BASE_URL + "img/blocks/iron.png",
  },
  emerald: {
    id: "emerald",
    name: "Emerald",
    hardness: 36,
    toughness: 4,
    class: "rock",
    image: import.meta.env.BASE_URL + "img/blocks/emerald.png",
  },
};
