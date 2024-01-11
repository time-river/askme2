/*
 * @Descripttion:
 * @Author: zhangchong zc16607@gmail.com
 * @Date: 2022-12-29 16:28:26
 * @LastEditors: zhangchong zc16607@gmail.com
 * @LastEditTime: 2022-12-30 09:46:46
 */

// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";

// Expose protected methods that allow the renderer process to use the ipcRenderer without exposing the entire object. Reference: https://nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration
contextBridge.exposeInMainWorld('ipcRenderer', {
  receive: (channel, func) => {
    if (
      ['fromMain', 'tabs-update'].includes(
        channel
      )
    ) {
      ipcRenderer.on(channel, (event, ...args) => func(...args)); // Deliberately strip the event as it includes the sender.
    } // end if
  },
  send: (channel, data) => {
    if (
      [
        'close-tab',
        'toMain',
        'new-tab',
        'switch-tab',
        'control-ready',
      ].includes(channel)
    ) {
      ipcRenderer.send(channel, data);
    } // end if
  },
});