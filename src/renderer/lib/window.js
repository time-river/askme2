/*
 * @Descripttion:
 * @Author: zhangchong zc16607@gmail.com
 * @Date: 2022-12-29 17:05:04
 * @LastEditors: zhangchong zc16607@gmail.com
 * @LastEditTime: 2023-05-22 16:59:48
 */

import { nativeTheme, screen, dialog, app, ipcMain, webContents } from 'electron'
import log from "electron-log";
import { platform } from "process";
import path from 'path';

import { TabbedWindow } from "./tabbed-window.js";
import global from "./global.js";
import * as zhCN from '../locales/zh-CN.json'

export async function createTabbedWin(stockList) {
  global.tabItemCount = 0;

  const { height, width } = screen.getPrimaryDisplay().workAreaSize;
  let baseUrl;

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    baseUrl = MAIN_WINDOW_VITE_DEV_SERVER_URL;
  } else {
    baseUrl = path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`);
  }

  const winHeight = Math.round(height * 0.7);
  const winOptions = {
    backgroundColor: nativeTheme.shouldUseDarkColors
      ? global.common.DARK_WIN_COLOUR
      : global.common.LIGHT_WIN_COLOUR,
    center: true,
    minHeight: global.common.MIN_WIN_HEIGHT,
    minWidth: global.common.MIN_WIN_WIDTH,
    // titleBarStyle: platform === global.common.MACOS ? "hiddenInset" : "hidden",
  };

  // TODO: titleBarOverlay temp workaround.
  if (platform === global.common.MACOS) {
    winOptions.titleBarOverlay = {
      color: global.common.TITLE_BAR_OVERLAY_COLOUR,
      height: global.common.TAB_BAR_HEIGHT,
      symbolColor: global.common.LIGHT_WIN_COLOUR,
    };
  } // end if

  const winWidth = Math.round(width * 0.7);
  var tabbedWin = new TabbedWindow({
    blankPage: global.common.blankPage,
    blankTitle: zhCN.newTabItem,
    controlHeight: global.common.TAB_BAR_HEIGHT,
    controlPanel: `${baseUrl}/#/tabbar`,
    debug: process.env.NODE_ENV === global.common.DEV,
    height:
      winHeight >= global.common.MIN_WIN_HEIGHT
        ? winHeight
        : global.common.MIN_WIN_HEIGHT,
    startPage: global.common.startPage,
    viewReferences: { scrollBounce: true },
    width:
      winWidth >= global.common.MIN_WIN_WIDTH
        ? winWidth
        : global.common.MIN_WIN_WIDTH,
    winOptions,
  });

  // 监听tab控制事件
  initialiseCustomisedWinListener(tabbedWin)
  // 监听主窗口的事件
  initialiseIpcMainListener(stockList, tabbedWin);

  return tabbedWin;
}

function initialiseCustomisedWinListener(tabbedWin) {
  tabbedWin.on("closed", () => {
    tabbedWin = null;
  })
  tabbedWin.on('close-tab', () => {
    global.tabItemCount--
  })
  tabbedWin.on('control-ready', async () => {
    // auto update
    // console.log('check update start')
  })
  tabbedWin.on('new-tab', () => {
    global.tabItemCount++
  })
  tabbedWin.win.on("close", (e) => {

    if (global.tabItemCount <= 1) {
      return
    }

    const buttonIndex = dialog.showMessageBoxSync(tabbedWin.win, {
      buttons: [zhCN.default.confirm, zhCN.default.cancel],
      cancelId: 1,
      detail: zhCN.default.closingMultipleTabsConfirmationDetail,
      message: zhCN.default.closingMultipleTabsConfirmationMessage,
      noLink: true,
      title: app.name,
      type: "info",
    })

    if (buttonIndex === 1) {
      e.preventDefault();
    } // end if
  })
  tabbedWin.win.on("enter-full-screen", () => {

  })
  tabbedWin.win.on("leave-full-screen", () => {
    // setAppMenu(tabbedWin);
    // tabbedWin.win.webContents.send(
    //   global.common.IPC_RECEIVE,
    //   global.common.EXIT_FULL_SCREEN
    // );
  })
}

