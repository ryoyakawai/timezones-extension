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
import TimezoneClock from './timezoneclock.js';

chrome.runtime.onInstalled.addListener(function() {
});

let onTick = () => {};
const _ICONSIZE_ = 19;

function dispDateTime() {
    let zone = '-7:00';
    const tzc = new TimezoneClock();
    let time = tzc.getCurrentTime(zone, 0);
    let tzInfo = tzc.getTimezoneInfoByValue(zone);
    tzc.drawClock(time, 'icon', 40, 'icon');
    let clockface = document.querySelector('#icon');
    let elem = clockface.getElementsByTagName('svg');
    let icon = tzc.convSvgImg(elem[0], _ICONSIZE_, updateIcon);
    function updateIcon(icon) {
        chrome.browserAction.setIcon({
            imageData : icon
        });
    }
}

dispDateTime();
onTick = () => {
    dispDateTime();
};

let timerId = setInterval(onTick, 15000);
