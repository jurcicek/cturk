$(function(){
    $(".getPasswordForm input[type='submit']").unbind("click").click(function(){
        $(".resetPasswordError").html("");
        var username = $(".getPasswordForm input[name='username']").val();
        if (check(username)) {
            Ajax.getResetPassword({
                data: {
                    username: username
                },
                success: function(o){
                    //   console.log(o);
                    $(".resetPasswordError").html(o.info);
                }
            });
        }
    });
    check = function(str){
        var emailRegExp = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
        str = $.trim(str);
        if (!emailRegExp.test(str)) {
            $(".resetPasswordError").html("Invalid email.");
            return false;
        } else {
            return true;
        }
    }
    
});
