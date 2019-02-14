"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("underscore");
class Json2Ts {
    constructor() {
        this.convert = (content, scope) => {
            this.scope = scope;
            var jsonContent = content;
            if (_.isArray(jsonContent)) {
                return this.convertObjectToTsInterfaces(jsonContent[0]);
            }
            return this.convertObjectToTsInterfaces(jsonContent);
        };
        this.convertObjectToTsInterfaces = (jsonContent, objectName) => {
            if (objectName === void 0) {
                objectName = `${this.toUpperFirstLetter(this.scope)}Object`;
            }
            var optionalKeys = [];
            var objectResult = [];
            for (var key in jsonContent) {
                var value = jsonContent[key];
                if (key.indexOf('_description') > -1) {
                    jsonContent[key] = value;
                }
                else if (_.isObject(value) && !_.isArray(value)) {
                    if (_.isRegExp(value)) {
                        jsonContent[key] = "string";
                    }
                    else {
                        let childObjectName = this.toUpperFirstLetter(key);
                        objectResult.push(this.convertObjectToTsInterfaces(value, childObjectName));
                        jsonContent[key] = this.removeMajority(childObjectName) + ";";
                    }
                }
                else if (_.isArray(value)) {
                    var arrayTypes = this.detectMultiArrayTypes(value);
                    if (this.isMultiArray(arrayTypes)) {
                        var multiArrayBrackets = this.getMultiArrayBrackets(value);
                        if (this.isAllEqual(arrayTypes)) {
                            jsonContent[key] = arrayTypes[0].replace("[]", multiArrayBrackets);
                        }
                        else {
                            jsonContent[key] = "any" + multiArrayBrackets + ";";
                        }
                    }
                    else if (value && value.length > 0 && _.isObject(value[0])) {
                        var childObjectName = this.toUpperFirstLetter(key);
                        objectResult.push(this.convertObjectToTsInterfaces(value[0], childObjectName));
                        jsonContent[key] = this.removeMajority(childObjectName) + "[];";
                    }
                    else {
                        jsonContent[key] = arrayTypes[0];
                    }
                    if (key === 'bankCards?') {
                        console.log('value', value, this.detectMultiArrayTypes([1, 2]));
                    }
                }
                else if (_.isDate(value)) {
                    jsonContent[key] = "Date;";
                }
                else if (_.isString(value)) {
                    jsonContent[key] = "string;";
                }
                else if (_.isBoolean(value)) {
                    jsonContent[key] = "boolean;";
                }
                else if (_.isNumber(value)) {
                    jsonContent[key] = "number;";
                }
                else {
                    jsonContent[key] = "any;";
                    optionalKeys.push(key);
                }
            }
            var result = this.formatCharsToTypeScript(jsonContent, objectName, optionalKeys);
            objectResult.push(result);
            return objectResult.join("\n\n");
        };
        this.detectMultiArrayTypes = (value, valueType) => {
            if (valueType === void 0) {
                valueType = [];
            }
            if (_.isArray(value)) {
                if (value && value.length === 0) {
                    valueType.push("any[];");
                }
                else if (_.isArray(value[0])) {
                    for (var index = 0, length_1 = value.length; index < length_1; index++) {
                        var element = value[index];
                        var valueTypeResult = this.detectMultiArrayTypes(element, valueType);
                        valueType.concat(valueTypeResult);
                    }
                }
                else if (_.all(value, _.isString)) {
                    valueType.push("string[];");
                }
                else if (_.all(value, _.isNumber)) {
                    valueType.push("number[];");
                }
                else if (_.all(value, _.isBoolean)) {
                    valueType.push("boolean[];");
                }
                else {
                    valueType.push("any[];");
                }
            }
            return valueType;
        };
        this.isMultiArray = (arrayTypes) => {
            return arrayTypes.length > 1;
        };
        this.getMultiArrayBrackets = (content) => {
            var jsonString = JSON.stringify(content);
            var brackets = "";
            for (var index = 0, length_2 = jsonString.length; index < length_2; index++) {
                var element = jsonString[index];
                if (element === "[") {
                    brackets = brackets + "[]";
                }
                else {
                    index = length_2;
                }
            }
            return brackets;
        };
        this.isAllEqual = (array) => {
            return _.all(array.slice(1), _.partial(_.isEqual, array[0]));
        };
        this.formatCharsToTypeScript = (jsonContent, objectName, optionalKeys) => {
            var result = JSON.stringify(jsonContent, null, 2) && JSON.stringify(jsonContent, null, 2)
                .replace(new RegExp("[a-zA-z]+_description\": *", "g"), "")
                .replace(new RegExp("\"", "g"), "")
                .replace(new RegExp(",", "g"), "");
            var allKeys = _.allKeys(jsonContent);
            for (var index = 0, length_3 = allKeys.length; index < length_3; index++) {
                var key = allKeys[index];
                if (_.contains(optionalKeys, key)) {
                    result = result.replace(new RegExp(key + ":", "g"), this.toLowerFirstLetter(key) + "?:");
                }
                else {
                    result = result.replace(new RegExp(key + ":", "g"), this.toLowerFirstLetter(key) + ":");
                }
            }
            objectName = this.removeMajority(objectName);
            return "export interface " + objectName + " " + result;
        };
        this.removeMajority = (objectName) => {
            if (_.last(objectName, 3).join("").toUpperCase() === "IES") {
                return objectName.substring(0, objectName.length - 3) + "y";
            }
            else if (_.last(objectName).toUpperCase() === "S") {
                return objectName.substring(0, objectName.length - 1);
            }
            return objectName;
        };
        this.toUpperFirstLetter = (text) => {
            return (text.charAt(0).toUpperCase() + text.slice(1)).replace('?', '');
        };
        this.isJson = (stringContent) => {
            try {
                JSON.parse(stringContent);
            }
            catch (e) {
                return false;
            }
            return true;
        };
        this.toLowerFirstLetter = (text) => {
            return text.charAt(0).toLowerCase() + text.slice(1);
        };
    }
}
exports.default = new Json2Ts();
//# sourceMappingURL=jsonTots.js.map