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

import TimezoneClock from './scripts/timezoneclock.js';

(async function(){

    const _ELEMPRE_ = 'clock_';
    const tzc = new TimezoneClock();
    const _ICONSIZE_ = 19;
    let onTick = () => {};
    
    let settings = [
        {
            offset: '+1:00',
            name: 'London',
            elemId: null,
            persistent: false
        },
        {
            offset: '+9:00',
            name: 'Tokyo',
            elemId: null,
            persistent: false
        },
        {
            offset: '-7:00',
            name: 'San Francisco',
            elemId: null,
            persistent: true
        },
        {
            offset: '-4:00',
            name: 'Boston',
            elemId: null,
            persistent: false
        }

    ];

    const dispDateTime = (iconUpdate) => {
        for(let i in settings) {
            let offset = settings[i].offset;
            let elemId = settings[i].elemId;
            let time = tzc.getCurrentTime(offset);
            let tzInfo = tzc.getTimezoneInfoByValue(offset);
            let disp = `${time['year']} ${time['month']} ${time['date']} (${time['day']}) ${time['hour']}:${time['min']}:${time['sec']} ${tzInfo.name.split(' ').pop()} (${time['timeDiff']})`;
            let clockface = document.querySelector('#'+elemId);
            clockface.innerHTML = '';
            tzc.drawClock(time, elemId, 40);
            document.querySelector('#' + _ELEMPRE_ + i + '_text').innerHTML = `<b>${time['hour']}:${time['min']}</b><br>${time['month']} ${time['date']} (${time['day']})`;
            document.querySelector('#' + _ELEMPRE_ + i + '_city').innerHTML = settings[i].name;
            
            if((time['min']%30 == 0 && settings[i].persistent === true)
               || (iconUpdate === true && settings[i].persistent === true) ) {
                tzc.drawClock(time, 'icon', 50, false);
                clockface = document.querySelector('#icon');
                let elem = clockface.getElementsByTagName('svg');
                let icon = tzc.convSvgImg(elem[0], _ICONSIZE_, updateIcon);
                function updateIcon(icon) {
                    chrome.browserAction.setIcon({
                        imageData : icon
                    });
                }
            }
        }
    };

    for(let i in settings) {
        let elem = document.createElement('div');
        settings[i].elemId = elem.id = _ELEMPRE_ + i;
        elem.classList.add('clockface');
        let div_tt = document.createElement('div');
        div_tt.id = _ELEMPRE_ + i + '_city';
        div_tt.classList.add('clock_city');
        let div_tb = document.createElement('div');
        div_tb.id = _ELEMPRE_ + i + '_text';
        div_tb.classList.add('clock_text');
        let div = document.createElement('div');
        div.id = _ELEMPRE_ + i + '_p';
        elem.classList.add('clockface_p');
        div.appendChild(div_tt);
        div.appendChild(elem);
        div.appendChild(div_tb);
        document.querySelector('#clock_container').appendChild(div);
    }

    dispDateTime(true);
    onTick = () => {
        dispDateTime();
    };
    
    let timerId = setInterval(onTick, 1000);
}());
