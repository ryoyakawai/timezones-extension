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
  const tzc = new TimezoneClock();
  const cutils = new ChromeUtils();
  const timezones = tzc.getTimezoneDef();
  let tzConfig = await cutils.storageGet(config.storage_name);

  async function storeOnInput(event){
    tzConfig = await cutils.storageGet(config.storage_name);
    const idx = parseInt(event.target.id.split('_').pop());
    const label = event.target.id.split('_').shift();
    switch(label) {
    case 'clockname-text':
      tzConfig[idx].name = event.target.value;
      break;
    case 'clocktimezone':
      let id = event.target.value;
      tzConfig[idx].zone = timezones[id].value;
      tzConfig[idx].zoneLabel = timezones[id].name;
      break;
    }

    await cutils.storageSet(config.storage_name, tzConfig);
  };

  async function insertTimezoneName(event) {
    let tzConfig = await cutils.storageGet(config.storage_name);
    const idx = parseInt(event.target.id.split('_').pop());
    const label = event.target.id.split('_').shift();

    let name = (tzConfig[idx].zoneLabel.split('/').shift()).trim();
    tzConfig[idx].name = name;
    document.querySelector(`#clockname-text_${idx}`).value = name;

    await cutils.storageSet(config.storage_name, tzConfig);
  }

  async function updateDispIconSetting(event) {
    let tzConfig = await cutils.storageGet(config.storage_name);
    const idx = event.target.id.split('_').pop();
    const label = event.target.id.split('_').shift();

    let itemCnt = tzConfig.length;
    for(let i=0; i<itemCnt; i++) {
      tzConfig[i].dispicon = false;
      if(i == idx) {
        tzConfig[i].dispicon = true;
      }

    }
    updateDispIcon(tzConfig[idx].zone);
    await cutils.storageSet(config.storage_name, tzConfig);
  }

  async function clockOrderUp(event) {
    let tzConfig = await cutils.storageGet(config.storage_name);
    const idx = parseInt(event.target.id.split('_').pop());
    const label = event.target.id.split('_').shift();

    let item = tzConfig[idx];
    tzConfig.splice(idx, 1);
    tzConfig.splice(idx-1, 0, item);

    await cutils.storageSet(config.storage_name, tzConfig);
    document.querySelector('#main').innerHTML='';
    createSettingItems({idx: idx-1, type:'order-up'});
  }

  async function clockOrderDown(event) {
    let tzConfig = await cutils.storageGet(config.storage_name);
    const idx = parseInt(event.target.id.split('_').pop());
    const label = event.target.id.split('_').shift();

    let item = tzConfig[idx];
    tzConfig.splice(idx, 1);
    tzConfig.splice(idx+1, 0, item);

    await cutils.storageSet(config.storage_name, tzConfig);
    document.querySelector('#main').innerHTML='';
    createSettingItems({idx: idx+1, type:'order-down'});
  }

  function updateDispIcon(zone) {
    const tzc = new TimezoneClock();
    let time = tzc.getCurrentTime(zone, 0);
    let tzInfo = tzc.getTimezoneInfoByValue(zone);
    tzc.drawClock(time, 'icon', 40, 'icon');
    let clockface = document.querySelector('#icon');
    let elem = clockface.getElementsByTagName('svg');
    let icon = tzc.convSvgImg(elem[0], config.iconsize, cutils.updateIcon);
  }

  async function addNewTimezoneClock() {
    let tzConfig = await cutils.storageGet(config.storage_name);
    if(tzConfig.length < config.clockmax) {

      let default_data =  config.defaultsetting;

      tzConfig.unshift(default_data);

      await cutils.storageSet(config.storage_name, tzConfig);
      checkDispIconIsChecked();
      document.querySelector('#main').innerHTML='';
      createSettingItems({idx: 0, type :'addNew'});
    } else {
      let elem = document.querySelector('#message');
      elem.innerHTML = 'No more clocks is able to add.';
      elem.classList.add('message-warning');
      setTimeout(() => {
        elem.innerHTML = '...';
        elem.classList.add('message');
        elem.classList.remove('message-warning');
      }, 2500);
    }
  }

  async function removeTimezoneClock(event) {
    let tzConfig = await cutils.storageGet(config.storage_name);
    if(tzConfig.length > 1) {
      const idx = parseInt(event.target.id.split('_').pop());
      const label = event.target.id.split('_').shift();

      tzConfig.splice(idx, 1);

      await cutils.storageSet(config.storage_name, tzConfig);
      checkDispIconIsChecked();
      document.querySelector('#main').innerHTML='';
      createSettingItems({idx: idx, type:'remove'});
    } else {
      let elem = document.querySelector('#message');
      elem.innerHTML = 'At least one clock is required.';
      elem.classList.add('message-warning');
      setTimeout(() => {
        elem.innerHTML = '...';
        elem.classList.add('message');
        elem.classList.remove('message-warning');
      }, 2500);
    }
  }

  async function checkDispIconIsChecked() {
    let tzConfig = await cutils.storageGet(config.storage_name);
    let count = 0;
    for(let i=0; i<tzConfig.length; i++) {
      if(tzConfig[i].dispicon === true) {
        count++;
        break;
      }
    }
    if(count == 0) {
      tzConfig[0].dispicon = true;
      await cutils.storageSet(config.storage_name, tzConfig);
      updateDispIcon(tzConfig[0].zone);

      let elem = document.querySelector('#message');
      elem.innerHTML = `Clock for Icon are set to "${tzConfig[0].name}".` ;
      elem.classList.add('message-info');
      setTimeout(() => {
        elem.innerHTML = '...';
        elem.classList.add('message');
        elem.classList.remove('message-info');
      }, 2500);
    }
  }

  const createEditBLock = async (idx, tzConfig) => {
    //let tzConfig = await cutils.storageGet(config.storage_name);

    let timezone_container = document.createElement('div');
    timezone_container.id = `timezone_${idx}`;
    timezone_container.classList.add('timezone-container');

    let clockname = document.createElement('div');
    clockname.id = `clockname-p_${idx}`;
    clockname.classList.add('setting-item');

    let button00 = document.createElement('button');
    button00.id = `update-label_${idx}`;
    button00.classList.add('update-label');
    button00.innerHTML = 'Name Insert';
    button00.addEventListener('mousedown', insertTimezoneName, false);

    let span00 = document.createElement('span');
    span00.innerHTML = 'Label : ';

    let input00 = document.createElement('input');
    input00.id = `clockname-text_${idx}`;
    input00.type = 'text';
    input00.value = tzConfig[idx].name;
    input00.addEventListener('input', storeOnInput, false);

    let span01 = document.createElement('span');
    span01.innerHTML = 'Timezone : ';

    let tzselect = document.createElement('div');
    tzselect.id = `clocktimezone-p_${idx}`;
    tzselect.classList.add('setting-item');

    let select00 = document.createElement('select');
    select00.id = `clocktimezone_${idx}`;
    select00.addEventListener('input', storeOnInput, false);

    let option = new Option('(Select One)', false, false, false);
    select00.appendChild(option);
    for(let i=0; i<timezones.length; i++) {
      let selected = false;
      if(tzConfig[idx].zoneLabel == timezones[i].name) {
        selected = true;
      }
      let option = new Option(timezones[i].name, i, false, selected);
      select00.appendChild(option);
    }

    let dispasicon = document.createElement('div');
    dispasicon.id = `display-as-icon-p_${idx}`;
    dispasicon.classList.add('setting-item');

    let span02 = document.createElement('span');
    span02.innerHTML = 'Display as Icon : ';

    let input01 = document.createElement('input');
    input01.type = 'radio';
    input01.name = 'displayasicon';
    input01.value = tzConfig[idx].name;
    input01.addEventListener('input', storeOnInput, false);
    input01.id = `display-as-icon_${idx}`;
    if(tzConfig[idx].dispicon === true) {
      input01.setAttribute('checked', 'checked');
    }
    input01.addEventListener('input', updateDispIconSetting, false);

    let clockorder = document.createElement('div');
    clockorder.id = `change-order_${idx}`;
    let span03 = document.createElement('span');
    span03.innerHTML = 'Change Order : ';

    let order_up = document.createElement('button');
    order_up.id = `order-up_${idx}`;
    order_up.classList.add('change-order');
    order_up.innerHTML = '↑';
    order_up.addEventListener('mousedown', clockOrderUp, false);
    if( idx <= 0 ) order_up.setAttribute('disabled', 'disabled');

    let order_down = document.createElement('button');
    order_down.id = `order-down_${idx}`;
    order_down.classList.add('change-order');
    order_down.innerHTML = '↓';
    order_down.addEventListener('mousedown', clockOrderDown, false);
    if( idx >= tzConfig.length -1 ) order_down.setAttribute('disabled', 'disabled');

    let remove = document.createElement('div');
    remove.id = `remove-icon-p_${idx}`;
    remove.classList.add('remove-icon-p');

    let img00 = document.createElement('img');
    img00.id = `remove-icon_${idx}`;
    img00.src = 'images/remove.png';
    img00.width = img00.height = '20';
    img00.classList.add('remove-image');
    img00.addEventListener('mousedown', removeTimezoneClock, false);

    let innerItems = document.createElement('div');
    innerItems.id = 'innetItem';
    innerItems.classList.add('innerItem');

    let timezone_container_p = document.createElement('div');
    timezone_container_p.id = `clocktimezone_p_${idx}`;
    timezone_container_p.classList.add('timezone-container-p');

    let clock_preview = document.createElement('div');
    clock_preview.id = `clock-preview_${idx}`;
    clock_preview.classList.add('clock-preview');

    let div_name = document.createElement('div');
    div_name.classList.add('clock_name');
    div_name.id = 'clock_name';

    let div_clock = document.createElement('div');
    div_clock.classList.add('clockface');
    div_clock.id = `clock_face_${idx}`;

    let div_date = document.createElement('div');
    div_date.classList.add('clock_date');
    div_date.id = 'clock_date';

    let div_d_time = document.createElement('div');
    div_d_time.classList.add('clock_time');
    div_d_time.id = 'clock_time';

    clock_preview.appendChild(div_name);
    clock_preview.appendChild(div_clock);
    clock_preview.appendChild(div_d_time);
    clock_preview.appendChild(div_date);

    timezone_container_p.appendChild(timezone_container);
    timezone_container_p.appendChild(clock_preview);

    clockorder.appendChild(span03);
    clockorder.appendChild(order_down);
    clockorder.appendChild(order_up);
    remove.appendChild(img00);

    dispasicon.appendChild(span02);
    dispasicon.appendChild(input01);

    tzselect.appendChild(span01);
    tzselect.appendChild(select00);
    clockname.appendChild(span00);
    clockname.appendChild(input00);
    clockname.appendChild(button00);

    innerItems.appendChild(clockname);
    innerItems.appendChild(tzselect);
    innerItems.appendChild(dispasicon);
    innerItems.appendChild(clockorder);

    timezone_container.appendChild(remove);
    timezone_container.appendChild(innerItems);

    return timezone_container_p;
  };

  async function createSettingItems(item) {
    let tzConfig = await cutils.storageGet(config.storage_name);
    let main = document.querySelector('#main');
    for(let idx in tzConfig) {
      let elem = await createEditBLock(idx, tzConfig);
      main.appendChild(elem);

      let timerId = setInterval( async () => {
        let tzConfig = await cutils.storageGet(config.storage_name);
        onTick(tzConfig);
      }, 1000);

      async function onTick(tzConfig) {
        let elem = document.querySelector(`#clock-preview_${idx}`);
        let e_name = elem.querySelector('#clock_name');
        let e_face = elem.querySelector(`#clock_face_${idx}`);
        let e_date = elem.querySelector('#clock_date');
        let e_time = elem.querySelector('#clock_time');

        let zone = tzConfig[idx].zone;
        let name = tzConfig[idx].name;
        let time = tzc.getCurrentTime(zone, 0);
        let disp_date = `${time['month']} ${time['date']} (${time['day']})`;
        let disp_time = `${time['hour']}:${time['min']}`;

        elem.classList.remove('disp-as-icon');
        if(tzConfig[idx].dispicon === true) elem.classList.add('disp-as-icon');

        let clock_preview_id = `clock_face_${idx}`;
        e_name.innerHTML = name;
        e_face.innerHTML = '';
        tzc.drawClock(time, clock_preview_id, config.clockface_width/2, 'default');
        e_date.innerHTML = disp_date;
        e_time.innerHTML = disp_time;
      }
    }
    
    if(typeof item == 'object' && parseInt(item.idx) < tzConfig.length) {
      let idx = item.idx = parseInt(item.idx);
      switch(item.type) {
      case 'remove':
        let nextElem = document.querySelector(`#timezone_${idx}`);
        let dummyBlock = document.createElement('div');
        dummyBlock.id = 'dummy-inner-container';
        dummyBlock.classList.add('timezone-container', 'dummy-inner-container');
        dummyBlock.innerHTML = nextElem.innerHTML;
        nextElem.parentNode.insertBefore(dummyBlock, nextElem);
        setTimeout(() => {
          dummyBlock.style.setProperty('opacity', '0');
        }, 10);
        setTimeout(() => {
          let re = document.querySelector('#dummy-inner-container');
          re.parentNode.removeChild(re);
        }, 500);
        break;
      case 'addNew':
      case 'order-down':
      case 'order-up':
        let moveElem = document.querySelector(`#timezone_${idx}`);
        moveElem.style.setProperty('opacity', '0');
        setTimeout(() => {
          moveElem.style.setProperty('opacity', '1');
        }, 10);
        break;
      }
      checkDispIconIsChecked();
    }
  }

  document.querySelector('#add').addEventListener('mousedown', addNewTimezoneClock, false);

  createSettingItems();

}());
