/**
 * location.search
 * @author zhiyuan.liang
 * @namespace LocationSearch
 * @version 20100128
 */
var LocationSearch = {
    /**
     * get location.search object
     * @return Object
     */
    get: function(){
        var str = location.search;
        var obj = {};
        if (str != "" && str != "?") {
            var arr = str.substring(1).split("&");
            for (i in arr) {
                var aTemp = arr[i].split("=");
                obj[aTemp[0]] = aTemp[1];
            }
        }
        return obj;
    },
    
    /**
     * set location.search object
     * @param {Object} obj
     */
    set: function(obj){
        var str = "?";
        for (i in obj) {
            str == "?" ? this : str += "&";
            str += i + "=" + obj[i];
        }
        window.location.search = str;
        return obj;
    },
    
    /**
     * assert location.search has the given key
     * @param {String} key
     */
    has: function(key){
        var obj = this.get();
        for (i in obj) {
            if (i == key) {
                return true;
            }
        }
        return false;
    },
    
    /**
     * set of get location object's value given the key
     * @param {String} key
     * @param {String} value
     */
    attr: function(key, value){//get or set location.search key
        var obj = this.get();
        if (key == undefined) {
            return;
        }
        if (value == undefined) {//get value
            return obj[key];
        } else {//set value
            obj[key] = value;
            this.set(obj);
        }
    }
};
