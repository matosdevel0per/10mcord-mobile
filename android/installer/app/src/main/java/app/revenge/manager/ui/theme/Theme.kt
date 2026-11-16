package app.revenge.manager.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import app.revenge.manager.domain.manager.PreferenceManager
import app.revenge.manager.domain.manager.Theme
import org.koin.androidx.compose.get

@Composable
fun RevengeManagerTheme(
    content: @Composable () -> Unit
) {
    val prefs = get<PreferenceManager>()
    val darkTheme = when (prefs.theme) {
        Theme.SYSTEM -> isSystemInDarkTheme()
        Theme.DARK -> true
        Theme.LIGHT -> false
    }

    // Keep the requested black / white / gray brand palette even when Android Monet is enabled.
    val colorScheme = if (darkTheme) TenMCordDarkColors else TenMCordLightColors

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
