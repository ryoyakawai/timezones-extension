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

/**
 *
 * Timezones are defined Based on this URL:
 *  https://en.wikipedia.org/wiki/List_of_time_zone_abbreviations
 *  https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
 **/

const tzList = [
    {name: "Midway",                   value: '-11:00', abbr:'' },
    {name: "Hawaii-Aleutian Std.Time", value: '-10:00', abbr:'' },
    {name: "Alaska Daylight Time",     value: '-8:00',  abbr:'' },
    {name: "Los Angeles",            value: '-8:00',  abbr:'PST' },
    {name: "Pacific Std. Time",      value: '-8:00',  abbr:'PST' },
    {name: "Pacific Daylight Time",  value: '-7:00',  abbr:'PDT' },
    {name: "Tijuana",                value: '-7:00',  abbr:'' },
    {name: "Mountain Std. Time",     value: '-7:00',  abbr:'MST' },
    {name: "Chihuahua",              value: '-6:00',  abbr:'' },
    {name: "Mountain Daylight Time", value: '-6:00',  abbr:'MDT' },
    {name: "Costa Rica",             value: '-6:00',  abbr:'' },
    {name: "Regina",                 value: '-6:00',  abbr:'' },
    {name: "Central Std. Time",      value: '-6:00',  abbr:'CST' },
    {name: "Central Daylight Time",  value: '-5:00',  abbr:'CDT' },
    {name: "Mexico City",            value: '-5:00',  abbr:'' },
    {name: "Bogota",                 value: '-5:00',  abbr:'' },
    {name: "Eastern Std. Time",      value: '-5:00',  abbr:'EST' },
    {name: "Eastern Daylight Time",  value: '-4:00',  abbr:'EDT' },
    {name: "Caracs",                 value: '-4:00',  abbr:'' },
    {name: "Bardados",               value: '-4:00',  abbr:'' },
    {name: "Manaus",                 value: '-4:00',  abbr:'' },
    {name: "Halifax",                value: '-3:00',  abbr:'' },
    {name: "Recife",                 value: '-3:00',  abbr:'' },
    {name: "Sao Paulo",              value: '-3:00',  abbr:'' },
    {name: "Buenos Aires",           value: '-3:00',  abbr:'' },
    {name: "Montevideo",             value: '-3:00',  abbr:'' },
    {name: "St. John's",             value: '-2:30',  abbr:'' },
    {name: "Nuuk",                   value: '-2:00',  abbr:'' },
    {name: "South Georgia",          value: '-2:00',  abbr:'' },
    {name: "Cape Verde",             value: '-1:00',  abbr:'' },
    {name: "UTC",                    value: '+0:00',  abbr:'UTC' },
    {name: "Azores",                 value: '+0:00',  abbr:'' },
    {name: "Casablanca",             value: '+0:00',  abbr:'' },
    {name: "London",                 value: '+1:00',  abbr:'' },
    {name: "Bazzaville",             value: '+1:00',  abbr:'' },
    {name: "Amsterdams",             value: '+2:00',  abbr:'' },
    {name: "Belgrade",               value: '+2:00',  abbr:'' },
    {name: "Madrid",                 value: '+2:00',  abbr:'' },
    {name: "Sarajevo",               value: '+2:00',  abbr:'' },
    {name: "Windhoek",               value: '+2:00',  abbr:'' },
    {name: "Cairo",                  value: '+2:00',  abbr:'' },
    {name: "Harare",                 value: '+2:00',  abbr:'' },
    {name: "Amman",                  value: '+3:00',  abbr:'' },
    {name: "Athens",                 value: '+3:00',  abbr:'' },
    {name: "Istanbul",               value: '+3:00',  abbr:'' },
    {name: "Beirut",                 value: '+3:00',  abbr:'' },
    {name: "Helsinki",               value: '+3:00',  abbr:'' },
    {name: "Jerusalem",              value: '+3:00',  abbr:'' },
    {name: "Minsk",                  value: '+3:00',  abbr:'' },
    {name: "Baghdad",                value: '+3:00',  abbr:'' },
    {name: "Moscow",                 value: '+3:00',  abbr:'' },
    {name: "Kuwait",                 value: '+3:00',  abbr:'' },
    {name: "Nairobi",                value: '+3:00',  abbr:'' },
    {name: "Baku",                   value: '+4:00',  abbr:'' },
    {name: "Tbilisi",                value: '+4:00',  abbr:'' },
    {name: "Yerevan",                value: '+4:00',  abbr:'' },
    {name: "Dubai",                  value: '+4:00',  abbr:'' },
    {name: "Tehran",                 value: '+4:30',  abbr:'' },
    {name: "Kabul",                  value: '+4:30',  abbr:'' },
    {name: "Karachi",                value: '+5:00',  abbr:'' },
    {name: "Oral",                   value: '+5:00',  abbr:'' },
    {name: "Yekaterinburg",          value: '+5:00',  abbr:'' },
    {name: "Kolkata",                value: '+5:30',  abbr:'' },
    {name: "Colombo",                value: '+5:30',  abbr:'' },
    {name: "Kathmandu",              value: '+5:45',  abbr:'' },
    {name: "Almaty",                 value: '+6:00',  abbr:'' },
    {name: "Rangoon",                value: '+6:30',  abbr:'' },
    {name: "Krasnoyarsk",            value: '+7:00',  abbr:'' },
    {name: "Bangkok",                value: '+7:00',  abbr:'' },
    {name: "Jakarta",                value: '+7:00',  abbr:'' },
    {name: "Shanghai",               value: '+8:00',  abbr:'' },
    {name: "Hong Kong",              value: '+8:00',  abbr:'' },
    {name: "Irkutsk",                value: '+8:00',  abbr:'' },
    {name: "Kuala Lumpur",           value: '+8:00',  abbr:'' },
    {name: "Perth",                  value: '+8:00',  abbr:'' },
    {name: "Taipei",                 value: '+8:00',  abbr:'' },
    {name: "Seoul",                  value: '+9:00',  abbr:'' },
    {name: "Tokyo",                  value: '+9:00',  abbr:'JST' },
    {name: "Yakutsk",                value: '+9:00',  abbr:'' },
    {name: "Adelaide",               value: '+9:30',  abbr:'' },
    {name: "Darwin",                 value: '+9:30',  abbr:'' },
    {name: "Brisbane",               value: '+10:00', abbr:'' },
    {name: "Hobart",                 value: '+10:00', abbr:'' },
    {name: "Sydney",                 value: '+10:00', abbr:'' },
    {name: "Vladivostok",            value: '+10:00', abbr:'' },
    {name: "Magadan",                value: '+11:00', abbr:'' },
    {name: "Noumea",                 value: '+11:00', abbr:'' },
    {name: "Majuro",                 value: '+12:00', abbr:'' },
    {name: "Aukland",                value: '+12:00', abbr:'' },
    {name: "Fiji",                   value: '+12:00', abbr:'' },
    {name: "Togatapu",               value: '+13:00', abbr:'' } 
];

let listDispVal = [];
for(let item in tzList) {
    let tzValue = tzList[item].value;
    let tzName = `${tzList[item].name} / ${tzValue}`;
    if(tzList[item].abbr !== '') tzName = `${tzName} (${tzList[item].abbr})`;
    listDispVal.push({
        name: tzName,
        value: tzValue
    });
}

let list;
export default list = listDispVal;
