$(document).ready(function () {
    $(document).off("click", "#editBtn").on("click", "#editBtn", function () {
        // console.log($(this).data('id'))
        let postId = $(this).data('id')
        $.ajax({
            type: "GET",
            url: `/posts/?postId=${postId}`,
            success: function (res) {
                $("#editPostForm #editTitle").val(res.title),
                    $("#editPostForm #editDescription").val(res.description),
                    $("#editPostForm #editPostId").val(res._id)
                    $("#editPostForm .postImage").attr('src', `/images/posts/${res.postPath}`)
            },
            error: function (res) {
                alert("Error from on ajax")
            }
        })
    })

    $('#editPostForm').validate({
        rules: {
            editTitle: {
                required: true,
                maxlength: 30
            },
            editDescription: {
                required: true,
                maxlength: 300
            }
        },
        messages: {
            editTitle: {
                required: "Please enter Post title",
                maxlength: "Title Must Contain 30 letter"
            },
            editDescription: {
                required: "Please enter Post description",
                maxlength: "description Must Contain 300 letter"

            }
        },

         submitHandler: function (form) {
            var form = $("#editPostForm")
            var formData = new FormData($(form)[0]);
            $.ajax({
                type: "PUT",
                data: formData ,
                processData : false,
                contentType : false,
                url: `posts/postId`,
                success: function (res) {
                    location.href = '/'
                },
                error: function (res) {
                    alert("Error from on EDITPOST")
                }
            })
        }
    })

});


