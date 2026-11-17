/*
 * 10MCord for Android
 * Copyright (c) 2026 rootpoi and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * 10MCord's built-in plugins as bunny["10MCord"], like ShiftCord PC's 10MCord.Plugins: for DevTools and the self-test.
 * Only the manifest is loaded with it; everything else is required when used, so it costs nothing at startup.
 */

import type { TenMCordPlugin } from "./api";
import { manifest } from "./manifest";

export { manifest };

/** A plugin by ID, loading its code */
export const getPlugin = (id: string): TenMCordPlugin => require("./index").load10MCordPlugin(id);
/** Every plugin, loading all of their code */
export const getPlugins = (): TenMCordPlugin[] => require("./index").get10MCordPlugins();

const resolve = (plugin: string | TenMCordPlugin) => typeof plugin === "string" ? getPlugin(plugin) : plugin;

/** Starts a plugin, by ID or as returned by getPlugin, without turning it on in the settings */
export const start = (plugin: string | TenMCordPlugin): Promise<void> => require("./api").start10MCordPlugin(resolve(plugin));
/** Stops a plugin, by ID or as returned by getPlugin, without turning it off in the settings */
export const stop = (plugin: string | TenMCordPlugin): void => require("./api").stop10MCordPlugin(resolve(plugin));
export const isRunning = (id: string): boolean => require("./api").is10MCordPluginRunning(id);

/** What the running plugins have registered, by kind: a plugin that leaves any of these behind when it stops leaks */
export function registrations() {
    const { registeredSections } = require("@ui/settings");
    return {
        ...require("./hooks").hookCounts(),
        ...require("./common").registryCounts(),
        fluxInterceptors: require("@lib/api/flux").interceptorCount(),
        commands: require("@lib/api/commands").registeredCommandCount(),
        overlays: require("@core/overlay").overlayCount(),
        settingsRows: Object.values(registeredSections as Record<string, unknown[]>).reduce((n, rows) => n + rows.length, 0),
    };
}

/** The warnings and errors plugins logged since the app started: one plugin's, or every plugin's by ID */
export const logs = (id?: string) => id ? require("./api").pluginLogsOf(id) : require("./api").allPluginLogs();

/** The plugins' registered callbacks and commands, for the self-test to exercise each one */
export const hooks = () => ({ ...require("./hooks").hookRegistries(), commands: require("@lib/api/commands").registeredCommands() });
