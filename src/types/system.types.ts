export type BannerColor =
  "red" | "amber" | "emerald" | "blue" | "purple" | "cyan" | "dark";

export interface BannerNotificationConfig {
  id: string;
  isEnabled: boolean;
  message: string;
  color: BannerColor;
  linkUrl?: string;
  linkText?: string;
  updatedAt: string;
}

export interface MaintenanceConfig {
  isActive: boolean;
  title: string;
  message: string;
  estimatedEndTime?: string;
  updatedAt: string;
}
