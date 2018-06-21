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
    
    getCurrentTime(timeZone, zoneOffsetHour) {
        this.updateUTC();
        if(typeof timeZone == 'undefined') timeZone = '00:00';
        let t = timeZone.split(':');
        let timeZoneFl = parseFloat(t.shift());
        let sign = timeZoneFl < 0 ? -1 : 1;
        timeZoneFl = timeZoneFl + sign * parseFloat(t.pop() / 60);
        
        return this.getTime({str: timeZone, float: timeZoneFl, zoneOffsetHour: zoneOffsetHour});
    }

    getTime(td) {
        const utc = this.getUTC();
        let newDT = new Date(utc + (3600000 * (td.float + td.zoneOffsetHour)));
        let out = {
            day: newDT.getDay(),
            month: this.getMonthName(newDT.getMonth(), 3),
            date: newDT.getDate(),
            day: this.getDayName(newDT.getDay(), 3),
            year: newDT.getFullYear(),
            hour: this.zeroPad(newDT.getHours()),
            min: this.zeroPad(newDT.getMinutes()),
            min10: this.zeroPad(10 * Math.floor(newDT.getMinutes() / 10 )),
            sec: this.zeroPad(newDT.getSeconds()),
            timeZone: td.str,
            zoneOffsetHour: td.zoneOffsetHour,
            ampm: newDT.getHours() < 12 ? 'am' : 'pm'
        };
        return out;
    }

    drawClock(time, elemId, size, clock_type) {
        // https://www.materialui.co/colors
        let colorSet = {
            default: {
                am: {
                    outer: 'rgba(189,189,189 ,1)',
                    backg: 'rgba(236,239,241,0.2)',
                    hour: 'rgba(66,66,66 ,1)',
                    minute: 'rgba(66,66,66 ,1)',
                    second: '#ee0000',
                    pin: '#000000'
                },
                pm: {
                    outer: 'rgba(176,190,197 ,1)',//'#444444',
                    backg: 'rgba(207,216,220 ,0.7)',
                    hour: 'rgba(55,71,79 ,1)',
                    minute: 'rgba(55,61,79 ,1)',
                    second: '#0000ee',
                    pin: '#0000ee'
                }
            },
            icon: {
                am: {
                    outer: 'rgba(120,144,156 ,1)',
                    backg: 'rgba(176,190,197 ,1)',
                    hour: 'rgba(62,39,35 ,1)',
                    minute: 'rgba(191,54,12 ,1)',
                    second: 'rgba(255,255,255 ,0)',
                    pin: 'rgba(255, 255, 255, 0)'
                },
                pm: {
                    outer: 'rgba(120,144,156 ,1)',
                    backg: 'rgba(176,190,197 ,1)',
                    hour: 'rgba(62,39,35 ,1)',
                    minute: 'rgba(191,54,12 ,1)',
                    second: 'rgba(255,255,255 ,0)',
                    pin: 'rgba(255, 255, 255, 0)'
                }
            },
            adjust: {
                am: {
                    outer: '#eeeeee',
                    backg: 'rgba(236,239,241,0.2)',
                    hour: 'rgba(62,39,35 ,1)',
                    minute: 'rgba(191,54,12 ,1)',
                    second: 'rgba(255,255,255 ,0)',
                    pin: 'rgba(191,54,12 ,1)'
                },
                pm: {
                    outer: 'rgba(176,190,197 ,1)',
                    backg: 'rgba(207,216,220 ,0.7)',
                    hour: 'rgba(62,39,35 ,1)',
                    minute: 'rgba(191,54,12 ,1)',
                    second: 'rgba(255,255,255 ,0)',
                    pin: 'rgba(191,54,12 ,1)'
                }
            }
        };
        let _SIZE_ = size;
        let tw = {};
        let clr = colorSet[clock_type][time.ampm];
        let canvas = Raphael(elemId, 2*_SIZE_, 2*_SIZE_);
		    let clock = canvas.circle(_SIZE_, _SIZE_, _SIZE_-5);
		    clock.attr({ 'fill': clr.backg, 'stroke': clr.outer, 'stroke-width': '`${_SIZE_/20}`'});
		    let hour_sign;
        switch(clock_type) {
        case 'icon':
        case 'adjust':
            tw = {h: 1.2, m: 2 };
            break;
        case 'default':
        default:
            tw = {h: 1, m: 1};
		        for(let i=0; i<12; i++){
				        let start_x = _SIZE_ + Math.round(0.7 * _SIZE_ * Math.cos(30 * i * Math.PI/180));
				        let start_y = _SIZE_ + Math.round(0.7 * _SIZE_ * Math.sin(30 * i * Math.PI/180));
				        let end_x = _SIZE_ + Math.round(0.8 * _SIZE_ * Math.cos(30 * i * Math.PI/180));
				        let end_y = _SIZE_ + Math.round(0.8 * _SIZE_ * Math.sin(30 * i * Math.PI/180));	
				        hour_sign = canvas.path('M'+start_x+' '+start_y+'L'+end_x+' '+end_y);
		            hour_sign.attr({ 'stroke': clr.outer, 'stroke-width': '`${_SIZE_/20}`'});
		        }
            break;
        }
		    let hour_hand = canvas.path(`M${_SIZE_} ${_SIZE_}L${_SIZE_} ${_SIZE_ / 2 / tw.h}`);
        hour_hand.rotate(30*time.hour+(time.min/2.5), _SIZE_, _SIZE_);
		    hour_hand.attr({stroke: clr.hour, 'stroke-width': tw.h * 0.07 * _SIZE_});

		    let minute_hand = canvas.path(`M${_SIZE_} ${_SIZE_}L${_SIZE_} ${0.36 * _SIZE_ / tw.m}`);
		    minute_hand.rotate(6*time.min, _SIZE_, _SIZE_);
		    minute_hand.attr({stroke: clr.minute, 'stroke-width': tw.m * 0.04 * _SIZE_});

		    let second_hand = canvas.path(`M${_SIZE_} ${_SIZE_+10}L${_SIZE_} ${_SIZE_/3.8}`);
		    second_hand.rotate(6*time.sec, _SIZE_, _SIZE_);
		    second_hand.attr({stroke: clr.second, 'stroke-width': tw * 0.02 * _SIZE_}); 

		    let pin = canvas.circle(_SIZE_, _SIZE_, _SIZE_/30/tw.h);
		    pin.attr({stroke: clr.pin, 'stroke-width': tw * 0.02 * _SIZE_}); 
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
