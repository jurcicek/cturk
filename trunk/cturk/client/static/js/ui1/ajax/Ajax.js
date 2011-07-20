var Ajax = {
    /**
     * user login
     */
    login: function(params){
        if (typeof params == "undefined" || typeof params.data == "undefined") {
            return;
        }
        var url = Config.ajaxUrlPrefix + "/" + params.data.userType + "/login";
        $.ajax({
            url: url,
            type: "POST",
            data: {
                "username": params.data.username,
                "password": params.data.password
            },
            dataType: "json",
            success: function(data, textStatus){
                if (typeof params.success == "function") {
                    params.success(data, textStatus);
                }
            }
        });
    },
    
    /**
     * logout
     * @param {Object} params
     */
    logout: function(params){
        if (typeof params == "undefined") {
            params = {};
        }
        var url = Config.ajaxUrlPrefix + "/users/logout";
        $.ajax({
            url: url,
            type: "POST",
            dataType: "json",
            success: function(data, textStatus){
                if (typeof params.success == "function") {
                    params.success(data, textStatus);
                }
            }
        });
    },
    
    register: function(params){
        if (typeof params == "undefined" || typeof params.data == "undefined") {
            return;
        }
        var url = Config.ajaxUrlPrefix + "/users/register";
        $.ajax({
            url: url,
            type: "POST",
            data: params.data,
            dataType: "json",
            success: function(data, textStatus){
                if (typeof params.success == "function") {
                    params.success(data, textStatus);
                }
            }
        });
    },
    
    getResetPassword: function(params){
        if (typeof params == "undefined" || typeof params.data == "undefined") {
            return;
        }
        var url = Config.ajaxUrlPrefix + "/users/getResetPassword";
        $.ajax({
            url: url,
            type: "POST",
            data: params.data,
            dataType: "json",
            success: function(data, textStatus){
                if (typeof params.success == "function") {
                    params.success(data, textStatus);
                }
            }
        });
    },
    
    resetPassword: function(params){
        if (typeof params == "undefined" || typeof params.data == "undefined") {
            return;
        }
        var url = Config.ajaxUrlPrefix + "/users/resetPassword";
        $.ajax({
            url: url,
            type: "POST",
            data: params.data,
            dataType: "json",
            success: function(data, textStatus){
                if (typeof params.success == "function") {
                    params.success(data, textStatus);
                }
            }
        });
    },
    
    /**
     * change password
     * @param {Object} params
     */
    updatePassword: function(params){
        if (typeof params == "undefined" || typeof params.data == "undefined") {
            return;
        }
        var url = Config.ajaxUrlPrefix + "/users/updatePassword";
        $.ajax({
            url: url,
            type: "POST",
            data: params.data,
            dataType: "json",
            success: function(data, textStatus){
                if (typeof params.success == "function") {
                    params.success(data, textStatus);
                }
            }
        });
    },
    
    /**
     * get user info
     * @param {Object} params
     */
    getUserInfo: function(params){
        if (typeof params == "undefined") {
            params = {};
        }
        var url = Config.ajaxUrlPrefix + "/users/info";
        if (typeof params.data != "undefined" && typeof params.data.userId != "undefined") {
            url = Config.ajaxUrlPrefix + "/users/info/" + params.data.userId;
        }
        $.ajax({
            url: url,
            type: "GET",
            dataType: "json",
            success: function(data, textStatus){
                if (typeof params.success == "function") {
                    params.success(data, textStatus);
                }
            }
        });
    },
    
    /**
     * update user info
     * @param {Object} params
     */
    updateUserInfo: function(params){
        if (typeof params == "undefined" || typeof params.data == "undefined") {
            return;
        }
        var url = Config.ajaxUrlPrefix + "/users/updateInfo";
        $.ajax({
            url: url,
            type: "POST",
            data: params.data,
            dataType: "json",
            success: function(data, textStatus){
                if (typeof params.success == "function") {
                    params.success(data, textStatus);
                }
            }
        });
    },
    
    /**
     * get PendingPayments
     * @param {Object} params
     */
    getPendingPayments: function(params){
        if (typeof params == "undefined") {
            return;
        }
        var url = Config.ajaxUrlPrefix + "/" + params.data.userType + "/pendingPayments";
        $.ajax({
            url: url,
            type: "GET",
            dataType: "json",
            success: function(data, textStatus){
                if (typeof params.success == "function") {
                    params.success(data, textStatus);
                }
            }
        });
    },
    
    /**
     * terminate account
     */
    terminateAccount: function(params){
        if (typeof params == "undefined") {
            params = {};
        }
        var url = Config.ajaxUrlPrefix + "/workers/terminateAccount";
        $.ajax({
            url: url,
            type: "POST",
            dataType: "json",
            success: function(data, textStatus){
                if (typeof params.success == "function") {
                    params.success(data, textStatus);
                }
            }
        });
    },
    
    /**
     * get current user's penddingPayments details
     */
    getPendingPaymentsDetail: function(params){
        if (typeof params == "undefined") {
            return;
        }
        var url = Config.ajaxUrlPrefix + "/" + params.data.userType + "/pendingPaymentsDetail";
        $.ajax({
            url: url,
            type: "GET",
            dataType: "json",
            success: function(data, textStatus){
                if (typeof params.success == "function") {
                    params.success(data, textStatus);
                }
            }
        });
    },
    
    /**
     * A worker request a payment
     */
    requestPayment: function(params){
        if (typeof params == "undefined") {
            return;
        }
        var url = Config.ajaxUrlPrefix + "/workers/requestPayment";
        $.ajax({
            url: url,
            type: "POST",
            data: {
                requesterId: params.data.requesterId
            },
            dataType: "json",
            success: function(data, textStatus){
                if (typeof params.success == "function") {
                    params.success(data, textStatus);
                }
            }
        });
    },
    
    /**
     * get available HIT group id's list (state=Active && numAvailableHit>0)
     * for worker users
     */
    getAvailableHitGroupList: function(params){
        if (typeof params == "undefined" || typeof params.data == "undefined") {
            return;
        }
        var order = params.data.order;
        var limit = params.data.limit;
        var page = params.data.page;
        var url = Config.ajaxUrlPrefix + "/groups/availableHitGroupList/" + order + "/" + limit + "/" + page;
        $.ajax({
            url: url,
            type: "GET",
            dataType: "json",
            success: function(data, textStatus){
                if (typeof params.success == "function") {
                    params.success(data, textStatus);
                }
            }
        });
    },
    
    /**
     * get worker's available HIT group id's list (state=Active && numAvailableHit>0 && maxHits available)
     * for worker users
     */
    getWorkerAvailableHitGroupList: function(params){
        if (typeof params == "undefined" || typeof params.data == "undefined") {
            return;
        }
        var order = params.data.order;
        var limit = params.data.limit;
        var page = params.data.page;
        var url = Config.ajaxUrlPrefix + "/workers/availableHitGroupList/" + order + "/" + limit + "/" + page;
        $.ajax({
            url: url,
            type: "GET",
            dataType: "json",
            success: function(data, textStatus){
                if (typeof params.success == "function") {
                    params.success(data, textStatus);
                }
            }
        });
    },
    
    /**
     * previewHIT
     */
    previewHIT: function(params){
        if (typeof params == "undefined" || typeof params.data == "undefined") {
            return;
        }
        var groupId = params.data.groupId
        var url = Config.ajaxUrlPrefix + "/groups/previewHIT/" + groupId;
        $.ajax({
            url: url,
            type: "GET",
            dataType: "json",
            success: function(data, textStatus){
                if (typeof params.success == "function") {
                    params.success(data, textStatus);
                }
            }
        });
    },
    
    /**
     * hasAvailHIT
     */
    hasAvailHIT: function(params){
        if (typeof params == "undefined" || typeof params.data == "undefined") {
            return;
        }
        var groupId = params.data.groupId
        var url = Config.ajaxUrlPrefix + "/workers/hasAvailHIT/" + groupId;
        $.ajax({
            url: url,
            type: "GET",
            dataType: "json",
            success: function(data, textStatus){
                if (typeof params.success == "function") {
                    params.success(data, textStatus);
                }
            }
        });
    },
    
    /**
     * acceptHIT
     */
    acceptHIT: function(params){
        if (typeof params == "undefined" || typeof params.data == "undefined") {
            return;
        }
        var groupId = params.data.groupId
        var url = Config.ajaxUrlPrefix + "/workers/acceptHIT";
        $.ajax({
            url: url,
            type: "POST",
            data: {
                hitId: params.data.hitId
            },
            dataType: "json",
            success: function(data, textStatus){
                if (typeof params.success == "function") {
                    params.success(data, textStatus);
                }
            }
        });
    },
    
    /**
     * releaseHIT
     */
    releaseHIT: function(params){
        if (typeof params == "undefined" || typeof params.data == "undefined") {
            return;
        }
        var groupId = params.data.groupId
        var url = Config.ajaxUrlPrefix + "/workers/releaseHIT";
        $.ajax({
            url: url,
            type: "POST",
            data: {
                assignmentId: params.data.assignmentId
            },
            dataType: "json",
            success: function(data, textStatus){
                if (typeof params.success == "function") {
                    params.success(data, textStatus);
                }
            }
        });
    },
    
    /**
     * getHITInfo
     */
    getHITInfo: function(params){
        if (typeof params == "undefined" || typeof params.data == "undefined") {
            return;
        }
        var hitId = params.data.hitId
        var url = Config.ajaxUrlPrefix + "/hits/info/" + hitId;
        $.ajax({
            url: url,
            type: "GET",
            dataType: "json",
            success: function(data, textStatus){
                if (typeof params.success == "function") {
                    params.success(data, textStatus);
                }
            }
        });
    },
    
    /**
     * acceptedHITs
     */
    getAcceptedHITs: function(params){
        if (typeof params == "undefined" || typeof params.data == "undefined") {
            return;
        }
        var url = Config.ajaxUrlPrefix + "/workers/acceptedHITs";
        $.ajax({
            url: url,
            type: "GET",
            dataType: "json",
            success: function(data, textStatus){
                if (typeof params.success == "function") {
                    params.success(data, textStatus);
                }
            }
        });
    },
    
    //==================================================
    // requester mode
    //==================================================
    createHIT: function(params){
        if (typeof params == "undefined" || typeof params.data == "undefined") {
            return;
        }
        var url = Config.ajaxUrlPrefix + "/requesters/createHIT";
        $.ajax({
            url: url,
            type: "POST",
            data: params.data,
            dataType: "json",
            success: function(data, textStatus){
                if (typeof params.success == "function") {
                    params.success(data, textStatus);
                }
            }
        });
    },
    
    createMultipleHIT: function(params){
        if (typeof params == "undefined" || typeof params.data == "undefined") {
            return;
        }
        var url = Config.ajaxUrlPrefix + "/requesters/createMultipleHIT";
        $.ajax({
            url: url,
            type: "POST",
            data: params.data,
            dataType: "json",
            success: function(data, textStatus){
                if (typeof params.success == "function") {
                    params.success(data, textStatus);
                }
            }
        });
    },
    
    /**
     * acceptedHITs
     */
    getWorkerList: function(params){
        if (typeof params == "undefined" || typeof params.data == "undefined") {
            params = {};
        }
        var order = params.data.order;
        var limit = params.data.limit;
        var page = params.data.page;
        var url = Config.ajaxUrlPrefix + "/requesters/workerList/" + order + "/" + limit + "/" + page;
        $.ajax({
            url: url,
            type: "GET",
            dataType: "json",
            success: function(data, textStatus){
                if (typeof params.success == "function") {
                    params.success(data, textStatus);
                }
            }
        });
    },
    
    enableRequester: function(params){
        if (typeof params == "undefined" || typeof params.data == "undefined") {
            return;
        }
        var url = Config.ajaxUrlPrefix + "/requesters/enableRequester";
        $.ajax({
            url: url,
            type: "POST",
            data: {
                userId: params.data.userId,
                isRequester: params.data.isRequester
            },
            dataType: "json",
            success: function(data, textStatus){
                if (typeof params.success == "function") {
                    params.success(data, textStatus);
                }
            }
        });
    },
    
    enableWorker: function(params){
        if (typeof params == "undefined" || typeof params.data == "undefined") {
            return;
        }
        var url = Config.ajaxUrlPrefix + "/requesters/enableWorker";
        $.ajax({
            url: url,
            type: "POST",
            data: {
                userId: params.data.userId,
                isEnabled: params.data.isEnabled
            },
            dataType: "json",
            success: function(data, textStatus){
                if (typeof params.success == "function") {
                    params.success(data, textStatus);
                }
            }
        });
    },
    
    /**
     * A requester reject a payment
     */
    rejectPayment: function(params){
        if (typeof params == "undefined") {
            return;
        }
        var url = Config.ajaxUrlPrefix + "/requesters/rejectPayment";
        $.ajax({
            url: url,
            type: "POST",
            data: {
                workerId: params.data.workerId
            },
            dataType: "json",
            success: function(data, textStatus){
                if (typeof params.success == "function") {
                    params.success(data, textStatus);
                }
            }
        });
    },
    
    /**
     *
     */
    getGroupInfo: function(params){
        if (typeof params == "undefined" || typeof params.data == "undefined") {
            return;
        }
        var groupId = params.data.groupId;
        var url = Config.ajaxUrlPrefix + "/groups/info/" + groupId;
        $.ajax({
            url: url,
            type: "GET",
            dataType: "json",
            success: function(data, textStatus){
                if (typeof params.success == "function") {
                    params.success(data, textStatus);
                }
            }
        });
    },
    
    /**
     * [Active] state's  HITGroup
     */
    getActiveHitGroupList: function(params){
        if (typeof params == "undefined" || typeof params.data == "undefined") {
            return;
        }
        var order = params.data.order;
        var limit = params.data.limit;
        var page = params.data.page;
        var url = Config.ajaxUrlPrefix + "/groups/activeHitGroupList/" + order + "/" + limit + "/" + page;
        $.ajax({
            url: url,
            type: "GET",
            dataType: "json",
            success: function(data, textStatus){
                if (typeof params.success == "function") {
                    params.success(data, textStatus);
                }
            }
        });
    },
    
    /**
     * [Active] state's  HITGroup
     */
    getInactiveHitGroupList: function(params){
        if (typeof params == "undefined" || typeof params.data == "undefined") {
            return;
        }
        var order = params.data.order;
        var limit = params.data.limit;
        var page = params.data.page;
        var url = Config.ajaxUrlPrefix + "/groups/inactiveHitGroupList/" + order + "/" + limit + "/" + page;
        $.ajax({
            url: url,
            type: "GET",
            dataType: "json",
            success: function(data, textStatus){
                if (typeof params.success == "function") {
                    params.success(data, textStatus);
                }
            }
        });
    },
    
    /**
     * setMaxHits
     * POST groupId, maxHits
     */
    setMaxHits: function(params){
        if (typeof params == "undefined" || typeof params.data == "undefined") {
            return;
        }
        var url = Config.ajaxUrlPrefix + "/requesters/setMaxHits";
        $.ajax({
            url: url,
            type: "POST",
            data: {
                groupId: params.data.groupId,
                maxHits: params.data.maxHits
            },
            dataType: "json",
            success: function(data, textStatus){
                if (typeof params.success == "function") {
                    params.success(data, textStatus);
                }
            }
        });
    },
    
    /**
     * expireHITGroup
     */
    expireHITGroup: function(params){
        if (typeof params == "undefined" || typeof params.data == "undefined") {
            return;
        }
        var url = Config.ajaxUrlPrefix + "/requesters/expireHITGroup";
        $.ajax({
            url: url,
            type: "POST",
            data: {
                groupId: params.data.groupId
            },
            dataType: "json",
            success: function(data, textStatus){
                if (typeof params.success == "function") {
                    params.success(data, textStatus);
                }
            }
        });
    },
    
    /**
     * duplicateHITGroup
     */
    duplicateHITGroup: function(params){
        if (typeof params == "undefined" || typeof params.data == "undefined") {
            return;
        }
        var url = Config.ajaxUrlPrefix + "/requesters/duplicateHITGroup";
        $.ajax({
            url: url,
            type: "POST",
            data: {
                groupId: params.data.groupId
            },
            dataType: "json",
            success: function(data, textStatus){
                if (typeof params.success == "function") {
                    params.success(data, textStatus);
                }
            }
        });
    },
    
    /**
     * getHITList
     */
    getHITList: function(params){
        if (typeof params == "undefined" || typeof params.data == "undefined") {
            return;
        }
        var groupId = "null";
        if (typeof params.data.groupId == "string" || typeof params.data.groupId == "number") {
            groupId = params.data.groupId;
        }
        var order = params.data.order;
        var limit = params.data.limit;
        var page = params.data.page;
        var url = Config.ajaxUrlPrefix + "/requesters/getHITList/" + groupId + "/" + order + "/" + limit + "/" + page;
        $.ajax({
            url: url,
            type: "GET",
            dataType: "json",
            success: function(data, textStatus){
                if (typeof params.success == "function") {
                    params.success(data, textStatus);
                }
            }
        });
    },
    
    /**
     * getHITSummary
     */
    getHITSummary: function(params){
        if (typeof params == "undefined" || typeof params.data == "undefined") {
            return;
        }
        var groupId = "null";
        if (typeof params.data.groupId == "string" || typeof params.data.groupId == "number") {
            groupId = params.data.groupId;
        }
        var workerId = "null";
        if (typeof params.data.workerId == "string" || typeof params.data.workerId == "number") {
            workerId = params.data.workerId;
        }
        var url = Config.ajaxUrlPrefix + "/requesters/getHITSummary/" + groupId + "/" + workerId;
        $.ajax({
            url: url,
            type: "GET",
            dataType: "json",
            success: function(data, textStatus){
                if (typeof params.success == "function") {
                    params.success(data, textStatus);
                }
            }
        });
    },
    
    /**
     * expireHIT
     */
    expireHIT: function(params){
        if (typeof params == "undefined" || typeof params.data == "undefined") {
            return;
        }
        var url = Config.ajaxUrlPrefix + "/requesters/expireHIT";
        $.ajax({
            url: url,
            type: "POST",
            data: {
                hitId: params.data.hitId
            },
            dataType: "json",
            success: function(data, textStatus){
                if (typeof params.success == "function") {
                    params.success(data, textStatus);
                }
            }
        });
    },
    
    /**
     * approveAssignment
     *
     * POST
     * assignmentId
     * message
     */
    approveAssignment: function(params){
        if (typeof params == "undefined" || typeof params.data == "undefined") {
            return;
        }
        var url = Config.ajaxUrlPrefix + "/requesters/approveAssignment";
        $.ajax({
            url: url,
            type: "POST",
            data: params.data,
            dataType: "json",
            success: function(data, textStatus){
                if (typeof params.success == "function") {
                    params.success(data, textStatus);
                }
            }
        });
    },
    
    /**
     * rejectAssignment
     *
     * POST
     * assignmentId
     * message
     */
    rejectAssignment: function(params){
        if (typeof params == "undefined" || typeof params.data == "undefined") {
            return;
        }
        var url = Config.ajaxUrlPrefix + "/requesters/rejectAssignment";
        $.ajax({
            url: url,
            type: "POST",
            data: params.data,
            dataType: "json",
            success: function(data, textStatus){
                if (typeof params.success == "function") {
                    params.success(data, textStatus);
                }
            }
        });
    },
    
    /**
     * getAssignmentList
     */
    getAssignmentList: function(params){
        if (typeof params == "undefined" || typeof params.data == "undefined") {
            return;
        }
        var userType = params.data.userType;
        var groupId = params.data.groupId;
        var workerId = params.data.workerId;
        var assignmentState = params.data.assignmentState;
        var order = params.data.order;
        var limit = params.data.limit;
        var page = params.data.page;
        var url = Config.ajaxUrlPrefix + "/" + userType + "/getAssignmentList/" + groupId + "/" + workerId + "/" + assignmentState + "/" + order + "/" + limit + "/" + page;
        $.ajax({
            url: url,
            type: "GET",
            dataType: "json",
            success: function(data, textStatus){
                if (typeof params.success == "function") {
                    params.success(data, textStatus);
                }
            }
        });
    }
};

$.ajaxSetup({
    cache: false,
    error: function(XMLHttpRequest, textStatus, errorThrown){
        if (XMLHttpRequest.status == 200) {
            if ($("#errorDialog").html() == null) {
                $("body").append('<div id="errorDialog" style="display:none;"/>');
            }
            var html = XMLHttpRequest.responseText;
            $("#errorDialog").html(html);
            $("#errorDialog").dialog({
                title: "Error",
                modal: true
            });
            $("#errorDialog").dialog('open');
        }
    }
});

