/**
 * Copyright 2018 Ryoya Kawai
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/


export default class ChromeUtils {
    constructor() {
    }

    async storageGet(name) {
        return new Promise( (resolve, reject) => {
            try {
                chrome.storage.sync.get(name, (data) => {
                    //console.log(name, data);
                    resolve(data[name]);
                });
            } catch (e) {
                reject(new Error(e));
            }
        });
    }

    async storageSet(name, data) {
        return new Promise((resolve, reject) => {
            try {
                let setData = {};
                //console.log(name, data);
                setData[name] = data;
                chrome.storage.sync.set(setData, () => {
                    resolve(true);
                });
            } catch(e) {
                reject(new Error(e));
            }
        });
    }

    updateIcon(icon) {
        chrome.browserAction.setIcon({
            imageData : icon
        });
    }

    updateBadgeText(text) {
        chrome.browserAction.setBadgeText({text: text});
    }

    updateTitle(text) {
        chrome.browserAction.setTitle({title: text});
    }

    opentab(path) {
        chrome.tabs.create({ url: path });
    }

    setWakeupAction(callback) {
        chrome.idle.onStateChanged = callback;
    }
    
}
