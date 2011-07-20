var Util = {

    /**
     * show date given timestamp
     * @param {int} timestamp
     */
    getDate: function(timestamp){
        if (typeof timestamp == "string") {
            timestamp = parseFloat(timestamp);
        }
        var o = new Date(timestamp);
        var y = o.getFullYear();
        var m = o.getMonth();
        var d = o.getDate();
        var h = o.getHours();
        var i = o.getMinutes();
        if (i < 10) {
            i = "0" + i;
        }
        var monthText = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return monthText[m] + ' ' + d + ' ' + y + ' ' + h + ':' + i;
    },
    
    /**
     * show hour/minute/second given sec
     * @param {int} sec
     */
    getTime: function(sec){
        if (typeof sec == "string") {
            sec = parseFloat(sec);
        }
        var hour = Math.floor(sec / 3600);
        var min = Math.floor((sec % 3600) / 60);
        
        var hourText = ' hours ';
        var minuteText = ' minutes ';
        if (hour == 0 || hour == 1) {
            hourText = ' hour ';
        }
        if (min == 0 || min == 1) {
            minuteText = ' minute ';
        }
        if (hour != 0) {
            return hour + hourText + min + minuteText;
            
        } else {
            if (min == 0 || min == 1) {
                return min + minuteText;
            } else {
                return min + minuteText;
            }
        }
    },
    
    /**
     * get product's price
     * @param {string} price
     */
    getPrice: function(price){
        if (typeof price == "number") {
            price = price + "";
        }
        var x = price;
        if (x.indexOf(".") == -1) {
            price = x + ".00";
        } else {
            x = x + "00";
            var i = x.indexOf(".");
            var l = x.length;
            var v = x.substring(0, i + 3);
            price = v
        }
        if (price.indexOf(".") == 0) {
            return "0" + price;
        }

        return price;
    }
    
}
