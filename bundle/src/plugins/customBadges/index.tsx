/*
 * 10MCord for Android
 * Copyright (c) 2026 rootpoi and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { t, tx } from "@core/i18n";
import { createMMKVBackend, createStorage, useProxy, wrapSync } from "@core/vendetta/storage";
import { findAssetId } from "@lib/api/assets";
import { Button, Card, IconButton, Stack, Text, TextInput } from "@metro/common/components";
import { useState } from "react";
import { Image, View } from "react-native";

import { definePlugin } from "../api";
import { currentUserId, getStore } from "../common";
import { redrawChannel } from "../hooks";
import { extendProfileBadges, linkedBadge } from "../profileBadges";

interface CustomBadge {
    id: string;
    name: string;
    iconUrl: string;
}

const saved = wrapSync(createStorage<{ badges: CustomBadge[] }>(createMMKVBackend("ENDCORD_CUSTOM_BADGES", { badges: [] })));
const badgeList = (): CustomBadge[] => Array.isArray(saved.badges) ? saved.badges : [];
const refreshProfiles = () => {
    try {
        getStore("UserProfileStore")?.emitChange?.();
    } catch { }
    redrawChannel();
};

const validHttpsImage = (value: string) => {
    try {
        const url = new URL(value.trim());
        return url.protocol === "https:" && !!url.hostname;
    } catch {
        return false;
    }
};

function CustomBadgesSettings() {
    const store = useProxy(saved);
    const [name, setName] = useState("");
    const [iconUrl, setIconUrl] = useState("");
    const cleanName = name.trim().slice(0, 32);
    const cleanUrl = iconUrl.trim();
    const urlIsValid = validHttpsImage(cleanUrl);
    const canAdd = !!cleanName && urlIsValid;

    const addBadge = () => {
        if (!canAdd) return;
        const current = badgeList();
        if (current.length >= 20) return;
        saved.badges = [...current, {
            id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
            name: cleanName,
            iconUrl: cleanUrl,
        }];
        setName("");
        setIconUrl("");
        refreshProfiles();
    };

    const removeBadge = (id: string) => {
        saved.badges = badgeList().filter(badge => badge.id !== id);
        refreshProfiles();
    };

    return <Stack spacing={12}>
        <Text variant="text-sm/medium" color="text-muted">
            {t("Create profile badges with a name and an HTTPS image link. They are stored only on this device and are visible only to you; they do not change your Discord account.")}
        </Text>
        <TextInput
            label={t("Badge name")}
            placeholder={t("For example: Founder")}
            value={name}
            onChange={setName}
            maxLength={32}
        />
        <TextInput
            label={t("Badge icon URL")}
            description={t("Paste a direct HTTPS link to a PNG, JPG, GIF, or WebP image.")}
            placeholder="https://example.com/badge.png"
            value={iconUrl}
            onChange={setIconUrl}
            autoCapitalize="none"
            autoCorrect={false}
            state={cleanUrl && !urlIsValid ? "error" : undefined}
            errorMessage={cleanUrl && !urlIsValid ? t("Enter a valid HTTPS image link.") : undefined}
        />
        <Button
            text={t("Add Badge")}
            variant="primary"
            disabled={!canAdd || badgeList().length >= 20}
            onPress={addBadge}
        />
        {badgeList().length >= 20 && <Text variant="text-sm/medium" color="text-muted">{t("You can save up to 20 badges.")}</Text>}
        {badgeList().map(badge => <Card key={badge.id}>
            <Stack direction="horizontal" style={{ alignItems: "center", justifyContent: "space-between" }}>
                <Stack direction="horizontal" style={{ alignItems: "center", gap: 10, flex: 1 }}>
                    <View style={{ width: 36, height: 36, borderRadius: 18, overflow: "hidden" }}>
                        <Image source={{ uri: badge.iconUrl }} style={{ width: 36, height: 36 }} resizeMode="cover" />
                    </View>
                    <Text variant="text-md/semibold" color="text-strong" numberOfLines={1}>{badge.name}</Text>
                </Stack>
                <IconButton
                    size="sm"
                    variant="secondary"
                    icon={findAssetId("TrashIcon")}
                    onPress={() => removeBadge(badge.id)}
                />
            </Stack>
        </Card>)}
    </Stack>;
}

export default definePlugin({
    id: "10MCord.custom-badges",
    name: "Custom Badges",
    description: tx("Create your own local profile badges with a custom name and icon. Only visible to you."),
    icon: "TagIcon",
    tags: ["Appearance", "Customisation"],
    SettingsComponent: CustomBadgesSettings,
    async start({ cleanup }) {
        cleanup(extendProfileBadges("custom-badges", (userId, badges) => {
            if (!userId || userId !== currentUserId()) return badges;
            const custom = badgeList().map(badge => linkedBadge(`10mcord.custom-badges.${badge.id}`, badge.name, badge.iconUrl));
            return [...custom, ...badges];
        }));
    },
});
