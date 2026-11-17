package app.revenge.manager.ui.theme

import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.ui.graphics.Color

/** Monochrome ShiftCord installer palette: black, white and neutral grays. */
object Ink {
    val Night = Color(0xFF0A0A0A)
    val Panel = Color(0xFF171717)
    val PanelHi = Color(0xFF242424)
    val Line = Color(0xFF383838)
    val Ice = Color(0xFFE6E6E6)
    val Cobalt = Color(0xFFD0D0D0)
    val CobaltHi = Color(0xFFE5E5E5)
    val Paper = Color(0xFFF5F5F5)
    val Mist = Color(0xFFAAAAAA)
    val Dim = Color(0xFF777777)
    val Bamboo = Color(0xFFD8D8D8)
    val Ember = Color(0xFFB8B8B8)
    val Honey = Color(0xFFE0E0E0)

    val DayBase = Color(0xFFF4F4F4)
    val DayPanel = Color(0xFFE8E8E8)
    val DayPanelHi = Color(0xFFDADADA)
    val DayLine = Color(0xFFC4C4C4)
    val DayInk = Color(0xFF111111)
    val DaySubtle = Color(0xFF555555)
    val DayCobalt = Color(0xFF222222)
}

val TenMCordDarkColors = darkColorScheme(
    primary = Ink.Cobalt,
    onPrimary = Ink.Night,
    primaryContainer = Color(0xFF303030),
    onPrimaryContainer = Ink.Paper,
    inversePrimary = Ink.DayCobalt,
    secondary = Ink.Ice,
    onSecondary = Ink.Night,
    secondaryContainer = Ink.PanelHi,
    onSecondaryContainer = Ink.Paper,
    tertiary = Ink.Bamboo,
    onTertiary = Ink.Night,
    tertiaryContainer = Color(0xFF303030),
    onTertiaryContainer = Ink.Paper,
    background = Ink.Night,
    onBackground = Ink.Paper,
    surface = Ink.Night,
    onSurface = Ink.Paper,
    surfaceVariant = Ink.PanelHi,
    onSurfaceVariant = Ink.Mist,
    surfaceTint = Ink.Cobalt,
    inverseSurface = Ink.Paper,
    inverseOnSurface = Ink.Night,
    error = Ink.Ember,
    onError = Ink.Night,
    errorContainer = Color(0xFF3A3A3A),
    onErrorContainer = Ink.Paper,
    outline = Ink.Line,
    outlineVariant = Ink.Line,
    scrim = Color(0xCC000000),
    surfaceBright = Ink.PanelHi,
    surfaceDim = Ink.Night,
    surfaceContainerLowest = Color(0xFF050505),
    surfaceContainerLow = Color(0xFF111111),
    surfaceContainer = Ink.Panel,
    surfaceContainerHigh = Color(0xFF202020),
    surfaceContainerHighest = Ink.PanelHi,
)

val TenMCordLightColors = lightColorScheme(
    primary = Ink.DayCobalt,
    onPrimary = Color.White,
    primaryContainer = Color(0xFFDCDCDC),
    onPrimaryContainer = Color(0xFF111111),
    inversePrimary = Ink.Ice,
    secondary = Color(0xFF555555),
    onSecondary = Color.White,
    secondaryContainer = Ink.DayPanelHi,
    onSecondaryContainer = Ink.DayInk,
    tertiary = Color(0xFF555555),
    onTertiary = Color.White,
    tertiaryContainer = Color(0xFFE1E1E1),
    onTertiaryContainer = Color(0xFF181818),
    background = Ink.DayBase,
    onBackground = Ink.DayInk,
    surface = Ink.DayBase,
    onSurface = Ink.DayInk,
    surfaceVariant = Ink.DayPanelHi,
    onSurfaceVariant = Ink.DaySubtle,
    surfaceTint = Ink.DayCobalt,
    inverseSurface = Ink.Night,
    inverseOnSurface = Ink.Paper,
    error = Color(0xFF555555),
    onError = Color.White,
    errorContainer = Color(0xFFE1E1E1),
    onErrorContainer = Color(0xFF181818),
    outline = Ink.DayLine,
    outlineVariant = Ink.DayLine,
    scrim = Color(0x99000000),
    surfaceBright = Color.White,
    surfaceDim = Ink.DayPanelHi,
    surfaceContainerLowest = Color.White,
    surfaceContainerLow = Color(0xFFF0F0F0),
    surfaceContainer = Ink.DayPanel,
    surfaceContainerHigh = Color(0xFFDFDFDF),
    surfaceContainerHighest = Ink.DayPanelHi,
)
