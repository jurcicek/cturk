$(function(){
    var C = {
    
        user: null,
        
        load: function(){
            Ajax.getUserInfo({
                success: function(o){
                    if (o.status == 1) {
                        if (o.data.User['isRequester'] == 1) {
                            C.user = o.data;
                            HITs.load(C.user);
                            
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

    user: "",
    data: null,
    
    load: function(user){
        var x = this;
        
        x.user = user;
        HITs.getHITs();
    },
    
    getHITs: function(){
        if (!LocationSearch.has("hitId")) {
            var html = 'Invalid HIT id.';
            $("#hitErrorMessage").html(html).show();
            return;
        }
        var hitId = LocationSearch.attr("hitId");
        Ajax.getHITInfo({
            data: {
                hitId: hitId
            },
            success: function(o){
                if (o.status == 0) {
                    var html = 'There are no available HITs at this moment.';
                    $("#hitWarningMessage").html(html).show();
                } else {
                    HITs.data = o.data;
                    HITs.showHITData(o.data);
                    HITs.showAssignmentData(o.data);
                }
            }
        });
    },
    
    expireHIT: function(hitId){
        $("#hitErrorMessage").hide();
        $("#returnHitButton").attr("disabled", true);
        Ajax.expireHIT({
            data: {
                hitId: hitId
            },
            success: function(o){
                if (o.status == 0) {
                    $("#hitErrorMessage").html(o.info).show();
                    $("#returnHitButton").attr("disabled", false);
                } else {
                    $("#hitSuccessMessage").html(o.info).show();
                }
            }
        });
    },
    
    showHITData: function(o){
        var html = '';
        var tip = {
            requester: 'Requester that submitted this HIT.',
            expireDate: 'The date when these HITs will expire and will no longer be available.',
            reward: 'The amount of money you can earn for completing this HIT.',
            assignmentTime: 'The amount of time you have to complete the HIT from the moment you accept it.',
            numAvailableHit: 'The number of HITs in this group.',
            duration: "The amount of time remaining for you to complete this HIT.",
            description: 'A general description of the HIT'
        };
        var hitName = o.Hit['name'];
        var requesterName = o.Requester['firstname'] + ' ' + o.Requester['surname'];
        var publishDate = Util.getDate(o.Hit['publishDate']);
        var expireDate = Util.getDate(o.Hit['expireDate']);
        var reward = o.Hit['currencyCode'] + ' ' + Util.getPrice(o.Hit['reward']);
        var timeAllotted = Util.getTime(o.Hit['assignmentTime']);
        var autoApproveTime = Util.getTime(o.Hit['autoApprovalTime']);
        var assignmentAmount = o.Assignment.length;
        
        var hitState = o.Hit['state'];
        var hitUrl = o.Hit['url'];
        var description = o.Hit['description'];
        
        var hitId = o.Hit['id'];
        
        var hitListUrl = "hits.html?groupId=" + o.Hit['group_id'];
        //html += '<a href="' + hitListUrl + '">&lt;&lt; Return to HITs List</a>';
        html += '<table id="hitDataTable" class="groupTable" width="100%" border="0" cellpadding="0" cellspacing="0">';
        html += '    <tr class="tableHead">';
        html += '        <td style="width:78%;">';
        html += '            <span class="hitName">' + hitName + '</span>';
        html += '        </td>';
        html += '        <td style="text-align:right;">';
        var fnExpireHit = "HITs.expireHIT('" + o.Hit['id'] + "')";
        html += '            <input id="expireHitButton" type="button" value="Expire HIT" onclick="' + fnExpireHit + '" style="float:right;" />';
        html += '        </td>';
        html += '    </tr>';
        html += '    <tr class="tableBody">';
        html += '        <td colspan="2">';
        html += '            <table class="hitDataDetail groupDataTable" width="100%" border="0" cellpadding="0" cellspacing="0">';
        html += '                <tr>';
        html += '                    <td>';
        html += '                        <span class="textTitle" title="' + tip['requester'] + '">Requester: </span>' + requesterName;
        html += '                    </td>';
        html += '                    <td>';
        html += '                        <span class="textTitle">HIT Publish Date: </span>' + publishDate;
        html += '                    </td>';
        html += '                    <td>';
        html += '                        <span class="textTitle" title="' + tip['expireDate'] + '">HIT Expiration Date: </span>' + expireDate;
        html += '                    </td>';
        html += '                </tr>';
        html += '                <tr>';
        html += '                    <td>';
        html += '                        <span class="textTitle" title="' + tip['reward'] + '">Reward: </span>' + reward;
        html += '                    </td>';
        html += '                    <td>';
        html += '                        <span class="textTitle">Auto Approve Time: </span>' + autoApproveTime;
        html += '                    </td>';
        html += '                    <td>';
        html += '                        <span class="textTitle">Assignments Amount: </span>' + assignmentAmount;
        html += '                    </td>';
        html += '                </tr>';
        html += '                <tr>';
        html += '                    <td>';
        html += '                        <span class="textTitle">HIT state: </span>' + hitState;
        html += '                    </td>';
        html += '                    <td>';
        html += '                        <span class="textTitle">HIT URL: </span> <INPUT TYPE="BUTTON" VALUE="CLICK HERE TO VIEW" ONCLICK="window.location.href=\''+ hitUrl + '\'">';
        html += '                    </td>';
        html += '                    <td>&nbsp;</td>';
        html += '                </tr>';
        html += '                <tr>';
        html += '                    <td colspan="3">';
        html += '                        <span class="textTitle" title="' + tip['description'] + '">Description: </span>' + description;
        html += '                    </td>';
        html += '                </tr>';
        html += '            </table>';
        html += '        </td>';
        html += '    </tr>';
        html += '</table>';
        $("#hitData").html(html);
    },
    
    viewAssignmentResult: function(assignmentIndex){
        var o = HITs.data;
        var html = o.Assignment[assignmentIndex]['data'];
        $("#assignmentResultDialog").text(html);
        $("#assignmentResultDialog").dialog({
            title: "Assignment Result",
            modal: true
        });
        $("#assignmentResultDialog").dialog('open');
    },
    
    approveAssignment: function(assignmentId){
        $(".hitMessage").html("").hide();
        //var message = prompt("Approve assignment, \nyou can leave a message here:");
        //if (message != null) {
        Ajax.approveAssignment({
            data: {
                assignmentId: assignmentId
                //,message: message
            },
            success: function(o){
                if (o.status == 0) {
                    $("#hitErrorMessage").html(o.info).show();
                    
                } else {
                    $("#hitSuccessMessage").html(o.info).show();
                    HITs.load();
                }
            }
        })
        //}
    },
    
    rejectAssignment: function(assignmentId){
        $(".hitMessage").html("").hide();
        var message = prompt("Reject assignment, \nyou can leave a message here:");
        if (message != null) {
            Ajax.rejectAssignment({
                data: {
                    assignmentId: assignmentId,
                    message: message
                },
                success: function(o){
                    if (o.status == 0) {
                        $("#hitErrorMessage").html(o.info).show();
                        
                    } else {
                        $("#hitSuccessMessage").html(o.info).show();
                        HITs.load();
                    }
                }
            })
        }
    },
    
    payAssignment: function(assignmentId){
        var x = this;
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
                html += '<input type="text" name="assignmentId[]" value="' + assignmentId + '" />';
                $("#paypalForm").attr("method", "post").attr("action", url).html(html).submit();
                
            } else {
                alert("Invalid email.");
                //HITs.payAssignment(assignmentId);
            }
        }
    },
    
    showAssignmentData: function(o){
        var assignmentLength = o.Assignment.length;
        var workerIdArray = [];
        var html = '';
        html += '<table class="groupTable groupDataTable" width="100%" border="0" cellpadding="0" cellspacing="0">';
        html += '    <tr class="tableHead">';
        html += '        <td width="10%">';
        html += '            <span class="textTitle">Worker Username</span>';
        html += '        </td>';
        html += '        <td width="10%">';
        html += '            <span class="textTitle">Worker Name</span>';
        html += '        </td>';
        html += '        <td width="10%">';
        html += '            <span class="textTitle">Accept Date</span>';
        html += '        </td>';
        html += '        <td width="10%">';
        html += '            <span class="textTitle">Submit Date</span>';
        html += '        </td>';
        html += '        <td width="10%">';
        html += '            <span class="textTitle">Finish Date</span>';
        html += '        </td>';
        html += '        <td width="10%">';
        html += '            <span class="textTitle">Expire Date</span>';
        html += '        </td>';
        html += '        <td width="10%">';
        html += '            <span class="textTitle">Auto Approve Date</span>';
        html += '        </td>';
        html += '        <td width="8%">';
        html += '            <span class="textTitle">State</span>';
        html += '        </td>';
        html += '        <td width="10%">';
        html += '            <span class="textTitle">Action</span>';
        html += '        </td>';
        html += '    </tr>';
        if (assignmentLength == 0) {
            html += '    <tr class="tableBody">';
            html += '        <td colspan="9" class="hitWarning hitMessage">No Assignment Data.</td>';
            html += '    </tr>';
            
        } else {
            for (var i = 0; i < assignmentLength; i++) {
                var assignment = o.Assignment[i];
                var workerId = assignment['worker_id'];
                var assignmentId = assignment['id'];
                var acceptDate = Util.getDate(assignment['acceptDate']);
                var submitDate = "-";
                assignment['submitDate'] && (submitDate = Util.getDate(assignment['submitDate']));
                var finishDate = "-";
                assignment['finishDate'] && (finishDate = Util.getDate(assignment['finishDate']));
                var expireDate = Util.getDate(assignment['expireDate']);
                var autoApproveDate = Util.getDate(parseFloat(assignment['acceptDate']) + parseFloat(o.Hit['autoApprovalTime']) * 1000);
                var assignmentState = assignment.state;
                
                var actionHtml = '';
                if (assignment['data'] != null) {
                    var fnViewResult = "HITs.viewAssignmentResult('" + i + "')";
                    actionHtml += '<input type="button" class="fnButton" value="Results" onclick="' + fnViewResult + '" />';
                }
                
                if ($.inArray(workerId, workerIdArray) == -1) {
                    workerIdArray.push(workerId);
                }
                
                if (assignmentState == "Submitted") {
                    var fnApprove = "HITs.approveAssignment('" + assignmentId + "')";
                    var fnReject = "HITs.rejectAssignment('" + assignmentId + "')";
                    actionHtml += '<input type="button" class="fnButton" value="Approve" onclick="' + fnApprove + '" />';
                    actionHtml += '<input type="button" class="fnButton" value="Reject" onclick="' + fnReject + '"/>';
                    
                } else if (assignmentState == "Approved") {
                    var fnPay = "HITs.payAssignment('" + assignmentId + "')";
                    actionHtml += '<input type="button" class="fnButton" value="Pay" onclick="' + fnPay + '" />';
                    
                }
                
                var styleString = "";
                if ((i + 1) % 2 == 0) {
                    styleString = "background-color:#fff;";
                }
                html += '    <tr class="tableBody" style="' + styleString + '">';
                html += '        <td class="workerId' + workerId + 'Username">' + '' + '</td>';
                html += '        <td class="workerId' + workerId + 'Name">' + '' + '</td>';
                html += '        <td>' + acceptDate + '</td>';
                html += '        <td>' + submitDate + '</td>';
                html += '        <td>' + finishDate + '</td>';
                html += '        <td>' + expireDate + '</td>';
                html += '        <td>' + autoApproveDate + '</td>';
                html += '        <td>' + assignmentState + ' </td>';
                html += '        <td>' + actionHtml + '</td>';
                html += '    </tr>';
            }
        }
        html += '</table>';
        $("#assignmentData").html(html);
        
        for (var i in workerIdArray) {
            Ajax.getUserInfo({
                data: {
                    userId: workerIdArray[i]
                },
                success: function(o){
                    if (o.status == 1) {
                        var data = o.data;
                        var userId = data.User['id'];
                        var username = data.User['username'];
                        var name = data.User['firstname'] + ' ' + data.User['surname'];
                        var usernameHtml = '<a href="userinfo.html?userId=' + userId + '">' + username + '</a>';
                        $("#assignmentData .workerId" + userId + "Username").html(usernameHtml);
                        $("#assignmentData .workerId" + userId + "Name").html(name);
                    }
                }
            });
        }
    }
};
