TARGET := iphone:clang:latest:14.0
SDK = iPhoneOS14.5
ARCHS = arm64
INSTALL_TARGET_PROCESSES = Discord
THEOS_PACKAGE_SCHEME = rootless
FINALPACKAGE = 1

include $(THEOS)/makefiles/common.mk

TWEAK_NAME = ShiftCord

10MCord_FILES = $(wildcard Sources/*.x Sources/*.xm Sources/*.m Sources/*.mm Sources/**/*.x Sources/**/*.xm Sources/**/*.m Sources/**/*.mm)
10MCord_CFLAGS = -fobjc-arc -DPACKAGE_VERSION='@"$(THEOS_PACKAGE_BASE_VERSION)"' -I$(THEOS_PROJECT_DIR)/Headers
10MCord_CCFLAGS = -std=c++17 -Wno-c++11-narrowing -I$(THEOS_PROJECT_DIR)/Headers
10MCord_FRAMEWORKS = Foundation UIKit CoreGraphics CoreText CoreFoundation QuartzCore UniformTypeIdentifiers Security AuthenticationServices
10MCord_LDFLAGS = -undefined dynamic_lookup

# The key signed bundle releases are checked with (bundle/scripts/sign-release.mjs). TENMCORD_REQUIRE_SIGNED=1 also refuses
# a published bundle that has no signed release.
TENMCORD_RELEASE_KEY ?= $(shell cat $(THEOS_PROJECT_DIR)/../bundle/release-key.pub)
10MCord_CFLAGS += -DTENMCORD_RELEASE_KEY='@"$(TENMCORD_RELEASE_KEY)"'
ifdef TENMCORD_REQUIRE_SIGNED
10MCord_CFLAGS += -DTENMCORD_REQUIRE_SIGNED=1
endif

# The simulator test's build (Tests/run.sh) downloads the bundle from its own server
ifdef TENMCORD_BUNDLE_URL
10MCord_CFLAGS += -DTENMCORD_BUNDLE_URL='@"$(TENMCORD_BUNDLE_URL)"'
endif

include $(THEOS_MAKE_PATH)/tweak.mk

after-stage::
	$(ECHO_NOTHING)find $(THEOS_STAGING_DIR) -name ".DS_Store" -delete$(ECHO_END)
