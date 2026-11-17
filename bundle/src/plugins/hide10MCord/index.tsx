/*
 * ShiftCord for Android
 * Copyright (c) 2026 rootpoi and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { t, tx } from "@core/i18n";
import { findAssetId } from "@lib/api/assets";
import { registerCommand } from "@lib/api/commands";
import { showToast } from "@lib/ui/toasts";
import { Text } from "@metro/common/components";
import { sectionVisibility } from "@ui/settings";

import { definePlugin, onSettingChange } from "../api";

const plugin = definePlugin({
    id: "10MCord.hide-10MCord",
    name: "Hide ShiftCord",
    description: tx("Hides ShiftCord's entries in Discord's settings, for screenshots and screen sharing. Plugins keep working."),
    popular: 3,
    icon: "EyeSlashIcon",
    tags: ["Privacy", "Utility"],
    settings: {
        hidden: {
            type: "boolean",
            label: tx("Hide ShiftCord now"),
            description: tx("Type /hideshiftcord in any chat to show ShiftCord's settings again"),
            default: false,
        },
    },
    start({ store, cleanup }) {
        sectionVisibility.hidden = store.hidden;
        cleanup(
            onSettingChange(store, key => {
                if (key === "hidden") sectionVisibility.hidden = store.hidden;
            }),
            registerCommand({
                name: "hideshiftcord",
                description: t("Show or hide ShiftCord's entries in Discord's settings"),
                options: [],
                execute() {
                    store.hidden = !store.hidden;
                    showToast(store.hidden ? t("ShiftCord is hidden from settings") : t("ShiftCord is shown in settings again"), findAssetId(store.hidden ? "EyeSlashIcon" : "EyeIcon"));
                },
            }),
            () => sectionVisibility.hidden = false,
        );
    },
    SettingsComponent: () => <Text variant="text-sm/medium" color="text-muted">
        {t("Reopen Discord's settings after switching for the change to show.")}
    </Text>,
});

export default plugin;
