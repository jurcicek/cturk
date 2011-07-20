$(function(){
    var C = {
    
        user: null,
        
        load: function(){
            Ajax.getUserInfo({
                success: function(o){
                    if (o.status == 1) {
                        C.user = o.data;
                        MyInfo.load(C.user);
                        MyStatus.load(C.user);
                        MyPassword.load();
                        MyPendingPayments.load();
                        
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


var MyInfo = {
    load: function(data){
        MyInfo.show(data);
        MyInfo.bindEvent();
    },
    
    show: function(data){
        $("#myInfo .view").each(function(){
            var name = $(this).attr("name");
            $("#myInfo ." + name).html(data.User[name]);
        });
        
        $("#myInfo .edit").each(function(){
            var name = $(this).attr("name");
            if (name == "username") {
                $("#myInfo ." + name + "Edit").html(data.User[name]);
            } else {
                $("#myInfo ." + name + "Edit").val(data.User[name]);
            }
        });
    },
    
    bindEvent: function(){
        /**
         * event when click ”Edit“ button
         */
        $("#myInfo .editMyInfoButton .myInfoEdit").unbind("click").click(function(){
            $("#myInfo .editMyInfoButton").hide();
            $("#myInfo .saveMyInfoButton").show();
            $("#myInfo .view").hide();
            $("#myInfo .edit").show();
        });
        
        /**
         * event when click 'cancle edit' button
         */
        $("#myInfo .saveMyInfoButton .myInfoEditCancel").unbind("click").click(function(){
            $("#myInfo .saveMyInfoButton").hide();
            $("#myInfo .edit").hide();
            $("#myInfo .editMyInfoButton").show();
            $("#myInfo .view").show();
        });
        
        /**
         * event when click 'submit' button
         */
        $("#myInfo .myInfoEditSubmit").unbind("click").click(function(){
            var isEmpty = false;
            $("#myInfo input").each(function(){
                var value = $(this).val();
                var name = $(this).attr("name");
                if (name == "paypalAccount" || name == "firstname" || name == "surname") {
                    if (value == "") {
                        isEmpty = true;
                        $("#myInfo ." + name + "Error").html(name + " can't empty !");
                    } else {
                        $("#myInfo ." + name + "Error").html("");
                    }
                }
            });
            if (!isEmpty) {
                var str = $("#updateUserInfoForm").serialize();
                Ajax.updateUserInfo({
                    data: str,
                    success: function(o){
                        $("#myInfo .usernameError").html(o.info);
                        if (o.status == 1) {
                            window.setTimeout(function(){
                                window.location.reload();
                            }, 3000);
                        }
                    }
                });
            }
        });
    }
};

var MyStatus = {

    load: function(data){
        MyStatus.show(data);
        MyStatus.bindEvent();
    },
    
    /**
     * show user's info
     */
    show: function(data){
        Ajax.getPendingPayments({
            data: {
                userType: "workers"
            },
            success: function(o){
                if (o.status == 1) {
                    var arr = [];
                    for (var i in o.data) {
                        arr.push(o.data[i].currencyCode + '=' + Util.getPrice(o.data[i].pendingPayments));
                    }
                    $("#myStatus .pendingPayments").html(arr.join(", "));
                }
            }
        });
        
        if (data.User.isActive == "1") {
            $("#myStatus .isActive").html("Active");
        } else {
            $("#myStatus .isActive").html("Inactive");
        }
        if (data.User.isEnabled == "1") {
            $("#myStatus .isEnable").html("Enable");
        } else {
            $("#myStatus .isEnable").html("Disable");
        }
        $("#myStatus .acceptanceRatio").html(data.User.acceptanceRatio + '%');
    },
    
    bindEvent: function(){
        $("#myStatus .terminateMyAccountButton").unbind("click").click(function(){
            if (confirm("Are you sure?")) {
                Ajax.terminateAccount({
                    success: function(o){
                        if (o.status == 1) {
                            alert("You have terminated your account. The page will redirect to login page.");
                            Ajax.logout({
                                success: function(){
                                    window.location.href = "../index.html";
                                }
                            });
                        }
                    }
                });
            }
        });
    }
};

var MyPassword = {
    load: function(){
        MyPassword.bindEvent();
    },
    bindEvent: function(){
        $("#changePasswordForm input[name='oldPassword']").unbind("focus").focus(function(){
            $("#changePasswordForm .oldPasswordError").html("");
            return false;
        });
        $("#changePasswordForm input[name='newPassword']").unbind("focus").focus(function(){
            $("#changePasswordForm .newPasswordError").html("");
            return false;
        });
        
        /**
         * event when click 'change password' button
         */
        $("#changePasswordForm").unbind("submit").submit(function(){
            var oldPassword = $("#changePasswordForm .oldPassword").val();
            var newPassword = $("#changePasswordForm .newPassword").val();
            var isEmpty = false;
            $("#changePasswordForm .updatePasswordInfo").html("");
            $("#changePasswordForm .oldPasswordError").html("");
            $("#changePasswordForm .newPasswordError").html("");
            if (oldPassword == "") {
                isEmpty = true;
                $("#changePasswordForm .oldPasswordError").html("Old password cannot be empty!");
            }
            if (newPassword == "") {
                isEmpty = true;
                $("#changePasswordForm .newPasswordError").html("New password cannot be empty!");
            }
            if (!isEmpty) {
                Ajax.updatePassword({
                    data: {
                        oldPassword: oldPassword,
                        newPassword: newPassword
                    },
                    success: function(o){
                        $("#changePasswordForm .updatePasswordInfo").html(o.info);
                        if (o.status == 1) {
                            $("#changePasswordForm .oldPassword").val("");
                            $("#changePasswordForm .newPassword").val("");
                        }
                    }
                });
            }
            return false;
        });
    }
};

var MyPendingPayments = {
    load: function(){
        Ajax.getPendingPaymentsDetail({
            data: {
                userType: "workers"
            },
            success: function(o){
                if (o.status == 1) {
                    MyPendingPayments.show(o.data);
                } else {
                    var html = '';
                    html += '<tr><td colspan="4" class="hitMessage hitWarning">';
                    html += 'There are currently no pending payments for you.';
                    html += '</td></tr>';
                    $("#pendingPayment .pendingPaymentTable tbody").html(html);
                }
            }
        });
    },
    
    show: function(data){
        var html = '';
        for (var i = 0; i < data.length; i++) {
            html += '<tr>';
            html += '<td>' + data[i].User['username'] + '</td>';
            
            //var amount = 0;
            var currencyCode = {};
            for (var j in data[i].Assignments) {
                var c = data[i].Assignments[j].Hit['currencyCode'];
                //if (currencyCode.join(",").indexOf(c) < 0) {
                //    currencyCode.push(c);
                //}
                if (typeof currencyCode[c] == "undefined") {
                    currencyCode[c] = {
                        currencyCode: c,
                        amount: 0
                    };
                }
                currencyCode[c].amount += Math.floor(data[i].Assignments[j].Hit['reward'] * 100);
            }
            //amount = Util.getPrice(amount / 100);
            //html += '<td>' + currencyCode.join(",") + ' ' + amount + '</td>';
            var a = [];
            for (var j in currencyCode) {
                a.push(currencyCode[j].currencyCode + "=" + Util.getPrice(currencyCode[j].amount / 100));
            }
            html += '<td>' + a.join(", ") + '</td>';
            
            var isActive = 0;
            if (data[i].Workerrequest && data[i].Workerrequest['isActive']) {
                isActive = data[i].Workerrequest['isActive'];
            }
            html += '<td>' + isActive + '</td>';
            
            var requesterId = data[i].User['id'];
            var requestDate = '<input type="button" value="Request Payment" onclick="MyPendingPayments.request(\'' + requesterId + '\')" />';
            if (data[i].Workerrequest && data[i].Workerrequest['isActive']) {
                var t = parseFloat(data[i].Workerrequest['createDate']);
                requestDate = Util.getDate(t);
            } else {
                for (var j in currencyCode) {
                    var cc = currencyCode[j].currencyCode;
                    if (typeof Config.minimumPayment != "undefined" && typeof Config.minimumPayment[cc] != "undefined") {
                        if (Config.minimumPayment[cc] > currencyCode[j].amount / 100) {
                            var minAmount = Config.minimumPayment[cc];
                            var t = "Due to the PayPal fees, a worker cannot request payment if the total amount is less than " + Util.getPrice(minAmount) + " " + cc + ".";
                            requestDate = '<input type="button" value="Request Payment" disabled="disabled" />';
                            //requestDate += '&nbsp;&nbsp;<span class="help" title="' + t + '" style="font-weight:bold;" onclick="$(this).parent().append(this.title);$(this).remove();">?</span>&nbsp;&nbsp;';
                            requestDate += '<br/><span class="help">' + t + '"</span>&nbsp;&nbsp;';
                            break;
                        }
                    }
                }
            }
            html += '<td>' + requestDate + '</td>';
            html += '</tr>';
        }
        $("#pendingPayment .pendingPaymentTable tbody").html(html);
    },
    
    /**
     * requestPayment
     * @param {int} requesterId
     */
    request: function(requesterId){
        Ajax.requestPayment({
            data: {
                requesterId: requesterId
            },
            success: function(o){
                alert(o.info);
                if (o.status == 1) {
                    window.location.reload();
                }
            }
        });
    }
};
