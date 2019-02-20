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
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const vsHelp_1 = require("./vsHelp");
const index_1 = require("../utils/index");
const xFetch_1 = require("../utils/xFetch");
const Tree_1 = require("./Tree");
class GetDtoJson {
    constructor(_vscode) {
        /**
         * 当前用户配置
         *
         * @private
         * @type {*}
         * @memberof dfxk
        */
        this.config = vscode.workspace.getConfiguration('dfxk');
        this.configPath = path.join(__dirname, '../../assets/config.json');
        this.info = JSON.parse(fs.readFileSync(this.configPath, 'utf-8'));
        /**
        * 初始化
        *
        * @private
        * @memberof dfxk
        */
        this.initialize = () => __awaiter(this, void 0, void 0, function* () {
            let firstload = yield this.checkFirstload(); // 是否初次加载插件
            // 如果是第一次加载插件，或者旧版本
            if (firstload) {
                this.init(true);
            }
        });
        this.init = (refresh) => __awaiter(this, void 0, void 0, function* () {
            yield this.checkFirstload();
            let lastConfig = this.config; // 之前的配置
            let config = vscode.workspace.getConfiguration('dfxk'); // 当前用户配置
            // 1.如果配置文件改变到时候，当前插件配置没有改变，则返回
            if (!refresh && JSON.stringify(lastConfig) === JSON.stringify(config)) {
                // console.log('配置文件未改变.')
                return;
            }
            // 3.保存当前配置
            this.config = config; // 更新配置
            if (!this.info.id) {
                vsHelp_1.default.showInfo(`请检查配置`);
                return;
            }
            if (this.config.jsonUrl && this.info.id) {
                const url = this.config.jsonUrl;
                const id = index_1.getQueryString('id', url);
                const domain = 'http://192.168.102.8:8090/repository/vsceExportDJson';
                const json = {
                    sessionId: this.info.id,
                    id,
                };
                const res = yield xFetch_1.post(domain, json);
                vsHelp_1.default.showInfo(`${JSON.stringify(res)}`);
                if (res.isOk) {
                    this.onReadDto(res.repository.result.json);
                }
            }
        });
        this.onReadDto = (value) => __awaiter(this, void 0, void 0, function* () {
            let json = yield Tree_1.default.JsonToTs(value, 'response');
            try {
                fs.writeFileSync(this.config.replaceUrl, json, 'utf-8');
                vsHelp_1.default.showInfo(`保存在${this.config.replaceUrl}成功`);
            }
            catch (err) {
                vsHelp_1.default.showInfo(`${err}`);
            }
        });
        /**
         * 检测是否初次加载，并在初次加载的时候提示用户
         *
         * @private
         * @returns {boolean} 是否初次加载
         * @memberof dfxk
         */
        this.checkFirstload = () => __awaiter(this, void 0, void 0, function* () {
            let lastConfig = this.config; // 之前的配置
            let config = vscode.workspace.getConfiguration('dfxk'); // 当前用户配置
            if (!this.info.firstload || JSON.stringify(lastConfig) !== JSON.stringify(config)) {
                // 3.保存当前配置
                this.config = config; // 更新配置
                const res = yield this.login(this.config);
                if (res) {
                    this.info.firstload = true;
                    this.info.id = res.data.id;
                    this.info.fullname = res.data.fullname;
                    this.info.email = res.data.email;
                }
                else {
                    this.info.firstload = false;
                    this.info.id = null;
                    this.info.fullname = null;
                    this.info.email = null;
                }
                yield fs.writeFileSync(this.configPath, JSON.stringify(this.info, null, '    '), 'utf-8');
                this.info = JSON.parse(fs.readFileSync(this.configPath, 'utf-8'));
                return true;
            }
            return false;
        });
        this.login = (params) => __awaiter(this, void 0, void 0, function* () {
            const json = {
                email: params.email,
                password: params.password
            };
            const res = yield xFetch_1.post('http://192.168.102.8:8090/account/login', json);
            if (res.data.errMsg) {
                vsHelp_1.default.showInfo(res.data.errMsg);
                return;
            }
            return res;
        });
        this.vscode = _vscode;
        this.initialize();
    }
    /**
     * 执行执行函数
     *
     * @returns {void}
     * @memberof dfxk
     */
    extension() {
        this.init(true);
    }
    /**
     * 初始化，并开始监听配置文件改变
     *
     * @returns {vscode.Disposable}
     * @memberof dfxk
     */
    watch() {
        this.initialize();
        return vscode.workspace.onDidChangeConfiguration(() => this.initialize());
    }
}
module.exports = GetDtoJson;
//# sourceMappingURL=getDtoJson.js.map