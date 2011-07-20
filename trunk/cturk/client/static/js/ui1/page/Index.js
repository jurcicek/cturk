$(function(){
    $("#loginForm").submit(function(){
        var username = $.trim($("#loginForm input[name='username']").val());
        var password = $("#loginForm input[name='password']").val();
        
        var hasError = true;
        $("#loginForm .loginError").html("");
        $("#loginForm .usernameError").html("");
        $("#loginForm .passwordError").html("");
        //if (username == "") {
        //    hasError = false;
        //    $("#loginForm .usernameError").html("Username can't empty.");
        //}
        var emailRegExp = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
        if (!emailRegExp.test(username)) {
            hasError = false;
            $("#loginForm .usernameError").html("Invalid email.");
        }
        if (password == "") {
            hasError = false;
            $("#loginForm .passwordError").html("Password canot be empty!");
        }
        $("#loginForm .input").unbind("focus").focus(function(){
            var n = $(this).attr("name");
            $("#loginForm ." + n + "Error").html("");
        });
        if (hasError) {
            var userType = $("#loginForm input[name='type']:checked").val();
            if (userType == "workers" || userType == "requesters") {
                Ajax.login({
                    data: {
                        userType: userType,
                        username: username,
                        password: password
                    },
                    success: function(o){
                        $("#loginForm .loginError").html(o.info);
                        if (o.status == 1) {
                            var url = "";
                            if (userType == "workers") {
                                url = "worker/index.html";
                                //location.href = "worker/index.html";
                            } else if (userType == "requesters") {
                                url = "requester/index.html";
                                //location.href = "requester/index.html";
                            }
                            $("#loginForm").attr("action", url).unbind("submit");//.submit();
                            $("#loginForm input[type='submit']").click();
                        }
                    }
                });
            }
        }
        return false;
    });
});
