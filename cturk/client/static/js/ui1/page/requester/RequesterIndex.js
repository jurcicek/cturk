$(function(){
    var C = {
    
        user: null,
        
        load: function(){
            Ajax.getUserInfo({
                success: function(o){
                    if (o.status == 1) {
                        if (o.data.User['isRequester'] == 1) {
                            C.user = o.data;
                            MyInfo.load(C.user);
                            MyStatus.load(C.user);
                            MyPassword.load();
                            RequestedPayments.load(C.user);
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
         * event when click 'submit edit' button
         */
        $("#myInfo .myInfoEditSubmit").unbind("click").click(function(){
            var isEmpty = false;
            $("#myInfo input").each(function(){
                var value = $(this).val();
                var name = $(this).attr("name");
                if (name == "paypalAccount" || name == "firstname" || name == "surname") {
                    if (value == "") {
                        isEmpty = true;
                        $("#myInfo ." + name + "Error").html(name + " cannot be empty!");
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
                userType: "requesters"
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

var RequestedPayments = {

    user: "",
    data: null,
    order: '',// sorting order
    limit: 10,//items show in a page
    page: 1,// number of page
    count: 0,// total items
    paginator: null,
    
    load: function(user){
        var x = this;
        
        x.user = user;
        x.initPaginator();
        
        Ajax.getPendingPaymentsDetail({
            data: {
                userType: "requesters"
            },
            success: function(o){
                if (o.status == 1) {
                    x.data = o.data;
                    x.count = x.data.length;
                    x.refreshPagination();
                    x.show();
                    
                } else {
                    $("#reqPaymentPaginatorText").html("0-0 of 0 Results");
                    var html = '';
                    html += '<tr><td colspan="8" class="hitMessage hitWarning">';
                    html += 'There are currently no requested payments for you.';
                    html += '</td></tr>';
                    $("#pendingPayment .pendingPaymentTable tbody").html(html);
                }
            }
        });
    },
    
    initPaginator: function(){
        var x = this;
        x.paginator = new MFPagination({
            id: "reqPaymentPaginator",
            size: 0,
            itemsPerPage: x.limit,
            numDisplayEntries: 5,
            currentPage: x.page - 1,
            numEdgeEntries: 0,
            onPageChange: function(pageIndex, jq){
                if (pageIndex != x.page - 1) {
                    console.log("MFPagination.onPageChange callback: pageIndex = " + pageIndex);
                    x.page = pageIndex + 1;
                    x.show();
                }
            }
        });
    },
    
    refreshPagination: function(){
        var x = this;
        var start = x.limit * (x.page - 1) + 1;
        var end = (x.limit * x.page < x.count) ? x.limit * x.page : x.count;
        var count = x.count;
        if (count == 0) {
            start = 0;
        }
        var html = '';
        html += start + '-' + end + ' of ' + count + ' Results';
        $("#reqPaymentPaginatorText").html(html);
        
        x.paginator.setOptions({
            size: count,
            currentPage: x.page - 1
        });
    },
    
    show: function(){
        var x = this;
        var data = x.data;
        var html = '';
        var start = x.limit * (x.page - 1);
        var end = (x.limit * x.page < x.count) ? x.limit * x.page : x.count;
        for (var i = start; i < end; i++) {
            var currencyCode = data[i].Assignments['currencyCode'];
            var amount = Util.getPrice(data[i].Assignments['pendingPayments']);
            
            html += '<tr>';
            html += '<td><input type="checkbox" name="reqPayments[]" value="' + i + '" /></td>';
            var userInfoUrl = 'userinfo.html?userId=' + data[i].Worker['id'];
            html += '<td><a href="' + userInfoUrl + '">' + data[i].Worker['username'] + '</a></td>';
            html += '<td>' + data[i].Worker['firstname'] + '</td>';
            html += '<td>' + data[i].Worker['surname'] + '</td>';
            html += '<td>' + currencyCode + '=' + amount + '</td>';
            
            var isActive = 0;
            if (data[i].Workerrequest && data[i].Workerrequest['isActive']) {
                isActive = data[i].Workerrequest['isActive'];
            }
            html += '<td>' + isActive + '</td>';
            
            var requestDate = '-';
            if (data[i].Workerrequest && data[i].Workerrequest['isActive']) {
                var t = parseFloat(data[i].Workerrequest['createDate']);
                requestDate = Util.getDate(t);
            }
            html += '<td>' + requestDate + '</td>';
            html += '<td>';
            html += '    <input type="button" value="Pay" class="fnButton" onclick="RequestedPayments.pay(\'' + i + '\')" />';
            html += '    <input type="button" value="Reject payment" class="fnButton" onclick="RequestedPayments.rejectPayment(\'' + i + '\')" />';
            html += '</td>';
            html += '</tr>';
        }
        if (data.length > 0) {
            html += '<tr>';
            html += '<td><input id="toggleReqPaymentsCheckbox" type="checkbox" name="" value="" onclick="RequestedPayments.toggleCheckbox();" /></td>';
            html += '<td colspan="7"><input type="button" onclick="RequestedPayments.paySelected();" class="fnButton" value="Pay Selected"></td>';
            html += '</tr>';
        }
        $("#pendingPayment .pendingPaymentTable tbody").html(html);
    },
    
    toggleCheckbox: function(){
        var isChecked = $("#toggleReqPaymentsCheckbox").is(":checked");
        $("#pendingPayment input[name='reqPayments[]']").attr("checked", isChecked);
    },
    
    paySelected: function(){
        var x = this;
        var reqArr = [];
        $("#pendingPayment input[name='reqPayments[]']:checked").each(function(){
            var v = $(this).val();
            reqArr.push(v);
        });
        if (reqArr.length == 0) {
            alert("Please select payments!");
            
        } else {
            var assignArr = [];
            for (var i in reqArr) {
                var key = reqArr[i];
                var as = x.data[key].Assignments['AssignmentIds'];
                var asLength = as.length;
                for (var j = 0; j < asLength; j++) {
                    assignArr.push(as[j]);
                }
            }
            
            var emailRegExp = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
            var userEmail = x.user.User['paypalAccount'];
            var text = "";
            //text += "Pay assignment, please fill in your paypal email:";
            text += "Make the payment with my PayPal account: " + userEmail + ".\n";
            text += "Or input another PayPal account to make the payment:";
            //var paypalSenderEmail = prompt(text);
            var paypalSenderEmail = "";
            if (paypalSenderEmail != null) {
                paypalSenderEmail = $.trim(paypalSenderEmail);
                if (paypalSenderEmail == "") {
                    paypalSenderEmail = userEmail;
                }
                if (emailRegExp.test(paypalSenderEmail)) {
                    var url = Config.ajaxUrlPrefix + "/requesters/payAssignment";
                    var html = '';
                    html += '<input type="text" name="paypalSenderEmail" value="' + paypalSenderEmail + '" />';
                    var assignmentLength = assignArr.length;
                    for (var i = 0; i < assignmentLength; i++) {
                        var assignmentId = assignArr[i];
                        html += '<input type="text" name="assignmentId[]" value="' + assignmentId + '" />';
                    }
                    $("#paypalForm").attr("method", "post").attr("action", url).html(html).submit();
                } else {
                    alert("Invalid email.");
                    //RequestedPayments.pay(dataIndex);
                }
            }
        }
    },
    
    pay: function(dataIndex){
        var x = this;
        var data = RequestedPayments.data;
        var emailRegExp = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
        var userEmail = x.user.User['paypalAccount'];
        var text = "";
        //text += "Pay assignment, please fill in your paypal email:";
        text += "Make the payment with my PayPal account: " + userEmail + ".\n";
        text += "Or input another PayPal account to make the payment:";
        //var paypalSenderEmail = prompt(text);
        var paypalSenderEmail = "";
        if (paypalSenderEmail != null) {
            paypalSenderEmail = $.trim(paypalSenderEmail);
            if (paypalSenderEmail == "") {
                paypalSenderEmail = userEmail;
            }
            if (emailRegExp.test(paypalSenderEmail)) {
                var url = Config.ajaxUrlPrefix + "/requesters/payAssignment";
                var html = '';
                html += '<input type="text" name="paypalSenderEmail" value="' + paypalSenderEmail + '" />';
                var assignmentLength = data[dataIndex].Assignments['AssignmentIds'].length;
                for (var i = 0; i < assignmentLength; i++) {
                    var assignmentId = data[dataIndex].Assignments['AssignmentIds'][i];
                    html += '<input type="text" name="assignmentId[]" value="' + assignmentId + '" />';
                }
                $("#paypalForm").attr("method", "post").attr("action", url).html(html).submit();
                
            } else {
                alert("Invalid email.");
                //RequestedPayments.pay(dataIndex);
            }
        }
    },
    
    rejectPayment: function(dataIndex){
        var x = this;
        var data = RequestedPayments.data;
        var workerId = x.data[dataIndex].Worker['id'];
        Ajax.rejectPayment({
            data: {
                workerId: workerId
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
