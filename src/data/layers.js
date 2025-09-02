import { blockData } from "./blocks";

export const layerData = [
  {
    id: "overworld",
    name: "Overworld",
    description: "Everything above the ground. Time to punch trees.",
    icon: "/img/blocks/tree.png",
    depth: 10,
    layerBlocks: [{ block: blockData.wood, dropRate: 500 }],
  },
  {
    id: "dirt",
    name: "Dirt Layer",
    description:
      "The first layer of the ground. It consists of soft soil and easily extractable materials.",
    icon: "/img/blocks/dirt.png",
    depth: 50,
    layerBlocks: [
      { block: blockData.dirt, dropRate: 100 },
      { block: blockData.stone, dropRate: 10 },
    ],
  },
  {
    id: "stone",
    name: "Stone Layer",
    description:
      "The second layer of the ground. It consists of hard rock and contains valuable minerals.",
    icon: "/img/blocks/stone.png",
    depth: 100,
    layerBlocks: [
      { block: blockData.stone, dropRate: 100 },
      { block: blockData.dirt, dropRate: 30 },
      { block: blockData.coal, dropRate: 10 },
      { block: blockData.iron, dropRate: 1 },
      { block: blockData.emerald, dropRate: 0.1 },
    ],
  },
];
