const fs = require('fs');
const path = require('path');


let headRegistry = []

class ExcMLObj {
    constructor() {
        this.tagName = "";
        this.attributes = {};
        this.id = "";
        this.class = "";
        this.name = "";
        this.children = [];
        this.innerEXCML = "";
        this.isInHead = false;
    }
    toHTML() {
        headRegistry = [];
        let result = this.toXML(true);
        let rt = "<!DOCTYPE html> \n<html><head>\n";
        for (let i = 0; i < headRegistry.length; i++) {
            headRegistry[i].tagName = headRegistry[i].tagName.split("#").join("");
            headRegistry[i].isInHead = false;
            headRegistry[i] = headRegistry[i].toXML(true);
        }
        rt += headRegistry.join("\n");
        rt += "</head>\n";
        rt += result;
        rt += "\n</html>";
        return rt;
    }
    foundScript() {
        let test = this.innerEXCML.trim();
        if (test.endsWith(".js")) {
            let scripts = test.split(";");
            let rt = "";
            for (let i = 0; i < scripts.length; i++) {
                rt += `<script src="${scripts[i]}"></script>\n`;
            }
            return rt;
        }
        return null;
    }
    foundLink() {
        console.log("Found link! => ", this.innerEXCML);
        let test = this.innerEXCML.trim();
        if (test.endsWith(".css")) {
            let scripts = test.split(";");
            let rt = "";
            for (let i = 0; i < scripts.length; i++) {
                rt += `<link rel="stylesheet" href="${scripts[i]}" />`;
            }
            return rt;
        }
        return null;
    }
    toXML(isHTMLParse = false) {
        if (isHTMLParse) {
            switch (this.tagName) {
                case "link":
                    let link = this.foundLink();
                    if (link !== null) {
                        return link;
                    }
                    break;
                case "script":
                    let script = this.foundScript();
                    if (script !== null) {
                        return script;
                    }
                    break;
            }
            if (this.isInHead) {
                headRegistry.push(this);
                return "";
            }
        }

        const excml = this.innerEXCML.split("$%");
        let rt = `\n<${this.tagName}`;
        if (this.id.trim() != "") this.attributes["id"] = this.id.trim();
        if (this.class.trim() != "") this.attributes["class"] = this.class.trim();
        if (this.name.trim() != "") this.attributes["name"] = this.name.trim();
        for (let key in this.attributes) {
            rt += ` ${key}="${this.attributes[key].trim()}"`;
        }
        rt += ">";
        for (let i = 0; i < excml.length; i++) {
            rt += excml[i];
            if (i < this.children.length) {
                rt += this.children[i].toXML(isHTMLParse);
            }
        }
        rt += `</${this.tagName}>`;
        return rt;
    }

}
const LINE_SPLIT = /[|\n]/;
class ExcML {
    constructor() {
    }
    static _parseStringSplit(str, i = 0) {
        let rt = {
            str: "",
            children: [],
            i: 0
        };
        for (; i < str.length; i++) {
            if (str[i] === "$") {
                const res = this._parseStringSplit(str, i + 1);
                //console.log("s",res);
                rt.children.push(res);
                i = res.i;
                rt.str += "$%$";
            }
            if (str[i] === "§") {
                rt.i = i + 1;
                return rt;
            }
            rt.str += str[i];
        }
    }
    static _parseToStructure(obj, attributes = {}) {
        let rt = new ExcMLObj();
        rt.attributes = attributes;
        obj.str = obj.str.trim();
        obj.str = obj.str.split("\r").join("");
        let innerCArray = obj.str.split("$%$");
        innerCArray[0] = innerCArray[0].trim();
        let first = innerCArray[0].split(LINE_SPLIT); // Split by Line
        // INLINE ACTIVE
        let inlineFix = first[0].split(" ");
        first.shift();
        first = inlineFix.concat(first);
        // RESOLVE HEAD
        const args = first[0].split("!"); // Split by !
        rt.tagName = args[0] ? args[0] : "div"; // First Arg is always the tag name
        rt.tagName = rt.tagName.trim();
        rt.isInHead = rt.tagName.startsWith("#");
        if (rt.tagName == "title") {
            rt.isInHead = true;
        }
        rt.class = args[1] ? args[1].split(/(?<!\\),/).join(" ") : ""; // Second arg is always the class
        rt.id = args[2] ? args[2] : ""; // Third arg is always the id
        rt.name = args[3] ? args[3] : ""; // Fourth arg is always the name
        //
        first.shift();
        innerCArray[0] = first.join("\n");
        // RESOLVE BODY
        let currentAttribute = {};
        for (let i = 0; i < innerCArray.length; i++) {
            innerCArray[i] = innerCArray[i].trim();
            //console.log("-->",innerCArray[i],"-->",innerCArray[i].length);
            // if (innerCArray[i] === "") continue;
            let Lines = innerCArray[i].split(LINE_SPLIT);
            for (let m = 0; m < Lines.length; m++) {
                let currLine = Lines[m];
                currLine = currLine.trim();
                if (currLine.length === 0) continue;
                // If line starts with %, it is an attribute
                // Otherwise, it is not set
                if (currLine[0] !== "%") {
                    rt.innerEXCML += currLine + "\n";
                    continue;
                }
                currLine = currLine.substring(1);
                currLine = currLine.split("=");
                currentAttribute[currLine[0]] = currLine[1];
            }
            if (i === innerCArray.length - 1) continue;
            if (i <= obj.children.length) {
                console.warn("Attribute is not set to a child element!", i, Lines, obj.children.length, currentAttribute);
            }
            rt.innerEXCML += "$%" + "\n";
            rt.children.push(this._parseToStructure(obj.children[i], currentAttribute));
            currentAttribute = {};
        }
        return rt;
    }
    static replaceComment(str) {
        for (let i = 0; i + 2 < str.length; i++) {
            if (str[i] === "$" && str[i + 1] === "$" && str[i + 2] === "$") {
                let j = i;
                j++;
                while (!(str[j] === "$" && str[j + 1] === "$" && str[j + 2] === "$")) {
                    if (!(j + 2 < str.length)) return str.substring(0, i);
                    j++;
                }
                j += 3;
                str = str.substring(0, i) + str.substring(j);
                i = j;
            }
        }
        return str;
    }
    static _parseString(str) {
        str = this.replaceComment(str);
        //str = str.split("$$$").join("$?$?$");
        str = str.split("$%").join("$$$");
        str = str.split("\\<").join("&lt;");
        str = str.split("ROOT_OBJECT_IDENTIFIER").join("ROOT_FAKE_OBJECT_TYPE_IDENTIFIER");
        let res = this._parseStringSplit("ROOT_OBJECT_IDENTIFIER\n" + str + "§");
        res = this._parseToStructure(res);
        res.tagName = "body";

        return res;
    }
    static parse(data) {
        if (typeof data === 'string')
            return this._parseString(data);
    }
}

// Function to translate content (dummy function, replace with actual translation logic)
function translate(content) {
    // Dummy translation logic
    return ExcML.parse(content).toHTML().split('\n')                   // Split the string by newlines
        .filter(line => line.trim())    // Filter out empty or whitespace-only lines
        .join('\n');

}

exports.translate = translate;
exports.ExcML = ExcML;
exports.ExcMLObj = ExcMLObj;