// 监听主窗口的事件，最大化，最小化、关闭等
function initialiseIpcMainListener(stockList, tabbedWin) {
  ipcMain.removeAllListeners(['toMain'])
  ipcMain.on('toMain', async (event, data) => {
    const viewContents = webContents.fromId(event.sender.id)

    if (typeof data === "object") {
      await reactToIpcObjectData(data, tabbedWin, viewContents)
    } else {
      await reactToIpcIdData(data, stockList, tabbedWin, viewContents)
    }
  })
}

async function reactToIpcIdData(data, stockList, tabbedWin, viewContents) {
  switch (data) {
    // 最小化窗口
    case 'minimiseWin': {
      // TODO: titleBarOverlay temp workaround.
      tabbedWin.win.minimize();
      break
    }
    // 最大化或恢复窗口大小
    case 'maximiseOrRestoreWin': {
      maximiseOrRestoreWin(tabbedWin, viewContents)
      break
    }
    // 关闭窗口
    case 'closeWin': {
      tabbedWin.win.close()
      break
    }
    // 设置夜间模式
    case 'correctWinColour': {
      Array.prototype.forEach.call(BrowserWindow.getAllWindows(), (element) =>
        element.setBackgroundColor(
          nativeTheme.shouldUseDarkColors
            ? global.common.DARK_WIN_COLOUR
            : global.common.LIGHT_WIN_COLOUR
        )
      )
      break
    }
    // 获取平台信息
    case 'getPlatform': {
      const os = {}
      os.getPlatform = platform
      viewContents.send('fromMain', os)
      break
    }
    // 首次打开页面，返回第一个tab id
    case 'getStartTabId': {
      const startTabId = {}
      startTabId.currentTabId = tabbedWin.tabs[0]
      viewContents.send('fromMain', startTabId)
      break
    }
    default: {
      log.warn(
        "Unknown IPC channel event in the data message:",
        JSON.stringify(data)
      )
    }
  }
}

// 响应ipc的object类型数据的事件
async function reactToIpcObjectData(data, tabbedWin, viewContents) {
  switch (data['tag']) {
    case 'getNewTabItemId': {
      const newTabId = {}
      newTabId.getNewTabItemId = tabbedWin.tabs[tabbedWin.tabs.length - 1]
      newTabId.newTabItemIndex = data.newTabItemIndex
      viewContents.send('fromMain')
      break
    }
    default: {
      log.warn(
        "Unknown IPC channel event in the data message:",
        JSON.stringify(data)
      )
    }
  }
}

// 最大化或恢复窗口大小
function maximiseOrRestoreWin(tabbedWin, viewContents) {
  // TODO: titleBarOverlay temp workaround.
  if (platform === 'win32' || platform === "linux") {
    if (tabbedWin.win.isMaximized()) {
      tabbedWin.win.unmaximize()
      viewContents.send('fromMain', 'restoreWin')
    } else {
      tabbedWin.win.maximize()
      viewContents.send('fromMain', 'maximiseWin')
    }

    return
  }

  // NOTE: react to this ID data on macOS only.
  // Reference: https://github.com/electron/electron/issues/16385#issuecomment-653952292
  // switch (
  //   systemPreferences.getUserDefault("AppleActionOnDoubleClick", "string")
  // ) {
  //   case "Minimize": {
  //     tabbedWin.win.minimize();
  //     break;
  //   }
  //   case "None": {
  //     break;
  //   }
  //   default: {
  //     tabbedWin.win.isMaximized()
  //       ? tabbedWin.win.unmaximize()
  //       : tabbedWin.win.maximize();
  //   }
  // }
}
