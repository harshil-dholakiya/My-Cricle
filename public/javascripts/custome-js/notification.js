
$(document).off('click', '.showPost').on('click', '.showPost', function () {
    let postId = $(this).data("notification-post-id")
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
            console.log(data);
            alert("Error from Delete Notifcation")
        }
    })
});

$(document).off('click', '.viewAllNotification').on('click', '.viewAllNotification', function () {
    console.log("click");
    $.ajax({
        type: "GET",
        url: `/posts/get-notification`,
        success: function (data) {
            $(".bodyDiv").html(data)

        },
        error: function (data) {
            console.log(data);
            alert("Error from View All Notifications")
        }
    })
})

$(document).ready(function() {
	// document.title='All Notificatoins';
	// DataTable initialisation
	$('#table').DataTable(
		{
			// "dom": '<"dt-buttons"Bf><"clear">lirtp',
			"paging": true,
			"autoWidth": true,
		}
	);
});
