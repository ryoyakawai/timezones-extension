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
  document.querySelector('#snack_bar').style.setProperty('height', '0px');

  main();

  function main() {
    document.querySelector('#add').addEventListener('mousedown', addNewTimezoneClock, false);
    createSettingItems();
  }

  function snackbar(text, duration) {
    let snb = document.querySelector('#snack_bar');
    let snb_text = snb.querySelector('#snack_bar_text');
    snb.classList.remove('opacity_0');
    snb_text.innerHTML = text;
    snb.style.setProperty('height', '37px');
    if(typeof duration !== 'number') duration = 2000;
    setTimeout(() => {
      snb.style.setProperty('height', '0px');
      snb.classList.add('opacity_0');
    }, duration);
  }

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
      snackbar('New Clock is added.');
    } else {
      snackbar('No more clocks are able to add.');
    }
  }

  async function removeTimezoneClock(event) {
    let tzConfig = await cutils.storageGet(config.storage_name);
    if(tzConfig.length > 1) {
      const idx = parseInt(event.target.id.split('_').pop());
      const label = event.target.id.split('_').shift();
      let removed_clock_name = tzConfig[idx].name;

      tzConfig.splice(idx, 1);

      await cutils.storageSet(config.storage_name, tzConfig);
      checkDispIconIsChecked();
      document.querySelector('#main').innerHTML='';
      createSettingItems({idx: idx, type:'remove'});
      snackbar(`Clock "${removed_clock_name}" is removed.`);
    } else {
      snackbar('No more clocks are able to add.');
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
      snackbar(`Clock for Icon are set to "${tzConfig[0].name}".`);
    }
  }

  async function createEditBLock(idx, tzConfig) {
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
    innerItems.id = 'innerItem';
    innerItems.classList.add('innerItem');

    let timezone_container_p = document.createElement('div');
    timezone_container_p.id = `clocktimezone_p_${idx}`;
    timezone_container_p.classList.add('timezone-container-p');

    let clock_preview = document.createElement('div');
    clock_preview.id = `clock-preview_${idx}`;
    clock_preview.classList.add('clock-preview');
    clock_preview.addEventListener('mousedown', async ( event ) => {
      let target_id = event.target.id;
      if(target_id.match(/^clock-preview/) === null) {
        target_id = event.target.parentNode.id;
        if(target_id.match(/^clock-preview/) === null) {
          target_id = event.target.parentNode.parentNode.parentNode.id;
        }
      }
      let id = parseInt(target_id.split('_').pop());
      let target_radio_id = `display-as-icon_${id}`;
      let elem = document.querySelector(`#${target_radio_id}`);
      elem.checked = true;
      for(let i in tzConfig) {
        if(tzConfig[i].dispicon === true) {
          document.querySelector(`#clock-preview_${i}`).classList.remove('disp-as-icon');
        }
        tzConfig[i].dispicon = false;
      }
      document.querySelector(`#clock-preview_${id}`).classList.add('disp-as-icon');
      tzConfig[id].dispicon = true;
      await cutils.storageSet(config.storage_name, tzConfig);
      let custom_event = {
        target : { id: target_id}
      };
      await updateDispIconSetting(custom_event);
    }, false);

    let div_name = document.createElement('div');
    div_name.classList.add('clock_name');
    div_name.id = 'clock_name';

    let div_clock = document.createElement('div');
    div_clock.classList.add('clockface');
    div_clock.id = `clock_face_${idx}`;
    let loading = document.createElement('img');
    loading.id = 'loading-image';
    loading.src='./images/loading01.gif';
    loading.width = 20;
    div_clock.appendChild(loading);

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

    timezone_container_p.appendChild(clock_preview);
    timezone_container_p.appendChild(timezone_container);

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
  }

  async function createSettingItems(item) {
    let tzConfig = await cutils.storageGet(config.storage_name);
    let main = document.querySelector('#main');
    let check_dispasicon = false;
    for(let idx in tzConfig) {
      if(tzConfig[idx].dispicon === true) check_dispasicon = true;;
      let elem = await createEditBLock(idx, tzConfig);
      main.appendChild(elem);

      let timerId = setInterval( async () => {
        let tzConfig = await cutils.storageGet(config.storage_name);
        onTick(tzConfig);
      }, 1000);

      async function onTick(tzConfig) {
        let elem = document.querySelector(`#clock-preview_${idx}`);
        if(elem == null) return;
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
        if(elem.querySelector('#loading-image') !== null) {
          elem.style.setProperty('opacity', '0');
          setTimeout(() => {
            e_face.innerHTML = '';
            tzc.drawClock(time, clock_preview_id, config.clockface_width/2, 'default');
          }, 100);
        } else {
          let city_name = ( name.length > 13 ) ? name.substr(0, 11)+'...' : name;
          e_name.innerHTML = city_name;
          e_face.innerHTML = '';
          e_date.innerHTML = disp_date;
          e_time.innerHTML = disp_time;
          tzc.drawClock(time, clock_preview_id, config.clockface_width/2, 'default');
          elem.style.setProperty('opacity', '1');
        }
      }
    }
    // set default of dispasicon selection
    if(check_dispasicon == false) {
      document.querySelector('#display-as-icon_0').setAttribute('checked', 'checked');
      tzConfig[0].dispicon = true;
      await cutils.storageSet(config.storage_name, tzConfig);
    }
    
    if(typeof item == 'object' && parseInt(item.idx) < tzConfig.length) {
      let idx = item.idx = parseInt(item.idx);
      switch(item.type) {
      case 'remove':
        let nextElem = document.querySelector(`#timezone_${idx}`);
        let dummyBlock_p = document.createElement('div');
        dummyBlock_p.classList.add('dummy-inner-container-p');
        let dummyBlock = document.createElement('div');
        dummyBlock.id = 'dummy-inner-container';
        dummyBlock.classList.add('dummy-inner-container');
        dummyBlock.innerHTML = nextElem.innerHTML;
        dummyBlock_p.appendChild(dummyBlock);
        nextElem.parentNode.parentNode.insertBefore(dummyBlock_p, nextElem.parentNode);
        setTimeout(() => {
          dummyBlock.style.setProperty('opacity', '0');
        }, 20);
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

}());
