import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import vsHelp from './vsHelp';
import { getQueryString } from '../utils/index';
import { post } from '../utils/xFetch';
import Tree from './Tree';

class GetDtoJson {
    vscode: any;

    /**
     * 当前用户配置
     * 
     * @private
     * @type {*}
     * @memberof dfxk
    */
    private config: any = vscode.workspace.getConfiguration('dfxk');
    private configPath = path.join(__dirname, '../../assets/config.json');
    private info: { firstload: boolean, id: any, fullname: any, email: any } = JSON.parse(fs.readFileSync(this.configPath, 'utf-8'));

    constructor(_vscode: any) {        //构造函数，传入vscode对象
        this.vscode = _vscode;
        this.initialize();
    }

     /**
     * 初始化
     * 
     * @private
     * @memberof dfxk
     */
    private initialize = async () => {

        let firstload = await this.checkFirstload();  // 是否初次加载插件
        // 如果是第一次加载插件，或者旧版本
        if (firstload) {
            this.init(true);
        }
    }

    /**
     * 执行执行函数
     * 
     * @returns {void} 
     * @memberof dfxk
     */ 
    public extension(): void {
        this.init(true);
    }

    private init = async(refresh?: boolean) => {
        await this.checkFirstload();
        let lastConfig = this.config;  // 之前的配置
        let config = vscode.workspace.getConfiguration('dfxk'); // 当前用户配置
        // 1.如果配置文件改变到时候，当前插件配置没有改变，则返回
        if (!refresh && JSON.stringify(lastConfig) === JSON.stringify(config)) {
            // console.log('配置文件未改变.')
            return;
        }
        // 3.保存当前配置
        this.config = config; // 更新配置
        if (!this.info.id) {
            vsHelp.showInfo(`请检查配置`);
            return;
        }
        if(this.config.jsonUrl && this.info.id) {
            const url = this.config.jsonUrl;
            const id = getQueryString('id', url);
            const domain = 'http://192.168.102.8:8090/repository/vsceExportDJson';
            const json = {
                sessionId: this.info.id,
                id,
            };
            const res = await post(domain, json);
            vsHelp.showInfo(`${JSON.stringify(res)}`);
            if(res.isOk) {
                this.onReadDto(res.repository.result.json);
            }
        }
    }

    onReadDto = async (value: any) => {
        let json = await Tree.JsonToTs(value, 'response');
        try {
            fs.writeFileSync(this.config.replaceUrl, json, 'utf-8');
            vsHelp.showInfo(`保存在${this.config.replaceUrl}成功`);
        } catch (err) {
            vsHelp.showInfo(`${err}`);
        }
    }

    /**
     * 检测是否初次加载，并在初次加载的时候提示用户
     * 
     * @private
     * @returns {boolean} 是否初次加载
     * @memberof dfxk
     */
    private checkFirstload = async() => {
        let lastConfig = this.config;  // 之前的配置
        let config = vscode.workspace.getConfiguration('dfxk'); // 当前用户配置
        if (!this.info.firstload || JSON.stringify(lastConfig) !== JSON.stringify(config)) {
            // 3.保存当前配置
            this.config = config; // 更新配置
            const res = await this.login(this.config);
            if(res){
                this.info.firstload = true;
                this.info.id = res.data.id;
                this.info.fullname = res.data.fullname;
                this.info.email = res.data.email;
            } else {
                this.info.firstload = false;
                this.info.id = null;
                this.info.fullname = null;
                this.info.email = null;
            }
            await fs.writeFileSync(this.configPath, JSON.stringify(this.info, null, '    '), 'utf-8');
            this.info = JSON.parse(fs.readFileSync(this.configPath, 'utf-8'));
            return true;
        }

        return false;
    }

    login = async (params: any) => {
        const json = {
            email: params.email,
            password: params.password
        };
        const res = await post('http://192.168.102.8:8090/account/login', json);
        if(res.data.errMsg) {
            vsHelp.showInfo(res.data.errMsg);
            return;
        }
        return res;
    }

    /**
     * 初始化，并开始监听配置文件改变
     * 
     * @returns {vscode.Disposable} 
     * @memberof dfxk
     */
    public watch(): vscode.Disposable {
        this.initialize();
        return vscode.workspace.onDidChangeConfiguration(() => this.initialize());
    }
}

module.exports = GetDtoJson;