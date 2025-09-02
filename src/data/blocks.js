// hardness defines how long a block takes to break
// toughness defines the necessary tool level required to break it

export const blockData = {
  wood: {
    id: "wood",
    name: "Wood",
    hardness: 4,
    toughness: 1,
    class: "wood",
    image: "/img/blocks/oak.png",
  },
  dirt: {
    id: "dirt",
    name: "Dirt",
    hardness: 2,
    toughness: 1,
    class: "soil",
    image: "/img/blocks/dirt.png",
  },
  stone: {
    id: "stone",
    name: "Stone",
    hardness: 4,
    toughness: 2,
    class: "rock",
    image: "/img/blocks/stone.png",
  },
  coal: {
    id: "coal",
    name: "Coal",
    hardness: 8,
    toughness: 2,
    class: "rock",
    image: "/img/blocks/coal.png",
  },
  iron: {
    id: "iron",
    name: "Iron",
    hardness: 8,
    toughness: 3,
    class: "rock",
    image: "/img/blocks/iron.png",
  },
  emerald: {
    id: "emerald",
    name: "Emerald",
    hardness: 12,
    toughness: 4,
    class: "rock",
    image: "/img/blocks/emerald.png",
  },
};
