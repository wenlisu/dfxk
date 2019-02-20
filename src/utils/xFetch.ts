const fetch = require('node-fetch');
import * as querystring from 'querystring';

const Bluebird = require('bluebird');
 
fetch.Promise = Bluebird;

function parseJSON(response: any) {
  return response.json();
}

/**
 * 网络状态返回非200会reject
 * @param response
 */
function checkStatus(response: any) {
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
function errorMessageParse(jsonResult: any) {
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
async function xFetch(url: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', data?: any, headers = {}, errorHandle?: any): Promise<any> {
  const opts: any = {
    method: method,
    // mode: 'cors',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...headers,
    },
  };
  if (method !== 'GET') {
    opts.body = data ? JSON.stringify(data) : null;
  } else {
    url = data ? `${url}?${querystring.stringify(data)}` : url;
  }
  console.log('网络请求链接:', url);
  console.log('网络请求参数:', opts);
  try {
    const res = await Promise.race([
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
  } catch (error) {
    console.error('网络请求错误:', error);
    let errorMessage = '未知错误';
    if (error.des || error.msg) {
      errorMessage = error.des || error.msg;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    if (errorHandle) {
      errorHandle(errorMessage);
    } else {
    }
  }
}

/**
 * get请求
 * @param {string} url
 * @param {*} data
 * @param {*} headers
 * @param {function} mode
 */
function get(url: string, data?: any, headers?: any, errorHandle?: any) {
  return xFetch(url, 'GET', data, headers, errorHandle);
}

/**
 * post请求
 * @param {string} url
 * @param {*} data
 * @param {*} headers
 * @param {function} errorHandle
 */
function post(url: string, data?: any, headers?: any, errorHandle?: any) {
  return xFetch(url, 'POST', data, headers, errorHandle);
}

/**
 * put请求
 * @param {string} url
 * @param {*} data
 * @param {*} headers
 * @param {function} errorHandle
 */
function put(url: string, data?: any, headers?: any, errorHandle?: any) {
  return xFetch(url, 'PUT', data, headers, errorHandle);
}

/**
 * delete请求
 * @param {string} url
 * @param {*} data
 * @param {*} headers
 * @param {function} errorHandle
 */
function del(url: string, data?: any, headers?: any, errorHandle?: any) {
  return xFetch(url, 'DELETE', data, headers, errorHandle);
}

export {
  get,
  post,
  put,
  del,
};
