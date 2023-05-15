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
    console.log($('.tableBody'))
    sendRequestNotification(data)
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
    $this = $(this)
    $.ajax({
        url: `/users/request/${userId}`,
        type: 'post',
        success: function (data) {
            if (data.accountType == "private") {
                $this.html("Requested")

            } else {
                $this.html("Following")
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
            console.log("data", data);
           $('.bodyDiv').html(data)
        },
        error: function (data) {
            alert("Error from get requests")
        }
    })
})