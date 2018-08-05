const _STORAGE_NAME_ = 'tzConfigAAAAAAAAAA';
const _CLOCLFACE_WIDTH_ = 80;
const _ICONSIZE_ = 19;
const _CLOCKMAX_ = 8;
const _DEFAULTSETTING_ =  {
    zone: "+1:00",
    name: "London",
    elemId: null,
    persistent: false,
    zoneLabel:"London / +1:00",
    dispicon: false
};

// -------------------------
let d = new Date();
let tzos_abs =  Math.abs(d.getTimezoneOffset());
let os = {
  sign: (d.getTimezoneOffset() < 0) ? '+' : '-',
  hour: Math.floor(tzos_abs / 60),
  min: ('00' + ((tzos_abs % 60).toString())).substr(-2)
};
let zoneLabel = `${os.sign}${os.hour}:${os.min}`;
_DEFAULTSETTING_.zone = zoneLabel;
_DEFAULTSETTING_.name = 'Local Time';
_DEFAULTSETTING_.zoneLabel = `${_DEFAULTSETTING_.name} / ${zoneLabel}`;
// -------------------------

let config;
export default config  = {
  storage_name: _STORAGE_NAME_,
  clockface_width: _CLOCLFACE_WIDTH_,
  iconsize: _ICONSIZE_,
  clockmax: _CLOCKMAX_,
  defaultsetting: _DEFAULTSETTING_
};
