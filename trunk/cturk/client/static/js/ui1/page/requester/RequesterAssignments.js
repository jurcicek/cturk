$(function(){
    var C = {
    
        user: null,
        
        load: function(){
            Ajax.getUserInfo({
                success: function(o){
                    if (o.status == 1) {
                        if (o.data.User['isRequester'] == 1) {
                            C.user = o.data;
                            Assignments.load(C.user);
                            
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

var Assignments = {

    user: "",
    data: [],
    order: '',// sorting order
    limit: 10,//items shown in a page
    page: 1,//page number
    count: 0,// total items
    hitGroupPaginator: null,
    
    load: function(user){
        var x = this;
        
        x.user = user;
        if (LocationSearch.has("state")) {
            var assignmentState = LocationSearch.attr("state");
            $("#assignmentStateSelect").val(assignmentState);
        }
        x.getAssignments(false);
        x.bindEvent();
    },
    
    getAssignments: function(isRefresh){
        var x = this;
        x.order = $("#groupSortType").val();
        x.initAssignments();
        if (typeof isRefresh == "undefined" || isRefresh == false) {
            $("#assignmentPaginatorText").html("");
            x.initPaginator();
        }
        var groupId = "null";
        var workerId = "null";
        var assignmentState = $("#assignmentStateSelect").val();
        if (LocationSearch.has("groupId") && LocationSearch.attr("groupId") != "") {
            groupId = LocationSearch.attr("groupId");
        }
        if (LocationSearch.has("workerId") && LocationSearch.attr("workerId") != "") {
            workerId = LocationSearch.attr("workerId");
        }
        
        Ajax.getHITSummary({
            data: {
                groupId: groupId,
                workerId: workerId
            },
            success: function(o){
                x.showHITSummary(o.data, groupId, workerId);
            }
        });
        
        Ajax.getAssignmentList({
            data: {
                userType: "requesters",
                groupId: groupId,
                workerId: workerId,
                assignmentState: assignmentState,
                order: x.order,
                limit: x.limit,
                page: x.page
            },
            success: function(o){
                if (o.status == 1) {
                    x.data = o.data;
                    if (o.data.info == 0) {
                        $("#assignmentPaginatorText").html("0-0 of 0 Results");
                        x.hitGroupPaginator.setOptions({
                            size: 0,
                            currentPage: 0
                        });
                        var html = '';
                        html += '<div class="hitMessage hitWarning">No available assignment.</div>';
                        $("#assignmentList").html(html);
                    } else {
                        x.count = o.info;
                        x.refreshPagination();
                        x.showAssignments(o.data);
                    }
                }
            }
        });
    },
    
    bindEvent: function(){
        var x = this;
        $("#assignmentStateSelect").unbind("change").change(function(){
            var v = $(this).val();
            LocationSearch.attr("state", v);
        });
        
        $("#groupSortButton").unbind("click").click(function(){
            x.page = 1;
            x.getAssignments(false);
        });
    },
    
    initPaginator: function(){
        var x = this;
        x.hitGroupPaginator = new MFPagination({
            id: "assignmentPaginator",
            size: 0,
            itemsPerPage: x.limit,
            numDisplayEntries: 5,
            currentPage: x.page - 1,
            numEdgeEntries: 0,
            onPageChange: function(pageIndex, jq){
                if (pageIndex != x.page - 1) {
                    console.log("MFPagination.onPageChange callback: pageIndex = " + pageIndex);
                    x.page = pageIndex + 1;
                    x.getAssignments(true);
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
        html += start + '-' + end + ' of ' + count + ' Results, ';
        var totalReward = 0;
        for (var i in x.data) {
            totalReward += parseFloat(x.data[i].Hit['reward']);
        }
        html += 'total reward in current page : ' + Util.getPrice(totalReward);
        $("#assignmentPaginatorText").html(html);
        
        x.hitGroupPaginator.setOptions({
            size: count,
            currentPage: x.page - 1
        });
    },
    
    initAssignments: function(){
        $("#assignmentList").html('Loading data...');
    },
    
    showHITSummary: function(data, groupId, workerId){
        if (groupId != "null") {
            if (data.hitCount > 0) {
                var url = "hits.html?groupId=" + groupId;
                var html = '<a href="' + url + '">' + data.Group['name'] + '</a>';
                $("#summaryInfo .groupName").html(html);
            } else {
                $("#summaryInfo .groupName").html("-");
            }
        } else {
            $("#summaryInfo .groupName").html("{All HITS}");
        }
        
        if (workerId != "null") {
            var url = "userinfo.html?userId=" + workerId;
            var html = '<a href="' + url + '">' + workerId + ' (Click here to view user detail)</a>';
            $("#summaryInfo .username").html(html);
            
        } else {
            $("#summaryInfo .username").html("{All User}");
        }
        
        $("#summaryInfo .completedHits").html(data.CompletedHit.length);
        $("#summaryInfo .submittedAssignments").html(data.SubmittedAssignment.length);
        $("#summaryInfo .approvedAssignments").html(data.ApprovedAssignment.length);
        $("#summaryInfo .rejectedAssignments").html(data.RejectedAssignment.length);
        $("#summaryInfo .closedAssignments").html(data.ClosedAssignment.length);
    },
    
    //duplicateHITGroup: function(groupId){
    //    $(".hitMessage").html("").hide();
    //    var x = this;
    //    Ajax.duplicateHITGroup({
    //        data: {
    //            groupId: groupId
    //        },
    //        success: function(o){
    //            if (o.status == 0) {
    //                $("#hitErrorMessage").html(o.info).show();
    //                
    //            } else {
    //                $("#hitSuccessMessage").html(o.info).show();
    //                x.getAssignments(true);
    //            }
    //        }
    //    })
    //},
    
    viewAssignmentResult: function(assignmentIndex){
        var o = Assignments.data;
        var html = o[assignmentIndex].Assignment['data'];
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
                    Assignments.load();
                }
            }
        });
        //}
    },
    
    approveSelectedAssignment: function(){
        $(".hitMessage").html("").hide();
        var v = $("#assignmentForm").serialize();
        if (v == "") {
            alert("Please select assignment!");
            
        } else {
            //var message = prompt("Approve SELECTED assignment, \nyou can leave a message here:");
            //if (message != null) {
            Ajax.approveAssignment({
                data: v,//+ "&message=" + message,
                success: function(o){
                    if (o.status == 0) {
                        $("#hitErrorMessage").html(o.info).show();
                        
                    } else {
                        $("#hitSuccessMessage").html(o.info).show();
                        Assignments.load();
                    }
                }
            });
            //}
        }
    },
    
    rejectAssignment: function(assignmentId){
        $(".hitMessage").html("").hide();
        var message = prompt("Reject SELECTED assignment, \nyou can leave a message here:");
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
                        Assignments.load();
                    }
                }
            });
        }
    },
    
    rejectSelectedAssignment: function(){
        $(".hitMessage").html("").hide();
        var v = $("#assignmentForm").serialize();
        if (v == "") {
            alert("Please select assignment!");
            
        } else {
            var message = prompt("Reject assignment, \nyou can leave a message here:");
            if (message != null) {
                Ajax.rejectAssignment({
                    data: v + "&message=" + message,
                    success: function(o){
                        if (o.status == 0) {
                            $("#hitErrorMessage").html(o.info).show();
                            
                        } else {
                            $("#hitSuccessMessage").html(o.info).show();
                            Assignments.load();
                        }
                    }
                });
            }
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
                //Assignments.payAssignment(assignmentId);
            }
        }
    },
    
    paySelectedAssignment: function(){
        var x = this;
        var v = $("#assignmentForm").serialize();
        if (v == "") {
            alert("Please select assignment!");
            
        } else {
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
                    var html = '<input type="hidden" name="paypalSenderEmail" value="' + paypalSenderEmail + '" />';
                    $("#extraData").html(html);
                    $("#assignmentForm").attr("method", "post").attr("action", url).submit();
                    
                } else {
                    alert("Invalid email.");
                    //Assignments.paySelectedAssignment();
                }
            }
        }
    },
    
    toggleCheckbox: function(){
        var isChecked = $("#toggleCheckbox").is(":checked");
        $("#assignmentList input[name='assignmentId[]']").attr("checked", isChecked);
    },
    
    showAssignments: function(o){
        var assignmentLength = o.length;
        var assignmentState = $("#assignmentStateSelect").val();
        var html = '';
        html += '<table class="groupTable groupDataTable" width="100%" border="0" cellpadding="0" cellspacing="0">';
        html += '    <tr class="tableHead">';
        //if (assignmentState == "Submitted" || assignmentState == "Approved") {
        html += '    <td width="2%" style="padding:0;">&nbsp;</td>';
        //}
        html += '        <td width="11%">';
        html += '            <span class="textTitle">Accept Date</span>';
        html += '        </td>';
        html += '        <td width="11%">';
        html += '            <span class="textTitle">Submit Date</span>';
        html += '        </td>';
        html += '        <td width="11%">';
        html += '            <span class="textTitle">Finish Date</span>';
        html += '        </td>';
        html += '        <td width="11%">';
        html += '            <span class="textTitle">Expire Date</span>';
        html += '        </td>';
        html += '        <td width="11%">';
        html += '            <span class="textTitle">Auto Approve Date</span>';
        html += '        </td>';
        html += '        <td width="8%">';
        html += '            <span class="textTitle">State</span>';
        html += '        </td>';
        html += '        <td width="8%">';
        html += '            <span class="textTitle">Reward</span>';
        html += '        </td>';
        html += '        <td width="20%">';
        html += '            <span class="textTitle">Action</span>';
        html += '        </td>';
        html += '    </tr>';
        if (assignmentLength == 0) {
            html += '    <tr class="tableBody">';
            //if (assignmentState == "Submitted" || assignmentState == "Approved") {
            html += '    <td style="padding:0;">&nbsp;</td>';
            //}
            html += '        <td colspan="8" class="hitWarning hitMessage">No Assignment Data.</td>';
            html += '    </tr>';
            
        } else {
            for (var i = 0; i < assignmentLength; i++) {
                var data = o[i];
                var assignmentId = data.Assignment['id'];
                var acceptDate = Util.getDate(data.Assignment['acceptDate']);
                var submitDate = "-";
                data.Assignment['submitDate'] && (submitDate = Util.getDate(data.Assignment['submitDate']));
                var finishDate = "-";
                data.Assignment['finishDate'] && (finishDate = Util.getDate(data.Assignment['finishDate']));
                var expireDate = Util.getDate(data.Assignment['expireDate']);
                var autoApproveDate = Util.getDate(parseFloat(data.Assignment['acceptDate']) + parseFloat(data.Hit['autoApprovalTime']) * 1000);
                var assignmentStateI = data.Assignment['state'];
                var reward = data.Hit['currencyCode'] + ' ' + Util.getPrice(data.Hit['reward']);
                
                var actionHtml = '';
                var assignmentLink = "hitdetail.html?hitId=" + data.Hit['id'];
                actionHtml += '<input type="button" class="fnButton" value="Details" onclick="window.location.href=\''+assignmentLink+'\'" /> ';
                if (data.Assignment['data'] != null) {
                    var fnViewResult = "Assignments.viewAssignmentResult('" + i + "')";
                    actionHtml += '<input type="button" class="fnButton" value="Results" onclick="' + fnViewResult + '" /> ';
                }
                
                if (assignmentStateI == "Submitted") {
                    var fnApprove = "Assignments.approveAssignment('" + assignmentId + "')";
                    var fnReject = "Assignments.rejectAssignment('" + assignmentId + "')";
                    actionHtml += '<input type="button" class="fnButton" value="Approve" onclick="' + fnApprove + '"/> ';
                    actionHtml += '<input type="button" class="fnButton" value="Reject" onclick="' + fnReject + '"/> ';
                    
                } else if (assignmentStateI == "Approved") {
                    var fnPay = "Assignments.payAssignment('" + assignmentId + "')";
                    actionHtml += '<input type="button" class="fnButton" value="Pay" onclick="' + fnPay + '"/> ';
                    
                }
                
                var styleString = "";
                if ((i + 1) % 2 == 0) {
                    styleString = "background-color:#fff;";
                }
                html += '    <tr class="tableBody" style="' + styleString + '">';
                if (assignmentStateI == "Submitted" || assignmentStateI == "Approved") {
                    html += '    <td style="padding:0 5px; text-align:center;"><input type="checkbox" name="assignmentId[]" value="' + assignmentId + '" /></td>';
                } else {
                    html += '    <td>&nbsp;</td>';
                }
                html += '        <td>' + acceptDate + '</td>';
                html += '        <td>' + submitDate + '</td>';
                html += '        <td>' + finishDate + '</td>';
                html += '        <td>' + expireDate + '</td>';
                html += '        <td>' + autoApproveDate + '</td>';
                html += '        <td>' + assignmentStateI + ' </td>';
                html += '        <td>' + reward + ' </td>';
                html += '        <td>' + actionHtml + '</td>';
                html += '    </tr>';
            }
            
            html += '    <tr class="tableHead">';
            if (assignmentState == "Submitted" || assignmentState == "Approved") {
                html += '    <td style="padding:0 5px; text-align:center;"><input id="toggleCheckbox" type="checkbox" name="" value="" onclick="Assignments.toggleCheckbox()" /></td>';
            } else {
                html += '    <td>&nbsp;</td>';
            }
            
            if (assignmentState == "Submitted") {
                html += '<td colspan="8">';
                html += '<input type="button" value="Approve Selected" class="fnButton" onclick="Assignments.approveSelectedAssignment();" /> ';
                html += '<input type="button" value="Reject Selected" class="fnButton" onclick="Assignments.rejectSelectedAssignment();" />';
                html += '</td>';
                
            } else if (assignmentState == "Approved") {
                html += '<td colspan="8">';
                html += '<input type="button" value="Pay Selected" class="fnButton" onclick="Assignments.paySelectedAssignment();" />';
                html += '</td>';
                
            } else {
                html += '        <td colspan="8">' + '&nbsp;' + '</td>';
            }
            html += '    </tr>';
            html += '</table>';
        }
        
        $("#assignmentList").html(html);
    }
    
};
