import { blockData } from "./blocks";

export const layerData = [
  {
    id: "overworld",
    name: "Overworld",
    description: "Everything above the ground. Time to punch trees.",
    icon: import.meta.env.BASE_URL + "img/blocks/tree.png",
    depth: 10,
    layerBlocks: [
      { block: blockData.wood, dropRate: 500 },
      { block: blockData.dirt, dropRate: 60 },
      { block: blockData.stone, dropRate: 10 },
    ],
  },
  {
    id: "dirt",
    name: "Dirt Layer",
    description:
      "The first layer of the ground. It consists of soft soil and easily extractable materials.",
    icon: import.meta.env.BASE_URL + "img/blocks/dirt.png",
    depth: 50,
    layerBlocks: [
      { block: blockData.dirt, dropRate: 100 },
      { block: blockData.stone, dropRate: 30 },
      { block: blockData.coal, dropRate: 6 },
      { block: blockData.wood, dropRate: 5 },
    ],
  },
  {
    id: "stone",
    name: "Stone Layer",
    description:
      "The second layer of the ground. It consists of hard rock and contains valuable minerals.",
    icon: import.meta.env.BASE_URL + "img/blocks/stone.png",
    depth: 100,
    layerBlocks: [
      { block: blockData.stone, dropRate: 100 },
      { block: blockData.dirt, dropRate: 40 },
      { block: blockData.coal, dropRate: 25 },
      { block: blockData.iron, dropRate: 6 },
      { block: blockData.emerald, dropRate: 0.5 },
      { block: blockData.deepslate, dropRate: 2 },
      { block: blockData.deepslate_coal, dropRate: 0.8 },
    ],
  },
  {
    id: "deepslate",
    name: "Deepslate",
    description:
      "A denser, darker version of stone that starts where normal stone gives way to crushing pressure.",
    icon: import.meta.env.BASE_URL + "img/blocks/layer_deepslate.svg",
    depth: 180,
    layerBlocks: [
      { block: blockData.deepslate, dropRate: 100 },
      { block: blockData.deepslate_coal, dropRate: 30 },
      { block: blockData.deepslate_iron, dropRate: 8 },
      { block: blockData.stone, dropRate: 15 },
      { block: blockData.iron, dropRate: 4 },
      { block: blockData.obsidian_shard, dropRate: 1 },
    ],
  },
  {
    id: "mantle",
    name: "Mantle",
    description:
      "A hotter, partially-molten region. Expect odd ores forged under immense pressure — you'll need sturdier tools.",
    icon: import.meta.env.BASE_URL + "img/blocks/layer_mantle.svg",
    depth: 260,
    layerBlocks: [
      { block: blockData.mantle_ore, dropRate: 100 },
      { block: blockData.deepslate, dropRate: 60 },
      { block: blockData.deepslate_iron, dropRate: 20 },
      { block: blockData.iron, dropRate: 10 },
      { block: blockData.flux_ore, dropRate: 5 },
      { block: blockData.mantle_ore, dropRate: 100 },
    ],
  },
  {
    id: "nether",
    name: "Nether Hells",
    description:
      "A volcanic, otherworldly layer. Blocks here are twisted by heat and dark magic. Special tools or heat-shields are required.",
    icon: import.meta.env.BASE_URL + "img/blocks/layer_nether.svg",
    depth: 320,
    layerBlocks: [
      { block: blockData.netherrack, dropRate: 100 },
      { block: blockData.soulstone, dropRate: 20 },
      { block: blockData.infernal_core, dropRate: 2 },
      { block: blockData.stellar_magma, dropRate: 6 },
      { block: blockData.obsidian_shard, dropRate: 8 },
      { block: blockData.dark_iron, dropRate: 1 },
    ],
  },
  {
    id: "infernal_core",
    name: "Infernal Core",
    description:
      "A concentrated region of infernal energy and crystalline cores — breaking these yields powerful but dangerous materials.",
    icon: import.meta.env.BASE_URL + "img/blocks/layer_infernal.svg",
    depth: 360,
    layerBlocks: [
      { block: blockData.infernal_core, dropRate: 100 },
      { block: blockData.soulstone, dropRate: 30 },
      { block: blockData.mantle_ore, dropRate: 12 },
      { block: blockData.flux_ore, dropRate: 6 },
      { block: blockData.dark_iron, dropRate: 3 },
    ],
  },
  {
    id: "void",
    name: "Void Layer",
    description:
      "The reality-fractured depths — nothing here obeys normal rules. Breaking blocks requires exotic machinery and catalysts.",
    icon: import.meta.env.BASE_URL + "img/blocks/layer_void.svg",
    depth: 420,
    layerBlocks: [
      { block: blockData.voidstone, dropRate: 100 },
      { block: blockData.umbral_crystal, dropRate: 8 },
      { block: blockData.quantum_fragment, dropRate: 4 },
      { block: blockData.void_rubble, dropRate: 25 },
      { block: blockData.obsidian_shard, dropRate: 6 },
    ],
  },
  // === New cosmic / high-dimension layers ===
  {
    id: "space_rim",
    name: "Space Rim",
    description:
      "The thin border between planet and void — scattered stardust and debris fall here.",
    icon: import.meta.env.BASE_URL + "img/blocks/layer_space.svg",
    depth: 480,
    layerBlocks: [
      { block: blockData.star_dust, dropRate: 100 },
      { block: blockData.cosmic_glass, dropRate: 45 },
      { block: blockData.micro_meteor, dropRate: 30 },
      { block: blockData.stone, dropRate: 20 },
      { block: blockData.satellite_scrap, dropRate: 8 },
    ],
  },
  {
    id: "meteor_field",
    name: "Meteor Field",
    description:
      "A belt of falling rocks and meteorites — meteor iron and satellite fragments are common.",
    icon: import.meta.env.BASE_URL + "img/blocks/meteor_iron.svg",
    depth: 540,
    layerBlocks: [
      { block: blockData.meteor_iron, dropRate: 100 },
      { block: blockData.micro_meteor, dropRate: 80 },
      { block: blockData.star_dust, dropRate: 60 },
      { block: blockData.satellite_scrap, dropRate: 40 },
      { block: blockData.dark_iron, dropRate: 5 },
    ],
  },
  {
    id: "stellar_core",
    name: "Stellar Core",
    description:
      "Fragments of a dead star — molten, radiant ores here carry immense heat.",
    icon: import.meta.env.BASE_URL + "img/blocks/stellar_magma.svg",
    depth: 600,
    layerBlocks: [
      { block: blockData.stellar_magma, dropRate: 100 },
      { block: blockData.plasma_shard, dropRate: 45 },
      { block: blockData.meteor_iron, dropRate: 40 },
      { block: blockData.mantle_ore, dropRate: 12 },
      { block: blockData.flux_ore, dropRate: 6 },
    ],
  },
  {
    id: "orbit_debris",
    name: "Orbit Debris",
    description:
      "Man-made and alien machinery pieces; rarer components fall through to lower layers.",
    icon: import.meta.env.BASE_URL + "img/blocks/satellite_scrap.svg",
    depth: 660,
    layerBlocks: [
      { block: blockData.satellite_scrap, dropRate: 100 },
      { block: blockData.cosmic_glass, dropRate: 50 },
      { block: blockData.meteor_iron, dropRate: 50 },
      { block: blockData.micro_meteor, dropRate: 35 },
      { block: blockData.satellite_scrap, dropRate: 100 },
    ],
  },
  {
    id: "singularity_edge",
    name: "Singularity Edge",
    description:
      "The warped space before a singularity — unusual stones and concentrated gravity residues.",
    icon: import.meta.env.BASE_URL + "img/blocks/singularity_stone.svg",
    depth: 720,
    layerBlocks: [
      { block: blockData.singularity_stone, dropRate: 100 },
      { block: blockData.voidstone, dropRate: 40 },
      { block: blockData.void_rubble, dropRate: 35 },
      { block: blockData.deepslate, dropRate: 8 },
      { block: blockData.quantum_dust, dropRate: 6 },
    ],
  },
  {
    id: "singularity_core",
    name: "Black Hole Core",
    description:
      "Matter collapses into itself — rare tesseract shards and time essences can be found here.",
    icon: import.meta.env.BASE_URL + "img/blocks/singularity_stone.svg",
    depth: 780,
    layerBlocks: [
      { block: blockData.singularity_stone, dropRate: 80 },
      { block: blockData.tesseract_shard, dropRate: 30 },
      { block: blockData.time_essence, dropRate: 8 },
      { block: blockData.quantum_dust, dropRate: 12 },
    ],
  },
  {
    id: "tesseract",
    name: "Tesseract Plane",
    description:
      "A four-dimensional folding of space — shards and plates that interact oddly with reality.",
    icon: import.meta.env.BASE_URL + "img/blocks/tesseract_shard.svg",
    depth: 840,
    layerBlocks: [
      { block: blockData.tesseract_shard, dropRate: 100 },
      { block: blockData.umbral_crystal, dropRate: 20 },
      { block: blockData.quantum_fragment, dropRate: 12 },
      { block: blockData.quantum_dust, dropRate: 25 },
      { block: blockData.nexus_plate, dropRate: 5 },
    ],
  },
  {
    id: "temporal_rift",
    name: "Temporal Rift",
    description:
      "Time loops and essences collect here — useful for time-based machines and paradox items.",
    icon: import.meta.env.BASE_URL + "img/blocks/time_essence.svg",
    depth: 900,
    layerBlocks: [
      { block: blockData.time_essence, dropRate: 100 },
      { block: blockData.tesseract_shard, dropRate: 45 },
      { block: blockData.quantum_fragment, dropRate: 25 },
      { block: blockData.time_essence, dropRate: 100 },
    ],
  },
  {
    id: "nexus",
    name: "Nexus",
    description:
      "A convergence of realities — nexus plates and empyrean material are concentrated here.",
    icon: import.meta.env.BASE_URL + "img/blocks/nexus_plate.svg",
    depth: 960,
    layerBlocks: [
      { block: blockData.nexus_plate, dropRate: 100 },
      { block: blockData.empyrean_crystal, dropRate: 30 },
      { block: blockData.time_essence, dropRate: 18 },
      { block: blockData.quantum_fragment, dropRate: 8 },
    ],
  },
  {
    id: "empyrean",
    name: "Empyrean",
    description:
      "A celestial plane of pure crystalline matter, where rare fragments are abundant.",
    icon: import.meta.env.BASE_URL + "img/blocks/empyrean_crystal.svg",
    depth: 1020,
    layerBlocks: [
      { block: blockData.empyrean_crystal, dropRate: 100 },
      { block: blockData.nexus_plate, dropRate: 60 },
      { block: blockData.umbral_crystal, dropRate: 15 },
      { block: blockData.plasma_shard, dropRate: 12 },
      { block: blockData.cosmic_glass, dropRate: 8 },
    ],
  },
  {
    id: "antimatter_void",
    name: "Antimatter Void",
    description:
      "The deepest fringe — reality bleeds and antimatter foams here. Machinery is required to safely extract anything.",
    icon: import.meta.env.BASE_URL + "img/blocks/antimatter_foam.svg",
    depth: 1100,
    layerBlocks: [
      { block: blockData.antimatter_foam, dropRate: 100 },
      { block: blockData.quantum_fragment, dropRate: 40 },
      { block: blockData.quantum_dust, dropRate: 30 },
      { block: blockData.nexus_plate, dropRate: 12 },
      { block: blockData.voidstone, dropRate: 8 },
    ],
  },
];
