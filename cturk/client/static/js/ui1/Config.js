var Config = {

    ajaxUrlPrefix: "/~zzz/cturk-task4/cturk/server/webroot",
    
    minimumPayment: {//USD, GBP, EUR, JPY, CAD, AUD
        "USD": 2.00,
        "GBP": 2.00
    }
};

if (typeof console == "undefined") {
    window.console = {
        log: function(){
        }
    };
}
