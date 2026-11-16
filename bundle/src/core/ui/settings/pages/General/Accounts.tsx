import { t } from "@core/i18n";
import { useProxy } from "@core/vendetta/storage";
import { findAssetId } from "@lib/api/assets";
import { settings } from "@lib/api/settings";
import { openAlert } from "@lib/ui/alerts";
import { showToast } from "@lib/ui/toasts";
import { clipboard } from "@metro/common";
import { AlertActionButton, AlertActions, AlertModal, TableRow, TableRowGroup, TextInput } from "@metro/common/components";
import { findByProps } from "@metro/wrappers";
import { useState } from "react";
import { ScrollView } from "react-native";

export default function Accounts() {
    useProxy(settings);
    const [draft, setDraft] = useState("");
    const accounts = settings.savedLoginAccounts ?? [];

    function saveAccount() {
        const identifier = draft.trim();
        if (!identifier) return;
        if (accounts.some(account => account.toLowerCase() === identifier.toLowerCase())) {
            showToast(t("This account is already saved"));
            return;
        }
        settings.savedLoginAccounts = [...accounts, identifier];
        setDraft("");
    }

    function switchTo(identifier: string) {
        openAlert("10MCord-switch-account", <AlertModal
            title={t("Switch account?")}
            content={t("10MCord will copy {account} and sign you out. Discord's normal login screen will open; enter your password there. 10MCord does not save passwords or login tokens.", { account: identifier })}
            actions={<AlertActions>
                <AlertActionButton text={t("Copy and sign out")} variant="destructive" onPress={() => {
                    try {
                        clipboard.setString(identifier);
                        const auth = findByProps("logout") as { logout?: () => void } | undefined;
                        if (typeof auth?.logout !== "function") throw new Error("Discord logout action unavailable");
                        auth.logout();
                    } catch {
                        openAlert("10MCord-account-switch-unavailable", <AlertModal
                            title={t("Couldn't open login")}
                            content={t("Sign out from Discord's own account settings, then sign in with the saved account. The saved identifier remains in this list.")}
                            actions={<AlertActionButton text={t("OK")} variant="primary" />}
                        />);
                    }
                }} />
                <AlertActionButton text={t("Cancel")} variant="secondary" />
            </AlertActions>}
        />);
    }

    function removeAccount(identifier: string) {
        settings.savedLoginAccounts = accounts.filter(account => account !== identifier);
    }

    return <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 38 }}>
        <TableRowGroup title={t("Saved accounts")}>
            {accounts.length === 0
                ? <TableRow label={t("No accounts saved yet")} subLabel={t("Add an email, phone number or username below. Passwords are never stored.")} disabled />
                : accounts.map((account, index) => <TableRow
                    key={`${account}-${index}`}
                    arrow
                    label={account}
                    subLabel={t("Tap to copy this login and open Discord's normal sign-in")}
                    icon={<TableRow.Icon source={findAssetId("ClydeIcon")!} />}
                    onPress={() => switchTo(account)}
                    trailing={<TableRow.TrailingText text={t("Sign in")} />}
                />)}
        </TableRowGroup>
        <TableRowGroup title={t("Add an account")}>
            <TextInput
                label={t("Email, phone or username")}
                description={t("Only this identifier is saved. Enter your password on Discord's login screen.")}
                value={draft}
                onChange={setDraft}
                autoCapitalize="none"
                autoCorrect={false}
            />
            <TableRow
                label={t("Save account")}
                icon={<TableRow.Icon source={findAssetId("ClydeIcon")!} />}
                disabled={!draft.trim()}
                onPress={saveAccount}
            />
        </TableRowGroup>
        {accounts.length > 0 && <TableRowGroup title={t("Remove saved accounts")}>
            {accounts.map((account, index) => <TableRow
                key={`remove-${account}-${index}`}
                label={t("Remove {account}", { account })}
                icon={<TableRow.Icon source={findAssetId("CircleXIcon-primary")!} />}
                onPress={() => removeAccount(account)}
            />)}
        </TableRowGroup>}
    </ScrollView>;
}
