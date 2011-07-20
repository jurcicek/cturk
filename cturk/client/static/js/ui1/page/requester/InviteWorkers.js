$(function(){
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
            var s = window.location.href;
            var s1 = s.substring(0, s.lastIndexOf("/"));
            var s2 = s1.substring(0, s1.lastIndexOf("/"));
            var search = $("#form1").serialize();
            var html = s2 + "/register.html?" + search;
            $("#inviteLinkDiv .value").text(html);
            $("#inviteLinkDiv").removeClass("hidden");
        }
        return false;
    });
});
