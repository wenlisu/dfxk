"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getQueryString(name, url) {
    const reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`, 'i');
    const r = url.split('?')[1].match(reg);
    if (r !== null) {
        return unescape(r[2]);
    }
    return null;
}
exports.getQueryString = getQueryString;
//# sourceMappingURL=index.js.map