"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var dotenv = require("dotenv"); // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
var openai_1 = require("openai");
var fs = require("fs");
var ALLOWED_API_CALLS = 10; // by default, we will only run 10 open API calls
var trainerTxt = "";
var newTranslationJson = {};
dotenv.config();
// if the user passes in a --live flag, we'll up the calls to the max
if (process.argv.slice(2)[0] === "--live") {
    ALLOWED_API_CALLS = 10000;
}
var configuration = new openai_1.Configuration({
    apiKey: process.env.OPENAI_API_KEY
});
var openai = new openai_1.OpenAIApi(configuration);
var loadFile = (function (filename) {
    return fs.readFileSync(filename, 'utf8');
});
var translate = function handler(text) {
    return __awaiter(this, void 0, void 0, function () {
        var process, e_1;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    process = function (text) { return __awaiter(_this, void 0, void 0, function () {
                        var res;
                        var _a, _b, _c, _d, _e;
                        return __generator(this, function (_f) {
                            switch (_f.label) {
                                case 0: return [4 /*yield*/, openai.createCompletion({
                                        model: "text-davinci-002",
                                        prompt: "".concat(trainerTxt).concat(text),
                                        max_tokens: 147,
                                        temperature: 0,
                                        top_p: 1,
                                        presence_penalty: 0,
                                        frequency_penalty: 0.5
                                    })];
                                case 1:
                                    res = _f.sent();
                                    if (((_b = (_a = res === null || res === void 0 ? void 0 : res.data) === null || _a === void 0 ? void 0 : _a.choices) === null || _b === void 0 ? void 0 : _b.length) > 0
                                        && ((_c = res === null || res === void 0 ? void 0 : res.data) === null || _c === void 0 ? void 0 : _c.choices[0]) !== undefined) {
                                        //console.log(res?.data?.choices[0])
                                        return [2 /*return*/, ((_e = (_d = res === null || res === void 0 ? void 0 : res.data) === null || _d === void 0 ? void 0 : _d.choices[0].text) !== null && _e !== void 0 ? _e : 'FAILEDTOTRANSLATE')];
                                    }
                                    return [2 /*return*/];
                            }
                        });
                    }); };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, process(text)["catch"](function () { return process("FAILEDTOTRANSLATE"); })];
                case 2: return [2 /*return*/, _a.sent()];
                case 3:
                    e_1 = _a.sent();
                    console.error(e_1);
                    return [2 /*return*/, 'FAILEDTOTRANSLATE'];
                case 4: return [2 /*return*/];
            }
        });
    });
};
var main = function () { return __awaiter(void 0, void 0, void 0, function () {
    var translationJsonStr, translationJson;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                trainerTxt = loadFile('trainer.txt');
                translationJsonStr = loadFile('original.json');
                translationJson = JSON.parse(translationJsonStr);
                return [4 /*yield*/, iterateObj(translationJson)];
            case 1:
                newTranslationJson = _a.sent();
                fs.writeFile("translation.json", JSON.stringify(newTranslationJson, undefined, 4), function (err) {
                    if (err) {
                        console.error(err);
                    }
                });
                return [2 /*return*/];
        }
    });
}); };
var ctr = 0;
var rateCtr = 0;
var iterateObj = function (obj) { return __awaiter(void 0, void 0, void 0, function () {
    var returnObj, _i, _a, key, obj2, _b, _c, str, res;
    var _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                returnObj = {};
                _i = 0, _a = Object.keys(obj);
                _e.label = 1;
            case 1:
                if (!(_i < _a.length)) return [3 /*break*/, 9];
                key = _a[_i];
                returnObj[key] = {};
                obj2 = obj[key];
                if (!(typeof obj2 === 'object')) return [3 /*break*/, 3];
                _b = returnObj;
                _c = key;
                return [4 /*yield*/, iterateObj(obj2)];
            case 2:
                _b[_c] = _e.sent();
                return [3 /*break*/, 8];
            case 3:
                ctr++;
                if (!(ctr <= ALLOWED_API_CALLS)) return [3 /*break*/, 7];
                str = "\nhuman: \"".concat(obj2, "\"\ndog: ");
                return [4 /*yield*/, translate(str)];
            case 4:
                res = (_d = _e.sent()) !== null && _d !== void 0 ? _d : "FAILEDTOTRANSLATE";
                // result is typically in format: '\n\n"TEXT"'
                res = res.replace("\n\n", "");
                // result is due to the quotes and will be in format: '\n\n"\"TEXT\""' so we trim start and ending \"
                if (res.startsWith("\"")) {
                    res = res.substring(1, res.length);
                }
                if (res.endsWith("\"")) {
                    res = res.substring(0, res.length - 1);
                }
                console.log("".concat(key, ": ").concat(res));
                returnObj[key] = res;
                rateCtr++;
                if (!(rateCtr > 17)) return [3 /*break*/, 6];
                rateCtr = 0;
                return [4 /*yield*/, new Promise(function (f) { return setTimeout(f, 60000); })];
            case 5:
                _e.sent();
                _e.label = 6;
            case 6: return [3 /*break*/, 8];
            case 7:
                returnObj[key] = obj2;
                _e.label = 8;
            case 8:
                _i++;
                return [3 /*break*/, 1];
            case 9: return [2 /*return*/, returnObj];
        }
    });
}); };
main();
