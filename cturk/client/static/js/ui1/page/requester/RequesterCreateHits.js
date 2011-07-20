$(function(){
    var C = {
    
        user: null,
        
        load: function(){
            Ajax.getUserInfo({
                success: function(o){
                    if (o.status == 1) {
                        if (o.data.User['isRequester'] == 1) {
                            C.user = o.data;
                            HITs.load();
                            
                        } else {
                            alert("You are not requester. It will jump to worker page.");
                            window.location.href = "../worker/index.html";
                        }
                        
                    } else if (o.status == 0) {
                        alert("The login expired, please login again.");
                        location.href = "../index.html";
                    }
                }
            });
        }
    };
    
    C.load();
});

var HITs = {

    load: function(){
        var x = this;
        x.bindEvent();
    },
    
    bindEvent: function(){
        $("#expireDateCalendar").datepicker({
            dateFormat: "yy/mm/dd 00:00"
        });
        
        $("#form1").unbind("submit").submit(function(){
            var hasError = false;
            $("#form1 .required").each(function(){
                if ($(this).val() == "") {
                    hasError = true;
                    $(this).focus().select();
                    alert("This field can not be empty.");
                    return false;
                }
            });
            if (!hasError) {
                var v = new Date($("#expireDateCalendar").val()).getTime();
                if (!isNaN(v)) {
                    $("#expireDateCalendar").val(v);
                }
                Ajax.createHIT({
                    data: $("#form1").serialize(),
                    success: function(o){
                        alert(o.info);
                    }
                });
            }
            return false;
        });
    }
    
};
