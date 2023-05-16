const loginUserId = $("#loginUserId").data('login-user-id')
const socket = io({ query: `userId=${loginUserId}` });

function sendRequestNotification(data) {
    if (data.reqStatus == "accepted") {
        return toastr.info(`${data.requestedUserName} started following you`);
    }
    if (data.reqStatus == "pending") {
        return toastr.info(`${data.requestedUserName} has request to follow you`);
    }
}

socket.on('requestNotification', function (data) {
    data = JSON.parse(data);
    sendRequestNotification(data)
});

socket.on('isRequestAccepted', function (data) {
    data = JSON.parse(data);
    if (data.isAccepted == 'accepted') {
        $(`#${loginUserId}`).html('accepted')
        $(`#${data.userIdToEmit}`).html('accepted')
    }
    else {
        $(`#${loginUserId}`).html('rejected')
        $(`#${data.userIdToEmit}`).html('rejected')
        // console.log($(`#${data.userIdToEmit}`).data('title', 'rejected'))
    }
});

$(document).off("click", '.followBtn').on('click', '.followBtn', function () {
    toastr.options = {
        "closeButton": true,
        "debug": false,
        "newestOnTop": false,
        "progressBar": false,
        "positionClass": "toast-top-right",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "1000",
        "hideDuration": "1000",
        "timeOut": "3000",
        "extendedTimeOut": "3000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    }
    let userId = $(this).data('user-id')
    let title = $(this).data('title')
    console.log(title)
    $this = $(this)
    $.ajax({
        url: `/users/request/${userId}/${title}`,
        type: 'post',
        success: function (data) {
            $this.data('title','rejected')
            if (data.accountType == "private") {
                $this.html("pending")
            } else {
                $this.html("accepted")
            }
        },
        error: function () {
        }
    })
})


$(document).off('click', '#requests').on('click', '#requests', function () {
    userId = $(this).data("userid")
    $this = $(this)
    $.ajax({
        type: "get",
        url: `/users/get-requests/${userId}`,
        success: function (data) {
            $('.bodyDiv').html(data)
        },
        error: function (data) {
            alert("Error from get requests")
        }
    })
})


$(document).off('click', '.acceptOrDeleteBtn').on('click', '.acceptOrDeleteBtn', function () {
    let userId = $(this).data("user-id")
    let isAccepted = $(this).data('req-isaccepted')
    $isAccepted = isAccepted
    $this = $(this)
    $.ajax({
        type: "put",
        url: `/users/isaccepted-request/${userId}/${isAccepted}`,
        success: function (data) {
            if (data.type == "success") {
                if ($isAccepted == 'accepted') {
                    $this.closest('.buttons').html(`<div
                    class="btn btn-primary badge bg-blue-lt folowBackBtn" id=${loginUserId} data-user-id=${userId}>Follow back</div>`)
                }
                if ($isAccepted == 'rejected') {
                    $this.closest('.buttons').html(`<div
                    class="btn btn-primary badge bg-blue-lt canceled" data-user-id=${userId}>Rejected</div>`)
                }
            }
        },
        error: function (data) {
            alert("Error from Delete requests")
        }
    })
})

$(document).off("click", '.folowBackBtn').on('click', '.folowBackBtn', function () {
    console.log("clicked");
    let userId = $(this).data('user-id')
    console.log("From FollowBack", userId)
    $this = $(this)
    $.ajax({
        url: `/users/request/${userId}`,
        type: 'post',
        success: function (data) {
            if (data.accountType == "private") {
                $this.html("pending")
            } else {
                $this.html("accepted")
            }
        },
        error: function () {
        }
    })
})
