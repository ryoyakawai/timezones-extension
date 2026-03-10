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
import ChromeUtils from './chromeutils.js';
import TimezoneClock from './timezoneclock.js';
import config from './config.js';

const cutils = new ChromeUtils();
const OFFSCREEN_PATH = 'src/offscreen.html';
const ALARM_NAME = 'updateIconClock';

let creatingOffscreen = null;

chrome.runtime.onInstalled.addListener(() => {
    initializeData();
    chrome.alarms.create(ALARM_NAME, { periodInMinutes: 1 });
    updateIconClock();
});

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === ALARM_NAME) {
        updateIconClock();
    }
});

chrome.idle.onStateChanged.addListener((state) => {
    if (state === 'active') {
        updateIconClock();
    }
});

updateIconClock();

async function initializeData() {
    let tzConfig = await cutils.storageGet(config.storage_name) || [];
    if (tzConfig.length === 0) {
        await cutils.storageSet(config.storage_name, [config.defaultsetting]);
    }
}

async function setupOffscreen() {
    if (await chrome.offscreen.hasDocument()) return;
    
    if (creatingOffscreen) {
        await creatingOffscreen;
        return;
    }

    creatingOffscreen = (async () => {
        try {
            await chrome.offscreen.createDocument({
                url: OFFSCREEN_PATH,
                reasons: ['LOCAL_STORAGE'],
                justification: 'Rendering analog clock icon'
            });
            
            // Wait until it's actually ready
            let ready = false;
            let retries = 0;
            while (!ready && retries < 15) {
                await new Promise(r => setTimeout(r, 200));
                ready = await new Promise(r => {
                    chrome.runtime.sendMessage({ type: 'is-ready' }, resp => {
                        if (chrome.runtime.lastError) r(false);
                        else r(resp === true);
                    });
                });
                retries++;
            }
        } catch (e) {
            if (!e.message.includes('Only a single offscreen document may be created')) {
                console.error('setupOffscreen error', e);
            }
        } finally {
            creatingOffscreen = null;
        }
    })();
    
    await creatingOffscreen;
}

async function updateIconClock() {
    try {
        let tzConfig = await cutils.storageGet(config.storage_name) || [];
        let selectedConfig = tzConfig.find(item => item.dispicon === true);

        if (!selectedConfig) {
            chrome.action.setIcon({
                path: {
                    "16": "/src/images/timezoneclock16.png",
                    "32": "/src/images/timezoneclock32.png",
                    "48": "/src/images/timezoneclock48.png",
                    "128": "/src/images/timezoneclock128.png"
                }
            });
            chrome.action.setTitle({ title: "Timezone Clocks" });
            return;
        }

        const tzc = new TimezoneClock();
        let time = tzc.getCurrentTime(selectedConfig.zone, 0);

        await setupOffscreen();

        const sendMessageWithRetry = (msg, retries = 3) => {
            return new Promise((resolve, reject) => {
                const attempt = (rem) => {
                    chrome.runtime.sendMessage(msg, (response) => {
                        if (chrome.runtime.lastError) {
                            if (rem > 0) setTimeout(() => attempt(rem - 1), 500);
                            else reject(chrome.runtime.lastError);
                        } else {
                            resolve(response);
                        }
                    });
                };
                attempt(retries);
            });
        };

        try {
            const response = await sendMessageWithRetry({
                type: 'render-clock',
                time: time,
                size: 45,
                iconsize: 90
            });

            if (response && response.data) {
                const imageData = new ImageData(
                    new Uint8ClampedArray(response.data),
                    response.width,
                    response.height
                );
                const iconData = {};
                iconData[config.iconsize.toString()] = imageData;
                chrome.action.setIcon({ imageData: iconData });
                chrome.action.setTitle({ title: `${selectedConfig.name}: ${time.hour}:${time.min}` });
            }
        } catch (err) {
            console.error('Communication error', err);
        }
    } catch (e) {
        console.error('Error in updateIconClock', e);
    }
}

chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'update-now') {
        updateIconClock();
    }
});
