export const toolsData = {
  hand: {
    id: "hand",
    name: "Hand",
    mining_power: 1,
    image: "/img/tools/hand.png",
    effective: [],
  },
  pickaxe_wood: {
    id: "pickaxe_wood",
    name: "Wooden Pickaxe",
    mining_power: 2,
    image: "/img/tools/pickaxe_wood.png",
    effective: ["rock"],
    // Crafting recipe: requires 10 wood
    recipe: {
      wood: 10,
    },
  },
  shovel_wood: {
    id: "shovel_wood",
    name: "Wooden Shovel",
    mining_power: 2,
    image: "/img/tools/shovel_wood.png",
    effective: ["soil"],
  },
  pickaxe_stone: {
    id: "pickaxe_stone",
    name: "Stone Pickaxe",
    mining_power: 3,
    image: "/img/tools/pickaxe_stone.png",
    effective: ["rock"],
    recipe: {
      wood: 5,
      stone: 30,
    },
  },
};
