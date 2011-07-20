$(function(){

    var o = LocationSearch.get();
    for (var i in o) {
        var name = i;
        var value = decodeURIComponent(o[i]);
        if ($("#form1 input[name='" + name + "']").length > 0) {
            $("#form1 input[name='" + name + "']").val(value);
        } else {
            $("#form1 select[name='" + name + "']").val(value);
        }
    }
    
    
    $("#form1").submit(function(){
        var hasError = false;
        
        $("#form1 .registerError").html("");
        $("#form1 .input").each(function(){
            if ($(this).attr("required") == "true") {
                var n = $(this).attr("name");
                var v = $.trim($(this).val());
                if (v == "") {
                    hasError = true;
                    var t = $(this).attr("title");
                    $("#form1 ." + n + "Error").html(t + " can't empty.");
                } else if (n == "username" || n == "paypalAccount") {
                    var emailRegExp = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
                    if (!emailRegExp.test(v)) {
                        hasError = true;
                        $("#form1 ." + n + "Error").html("Invalid Email format.");
                    }
                }
            }
        });
        $("#form1 .input").unbind("focus").focus(function(){
            var n = $(this).attr("name");
            $("#form1 ." + n + "Error").html("");
        });
        
        if (!hasError) {
            Ajax.register({
                data: $("#form1").serialize(),
                success: function(o){
                    $("#form1 .registerError").html(o.info);
                    if (o.status == 1) {
                        window.setTimeout(function(){
                            location.href = "index.html";
                        }, 3000);
                    }
                }
            });
        }
        return false;
    });
});
