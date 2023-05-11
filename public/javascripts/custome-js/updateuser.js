$(document).ready(function () {
    $('#updateUserForm').validate({
        rules: {
            firstName: {
                required: true
            },
            lastName: {
                required: true
            },
            email: {
                required: true,
                email: true,
                remote: "/check-email"
            },
            gender: {
                required: true,
            }
        },
        messages: {
            firstName: {
                required: "Please enter First name"
            },
            lastName: {
                required: "Please enter Last name"
            },
            email: {
                required: "Please enter Email",
                remote: "Email Already Exists"
            },
            gender: {
                required: "Please Select Gender"
            }
        },
        submitHandler: function (form) {
            var form = $('form')[0];
            const formData = new FormData(form);
            formData.append('userProfile', $('input[type=file]')[0].files[0]);
            $.ajax({
                url: '/users/updateUser',
                type: 'post',
                data: formData,
                contentType: false,
                processData: false,
                success: function (data) {
                    console.log(data);
                    if (data.type == "success") {
                        location.href = "/"
                    }
                },
                error: function () {
                    alert('Please Enter Valid Image');
                }
            })

        }
    })
});


