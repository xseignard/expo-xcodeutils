import { ConfigContext, ExpoConfig } from "@expo/config";

import {
  ConfigPlugin,
  IOSConfig,
  withInfoPlist,
  withXcodeProject,
} from "@expo/config-plugins";
import { getProjectName } from "@expo/config-plugins/build/ios/utils/Xcodeproj";
import path from "node:path";
import { promises as fs } from "node:fs";

const withMyCustomFont: ConfigPlugin<{
  fontFile: string;
  useXcodeUtils: boolean;
}> = (config, { fontFile, useXcodeUtils }) => {
  config = withXcodeProject(config, async (config) => {
    await fs.copyFile(
      path.resolve(config.modRequest.projectRoot, fontFile),
      path.join(config.modRequest.platformProjectRoot, path.basename(fontFile))
    );
    if (useXcodeUtils) {
      const projectName = getProjectName(config.modRequest.projectRoot);
      config.modResults = IOSConfig.XcodeUtils.addResourceFileToGroup({
        filepath: path.basename(fontFile),
        groupName: `${projectName}/Resources`,
        project: config.modResults,
      });
    } else {
      config.modResults.pbxCreateGroup("Resources");
      config.modResults.addResourceFile(path.basename(fontFile));
    }
    return config;
  });
  config = withInfoPlist(config, async (config) => {
    if (!Array.isArray(config.modResults.UIAppFonts)) {
      config.modResults.UIAppFonts = [];
    }
    config.modResults.UIAppFonts.push(path.basename(fontFile));
    return config;
  });
  return config;
};


export default (ctx: ConfigContext): ExpoConfig => {
  const baseConfig: ExpoConfig = {
    "name": "expo-xcodeutils",
    "slug": "expo-xcodeutils",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "updates": {
      "fallbackToCacheTimeout": 0
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "bundleIdentifier": "com.anonymous.expoxcodeutils",
      "supportsTablet": true
    },
    "android": {
      "package": "com.anonymous.expoxcodeutils",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      }
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  };
  const config = withMyCustomFont(baseConfig, {
    fontFile: "./expo/ComicNeue-Regular.otf",
    useXcodeUtils: false,
  })
  return config;
};
