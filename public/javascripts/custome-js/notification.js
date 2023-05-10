// $(document).off('click', '#notification').on('click', '#notification', function () {
//     console.log($(this).find('#notificationCount'))
//     $.ajax({
//         type: "GET",
//         url: "/posts/notification",
//         success: function (data) {
//             $("#navbarNotificationDiv").html(data)
//         },
//         error: function (data) {
//             alert("Error from notification")
//         }
//     })
// });



// $(document).off('click', '.showPost').on('click', '.showPost', function () {
//     let postId = $(this).data("notification-post-id")
//     $.ajax({
//         type: "GET",
//         url: `/posts/get-post-data/${postId}`,
//         success: function (data) {
//             $("#notificationPostPhoto").attr("src", `/images/posts/${data.postPath}`)
//             $("#notificationTitle").html(`${data.title}`)
//             $("#notificationDescription").html(`${data.description}`)
//             $("#modal-showPost").modal('show')
//         },
//         error: function (data) {
//             alert("Error from notification")
//         }
//     })
// });

// $(document).off('click', '.btn-close').on('click', '.btn-close', function () {
//     let postId = $(this).data("close-id")
//     $.ajax({
//         type: "GET",
//         url: `/posts/get-post-data/${postId}`,
//         success: function (data) {
//            console.log("Notification isSeen");
//         },
//         error: function (data) {
//             alert("Error from deleteNotifcation")
//         }
//     })
// });