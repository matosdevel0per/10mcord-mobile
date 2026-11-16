package app.revenge.manager.installer.step.download

import android.content.Context
import androidx.compose.runtime.Stable
import app.revenge.manager.BuildConfig
import app.revenge.manager.R
import app.revenge.manager.domain.manager.DownloadManager
import app.revenge.manager.domain.manager.DownloadResult
import app.revenge.manager.domain.manager.PreferenceManager
import app.revenge.manager.installer.step.Step
import app.revenge.manager.installer.step.StepGroup
import app.revenge.manager.installer.step.StepRunner
import app.revenge.manager.installer.util.SignedRelease
import app.revenge.manager.utils.mainThread
import app.revenge.manager.utils.showToast
import kotlinx.coroutines.CancellationException
import org.koin.core.component.inject
import java.io.BufferedInputStream
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.util.zip.ZipInputStream

/** Downloads the single published 10MCord release ZIP, extracts its Xposed APK and verifies it. */
@Stable
class DownloadModStep(
    private val workingDir: File
) : Step() {

    private val preferenceManager: PreferenceManager by inject()
    private val downloadManager: DownloadManager by inject()
    private val context: Context by inject()

    override val group: StepGroup = StepGroup.DL
    override val nameRes = R.string.step_dl_mod

    val workingCopy: File = workingDir.resolve("xposed.apk")
    private val archiveFile: File get() = File(context.cacheDir, ARCHIVE_NAME)

    override suspend fun run(runner: StepRunner) {
        val destination = preferenceManager.moduleLocation
        workingDir.mkdirs()

        // Developer-selected modules remain supported as before, but are not covered by the release signature.
        if (destination != preferenceManager.DEFAULT_MODULE_LOCATION) {
            if (!destination.exists() || destination.length() <= 0L) {
                error("Developer-selected module is missing: ${destination.absolutePath}")
            }
            runner.logger.i("Using the module at $destination as it is; it isn't checked against the 10MCord signed release")
            mainThread { context.showToast(R.string.msg_unsigned_module) }
            destination.copyTo(workingCopy, overwrite = true)
            return
        }

        // Always fetch the branch's current archive instead of keeping a stale successful download in cache.
        val release = downloadAndExtract(runner, destination)

        preferenceManager.releaseSequence = release.sequence.toString()
        destination.copyTo(workingCopy, overwrite = true)
        runner.logger.i("Verified signed release ${release.sequence} from $ARCHIVE_NAME")
    }

    private suspend fun downloadAndExtract(runner: StepRunner, destination: File): SignedRelease {
        archiveFile.delete()
        val archiveUrl = BuildConfig.MOBILE_ARCHIVE_URL.let { url ->
            val separator = if ('?' in url) '&' else '?'
            "$url${separator}t=${System.currentTimeMillis() / 60_000}"
        }
        runner.logger.i("Downloading $ARCHIVE_NAME from ${BuildConfig.MOBILE_ARCHIVE_URL}")
        when (val result = downloadManager.download(
            archiveUrl,
            archiveFile,
            maxBytes = MAX_ARCHIVE_BYTES
        ) {
            progress = it
        }) {
            is DownloadResult.Success -> Unit
            is DownloadResult.Cancelled -> throw CancellationException("$ARCHIVE_NAME download cancelled")
            is DownloadResult.Error -> {
                mainThread {
                    context.showToast(R.string.msg_download_failed)
                    runner.downloadErrored = true
                }
                error("Failed to download $ARCHIVE_NAME: ${result.debugReason}")
            }
        }

        runner.logger.i("Extracting and verifying the signed release ZIP")
        return try {
            extractAndVerify(archiveFile, destination)
        } catch (t: Throwable) {
            mainThread { context.showToast(R.string.msg_download_verify_failed) }
            throw t
        } finally {
            archiveFile.delete()
        }
    }

    /** Extracts only the named files, with bounded sizes, and verifies the embedded signed manifest. */
    private fun extractAndVerify(archive: File, destination: File): SignedRelease {
        if (!archive.isFile || archive.length() <= 0L || archive.length() > MAX_ARCHIVE_BYTES) {
            error("The release ZIP is missing, empty, or exceeds the allowed size")
        }
        val temporaryApk = File(context.cacheDir, "$APK_NAME.tmp")
        temporaryApk.delete()
        var apkSeen = false
        var manifest: ByteArray? = null
        var signature: ByteArray? = null

        try {
            ZipInputStream(BufferedInputStream(FileInputStream(archive))).use { zip ->
                while (true) {
                    val entry = zip.nextEntry ?: break
                    if (entry.isDirectory) continue
                    when (entry.name) {
                        APK_NAME -> {
                            if (apkSeen) error("The release ZIP contains more than one $APK_NAME")
                            apkSeen = true
                            var total = 0L
                            zip.readBytesBounded(MAX_APK_BYTES) { bytes, length ->
                                total += length
                                if (total > MAX_APK_BYTES) error("$APK_NAME exceeds the allowed size")
                                FileOutputStream(temporaryApk, true).use { it.write(bytes, 0, length) }
                            }
                        }
                        MANIFEST_NAME -> {
                            if (manifest != null) error("The release ZIP contains duplicate $MANIFEST_NAME")
                            manifest = zip.readBounded(MAX_MANIFEST_BYTES)
                        }
                        SIGNATURE_NAME -> {
                            if (signature != null) error("The release ZIP contains duplicate $SIGNATURE_NAME")
                            signature = zip.readBounded(MAX_SIGNATURE_BYTES)
                        }
                        else -> error("The release ZIP contains an unexpected entry: ${entry.name}")
                    }
                    zip.closeEntry()
                }
            }

            if (!apkSeen || !temporaryApk.exists() || temporaryApk.length() == 0L) {
                error("The release ZIP doesn't contain $APK_NAME")
            }
            val signedRelease = SignedRelease.parse(
                manifest ?: error("The release ZIP doesn't contain $MANIFEST_NAME"),
                signature ?: error("The release ZIP doesn't contain $SIGNATURE_NAME")
            ) ?: throw SecurityException("The release ZIP's signature isn't valid")

            val acceptedSequence = preferenceManager.releaseSequence.toLongOrNull() ?: 0L
            if (signedRelease.sequence < acceptedSequence) {
                throw SecurityException("The release ZIP is older than a release already installed")
            }
            signedRelease.require(APK_NAME, temporaryApk)

            destination.parentFile?.mkdirs()
            if (destination.exists()) destination.delete()
            temporaryApk.copyTo(destination, overwrite = true)
            return signedRelease
        } finally {
            temporaryApk.delete()
        }
    }

    private fun ZipInputStream.readBounded(limit: Int): ByteArray {
        val out = ByteArrayOutputStream()
        val buffer = ByteArray(8192)
        var total = 0
        while (true) {
            val n = read(buffer)
            if (n < 0) break
            total += n
            if (total > limit) error("Release metadata exceeds the allowed size")
            out.write(buffer, 0, n)
        }
        return out.toByteArray()
    }

    private inline fun ZipInputStream.readBytesBounded(
        limit: Long,
        writeChunk: (ByteArray, Int) -> Unit
    ) {
        val buffer = ByteArray(64 * 1024)
        var total = 0L
        while (true) {
            val n = read(buffer)
            if (n < 0) break
            total += n
            if (total > limit) error("Release APK exceeds the allowed size")
            writeChunk(buffer, n)
        }
    }

    private companion object {
        const val ARCHIVE_NAME = "10MCord-release.zip"
        const val APK_NAME = "10MCord-xposed.apk"
        const val MANIFEST_NAME = "10MCord-release.json"
        const val SIGNATURE_NAME = "10MCord-release.sig"
        const val MAX_APK_BYTES = 512L * 1024 * 1024
        const val MAX_ARCHIVE_BYTES = 540L * 1024 * 1024
        const val MAX_MANIFEST_BYTES = 1024 * 1024
        const val MAX_SIGNATURE_BYTES = 4096
    }
}
