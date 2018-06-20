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

import tzDef from './timezonedef.js';

export default class TimezoneClock {
    constructor() {
        this.utc = null;
    }

    getUTC() {
        if(this.utc === null) this.updateUTC();
        return this.utc;
    }

    updateUTC() {
        const d = new Date();
        this.utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    }
    
    getCurrentTime(timeDiff) {
        this.updateUTC();
        return this.getTime(timeDiff);
    }

    getTime(timeDiff) {
        if(typeof timeDiff == 'undefined') timeDiff = '00:00';
        let t = timeDiff.split(':');
        let timeDiffFl = parseFloat(t.shift());
        let sign = timeDiffFl < 0 ? -1 : 1;
        timeDiffFl = timeDiffFl + sign * parseFloat(t.pop() / 60);

        const utc = this.getUTC();
        let newDT = new Date(utc + (3600000 * timeDiffFl));
        let out = {
            day: newDT.getDay(),
            month: this.getMonthName(newDT.getMonth(), 3),
            date: newDT.getDate(),
            day: this.getDayName(newDT.getDay(), 3),
            year: newDT.getFullYear(),
            hour: this.zeroPad(newDT.getHours()),
            min: this.zeroPad(newDT.getMinutes()),
            sec: this.zeroPad(newDT.getSeconds()),
            timeDiff: timeDiff,
            ampm: newDT.getHours() < 12 ? 'am' : 'pm'
        };
        return out;
    }

    drawClock(time, elemId, size, disp_second_hand) {
        let colorSet = {
            am: {
                outer: '#444444',
                backg: '#fafafa',
                hour: '#444444',
                minute: '#444444',
                second: '#ee0000',
                pin: '#000000'
            },
            pm: {
                outer: '#444444',
                backg: '#dfdfdf',
                hour: '#333333',
                minute: '#333333',
                second: '#0000ee',
                pin: '#0000ee'
            },
            icon: {
                outer: '#444444',
                backg: 'rgba(200, 200, 200, 0)',
                hour: '#333333',
                minute: '#333333',
                second: '#0000ee',
                pin: '#0000ee'
            }
        };
        let tw = disp_second_hand !== false ? 1 : 1.5;
        let _SIZE_ = size;
        let clr = disp_second_hand !== false ? colorSet[time.ampm] : colorSet['icon'];
        let canvas = Raphael(elemId, 2*_SIZE_, 2*_SIZE_);
		    let clock = canvas.circle(_SIZE_, _SIZE_, _SIZE_-5);
		    clock.attr({ 'fill': clr.backg, 'stroke': clr.outer, 'stroke-width': '`${_SIZE_/20}`'});
		    let hour_sign;
		    for(let i=0; i<12; i++){
				    let start_x = _SIZE_ + Math.round(0.7 * _SIZE_ * Math.cos(30 * i * Math.PI/180));
				    let start_y = _SIZE_ + Math.round(0.7 * _SIZE_ * Math.sin(30 * i * Math.PI/180));
				    let end_x = _SIZE_ + Math.round(0.8 * _SIZE_ * Math.cos(30 * i * Math.PI/180));
				    let end_y = _SIZE_ + Math.round(0.8 * _SIZE_ * Math.sin(30 * i * Math.PI/180));	
				    hour_sign = canvas.path('M'+start_x+' '+start_y+'L'+end_x+' '+end_y);
		    }
		    let hour_hand = canvas.path(`M${_SIZE_} ${_SIZE_}L${_SIZE_} ${_SIZE_/2}`);
        hour_hand.rotate(30*time.hour+(time.min/2.5), _SIZE_, _SIZE_);
		    hour_hand.attr({stroke: clr.hour, 'stroke-width': tw * 0.07 * _SIZE_});

		    let minute_hand = canvas.path(`M${_SIZE_} ${_SIZE_}L${_SIZE_} ${0.36 * _SIZE_}`);
		    minute_hand.rotate(6*time.min, _SIZE_, _SIZE_);
		    minute_hand.attr({stroke: clr.minute, 'stroke-width': tw * 0.04 * _SIZE_ / tw});

        if(disp_second_hand!==false) {
		        let second_hand = canvas.path(`M${_SIZE_} ${_SIZE_+10}L${_SIZE_} ${_SIZE_/3.8}`);
		        second_hand.rotate(6*time.sec, _SIZE_, _SIZE_);
		        second_hand.attr({stroke: clr.second, 'stroke-width': tw * 0.02 * _SIZE_ / tw}); 
        }
		    let pin = canvas.circle(_SIZE_, _SIZE_, _SIZE_/20);
		    pin.attr('fill', clr.pin);
    }

    convSvgImg(targetElem, _ICONSIZE_, callback) {
        let svg = targetElem;
        let svgData = new XMLSerializer().serializeToString(svg);
        let canvas = document.createElement('canvas');
        canvas.width = svg.width.baseVal.value;
        canvas.height = svg.height.baseVal.value;

        let ctx = canvas.getContext('2d');
        let image = new Image;
        image.onload = () => {
            ctx.drawImage( image, 0, 0, canvas.width, canvas.height, 0, 0, _ICONSIZE_ + 2, _ICONSIZE_ + 2 );
            let out = ctx.getImageData(1, 1, _ICONSIZE_ , _ICONSIZE_);
            callback(out); // update tabIcon
            //console.log(out);
        };
        image.src = "data:image/svg+xml;charset=utf-8;base64," + btoa(unescape(encodeURIComponent(svgData)));
    };

    zeroPad(num) {
        if (num < 10) {
            num = '0' + num.toString();
        }
        return num;
    }

    getTimezoneInfoByValue(timezoneVal) {
        let out = tzDef[30];
        for(let item in tzDef) {
            if(tzDef[item].value == timezoneVal) {
                out = tzDef[item];
                break;
            }
        }
        return out;
    }
    
    getMonthName(month, num) {
        const mName = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        let out = mName[month];
        if(num > 0 ) out = out.substring(0, num);
        return out;
    }
    getDayName(idx, num) {
        const day = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        let out = day[idx];
        if(num > 0 ) out = out.substring(0, num);
        return out;
    }
}
