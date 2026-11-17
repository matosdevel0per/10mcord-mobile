/*
 * ShiftCord for Android
 * Copyright (c) 2026 rootpoi and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { t, tx } from "@core/i18n";
import { createMMKVBackend, createStorage, useProxy, wrapSync } from "@core/vendetta/storage";
import { findAssetId } from "@lib/api/assets";
import { getNativeModule } from "@lib/api/native/modules";
import { Button, Card, IconButton, Stack, Text, TextInput } from "@metro/common/components";
import { useState } from "react";
import { Image, View } from "react-native";

import { definePlugin } from "../api";
import { currentUserId, getStore } from "../common";
import { redrawChannel, toastError } from "../hooks";
import { extendProfileBadges, linkedBadge } from "../profileBadges";

interface CustomBadge {
    id: string;
    name: string;
    /** Base64 data URL created by the native picker; iconUrl remains for badges made by the previous version. */
    iconData?: string;
    iconUrl?: string;
}

const saved = wrapSync(createStorage<{ badges: CustomBadge[] }>(createMMKVBackend("ENDCORD_CUSTOM_BADGES", { badges: [] })));
const badgeList = (): CustomBadge[] => Array.isArray(saved.badges) ? saved.badges : [];
const iconOf = (badge: CustomBadge) => badge.iconData || badge.iconUrl || "";
const refreshProfiles = () => {
    try {
        getStore("UserProfileStore")?.emitChange?.();
    } catch { }
    redrawChannel();
};

/** Save the selected source bytes so transparent PNG/WebP icons aren't flattened onto a black JPEG background. */
function pickImage(): Promise<string | undefined> {
    const picker = getNativeModule("ImagePickerManager");
    if (typeof picker?.launchImageLibrary !== "function") return Promise.reject(new Error(t("Couldn't open the photo picker")));
    return new Promise((resolve, reject) => picker.launchImageLibrary(
        {
            mediaType: "photo",
            videoQuality: "high",
            quality: 1,
            maxWidth: 0,
            maxHeight: 0,
            includeBase64: true,
            cameraType: "back",
            selectionLimit: 1,
            saveToPhotos: false,
            durationLimit: 0,
            includeExtra: false,
            presentationStyle: "pageSheet",
        },
        (res: any) => {
            if (res?.didCancel) return resolve(undefined);
            const asset = res?.assets?.[0];
            if (res?.errorCode || !asset?.base64) return reject(new Error(res?.errorMessage || t("Couldn't open the photo picker")));
            const mime = asset.type || (String(asset.fileName ?? "").toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg");
            resolve(`data:${mime};base64,${asset.base64}`);
        },
    ));
}

function CustomBadgesSettings() {
    useProxy(saved);
    const [name, setName] = useState("");
    const [iconData, setIconData] = useState("");
    const cleanName = name.trim().slice(0, 32);
    const canAdd = !!cleanName && !!iconData;

    const chooseImage = () => pickImage().then(image => image && setIconData(image)).catch(toastError);
    const addBadge = () => {
        if (!canAdd) return;
        const current = badgeList();
        if (current.length >= 20) return;
        saved.badges = [...current, {
            id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
            name: cleanName,
            iconData,
        }];
        setName("");
        setIconData("");
        refreshProfiles();
    };

    const removeBadge = (id: string) => {
        saved.badges = badgeList().filter(badge => badge.id !== id);
        refreshProfiles();
    };

    return <Stack spacing={12}>
        <Text variant="text-sm/medium" color="text-muted">
            {t("Create profile badges with a name and an image from your device. They are stored only on this device and are visible only to you; they do not change your Discord account.")}
        </Text>
        <TextInput
            label={t("Badge name")}
            placeholder={t("For example: Founder")}
            value={name}
            onChange={setName}
            maxLength={32}
        />
        <Button
            text={iconData ? t("Change Image") : t("Choose Image")}
            variant="secondary"
            icon={findAssetId("ImageIcon")}
            onPress={chooseImage}
        />
        {iconData ? <View style={{ alignItems: "center" }}>
            <Image source={{ uri: iconData }} style={{ width: 64, height: 64, borderRadius: 32 }} resizeMode="cover" resizeMethod="resize" />
        </View> : <Text variant="text-sm/medium" color="text-muted">{t("Choose a PNG, JPG, GIF, or WebP image from your device.")}</Text>}
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
                        <Image source={{ uri: iconOf(badge) }} style={{ width: 36, height: 36 }} resizeMode="cover" resizeMethod="resize" />
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
            const custom = badgeList().map(badge => linkedBadge(`10mcord.custom-badges.${badge.id}`, badge.name, iconOf(badge)));
            return [...custom, ...badges];
        }));
    },
});
