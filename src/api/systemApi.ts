import { axiosClient } from "./axiosClient";
import { ApiResponse } from "../types";
import {
  BannerNotificationConfig,
  MaintenanceConfig,
} from "../types/system.types";

export const systemApi = {
  getBanner: (): Promise<
    ApiResponse<{ banner: BannerNotificationConfig | null }>
  > => {
    return axiosClient.get("/system/banner");
  },

  getMaintenance: (): Promise<
    ApiResponse<{ maintenance: MaintenanceConfig }>
  > => {
    return axiosClient.get("/system/maintenance");
  },
};
