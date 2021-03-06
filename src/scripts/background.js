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

chrome.runtime.onInstalled.addListener(function() {
});

(async () => {
    const cutils = new ChromeUtils();
    
    updateIconClock();
    cutils.setWakeupAction(wakeupAction);
    function wakeupAction(state) {
        if (state == 'active') {
            updateIconClock();
        }
    };
    
    async function updateIconClock() {
          let onTick = () => {};
          const cutils = new ChromeUtils();

          async function dispDateTime() {
            let tzConfig = await cutils.storageGet(config.storage_name);
            if(typeof tzConfig == 'undefined') {
              await cutils.storageSet(config.storage_name, [config.defaultsetting]);
              tzConfig = await cutils.storageGet(config.storage_name);
            }

            if(typeof tzConfig == 'undefined') {
              console.log(config.defaultsetting, config.storage_name);
              await cutils.storageSet(config.storage_name, tzConfig);
            }
            let zone = tzConfig[0].zone;
            for(let idx in tzConfig) {
                if(tzConfig[idx].dispicon === true) {
                    zone = tzConfig[idx].zone;
                    break;
                }
            }
            const tzc = new TimezoneClock();
            let time = tzc.getCurrentTime(zone, 0);
            let tzInfo = tzc.getTimezoneInfoByValue(zone);
            tzc.drawClock(time, 'icon', 40, 'icon');
            let clockface = document.querySelector('#icon');
            let elem = clockface.getElementsByTagName('svg');
            let icon = tzc.convSvgImg(elem[0], config.iconsize, cutils.updateIcon);
            let titleText = `${time.hour}:${time.min}`;
            cutils.updateTitle(titleText);
        }

        //await cutils.storageReset(config.storage_name); // for DEVELOPMENT
        let tzConfig = await cutils.storageGet(config.storage_name);

        // initialize Data
        if(typeof tzConfig == 'undefined') {
            let tzConfig = [config.defaultsetting];
            await cutils.storageSet(config.storage_name, tzConfig);
        }
        
        dispDateTime();
        onTick = dispDateTime;
        let timerId = setInterval(onTick, 15000);
    };

})();
