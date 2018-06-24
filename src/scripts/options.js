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

(async function(){
    const tzc = new TimezoneClock();
    const cutils = new ChromeUtils();
    const timezones = tzc.getTimezoneDef();
    let tzConfig = await cutils.storageGet('tzConfig');

    async function storeOnInput(event){
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
        
        await cutils.storageSet('tzConfig', tzConfig);
    };

    async function insertTimezoneName(event) {
        const idx = parseInt(event.target.id.split('_').pop());
        const label = event.target.id.split('_').shift();

        let name = (tzConfig[idx].zoneLabel.split('/').shift()).trim();
        tzConfig[idx].name = name;
        document.querySelector(`#clockname-text_${idx}`).value = name;

        await cutils.storageSet('tzConfig', tzConfig);
    }

    async function updateDispIconSetting(event) {
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
        await cutils.storageSet('tzConfig', tzConfig);
    }


    async function clockOrderUp(event) {
        const idx = parseInt(event.target.id.split('_').pop());
        const label = event.target.id.split('_').shift();

        let item = tzConfig[idx];
        tzConfig.splice(idx, 1);
        tzConfig.splice(idx-1, 0, item);
        
        await cutils.storageSet('tzConfig', tzConfig);
        document.querySelector('#main').innerHTML='';
        createSettingItems();
    }

    async function clockOrderDown(event) {
        const idx = parseInt(event.target.id.split('_').pop());
        const label = event.target.id.split('_').shift();
        
        let item = tzConfig[idx];
        tzConfig.splice(idx, 1);
        tzConfig.splice(idx+1, 0, item);
        
        await cutils.storageSet('tzConfig', tzConfig);
        document.querySelector('#main').innerHTML='';
        createSettingItems();
    }


    function updateDispIcon(zone) {
        const tzc = new TimezoneClock();
        let time = tzc.getCurrentTime(zone, 0);
        let tzInfo = tzc.getTimezoneInfoByValue(zone);
        tzc.drawClock(time, 'icon', 40, 'icon');
        let clockface = document.querySelector('#icon');
        let elem = clockface.getElementsByTagName('svg');
        let icon = tzc.convSvgImg(elem[0], _ICONSIZE_, cutils.updateIcon);
    }

    async function addNewTimezoneClock() {
        if(tzConfig.length < _CLOCKMAX_) { 
            // something weried things happening...
            // const _DEFAULTSETTING_ is replace with other values...
            let default_data =  {
                "zone": "+1:00",
                "name": "London",
                "elemId": null,
                "persistent": false,
                zoneLabel:"London / +1:00",
                "dispicon": true
            };
            
            tzConfig.unshift(default_data);
            await cutils.storageSet('tzConfig', tzConfig);
            checkDispIconIsChecked();
            document.querySelector('#main').innerHTML='';
            createSettingItems();
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
        if(tzConfig.length > 1) { 
            const idx = parseInt(event.target.id.split('_').pop());
            const label = event.target.id.split('_').shift();

            tzConfig.splice(idx, 1);
            
            await cutils.storageSet('tzConfig', tzConfig);
            checkDispIconIsChecked();
            document.querySelector('#main').innerHTML='';
            createSettingItems();
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
        let count = 0;
        for(let i=0; i<tzConfig.length; i++) {
            if(tzConfig[i].dispicon === true) {
                count++;
                break;
            }
        }
        if(count == 0) {
            tzConfig[0].dispicon = true;
            await cutils.storageSet('tzConfig', tzConfig);
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

    const createEditBLock = (idx, config) => {
        let div00 = document.createElement('div');
        div00.id = `timezone_${idx}`;
        div00.classList.add('timezone-container');

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
        input00.value = config.name;
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
            if(config.zoneLabel == timezones[i].name) {
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
        input01.value = config.name;
        input01.addEventListener('input', storeOnInput, false);
        input01.id = `display-as-icon_${idx}`;
        if(config.dispicon === true) {
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
        remove.addEventListener('mousedown', removeTimezoneClock, false);
        
        let img00 = document.createElement('img');
        img00.id = `remove-icon_${idx}`;
        img00.src = 'images/remove.png';
        img00.width = img00.height = '20';
        img00.classList.add('remove-image');

        let innerItems = document.createElement('div');
        innerItems.id = 'innetItem';
        innerItems.classList.add('innerItem');

        clockorder.appendChild(span03);
        clockorder.appendChild(order_up);
        clockorder.appendChild(order_down);
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
        
        div00.appendChild(remove);
        div00.appendChild(innerItems);
        
        return div00;
    };

    async function createSettingItems() {
        let main = document.querySelector('#main');
        for(let idx in tzConfig) {
            let elem = createEditBLock(idx, tzConfig[idx]);
            main.appendChild(elem);
        }
    }

    document.querySelector('#add').addEventListener('mousedown', addNewTimezoneClock, false);
    
    createSettingItems();

}());
