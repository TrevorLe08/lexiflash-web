export interface AvatarPresetItem {
  url: string;
  title: string;
}

// 32 curated avatars across 8 categories (4 per category) in DiceBear 10.x:
// avataaars, bottts, clay, fun-emoji, pixel-art, voxel-art, voxel-bot, planets
export const AVATAR_PRESETS: AvatarPresetItem[] = [
  // 1. Avataaars (4 avt)
  {
    url: "https://api.dicebear.com/10.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
    title: "Avataaars - Felix",
  },
  {
    url: "https://api.dicebear.com/10.x/avataaars/svg?seed=Aneka&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
    title: "Avataaars - Aneka",
  },
  {
    url: "https://api.dicebear.com/10.x/avataaars/svg?seed=Zoe&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
    title: "Avataaars - Zoe",
  },
  {
    url: "https://api.dicebear.com/10.x/avataaars/svg?seed=Oliver&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
    title: "Avataaars - Oliver",
  },

  // 2. Bottts (4 avt)
  {
    url: "https://api.dicebear.com/10.x/bottts/svg?seed=Spark&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
    title: "Bottts - Spark",
  },
  {
    url: "https://api.dicebear.com/10.x/bottts/svg?seed=Gear&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
    title: "Bottts - Gear",
  },
  {
    url: "https://api.dicebear.com/10.x/bottts/svg?seed=Gizmo&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
    title: "Bottts - Gizmo",
  },
  {
    url: "https://api.dicebear.com/10.x/bottts/svg?seed=Byte&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
    title: "Bottts - Byte",
  },

  // 3. Clay (4 avt)
  {
    url: "https://api.dicebear.com/10.x/clay/svg?seed=Milo&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
    title: "Clay - Milo",
  },
  {
    url: "https://api.dicebear.com/10.x/clay/svg?seed=Luna&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
    title: "Clay - Luna",
  },
  {
    url: "https://api.dicebear.com/10.x/clay/svg?seed=Nova&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
    title: "Clay - Nova",
  },
  {
    url: "https://api.dicebear.com/10.x/clay/svg?seed=Jasper&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
    title: "Clay - Jasper",
  },

  // 4. Fun Emoji (4 avt)
  {
    url: "https://api.dicebear.com/10.x/fun-emoji/svg?seed=Smile&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
    title: "Fun Emoji - Smile",
  },
  {
    url: "https://api.dicebear.com/10.x/fun-emoji/svg?seed=Wink&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
    title: "Fun Emoji - Wink",
  },
  {
    url: "https://api.dicebear.com/10.x/fun-emoji/svg?seed=Cool&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
    title: "Fun Emoji - Cool",
  },
  {
    url: "https://api.dicebear.com/10.x/fun-emoji/svg?seed=Star&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
    title: "Fun Emoji - Star",
  },

  // 5. Pixel Art (4 avt)
  {
    url: "https://api.dicebear.com/10.x/pixel-art/svg?seed=Hero&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
    title: "Pixel Art - Hero",
  },
  {
    url: "https://api.dicebear.com/10.x/pixel-art/svg?seed=Pixel&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
    title: "Pixel Art - Pixel",
  },
  {
    url: "https://api.dicebear.com/10.x/pixel-art/svg?seed=Ninja&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
    title: "Pixel Art - Ninja",
  },
  {
    url: "https://api.dicebear.com/10.x/pixel-art/svg?seed=Quest&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
    title: "Pixel Art - Quest",
  },

  // 6. Voxel Art (4 avt)
  {
    url: "https://api.dicebear.com/10.x/voxel-art/svg?seed=Cube&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
    title: "Voxel Art - Cube",
  },
  {
    url: "https://api.dicebear.com/10.x/voxel-art/svg?seed=Block&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
    title: "Voxel Art - Block",
  },
  {
    url: "https://api.dicebear.com/10.x/voxel-art/svg?seed=Craft&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
    title: "Voxel Art - Craft",
  },
  {
    url: "https://api.dicebear.com/10.x/voxel-art/svg?seed=Voxel&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
    title: "Voxel Art - Voxel",
  },

  // 7. Voxel Bot (4 avt)
  {
    url: "https://api.dicebear.com/10.x/voxel-bot/svg?seed=Robo&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
    title: "Voxel Bot - Robo",
  },
  {
    url: "https://api.dicebear.com/10.x/voxel-bot/svg?seed=Cyber&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
    title: "Voxel Bot - Cyber",
  },
  {
    url: "https://api.dicebear.com/10.x/voxel-bot/svg?seed=Matrix&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
    title: "Voxel Bot - Matrix",
  },
  {
    url: "https://api.dicebear.com/10.x/voxel-bot/svg?seed=Nexus&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
    title: "Voxel Bot - Nexus",
  },

  // 8. Planets (4 avt)
  {
    url: "https://api.dicebear.com/10.x/planets/svg?seed=Mars&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
    title: "Planets - Mars",
  },
  {
    url: "https://api.dicebear.com/10.x/planets/svg?seed=Jupiter&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
    title: "Planets - Jupiter",
  },
  {
    url: "https://api.dicebear.com/10.x/planets/svg?seed=Neptune&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
    title: "Planets - Neptune",
  },
  {
    url: "https://api.dicebear.com/10.x/planets/svg?seed=Saturn&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
    title: "Planets - Saturn",
  },
];
