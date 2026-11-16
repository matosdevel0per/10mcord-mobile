package app.revenge.manager.ui.widgets.installer

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.animateContentSize
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.KeyboardArrowUp
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import app.revenge.manager.R
import app.revenge.manager.installer.step.Step
import app.revenge.manager.installer.step.StepStatus
import app.revenge.manager.installer.step.download.base.DownloadStep

/** Monochrome expandable container for a group of installation steps. */
@Composable
fun StepGroupCard(
    name: String,
    isCurrent: Boolean,
    steps: List<Step>,
    onClick: () -> Unit
) {
    val status = when {
        steps.all { it.status == StepStatus.QUEUED } -> StepStatus.QUEUED
        steps.all { it.status == StepStatus.SUCCESSFUL } -> StepStatus.SUCCESSFUL
        steps.any { it.status == StepStatus.ONGOING } -> StepStatus.ONGOING
        steps.any { it.status == StepStatus.UNSUCCESSFUL } -> StepStatus.UNSUCCESSFUL
        else -> StepStatus.ONGOING
    }
    val shape = RoundedCornerShape(18.dp)
    val containerColor by animateColorAsState(
        targetValue = if (isCurrent) MaterialTheme.colorScheme.surfaceContainerHigh
        else MaterialTheme.colorScheme.surfaceContainerLow,
        label = "installerGroupSurface"
    )

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(shape)
            .background(containerColor)
            .border(1.dp, MaterialTheme.colorScheme.outlineVariant, shape)
            .animateContentSize()
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            modifier = Modifier
                .clickable(onClick = onClick)
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 15.dp)
        ) {
            StepIcon(status, 24.dp, progress = null)
            Text(text = name, style = MaterialTheme.typography.titleSmall)
            Spacer(modifier = Modifier.weight(1f))
            if (status != StepStatus.ONGOING && status != StepStatus.QUEUED) {
                Text(
                    text = "%.2fs".format(steps.sumOf { it.durationMs } / 1000f),
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            val (arrow, cd) = when {
                isCurrent -> Icons.Filled.KeyboardArrowUp to R.string.action_collapse
                else -> Icons.Filled.KeyboardArrowDown to R.string.action_expand
            }
            Icon(
                imageVector = arrow,
                contentDescription = stringResource(cd),
                tint = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }

        AnimatedVisibility(
            visible = isCurrent,
            enter = expandVertically() + fadeIn(),
            exit = shrinkVertically() + fadeOut()
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(MaterialTheme.colorScheme.surfaceContainer)
            ) {
                HorizontalDivider(
                    color = MaterialTheme.colorScheme.outlineVariant,
                    thickness = 1.dp
                )
                Column(
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 14.dp)
                ) {
                    steps.forEachIndexed { index, step ->
                        if (index > 0) {
                            HorizontalDivider(
                                color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.55f),
                                thickness = 0.7.dp,
                                modifier = Modifier.padding(start = 30.dp)
                            )
                        }
                        StepRow(
                            name = stringResource(step.nameRes),
                            status = step.status,
                            progress = step.progress,
                            cached = (step as? DownloadStep)?.cached ?: false,
                            duration = step.durationMs / 1000f
                        )
                    }
                }
            }
        }
    }
}
