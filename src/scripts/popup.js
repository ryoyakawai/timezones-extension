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

(async function(){
  const _ELEMPRE_ = 'clock_';
  const tzc = new TimezoneClock();
  let onTick = () => {};
  const cutils = new ChromeUtils();
  let tzConfig = await cutils.storageGet(config.storage_name);

  main();

  function main () {
    displayClocks();
  };

  async function dispDateTime(iconUpdate) {
    for(let i in tzConfig) {
      let zone = tzConfig[i].zone;
      let elemId = tzConfig[i].elemId;
      //console.log(tzConfig[i].elemId, tzConfig[i].zone, tzConfig[i].name);
      let time = tzc.getCurrentTime(zone, 0);
      let tzInfo = tzc.getTimezoneInfoByValue(zone);
      let disp = `${time['year']} ${time['month']} ${time['date']} (${time['day']}) ${time['hour']}:${time['min']}:${time['sec']} ${tzInfo.name.split(' ').pop()} (${time['timeZone']})`;
      let clockface = document.querySelector('#'+elemId);
      clockface.innerHTML = '';
      tzc.drawClock(time, elemId, config.clockface_width/2, 'default');
      let city_name = ( tzConfig[i].name.length > 13 ) ? tzConfig[i].name.substr(0, 11) + '...' : tzConfig[i].name;
      document.querySelector('#' + _ELEMPRE_ + i + '_city').innerHTML = city_name;
      document.querySelector('#' + _ELEMPRE_ + i + '_date').innerHTML = `${time['hour']}:${time['min']}`;
      document.querySelector('#' + _ELEMPRE_ + i + '_time').innerHTML = `${time['month']} ${time['date']} (${time['day']})`;

      if((time['min']%30 == 0 && tzConfig[i].persistent === true)
         || (iconUpdate === true && tzConfig[i].persistent === true) ) {
        tzc.drawClock(time, 'icon', config.clockface_width/2, 'icon');
        clockface = document.querySelector('#icon');
        let elem = clockface.getElementsByTagName('svg');
        let icon = tzc.convSvgImg(elem[0], config.iconsize, cutils.updateIcon);
        let titleText = `${time.hour}:${time.min}`;
        cutils.updateTitle(titleText);
      }
    }
  };

  function updateSetting(event) {
    event.stopPropagation();
    event.preventDefault();
    cutils.opentab('src/options.html');
  };

  function dispAdjustedDateTime(min) {
    let zoneOffsetHour = min / 60;
    for(let i in tzConfig) {
      let zone = tzConfig[i].zone;
      let elemId = tzConfig[i].elemId;
      let time = tzc.getCurrentTime(zone, zoneOffsetHour);
      let tzInfo = tzc.getTimezoneInfoByValue(zone);
      let disp = `${time['year']} ${time['month']} ${time['date']} (${time['day']}) ${time['hour']}:${time['min']}:${time['sec']} ${tzInfo.name.split(' ').pop()} (${time['timeZone']})`;
      let clockface = document.querySelector('#'+elemId);
      clockface.innerHTML = '';
      time.min = time.min10;
      tzc.drawClock(time, elemId, config.clockface_width/2, 'adjust');
      let city_name = ( tzConfig[i].name.length > 13 ) ? tzConfig[i].name.substr(0, 12)+'...' : tzConfig[i].name;
      document.querySelector('#' + _ELEMPRE_ + i + '_city').innerHTML = city_name;
      document.querySelector('#' + _ELEMPRE_ + i + '_date').innerHTML = `${time['hour']}:${time['min']}`;
      document.querySelector('#' + _ELEMPRE_ + i + '_time').innerHTML = `${time['month']} ${time['date']} (${time['day']})`;
    }
  };

  function displayClocks() {
    for(let i in tzConfig) {
      // create Element
      let elem = document.createElement('div');
      tzConfig[i].elemId = elem.id = _ELEMPRE_ + i;
      elem.style.setProperty('width', `${config.clockface_width}px`);
      elem.style.setProperty('height', `${config.clockface_width + 5}px` );
      elem.classList.add('clockface');
      let div_tc = document.createElement('div');
      div_tc.id = _ELEMPRE_ + i + '_city';
      div_tc.classList.add('clock_city');
      let div_td = document.createElement('div');
      div_td.id = _ELEMPRE_ + i + '_date';
      div_td.classList.add('clock_date');
      let div_tt = document.createElement('div');
      div_tt.id = _ELEMPRE_ + i + '_time';
      div_tt.classList.add('clock_time');

      let div = document.createElement('div');
      div.id = _ELEMPRE_ + i + '_p';
      div.classList.add('clockface_p');
      div.appendChild(div_tc);
      div.appendChild(elem);
      div.appendChild(div_td);
      div.appendChild(div_tt);

      document.querySelector('#clock_container').appendChild(div);
    }
    let settingB = document.querySelector('#setting-button');
    settingB.addEventListener('mousedown', updateSetting);
    
    let sliderW = tzConfig.length < 3 ? 100 : 110 + (tzConfig.length - 2) * (config.clockface_width - 5);
    if(tzConfig.length < 2) document.querySelector('.clock_container').style.setProperty('width', '160px');
    let tmC = document.querySelector('.slider-check');
    tmC.setAttribute('checked','checked');
    let tmS = document.querySelector('.timer-slider'); 
    tmS.setAttribute('min',`${-1440}`);
    tmS.setAttribute('max',`${1440}`);
    tmS.setAttribute('value',`${0}`);
    tmS.setAttribute('step',`${10}`);
    tmS.setAttribute('disabled','disabled');
    tmS.style.setProperty('width',`${sliderW}px`);
    tmS.style.setProperty('opacity', '0.3');

    tmS.addEventListener('input', event => {
      let deg = event.target.value;
      dispAdjustedDateTime(deg);
    });
    tmS.addEventListener('dblclick', event => {
      event.target.value = 0;
      dispAdjustedDateTime(0);
    });
    
    tmC.addEventListener('change', event => {
      let status = event.target.checked;
      let tmS = document.querySelector('.timer-slider');
      switch(status) {
      case true:
        tmS.value = 0;
        tmS.setAttribute('disabled','disabled');
        tmS.style.setProperty('opacity', '0.3');
        dispDateTime();
        timerId = setInterval(onTick, 1000);
        break;
      case false:
        tmS.removeAttribute('disabled','disabled');
        tmS.style.removeProperty('opacity');
        clearInterval(timerId);
        dispAdjustedDateTime(0);
        break;
      }
    });

    dispDateTime(true);
    onTick = dispDateTime;
    
    let timerId = setInterval(onTick, 1000);
  };

}());
