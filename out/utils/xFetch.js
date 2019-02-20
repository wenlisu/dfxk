"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fetch = require('node-fetch');
const querystring = require("querystring");
const Bluebird = require('bluebird');
fetch.Promise = Bluebird;
function parseJSON(response) {
    return response.json();
}
/**
 * 网络状态返回非200会reject
 * @param response
 */
function checkStatus(response) {
    if (response.status / 200 !== 1) {
        return Promise.reject({
            des: `网络错误:${response.status}`,
        });
    }
    return response;
}
/**
 * 全局错误处理
 */
function errorMessageParse(jsonResult) {
    const { status, code } = jsonResult;
    if (status !== null && status !== undefined) {
        if (status === -101 || status === -1) {
            return Promise.reject(jsonResult);
        }
    }
    if (code !== null && code !== undefined) {
        if (code !== 200) {
            return Promise.reject(jsonResult);
        }
    }
    return jsonResult;
}
/**
 * Requests a URL, return res.
 * @param {string} url
 * @param {'GET'|'POST'} method
 * @param {object} data
 * @param {object} headers
 * @param {string} mode
 * @param {function} errorHandle
 * @returns res
 */
function xFetch(url, method, data, headers = {}, errorHandle) {
    return __awaiter(this, void 0, void 0, function* () {
        const opts = {
            method: method,
            // mode: 'cors',
            headers: Object.assign({ 'Accept': 'application/json', 'Content-Type': 'application/json' }, headers),
        };
        if (method !== 'GET') {
            opts.body = data ? JSON.stringify(data) : null;
        }
        else {
            url = data ? `${url}?${querystring.stringify(data)}` : url;
        }
        console.log('网络请求链接:', url);
        console.log('网络请求参数:', opts);
        try {
            const res = yield Promise.race([
                fetch(url, opts)
                    .then(checkStatus)
                    .then(parseJSON)
                    .then(errorMessageParse),
                new Promise((resolve, reject) => {
                    setTimeout(() => {
                        reject({ des: '网络超时' });
                    }, 10000);
                }),
            ]);
            console.log('网络请求成功:', res);
            return res;
        }
        catch (error) {
            console.error('网络请求错误:', error);
            let errorMessage = '未知错误';
            if (error.des || error.msg) {
                errorMessage = error.des || error.msg;
            }
            else if (typeof error === 'string') {
                errorMessage = error;
            }
            if (errorHandle) {
                errorHandle(errorMessage);
            }
            else {
            }
        }
    });
}
/**
 * get请求
 * @param {string} url
 * @param {*} data
 * @param {*} headers
 * @param {function} mode
 */
function get(url, data, headers, errorHandle) {
    return xFetch(url, 'GET', data, headers, errorHandle);
}
exports.get = get;
/**
 * post请求
 * @param {string} url
 * @param {*} data
 * @param {*} headers
 * @param {function} errorHandle
 */
function post(url, data, headers, errorHandle) {
    return xFetch(url, 'POST', data, headers, errorHandle);
}
exports.post = post;
/**
 * put请求
 * @param {string} url
 * @param {*} data
 * @param {*} headers
 * @param {function} errorHandle
 */
function put(url, data, headers, errorHandle) {
    return xFetch(url, 'PUT', data, headers, errorHandle);
}
exports.put = put;
/**
 * delete请求
 * @param {string} url
 * @param {*} data
 * @param {*} headers
 * @param {function} errorHandle
 */
function del(url, data, headers, errorHandle) {
    return xFetch(url, 'DELETE', data, headers, errorHandle);
}
exports.del = del;
//# sourceMappingURL=xFetch.js.map