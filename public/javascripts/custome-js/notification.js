
$(document).off('click', '.showPost').on('click', '.showPost', function () {
    let postId = $(this).data("notification-post-id")
    $id = $(this).data('userpost-id')
    $this = $(this)
    $.ajax({
        type: "PUT",
        url: `/posts/get-post-data/${postId}`,
        success: function (data) {
            $("#notificationPostPhoto").attr("src", `/images/posts/${data.postPath}`)
            $("#notificationTitle").html(`${data.title}`)
            $("#notificationDescription").html(`${data.description}`)
            $("#modal-showPost").modal('show')
            $this.closest("#notificationDiv").find('#notificationCount').html($('.showPost').closest("#notificationDiv").find('#notificationCount').html() - 1)
            $(document).find('.tableBody').find(`#${$id}`).css("background-color", "#ffffff")
            $this.parents('.notification').remove()
        },
        error: function (data) {
            alert("Error from notification")
        }
    })
});

$(document).off('click', '.notificaton-close').on('click', '.notificaton-close', function () {
    let postId = $(this).data("close-id")
    $this = $(this)
    $.ajax({
        type: "PUT",
        url: `/posts/get-post-data/${postId}`,
        success: function (data) {
            $this.closest("#notificationDiv").find('#notificationCount').html($('.notificaton-close').closest("#notificationDiv").find('#notificationCount').html() - 1)
            $this.parents('.notification').remove()

        },
        error: function (data) {
            alert("Error from Close Notifcation")
        }
    })
});

$(document).off('click', '.viewAllNotification').on('click', '.viewAllNotification', function () {
    $.ajax({
        type: "GET",
        url: `/posts/get-notification`,
        success: function (data) {
            $(".bodyDiv").empty()
            $(".bodyDiv").html(data)
        },
        error: function (data) {
            alert("Error from View All Notifications")
        }
    })
})

$(document).off('click', '.showPostFromAllNotification').on('click', '.showPostFromAllNotification', function () {
    postId = $(this).data("postid")
    $this = $(this)
    $id = $(this).attr('id')
    if ($("#notificationCount").html() > 0) {
        $("#notificationCount").html($("#notificationCount").html() - 1)
    }
    $.ajax({
        type: "PUT",
        url: `/posts/get-post-data/${postId}`,
        success: function (data) {
            $("#notificationPostPhoto").attr("src", `/images/posts/${data.postPath}`)
            $("#notificationTitle").html(`${data.title}`)
            $("#notificationDescription").html(`${data.description}`)
            $("#modal-showPost").modal('show')
            $this.css("background-color", "#ffffff")
            $(document).find(`.notificationPrepend`).find(`#${$id}`).remove()
        },
        error: function (data) {
            alert("Error from All Notification")
        }
    })
})
