$(document).ready(function () {
    $('#addPostForm').validate({
        rules: {
            title: {
                required: true,
                maxlength: 30
            },
            description: {
                required: true,
                maxlength: 300
            },
            postImage: {
                required: true,
            }
        },
        messages: {
            title: {
                required: "Please enter Post title",
                maxlength : "Title Must Contain 30 letter"
            },
            description: {
                required: "Please enter Post description",
                maxlength : "description Must Contain 300 letter"

            },
            postImage: {
                required: "Please Post Image"
            }
        },

        submitHandler: function (form) {
            var form = $('form')[0];
            var formData = new FormData(form);
            $.ajax({
                url: '/posts/add-post',
                type: 'post',
                data: formData,
                contentType: false,
                processData: false,
                success: function (data) {
                    if (data.type == "success") {
                        location.href = "/"
                    }
                },
                error: function () {
                    alert("jpg jpeg gif png file allowed(size : 2Mb)")
                }
            })
        }
    })
});


