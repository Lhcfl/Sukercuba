import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type {
  RouteLocationAsPathGeneric,
  RouteLocationAsRelativeGeneric,
} from "vue-router";
import { useAccount } from "@/stores/account";

export interface NavigationItem {
  icon: string;
  title: string;
  sidebar?: boolean;
  bottom?: boolean;
  to?: RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric | string;
  action?: () => void;
}

async function clearCache() {
  await useCustomEmojisData().update();
  location.reload();
}

export function useNavigations() {
  const { t } = useI18n();
  const account = useAccount();
  return computed(() => {
    const navigations: NavigationItem[] = [
      {
        title: t("home"),
        icon: "mdi-home",
        to: "/",
        sidebar: true,
        bottom: true,
      },
      {
        title: t("notifications"),
        icon: "mdi-bell",
        to: "/notifications",
        sidebar: true,
        bottom: true,
      },
      {
        title: t("followRequests"),
        icon: "mdi-account-plus",
        to: "/follow-requests",
        sidebar: account.me?.hasPendingReceivedFollowRequest,
      },
      {
        title: t("search"),
        icon: "mdi-magnify",
        to: "/search",
        sidebar: true,
        bottom: true,
      },
      {
        title: t("favorites"),
        icon: "mdi-star",
        to: "/favorites",
        sidebar: true,
      },
      { title: t("clips"), icon: "mdi-bookmark", to: "/clips", sidebar: true },
      { title: t("login"), icon: "mdi-login", to: "/login", sidebar: true },
      {
        title: t("clearCache"),
        icon: "mdi-delete",
        action: clearCache,
        sidebar: true,
      },
    ];

    return navigations;
  });
}
